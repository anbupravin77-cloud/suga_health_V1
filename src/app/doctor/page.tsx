import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { claimConsultation } from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/care/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor queue" };

type QueueItem = {
  id: string;
  patient_name: string;
  primary_concern: string;
  submitted_at: string | null;
  status: string;
};

export default async function DoctorQueue({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const { user, profile } = await requireRole("doctor");
  const supabase = await createClient();

  const isTestDoctor = (user.email ?? "").trim().toLowerCase() === "doctor123@gmail.com";
  let data: QueueItem[] = [];
  let queueError: { message?: string } | null = null;

  if (isTestDoctor) {
    const result = await supabase.rpc("v1_test_doctor_queue");
    data = (result.data ?? []) as QueueItem[];
    queueError = result.error;
  } else {
    const result = await supabase
      .from("consultations")
      .select("id, patient_id, primary_concern, submitted_at, status")
      .eq("assigned_to", user.id)
      .eq("status", "assigned")
      .order("submitted_at", { ascending: true });

    queueError = result.error;

    const patientIds = [...new Set((result.data ?? []).map((item) => item.patient_id))];
    const patientResult = patientIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name")
          .in("id", patientIds)
      : { data: [], error: null };

    if (!queueError) queueError = patientResult.error;

    const patientNames = new Map(
      (patientResult.data ?? []).map((patient) => [
        patient.id,
        patient.display_name ||
          [patient.first_name, patient.last_name].filter(Boolean).join(" ") ||
          "Patient",
      ]),
    );

    data = (result.data ?? []).map((item) => ({
      id: item.id,
      patient_name: patientNames.get(item.patient_id) || "Patient",
      primary_concern: item.primary_concern,
      submitted_at: item.submitted_at,
      status: item.status,
    }));
  }

  return <AppShell role="doctor" active="Queue" name={profile.full_name || "Doctor"}>
    <section className="dashboard-heading">
      <div>
        <span className="eyebrow">Available cases</span>
        <h1>Consultation queue</h1>
        <p>{isTestDoctor ? "Only consultations from the paired test patient appear here." : "Review consultations assigned to your clinical account."}</p>
      </div>
      <Link className="button button-secondary" href="/doctor/active-reviews">
        Active reviews <ArrowRight size={17} />
      </Link>
    </section>

    {(query.error || queueError) && (
      <p className="page-error" role="alert">
        {query.error === "claim"
          ? "This consultation could not be opened. Please refresh the queue and try again."
          : "The consultation queue could not be loaded."}
      </p>
    )}

    <section className="queue-table" aria-label="Consultation queue">
      <div className="queue-head">
        <span>Patient</span><span>Primary concern</span><span>Submitted</span><span>Status</span><span>Action</span>
      </div>

      {data.length ? data.map((item) => (
        <div className="queue-row" key={item.id}>
          <span>{item.patient_name}</span>
          <strong>{item.primary_concern}</strong>
          <time>{item.submitted_at ? new Date(item.submitted_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Recently"}</time>
          <StatusBadge status={item.status} />
          <form action={claimConsultation}>
            <input type="hidden" name="id" value={item.id} />
            <button className="text-button" type="submit">Begin review →</button>
          </form>
        </div>
      )) : (
        <div className="queue-empty">
          <ClipboardList />
          <p>No consultations waiting.</p>
          <span>{isTestDoctor ? "New consultations from the paired test patient will appear here." : "New consultations assigned to you will appear here."}</span>
        </div>
      )}
    </section>
  </AppShell>;
}
