import { redirect } from "next/navigation";
import { PatientOnboardingForm } from "@/components/onboarding/patient-onboarding-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile setup | Suga.Health" };

export default async function OnboardingPage() {
  const { user } = await requireRole("patient");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, shipping_address, date_of_birth, weight_kg, height_cm, requires_onboarding")
    .eq("id", user.id)
    .single();

  if (!profile?.requires_onboarding) redirect("/patient");

  const address =
    profile.shipping_address &&
    typeof profile.shipping_address === "object" &&
    !Array.isArray(profile.shipping_address) &&
    "line1" in profile.shipping_address
      ? String(profile.shipping_address.line1 ?? "")
      : "";

  return (
    <PatientOnboardingForm
      initial={{
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        email: profile.email ?? user.email ?? "",
        address,
        dateOfBirth: profile.date_of_birth ?? "",
        weightKg: profile.weight_kg === null ? null : Number(profile.weight_kg),
        heightCm: profile.height_cm === null ? null : Number(profile.height_cm),
      }}
    />
  );
}
