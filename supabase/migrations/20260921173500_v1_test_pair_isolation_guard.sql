-- Keep the isolated test pair from mixing with production routing.
update public.staff_profiles
set accepting_new_patients = false,
    updated_at = now()
where lower(email) = 'doctor123@gmail.com';

create or replace function private.enforce_test_account_pair_isolation()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_test_doctor uuid;
  v_is_test_doctor boolean := false;
begin
  select doctor_id into v_test_doctor
  from public.test_account_pairs
  where patient_id = new.patient_id and active = true
  limit 1;

  if v_test_doctor is not null then
    if new.assigned_to is not null and new.assigned_to <> v_test_doctor then
      raise exception 'Test patient consultations may only be assigned to the paired test doctor.';
    end if;
    return new;
  end if;

  if new.assigned_to is not null then
    select exists (
      select 1 from public.test_account_pairs
      where doctor_id = new.assigned_to and active = true
    ) into v_is_test_doctor;

    if v_is_test_doctor then
      raise exception 'The paired test doctor cannot receive non-test consultations.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists consultations_enforce_test_pair_isolation on public.consultations;
create trigger consultations_enforce_test_pair_isolation
before insert or update of patient_id, assigned_to
on public.consultations
for each row execute function private.enforce_test_account_pair_isolation();

create or replace function public.v1_test_delete_draft(p_consultation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare v_pair public.test_account_pairs%rowtype;
begin
  select * into v_pair from public.test_account_pairs where patient_id = auth.uid() and active = true;
  if not found then raise exception 'This RPC is restricted to the configured test patient.'; end if;

  delete from public.consultations
  where id = p_consultation_id
    and patient_id = v_pair.patient_id
    and status = 'draft';

  if not found then raise exception 'Draft consultation not found.'; end if;
  return jsonb_build_object('success', true, 'testPair', true);
end;
$$;

revoke all on function public.v1_test_delete_draft(uuid) from public, anon;
grant execute on function public.v1_test_delete_draft(uuid) to authenticated;
