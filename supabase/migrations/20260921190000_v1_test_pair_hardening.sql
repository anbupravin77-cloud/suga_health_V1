-- Harden V1 test-pair isolation and provide the same workflow helpers for normal accounts.

-- Assigned doctors must be able to read the patient profile needed for a clinical review.
drop policy if exists "Doctors read assigned patient profiles" on public.profiles;
create policy "Doctors read assigned patient profiles"
on public.profiles
for select
to authenticated
using (
  get_current_role() = 'doctor'::public.user_role
  and exists (
    select 1
    from public.consultations c
    where c.patient_id = profiles.id
      and c.assigned_to = auth.uid()
  )
);

-- Prevent any message thread from crossing the dedicated test-patient/test-doctor boundary.
create or replace function private.enforce_test_message_thread_pair()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_expected_doctor uuid;
  v_expected_patient uuid;
begin
  select doctor_id into v_expected_doctor
  from public.test_account_pairs
  where patient_id = new.patient_id and active = true
  limit 1;

  if v_expected_doctor is not null and new.doctor_id is distinct from v_expected_doctor then
    raise exception 'Test patient message threads must use the paired test doctor.';
  end if;

  if new.doctor_id is not null then
    select patient_id into v_expected_patient
    from public.test_account_pairs
    where doctor_id = new.doctor_id and active = true
    limit 1;

    if v_expected_patient is not null and new.patient_id <> v_expected_patient then
      raise exception 'Test doctor message threads must use the paired test patient.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists message_threads_enforce_test_pair on public.message_threads;
create trigger message_threads_enforce_test_pair
before insert or update of patient_id, doctor_id
on public.message_threads
for each row execute function private.enforce_test_message_thread_pair();

-- Prevent a prescription from ever linking one member of the test pair to an outside account.
create or replace function private.enforce_test_prescription_pair()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_expected_doctor uuid;
  v_expected_patient uuid;
begin
  select doctor_id into v_expected_doctor
  from public.test_account_pairs
  where patient_id = new.patient_id and active = true
  limit 1;

  if v_expected_doctor is not null and new.doctor_id is distinct from v_expected_doctor then
    raise exception 'Test patient prescriptions must use the paired test doctor.';
  end if;

  if new.doctor_id is not null then
    select patient_id into v_expected_patient
    from public.test_account_pairs
    where doctor_id = new.doctor_id and active = true
    limit 1;

    if v_expected_patient is not null and new.patient_id <> v_expected_patient then
      raise exception 'Test doctor prescriptions must use the paired test patient.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prescriptions_enforce_test_pair on public.prescriptions;
create trigger prescriptions_enforce_test_pair
before insert or update of patient_id, doctor_id
on public.prescriptions
for each row execute function private.enforce_test_prescription_pair();

-- Notifications tied to a test consultation/thread must stay inside the same pair.
create or replace function private.enforce_test_notification_pair()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_pair public.test_account_pairs%rowtype;
  v_consultation public.consultations%rowtype;
  v_thread public.message_threads%rowtype;
  v_related_uuid uuid;
