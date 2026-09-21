import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/care/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function ActiveReviewsPage() {
  const { profile } = await requireRole("doctor");
  const supabase = await createClient();
  const { data } = await supabase.from("consultations").select("id, primary_concern, status, updated_at").in("status", ["under_review", "completed"]).order("updated_at", { ascending: false });
  return <AppShell role="doctor" active="Active reviews" name={profile.full_name || "Doctor"}><section className="dashboard-heading"><div><span className="eyebrow">Your caseload</span><h1>Active reviews</h1><p>Continue claimed consultations and review completed work.</p></div></section><section className="dashboard-section">{data?.length ? <div className="record-list spacious">{data.map((item) => <Link href={`/doctor/consultations/${item.id}`} key={item.id}><div><strong>{item.primary_concern}</strong><span>Updated {new Date(item.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</span></div><div className="record-action"><StatusBadge status={item.status} /><ArrowRight size={18} /></div></Link>)}</div> : <div className="empty-state"><Stethoscope /><div><h3>No active reviews</h3><p>Claim a consultation from the queue when you’re ready.</p><Link href="/doctor">Open queue →</Link></div></div>}</section></AppShell>;
}
