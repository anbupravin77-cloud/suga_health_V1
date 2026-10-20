import Link from "next/link";
import { StatusBadge } from "@/components/care/status-badge";
import { PatientConversationCard, PatientConversationsHeading, patientCareTitle } from "@/components/patient/patient-conversation-card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient home" };

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
      consultationId: thread.consultation_id,
      concern: consultation.primary_concern,
      doctorName,
      assigned,
    };
  }))).filter((conversation) => conversation !== null);

  return (
    <div className="patient-dashboard-page patient-home-simplified patient-conversations-surface">
      <section className="patient-page-heading patient-home-heading">
        <h1>Good to see you, {firstName}.</h1>
      </section>

      <div className="patient-home-stream">
        <section className="patient-panel patient-active-care">
          <div className="patient-section-title">
            <div>
              <span className="patient-kicker">CURRENT CARE</span>
              <h2>{active ? patientCareTitle(active.primary_concern) : "No active consultation"}</h2>
            </div>
            {active && <StatusBadge status={active.status} />}
          </div>
          {active && (
            <p>Updated {new Date(active.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</p>
          )}
        </section>

        <section className="patient-panel patient-messages-home" aria-labelledby="patient-conversations-title">
          <PatientConversationsHeading showViewAll />

          {conversations.length ? (
            <div className="patient-conversations-grid">
              {conversations.map((conversation) => (
                <PatientConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  href={`/patient/messages?thread=${encodeURIComponent(conversation.id)}`}
                />
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
