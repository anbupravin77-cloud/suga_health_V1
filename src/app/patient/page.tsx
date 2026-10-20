import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
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
    supabase.from("profiles").select("first_name, display_name").single(),
    supabase
      .from("consultations")
      .select("id, primary_concern, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("message_threads")
      .select("id, consultation_id, last_message_preview, last_message_at, patient_unread_count, consultations(primary_concern)")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const firstName = profile?.first_name || profile?.display_name?.split(/\s+/)[0] || "there";
  const active = consultations?.find((item) => item.status !== "completed" && item.status !== "draft");

  return (
    <div className="patient-dashboard-page patient-home-simplified">
      <section className="patient-page-heading patient-home-heading">
        <h1>Good to see you, {firstName}.</h1>
      </section>

      <div className="patient-home-stream">
        <section className="patient-panel patient-active-care">
          <div className="patient-section-title">
            <div>
              <span className="patient-kicker">CURRENT CARE</span>
              <h2>{active ? careTitle(active.primary_concern) : "No active consultation"}</h2>
            </div>
            {active && <StatusBadge status={active.status} />}
          </div>
          {active && (
            <p>Updated {new Date(active.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</p>
          )}
        </section>

        <section className="patient-panel patient-messages-home">
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
      </div>
    </div>
  );
}
