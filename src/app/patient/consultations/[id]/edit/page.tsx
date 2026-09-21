import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditConsultationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { profile } = await requireRole("patient");
  const supabase = await createClient();
  const { data } = await supabase.from("consultations").select("id, primary_concern, symptoms, symptom_duration, relevant_context, status").eq("id", id).single();
  if (!data) notFound();
  if (data.status !== "draft") redirect(`/patient/consultations/${id}`);
  return <AppShell role="patient" active="Consultations" name={profile.full_name || "Patient"}>
    <section className="dashboard-heading compact-heading"><div><span className="eyebrow">Saved draft</span><h1>Continue your consultation.</h1><p>Your changes remain private until submission.</p></div></section>
    {query.error && <p className="page-error" role="alert">We couldn’t save or submit this consultation. Review the details and try again.</p>}
    <ConsultationForm draft={data} />
  </AppShell>;
}
