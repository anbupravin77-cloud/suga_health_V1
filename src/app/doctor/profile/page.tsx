import { LogOut } from "lucide-react";
import { signOut, updateProfile } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { user, profile } = await requireRole("doctor");
  const supabase = await createClient();

  const [{ data }, { data: staff }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, phone_number")
      .eq("id", user.id)
      .single(),
    supabase
      .from("staff_profiles")
      .select("first_name, last_name, specialties, active, onboarding_status")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  return <AppShell role="doctor" active="Profile" name={profile.full_name || "Doctor"}>
    <section className="dashboard-heading">
      <div>
        <span className="eyebrow">Clinical identity</span>
        <h1>Doctor profile</h1>
        <p>Details used inside the test clinical workspace.</p>
      </div>
      {staff?.active && staff?.onboarding_status === "completed" && <span className="verified-mark">Test clinician active</span>}
    </section>

    {query.notice && <p className="page-notice">Profile updated.</p>}
    {query.error && <p className="page-error">We couldn’t update your profile.</p>}

    <form className="profile-form" action={updateProfile}>
      <input type="hidden" name="role" value="doctor" />
      <label>Display name<input name="display_name" defaultValue={data?.display_name ?? ""} required /></label>
      <label>Email<input value={user.email ?? ""} disabled /></label>
      <label>Phone<input name="phone_number" type="tel" defaultValue={data?.phone_number ?? ""} /></label>
      <label>Specialties<input value={(staff?.specialties ?? []).join(", ")} disabled /></label>
      <label>Status<input value={staff?.active ? "Active test clinician" : "Inactive"} disabled /></label>
      <div className="form-actions"><button className="button button-primary" type="submit">Save profile</button></div>
    </form>

    <section className="profile-signout">
      <div><h2>Sign out</h2><p>End this doctor session on this device.</p></div>
      <form action={signOut}><button className="button button-secondary" type="submit"><LogOut size={16} /> Sign out</button></form>
    </section>
  </AppShell>;
}
