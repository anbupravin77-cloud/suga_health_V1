"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { sendMessage } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_uid: string;
  message_text: string;
  created_at: string;
};

export function MessageThread({ threadId, currentUserId, messages, returnTo, enabled = true }: {
  threadId: string;
  currentUserId: string;
  messages: Message[];
  returnTo: string;
  enabled?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`thread:${threadId}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
      () => router.refresh(),
    ).subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, threadId]);

  return (
    <section className="message-panel" aria-labelledby="messages-title">
      <div className="section-row"><h2 id="messages-title">Secure messages</h2><span>Consultation only</span></div>
      <div className="message-list" aria-live="polite">
        {messages.length ? messages.map((message) => (
          <article className={message.sender_uid === currentUserId ? "message message-own" : "message"} key={message.id}>
            <p>{message.message_text}</p>
            <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</time>
          </article>
        )) : <div className="inline-empty">No messages yet. Start the conversation when you need clarification.</div>}
      </div>

      {enabled ? (
        <form className="message-form" action={sendMessage}>
          <input type="hidden" name="thread_id" value={threadId} />
          <input type="hidden" name="return_to" value={returnTo} />
          <label className="sr-only" htmlFor={`message-${threadId}`}>Message</label>
          <textarea id={`message-${threadId}`} name="body" required minLength={1} maxLength={3000} placeholder="Write a private message…" />
          <button className="button button-primary" type="submit">Send message</button>
        </form>
      ) : <p className="form-note">Messaging opens when a doctor begins reviewing this consultation.</p>}
    </section>
  );
}
