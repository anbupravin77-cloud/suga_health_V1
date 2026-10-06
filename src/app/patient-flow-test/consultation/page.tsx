import { redirect } from "next/navigation";
import { TestConsultationForm } from "@/components/patient-flow-test/test-consultation-form";
import { createClient } from "@/lib/supabase/server";

export default async function PatientFlowTestConsultationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/patient-flow-test/account?mode=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, first_name, last_name, email, phone_number, sex, height_cm, weight_kg")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const age = typeof metadata.age === "number" ? metadata.age : Number(metadata.age || 0) || null;

  return (
    <TestConsultationForm
      patient={{
        name: String(profile?.display_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || metadata.full_name || "Patient"),
        email: String(profile?.email || metadata.contact_email || ""),
        phone: String(profile?.phone_number || user.phone || ""),
        age,
        sex: String(profile?.sex || metadata.sex || ""),
        heightCm: profile?.height_cm == null ? null : Number(profile.height_cm),
        weightKg: profile?.weight_kg == null ? null : Number(profile.weight_kg),
      }}
    />
  );
}
