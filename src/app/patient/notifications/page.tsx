import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PatientNotificationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, related_entity_id, related_entity_type, title, short_message, status, read_at, created_at")
    .order("created_at", { ascending: false });

  return <>
    <section className="dashboard-heading">
      <div>
        <span className="eyebrow">Care updates</span>
        <h1>Notifications</h1>
        <p>Important changes in your consultation journey.</p>
      </div>
      {data?.some((item) => !item.read_at && item.status !== "read") && (
        <form action={markNotificationsRead}>
          <input type="hidden" name="role" value="patient" />
          <button className="button button-secondary" type="submit">Mark all read</button>
        </form>
      )}
    </section>

    <section className="dashboard-section">
      {data?.length ? (
        <div className="notification-list">
          {data.map((item) => {
            const consultationHref =
              item.related_entity_type === "consultation" && item.related_entity_id
                ? `/patient/consultations/${item.related_entity_id}`
                : "/patient";

            return (
              <Link
                className={!item.read_at && item.status !== "read" ? "unread" : ""}
                href={consultationHref}
                key={item.id}
              >
                <span className="notification-dot" />
                <div>
                  <strong>{item.title}</strong>
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
          <div><h3>You’re all caught up</h3><p>New care updates will appear here.</p></div>
        </div>
      )}
    </section>
  </>;
}
