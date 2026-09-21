import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { claimConsultation } from "@/app/actions";
import { StatusBadge } from "@/components/care/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor queue" };

type QueueItem = {
  id: string;
  patient_id: string;
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
  const identity = await requireIdentity();
  const supabase = await createClient();

  const { data: consultations, error } = await supabase
    .from("consultations")
    .select("id, patient_id, primary_concern, submitted_at, status")
    .eq("assigned_to", identity.id)
    .eq("status", "assigned")
    .order("submitted_at", { ascending: true })
    .limit(50);

  const rows = (consultations ?? []) as QueueItem[];
  const patientIds = [...new Set(rows.map((item) => item.patient_id))];
  const { data: patients } = patientIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", patientIds)
    : { data: [] as Array<{ id: string; display_name: string | null; first_name: string | null; last_name: string | null }> };

  const names = new Map(
    (patients ?? []).map((patient) => [
      patient.id,
      patient.display_name ||
        [patient.first_name, patient.last_name].filter(Boolean).join(" ") ||
        "Patient",
    ]),
  );

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Available cases</span>
          <h1>Consultation queue</h1>
          <p>Only consultations assigned to this doctor account appear here.</p>
        </div>
        <Link className="button button-secondary" href="/doctor/active-reviews">
          Active reviews <ArrowRight size={17} />
        </Link>
      </section>

      {(query.error || error) && (
        <p className="page-error" role="alert">
          {query.error === "claim"
            ? "This consultation could not be opened. Refresh the queue and try again."
            : "The consultation queue could not be loaded."}
        </p>
      )}

      <section className="queue-table" aria-label="Consultation queue">
        <div className="queue-head">
          <span>Patient</span><span>Care area</span><span>Submitted</span><span>Status</span><span>Action</span>
        </div>
        {rows.length ? rows.map((item) => (
          <div className="queue-row" key={item.id}>
            <span>{names.get(item.patient_id) || "Patient"}</span>
            <strong>{item.primary_concern.replaceAll("_", " ")}</strong>
            <time>{item.submitted_at ? new Date(item.submitted_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Recently"}</time>
            <StatusBadge status={item.status} />
            <form action={claimConsultation}>
              <input type="hidden" name="id" value={item.id} />
              <ActionButton className="text-button" type="submit" pendingLabel="Opening…">Begin review →</ActionButton>
            </form>
          </div>
        )) : (
          <div className="queue-empty">
            <ClipboardList />
            <p>No consultations waiting.</p>
            <span>New consultations assigned to you will appear here.</span>
          </div>
        )}
      </section>
    </>
  );
}
