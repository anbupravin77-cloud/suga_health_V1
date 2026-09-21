import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "patient" | "doctor";

type CompatibleProfile = {
  id: string;
  role: AppRole;
  full_name: string | null;
};

export async function requireRole(expectedRole: AppRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // The currently connected Supabase project still uses the legacy profile
  // name fields. Keep the V1 UI compatible without changing the database
  // schema during the frontend testing phase.
  const { data: legacyProfile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (error || !legacyProfile) redirect("/sign-in?error=profile");

  const role = String(legacyProfile.role) as AppRole;
  if (role !== expectedRole) redirect(role === "doctor" ? "/doctor" : "/patient");

  const composedName = [legacyProfile.first_name, legacyProfile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const profile: CompatibleProfile = {
    id: legacyProfile.id,
    role,
    full_name: legacyProfile.display_name || composedName || null,
  };

  return { user, profile };
}
