-- Consolidate equivalent read policies and cover workflow foreign keys.
drop policy "Patients read their consultations" on public.consultations;
drop policy "Assigned doctors read their consultations" on public.consultations;
create policy "Participants read their consultations" on public.consultations for select to authenticated
using (patient_id = (select auth.uid()) or assigned_doctor_id = (select auth.uid()));

drop policy "Patients read completed prescriptions" on public.prescriptions;
drop policy "Doctors read their prescriptions" on public.prescriptions;
create policy "Participants read authorized prescriptions" on public.prescriptions for select to authenticated
using (
  doctor_id = (select auth.uid())
  or (
    patient_id = (select auth.uid())
    and exists (select 1 from public.consultations c where c.id = consultation_id and c.status = 'completed')
  )
);

drop policy "Users can read their own profile" on public.profiles;
drop policy "Doctors read assigned patient profiles" on public.profiles;
create policy "Users read authorized profiles" on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (
    private.current_role() = 'doctor'
    and exists (select 1 from public.consultations c where c.patient_id = profiles.id and c.assigned_doctor_id = (select auth.uid()))
  )
);

create index clinical_notes_doctor_idx on public.clinical_notes (doctor_id);
create index message_threads_patient_idx on public.message_threads (patient_id, updated_at desc);
create index message_threads_doctor_idx on public.message_threads (doctor_id, updated_at desc);
create index messages_sender_idx on public.messages (sender_id);
create index notifications_consultation_idx on public.notifications (consultation_id);
create index prescription_items_prescription_idx on public.prescription_items (prescription_id, position);
create index prescriptions_patient_idx on public.prescriptions (patient_id);
create index prescriptions_doctor_idx on public.prescriptions (doctor_id);
