
create table if not exists public.medication_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  treatment_area text not null check (treatment_area in ('weight','hair','sex','general')),
  display_name text not null,
  generic_name text not null,
  strength text not null,
  dosage_form text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_prescription_options (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  doctor_id uuid not null references public.staff_profiles(id) on delete restrict,
  position integer not null check (position > 0),
  title text not null,
  cost_tier text not null default 'custom' check (cost_tier in ('budget','balanced','premium','custom')),
  description text not null default '',
  estimated_price_inr numeric(10,2),
  status text not null default 'draft' check (status in ('draft','finalized')),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consultation_id, position)
);

create table if not exists public.consultation_prescription_option_items (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.consultation_prescription_options(id) on delete cascade,
  medication_catalog_id uuid references public.medication_catalog(id) on delete set null,
  position integer not null check (position > 0),
  medication_name text not null,
  strength text not null,
  dosage_form text not null,
  frequency text not null,
  duration text not null,
  instructions text,
  created_at timestamptz not null default now(),
  unique (option_id, position)
);

alter table public.consultations
  add column if not exists selected_prescription_option_id uuid,
  add column if not exists selected_prescription_option_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'consultations_selected_prescription_option_id_fkey'
  ) then
    alter table public.consultations
      add constraint consultations_selected_prescription_option_id_fkey
      foreign key (selected_prescription_option_id)
      references public.consultation_prescription_options(id)
      on delete set null;
  end if;
end $$;

create index if not exists medication_catalog_active_area_idx
  on public.medication_catalog (active, treatment_area, sort_order);
create index if not exists consultation_prescription_options_consultation_idx
  on public.consultation_prescription_options (consultation_id, position);
create index if not exists consultation_prescription_options_doctor_idx
  on public.consultation_prescription_options (doctor_id, status);
create index if not exists consultation_prescription_options_patient_idx
  on public.consultation_prescription_options (patient_id, status);
create index if not exists consultation_prescription_option_items_option_idx
  on public.consultation_prescription_option_items (option_id, position);

alter table public.medication_catalog enable row level security;
alter table public.consultation_prescription_options enable row level security;
alter table public.consultation_prescription_option_items enable row level security;

revoke all on table public.medication_catalog from anon;
revoke all on table public.consultation_prescription_options from anon;
revoke all on table public.consultation_prescription_option_items from anon;

revoke insert, update, delete on table public.medication_catalog from authenticated;
revoke insert, update, delete on table public.consultation_prescription_options from authenticated;
revoke insert, update, delete on table public.consultation_prescription_option_items from authenticated;

grant select on table public.medication_catalog to authenticated;
grant select on table public.consultation_prescription_options to authenticated;
grant select on table public.consultation_prescription_option_items to authenticated;

drop policy if exists "clinicians read medication catalog" on public.medication_catalog;
create policy "clinicians read medication catalog"
on public.medication_catalog
for select
to authenticated
using (
  active = true
  and public.get_current_role() in ('doctor'::public.user_role, 'admin'::public.user_role)
);

drop policy if exists "participants read prescription options" on public.consultation_prescription_options;
create policy "participants read prescription options"
on public.consultation_prescription_options
for select
to authenticated
using (
  patient_id = (select auth.uid())
  or doctor_id = (select auth.uid())
  or public.get_current_role() = 'admin'::public.user_role
);

drop policy if exists "participants read prescription option items" on public.consultation_prescription_option_items;
create policy "participants read prescription option items"
on public.consultation_prescription_option_items
for select
to authenticated
using (
  exists (
    select 1
    from public.consultation_prescription_options o
    where o.id = option_id
      and (
        o.patient_id = (select auth.uid())
        or o.doctor_id = (select auth.uid())
        or public.get_current_role() = 'admin'::public.user_role
      )
  )
);

insert into public.medication_catalog
  (code, treatment_area, display_name, generic_name, strength, dosage_form, description, sort_order)
