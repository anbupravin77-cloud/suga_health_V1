import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor queue" };

export default async function DoctorQueue() {
  const { profile } = await requireRole("doctor");
  return <AppShell role="doctor" active="Queue" name={profile.full_name || "Doctor"}>
    <section className="dashboard-heading"><div><h1>Consultation queue</h1><p>Review new consultations and respond when you’re ready.</p></div></section>
    <section className="queue-table" aria-label="Consultation queue"><div className="queue-head"><span>Patient</span><span>Primary concern</span><span>Submitted</span><span>Status</span><span>Action</span></div><div className="queue-empty"><p>No consultations are waiting right now.</p><span>Newly submitted consultations will appear here securely.</span></div></section>
  </AppShell>;
}
