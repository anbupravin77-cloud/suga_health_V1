import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Search, Stethoscope } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { doctorInitials, patientCareTitle } from "@/components/patient/patient-conversation-card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "My consultations" };

const filters = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "drafts", label: "Drafts" },
];

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const query = await searchParams;
  const status = ["ongoing", "completed", "drafts"].includes(query.status || "")
    ? query.status!
    : "all";
  const search = (query.q || "").trim();
  const supabase = await createClient();

  let consultationQuery = supabase
    .from("consultations")
    .select("id, primary_concern, status, created_at, updated_at, assigned_to")
    .order("updated_at", { ascending: false });

  if (status === "completed") consultationQuery = consultationQuery.eq("status", "completed");
  if (status === "drafts") consultationQuery = consultationQuery.eq("status", "draft");
  if (status === "ongoing") {
    consultationQuery = consultationQuery.in("status", ["submitted", "assigned", "under_review"]);
  }
  if (search) consultationQuery = consultationQuery.ilike("primary_concern", "%" + search + "%");

  const { data: consultationRows } = await consultationQuery;
  const consultations = consultationRows ?? [];

  // Consultations remain patient-scoped. Look up assigned clinicians only through
  // the existing patient-authorized RPC rather than querying private staff profiles.
  const cards = await Promise.all(consultations.map(async (consultation) => {
    if (!consultation.assigned_to) {
      return { ...consultation, doctorName: "Awaiting doctor assignment", assigned: false };
    }

    const { data: doctorRows } = await supabase.rpc("v1_get_consultation_doctor", {
      p_consultation_id: consultation.id,
    });
    const doctorName = doctorRows?.[0]?.full_name?.trim() || "Doctor details unavailable";
    return { ...consultation, doctorName, assigned: true };
  }));

  function hrefFor(nextStatus: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (search) params.set("q", search);
    const suffix = params.toString();
    return "/patient/consultations" + (suffix ? "?" + suffix : "");
  }

  return (
    <div className="patient-consultations-redesign">
      <section className="patient-page-heading patient-heading-with-action">
        <div>
          <span className="patient-consultations-eyebrow">YOUR CARE HISTORY</span>
          <h1>My Consultations</h1>
          <p>Your consultations, organized by treatment and assigned clinician.</p>
        </div>
        <Link className="patient-primary-button" href="/patient/consultations/new">
          New Consultation <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <div className="patient-consultations-controls">
        <nav className="patient-filter-tabs" aria-label="Consultations by status">
          {filters.map((filter) => (
            <Link
              className={status === filter.key ? "is-active" : ""}
              href={hrefFor(filter.key)}
              key={filter.key}
              aria-current={status === filter.key ? "page" : undefined}
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        <form className="patient-search-form" action="/patient/consultations">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search size={17} aria-hidden="true" />
          <label className="sr-only" htmlFor="patient-consultation-search">Search consultations</label>
          <input id="patient-consultation-search" name="q" defaultValue={search} placeholder="Search consultations..." />
          <button type="submit">Search</button>
        </form>
      </div>

      {cards.length ? (
        <div className="patient-consultation-cards">
          {cards.map((consultation, index) => {
            const title = patientCareTitle(consultation.primary_concern);
            return (
              <Link
                href={"/patient/consultations/" + consultation.id}
                className="patient-consultation-card"
                key={consultation.id}
                aria-label={"Open " + title + ". " + consultation.doctorName + "."}
              >
                <div className="patient-consultation-card-top">
                  <span className="patient-consultation-card-overline">
                    <span className="patient-consultation-card-dot" aria-hidden="true" />
                    CONSULTATION {String(index + 1).padStart(2, "0")}
                  </span>
                  <StatusBadge status={consultation.status} />
                </div>

                <h2>{title}</h2>

                <div className="patient-consultation-card-lower">
                  <span className="patient-consultation-card-avatar" aria-hidden="true">
                    {consultation.assigned ? doctorInitials(consultation.doctorName) : <Stethoscope size={19} />}
                  </span>
                  <span className="patient-consultation-card-clinician">
                    <small>{consultation.assigned ? "Assigned doctor" : "Doctor assignment"}</small>
                    <strong>{consultation.doctorName}</strong>
                  </span>
                  <span className="patient-consultation-card-open" aria-hidden="true">
                    <ArrowUpRight size={19} />
                  </span>
                </div>

                <div className="patient-consultation-card-footer">
                  <CalendarDays size={14} aria-hidden="true" />
                  <span>Updated {new Date(consultation.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="patient-consultations-no-results">
          <CalendarDays size={26} aria-hidden="true" />
          <h2>No matching consultations</h2>
          <p>{search || status !== "all"
            ? "Try another search or filter."
            : "Once you start a consultation, it will appear here."}</p>
        </div>
      )}
    </div>
  );
}
