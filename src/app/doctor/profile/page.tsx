import { LogOut } from "lucide-react";
import { signOut, updateProfile } from "@/app/actions";
import { ActionButton } from "@/components/ui/action-button";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const query = await searchParams;
  const identity = await requireIdentity();
  const supabase = await createClient();

  const [{ data }, { data: staff }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, phone_number")
      .eq("id", identity.id)
      .single(),
    supabase
      .from("staff_profiles")
      .select("first_name, last_name, specialties, active, onboarding_status")
      .eq("id", identity.id)
      .maybeSingle(),
  ]);

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Clinical identity</span>
          <h1>Doctor profile</h1>
          <p>Details used inside your clinical workspace.</p>
        </div>
        {staff?.active && staff?.onboarding_status === "completed" && <span className="verified-mark">Clinician active</span>}
      </section>

      {query.notice && <p className="page-notice">Profile updated.</p>}
      {query.error && <p className="page-error">We couldn’t update your profile.</p>}

      <form className="profile-form" action={updateProfile}>
        <input type="hidden" name="role" value="doctor" />
        <label>Display name<input name="display_name" defaultValue={data?.display_name ?? ""} required /></label>
        <label>Email<input value={identity.email ?? ""} disabled /></label>
        <label>Phone<input name="phone_number" type="tel" defaultValue={data?.phone_number ?? ""} /></label>
        <label>Specialties<input value={(staff?.specialties ?? []).join(", ")} disabled /></label>
        <label>Status<input value={staff?.active ? "Active clinician" : "Inactive"} disabled /></label>
        <div className="form-actions">
          <ActionButton className="button button-primary" type="submit" pendingLabel="Saving…">Save profile</ActionButton>
        </div>
      </form>

      <section className="profile-signout">
        <div><h2>Sign out</h2><p>End this doctor session on this device.</p></div>
        <form action={signOut}>
          <ActionButton className="button button-secondary" type="submit" pendingLabel="Signing out…"><LogOut size={16} /> Sign out</ActionButton>
        </form>
      </section>
    </>
  );
}
