import Link from "next/link";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import { MessageThread } from "@/components/care/message-thread";
import {
  PatientConversationCard,
  PatientConversationsHeading,
  doctorInitials,
  patientCareTitle,
  type PatientConversation,
} from "@/components/patient/patient-conversation-card";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function PatientMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const search = query.toLowerCase();
  const identity = await requireIdentity();
  const supabase = await createClient();

  // Only use consultations that the patient is authorized to read.
  const { data: threadRows } = await supabase
    .from("message_threads")
    .select("id, consultation_id, doctor_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(80);

  const rawThreads = threadRows ?? [];
  const consultationIds = [...new Set(rawThreads.map((thread) => thread.consultation_id))];
  const { data: consultationRows } = consultationIds.length
    ? await supabase
        .from("consultations")
        .select("id, primary_concern, status, assigned_to")
        .in("id", consultationIds)
    : { data: [] as Array<{ id: string; primary_concern: string; status: string; assigned_to: string | null }> };

  const consultationById = new Map(
    (consultationRows ?? []).map((consultation) => [consultation.id, consultation]),
  );

  const resolved = await Promise.all(rawThreads.map(async (thread) => {
    const consultation = consultationById.get(thread.consultation_id);
    if (!consultation) return null;

    const assigned = Boolean(thread.doctor_id || consultation.assigned_to);
    let doctorName = "Awaiting doctor assignment";
    let doctorSpecialization: string | null = null;

    if (assigned) {
      const { data: doctorRows } = await supabase.rpc("v1_get_consultation_doctor", {
        p_consultation_id: thread.consultation_id,
      });
      const doctor = doctorRows?.[0];
      doctorName = doctor?.full_name?.trim() || "Doctor details unavailable";
      doctorSpecialization = doctor?.specialization || doctor?.professional_title || null;
    }

    return {
      id: thread.id,
      consultationId: thread.consultation_id,
      concern: consultation.primary_concern,
      doctorName,
      doctorSpecialization,
      assigned,
      enabled: Boolean(thread.doctor_id),
    };
  }));

  const conversations = resolved.filter((conversation) => conversation !== null);
  const filteredConversations = conversations.filter((conversation) => {
    if (!search) return true;
    return [patientCareTitle(conversation.concern), conversation.doctorName]
      .some((value) => value.toLowerCase().includes(search));
  });

  // A conversation opens only after clicking its card or following an explicit thread link.
  const selected = params.thread
    ? filteredConversations.find((conversation) => conversation.id === params.thread) || null
    : null;

  const { data: messageRows } = selected
    ? await supabase
        .from("messages")
        .select("id, sender_uid, message_text, created_at")
        .eq("thread_id", selected.id)
        .order("created_at")
    : { data: [] as Array<{ id: string; sender_uid: string; message_text: string; created_at: string }> };

  const backParams = new URLSearchParams();
  if (query) backParams.set("q", query);
  const backHref = backParams.size ? `/patient/messages?${backParams.toString()}` : "/patient/messages";

  return (
    <div className="patient-messages-page patient-conversations-surface">
      {selected ? (
        <section className="patient-conversation-thread-view" aria-labelledby="patient-thread-title">
          <Link className="patient-conversation-back" href={backHref}>
            <ArrowLeft size={18} aria-hidden="true" />
            All conversations
          </Link>

          <header className="patient-conversation-thread-header">
            <span className="patient-conversations-eyebrow">SECURE CONVERSATION</span>
            <h1 id="patient-thread-title">{patientCareTitle(selected.concern)}</h1>
            <div className="patient-conversation-clinician">
              <span className="patient-conversation-avatar" aria-hidden="true">
                {selected.assigned ? doctorInitials(selected.doctorName) : <MessageSquare size={17} />}
              </span>
              <span>
                <strong>{selected.doctorName}</strong>
                <small>{selected.doctorSpecialization || (selected.assigned ? "Assigned clinician · Private conversation" : "Your care team will be assigned soon")}</small>
              </span>
            </div>
          </header>

          <div className="patient-conversation-chat">
            <MessageThread
              key={selected.id}
              threadId={selected.id}
              currentUserId={identity.id}
              messages={messageRows ?? []}
              enabled={selected.enabled}
              iconOnlySend
            />
          </div>
        </section>
      ) : (
        <section className="patient-messages-list-view" aria-labelledby="patient-conversations-title">
          <PatientConversationsHeading />

          <form className="patient-search-form patient-message-search" action="/patient/messages">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="patient-conversation-search">Search consultations or doctors</label>
            <input
              id="patient-conversation-search"
              name="q"
              defaultValue={query}
              placeholder="Search consultations or doctors..."
            />
            <button type="submit">Search</button>
          </form>

          {filteredConversations.length ? (
            <div className="patient-conversations-grid">
              {filteredConversations.map((conversation: PatientConversation, index) => {
                const linkParams = new URLSearchParams();
                if (query) linkParams.set("q", query);
                linkParams.set("thread", conversation.id);
                return (
                  <PatientConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    index={index}
                    href={`/patient/messages?${linkParams.toString()}`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="patient-conversation-empty">
              <MessageSquare size={24} aria-hidden="true" />
              <strong>{search ? "No matching consultations" : "No conversations yet"}</strong>
              <p>{search
                ? "Try searching by consultation type or doctor name."
                : "Your care conversations will appear here once messaging becomes available."}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
