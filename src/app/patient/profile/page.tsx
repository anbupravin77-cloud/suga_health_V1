import { LogOut } from "lucide-react";
import { signOut, updateProfile } from "@/app/actions";
import { ActionButton } from "@/components/ui/action-button";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const query = await searchParams;
  const identity = await requireIdentity();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone_number, date_of_birth")
    .eq("id", identity.id)
    .single();

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Your details</span>
          <h1>Profile</h1>
          <p>Keep the information used during your care up to date.</p>
        </div>
      </section>

      {query.notice && <p className="page-notice">Profile updated.</p>}
      {query.error && <p className="page-error">We couldn’t update your profile.</p>}

      <form className="profile-form" action={updateProfile}>
        <input type="hidden" name="role" value="patient" />
        <label>First name<input name="first_name" defaultValue={data?.first_name ?? ""} required /></label>
        <label>Last name<input name="last_name" defaultValue={data?.last_name ?? ""} required /></label>
        <label>Email<input value={identity.email ?? ""} disabled /></label>
        <label>Phone<input name="phone_number" type="tel" defaultValue={data?.phone_number ?? ""} /></label>
        <label>Date of birth<input name="date_of_birth" type="date" defaultValue={data?.date_of_birth ?? ""} /></label>
        <div className="form-actions">
          <ActionButton className="button button-primary" type="submit" pendingLabel="Saving…">Save profile</ActionButton>
        </div>
      </form>

      <section className="profile-signout">
        <div>
          <h2>Sign out</h2>
          <p>End this session on this device.</p>
        </div>
        <form action={signOut}>
          <ActionButton className="button button-secondary" type="submit" pendingLabel="Signing out…"><LogOut size={16} /> Sign out</ActionButton>
        </form>
      </section>
    </>
  );
}
