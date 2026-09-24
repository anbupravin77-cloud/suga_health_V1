import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireRole("patient");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("requires_onboarding")
    .eq("id", user.id)
    .single();

  if (data?.requires_onboarding) redirect("/onboarding");

  return <AppShell role="patient" name={profile.full_name || "Patient"}>{children}</AppShell>;
}
