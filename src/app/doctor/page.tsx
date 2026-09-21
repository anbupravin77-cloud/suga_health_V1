import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { claimConsultation } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/care/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor queue" };

type QueueItem = { id: string; patient_name: string; primary_concern: string; submitted_at: string | null; status: string };

export default async function DoctorQueue({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const { profile } = await requireRole("doctor");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_doctor_queue");
  return <AppShell role="doctor" active="Queue" name={profile.full_name || "Doctor"}>
    <section className="dashboard-heading"><div><span className="eyebrow">Available cases</span><h1>Consultation queue</h1><p>Claim one case at a time and keep every clinical decision focused.</p></div><Link className="button button-secondary" href="/doctor/active-reviews">Active reviews <ArrowRight size={17} /></Link></section>
    {(query.error || error) && <p className="page-error" role="alert">{error ? "A verified doctor profile is required to access the queue." : "This consultation was claimed by another doctor."}</p>}
    <section className="queue-table" aria-label="Consultation queue"><div className="queue-head"><span>Patient</span><span>Primary concern</span><span>Submitted</span><span>Status</span><span>Action</span></div>{data?.length ? (data as QueueItem[]).map((item) => <div className="queue-row" key={item.id}><span>{item.patient_name}</span><strong>{item.primary_concern}</strong><time>{item.submitted_at ? new Date(item.submitted_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Recently"}</time><StatusBadge status={item.status} /><form action={claimConsultation}><input type="hidden" name="id" value={item.id} /><button className="text-button" type="submit">Claim case →</button></form></div>) : <div className="queue-empty"><ClipboardList /><p>No consultations waiting.</p><span>Newly submitted cases will appear here securely.</span></div>}</section>
  </AppShell>;
}
