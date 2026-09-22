"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sendMessageNow } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_uid: string;
  message_text: string;
  created_at: string;
};

export function MessageThread({
  threadId,
  currentUserId,
  messages,
  enabled = true,
}: {
  threadId: string;
  currentUserId: string;
  messages: Message[];
  returnTo?: string;
  enabled?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);
  const [previousMessages, setPreviousMessages] = useState(messages);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Reconcile refreshed server props before rendering, retaining optimistic sends.
  if (previousMessages !== messages) {
    setPreviousMessages(messages);
    setLocalMessages(messages);
  }

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanBody = body.trim();
    if (!cleanBody || sending) return;

    setSending(true);
    setError("");
    setBody("");
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      sender_uid: currentUserId,
      message_text: cleanBody,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((current) => [...current, optimistic]);

    const result = await sendMessageNow(threadId, cleanBody);
    setSending(false);

    if (!result.ok) {
      setLocalMessages((current) => current.filter((message) => message.id !== optimisticId));
      setBody(cleanBody);
      setError(result.error || "We couldn’t send the message.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="message-panel" aria-labelledby="messages-title">
      <div className="section-row message-panel-heading">
        <div>
          <span className="eyebrow">Private consultation channel</span>
          <h2 id="messages-title">Secure messages</h2>
        </div>
        <span>Consultation only</span>
      </div>

      <div className="message-list" aria-live="polite">
        {localMessages.length ? localMessages.map((message) => (
          <article className={message.sender_uid === currentUserId ? "message message-own" : "message"} key={message.id}>
            <p>{message.message_text}</p>
            <time dateTime={message.created_at}>
              {message.id.startsWith("optimistic-") ? "Sending…" : new Date(message.created_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
            </time>
          </article>
        )) : <div className="inline-empty">No messages yet. Start the conversation when you need clarification.</div>}
      </div>

      {error && <p className="message-error" role="alert">{error}</p>}

      {enabled ? (
        <form ref={formRef} className="message-form" onSubmit={submit}>
          <label className="sr-only" htmlFor={`message-${threadId}`}>Message</label>
          <textarea
            id={`message-${threadId}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            minLength={1}
            maxLength={3000}
            placeholder="Write a private message…"
            disabled={sending}
          />
          <button className="button button-primary motion-cta" type="submit" disabled={sending || !body.trim()}>
            {sending ? <><LoaderCircle size={16} className="action-spinner" /> Sending…</> : <><Send size={16} /> Send</>}
          </button>
        </form>
      ) : <p className="form-note">Messaging opens when a doctor begins reviewing this consultation.</p>}
    </section>
  );
}
