import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { StatusBadge } from "@/components/care/status-badge";
import { requireIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ActiveReviewsPage() {
  const identity = await requireIdentity();
  const supabase = await createClient();

  const { data } = await supabase
    .from("consultations")
    .select("id, primary_concern, status, updated_at")
    .eq("assigned_to", identity.id)
    .in("status", ["under_review", "completed"])
    .order("updated_at", { ascending: false })
    .limit(60);

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Your caseload</span>
          <h1>Active reviews</h1>
          <p>Continue in-progress reviews and revisit completed consultations.</p>
        </div>
      </section>
      <section className="dashboard-section">
        {data?.length ? (
          <div className="record-list spacious">
            {data.map((item) => (
              <Link href={`/doctor/consultations/${item.id}`} key={item.id}>
                <div>
                  <strong>{item.primary_concern.replaceAll("_", " ")}</strong>
                  <span>Updated {new Date(item.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</span>
                </div>
                <div className="record-action"><StatusBadge status={item.status} /><ArrowRight size={18} /></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Stethoscope />
            <div><h3>No active reviews</h3><p>Begin a consultation from the queue when you’re ready.</p><Link href="/doctor">Open queue →</Link></div>
          </div>
        )}
      </section>
    </>
  );
}
