import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function DoctorNotificationsPage() {
  const { profile } = await requireRole("doctor");
  const supabase = await createClient();
  const { data } = await supabase.from("notifications").select("id, consultation_id, title, body, read_at, created_at").order("created_at", { ascending: false });
  return <AppShell role="doctor" active="Notifications" name={profile.full_name || "Doctor"}><section className="dashboard-heading"><div><span className="eyebrow">Clinical updates</span><h1>Notifications</h1><p>Messages and workflow events that need your attention.</p></div>{data?.some((item) => !item.read_at) && <form action={markNotificationsRead}><input type="hidden" name="role" value="doctor" /><button className="button button-secondary" type="submit">Mark all read</button></form>}</section><section className="dashboard-section">{data?.length ? <div className="notification-list">{data.map((item) => <Link className={!item.read_at ? "unread" : ""} href={item.consultation_id ? `/doctor/consultations/${item.consultation_id}` : "/doctor"} key={item.id}><span className="notification-dot" /><div><strong>{item.title}</strong><p>{item.body}</p><time>{new Date(item.created_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</time></div></Link>)}</div> : <div className="empty-state"><Bell /><div><h3>You’re all caught up</h3><p>New patient messages will appear here.</p></div></div>}</section></AppShell>;
}
