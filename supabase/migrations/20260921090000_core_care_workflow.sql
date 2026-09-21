-- Suga.Health V1: consultation, clinical treatment, messaging, and notifications.
create type public.consultation_status as enum ('draft', 'submitted', 'assigned', 'under_review', 'completed');

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  assigned_doctor_id uuid references public.profiles(id) on delete restrict,
  status public.consultation_status not null default 'draft',
  primary_concern text not null,
  symptoms text not null,
  symptom_duration text,
  relevant_context text,
  clinician_message text,
  submitted_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultations_concern_length check (char_length(trim(primary_concern)) between 3 and 160),
  constraint consultations_symptoms_length check (char_length(trim(symptoms)) between 10 and 5000),
  constraint consultations_doctor_assignment check (
    (status in ('draft', 'submitted', 'assigned') and assigned_doctor_id is null)
    or (status in ('under_review', 'completed') and assigned_doctor_id is not null)
  )
);

create table public.clinical_notes (
  consultation_id uuid primary key references public.consultations(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null unique references public.consultations(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint prescription_item_medication_length check (char_length(trim(medication_name)) between 2 and 160)
);

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null unique references public.consultations(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (char_length(trim(body)) between 1 and 3000)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  consultation_id uuid references public.consultations(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index consultations_patient_idx on public.consultations (patient_id, created_at desc);
create index consultations_queue_idx on public.consultations (status, submitted_at) where assigned_doctor_id is null;
create index consultations_doctor_idx on public.consultations (assigned_doctor_id, updated_at desc);
create index messages_thread_idx on public.messages (thread_id, created_at);
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

create trigger consultations_set_updated_at before update on public.consultations
for each row execute function private.set_updated_at();
create trigger clinical_notes_set_updated_at before update on public.clinical_notes
for each row execute function private.set_updated_at();
create trigger prescriptions_set_updated_at before update on public.prescriptions
for each row execute function private.set_updated_at();
create trigger message_threads_set_updated_at before update on public.message_threads
for each row execute function private.set_updated_at();

alter table public.consultations enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_items enable row level security;
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create or replace function private.current_role()
returns public.app_role language sql security definer stable set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;
revoke all on function private.current_role() from public, anon;
grant execute on function private.current_role() to authenticated;

create policy "Doctors read assigned patient profiles" on public.profiles for select to authenticated
using (
  private.current_role() = 'doctor'
  and exists (select 1 from public.consultations c where c.patient_id = profiles.id and c.assigned_doctor_id = (select auth.uid()))
);

create policy "Patients read their consultations" on public.consultations for select to authenticated
using (patient_id = (select auth.uid()));
create policy "Assigned doctors read their consultations" on public.consultations for select to authenticated
using (assigned_doctor_id = (select auth.uid()));
create policy "Patients create their drafts" on public.consultations for insert to authenticated
with check (
  patient_id = (select auth.uid()) and status = 'draft' and assigned_doctor_id is null
  and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'patient')
);
create policy "Patients update their drafts" on public.consultations for update to authenticated
using (patient_id = (select auth.uid()) and status = 'draft')
with check (patient_id = (select auth.uid()) and status = 'draft' and assigned_doctor_id is null);
create policy "Patients delete their drafts" on public.consultations for delete to authenticated
using (patient_id = (select auth.uid()) and status = 'draft');

create policy "Assigned doctors read clinical notes" on public.clinical_notes for select to authenticated
using (doctor_id = (select auth.uid()));
create policy "Patients read completed prescriptions" on public.prescriptions for select to authenticated
using (
  patient_id = (select auth.uid())
  and exists (select 1 from public.consultations c where c.id = consultation_id and c.status = 'completed')
);
create policy "Doctors read their prescriptions" on public.prescriptions for select to authenticated
using (doctor_id = (select auth.uid()));
create policy "Participants read prescription items" on public.prescription_items for select to authenticated
using (
  exists (
    select 1 from public.prescriptions p
    join public.consultations c on c.id = p.consultation_id
    where p.id = prescription_id
      and (p.doctor_id = (select auth.uid()) or (p.patient_id = (select auth.uid()) and c.status = 'completed'))
  )
);
create policy "Participants read their threads" on public.message_threads for select to authenticated
using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()));
create policy "Participants read thread messages" on public.messages for select to authenticated
using (
  exists (select 1 from public.message_threads t where t.id = thread_id and (t.patient_id = (select auth.uid()) or t.doctor_id = (select auth.uid())))
);
create policy "Participants send thread messages" on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (select 1 from public.message_threads t where t.id = thread_id and (t.patient_id = (select auth.uid()) or t.doctor_id = (select auth.uid())))
);
create policy "Users read their notifications" on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()));
create policy "Users mark their notifications read" on public.notifications for update to authenticated
using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create or replace function private.notify_new_message()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_recipient uuid; v_consultation uuid;
begin
  select case when new.sender_id = t.patient_id then t.doctor_id else t.patient_id end, t.consultation_id
  into v_recipient, v_consultation from public.message_threads t where t.id = new.thread_id;
  update public.message_threads set updated_at = now() where id = new.thread_id;
  if v_recipient is not null then
    insert into public.notifications (recipient_id, consultation_id, title, body)
    values (v_recipient, v_consultation, 'New secure message', 'You have a new message in your consultation.');
  end if;
  return new;
