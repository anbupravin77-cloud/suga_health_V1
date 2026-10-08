import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isQaPatient } from "@/lib/qa-patient";
import "./standalone.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start consultation | Suga.Health" };

export default async function StartConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ fresh?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  if (!sessionUser) redirect("/sign-in?next=%2Fconsultation%2Fstart");
  const { user } = await requireRole("patient");
  const { fresh } = await searchParams;
  const replayFirstTime = fresh === "1" && isQaPatient(user.id);

  // Only the verified QA patient receives blank onboarding fields. No database
  // profile or consultation records are erased when replaying the experience.
  const profile = replayFirstTime
    ? null
    : (await supabase
        .from("profiles")
        .select("first_name, last_name, date_of_birth, sex, height_cm, weight_kg")
        .eq("id", user.id)
        .maybeSingle()).data;

  return (
    <main className="patient-v2 standalone-intake">
      <header className="standalone-intake-header">
        <Link href="/" className="standalone-intake-logo" aria-label="Suga.Health home">
          SUGA.HEALTH
        </Link>
        <span className="standalone-intake-private"><LockKeyhole size={15} /> Private consultation</span>
        <Link href="/patient" className="standalone-intake-exit">
          <ArrowLeft size={15} /> Exit
        </Link>
      </header>
      <div className="standalone-intake-content">
        <div className="standalone-intake-intro">
          <h1>Your health consultation</h1>
          <p>Complete the details below on one page. Your answers are sent for clinical review when you submit.</p>
          {replayFirstTime && (
            <p className="standalone-intake-qa-note" role="status">
              Test mode: starting fresh. Your existing test account and past consultations are preserved.
            </p>
          )}
        </div>
        <ConsultationForm
          defaults={{
            firstName: profile?.first_name ?? "",
            lastName: profile?.last_name ?? "",
            dateOfBirth: profile?.date_of_birth ?? "",
            height_cm: profile?.height_cm == null ? null : Number(profile.height_cm),
            weight_kg: profile?.weight_kg == null ? null : Number(profile.weight_kg),
            sex: profile?.sex ?? null,
          }}
        />
      </div>
    </main>
  );
}
