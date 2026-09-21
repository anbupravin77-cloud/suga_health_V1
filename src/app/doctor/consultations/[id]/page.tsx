import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Pill } from "lucide-react";
import { claimConsultation } from "@/app/actions";
import { ClinicalForm, type ExistingTreatmentOption, type MedicationCatalogItem } from "@/components/care/clinical-form";
import { MessageThread } from "@/components/care/message-thread";
import { StatusBadge } from "@/components/care/status-badge";
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

export default async function DoctorConsultationPage({
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

  const [
    { data: patient },
    { data: note },
    { data: treatmentOptions },
    { data: catalog },
    { data: thread },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, first_name, last_name, date_of_birth, phone_number")
      .eq("id", consultation.patient_id)
      .maybeSingle(),
    supabase
      .from("clinical_notes")
      .select("content, assessment, plan")
      .eq("consultation_id", id)
      .eq("doctor_id", identity.id)
      .maybeSingle(),
    supabase
      .from("consultation_prescription_options")
      .select("id, position, title, cost_tier, description, estimated_price_inr, status, consultation_prescription_option_items(id, medication_catalog_id, position, medication_name, strength, dosage_form, frequency, duration, instructions)")
      .eq("consultation_id", id)
      .order("position"),
    supabase
      .from("medication_catalog")
      .select("id, treatment_area, display_name, generic_name, strength, dosage_form, description")
      .in("treatment_area", [consultation.primary_concern, "general"])
      .eq("active", true)
      .order("sort_order"),
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

  const options = ((treatmentOptions ?? []) as ExistingTreatmentOption[]).map((option) => ({
    ...option,
    consultation_prescription_option_items: [...(option.consultation_prescription_option_items ?? [])].sort((a, b) => {
      const aPosition = "position" in a ? Number(a.position) : 0;
      const bPosition = "position" in b ? Number(b.position) : 0;
      return aPosition - bPosition;
    }),
  }));

  const completed = consultation.status === "completed";

  return (
    <>
      <section className="case-header">
        <div>
          <Link className="back-link" href="/doctor/active-reviews">← Active reviews</Link>
          <span className="eyebrow">Clinical review</span>
          <h1>{consultation.primary_concern.replaceAll("_", " ")}</h1>
          <p>{patientName} · Submitted {consultation.submitted_at ? new Date(consultation.submitted_at).toLocaleDateString("en", { dateStyle: "long" }) : "recently"}</p>
        </div>
        <StatusBadge status={consultation.status} />
      </section>

      {query.notice && (
        <p className="page-notice" role="status">
          {query.notice === "claimed"
            ? "Consultation opened. The patient has been notified that review started."
            : query.notice === "completed"
              ? "Consultation completed. Treatment choices are now available in the Patient Portal."
              : "Clinical work updated."}
        </p>
      )}
      {query.error && <p className="page-error" role="alert">We couldn’t complete that action. Review the clinical work and try again.</p>}

      {consultation.status === "assigned" && (
        <section className="case-action-panel">
          <CheckCircle2 />
          <div><h2>Ready to begin review?</h2><p>Starting the review notifies the patient and opens the clinical workspace.</p></div>
          <form action={claimConsultation}>
            <input type="hidden" name="id" value={id} />
            <ActionButton className="button button-primary" type="submit" pendingLabel="Starting review…">Begin review</ActionButton>
          </form>
        </section>
      )}

      <div className="doctor-review-layout">
        <aside className="patient-brief">
          <span className="eyebrow">Patient-provided information</span>
          <h2>{patientName}</h2>
          <dl>
            <div><dt>Care area</dt><dd>{consultation.primary_concern.replaceAll("_", " ")}</dd></div>
            <div><dt>Height</dt><dd>{displayHeight(responses)}</dd></div>
            <div><dt>Weight</dt><dd>{displayWeight(responses)}</dd></div>
            <div><dt>Age</dt><dd>{responses.age ?? "Not provided"}</dd></div>
            <div><dt>Sex</dt><dd>{responses.sex?.replaceAll("-", " ") || "Not provided"}</dd></div>
            <div><dt>Medical screening</dt><dd>{responses.conditions?.length ? responses.conditions.join("\n") : "Not provided"}</dd></div>
            <div><dt>Current medications</dt><dd>{responses.current_medications || "Not provided"}</dd></div>
            <div><dt>Drug allergies</dt><dd>{responses.allergies || "Not provided"}</dd></div>
            <div><dt>Medical history</dt><dd>{responses.medical_history || "Not provided"}</dd></div>
            <div><dt>Patient goal / concern</dt><dd>{responses.care_goal || "Not provided"}</dd></div>
          </dl>
        </aside>

        <div className="clinical-workspace">
          {completed ? (
            <section className="completed-panel completed-options-panel">
              <CheckCircle2 />
              <span className="eyebrow">Finalized</span>
              <h2>Consultation complete.</h2>
              <p>The patient can now compare and select from the treatment options below.</p>
              <div className="doctor-final-options">
                {options.map((option) => (
                  <article key={option.id}>
                    <header>
                      <div><span>{option.cost_tier}</span><h3>{option.title}</h3></div>
                      <strong>{option.estimated_price_inr == null ? "Price pending" : `₹${Number(option.estimated_price_inr).toLocaleString("en-IN")}`}</strong>
                    </header>
                    <p>{option.description}</p>
                    <div>
                      {option.consultation_prescription_option_items.map((item) => (
                        <span className="doctor-final-medication" key={item.id}>
                          <Pill size={14} /> {item.medication_name} · {item.strength} · {item.frequency} · {item.duration}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : consultation.status === "under_review" ? (
            <ClinicalForm
              consultationId={id}
              treatmentArea={consultation.primary_concern}
              note={note?.assessment || note?.content || ""}
              options={options.filter((option) => option.status === "draft")}
              catalog={(catalog ?? []) as MedicationCatalogItem[]}
            />
          ) : (
            <section className="completed-panel">
              <span className="eyebrow">Review not started</span>
              <h2>Begin the review to unlock clinical work.</h2>
              <p>The consultation is assigned to you, but clinical editing remains locked until you start the review.</p>
            </section>
          )}
        </div>
      </div>

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
