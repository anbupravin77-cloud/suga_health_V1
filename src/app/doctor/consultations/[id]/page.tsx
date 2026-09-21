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

type Responses = {
  symptoms?: string;
  symptom_duration?: string | null;
  relevant_context?: string | null;
};

export default async function DoctorConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { user, profile } = await requireRole("doctor");
  const supabase = await createClient();

  const { data: consultation } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultation) notFound();

  const responses = (consultation.responses ?? {}) as Responses;

  const [{ data: patient }, { data: note }, { data: prescription }, { data: thread }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, first_name, last_name, date_of_birth, phone_number")
      .eq("id", consultation.patient_id)
      .maybeSingle(),
    supabase
      .from("clinical_notes")
      .select("content, assessment, plan")
      .eq("consultation_id", id)
      .eq("doctor_id", user.id)
      .maybeSingle(),
    supabase
      .from("prescriptions")
      .select("id, clinician_message, directions, prescription_items(medication_name, strength, dosage_form, quantity, sig, description, is_recommended)")
      .eq("consultation_id", id)
      .maybeSingle(),
    supabase.from("message_threads").select("id").eq("consultation_id", id).maybeSingle(),
  ]);

  const { data: messages } = thread
    ? await supabase
        .from("messages")
        .select("id, sender_uid, message_text, created_at")
        .eq("thread_id", thread.id)
        .order("created_at")
    : { data: [] };

  const patientName =
    patient?.display_name ||
    [patient?.first_name, patient?.last_name].filter(Boolean).join(" ") ||
    "Patient";

  const items = (prescription?.prescription_items ?? []).map((item) => ({
    medication_name: item.medication_name ?? "",
    dosage: item.strength ?? "",
    frequency: item.sig ?? "",
    duration: "",
    instructions: item.description ?? "",
  }));

  const completed = consultation.status === "completed";

  return <AppShell role="doctor" active="Active reviews" name={profile.full_name || "Doctor"}>
    <section className="case-header">
      <div>
        <Link className="back-link" href="/doctor/active-reviews">← Active reviews</Link>
        <span className="eyebrow">Clinical review</span>
        <h1>{consultation.primary_concern}</h1>
        <p>{patientName} · Submitted {consultation.submitted_at ? new Date(consultation.submitted_at).toLocaleDateString("en", { dateStyle: "long" }) : "recently"}</p>
      </div>
      <StatusBadge status={consultation.status} />
    </section>

    {query.notice && (
      <p className="page-notice" role="status">
        {query.notice === "claimed"
          ? "Consultation opened. This test case is now under review."
          : query.notice === "completed"
            ? "Consultation completed and the test patient was notified."
            : query.notice === "saved"
              ? "Clinical work saved securely."
              : "Message sent securely."}
      </p>
    )}

    {query.error && (
      <p className="page-error" role="alert">
        {query.error === "complete"
          ? "Add a clinical note, prescription, and patient message before completing."
          : "We couldn’t save that change. Please try again."}
      </p>
    )}

    <div className="doctor-review-layout">
      <aside className="patient-brief">
        <span className="eyebrow">Patient-provided information</span>
        <h2>{patientName}</h2>
        <dl>
          <div><dt>Primary concern</dt><dd>{consultation.primary_concern}</dd></div>
          <div><dt>Symptoms</dt><dd>{responses.symptoms || "Not provided"}</dd></div>
          <div><dt>Duration</dt><dd>{responses.symptom_duration || "Not provided"}</dd></div>
          <div><dt>Relevant context</dt><dd>{responses.relevant_context || "Not provided"}</dd></div>
          {patient?.date_of_birth && (
            <div>
              <dt>Date of birth</dt>
              <dd>{new Date(patient.date_of_birth).toLocaleDateString("en", { dateStyle: "long" })}</dd>
            </div>
          )}
        </dl>
      </aside>

      <div className="clinical-workspace">
        {completed ? (
          <section className="completed-panel">
            <CheckCircle2 />
            <span className="eyebrow">Finalized</span>
            <h2>This consultation is complete.</h2>
            <p>The treatment plan is now available to the paired test patient.</p>
            <div className="finalized-copy">
              <h3>Clinician message</h3>
              <p>{prescription?.clinician_message || prescription?.directions || "Treatment plan completed."}</p>
              <h3>Prescription</h3>
              {(prescription?.prescription_items ?? []).map((item, index) => (
                <p key={index}>
                  <strong>{item.medication_name}</strong>
                  {item.strength ? ` — ${item.strength}` : ""}
                  {item.description ? `, ${item.description}` : ""}
                </p>
              ))}
            </div>
          </section>
        ) : (
          <ClinicalForm
            consultationId={id}
            note={note?.assessment || note?.content || ""}
            clinicianMessage={prescription?.clinician_message || note?.plan || ""}
            items={items}
          />
        )}
      </div>
    </div>

    {!completed && (
      <section className="completion-bar">
        <div>
          <span className="eyebrow">Final review</span>
          <h2>Ready to send the treatment plan?</h2>
          <p>Completion locks the clinical plan and notifies the paired test patient.</p>
        </div>
        <form action={completeConsultation}>
          <input type="hidden" name="id" value={id} />
          <button className="button button-primary" type="submit">Complete consultation</button>
        </form>
      </section>
    )}

    {thread && (
      <MessageThread
        threadId={thread.id}
        currentUserId={user.id}
        messages={messages ?? []}
        returnTo={`/doctor/consultations/${id}`}
      />
    )}
  </AppShell>;
}
