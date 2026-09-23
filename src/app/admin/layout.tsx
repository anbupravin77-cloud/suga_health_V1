import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("admin");
  return <AppShell role="admin" name={profile.full_name || "Administrator"}>{children}</AppShell>;
}
