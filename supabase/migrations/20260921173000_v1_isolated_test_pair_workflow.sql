-- V1 testing workflow: isolate the dedicated patient and doctor accounts as a closed pair.
create table if not exists public.test_account_pairs (
  patient_id uuid primary key references public.profiles(id) on delete cascade,
  doctor_id uuid not null unique references public.staff_profiles(id) on delete cascade,
  patient_email text not null unique,
  doctor_email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.test_account_pairs enable row level security;
revoke all on table public.test_account_pairs from public, anon, authenticated;

insert into public.test_account_pairs (patient_id, doctor_id, patient_email, doctor_email, active)
select p.id, s.id, p.email, s.email, true
from public.profiles p
join public.staff_profiles s on lower(s.email) = 'doctor123@gmail.com'
where lower(p.email) = 'patient123@gmail.com'
on conflict (patient_id) do update
set doctor_id = excluded.doctor_id,
    patient_email = excluded.patient_email,
    doctor_email = excluded.doctor_email,
    active = true;

update public.staff_profiles
set active = true,
    onboarding_status = 'completed',
    accepting_new_patients = true,
    specialties = array['weight','hair','sex','general']::text[],
    max_active_cases = greatest(coalesce(max_active_cases, 50), 50),
    updated_at = now()
where lower(email) = 'doctor123@gmail.com';

create or replace function public.v1_test_submit_consultation(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_pair public.test_account_pairs%rowtype;
  v_consultation public.consultations%rowtype;
  v_now timestamptz := clock_timestamp();
  v_thread_id text;
begin
  select * into v_pair from public.test_account_pairs where patient_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test patient.'; end if;

  select * into v_consultation
  from public.consultations
  where id = p_consultation_id and patient_id = auth.uid()
  for update;

  if not found then raise exception 'Consultation not found.'; end if;
  if v_consultation.status <> 'draft' then raise exception 'Only a draft consultation can be submitted.'; end if;

  update public.consultations
  set assigned_to = v_pair.doctor_id,
      status = 'assigned',
      submitted_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_consultation_id;

  v_thread_id := 'thread_' || p_consultation_id::text;
  insert into public.message_threads (
    id, consultation_id, patient_id, doctor_id, status,
    patient_unread_count, doctor_unread_count,
    last_message_preview, last_message_at, created_at, updated_at
  )
  values (
    v_thread_id, p_consultation_id, v_pair.patient_id, v_pair.doctor_id, 'open',
    0, 0, null, clock_timestamp(), clock_timestamp(), clock_timestamp()
  )
  on conflict (consultation_id) do update
  set doctor_id = excluded.doctor_id,
      status = 'open',
      updated_at = excluded.updated_at;

  insert into public.notifications (
    id, patient_id, type, title, short_message,
    related_entity_id, related_entity_type, status, idempotency_key, created_at
  )
  values (
    'notif_test_submit_' || replace(p_consultation_id::text, '-', ''),
    v_pair.doctor_id,
    'CONSULTATION_SUBMITTED',
    'New test consultation',
    'The paired test patient submitted a consultation for review.',
    p_consultation_id::text,
    'consultation',
    'unread',
    'test_submit_' || p_consultation_id::text,
    clock_timestamp()
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object('success', true, 'consultationId', p_consultation_id, 'assignedDoctorId', v_pair.doctor_id, 'status', 'assigned', 'testPair', true);
end;
$$;

create or replace function public.v1_test_doctor_queue()
returns table (
  id uuid,
  patient_name text,
  primary_concern text,
  submitted_at timestamptz,
  status public.consultation_status
)
language plpgsql
security definer
stable
set search_path = 'public', 'pg_temp'
as $$
declare v_pair public.test_account_pairs%rowtype;
begin
  select * into v_pair from public.test_account_pairs where doctor_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test doctor.'; end if;

  return query
  select
    c.id,
    coalesce(nullif(trim(p.display_name), ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), 'Test Patient')::text,
    c.primary_concern,
    c.submitted_at,
    c.status
  from public.consultations c
  join public.profiles p on p.id = c.patient_id
  where c.patient_id = v_pair.patient_id
    and c.assigned_to = v_pair.doctor_id
    and c.status = 'assigned'
  order by c.submitted_at asc nulls last, c.created_at asc;
end;
$$;

create or replace function public.v1_test_claim_consultation(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_pair public.test_account_pairs%rowtype;
  v_patient uuid;
begin
  select * into v_pair from public.test_account_pairs where doctor_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test doctor.'; end if;

  update public.consultations
  set status = 'under_review',
      assigned_to = v_pair.doctor_id,
      updated_at = clock_timestamp()
  where id = p_consultation_id
    and patient_id = v_pair.patient_id
    and assigned_to = v_pair.doctor_id
    and status = 'assigned'
  returning patient_id into v_patient;

  if v_patient is null then raise exception 'Test consultation is not available to this doctor.'; end if;

  update public.message_threads
  set doctor_id = v_pair.doctor_id, status = 'open', updated_at = clock_timestamp()
  where consultation_id = p_consultation_id and patient_id = v_pair.patient_id;

  insert into public.notifications (
    id, patient_id, type, title, short_message,
    related_entity_id, related_entity_type, status, idempotency_key, created_at
  )
  values (
    'notif_test_claim_' || replace(p_consultation_id::text, '-', ''),
    v_pair.patient_id,
    'CONSULTATION_CLAIMED',
    'Your doctor has started the review',
    'Your paired test doctor is now reviewing this consultation.',
    p_consultation_id::text,
    'consultation',
    'unread',
    'test_claim_' || p_consultation_id::text,
    clock_timestamp()
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object('success', true, 'status', 'under_review', 'testPair', true);
end;
$$;

create or replace function public.v1_test_save_clinical_work(
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
  v_pair public.test_account_pairs%rowtype;
  v_items jsonb := '[]'::jsonb;
  v_result jsonb;
begin
  select * into v_pair from public.test_account_pairs where doctor_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test doctor.'; end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and c.patient_id = v_pair.patient_id
      and c.assigned_to = v_pair.doctor_id
      and c.status = 'under_review'
  ) then raise exception 'Test consultation must be under review.'; end if;

  insert into public.clinical_notes (
    id, consultation_id, doctor_id, content, assessment, plan, created_at, updated_at
  )
  values (
    gen_random_uuid(), p_consultation_id, v_pair.doctor_id,
    coalesce(p_note, ''),
    coalesce(nullif(trim(p_note), ''), 'Test clinical assessment'),
    coalesce(nullif(trim(p_clinician_message), ''), 'Test treatment plan'),
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
    v_pair.doctor_id,
    coalesce(nullif(trim(p_clinician_message), ''), 'Follow the clinician guidance provided.'),
    0,
    30,
    p_clinician_message,
    v_items
  ) into v_result;

  return v_result || jsonb_build_object('testPair', true);
end;
$$;

create or replace function public.v1_test_complete_consultation(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_pair public.test_account_pairs%rowtype;
  v_summary text;
  v_result jsonb;
begin
  select * into v_pair from public.test_account_pairs where doctor_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test doctor.'; end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and c.patient_id = v_pair.patient_id
      and c.assigned_to = v_pair.doctor_id
  ) then raise exception 'This consultation is outside the test pair.'; end if;

  select coalesce(nullif(trim(assessment), ''), nullif(trim(content), ''), 'Test clinical assessment')
  into v_summary
  from public.clinical_notes
  where consultation_id = p_consultation_id and doctor_id = v_pair.doctor_id
  order by updated_at desc
  limit 1;

  select public.fn_approve_consultation(p_consultation_id, v_pair.doctor_id, true, v_summary) into v_result;
  return v_result || jsonb_build_object('testPair', true);
end;
$$;

create or replace function public.v1_test_send_message(p_thread_id text, p_message_text text)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_pair public.test_account_pairs%rowtype;
  v_role text;
  v_result jsonb;
begin
  select * into v_pair
  from public.test_account_pairs
  where active = true and (patient_id = auth.uid() or doctor_id = auth.uid());
  if not found then raise exception 'This RPC is restricted to the configured test accounts.'; end if;

  if not exists (
    select 1 from public.message_threads t
    where t.id = p_thread_id
      and t.patient_id = v_pair.patient_id
      and t.doctor_id = v_pair.doctor_id
  ) then raise exception 'This message thread is outside the test pair.'; end if;

  v_role := case when auth.uid() = v_pair.doctor_id then 'doctor' else 'patient' end;
  select public.fn_send_message(p_thread_id, auth.uid(), v_role, p_message_text) into v_result;
  return v_result || jsonb_build_object('testPair', true);
end;
$$;

create or replace function public.v1_test_get_consultation_doctor(p_consultation_id uuid)
returns table (full_name text, professional_title text, specialization text)
language plpgsql
security definer
stable
set search_path = 'public', 'pg_temp'
as $$
declare v_pair public.test_account_pairs%rowtype;
begin
  select * into v_pair
  from public.test_account_pairs
  where active = true and (patient_id = auth.uid() or doctor_id = auth.uid());
  if not found then raise exception 'This RPC is restricted to the configured test accounts.'; end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id
      and c.patient_id = v_pair.patient_id
      and c.assigned_to = v_pair.doctor_id
  ) then raise exception 'This consultation is outside the test pair.'; end if;

  return query
  select
    coalesce(nullif(trim(p.display_name), ''), 'Dr. Alex Smith MD')::text,
    'Test clinician'::text,
    array_to_string(coalesce(s.specialties, array[]::text[]), ', ')::text
  from public.profiles p
  join public.staff_profiles s on s.id = p.id
  where p.id = v_pair.doctor_id;
end;
$$;

revoke all on function public.v1_test_submit_consultation(uuid) from public, anon;
revoke all on function public.v1_test_doctor_queue() from public, anon;
revoke all on function public.v1_test_claim_consultation(uuid) from public, anon;
revoke all on function public.v1_test_save_clinical_work(uuid, text, text, jsonb) from public, anon;
revoke all on function public.v1_test_complete_consultation(uuid) from public, anon;
revoke all on function public.v1_test_send_message(text, text) from public, anon;
revoke all on function public.v1_test_get_consultation_doctor(uuid) from public, anon;

grant execute on function public.v1_test_submit_consultation(uuid) to authenticated;
grant execute on function public.v1_test_doctor_queue() to authenticated;
grant execute on function public.v1_test_claim_consultation(uuid) to authenticated;
grant execute on function public.v1_test_save_clinical_work(uuid, text, text, jsonb) to authenticated;
grant execute on function public.v1_test_complete_consultation(uuid) to authenticated;
grant execute on function public.v1_test_send_message(text, text) to authenticated;
grant execute on function public.v1_test_get_consultation_doctor(uuid) to authenticated;
