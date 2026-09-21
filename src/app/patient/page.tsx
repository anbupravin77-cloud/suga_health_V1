import Link from "next/link";
import { ArrowRight, ClipboardList, MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient home" };

export default async function PatientHome() {
  const supabase = await createClient();
  const [{ data: consultations }, { count: unread }] = await Promise.all([
    supabase.from("consultations").select("id, primary_concern, status, updated_at").order("updated_at", { ascending: false }).limit(4),
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
  ]);
  const active = consultations?.find((item) => item.status !== "completed" && item.status !== "draft");
  return <>
    <section className="dashboard-heading"><div><span className="eyebrow">Patient home</span><h1>Good care starts with a clear picture.</h1><p>Follow your current consultation or tell a doctor what’s going on.</p></div><Link className="button button-primary" href="/patient/consultations/new">Start consultation <ArrowRight size={17} /></Link></section>
    <section className="dashboard-grid">
      <div className="dashboard-section feature-panel"><div className="section-row"><h2>Active consultation</h2>{active && <StatusBadge status={active.status} />}</div>{active ? <Link className="active-case" href={`/patient/consultations/${active.id}`}><div><strong>{active.primary_concern}</strong><p>Updated {new Date(active.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</p></div><ArrowRight /></Link> : <div className="empty-state"><ClipboardList size={24} /><div><h3>No active consultation</h3><p>Your current care status will appear here.</p></div></div>}</div>
      <Link className="dashboard-section notification-card" href="/patient/notifications"><MessageSquare size={22} /><span className="metric">{unread ?? 0}</span><h2>Unread updates</h2><p>Messages and care notifications in one private place.</p></Link>
    </section>
    <section className="dashboard-section"><div className="section-row"><h2>Recent consultations</h2><Link href="/patient/consultations">View all</Link></div>{consultations?.length ? <div className="record-list">{consultations.map((item) => <Link href={`/patient/consultations/${item.id}`} key={item.id}><div><strong>{item.primary_concern}</strong><span>{new Date(item.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</span></div><StatusBadge status={item.status} /></Link>)}</div> : <div className="quiet-list"><p>Your drafts and submitted consultations will appear here.</p></div>}</section>
  </>;
}