end; $$;
revoke all on function private.notify_new_message() from public, anon, authenticated;
create trigger messages_notify_participant after insert on public.messages
for each row execute function private.notify_new_message();

revoke all on public.consultations, public.clinical_notes, public.prescriptions, public.prescription_items, public.message_threads, public.messages, public.notifications from anon, authenticated;
grant select, insert, update, delete on public.consultations to authenticated;
grant select on public.clinical_notes, public.prescriptions, public.prescription_items, public.message_threads to authenticated;
grant select, insert on public.messages to authenticated;
grant select, update (read_at) on public.notifications to authenticated;

create or replace function public.submit_consultation(p_consultation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_patient uuid;
begin
  select patient_id into v_patient from public.consultations
  where id = p_consultation_id and patient_id = auth.uid() and status = 'draft' for update;
  if v_patient is null then raise exception 'Consultation cannot be submitted'; end if;
  update public.consultations set status = 'submitted', submitted_at = now() where id = p_consultation_id;
  update public.consultations set status = 'assigned' where id = p_consultation_id;
  insert into public.message_threads (consultation_id, patient_id) values (p_consultation_id, v_patient)
  on conflict (consultation_id) do nothing;
  insert into public.notifications (recipient_id, consultation_id, title, body)
  values (v_patient, p_consultation_id, 'Consultation submitted', 'Your consultation is now in the doctor queue.');
end; $$;

create or replace function public.list_doctor_queue()
returns table (id uuid, patient_name text, primary_concern text, submitted_at timestamptz, status public.consultation_status)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not exists (
    select 1 from public.profiles p join public.doctor_profiles d on d.doctor_id = p.id
    where p.id = auth.uid() and p.role = 'doctor' and d.verified = true
  ) then raise exception 'Verified doctor access required'; end if;
  return query select c.id, coalesce(p.full_name, 'Patient'), c.primary_concern, c.submitted_at, c.status
  from public.consultations c join public.profiles p on p.id = c.patient_id
  where c.status = 'assigned' and c.assigned_doctor_id is null order by c.submitted_at asc;
end; $$;

create or replace function public.claim_consultation(p_consultation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_patient uuid;
begin
  if not exists (
    select 1 from public.profiles p join public.doctor_profiles d on d.doctor_id = p.id
    where p.id = auth.uid() and p.role = 'doctor' and d.verified = true
  ) then raise exception 'Verified doctor access required'; end if;
  update public.consultations set assigned_doctor_id = auth.uid(), status = 'under_review', claimed_at = now()
  where id = p_consultation_id and status = 'assigned' and assigned_doctor_id is null returning patient_id into v_patient;
  if v_patient is null then raise exception 'Consultation is no longer available'; end if;
  update public.message_threads set doctor_id = auth.uid() where consultation_id = p_consultation_id;
  insert into public.notifications (recipient_id, consultation_id, title, body)
  values (v_patient, p_consultation_id, 'A doctor has begun your review', 'Your consultation is now under review.');
end; $$;

create or replace function public.get_consultation_doctor(p_consultation_id uuid)
returns table (full_name text, professional_title text, specialization text)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not exists (
    select 1 from public.consultations c
    where c.id = p_consultation_id and (c.patient_id = auth.uid() or c.assigned_doctor_id = auth.uid())
  ) then raise exception 'Consultation access required'; end if;
  return query select p.full_name, d.professional_title, d.specialization
  from public.consultations c
  join public.profiles p on p.id = c.assigned_doctor_id
  left join public.doctor_profiles d on d.doctor_id = p.id
  where c.id = p_consultation_id;
end; $$;

create or replace function public.save_clinical_work(
  p_consultation_id uuid, p_note text, p_clinician_message text, p_items jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare v_patient uuid; v_prescription uuid; v_item jsonb; v_position integer := 0;
begin
  select patient_id into v_patient from public.consultations
  where id = p_consultation_id and assigned_doctor_id = auth.uid() and status = 'under_review' for update;
  if v_patient is null then raise exception 'Claimed consultation required'; end if;
  if jsonb_typeof(p_items) <> 'array' then raise exception 'Prescription items must be an array'; end if;
  insert into public.clinical_notes (consultation_id, doctor_id, note)
  values (p_consultation_id, auth.uid(), coalesce(p_note, ''))
  on conflict (consultation_id) do update set note = excluded.note where public.clinical_notes.doctor_id = auth.uid();
  insert into public.prescriptions (consultation_id, patient_id, doctor_id)
  values (p_consultation_id, v_patient, auth.uid())
  on conflict (consultation_id) do update set updated_at = now()
  returning id into v_prescription;
  delete from public.prescription_items where prescription_id = v_prescription;
  for v_item in select value from jsonb_array_elements(p_items) loop
    if nullif(trim(v_item ->> 'medication_name'), '') is null then continue; end if;
    insert into public.prescription_items (prescription_id, medication_name, dosage, frequency, duration, instructions, position)
    values (v_prescription, trim(v_item ->> 'medication_name'), trim(coalesce(v_item ->> 'dosage', '')), trim(coalesce(v_item ->> 'frequency', '')), trim(coalesce(v_item ->> 'duration', '')), nullif(trim(coalesce(v_item ->> 'instructions', '')), ''), v_position);
    v_position := v_position + 1;
  end loop;
  update public.consultations set clinician_message = nullif(trim(coalesce(p_clinician_message, '')), '') where id = p_consultation_id;
end; $$;

create or replace function public.complete_consultation(p_consultation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_patient uuid;
begin
  select patient_id into v_patient from public.consultations
  where id = p_consultation_id and assigned_doctor_id = auth.uid() and status = 'under_review' for update;
  if v_patient is null then raise exception 'Claimed consultation required'; end if;
  if not exists (select 1 from public.clinical_notes where consultation_id = p_consultation_id and length(trim(note)) > 0)
    or not exists (select 1 from public.prescriptions p join public.prescription_items i on i.prescription_id = p.id where p.consultation_id = p_consultation_id)
    or not exists (select 1 from public.consultations where id = p_consultation_id and clinician_message is not null)
  then raise exception 'Clinical note, prescription, and patient message are required'; end if;
  update public.consultations set status = 'completed', completed_at = now() where id = p_consultation_id;
  insert into public.notifications (recipient_id, consultation_id, title, body)
  values (v_patient, p_consultation_id, 'Your treatment plan is ready', 'Your doctor has completed the consultation.');
end; $$;

revoke all on function public.submit_consultation(uuid), public.list_doctor_queue(), public.claim_consultation(uuid), public.get_consultation_doctor(uuid), public.save_clinical_work(uuid, text, text, jsonb), public.complete_consultation(uuid) from public, anon;
grant execute on function public.submit_consultation(uuid), public.list_doctor_queue(), public.claim_consultation(uuid), public.get_consultation_doctor(uuid), public.save_clinical_work(uuid, text, text, jsonb), public.complete_consultation(uuid) to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

comment on function public.save_clinical_work is 'Atomically replaces a claimed consultation clinical note and prescription.';
