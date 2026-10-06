import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MessageSquare, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function statusCopy(status: string | null) {
  if (status === "completed") return { title: "Your treatment plan is ready", body: "Your clinician has completed the consultation.", done: true };
  if (status === "under_review" || status === "assigned") return { title: "A doctor is reviewing your consultation", body: "Your answers are with the clinical team now.", done: false };
  if (status === "submitted") return { title: "Consultation received", body: "Your consultation is waiting for clinical review.", done: false };
  return { title: "Your consultation is saved", body: "Your latest consultation is in your account.", done: false };
}

export default async function PatientFlowTestDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/patient-flow-test/account?mode=login");

  const [{ data: profile }, { data: consultation }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, first_name, last_name, email, phone_number, sex")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("consultations")
      .select("id, primary_concern, status, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = String(profile?.display_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || metadata.full_name || "Patient");
  const age = metadata.age ? String(metadata.age) : "Not provided";
  const careArea = consultation?.primary_concern === "hair" ? "Hair Growth" : consultation?.primary_concern === "sex" ? "Sexual Health" : "Weight Loss";
  const status = statusCopy(consultation?.status ?? null);

  return (
    <main className="pft-dashboard-page">
      <header className="pft-dashboard-header">
        <Link href="/landing-test" className="pft-wordmark">
          <strong>Suga.health</strong>
          <span>live naturally</span>
        </Link>
        <span className="pft-dashboard-secure"><ShieldCheck size={16} /> Patient portal</span>
      </header>

      <section className="pft-dashboard-welcome">
        <span className="pft-eyebrow">YOUR CARE</span>
        <h1>Welcome, {name.split(" ")[0]}.</h1>
        <p>Your consultation is submitted. From here, the dashboard should mostly tell you what happens next.</p>
      </section>

      <section className="pft-status-card">
        <span className={status.done ? "pft-status-icon is-done" : "pft-status-icon"}>{status.done ? <CheckCircle2 size={25} /> : <Clock3 size={25} />}</span>
        <div>
          <span className="pft-step-label">{careArea.toUpperCase()}</span>
          <h2>{status.title}</h2>
          <p>{status.body}</p>
        </div>
        {consultation?.id && <ArrowRight size={21} />}
      </section>

      <div className="pft-dashboard-grid">
        <section className="pft-dashboard-panel">
          <div className="pft-dashboard-panel-heading">
            <div>
              <span className="pft-step-label">PROFILE</span>
              <h2>Your details</h2>
            </div>
            <UserRound size={21} />
          </div>
          <dl className="pft-profile-summary">
            <div><dt>Name</dt><dd>{name}</dd></div>
            <div><dt>Age</dt><dd>{age}</dd></div>
            <div><dt>Gender</dt><dd>{profile?.sex ? String(profile.sex).replaceAll("-", " ") : "Not provided"}</dd></div>
            <div><dt>Email</dt><dd>{profile?.email || String(metadata.contact_email || "Not provided")}</dd></div>
            <div><dt>Phone</dt><dd>{profile?.phone_number || user.phone || "Not provided"}</dd></div>
          </dl>
          <p className="pft-profile-footnote">Address is intentionally left out of this test flow for now.</p>
        </section>

        <section className="pft-dashboard-panel">
          <div className="pft-dashboard-panel-heading">
            <div>
              <span className="pft-step-label">NEXT</span>
              <h2>While your doctor reviews</h2>
            </div>
            <MessageSquare size={21} />
          </div>
          <div className="pft-next-list">
            <div><span>1</span><p><strong>Consultation received</strong>Your answers have been saved.</p></div>
            <div><span>2</span><p><strong>Doctor review</strong>The clinician checks suitability and safety.</p></div>
            <div><span>3</span><p><strong>Treatment plan</strong>You will see the next step here when it is ready.</p></div>
          </div>
        </section>
      </div>

      <Link href="/patient-flow-test/consultation" className="pft-dashboard-link">
        Start another test consultation <ArrowRight size={18} />
      </Link>
    </main>
  );
}