begin
  select * into v_pair
  from public.test_account_pairs
  where active = true
    and (patient_id = new.patient_id or doctor_id = new.patient_id)
  limit 1;

  if new.related_entity_type = 'consultation'
     and coalesce(new.related_entity_id, '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    v_related_uuid := new.related_entity_id::uuid;
    select * into v_consultation from public.consultations where id = v_related_uuid;

    if found then
      if v_pair.patient_id is not null then
        if v_consultation.patient_id <> v_pair.patient_id
           or v_consultation.assigned_to is distinct from v_pair.doctor_id
        then
          raise exception 'Test account notification references a consultation outside the test pair.';
        end if;
      elsif exists (
        select 1 from public.test_account_pairs t
        where t.active = true
          and (t.patient_id = v_consultation.patient_id or t.doctor_id = v_consultation.assigned_to)
      ) then
        raise exception 'Real accounts cannot receive test-pair consultation notifications.';
      end if;
    end if;
  elsif new.related_entity_type = 'thread' and new.related_entity_id is not null then
    select * into v_thread from public.message_threads where id = new.related_entity_id;

    if found then
      if v_pair.patient_id is not null then
        if v_thread.patient_id <> v_pair.patient_id
           or v_thread.doctor_id is distinct from v_pair.doctor_id
        then
          raise exception 'Test account notification references a thread outside the test pair.';
        end if;
      elsif exists (
        select 1 from public.test_account_pairs t
        where t.active = true
          and t.patient_id = v_thread.patient_id
          and t.doctor_id = v_thread.doctor_id
      ) then
        raise exception 'Real accounts cannot receive test-pair thread notifications.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists notifications_enforce_test_pair on public.notifications;
create trigger notifications_enforce_test_pair
before insert or update of patient_id, related_entity_id, related_entity_type
on public.notifications
for each row execute function private.enforce_test_notification_pair();

-- Shared V1 helpers let normal accounts use the same frontend while the dedicated
-- test pair continues to use its stricter v1_test_* wrappers.

create or replace function public.v1_delete_draft(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  delete from public.consultations
  where id = p_consultation_id
    and patient_id = auth.uid()
    and status = 'draft';

  if not found then raise exception 'Draft consultation not found.'; end if;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.v1_save_clinical_work(
  p_consultation_id uuid,
  p_note text,
  p_clinician_message text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_result jsonb;
begin
  if get_current_role() <> 'doctor'::public.user_role then
    raise exception 'Doctor access required.';
  end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and c.assigned_to = auth.uid()
      and c.status = 'under_review'
  ) then
    raise exception 'Consultation must be assigned to the current doctor and under review.';
  end if;

  insert into public.clinical_notes (
    id, consultation_id, doctor_id, content, assessment, plan, created_at, updated_at
  )
  values (
    gen_random_uuid(), p_consultation_id, auth.uid(),
    coalesce(p_note, ''),
    coalesce(nullif(trim(p_note), ''), 'Clinical assessment'),
    coalesce(nullif(trim(p_clinician_message), ''), 'Treatment plan'),
    now(), now()
  )
  on conflict (consultation_id, doctor_id) do update
  set content = excluded.content,
      assessment = excluded.assessment,
      plan = excluded.plan,
      updated_at = now();

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'name', coalesce(nullif(trim(item->>'medication_name'), ''), 'Medication'),
      'activeIngredient', coalesce(nullif(trim(item->>'medication_name'), ''), 'Medication'),
      'strength', coalesce(nullif(trim(item->>'dosage'), ''), 'As prescribed'),
      'dosageForm', 'Prescription',
      'quantity', 30,
      'priceInr', 0,
      'description', concat_ws(' · ',
        nullif(trim(item->>'frequency'), ''),
        nullif(trim(item->>'duration'), ''),
        nullif(trim(item->>'instructions'), '')
      ),
      'isRecommended', ord = 1
    )
  ), '[]'::jsonb)
  into v_items
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as x(item, ord);

  select public.fn_save_prescription_with_options(
    p_consultation_id,
    auth.uid(),
    coalesce(nullif(trim(p_clinician_message), ''), 'Follow the clinician guidance provided.'),
    0,
    30,
    p_clinician_message,
    v_items
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.v1_complete_consultation(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_summary text;
  v_result jsonb;
begin
  if get_current_role() <> 'doctor'::public.user_role then
    raise exception 'Doctor access required.';
  end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and c.assigned_to = auth.uid()
      and c.status = 'under_review'
  ) then
    raise exception 'Consultation must be assigned to the current doctor and under review.';
  end if;

  select coalesce(nullif(trim(assessment), ''), nullif(trim(content), ''))
  into v_summary
  from public.clinical_notes
  where consultation_id = p_consultation_id and doctor_id = auth.uid()
  order by updated_at desc
  limit 1;

  select public.fn_approve_consultation(
    p_consultation_id,
    auth.uid(),
    true,
    v_summary
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.v1_send_message(p_thread_id text, p_message_text text)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_role text;
  v_result jsonb;
begin
  select role::text into v_role from public.profiles where id = auth.uid();
  if v_role not in ('patient', 'doctor') then
    raise exception 'Patient or doctor access required.';
  end if;

  select public.fn_send_message(
    p_thread_id,
    auth.uid(),
    v_role,
    p_message_text
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.v1_get_consultation_doctor(p_consultation_id uuid)
returns table (full_name text, professional_title text, specialization text)
language plpgsql
security definer
stable
set search_path = 'public', 'pg_temp'
as $$
begin
  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and (c.patient_id = auth.uid() or c.assigned_to = auth.uid())
  ) then
    raise exception 'Consultation access required.';
  end if;

  return query
  select
    coalesce(nullif(trim(p.display_name), ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), 'Doctor')::text,
    'Licensed clinician'::text,
    array_to_string(coalesce(s.specialties, array[]::text[]), ', ')::text
  from public.consultations c
  join public.profiles p on p.id = c.assigned_to
  left join public.staff_profiles s on s.id = c.assigned_to
  where c.id = p_consultation_id
    and c.assigned_to is not null;
end;
$$;

revoke all on function public.v1_delete_draft(uuid) from public, anon;
revoke all on function public.v1_save_clinical_work(uuid, text, text, jsonb) from public, anon;
revoke all on function public.v1_complete_consultation(uuid) from public, anon;
revoke all on function public.v1_send_message(text, text) from public, anon;
revoke all on function public.v1_get_consultation_doctor(uuid) from public, anon;

grant execute on function public.v1_delete_draft(uuid) to authenticated;
grant execute on function public.v1_save_clinical_work(uuid, text, text, jsonb) to authenticated;
grant execute on function public.v1_complete_consultation(uuid) to authenticated;
grant execute on function public.v1_send_message(text, text) to authenticated;
grant execute on function public.v1_get_consultation_doctor(uuid) to authenticated;
