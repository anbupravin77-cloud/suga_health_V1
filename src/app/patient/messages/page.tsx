import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function PatientMessagesPage() {
  const { profile } = await requireRole("patient");
  const supabase = await createClient();
  const { data } = await supabase.from("message_threads").select("id, consultation_id, updated_at, consultations(primary_concern, status)").not("doctor_id", "is", null).order("updated_at", { ascending: false });
  return <AppShell role="patient" active="Messages" name={profile.full_name || "Patient"}><section className="dashboard-heading"><div><span className="eyebrow">Private conversations</span><h1>Messages</h1><p>Each conversation stays connected to the right consultation.</p></div></section><section className="dashboard-section">{data?.length ? <div className="record-list spacious">{data.map((thread) => <Link href={`/patient/consultations/${thread.consultation_id}`} key={thread.id}><div><strong>{thread.consultations?.[0]?.primary_concern || "Consultation"}</strong><span>Open secure conversation</span></div><MessageSquare size={18} /></Link>)}</div> : <div className="empty-state"><MessageSquare /><div><h3>No conversations yet</h3><p>Messaging opens after a doctor claims your consultation.</p></div></div>}</section></AppShell>;
}
