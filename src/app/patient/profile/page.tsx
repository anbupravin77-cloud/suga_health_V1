import { CalendarDays, LogOut, Mail, MapPin, Phone, Ruler, Scale, UserRound } from "lucide-react";
import { signOut, updateProfile } from "@/app/actions";
import { ActionButton } from "@/components/ui/action-button";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

type ShippingAddress = {
  recipientName?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

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
    .select("first_name, last_name, display_name, phone_number, date_of_birth, sex, height_cm, weight_kg, shipping_address, requires_onboarding")
    .eq("id", identity.id)
    .single();

  const displayName: string =
    String(
      data?.display_name ||
      [data?.first_name, data?.last_name].filter(Boolean).join(" ") ||
      "Patient"
    );
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const address = (data?.shipping_address ?? {}) as ShippingAddress;
  const addressLine = [
    address.line1,
    address.line2,
    [address.city, address.region].filter(Boolean).join(", "),
    address.postalCode,
    address.country,
  ].filter(Boolean).join(" · ");

  return (
    <div>
      <section className="patient-page-heading">
        <div>
          <h1>Profile</h1>
          <p>Manage the personal information used across your Suga.Health care journey.</p>
        </div>
      </section>

      {query.notice && <p className="page-notice">Profile updated.</p>}
      {query.error && <p className="page-error">We couldn’t update your profile.</p>}

      <section className="patient-profile-identity">
        <span className="patient-profile-avatar">{initials || "PT"}</span>
        <div>
          <h2>{displayName}</h2>
          <p>Patient</p>
          <div className="patient-profile-contact">
            <span><Mail size={15} /> {identity.email || "Email unavailable"}</span>
            {data?.phone_number && <span><Phone size={15} /> {data.phone_number}</span>}
          </div>
        </div>
      </section>

      <div className="patient-profile-grid">
        <div className="patient-profile-main">
          <section className="patient-panel">
            <div className="patient-section-title">
              <div>
                <span className="patient-kicker">PERSONAL INFORMATION</span>
                <h2>Your details</h2>
              </div>
            </div>

            <form className="patient-profile-form" action={updateProfile}>
              <input type="hidden" name="role" value="patient" />
              <label>
                <span>First name</span>
                <input name="first_name" defaultValue={data?.first_name ?? ""} required />
              </label>
              <label>
                <span>Last name</span>
                <input name="last_name" defaultValue={data?.last_name ?? ""} required />
              </label>
              <label className="wide">
                <span>Email</span>
                <input value={identity.email ?? ""} disabled />
              </label>
              <label>
                <span>Phone number</span>
                <input name="phone_number" type="tel" defaultValue={data?.phone_number ?? ""} />
              </label>
              <label>
                <span>Date of birth</span>
                <input name="date_of_birth" type="date" defaultValue={data?.date_of_birth ?? ""} />
              </label>
              <div className="wide patient-form-actions">
                <ActionButton className="patient-primary-button" type="submit" pendingLabel="Saving…">
                  Save changes
                </ActionButton>
              </div>
            </form>
          </section>

          <section className="patient-panel">
            <div className="patient-section-title">
              <div>
                <span className="patient-kicker">CARE INFORMATION</span>
                <h2>Information already used in your consultations</h2>
              </div>
            </div>
            <div className="patient-profile-facts">
              <div><Ruler size={19} /><span>Height</span><strong>{data?.height_cm ? `${Number(data.height_cm)} cm` : "Not provided"}</strong></div>
              <div><Scale size={19} /><span>Weight</span><strong>{data?.weight_kg ? `${Number(data.weight_kg)} kg` : "Not provided"}</strong></div>
              <div><UserRound size={19} /><span>Sex</span><strong>{data?.sex?.replaceAll("-", " ") || "Not provided"}</strong></div>
              <div><CalendarDays size={19} /><span>Date of birth</span><strong>{data?.date_of_birth ? new Date(`${data.date_of_birth}T00:00:00`).toLocaleDateString("en", { dateStyle: "medium" }) : "Not provided"}</strong></div>
            </div>
            <p className="patient-muted-copy">Measurements can be updated when you start your next consultation.</p>
          </section>
        </div>

        <aside className="patient-profile-side">
          <section className="patient-panel">
            <div className="patient-section-title"><h2>Account status</h2></div>
            <div className="patient-account-status">
              <span className="patient-status-check">✓</span>
              <div>
                <strong>Account active</strong>
                <p>Your authenticated patient account is ready to use.</p>
              </div>
            </div>
          </section>

          <section className="patient-panel">
            <div className="patient-section-title"><h2>Address</h2></div>
            <div className="patient-address-row">
              <MapPin size={20} />
              <div>
                <strong>Saved care address</strong>
                <p>{addressLine || "No saved address available."}</p>
              </div>
            </div>
          </section>

          <section className="patient-panel patient-signout-card">
            <div>
              <span className="patient-kicker">SESSION</span>
              <h2>Sign out</h2>
              <p>End this session on this device.</p>
            </div>
            <form action={signOut}>
              <ActionButton className="patient-secondary-button patient-full-width" type="submit" pendingLabel="Signing out…">
                <LogOut size={16} /> Sign out
              </ActionButton>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
