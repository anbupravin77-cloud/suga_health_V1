import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { completeConsultation } from "@/app/actions";
import { ClinicalForm } from "@/components/care/clinical-form";
import { MessageThread } from "@/components/care/message-thread";
import { StatusBadge } from "@/components/care/status-badge";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function DoctorConsultationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { user, profile } = await requireRole("doctor");
  const supabase = await createClient();
  const { data: consultation } = await supabase.from("consultations").select("*").eq("id", id).single();
  if (!consultation) notFound();
  const [{ data: patient }, { data: note }, { data: prescription }, { data: thread }] = await Promise.all([
    supabase.from("profiles").select("full_name, birth_date, phone").eq("id", consultation.patient_id).maybeSingle(),
    supabase.from("clinical_notes").select("note").eq("consultation_id", id).maybeSingle(),
    supabase.from("prescriptions").select("id, prescription_items(medication_name, dosage, frequency, duration, instructions, position)").eq("consultation_id", id).maybeSingle(),
    supabase.from("message_threads").select("id").eq("consultation_id", id).maybeSingle(),
  ]);
  const { data: messages } = thread ? await supabase.from("messages").select("id, sender_id, body, created_at").eq("thread_id", thread.id).order("created_at") : { data: [] };
  const items = (prescription?.prescription_items ?? []).sort((a, b) => a.position - b.position);
  const completed = consultation.status === "completed";
  return <AppShell role="doctor" active="Active reviews" name={profile.full_name || "Doctor"}>
    <section className="case-header"><div><Link className="back-link" href="/doctor/active-reviews">← Active reviews</Link><span className="eyebrow">Clinical review</span><h1>{consultation.primary_concern}</h1><p>{patient?.full_name || "Patient"} · Submitted {consultation.submitted_at ? new Date(consultation.submitted_at).toLocaleDateString("en", { dateStyle: "long" }) : "recently"}</p></div><StatusBadge status={consultation.status} /></section>
    {query.notice && <p className="page-notice" role="status">{query.notice === "claimed" ? "Consultation claimed. You are now responsible for this case." : query.notice === "completed" ? "Consultation completed and the patient was notified." : query.notice === "saved" ? "Clinical work saved securely." : "Message sent securely."}</p>}
    {query.error && <p className="page-error" role="alert">{query.error === "complete" ? "Add a clinical note, prescription, and patient message before completing." : "We couldn’t save that change. Please try again."}</p>}
    <div className="doctor-review-layout"><aside className="patient-brief"><span className="eyebrow">Patient-provided information</span><h2>{patient?.full_name || "Patient"}</h2><dl><div><dt>Primary concern</dt><dd>{consultation.primary_concern}</dd></div><div><dt>Symptoms</dt><dd>{consultation.symptoms}</dd></div><div><dt>Duration</dt><dd>{consultation.symptom_duration || "Not provided"}</dd></div><div><dt>Relevant context</dt><dd>{consultation.relevant_context || "Not provided"}</dd></div>{patient?.birth_date && <div><dt>Date of birth</dt><dd>{new Date(patient.birth_date).toLocaleDateString("en", { dateStyle: "long" })}</dd></div>}</dl></aside><div className="clinical-workspace">{completed ? <section className="completed-panel"><CheckCircle2 /><span className="eyebrow">Finalized</span><h2>This consultation is complete.</h2><p>The treatment plan is now available to the patient. Clinical information is locked against further changes.</p><div className="finalized-copy"><h3>Clinician message</h3><p>{consultation.clinician_message}</p><h3>Prescription</h3>{items.map((item, index) => <p key={index}><strong>{item.medication_name}</strong> — {item.dosage}, {item.frequency}, {item.duration}</p>)}</div></section> : <ClinicalForm consultationId={id} note={note?.note ?? ""} clinicianMessage={consultation.clinician_message ?? ""} items={items} />}</div></div>
    {!completed && <section className="completion-bar"><div><span className="eyebrow">Final review</span><h2>Ready to send the treatment plan?</h2><p>Completion locks clinical information and notifies the patient.</p></div><form action={completeConsultation}><input type="hidden" name="id" value={id} /><button className="button button-primary" type="submit">Complete consultation</button></form></section>}
    {thread && <MessageThread threadId={thread.id} currentUserId={user.id} messages={messages ?? []} returnTo={`/doctor/consultations/${id}`} />}
  </AppShell>;
}
