import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  Pill,
  Plus,
} from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient home" };

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

export default async function PatientHome() {
  const supabase = await createClient();

  const [{ data: profile }, { data: consultations }, { data: threads }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, display_name")
      .single(),
    supabase
      .from("consultations")
      .select("id, primary_concern, status, created_at, updated_at, completed_at, selected_prescription_option_id")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("message_threads")
      .select("id, consultation_id, last_message_preview, last_message_at, patient_unread_count, consultations(primary_concern)")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const firstName =
    profile?.first_name ||
    profile?.display_name?.split(/\s+/)[0] ||
    "there";

  const recent = consultations?.slice(0, 4) ?? [];
  const active = consultations?.find(
    (item) => item.status !== "completed" && item.status !== "draft",
  );
  const completed = consultations?.filter((item) => item.status === "completed") ?? [];
  const selectedIds = completed
    .map((item) => item.selected_prescription_option_id)
    .filter((id): id is string => Boolean(id));

  let medicationCount = 0;
  let medicationItems: Array<{
    id: string;
    medication_name: string;
    strength: string;
    frequency: string;
  }> = [];

  if (selectedIds.length) {
    const { data: options } = await supabase
      .from("consultation_prescription_options")
      .select("id, consultation_prescription_option_items(id, medication_name, strength, frequency, position)")
      .in("id", selectedIds);

    medicationItems = (options ?? [])
      .flatMap((option) => option.consultation_prescription_option_items ?? [])
      .sort((a, b) => a.position - b.position)
      .slice(0, 3);
    medicationCount = (options ?? []).reduce(
      (sum, option) => sum + (option.consultation_prescription_option_items?.length ?? 0),
      0,
    );
  }

  const lastConsultation = completed[0] ?? consultations?.[0] ?? null;

  return (
    <div className="patient-dashboard-page">
      <section className="patient-page-heading patient-home-heading">
        <div>
          <h1>Good to see you, {firstName}.</h1>
          <p>Your consultations, treatment and care updates in one clear place.</p>
        </div>
      </section>

      <div className="patient-home-grid">
        <div className="patient-home-main">
          <section className="patient-start-card">
            <div>
              <span className="patient-kicker">PRIVATE CLINICIAN-LED CARE</span>
              <h2>Start a new consultation</h2>
              <p>Tell us what you need help with and continue your care securely.</p>
              <Link className="patient-primary-button" href="/patient/consultations/new">
                <Plus size={17} /> Start Consultation <ArrowRight size={17} />
              </Link>
            </div>
            <div className="patient-leaf-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>

          {active && (
            <section className="patient-panel patient-active-care">
              <div className="patient-section-title">
                <div>
                  <span className="patient-kicker">CURRENT CARE</span>
                  <h2>{careTitle(active.primary_concern)}</h2>
                </div>
                <StatusBadge status={active.status} />
              </div>
              <p>Updated {new Date(active.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</p>
              <Link href={`/patient/consultations/${active.id}`}>
                Continue consultation <ArrowRight size={16} />
              </Link>
            </section>
          )}

          <section className="patient-panel">
            <div className="patient-section-title">
              <h2>Recent Consultations</h2>
              <Link href="/patient/consultations">View all <ArrowRight size={15} /></Link>
            </div>

            {recent.length ? (
              <div className="patient-record-list">
                {recent.map((item) => (
                  <Link href={`/patient/consultations/${item.id}`} key={item.id} className="patient-record-row">
                    <div className="patient-date-tile">
                      <strong>{new Date(item.updated_at).getDate().toString().padStart(2, "0")}</strong>
                      <span>{new Date(item.updated_at).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="patient-record-copy">
                      <strong>{careTitle(item.primary_concern)}</strong>
                      <span>
                        {item.status === "draft"
                          ? "Saved draft"
                          : item.status === "completed"
                            ? "Your completed care record"
                            : "Care is currently in progress"}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                    <ArrowRight className="patient-row-arrow" size={17} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="patient-empty-simple">
                <ClipboardList size={24} />
                <div>
                  <strong>No consultations yet</strong>
                  <span>Your care history will appear here.</span>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="patient-home-side">
          <section className="patient-panel">
            <div className="patient-section-title"><h2>Your care summary</h2></div>
            <div className="patient-summary-list">
              <div><ClipboardList size={18} /><span>Total consultations</span><strong>{consultations?.length ?? 0}</strong></div>
              <div><Pill size={18} /><span>Current treatment items</span><strong>{medicationCount}</strong></div>
              <div>
                <CalendarDays size={18} />
                <span>Last consultation</span>
                <strong>{lastConsultation ? new Date(lastConsultation.updated_at).toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</strong>
              </div>
            </div>
          </section>

          <section className="patient-panel">
            <div className="patient-section-title">
              <h2>Current Medications</h2>
              <Link href="/patient/medications">View all <ArrowRight size={15} /></Link>
            </div>
            {medicationItems.length ? (
              <div className="patient-mini-list">
                {medicationItems.map((item) => (
                  <Link href={`/patient/medications/${item.id}`} key={item.id}>
                    <span className="patient-mini-icon"><Pill size={17} /></span>
                    <span>
                      <strong>{item.medication_name} {item.strength}</strong>
                      <small>{item.frequency}</small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="patient-muted-copy">Selected treatment medications will appear here.</p>
            )}
          </section>

          <section className="patient-panel">
            <div className="patient-section-title">
              <h2>Messages from your care team</h2>
              <Link href="/patient/messages">View all <ArrowRight size={15} /></Link>
            </div>
            {threads?.length ? (
              <div className="patient-message-preview-list">
                {threads.slice(0, 2).map((thread) => (
                  <Link href={`/patient/messages?thread=${thread.id}`} key={thread.id}>
                    <span className="patient-mini-icon"><MessageSquare size={17} /></span>
                    <span>
                      <strong>{careTitle(thread.consultations?.[0]?.primary_concern || "Consultation")}</strong>
                      <small>{thread.last_message_preview || "Open secure conversation"}</small>
                    </span>
                    {thread.patient_unread_count > 0 && <b>{thread.patient_unread_count}</b>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="patient-muted-copy">Your consultation conversations will appear here.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
