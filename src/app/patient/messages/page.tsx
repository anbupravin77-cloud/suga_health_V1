import Link from "next/link";
import { CalendarDays, MessageSquare, Search, Stethoscope } from "lucide-react";
import { MessageThread } from "@/components/care/message-thread";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

function careTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
  };
  return labels[value] || value.replaceAll("_", " ");
}

export default async function PatientMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; q?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q || "").trim().toLowerCase();
  const identity = await requireIdentity();
  const supabase = await createClient();

  const { data: rawThreads = [] } = await supabase
    .from("message_threads")
    .select("id, consultation_id, doctor_id, updated_at, last_message_preview, last_message_at, patient_unread_count, consultations(primary_concern, status, updated_at)")
    .order("updated_at", { ascending: false })
    .limit(80);

  const threads = rawThreads.filter((thread) => {
    if (!search) return true;
    const concern = thread.consultations?.[0]?.primary_concern || "";
    return [concern, thread.last_message_preview || ""].join(" ").toLowerCase().includes(search);
  });

  const selected =
    threads.find((thread) => thread.id === params.thread) ||
    threads[0] ||
    null;

  let messages: Array<{
    id: string;
    sender_uid: string;
    message_text: string;
    created_at: string;
  }> = [];
  let doctor: { full_name: string | null; professional_title: string | null; specialization: string | null } | null = null;

  if (selected) {
    const [{ data: messageRows }, { data: doctorRows }] = await Promise.all([
      supabase
        .from("messages")
        .select("id, sender_uid, message_text, created_at")
        .eq("thread_id", selected.id)
        .order("created_at"),
      selected.doctor_id
        ? supabase.rpc("v1_get_consultation_doctor", {
            p_consultation_id: selected.consultation_id,
          })
        : Promise.resolve({ data: [] }),
    ]);
    messages = messageRows ?? [];
    doctor = doctorRows?.[0] ?? null;
  }

  return (
    <div>
      <section className="patient-page-heading">
        <div>
          <h1>Messages</h1>
          <p>Private conversations with your clinician stay attached to the consultation they belong to.</p>
        </div>
      </section>

      <div className="patient-message-workspace">
        <aside className="patient-message-index">
          <form className="patient-search-form patient-message-search" action="/patient/messages">
            <Search size={17} />
            <input name="q" defaultValue={params.q || ""} placeholder="Search messages…" />
            <button type="submit">Search</button>
          </form>

          {threads.length ? (
            <div className="patient-thread-list">
              {threads.map((thread) => {
                const concern = thread.consultations?.[0]?.primary_concern || "consultation";
                const linkParams = new URLSearchParams();
                if (params.q) linkParams.set("q", params.q);
                linkParams.set("thread", thread.id);

                return (
                  <Link
                    href={`/patient/messages?${linkParams.toString()}`}
                    className={selected?.id === thread.id ? "is-selected" : ""}
                    key={thread.id}
                  >
                    <span className="patient-thread-icon"><MessageSquare size={18} /></span>
                    <span className="patient-thread-copy">
                      <strong>{careTitle(concern)}</strong>
                      <small>{thread.last_message_preview || "Open secure conversation"}</small>
                      <time>
                        {new Date(thread.last_message_at || thread.updated_at).toLocaleDateString("en", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </time>
                    </span>
                    {thread.patient_unread_count > 0 && <b>{thread.patient_unread_count}</b>}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="patient-empty-simple">
              <MessageSquare size={24} />
              <div>
                <strong>No conversations found</strong>
                <span>Messages open when a consultation is assigned to a clinician.</span>
              </div>
            </div>
          )}
        </aside>

        <section className="patient-chat-column">
          {selected ? (
            <>
              <header className="patient-chat-header">
                <div className="patient-preview-doctor">
                  <span className="patient-doctor-avatar">DR</span>
                  <div>
                    <strong>{doctor?.full_name || "Suga.Health clinician"}</strong>
                    <span>{doctor?.specialization || doctor?.professional_title || "Clinical care team"}</span>
                  </div>
                </div>
              </header>

              <Link
                className="patient-chat-consultation"
                href={`/patient/consultations/${selected.consultation_id}`}
              >
                <CalendarDays size={18} />
                <span>
                  <small>Related consultation</small>
                  <strong>{careTitle(selected.consultations?.[0]?.primary_concern || "consultation")}</strong>
                </span>
                <span className="patient-chat-status">
                  {selected.consultations?.[0]?.status?.replaceAll("_", " ") || "Consultation"}
                </span>
              </Link>

              <div className="patient-chat-thread">
                <MessageThread
                  threadId={selected.id}
                  currentUserId={identity.id}
                  messages={messages}
                  enabled={Boolean(selected.doctor_id)}
                />
              </div>
            </>
          ) : (
            <div className="patient-chat-empty">
              <Stethoscope size={30} />
              <h2>Your care conversations will appear here.</h2>
              <p>Start a consultation first. Messaging opens when the consultation reaches a clinician.</p>
              <Link className="patient-primary-button" href="/patient/consultations/new">Start Consultation</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
