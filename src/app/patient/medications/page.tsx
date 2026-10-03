import Link from "next/link";
import { ArrowRight, CalendarDays, Pill, Search, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Medications" };

type MedicationRow = {
  id: string;
  medication_catalog_id: string | null;
  medication_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  position: number;
  optionId: string;
  optionTitle: string;
  consultationId: string;
  prescribedAt: string;
  primaryConcern: string;
};

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

function medKey(item: MedicationRow) {
  return item.medication_catalog_id || `${item.medication_name.toLowerCase()}|${item.strength.toLowerCase()}`;
}

export default async function MedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string; selected?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q || "").trim().toLowerCase();
  const view = params.view === "latest" || params.view === "history" ? params.view : "all";
  const supabase = await createClient();

  const { data: consultationRows } = await supabase
    .from("consultations")
    .select("id, primary_concern, selected_prescription_option_id, completed_at, updated_at")
    .eq("status", "completed")
    .not("selected_prescription_option_id", "is", null)
    .order("completed_at", { ascending: false });

  const consultations = consultationRows ?? [];
  const consultationMap = new Map(
    consultations.map((consultation) => [consultation.id, consultation]),
  );
  const selectedOptionIds = consultations
    .map((consultation) => consultation.selected_prescription_option_id)
    .filter((id): id is string => Boolean(id));

  let medications: MedicationRow[] = [];

  if (selectedOptionIds.length) {
    const { data: optionRows } = await supabase
      .from("consultation_prescription_options")
      .select("id, consultation_id, title, finalized_at, consultation_prescription_option_items(id, medication_catalog_id, medication_name, strength, dosage_form, frequency, duration, instructions, position)")
      .in("id", selectedOptionIds);

    const options = optionRows ?? [];
    medications = options.flatMap((option) => {
      const consultation = consultationMap.get(option.consultation_id);
      return (option.consultation_prescription_option_items ?? []).map((item) => ({
        id: item.id,
        medication_catalog_id: item.medication_catalog_id,
        medication_name: item.medication_name,
        strength: item.strength,
        dosage_form: item.dosage_form,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
        position: item.position,
        optionId: option.id,
        optionTitle: option.title,
        consultationId: option.consultation_id,
        prescribedAt: option.finalized_at || consultation?.completed_at || consultation?.updated_at || new Date(0).toISOString(),
        primaryConcern: consultation?.primary_concern || "consultation",
      }));
    });
  }

  medications.sort((a, b) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime());

  const latestIds = new Set<string>();
  const seen = new Set<string>();
  for (const item of medications) {
    const key = medKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      latestIds.add(item.id);
    }
  }

  const filtered = medications.filter((item) => {
    const matchesSearch =
      !search ||
      [item.medication_name, item.strength, item.primaryConcern, item.optionTitle]
        .join(" ")
        .toLowerCase()
        .includes(search);
    if (!matchesSearch) return false;
    if (view === "latest") return latestIds.has(item.id);
    if (view === "history") return !latestIds.has(item.id);
    return true;
  });

  const selectedId =
    filtered.find((item) => item.id === params.selected)?.id ||
    filtered[0]?.id ||
    null;
  const selected = medications.find((item) => item.id === selectedId) || null;

  let doctor: { full_name: string | null; professional_title: string | null; specialization: string | null } | null = null;
  if (selected) {
    const { data } = await supabase.rpc("v1_get_consultation_doctor", {
      p_consultation_id: selected.consultationId,
    });
    doctor = data?.[0] ?? null;
  }

  function tabHref(next: string) {
    const nextParams = new URLSearchParams();
    if (next !== "all") nextParams.set("view", next);
    if (params.q) nextParams.set("q", params.q);
    const suffix = nextParams.toString();
    return `/patient/medications${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div>
      <section className="patient-page-heading">
        <div>
          <h1>Medications</h1>
          <p>See the medicines included in your selected treatment plans and your prescription history.</p>
        </div>
      </section>

      <div className="patient-medication-workspace">
        <div className="patient-medication-index">
          <div className="patient-filter-tabs">
            <Link className={view === "all" ? "is-active" : ""} href={tabHref("all")}>All prescriptions</Link>
            <Link className={view === "latest" ? "is-active" : ""} href={tabHref("latest")}>Latest</Link>
            <Link className={view === "history" ? "is-active" : ""} href={tabHref("history")}>History</Link>
          </div>

          <form className="patient-search-form" action="/patient/medications">
            {view !== "all" && <input type="hidden" name="view" value={view} />}
            <Search size={17} />
            <input name="q" defaultValue={params.q || ""} placeholder="Search medication or care area…" />
            <button type="submit">Search</button>
          </form>

          {filtered.length ? (
            <div className="patient-medication-list">
              {filtered.map((item) => {
                const hrefParams = new URLSearchParams();
                if (view !== "all") hrefParams.set("view", view);
                if (params.q) hrefParams.set("q", params.q);
                hrefParams.set("selected", item.id);
                return (
                  <Link
                    key={item.id}
                    href={`/patient/medications?${hrefParams.toString()}`}
                    className={item.id === selectedId ? "is-selected" : ""}
                  >
                    <span className="patient-medication-icon"><Pill size={20} /></span>
                    <span className="patient-record-copy">
                      <strong>{item.medication_name} {item.strength}</strong>
                      <span>{item.frequency} · {item.duration}</span>
                      <small>{careTitle(item.primaryConcern)} · {new Date(item.prescribedAt).toLocaleDateString("en", { dateStyle: "medium" })}</small>
                    </span>
                    <span className={latestIds.has(item.id) ? "patient-prescription-tag is-latest" : "patient-prescription-tag"}>
                      {latestIds.has(item.id) ? "Latest" : "Previous"}
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="patient-empty-simple">
              <Pill size={24} />
              <div>
                <strong>No medication records found</strong>
                <span>Medicines appear here after you select a clinician-prepared treatment option.</span>
              </div>
            </div>
          )}
        </div>

        <aside className="patient-medication-preview">
          {selected ? (
            <>
              <div className="patient-medication-title">
                <span className="patient-medication-icon large"><Pill size={26} /></span>
                <div>
                  <h2>{selected.medication_name} {selected.strength}</h2>
                  <p>{selected.frequency} · {selected.duration}</p>
                </div>
                <span className={latestIds.has(selected.id) ? "patient-prescription-tag is-latest" : "patient-prescription-tag"}>
                  {latestIds.has(selected.id) ? "Latest prescription" : "Previous prescription"}
                </span>
              </div>

              <div className="patient-detail-tabs patient-medication-tabs">
                <span className="is-current">Overview</span>
                <Link href={`/patient/medications/${selected.id}`}>Full history</Link>
              </div>

              <div className="patient-medication-facts">
                <div><Stethoscope size={18} /><span>Prescribed by</span><strong>{doctor?.full_name || "Suga.Health clinician"}</strong></div>
                <div><CalendarDays size={18} /><span>Prescribed on</span><strong>{new Date(selected.prescribedAt).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
                <div><Pill size={18} /><span>Dosage form</span><strong>{selected.dosage_form}</strong></div>
              </div>

              <section className="patient-instruction-card">
                <h3>Dosage & instructions</h3>
                <p><strong>Frequency:</strong> {selected.frequency}</p>
                <p><strong>Duration:</strong> {selected.duration}</p>
                <p>{selected.instructions || "Follow the instructions provided by your clinician for this prescription."}</p>
              </section>

              <Link className="patient-related-consultation" href={`/patient/consultations/${selected.consultationId}`}>
                <CalendarDays size={19} />
                <span>
                  <small>Related consultation</small>
                  <strong>{careTitle(selected.primaryConcern)}</strong>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="patient-primary-button patient-full-width" href={`/patient/medications/${selected.id}`}>
                View Medication History <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <div className="patient-empty-simple">
              <Pill size={24} />
              <div>
                <strong>Select a medication</strong>
                <span>Prescription details will appear here.</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
