# Suga.Health V1

Doctor-led telehealth workflow built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key.
2. Run `npm install`.
3. Run `npm run dev`.

Vercel uses the standard Next.js configuration: no custom build, output, or start commands are required. Production deploys from `main`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Doctor provisioning

New users are patients by default. Doctor access is granted through a controlled Supabase SQL operation after the clinician is verified. Replace the placeholder with the authenticated user ID:

```sql
begin;

update public.profiles
set role = 'doctor'
where id = '<AUTH_USER_UUID>';

insert into public.doctor_profiles (
  doctor_id,
  professional_title,
  specialization,
  registration_number,
  verified
)
values (
  '<AUTH_USER_UUID>',
  'Doctor',
  '<SPECIALIZATION>',
  '<REGISTRATION_NUMBER>',
  true
);

commit;
```

Role and verification changes are intentionally unavailable through the public application.

## V1 workflow

Patient draft → submit → doctor queue → claim → clinical note and prescription → complete → patient treatment view. Messages and in-app notifications stay attached to the consultation.