values
  ('weight-semaglutide-025', 'weight', 'Semaglutide + B12', 'Semaglutide + Cyanocobalamin', '0.25 mg', 'Weekly injection', 'Existing Suga.Health weight-management formulary entry.', 10),
  ('weight-semaglutide-050', 'weight', 'Semaglutide + B12', 'Semaglutide + Cyanocobalamin', '0.5 mg', 'Weekly injection', 'Existing Suga.Health weight-management formulary entry.', 20),
  ('weight-tirzepatide-25', 'weight', 'Tirzepatide + B6', 'Tirzepatide + Pyridoxine', '2.5 mg', 'Weekly injection', 'Existing Suga.Health weight-management formulary entry.', 30),
  ('hair-fin-min-topical', 'hair', 'Finasteride + Minoxidil topical', 'Finasteride + Minoxidil', '0.3% / 6%', 'Topical solution', 'Existing Suga.Health hair-care formulary entry.', 10),
  ('hair-minoxidil-25', 'hair', 'Oral Minoxidil', 'Minoxidil', '2.5 mg', 'Oral capsule', 'Existing Suga.Health hair-care formulary entry.', 20),
  ('sex-tadalafil-5', 'sex', 'Tadalafil ODT', 'Tadalafil', '5 mg', 'Oral disintegrating tablet', 'Existing Suga.Health sexual-health formulary entry.', 10),
  ('sex-tadalafil-20', 'sex', 'Tadalafil ODT', 'Tadalafil', '20 mg', 'Oral disintegrating tablet', 'Existing Suga.Health sexual-health formulary entry.', 20),
  ('sex-sildenafil-50', 'sex', 'Sildenafil troche', 'Sildenafil citrate', '50 mg', 'Sublingual troche', 'Existing Suga.Health sexual-health formulary entry.', 30),
  ('sex-sildenafil-100', 'sex', 'Sildenafil troche', 'Sildenafil citrate', '100 mg', 'Sublingual troche', 'Existing Suga.Health sexual-health formulary entry.', 40)
on conflict (code) do update
set treatment_area = excluded.treatment_area,
    display_name = excluded.display_name,
    generic_name = excluded.generic_name,
    strength = excluded.strength,
    dosage_form = excluded.dosage_form,
    description = excluded.description,
    active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

create or replace function private.enforce_consultation_option_pair()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_test_doctor uuid;
  v_test_patient uuid;
begin
  select t.doctor_id into v_test_doctor
  from public.test_account_pairs t
  where t.patient_id = new.patient_id and t.active = true
  limit 1;

  if v_test_doctor is not null and new.doctor_id <> v_test_doctor then
    raise exception 'Test patient treatment options must use the paired test doctor.';
  end if;

  select t.patient_id into v_test_patient
  from public.test_account_pairs t
  where t.doctor_id = new.doctor_id and t.active = true
  limit 1;

  if v_test_patient is not null and new.patient_id <> v_test_patient then
    raise exception 'Test doctor treatment options must use the paired test patient.';
  end if;

  return new;
end;
$$;

drop trigger if exists consultation_options_enforce_test_pair
on public.consultation_prescription_options;
create trigger consultation_options_enforce_test_pair
before insert or update of patient_id, doctor_id
on public.consultation_prescription_options
for each row execute function private.enforce_consultation_option_pair();

