import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DoctorMessagesPage() {
  const identity = await requireIdentity();
  const supabase = await createClient();
  const { data } = await supabase
    .from("message_threads")
    .select("id, consultation_id, updated_at, last_message_preview, last_message_at, doctor_unread_count, consultations(primary_concern, status)")
    .eq("doctor_id", identity.id)
    .order("updated_at", { ascending: false })
    .limit(60);

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Clinical conversations</span>
          <h1>Messages</h1>
          <p>Secure patient communication, organized by consultation.</p>
        </div>
      </section>
      <section className="dashboard-section">
        {data?.length ? (
          <div className="record-list spacious message-index-list">
            {data.map((thread) => (
              <Link href={`/doctor/consultations/${thread.consultation_id}`} key={thread.id}>
                <div>
                  <strong>{thread.consultations?.[0]?.primary_concern?.replaceAll("_", " ") || "Consultation"}</strong>
                  <span>{thread.last_message_preview || "Open secure conversation"}</span>
                </div>
                <div className="message-index-meta">
                  {thread.doctor_unread_count > 0 && <span className="unread-count">{thread.doctor_unread_count}</span>}
                  <MessageSquare size={18} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MessageSquare />
            <div><h3>No conversations yet</h3><p>Messages from your consultations will appear here.</p></div>
          </div>
        )}
      </section>
    </>
  );
}
