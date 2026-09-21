
create index if not exists messages_sender_uid_idx
  on public.messages (sender_uid);

drop policy if exists "consultations_admin_update" on public.consultations;
drop policy if exists "consultations_patient_update" on public.consultations;
drop policy if exists "consultations_update" on public.consultations;

create policy "consultations_update"
on public.consultations
for update
to authenticated
using (
  (select public.get_current_role()) = 'admin'::public.user_role
  or (
    (select auth.uid()) = patient_id
    and status = 'draft'::public.consultation_status
  )
)
with check (
  (select public.get_current_role()) = 'admin'::public.user_role
  or (
    (select auth.uid()) = patient_id
    and status = 'draft'::public.consultation_status
    and assigned_to is null
    and submitted_at is null
    and completed_at is null
  )
);

drop policy if exists "message_threads_no_client_write" on public.message_threads;
drop policy if exists "messages_no_client_write" on public.messages;

create or replace function private.v1_delete_draft_worker(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;

  select p.role::text into v_role
  from public.profiles p
  where p.id = v_uid;

  if v_role <> 'patient' then raise exception 'Patient access required.'; end if;

  delete from public.consultations c
  where c.id = p_consultation_id
    and c.patient_id = v_uid
    and c.status = 'draft';

  if not found then raise exception 'Draft consultation not found.'; end if;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.v1_delete_draft(p_consultation_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_delete_draft_worker(p_consultation_id);
$$;

create or replace function private.v1_send_message_worker(
  p_thread_id text,
  p_message_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;

  select p.role::text into v_role
  from public.profiles p
  where p.id = v_uid;

  if v_role not in ('patient', 'doctor') then
    raise exception 'Patient or doctor access required.';
  end if;

  select public.fn_send_message(
    p_thread_id,
    v_uid,
    v_role,
    p_message_text
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.v1_send_message(
  p_thread_id text,
  p_message_text text
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_send_message_worker(p_thread_id, p_message_text);
$$;

create or replace function private.v1_get_consultation_doctor_worker(
  p_consultation_id uuid
)
returns table (
  full_name text,
  professional_title text,
  specialization text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;

  if not exists (
    select 1
    from public.consultations c
    where c.id = p_consultation_id
      and (c.patient_id = v_uid or c.assigned_to = v_uid)
  ) then
    raise exception 'Consultation access required.';
  end if;

  return query
  select
    coalesce(
      nullif(trim(p.display_name), ''),
      nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
      'Doctor'
    )::text,
    'Licensed clinician'::text,
    array_to_string(coalesce(s.specialties, array[]::text[]), ', ')::text
  from public.consultations c
  join public.profiles p on p.id = c.assigned_to
  left join public.staff_profiles s on s.id = c.assigned_to
  where c.id = p_consultation_id
    and c.assigned_to is not null;
end;
$$;

create or replace function public.v1_get_consultation_doctor(
  p_consultation_id uuid
)
returns table (
  full_name text,
  professional_title text,
  specialization text
)
language sql
security invoker
stable
set search_path = ''
as $$
  select * from private.v1_get_consultation_doctor_worker(p_consultation_id);
$$;

revoke all on function private.v1_delete_draft_worker(uuid) from public;
revoke all on function private.v1_send_message_worker(text, text) from public;
revoke all on function private.v1_get_consultation_doctor_worker(uuid) from public;

grant usage on schema private to authenticated;
grant execute on function private.v1_delete_draft_worker(uuid) to authenticated;
grant execute on function private.v1_send_message_worker(text, text) to authenticated;
grant execute on function private.v1_get_consultation_doctor_worker(uuid) to authenticated;

revoke all on function public.v1_delete_draft(uuid) from public, anon;
revoke all on function public.v1_send_message(text, text) from public, anon;
revoke all on function public.v1_get_consultation_doctor(uuid) from public, anon;

grant execute on function public.v1_delete_draft(uuid) to authenticated;
grant execute on function public.v1_send_message(text, text) to authenticated;
grant execute on function public.v1_get_consultation_doctor(uuid) to authenticated;

revoke execute on function public.v1_complete_consultation(uuid) from authenticated;
revoke execute on function public.v1_save_clinical_work(uuid, text, text, jsonb) from authenticated;

revoke execute on function public.v1_test_claim_consultation(uuid) from authenticated;
revoke execute on function public.v1_test_complete_consultation(uuid) from authenticated;
revoke execute on function public.v1_test_delete_draft(uuid) from authenticated;
revoke execute on function public.v1_test_doctor_queue() from authenticated;
revoke execute on function public.v1_test_get_consultation_doctor(uuid) from authenticated;
revoke execute on function public.v1_test_save_clinical_work(uuid, text, text, jsonb) from authenticated;
revoke execute on function public.v1_test_send_message(text, text) from authenticated;
revoke execute on function public.v1_test_submit_consultation(uuid) from authenticated;
