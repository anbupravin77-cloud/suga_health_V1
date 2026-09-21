import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("doctor");
  return <AppShell role="doctor" name={profile.full_name || "Doctor"}>{children}</AppShell>;
}
