import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function DoctorMessagesPage() {
  const { profile } = await requireRole("doctor");
  const supabase = await createClient();
  const { data } = await supabase.from("message_threads").select("id, consultation_id, updated_at, consultations(primary_concern, status)").order("updated_at", { ascending: false });
  return <AppShell role="doctor" active="Messages" name={profile.full_name || "Doctor"}><section className="dashboard-heading"><div><span className="eyebrow">Clinical conversations</span><h1>Messages</h1><p>Secure patient communication, always attached to the relevant case.</p></div></section><section className="dashboard-section">{data?.length ? <div className="record-list spacious">{data.map((thread) => <Link href={`/doctor/consultations/${thread.consultation_id}`} key={thread.id}><div><strong>{thread.consultations?.[0]?.primary_concern || "Consultation"}</strong><span>Open consultation conversation</span></div><MessageSquare size={18} /></Link>)}</div> : <div className="empty-state"><MessageSquare /><div><h3>No conversations yet</h3><p>Messages from claimed consultations will appear here.</p></div></div>}</section></AppShell>;
}
