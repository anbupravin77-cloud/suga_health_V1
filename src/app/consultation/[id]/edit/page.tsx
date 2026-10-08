import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import "../../start/standalone.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Continue consultation | Suga.Health" };

export default async function ContinueConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { user } = await requireRole("patient");
  const supabase = await createClient();

  const [{ data: consultation }, { data: profile }] = await Promise.all([
    supabase.from("consultations")
      .select("id, primary_concern, responses, status")
      .eq("id", id)
      .eq("patient_id", user.id)
      .maybeSingle(),
    supabase.from("profiles")
      .select("first_name, last_name, date_of_birth, sex, height_cm, weight_kg")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!consultation) notFound();
  if (consultation.status !== "draft") {
    redirect(`/patient/consultations/${id}`);
  }

  return (
    <main className="patient-v2 standalone-intake">
      <header className="standalone-intake-header">
        <Link href="/" className="standalone-intake-logo" aria-label="Suga.Health home">
          SUGA.HEALTH
        </Link>
        <span className="standalone-intake-private"><LockKeyhole size={15} /> Private consultation</span>
        <Link href="/patient/consultations" className="standalone-intake-exit">
          <ArrowLeft size={15} /> Save and exit
        </Link>
      </header>
      <div className="standalone-intake-content">
        <div className="standalone-intake-intro">
          <h1>Continue your consultation.</h1>
          <p>Your draft is still private. Review the details and submit when you're ready.</p>
        </div>
        {query.error && (
          <p className="page-error" role="alert">
            We couldn't save your consultation. Check the details and try again.
          </p>
        )}
        <ConsultationForm
          draft={{
            id: consultation.id,
            primary_concern: consultation.primary_concern,
            responses: (consultation.responses ?? {}) as Record<string, unknown>,
          }}
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
