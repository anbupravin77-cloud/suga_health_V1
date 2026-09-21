"use client";

import Link from "next/link";
import { Bell, Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { markAllNotificationsRead } from "@/app/actions";

type NotificationItem = {
  id: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  title: string;
  short_message: string | null;
  status: string;
  read_at: string | null;
  created_at: string;
};

export function NotificationsList({
  role,
  initialItems,
}: {
  role: "patient" | "doctor";
  initialItems: NotificationItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const unread = items.filter((item) => !item.read_at && item.status !== "read").length;

  async function markAll() {
    if (!unread || pending) return;
    const previous = items;
    const now = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, status: "read", read_at: item.read_at || now })));
    setPending(true);
    setError("");

    const result = await markAllNotificationsRead();
    setPending(false);

    if (!result.ok) {
      setItems(previous);
      setError(result.error || "We couldn’t mark the notifications as read.");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">{role === "doctor" ? "Clinical updates" : "Care updates"}</span>
          <h1>Notifications</h1>
          <p>{role === "doctor" ? "Messages and workflow events that need your attention." : "Important changes in your consultation journey."}</p>
        </div>
        {unread > 0 && (
          <button className="button button-secondary notification-read-button" type="button" onClick={() => void markAll()} disabled={pending}>
            {pending ? <><LoaderCircle size={16} className="action-spinner" /> Updating…</> : <><Check size={16} /> Mark all as read</>}
          </button>
        )}
      </section>

      {error && <p className="page-error" role="alert">{error}</p>}

      <section className="dashboard-section notification-surface">
        {items.length ? (
          <div className="notification-list">
            {items.map((item) => {
              const href =
                item.related_entity_type === "consultation" && item.related_entity_id
                  ? `/${role}/consultations/${item.related_entity_id}`
                  : item.related_entity_type === "thread"
                    ? `/${role}/messages`
                    : `/${role}`;
              const isUnread = !item.read_at && item.status !== "read";

              return (
                <Link className={isUnread ? "unread" : ""} href={href} key={item.id}>
                  <span className="notification-dot" />
                  <div className="notification-copy">
                    <div className="notification-title-row">
                      <strong>{item.title}</strong>
                      {isUnread && <span>New</span>}
                    </div>
                    <p>{item.short_message}</p>
                    <time>{new Date(item.created_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</time>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Bell />
            <div><h3>You’re all caught up</h3><p>New updates will appear here.</p></div>
          </div>
        )}
      </section>
    </>
  );
}
