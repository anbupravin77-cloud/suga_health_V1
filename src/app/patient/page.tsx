import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient home" };

export default async function PatientHome() {
  const { profile } = await requireRole("patient");
  return <AppShell role="patient" active="Home" name={profile.full_name || "Patient"}>
    <section className="dashboard-heading"><div><h1>Your care, clearly organized.</h1><p>Start a consultation, check updates, and stay connected with your care team.</p></div><Link className="button button-primary" href="/patient/consultations/new">Start consultation</Link></section>
    <section className="dashboard-section"><h2>Active consultation</h2><div className="empty-state"><ClipboardList size={28} strokeWidth={1.4} /><div><h3>No active consultation</h3><p>When you start a consultation, its progress will appear here.</p><Link href="/patient/consultations/new">Start consultation →</Link></div></div></section>
    <section className="dashboard-section"><div className="section-row"><h2>Recent consultations</h2><span>Nothing here yet</span></div><div className="quiet-list"><p>Your completed and ongoing consultations will appear here.</p></div></section>
  </AppShell>;
}
