import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your consultations" };

export default async function ConsultationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("consultations").select("id, primary_concern, status, created_at, updated_at").order("updated_at", { ascending: false });
  return <>
    <section className="dashboard-heading"><div><span className="eyebrow">Your care history</span><h1>Consultations</h1><p>Draft, active, and completed care—all in one place.</p></div><Link className="button button-primary" href="/patient/consultations/new">New consultation</Link></section>
    <section className="dashboard-section">{data?.length ? <div className="record-list spacious">{data.map((item) => <Link href={`/patient/consultations/${item.id}`} key={item.id}><div><strong>{item.primary_concern}</strong><span>Started {new Date(item.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</span></div><div className="record-action"><StatusBadge status={item.status} /><ArrowRight size={18} /></div></Link>)}</div> : <div className="empty-state"><div><h3>No consultations yet</h3><p>When something doesn’t feel right, start here.</p><Link href="/patient/consultations/new">Start your first consultation →</Link></div></div>}</section>
  </>;
}
