import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient home" };

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    weight_loss: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    hair_growth: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
    sexual_health: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) + " Consultation";
}

function doctorInitials(name: string) {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "DR";
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
      .select("id, consultation_id, doctor_id")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const firstName = profile?.first_name || profile?.display_name?.split(/\s+/)[0] || "there";
  const active = consultations?.find((item) => item.status !== "completed" && item.status !== "draft");

  // Resolve the consultation by its ID, not via an optional thread relationship.
  // The patient's existing row-level security policies govern this read.
  const threadRows = threads ?? [];
  const consultationIds = [...new Set(threadRows.map((thread) => thread.consultation_id))];
  const { data: conversationConsultations } = consultationIds.length
    ? await supabase
        .from("consultations")
        .select("id, primary_concern, assigned_to")
        .in("id", consultationIds)
    : { data: [] as Array<{ id: string; primary_concern: string; assigned_to: string | null }> };

  const consultationById = new Map(
    (conversationConsultations ?? []).map((consultation) => [consultation.id, consultation]),
  );

  const conversations = (await Promise.all(threadRows.map(async (thread) => {
    const consultation = consultationById.get(thread.consultation_id);
    if (!consultation) return null;

    const assigned = Boolean(thread.doctor_id || consultation.assigned_to);
    let doctorName = "Awaiting doctor assignment";

    if (assigned) {
      // This existing RPC only returns a clinician for a consultation
      // the signed-in patient is authorized to access.
      const { data: doctorRows } = await supabase.rpc("v1_get_consultation_doctor", {
        p_consultation_id: thread.consultation_id,
      });
      doctorName = doctorRows?.[0]?.full_name?.trim() || "Doctor details unavailable";
    }

    return {
      id: thread.id,
      concern: consultation.primary_concern,
      doctorName,
      assigned,
    };
  }))).filter((conversation) => conversation !== null);

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

        <section className="patient-panel patient-messages-home" aria-labelledby="patient-conversations-title">
          <div className="patient-conversations-heading">
            <div>
              <span className="patient-conversations-eyebrow">PRIVATE COMMUNICATION</span>
              <h2 id="patient-conversations-title">Your care conversations.</h2>
              <p>All your doctor conversations, organized by consultation. Select one to view messages.</p>
            </div>
            <Link href="/patient/messages" className="patient-conversations-view-all">
              View all <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {conversations.length ? (
            <div className="patient-conversations-grid">
              {conversations.map((conversation, index) => (
                <Link
                  href={`/patient/messages?thread=${encodeURIComponent(conversation.id)}`}
                  key={conversation.id}
                  className="patient-conversation-card"
                  aria-label={`Open ${careTitle(conversation.concern)} conversation. ${conversation.doctorName}.`}
                >
                  <span className="patient-conversation-overline">
                    <span className="patient-conversation-dot" aria-hidden="true" />
                    CONSULTATION {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong className="patient-conversation-title">{careTitle(conversation.concern)}</strong>
                  <span className="patient-conversation-detail">
                    <span className="patient-conversation-avatar" aria-hidden="true">
                      {conversation.assigned ? doctorInitials(conversation.doctorName) : <MessageSquare size={17} />}
                    </span>
                    <span className="patient-conversation-doctor">
                      <small>{conversation.assigned ? "Assigned doctor" : "Doctor assignment"}</small>
                      <b>{conversation.doctorName}</b>
                    </span>
                    <span className="patient-conversation-open" aria-hidden="true">
                      <ArrowUpRight size={17} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="patient-muted-copy">Your consultation conversations will appear here once messaging is available.</p>
          )}
        </section>
      </div>
    </div>
  );
}
