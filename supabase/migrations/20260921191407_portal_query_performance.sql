
create index if not exists consultations_assigned_status_updated_idx
  on public.consultations (assigned_to, status, updated_at desc);

create index if not exists consultations_assigned_status_submitted_idx
  on public.consultations (assigned_to, status, submitted_at asc);

create index if not exists consultations_patient_updated_idx
  on public.consultations (patient_id, updated_at desc);

create index if not exists message_threads_doctor_updated_idx
  on public.message_threads (doctor_id, updated_at desc);

create index if not exists message_threads_patient_updated_idx
  on public.message_threads (patient_id, updated_at desc);

create index if not exists consultation_option_items_catalog_idx
  on public.consultation_prescription_option_items (medication_catalog_id);

create index if not exists consultations_selected_option_idx
  on public.consultations (selected_prescription_option_id);

drop index if exists public.consultation_prescription_options_consultation_idx;
drop index if exists public.consultation_prescription_option_items_option_idx;

drop policy if exists "consultations_admin_update" on public.consultations;
create policy "consultations_admin_update"
on public.consultations
for update
to authenticated
using ((select public.get_current_role()) = 'admin'::public.user_role)
with check ((select public.get_current_role()) = 'admin'::public.user_role);

drop policy if exists "consultations_patient_insert" on public.consultations;
create policy "consultations_patient_insert"
on public.consultations
for insert
to authenticated
with check (
  (select auth.uid()) = patient_id
  and assigned_to is null
  and completed_at is null
);

drop policy if exists "consultations_patient_update" on public.consultations;
create policy "consultations_patient_update"
on public.consultations
for update
to authenticated
using (
  (select auth.uid()) = patient_id
  and status = 'draft'::public.consultation_status
)
with check (
  (select auth.uid()) = patient_id
  and status = 'draft'::public.consultation_status
  and assigned_to is null
  and submitted_at is null
  and completed_at is null
);

drop policy if exists "consultations_select" on public.consultations;
create policy "consultations_select"
on public.consultations
for select
to authenticated
using (
  (select auth.uid()) = patient_id
  or (select public.get_current_role()) = 'admin'::public.user_role
  or (
    (select public.get_current_role()) = 'doctor'::public.user_role
    and assigned_to = (select auth.uid())
  )
);

drop policy if exists "message_threads_select" on public.message_threads;
create policy "message_threads_select"
on public.message_threads
for select
to public
using (
  patient_id = (select auth.uid())
  or doctor_id = (select auth.uid())
  or (select public.get_current_role()) = 'admin'::public.user_role
);

drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
on public.messages
for select
to public
using (
  exists (
    select 1
    from public.message_threads t
    where t.id = messages.thread_id
      and (
        t.patient_id = (select auth.uid())
        or t.doctor_id = (select auth.uid())
        or (select public.get_current_role()) = 'admin'::public.user_role
      )
  )
);

drop policy if exists "notifications_no_client_delete" on public.notifications;
create policy "notifications_no_client_delete"
on public.notifications
for delete
to authenticated
using ((select public.get_current_role()) = 'admin'::public.user_role);

drop policy if exists "notifications_no_client_insert" on public.notifications;
create policy "notifications_no_client_insert"
on public.notifications
for insert
to authenticated
with check ((select public.get_current_role()) = 'admin'::public.user_role);

drop policy if exists "notifications_patient_update" on public.notifications;
create policy "notifications_patient_update"
on public.notifications
for update
to authenticated
using (patient_id = (select auth.uid()))
with check (
  patient_id = (select auth.uid())
  and status = any (array['unread'::text, 'read'::text])
);

drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select"
on public.notifications
for select
to public
using (patient_id = (select auth.uid()));

drop policy if exists "Doctors read assigned patient profiles" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
to public
using (
  (select auth.uid()) = id
  or (select public.get_current_role()) = 'admin'::public.user_role
  or (
    (select public.get_current_role()) = 'doctor'::public.user_role
    and exists (
      select 1
      from public.consultations c
      where c.patient_id = profiles.id
        and c.assigned_to = (select auth.uid())
    )
  )
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
on public.profiles
for update
to public
using (
  (select auth.uid()) = id
  or (select public.get_current_role()) = 'admin'::public.user_role
)
with check (
  (select public.get_current_role()) = 'admin'::public.user_role
  or role = (
    select p.role
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

drop policy if exists "staff_profiles_select" on public.staff_profiles;
create policy "staff_profiles_select"
on public.staff_profiles
for select
to public
using (
  (select public.get_current_role()) = any (
    array['doctor'::public.user_role, 'pharmacist'::public.user_role, 'admin'::public.user_role]
  )
  or (select auth.uid()) = id
);
