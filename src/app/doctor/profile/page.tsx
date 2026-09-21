import { updateProfile } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function DoctorProfilePage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const query = await searchParams;
  const { user, profile } = await requireRole("doctor");
  const supabase = await createClient();
  const [{ data }, { data: doctor }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    supabase.from("doctor_profiles").select("professional_title, specialization, registration_number, bio, verified").eq("doctor_id", user.id).maybeSingle(),
  ]);
  return <AppShell role="doctor" active="Profile" name={profile.full_name || "Doctor"}><section className="dashboard-heading"><div><span className="eyebrow">Clinical identity</span><h1>Doctor profile</h1><p>Professional details shown within the patient care experience.</p></div>{doctor?.verified && <span className="verified-mark">Verified clinician</span>}</section>{query.notice && <p className="page-notice">Profile updated.</p>}{query.error && <p className="page-error">We couldn’t update your profile.</p>}<form className="profile-form" action={updateProfile}><input type="hidden" name="role" value="doctor" /><label>Full name<input name="full_name" defaultValue={data?.full_name ?? ""} required /></label><label>Email<input value={user.email ?? ""} disabled /></label><label>Phone<input name="phone" type="tel" defaultValue={data?.phone ?? ""} /></label><label>Professional title<input name="professional_title" defaultValue={doctor?.professional_title ?? ""} placeholder="e.g. Consultant Physician" /></label><label>Specialization<input name="specialization" defaultValue={doctor?.specialization ?? ""} /></label><label>Registration number<input value={doctor?.registration_number ?? "Managed internally"} disabled /></label><label className="wide">Professional bio<textarea name="bio" defaultValue={doctor?.bio ?? ""} rows={5} /></label><div className="form-actions"><button className="button button-primary" type="submit">Save profile</button></div></form></AppShell>;
}
