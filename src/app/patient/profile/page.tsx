import { updateProfile } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function PatientProfilePage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const query = await searchParams;
  const { user, profile } = await requireRole("patient");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name, phone, birth_date").eq("id", user.id).single();
  return <AppShell role="patient" active="Profile" name={profile.full_name || "Patient"}><section className="dashboard-heading"><div><span className="eyebrow">Your details</span><h1>Profile</h1><p>Keep the basic information used during your care up to date.</p></div></section>{query.notice && <p className="page-notice">Profile updated.</p>}{query.error && <p className="page-error">We couldn’t update your profile.</p>}<form className="profile-form" action={updateProfile}><input type="hidden" name="role" value="patient" /><label>Full name<input name="full_name" defaultValue={data?.full_name ?? ""} required /></label><label>Email<input value={user.email ?? ""} disabled /></label><label>Phone<input name="phone" type="tel" defaultValue={data?.phone ?? ""} /></label><label>Date of birth<input name="birth_date" type="date" defaultValue={data?.birth_date ?? ""} /></label><div className="form-actions"><button className="button button-primary" type="submit">Save profile</button></div></form></AppShell>;
}
