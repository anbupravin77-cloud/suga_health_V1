import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function PharmacistLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("pharmacist");
  return <AppShell role="pharmacist" name={profile.full_name || "Pharmacist"}>{children}</AppShell>;
}
