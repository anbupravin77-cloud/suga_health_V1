import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PatientShell } from "@/components/patient/patient-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireRole("patient");
  const supabase = await createClient();

  const [{ data }, { count: unreadNotifications }] = await Promise.all([
    supabase
      .from("profiles")
      .select("requires_onboarding")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "unread"),
  ]);

  if (data?.requires_onboarding) redirect("/onboarding");

  return (
    <PatientShell
      name={profile.full_name || "Patient"}
      unreadNotifications={unreadNotifications ?? 0}
    >
      {children}
    </PatientShell>
  );
}
