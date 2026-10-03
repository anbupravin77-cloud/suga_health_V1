import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Medication details" };

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

export default async function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("consultation_prescription_option_items")
    .select("id, option_id, medication_catalog_id, medication_name, strength, dosage_form, frequency, duration, instructions, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  const { data: option } = await supabase
    .from("consultation_prescription_options")
    .select("id, consultation_id, title, description, finalized_at, status")
    .eq("id", item.option_id)
    .maybeSingle();

  if (!option) notFound();

  const { data: consultation } = await supabase
    .from("consultations")
    .select("id, primary_concern, status, completed_at, updated_at, selected_prescription_option_id")
    .eq("id", option.consultation_id)
    .maybeSingle();

  if (!consultation) notFound();

  const [{ data: doctorRows }, { data: selectedConsultations }] = await Promise.all([
    supabase.rpc("v1_get_consultation_doctor", {
      p_consultation_id: option.consultation_id,
    }),
    supabase
      .from("consultations")
      .select("id, primary_concern, completed_at, updated_at, selected_prescription_option_id")
      .eq("status", "completed")
      .not("selected_prescription_option_id", "is", null)
      .order("completed_at", { ascending: false }),
  ]);

  const selectedOptionIds = (selectedConsultations ?? [])
    .map((row) => row.selected_prescription_option_id)
    .filter((value): value is string => Boolean(value));

  let historyItems: Array<{
    id: string;
    option_id: string;
    medication_name: string;
    strength: string;
    frequency: string;
    duration: string;
    instructions: string | null;
    created_at: string;
  }> = [];

  if (selectedOptionIds.length) {
    let historyQuery = supabase
      .from("consultation_prescription_option_items")
      .select("id, option_id, medication_name, strength, frequency, duration, instructions, created_at")
      .in("option_id", selectedOptionIds)
      .order("created_at", { ascending: false });

    if (item.medication_catalog_id) {
      historyQuery = historyQuery.eq("medication_catalog_id", item.medication_catalog_id);
    } else {
      historyQuery = historyQuery
        .eq("medication_name", item.medication_name)
        .eq("strength", item.strength);
    }

    const { data } = await historyQuery;
    historyItems = data ?? [];
  }

  const consultationByOption = new Map<string, {
    id: string;
    primary_concern: string;
    completed_at: string | null;
    updated_at: string;
    selected_prescription_option_id: string | null;
  }>();

  for (const row of selectedConsultations ?? []) {
    if (row.selected_prescription_option_id) {
      consultationByOption.set(row.selected_prescription_option_id, row);
    }
  }

  const doctor = doctorRows?.[0] ?? null;
  const prescribedAt =
    option.finalized_at ||
    consultation.completed_at ||
    consultation.updated_at ||
    item.created_at;

  return (
    <div>
      <Link className="patient-back-link" href="/patient/medications">
        <ArrowLeft size={16} /> Back to medications
      </Link>

      <section className="patient-medication-detail-hero">
        <div className="patient-medication-icon xlarge"><Pill size={30} /></div>
        <div>
          <span className="patient-kicker">MEDICATION RECORD</span>
          <h1>{item.medication_name} {item.strength}</h1>
          <p>{item.frequency} · {item.duration} · {item.dosage_form}</p>
        </div>
        <span className="patient-prescription-tag is-latest">Prescription record</span>
      </section>

      <div className="patient-medication-detail-grid">
        <div className="patient-detail-main">
          <section className="patient-panel">
            <div className="patient-section-title">
              <div>
                <span className="patient-kicker">PRESCRIPTION DETAILS</span>
                <h2>{option.title}</h2>
              </div>
            </div>

            <div className="patient-medication-facts patient-medication-facts-grid">
              <div><Pill size={18} /><span>Frequency</span><strong>{item.frequency}</strong></div>
              <div><Clock3 size={18} /><span>Duration</span><strong>{item.duration}</strong></div>
              <div><CalendarDays size={18} /><span>Prescribed</span><strong>{new Date(prescribedAt).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
              <div><Stethoscope size={18} /><span>Clinician</span><strong>{doctor?.full_name || "Suga.Health clinician"}</strong></div>
            </div>

            <div className="patient-instruction-card">
              <h3>How to follow this prescription</h3>
              <p>{item.instructions || "Follow the dosage, frequency and duration provided by your clinician."}</p>
              <small>Do not change or stop prescribed medication without guidance from your treating clinician.</small>
            </div>
          </section>

          <section className="patient-panel">
            <div className="patient-section-title"><h2>Prescription history</h2></div>
            {historyItems.length ? (
              <div className="patient-history-timeline">
                {historyItems.map((historyItem, index) => {
                  const related = consultationByOption.get(historyItem.option_id);
                  return (
                    <article className={historyItem.id === id ? "is-current" : ""} key={historyItem.id}>
                      <span className="patient-history-dot" />
                      <div>
                        <div className="patient-history-heading">
                          <strong>{new Date(related?.completed_at || related?.updated_at || historyItem.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</strong>
                          {historyItem.id === id && <span>Viewing</span>}
                        </div>
                        <h3>{historyItem.medication_name} {historyItem.strength}</h3>
                        <p>{historyItem.frequency} · {historyItem.duration}</p>
                        {related && (
                          <Link href={`/patient/consultations/${related.id}`}>
                            {careTitle(related.primary_concern)} <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="patient-muted-copy">No earlier prescription records were found for this medication.</p>
            )}
          </section>
        </div>

        <aside className="patient-detail-side">
          <section className="patient-panel">
            <span className="patient-kicker">PRESCRIBED BY</span>
            <div className="patient-preview-doctor">
              <span className="patient-doctor-avatar">DR</span>
              <div>
                <strong>{doctor?.full_name || "Suga.Health clinician"}</strong>
                <span>{doctor?.specialization || doctor?.professional_title || "Clinical care team"}</span>
              </div>
            </div>
          </section>

          <Link className="patient-panel patient-related-link" href={`/patient/consultations/${consultation.id}`}>
            <CalendarDays size={20} />
            <div>
              <small>Related consultation</small>
              <strong>{careTitle(consultation.primary_concern)}</strong>
              <span>{new Date(consultation.completed_at || consultation.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</span>
            </div>
            <ArrowRight size={16} />
          </Link>

          <section className="patient-panel">
            <div className="patient-section-title"><h2>Record information</h2></div>
            <div className="patient-summary-list">
              <div><FileText size={18} /><span>Treatment plan</span><strong>{option.title}</strong></div>
              <div><Pill size={18} /><span>Form</span><strong>{item.dosage_form}</strong></div>
              <div><CalendarDays size={18} /><span>History entries</span><strong>{historyItems.length || 1}</strong></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
