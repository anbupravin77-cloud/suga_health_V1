import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  FilePenLine,
  MessageSquare,
  Pill,
  Stethoscope,
  Trash2,
} from "lucide-react";
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

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

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
    consultation_prescription_option_items: [...(option.consultation_prescription_option_items ?? [])]
      .sort((a, b) => a.position - b.position),
  }));

  return (
    <div>
      <Link className="patient-back-link" href="/patient/consultations">
        <ArrowLeft size={16} /> Back to consultations
      </Link>

      <section className="patient-detail-hero">
        <div>
          <span className="patient-kicker">CONSULTATION RECORD</span>
          <h1>{careTitle(consultation.primary_concern)}</h1>
          <p>
            Started {new Date(consultation.created_at).toLocaleDateString("en", { dateStyle: "long" })}
          </p>
        </div>
        <StatusBadge status={consultation.status} />
      </section>

      {query.notice && (
        <p className="page-notice" role="status">
          {query.notice === "submitted"
            ? "Consultation submitted successfully. Your care team will update this record as the review progresses."
            : query.notice === "saved"
              ? "Draft saved."
              : "Update saved."}
        </p>
      )}
      {query.error && <p className="page-error" role="alert">We couldn’t complete that action. Please try again.</p>}

      {consultation.status === "draft" ? (
        <section className="patient-draft-banner">
          <FilePenLine size={24} />
          <div>
            <strong>This consultation is still a private draft.</strong>
            <span>Continue the intake and submit it when you are ready for clinician review.</span>
          </div>
          <div>
            <Link className="patient-primary-button" href={`/patient/consultations/${id}/edit`}>Continue draft</Link>
            <form action={deleteDraft}>
              <input type="hidden" name="id" value={id} />
              <ActionButton className="patient-secondary-button" type="submit" pendingLabel="Deleting…">
                <Trash2 size={16} /> Delete
              </ActionButton>
            </form>
          </div>
        </section>
      ) : (
        <section className="patient-care-progress" aria-label="Consultation progress">
          <div className="is-done"><span><Check size={16} /></span><strong>Submitted</strong><small>Details received</small></div>
          <div className={["under_review", "completed"].includes(consultation.status) ? "is-done" : ""}>
            <span><Clock3 size={16} /></span><strong>Doctor review</strong><small>{consultation.status === "assigned" ? "Waiting to begin" : "Clinical review"}</small>
          </div>
          <div className={consultation.status === "completed" ? "is-done" : ""}>
            <span><Pill size={16} /></span><strong>Treatment</strong><small>{consultation.status === "completed" ? "Ready to review" : "Prepared after review"}</small>
          </div>
        </section>
      )}

      <nav className="patient-detail-tabs" aria-label="Consultation sections">
        <a href="#overview">Overview</a>
        <a href="#treatment">Treatment</a>
        <a href="#messages">Messages</a>
      </nav>

      <div className="patient-detail-grid">
        <div className="patient-detail-main">
          <section className="patient-panel" id="overview">
            <div className="patient-section-title">
              <div>
                <span className="patient-kicker">OVERVIEW</span>
                <h2>What you shared</h2>
              </div>
            </div>

            <div className="patient-concern-card">
              <Stethoscope size={21} />
              <div>
                <strong>Your concern and goal</strong>
                <p>{responses.care_goal || "No additional concern was provided."}</p>
              </div>
            </div>

            <dl className="patient-detail-definition-grid">
              <div><dt>Height</dt><dd>{displayHeight(responses)}</dd></div>
              <div><dt>Weight</dt><dd>{displayWeight(responses)}</dd></div>
              <div><dt>Age</dt><dd>{responses.age ?? "Not provided"}</dd></div>
              <div><dt>Sex</dt><dd>{responses.sex?.replaceAll("-", " ") || "Not provided"}</dd></div>
              <div className="wide"><dt>Medical screening</dt><dd>{responses.conditions?.length ? responses.conditions.join(", ") : "Not provided"}</dd></div>
              <div className="wide"><dt>Current medications</dt><dd>{responses.current_medications || "Not provided"}</dd></div>
              <div className="wide"><dt>Drug allergies</dt><dd>{responses.allergies || "Not provided"}</dd></div>
              <div className="wide"><dt>Medical history</dt><dd>{responses.medical_history || "Not provided"}</dd></div>
            </dl>
          </section>

          <section id="treatment">
            {consultation.status === "completed" && options.length > 0 ? (
              <TreatmentOptions
                options={options}
                selectedId={consultation.selected_prescription_option_id ?? null}
              />
            ) : (
              <div className="patient-panel">
                <div className="patient-empty-simple">
                  <Pill size={24} />
                  <div>
                    <strong>
                      {consultation.status === "completed"
                        ? "Treatment plan is being prepared"
                        : "Treatment will appear here after review"}
                    </strong>
                    <span>Your clinician’s patient-facing treatment options remain attached to this consultation.</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section id="messages">
            {thread ? (
              <MessageThread
                threadId={thread.id}
                currentUserId={identity.id}
                messages={messages ?? []}
                enabled={Boolean(consultation.assigned_to)}
              />
            ) : (
              <div className="patient-panel">
                <div className="patient-empty-simple">
                  <MessageSquare size={24} />
                  <div>
                    <strong>Messaging is not open yet</strong>
                    <span>A private consultation thread opens when the workflow assigns a clinician.</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="patient-detail-side">
          <section className="patient-panel patient-clinician-card">
            <span className="patient-kicker">YOUR CLINICIAN</span>
            <div className="patient-preview-doctor">
              <span className="patient-doctor-avatar">DR</span>
              <div>
                <strong>{doctor?.full_name || (consultation.assigned_to ? "Assigned clinician" : "Awaiting assignment")}</strong>
                <span>{doctor?.specialization || doctor?.professional_title || "Suga.Health clinical team"}</span>
              </div>
            </div>
          </section>

          <section className="patient-panel">
            <div className="patient-section-title"><h2>Consultation details</h2></div>
            <div className="patient-summary-list">
              <div><CalendarDays size={18} /><span>Created</span><strong>{new Date(consultation.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
              <div><Clock3 size={18} /><span>Last updated</span><strong>{new Date(consultation.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
              <div><ClipboardList size={18} /><span>Record ID</span><strong>{consultation.id.slice(0, 8).toUpperCase()}</strong></div>
            </div>
          </section>

          {consultation.selected_prescription_option_id && (
            <Link className="patient-panel patient-related-link" href="/patient/medications">
              <Pill size={20} />
              <div>
                <strong>View your medications</strong>
                <span>See medication details and prescription history.</span>
              </div>
              <ArrowLeft className="patient-rotate-arrow" size={16} />
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
