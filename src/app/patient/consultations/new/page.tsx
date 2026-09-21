import { AppShell } from "@/components/layout/app-shell";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Start consultation" };

export default async function NewConsultationPage() {
  const { profile } = await requireRole("patient");
  return <AppShell role="patient" active="Consultations" name={profile.full_name || "Patient"}>
    <section className="dashboard-heading compact-heading"><div><span className="eyebrow">Private consultation</span><h1>Tell us what’s going on.</h1><p>A real doctor will review the details you submit.</p></div></section>
    <ConsultationForm />
  </AppShell>;
}
