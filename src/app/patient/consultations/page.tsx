import Link from "next/link";
import { ArrowRight, CalendarDays, Search } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "My consultations" };

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

const filters = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "drafts", label: "Drafts" },
];

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; selected?: string }>;
}) {
  const query = await searchParams;
  const status = ["ongoing", "completed", "drafts"].includes(query.status || "")
    ? query.status!
    : "all";
  const search = (query.q || "").trim();
  const supabase = await createClient();

  let consultationQuery = supabase
    .from("consultations")
    .select("id, primary_concern, status, created_at, updated_at, completed_at, selected_prescription_option_id")
    .order("updated_at", { ascending: false });

  if (status === "completed") consultationQuery = consultationQuery.eq("status", "completed");
  if (status === "drafts") consultationQuery = consultationQuery.eq("status", "draft");
  if (status === "ongoing") {
    consultationQuery = consultationQuery.in("status", ["submitted", "assigned", "under_review"]);
  }
  if (search) consultationQuery = consultationQuery.ilike("primary_concern", `%${search}%`);

  const { data: consultationRows } = await consultationQuery;
  const data = consultationRows ?? [];
  const selectedId =
    data.find((item) => item.id === query.selected)?.id ||
    data[0]?.id ||
    null;

  type ConsultationDetail = {
    id: string;
    primary_concern: string;
    status: string;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    assigned_to: string | null;
    selected_prescription_option_id: string | null;
    responses: Record<string, unknown> | null;
  };

  let selected: ConsultationDetail | null = null;
  let doctor: { full_name: string | null; professional_title: string | null; specialization: string | null } | null = null;
  let treatment: {
    title: string;
    consultation_prescription_option_items: Array<{
      id: string;
      medication_name: string;
      strength: string;
      frequency: string;
      duration: string;
    }>;
  } | null = null;

  if (selectedId) {
    const { data: selectedRow } = await supabase
      .from("consultations")
      .select("id, primary_concern, status, created_at, updated_at, completed_at, assigned_to, selected_prescription_option_id, responses")
      .eq("id", selectedId)
      .single();

    selected = selectedRow as ConsultationDetail | null;

    if (selected?.assigned_to) {
      const { data: doctors } = await supabase.rpc("v1_get_consultation_doctor", {
        p_consultation_id: selected.id,
      });
      doctor = doctors?.[0] ?? null;
    }

    if (selected?.selected_prescription_option_id) {
      const { data: option } = await supabase
        .from("consultation_prescription_options")
        .select("title, consultation_prescription_option_items(id, medication_name, strength, frequency, duration, position)")
        .eq("id", selected.selected_prescription_option_id)
        .maybeSingle();
      treatment = option
        ? {
            title: option.title,
            consultation_prescription_option_items: [...(option.consultation_prescription_option_items ?? [])]
              .sort((a, b) => a.position - b.position),
          }
        : null;
    }
  }

  const responses = (selected?.responses ?? {}) as {
    care_goal?: string;
    current_medications?: string;
    allergies?: string;
  };

  function hrefFor(nextStatus: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (search) params.set("q", search);
    const suffix = params.toString();
    return `/patient/consultations${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div>
      <section className="patient-page-heading patient-heading-with-action">
        <div>
          <h1>My Consultations</h1>
          <p>View your complete consultation history and follow each stage of care.</p>
        </div>
        <Link className="patient-primary-button" href="/patient/consultations/new">
          New Consultation <ArrowRight size={16} />
        </Link>
      </section>

      <div className="patient-consultation-workspace">
        <div className="patient-consultation-index">
          <div className="patient-filter-tabs">
            {filters.map((filter) => (
              <Link
                className={status === filter.key ? "is-active" : ""}
                href={hrefFor(filter.key)}
                key={filter.key}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <form className="patient-search-form" action="/patient/consultations">
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            <Search size={17} />
            <input name="q" defaultValue={search} placeholder="Search consultations…" />
            <button type="submit">Search</button>
          </form>

          {data.length ? (
            <div className="patient-consultation-list">
              {data.map((item) => {
                const params = new URLSearchParams();
                if (status !== "all") params.set("status", status);
                if (search) params.set("q", search);
                params.set("selected", item.id);
                return (
                  <Link
                    href={`/patient/consultations?${params.toString()}`}
                    className={selectedId === item.id ? "is-selected" : ""}
                    key={item.id}
                  >
                    <div className="patient-date-tile">
                      <strong>{new Date(item.updated_at).getDate().toString().padStart(2, "0")}</strong>
                      <span>{new Date(item.updated_at).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="patient-record-copy">
                      <strong>{careTitle(item.primary_concern)}</strong>
                      <span>
                        {item.status === "draft"
                          ? "Saved draft. Continue when ready."
                          : item.status === "completed"
                            ? "Consultation completed and kept in your history."
                            : "Your care team is working on this consultation."}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                    <ArrowRight size={16} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="patient-empty-simple">
              <CalendarDays size={24} />
              <div>
                <strong>No matching consultations</strong>
                <span>Try another filter or start a new consultation.</span>
              </div>
            </div>
          )}
        </div>

        <aside className="patient-consultation-preview">
          {selected ? (
            <>
              <div className="patient-preview-header">
                <div>
                  <span>{new Date(selected.updated_at).toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <h2>{careTitle(selected.primary_concern)}</h2>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="patient-preview-doctor">
                <span className="patient-doctor-avatar">DR</span>
                <div>
                  <small>Care clinician</small>
                  <strong>{doctor?.full_name || (selected.assigned_to ? "Assigned clinician" : "Awaiting assignment")}</strong>
                  <span>{doctor?.specialization || doctor?.professional_title || "Suga.Health clinical team"}</span>
                </div>
              </div>

              <div className="patient-preview-section">
                <h3>Your concern</h3>
                <p>{responses.care_goal || "Your submitted consultation details are stored securely with this record."}</p>
              </div>

              <div className="patient-preview-section">
                <h3>Treatment</h3>
                {treatment ? (
                  <>
                    <strong>{treatment.title}</strong>
                    <ul>
                      {treatment.consultation_prescription_option_items.map((item) => (
                        <li key={item.id}>{item.medication_name} {item.strength} · {item.frequency}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    {selected.status === "completed"
                      ? "No treatment option has been selected for this consultation."
                      : "Treatment information will appear after the clinician completes the review."}
                  </p>
                )}
              </div>

              <div className="patient-preview-facts">
                <div><span>Started</span><strong>{new Date(selected.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
                <div><span>Updated</span><strong>{new Date(selected.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</strong></div>
              </div>

              <Link className="patient-primary-button patient-full-width" href={`/patient/consultations/${selected.id}`}>
                View Full Details <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <div className="patient-empty-simple">
              <CalendarDays size={24} />
              <div>
                <strong>Select a consultation</strong>
                <span>The details will appear here.</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
