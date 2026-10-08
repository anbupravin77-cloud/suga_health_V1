import type { ReactNode } from "react";
import { PatientShell } from "@/components/patient/patient-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireRole("patient");
  const supabase = await createClient();

  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("status", "unread");

  return (
    <PatientShell
      name={profile.full_name || "Patient"}
      unreadNotifications={unreadNotifications ?? 0}
    >
      {children}
    </PatientShell>
  );
}
