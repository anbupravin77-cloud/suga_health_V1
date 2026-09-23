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

## Staff provisioning

The protected admin portal manages clinician and pharmacy access:

- `/admin/doctors` — search doctors and create a doctor login.
- `/admin/pharmacists` — search pharmacists and create a pharmacist login.
- Doctor creation collects name, age, email, password, and one or more treatment fields.
- Supported doctor treatment fields are `weight`, `hair`, and `sex`.
- Staff creation is performed by the authenticated `admin-create-staff` Supabase Edge Function.
- The Supabase service-role secret stays inside the Edge Function and is never sent to the browser.
- Created doctors sign in through the normal Suga.Health sign-in page and are routed to `/doctor`.
- Created pharmacists sign in through the same sign-in page and are routed to `/pharmacist`.
- Admin users are routed to `/admin`.

Google OAuth always requests the current application origin as its callback. The corresponding production callback URL must also be present in Supabase Auth → URL Configuration.

## V1 workflow

Patient draft → submit → doctor queue → claim → clinical note and prescription → complete → patient treatment view. Messages and in-app notifications stay attached to the consultation.
