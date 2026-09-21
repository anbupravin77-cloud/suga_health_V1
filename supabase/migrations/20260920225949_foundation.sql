-- Suga.Health V1 foundation: canonical profiles, role isolation, and doctor metadata.
create type public.app_role as enum ('patient', 'doctor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'patient',
  phone text,
  birth_date date,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) between 2 and 100)
);

create table public.doctor_profiles (
  doctor_id uuid primary key references public.profiles(id) on delete cascade,
  professional_title text,
  specialization text,
  registration_number text unique,
  bio text,
  avatar_path text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger doctor_profiles_set_updated_at
before update on public.doctor_profiles
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'patient'::public.app_role
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.doctor_profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own safe profile fields"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can read verified doctor profiles"
on public.doctor_profiles for select
to authenticated
using (verified = true or doctor_id = (select auth.uid()));

create policy "Doctors can update their own professional profile"
on public.doctor_profiles for update
to authenticated
using (doctor_id = (select auth.uid()))
with check (doctor_id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, birth_date, avatar_path) on table public.profiles to authenticated;

revoke all on table public.doctor_profiles from anon, authenticated;
grant select on table public.doctor_profiles to authenticated;
grant update (professional_title, specialization, bio, avatar_path) on table public.doctor_profiles to authenticated;

comment on table public.profiles is 'Canonical Suga.Health identity profile. Role changes are internal-only.';
comment on table public.doctor_profiles is 'Verified clinician metadata. Provisioned through a safe internal process.';
