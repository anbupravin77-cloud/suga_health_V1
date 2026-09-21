import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "patient" | "doctor";

export async function requireRole(expectedRole: AppRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/sign-in?error=profile");
  if (profile.role !== expectedRole) redirect(`/${profile.role}`);

  return { user, profile };
}
