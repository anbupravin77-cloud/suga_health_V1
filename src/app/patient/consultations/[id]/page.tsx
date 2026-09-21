import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock3, FilePenLine, Pill } from "lucide-react";
import { deleteDraft } from "@/app/actions";
import { MessageThread } from "@/components/care/message-thread";
import { StatusBadge } from "@/components/care/status-badge";
import { TreatmentOptions, type PatientTreatmentOption } from "@/components/care/treatment-options";
import { ActionButton } from "@/components/ui/action-button";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Responses = {
  height_unit?: string;
  height_cm_input?: number | null;
  height_feet?: number | null;
  height_inches?: number | null;
  height_cm?: number | null;
  weight_unit?: string;
  weight_value?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  sex?: string;
  conditions?: string[];
  current_medications?: string;
  allergies?: string;
  medical_history?: string;
  care_goal?: string;
};

function displayHeight(responses: Responses) {
  if (responses.height_unit === "ftin" && responses.height_feet) {
    return `${responses.height_feet} ft ${responses.height_inches ?? 0} in`;
  }
  return responses.height_cm ? `${responses.height_cm} cm` : "Not provided";
}

function displayWeight(responses: Responses) {
  if (responses.weight_value) {
    return `${responses.weight_value} ${responses.weight_unit === "lb" ? "lb" : "kg"}`;
  }
  return responses.weight_kg ? `${responses.weight_kg} kg` : "Not provided";
}

export default async function PatientConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const identity = await requireIdentity();
  const supabase = await createClient();

  const { data: consultation } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultation) notFound();

  const responses = (consultation.responses ?? {}) as Responses;

  const [{ data: thread }, { data: treatmentOptions }, { data: doctorRows }] = await Promise.all([
    supabase.from("message_threads").select("id").eq("consultation_id", id).maybeSingle(),
    consultation.status === "completed"
      ? supabase
          .from("consultation_prescription_options")
          .select("id, position, title, cost_tier, description, estimated_price_inr, consultation_prescription_option_items(id, position, medication_name, strength, dosage_form, frequency, duration, instructions)")
          .eq("consultation_id", id)
          .eq("status", "finalized")
          .order("position")
      : Promise.resolve({ data: [] }),
    consultation.assigned_to
      ? supabase.rpc("v1_get_consultation_doctor", { p_consultation_id: id })
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
  const options = ((treatmentOptions ?? []) as PatientTreatmentOption[]).map((option) => ({
    ...option,
    consultation_prescription_option_items: [...(option.consultation_prescription_option_items ?? [])].sort((a, b) => a.position - b.position),
  }));

  return (
    <>
      <section className="case-header">
        <div>
          <Link className="back-link" href="/patient/consultations">← All consultations</Link>
          <span className="eyebrow">Consultation</span>
          <h1>{consultation.primary_concern.replaceAll("_", " ")}</h1>
          <p>Started {new Date(consultation.created_at).toLocaleDateString("en", { dateStyle: "long" })}</p>
        </div>
        <StatusBadge status={consultation.status} />
      </section>

      {query.notice && (
        <p className="page-notice" role="status">
          {query.notice === "submitted"
            ? "Consultation submitted. You’ll receive updates here as the review progresses."
            : query.notice === "saved"
              ? "Draft saved."
              : "Update saved."}
        </p>
      )}
      {query.error && <p className="page-error" role="alert">We couldn’t complete that action. Please try again.</p>}

      {consultation.status === "draft" ? (
        <section className="case-action-panel">
          <FilePenLine />
          <div>
            <h2>Your draft is private</h2>
            <p>Continue the six-step intake when you’re ready. A doctor cannot review it until you submit.</p>
          </div>
          <div className="case-actions">
            <Link className="button button-primary motion-cta" href={`/patient/consultations/${id}/edit`}>Continue draft</Link>
            <form action={deleteDraft}>
              <input type="hidden" name="id" value={id} />
              <ActionButton className="button button-secondary" type="submit" pendingLabel="Deleting…">Delete</ActionButton>
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
            <Pill /><span>Treatment choices ready</span>
          </div>
        </section>
      )}

      <div className="case-layout">
        <div>
          <section className="detail-card intake-summary-card">
            <span className="eyebrow">What you shared</span>
            <h2>{consultation.primary_concern.replaceAll("_", " ")}</h2>
            <dl>
              <div><dt>Height</dt><dd>{displayHeight(responses)}</dd></div>
              <div><dt>Weight</dt><dd>{displayWeight(responses)}</dd></div>
              <div><dt>Age</dt><dd>{responses.age ?? "Not provided"}</dd></div>
              <div><dt>Sex</dt><dd>{responses.sex?.replaceAll("-", " ") || "Not provided"}</dd></div>
              <div><dt>Medical screening</dt><dd>{responses.conditions?.length ? responses.conditions.join("\n") : "Not provided"}</dd></div>
              <div><dt>Current medications</dt><dd>{responses.current_medications || "Not provided"}</dd></div>
              <div><dt>Drug allergies</dt><dd>{responses.allergies || "Not provided"}</dd></div>
              <div><dt>Medical history</dt><dd>{responses.medical_history || "Not provided"}</dd></div>
              <div><dt>Goal / concern</dt><dd>{responses.care_goal || "Not provided"}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="case-aside">
          <div className="aside-card">
            <span className="eyebrow">Care status</span>
            <h3>
              {consultation.status === "completed"
                ? "Your doctor finished the review"
                : consultation.status === "under_review"
                  ? "Your doctor is reviewing this case"
                  : consultation.assigned_to
                    ? "Assigned for doctor review"
                    : "Waiting for a doctor"}
            </h3>
            <p>
              {doctor
                ? `${doctor.professional_title || "Doctor"} ${doctor.full_name || ""}`
                : "You’ll see your clinician here when one is assigned."}
            </p>
          </div>
        </aside>
      </div>

      {consultation.status === "completed" && options.length > 0 && (
        <TreatmentOptions
          options={options}
          selectedId={consultation.selected_prescription_option_id ?? null}
        />
      )}

      {consultation.status === "completed" && options.length === 0 && (
        <section className="dashboard-section">
          <div className="empty-state"><Pill /><div><h3>Treatment plan is being prepared</h3><p>The review is complete, but no selectable prescription option is available yet.</p></div></div>
        </section>
      )}

      {thread && (
        <MessageThread
          threadId={thread.id}
          currentUserId={identity.id}
          messages={messages ?? []}
          enabled={Boolean(consultation.assigned_to)}
        />
      )}
    </>
  );
}
