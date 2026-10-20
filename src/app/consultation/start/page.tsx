import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isQaPatient } from "@/lib/qa-patient";
import "./standalone.css";
import { BrandLogo } from "@/components/brand-logo";

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
  // Test-only shortcut for the authenticated QA patient account, including
  // production. This only navigates to the dashboard; it never submits data.
  const showQaSkip = isQaPatient(user.id);

  // All patients, including the QA patient in fresh-intake mode, receive their
  // latest profile values. "Fresh" resets clinical answers, not identity data.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, date_of_birth, sex, height_cm, weight_kg")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) {
    throw new Error("Could not load your current patient profile.");
  }

  return (
    <main className="patient-v2 standalone-intake">
      <header className="standalone-intake-header">
        <Link href="/patient" className="standalone-intake-logo" aria-label="Patient dashboard home">
          <BrandLogo size="patient" priority />
        </Link>
        <Link href="/patient" className="standalone-intake-exit">
          <ArrowLeft size={15} /> Exit
        </Link>
      </header>
      <div className="standalone-intake-content">
        <div className="standalone-intake-intro">
          <h1>Suga Health Consultation</h1>
          {replayFirstTime && (
            <p className="standalone-intake-qa-note" role="status">
              Test mode: your saved profile details are prefilled. Consultation answers start fresh, and past consultations are preserved.
            </p>
          )}
        </div>
        {showQaSkip && (
          <div className="mb-5 flex justify-end">
            <Link
              href="/patient"
              className="standalone-intake-qa-skip inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span>Skip for Testing</span> <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
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
