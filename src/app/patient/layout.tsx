import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("patient");
  return <AppShell role="patient" name={profile.full_name || "Patient"}>{children}</AppShell>;
}
