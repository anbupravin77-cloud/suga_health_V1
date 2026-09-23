import { StaffManagement, type StaffRow } from "@/components/admin/staff-management";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pharmacists | Suga.Health Admin" };

export default async function PharmacistsAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("id, email, role, active, onboarding_status, first_name, last_name, age, specialties, created_at")
    .eq("role", "pharmacist")
    .order("created_at", { ascending: false });

  return (
    <>
      <section className="dashboard-heading compact-heading">
        <div>
          <span className="eyebrow">Pharmacy access</span>
          <h1>Pharmacists</h1>
          <p>Create pharmacist logins, search staff, and review account profiles from one place.</p>
        </div>
      </section>
      {error && <p className="page-error" role="alert">Pharmacist accounts could not be loaded.</p>}
      <StaffManagement role="pharmacist" initialStaff={(data ?? []) as StaffRow[]} />
    </>
  );
}
