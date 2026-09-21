import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock3, FilePenLine, Pill } from "lucide-react";
import { deleteDraft } from "@/app/actions";
import { MessageThread } from "@/components/care/message-thread";
import { StatusBadge } from "@/components/care/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Responses = {
  symptoms?: string;
  symptom_duration?: string | null;
  relevant_context?: string | null;
};

export default async function PatientConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { user } = await requireRole("patient");
  const supabase = await createClient();

  const { data: consultation } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultation) notFound();

  const responses = (consultation.responses ?? {}) as Responses;

  const [{ data: thread }, { data: prescription }, { data: doctorRows }] = await Promise.all([
    supabase.from("message_threads").select("id").eq("consultation_id", id).maybeSingle(),
    consultation.status === "completed"
      ? supabase
          .from("prescriptions")
          .select("id, clinician_message, directions, prescription_items(medication_name, strength, dosage_form, quantity, sig, description, is_recommended)")
          .eq("consultation_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    consultation.assigned_to
      ? supabase.rpc("v1_test_get_consultation_doctor", { p_consultation_id: id })
      : Promise.resolve({ data: [] }),
  ]);

  const { data: messages } = thread
    ? await supabase
        .from("messages")
        .select("id, sender_uid, message_text, created_at")
        .eq("thread_id", thread.id)
        .order("created_at")
    : { data: [] };

  const doctor = doctorRows?.[0];
  const items = prescription?.prescription_items ?? [];

  return <>
    <section className="case-header">
      <div>
        <Link className="back-link" href="/patient/consultations">← All consultations</Link>
        <span className="eyebrow">Consultation</span>
        <h1>{consultation.primary_concern}</h1>
        <p>Started {new Date(consultation.created_at).toLocaleDateString("en", { dateStyle: "long" })}</p>
      </div>
      <StatusBadge status={consultation.status} />
    </section>

    {query.notice && (
      <p className="page-notice" role="status">
        {query.notice === "submitted"
          ? "Consultation submitted successfully."
          : query.notice === "saved"
            ? "Draft saved."
            : "Message sent securely."}
      </p>
    )}
    {query.error && <p className="page-error" role="alert">We couldn’t complete that action. Please try again.</p>}

    {consultation.status === "draft" ? (
      <section className="case-action-panel">
        <FilePenLine />
        <div>
          <h2>Your draft is private</h2>
          <p>Continue editing when you’re ready. A doctor cannot see it until you submit.</p>
        </div>
        <div className="case-actions">
          <Link className="button button-primary" href={`/patient/consultations/${id}/edit`}>Continue draft</Link>
          <form action={deleteDraft}>
            <input type="hidden" name="id" value={id} />
            <button className="button button-secondary" type="submit">Delete</button>
          </form>
        </div>
      </section>
    ) : (
      <section className="care-progress">
        <div className="progress-step done"><Check /><span>Submitted</span></div>
        <div className={`progress-step ${["under_review", "completed"].includes(consultation.status) ? "done" : ""}`}>
          <Clock3 /><span>Doctor review</span>
        </div>
        <div className={`progress-step ${consultation.status === "completed" ? "done" : ""}`}>
          <Pill /><span>Treatment ready</span>
        </div>
      </section>
    )}

    <div className="case-layout">
      <div>
        <section className="detail-card">
          <span className="eyebrow">What you shared</span>
          <h2>{consultation.primary_concern}</h2>
          <dl>
            <div><dt>Symptoms</dt><dd>{responses.symptoms || "Not provided"}</dd></div>
            <div><dt>Duration</dt><dd>{responses.symptom_duration || "Not provided"}</dd></div>
            <div><dt>Relevant context</dt><dd>{responses.relevant_context || "Not provided"}</dd></div>
          </dl>
        </section>

        {consultation.status === "completed" && (
          <section className="treatment-summary">
            <span className="eyebrow">Your treatment plan</span>
            <h2>Guidance from {doctor?.full_name || "your doctor"}</h2>
            <blockquote>{prescription?.clinician_message || prescription?.directions || "Your treatment plan is ready."}</blockquote>
            <h3>Prescription</h3>
            {items.length ? (
              <div className="medication-list">
                {items.map((item, index) => (
                  <article key={`${item.medication_name}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h4>{item.medication_name}</h4>
                      <p>{item.strength || "As prescribed"}{item.dosage_form ? ` · ${item.dosage_form}` : ""}</p>
                      {(item.description || item.sig) && <small>{item.description || item.sig}</small>}
                    </div>
                  </article>
                ))}
              </div>
            ) : <p>No medication was added.</p>}
            <p className="treatment-meta">
              Completed {consultation.completed_at ? new Date(consultation.completed_at).toLocaleDateString("en", { dateStyle: "long" }) : "recently"}
              {doctor?.specialization ? ` · ${doctor.specialization}` : ""}
            </p>
          </section>
        )}
      </div>

      <aside className="case-aside">
        <div className="aside-card">
          <span className="eyebrow">Care status</span>
          <h3>
            {consultation.status === "completed"
              ? "Your plan is ready"
              : consultation.status === "under_review"
                ? "Your doctor is reviewing this case"
                : "Assigned to your test doctor"}
          </h3>
          <p>
            {doctor
              ? `${doctor.professional_title || "Doctor"} ${doctor.full_name || ""}`
              : "The paired test doctor will review this consultation."}
          </p>
        </div>
      </aside>
    </div>

    {thread && (
      <MessageThread
        threadId={thread.id}
        currentUserId={user.id}
        messages={messages ?? []}
        returnTo={`/patient/consultations/${id}`}
        enabled={Boolean(consultation.assigned_to)}
      />
    )}
  </>;
}