create or replace function private.v1_submit_consultation_worker(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_consultation public.consultations%rowtype;
  v_pair public.test_account_pairs%rowtype;
  v_result jsonb;
  v_doctor uuid;
  v_status text;
  v_now timestamptz := clock_timestamp();
  v_thread_id text;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;

  select p.role::text into v_role from public.profiles p where p.id = v_uid;
  if v_role <> 'patient' then raise exception 'Patient access required.'; end if;

  select * into v_consultation
  from public.consultations c
  where c.id = p_consultation_id and c.patient_id = v_uid
  for update;

  if not found then raise exception 'Consultation not found.'; end if;

  if v_consultation.status in ('assigned','submitted','under_review','completed') then
    return jsonb_build_object(
      'success', true,
      'consultationId', v_consultation.id,
      'assignedDoctorId', v_consultation.assigned_to,
      'status', v_consultation.status,
      'alreadySubmitted', true
    );
  end if;

  if v_consultation.status <> 'draft' then
    raise exception 'Only a draft consultation can be submitted.';
  end if;

  select * into v_pair
  from public.test_account_pairs t
  where t.patient_id = v_uid and t.active = true
  limit 1;

  if found then
    v_doctor := v_pair.doctor_id;
    v_status := 'assigned';

    update public.consultations
    set assigned_to = v_doctor,
        status = 'assigned',
        submitted_at = v_now,
        updated_at = v_now
    where id = p_consultation_id;

    insert into public.notifications (
      id, patient_id, type, title, short_message,
      related_entity_id, related_entity_type, status, idempotency_key, created_at
    )
    values (
      'notif_test_submit_' || replace(p_consultation_id::text, '-', ''),
      v_doctor,
      'CONSULTATION_SUBMITTED',
      'New consultation to review',
      'The paired test patient submitted a consultation for review.',
      p_consultation_id::text,
      'consultation',
      'unread',
      'test_submit_' || p_consultation_id::text,
      v_now
    )
    on conflict (idempotency_key) do nothing;
  else
    select public.fn_submit_consultation(p_consultation_id, v_uid, null)
      into v_result;

    select c.assigned_to, c.status::text
      into v_doctor, v_status
    from public.consultations c
    where c.id = p_consultation_id;
  end if;

  if v_doctor is not null then
    v_thread_id := 'thread_' || p_consultation_id::text;
    insert into public.message_threads (
      id, consultation_id, patient_id, doctor_id, status,
      patient_unread_count, doctor_unread_count,
      last_message_preview, last_message_at, created_at, updated_at
    )
    values (
      v_thread_id, p_consultation_id, v_uid, v_doctor, 'open',
      0, 0, null, v_now, v_now, v_now
    )
    on conflict (consultation_id) do update
    set doctor_id = excluded.doctor_id,
        status = 'open',
        updated_at = excluded.updated_at;
  end if;

  insert into public.notifications (
    id, patient_id, type, title, short_message,
    related_entity_id, related_entity_type, status, idempotency_key, created_at
  )
  values (
    'notif_patient_submit_' || replace(p_consultation_id::text, '-', ''),
    v_uid,
    'CONSULTATION_SUBMITTED',
    'Consultation submitted',
    case when v_doctor is null
      then 'Your consultation was submitted securely and is waiting for doctor review.'
      else 'Your consultation was submitted securely and assigned for doctor review.'
    end,
    p_consultation_id::text,
    'consultation',
    'unread',
    'patient_submit_' || p_consultation_id::text,
    v_now
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object(
    'success', true,
    'consultationId', p_consultation_id,
    'assignedDoctorId', v_doctor,
    'status', coalesce(v_status, 'submitted')
  );
end;
$$;

create or replace function public.v1_submit_consultation(p_consultation_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_submit_consultation_worker(p_consultation_id);
$$;

create or replace function private.v1_claim_consultation_worker(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_pair public.test_account_pairs%rowtype;
  v_consultation public.consultations%rowtype;
  v_result jsonb;
  v_now timestamptz := clock_timestamp();
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  select p.role::text into v_role from public.profiles p where p.id = v_uid;
  if v_role <> 'doctor' then raise exception 'Doctor access required.'; end if;

  select * into v_pair
  from public.test_account_pairs t
  where t.doctor_id = v_uid and t.active = true
  limit 1;

  if found then
    update public.consultations c
    set status = 'under_review',
        assigned_to = v_uid,
        updated_at = v_now
    where c.id = p_consultation_id
      and c.patient_id = v_pair.patient_id
      and c.assigned_to = v_uid
      and c.status = 'assigned'
    returning c.* into v_consultation;

    if not found then raise exception 'Test consultation is not available to this doctor.'; end if;

    v_result := jsonb_build_object('success', true, 'status', 'under_review', 'testPair', true);
  else
    select public.fn_claim_consultation(p_consultation_id, v_uid) into v_result;
    select * into v_consultation from public.consultations c where c.id = p_consultation_id;
  end if;

  if v_consultation.patient_id is null then
    select * into v_consultation from public.consultations c where c.id = p_consultation_id;
  end if;

  insert into public.message_threads (
    id, consultation_id, patient_id, doctor_id, status,
    patient_unread_count, doctor_unread_count,
    last_message_preview, last_message_at, created_at, updated_at
  )
  values (
    'thread_' || p_consultation_id::text,
    p_consultation_id,
    v_consultation.patient_id,
    v_uid,
    'open',
    0, 0, null, v_now, v_now, v_now
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
    'notif_review_started_' || replace(p_consultation_id::text, '-', ''),
    v_consultation.patient_id,
    'CONSULTATION_UNDER_REVIEW',
    'Your consultation is under review',
    'Your doctor has started reviewing your consultation.',
    p_consultation_id::text,
    'consultation',
    'unread',
    'review_started_' || p_consultation_id::text,
    v_now
  )
  on conflict (idempotency_key) do nothing;

  return coalesce(v_result, '{}'::jsonb) || jsonb_build_object('patientId', v_consultation.patient_id);
end;
$$;

create or replace function public.v1_claim_consultation(p_consultation_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_claim_consultation_worker(p_consultation_id);
$$;

create or replace function private.v1_save_treatment_options_worker(
  p_consultation_id uuid,
  p_clinical_note text,
  p_options jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_consultation public.consultations%rowtype;
  v_option jsonb;
  v_item jsonb;
  v_option_id uuid;
  v_catalog public.medication_catalog%rowtype;
  v_option_count integer := 0;
  v_item_count integer := 0;
  v_note text := nullif(trim(coalesce(p_clinical_note, '')), '');
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  select p.role::text into v_role from public.profiles p where p.id = v_uid;
  if v_role <> 'doctor' then raise exception 'Doctor access required.'; end if;

  select * into v_consultation
  from public.consultations c
  where c.id = p_consultation_id
    and c.assigned_to = v_uid
    and c.status = 'under_review'
  for update;

  if not found then
    raise exception 'Consultation must be assigned to you and under review.';
  end if;

  if v_note is null then raise exception 'A clinical note is required.'; end if;
  if p_options is null or jsonb_typeof(p_options) <> 'array' or jsonb_array_length(p_options) = 0 then
    raise exception 'At least one prescription option is required.';
  end if;

  insert into public.clinical_notes (
    id, consultation_id, doctor_id, content, assessment, plan, created_at, updated_at
  )
  values (
    gen_random_uuid(), p_consultation_id, v_uid, v_note, v_note,
    'Multiple treatment options prepared for patient selection.', now(), now()
  )
  on conflict (consultation_id, doctor_id) do update
  set content = excluded.content,
      assessment = excluded.assessment,
      plan = excluded.plan,
      updated_at = now();

  delete from public.consultation_prescription_options o
  where o.consultation_id = p_consultation_id
    and o.doctor_id = v_uid
    and o.status = 'draft';

  for v_option, v_option_count in
    select value, ordinality::integer
    from jsonb_array_elements(p_options) with ordinality
  loop
    if nullif(trim(coalesce(v_option->>'title','')), '') is null then
      raise exception 'Every prescription option needs a title.';
    end if;
    if nullif(trim(coalesce(v_option->>'description','')), '') is null then
      raise exception 'Every prescription option needs a patient-facing description.';
    end if;
    if jsonb_typeof(coalesce(v_option->'items','[]'::jsonb)) <> 'array'
       or jsonb_array_length(coalesce(v_option->'items','[]'::jsonb)) = 0 then
      raise exception 'Every prescription option needs at least one medicine.';
    end if;

    insert into public.consultation_prescription_options (
      consultation_id, patient_id, doctor_id, position,
      title, cost_tier, description, estimated_price_inr,
      status, created_at, updated_at
    )
    values (
      p_consultation_id,
      v_consultation.patient_id,
      v_uid,
      v_option_count,
      trim(v_option->>'title'),
      case
        when coalesce(v_option->>'cost_tier','') in ('budget','balanced','premium','custom')
          then v_option->>'cost_tier'
        else 'custom'
      end,
      trim(v_option->>'description'),
      nullif(v_option->>'estimated_price_inr','')::numeric,
      'draft',
      now(),
      now()
    )
    returning id into v_option_id;

    v_item_count := 0;
    for v_item, v_item_count in
      select value, ordinality::integer
      from jsonb_array_elements(v_option->'items') with ordinality
    loop
      select * into v_catalog
      from public.medication_catalog m
      where m.id = (v_item->>'catalog_id')::uuid
        and m.active = true;

      if not found then raise exception 'Selected medication is not available in the active catalog.'; end if;

      if v_catalog.treatment_area not in (v_consultation.primary_concern, 'general') then
        raise exception 'Selected medication does not match this consultation care area.';
      end if;

      if nullif(trim(coalesce(v_item->>'frequency','')), '') is null
         or nullif(trim(coalesce(v_item->>'duration','')), '') is null then
        raise exception 'Frequency and duration are required for every medicine.';
      end if;

      insert into public.consultation_prescription_option_items (
        option_id, medication_catalog_id, position,
        medication_name, strength, dosage_form,
        frequency, duration, instructions, created_at
      )
      values (
        v_option_id,
        v_catalog.id,
        v_item_count,
        v_catalog.display_name,
        v_catalog.strength,
        v_catalog.dosage_form,
        trim(v_item->>'frequency'),
        trim(v_item->>'duration'),
        nullif(trim(coalesce(v_item->>'instructions','')), ''),
        now()
      );
    end loop;
  end loop;

  update public.consultations
  set updated_at = now()
  where id = p_consultation_id;

  return jsonb_build_object(
    'success', true,
    'consultationId', p_consultation_id,
    'optionCount', jsonb_array_length(p_options)
  );
end;
$$;

create or replace function public.v1_save_treatment_options(
  p_consultation_id uuid,
  p_clinical_note text,
  p_options jsonb
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_save_treatment_options_worker(p_consultation_id, p_clinical_note, p_options);
$$;

create or replace function private.v1_complete_consultation_options_worker(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_consultation public.consultations%rowtype;
  v_option_count integer;
  v_invalid_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  select p.role::text into v_role from public.profiles p where p.id = v_uid;
  if v_role <> 'doctor' then raise exception 'Doctor access required.'; end if;

  select * into v_consultation
  from public.consultations c
  where c.id = p_consultation_id
    and c.assigned_to = v_uid
  for update;

  if not found then raise exception 'Consultation is not assigned to this doctor.'; end if;

  if v_consultation.status = 'completed' then
    return jsonb_build_object('success', true, 'status', 'completed', 'alreadyCompleted', true);
  end if;

  if v_consultation.status <> 'under_review' then
    raise exception 'Consultation must be under review before completion.';
  end if;

  if not exists (
    select 1 from public.clinical_notes n
    where n.consultation_id = p_consultation_id
      and n.doctor_id = v_uid
      and nullif(trim(coalesce(n.assessment, n.content, '')), '') is not null
  ) then
    raise exception 'A clinical note is required before completion.';
  end if;

  select count(*) into v_option_count
  from public.consultation_prescription_options o
  where o.consultation_id = p_consultation_id
    and o.doctor_id = v_uid
    and o.status = 'draft';

  if v_option_count = 0 then
    raise exception 'At least one saved prescription option is required.';
  end if;

  select count(*) into v_invalid_count
  from public.consultation_prescription_options o
  where o.consultation_id = p_consultation_id
    and o.doctor_id = v_uid
    and o.status = 'draft'
    and (
      nullif(trim(o.title), '') is null
      or nullif(trim(o.description), '') is null
      or o.estimated_price_inr is null
      or o.estimated_price_inr < 0
      or not exists (
        select 1 from public.consultation_prescription_option_items i where i.option_id = o.id
      )
    );

  if v_invalid_count > 0 then
    raise exception 'Every prescription option needs a title, description, price, and at least one medicine.';
  end if;

  update public.consultation_prescription_options
  set status = 'finalized',
      finalized_at = v_now,
      updated_at = v_now
  where consultation_id = p_consultation_id
    and doctor_id = v_uid
    and status = 'draft';

  update public.consultations
  set status = 'completed',
      completed_at = v_now,
      updated_at = v_now
  where id = p_consultation_id;

  insert into public.message_threads (
    id, consultation_id, patient_id, doctor_id, status,
    patient_unread_count, doctor_unread_count,
    last_message_preview, last_message_at, created_at, updated_at
  )
  values (
    'thread_' || p_consultation_id::text,
    p_consultation_id,
    v_consultation.patient_id,
    v_uid,
    'open',
    0, 0, null, v_now, v_now, v_now
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
    'notif_options_ready_' || replace(p_consultation_id::text, '-', ''),
    v_consultation.patient_id,
    'TREATMENT_OPTIONS_READY',
    'Your treatment options are ready',
    'Your doctor completed the review. Compare the prescribed options, choose the one you prefer, and continue to checkout when payment is enabled.',
    p_consultation_id::text,
    'consultation',
    'unread',
    'options_ready_' || p_consultation_id::text,
    v_now
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object(
    'success', true,
    'status', 'completed',
    'optionCount', v_option_count
  );
end;
$$;

create or replace function public.v1_complete_consultation_options(p_consultation_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_complete_consultation_options_worker(p_consultation_id);
$$;

create or replace function private.v1_select_prescription_option_worker(p_option_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_option public.consultation_prescription_options%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  select p.role::text into v_role from public.profiles p where p.id = v_uid;
  if v_role <> 'patient' then raise exception 'Patient access required.'; end if;

  select * into v_option
  from public.consultation_prescription_options o
  where o.id = p_option_id
    and o.patient_id = v_uid
    and o.status = 'finalized'
  for update;

  if not found then raise exception 'Treatment option not found.'; end if;

  if not exists (
    select 1 from public.consultations c
    where c.id = v_option.consultation_id
      and c.patient_id = v_uid
      and c.status = 'completed'
  ) then
    raise exception 'Consultation must be completed before selecting a treatment option.';
  end if;

  update public.consultations
  set selected_prescription_option_id = p_option_id,
      selected_prescription_option_at = v_now,
      updated_at = v_now
  where id = v_option.consultation_id
    and patient_id = v_uid;

  insert into public.notifications (
    id, patient_id, type, title, short_message,
    related_entity_id, related_entity_type, status, idempotency_key, created_at
  )
  values (
    'notif_option_selected_' || replace(p_option_id::text, '-', ''),
    v_uid,
    'TREATMENT_OPTION_SELECTED',
    'Treatment option selected',
    'Your treatment choice is saved. Checkout and payment will be connected in the next release.',
    v_option.consultation_id::text,
    'consultation',
    'unread',
    'option_selected_' || p_option_id::text,
    v_now
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object(
    'success', true,
    'consultationId', v_option.consultation_id,
    'selectedOptionId', p_option_id
  );
end;
$$;

create or replace function public.v1_select_prescription_option(p_option_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_select_prescription_option_worker(p_option_id);
$$;

create or replace function private.v1_mark_all_notifications_read_worker()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;

  update public.notifications n
  set status = 'read',
      read_at = coalesce(n.read_at, clock_timestamp())
  where n.patient_id = v_uid
    and (n.status <> 'read' or n.read_at is null);

  get diagnostics v_count = row_count;
  return jsonb_build_object('success', true, 'updated', v_count);
end;
$$;

create or replace function public.v1_mark_all_notifications_read()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.v1_mark_all_notifications_read_worker();
$$;

revoke all on function private.v1_submit_consultation_worker(uuid) from public;
revoke all on function private.v1_claim_consultation_worker(uuid) from public;
revoke all on function private.v1_save_treatment_options_worker(uuid, text, jsonb) from public;
revoke all on function private.v1_complete_consultation_options_worker(uuid) from public;
revoke all on function private.v1_select_prescription_option_worker(uuid) from public;
revoke all on function private.v1_mark_all_notifications_read_worker() from public;

grant usage on schema private to authenticated;
grant execute on function private.v1_submit_consultation_worker(uuid) to authenticated;
grant execute on function private.v1_claim_consultation_worker(uuid) to authenticated;
grant execute on function private.v1_save_treatment_options_worker(uuid, text, jsonb) to authenticated;
grant execute on function private.v1_complete_consultation_options_worker(uuid) to authenticated;
grant execute on function private.v1_select_prescription_option_worker(uuid) to authenticated;
grant execute on function private.v1_mark_all_notifications_read_worker() to authenticated;

revoke all on function public.v1_submit_consultation(uuid) from public, anon;
revoke all on function public.v1_claim_consultation(uuid) from public, anon;
revoke all on function public.v1_save_treatment_options(uuid, text, jsonb) from public, anon;
revoke all on function public.v1_complete_consultation_options(uuid) from public, anon;
revoke all on function public.v1_select_prescription_option(uuid) from public, anon;
revoke all on function public.v1_mark_all_notifications_read() from public, anon;

grant execute on function public.v1_submit_consultation(uuid) to authenticated;
grant execute on function public.v1_claim_consultation(uuid) to authenticated;
grant execute on function public.v1_save_treatment_options(uuid, text, jsonb) to authenticated;
grant execute on function public.v1_complete_consultation_options(uuid) to authenticated;
grant execute on function public.v1_select_prescription_option(uuid) to authenticated;
grant execute on function public.v1_mark_all_notifications_read() to authenticated;
