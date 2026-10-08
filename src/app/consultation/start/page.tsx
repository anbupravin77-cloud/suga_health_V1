import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ConsultationForm } from "@/components/care/consultation-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import "./standalone.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start consultation | Suga.Health" };

export default async function StartConsultationPage() {
  const { user } = await requireRole("patient");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, date_of_birth, sex, height_cm, weight_kg")
    .eq("id", user.id)
    .maybeSingle();

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
          <h1>Let's get to know your health.</h1>
          <p>One guided form for your details and consultation. Your clinician receives the answers only when you submit.</p>
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
