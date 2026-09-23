import { StaffManagement, type StaffRow } from "@/components/admin/staff-management";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctors | Suga.Health Admin" };

export default async function DoctorsAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("id, email, role, active, onboarding_status, first_name, last_name, age, specialties, created_at")
    .eq("role", "doctor")
    .order("created_at", { ascending: false });

  return (
    <>
      <section className="dashboard-heading compact-heading">
        <div>
          <span className="eyebrow">Clinical access</span>
          <h1>Doctors</h1>
          <p>Create doctor logins, assign treatment fields, search staff, and review account profiles.</p>
        </div>
      </section>
      {error && <p className="page-error" role="alert">Doctor accounts could not be loaded.</p>}
      <StaffManagement role="doctor" initialStaff={(data ?? []) as StaffRow[]} />
    </>
  );
}
