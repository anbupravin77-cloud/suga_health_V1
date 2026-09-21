import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "patient" | "doctor";

type SessionIdentity = {
  id: string;
  email?: string;
};

type CompatibleProfile = {
  id: string;
  role: AppRole;
  full_name: string | null;
};

async function readIdentity(): Promise<SessionIdentity | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims as Record<string, unknown>;
  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) return null;

  return {
    id: sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
  };
}

async function readRoleProfile(identity: SessionIdentity) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .select("id, email, role, display_name, first_name, last_name")
    .eq("id", identity.id)
    .single();
}

export async function requireIdentity() {
  const identity = await readIdentity();
  if (!identity) redirect("/sign-in");
  return identity;
}

async function resolveRole(expectedRole: AppRole, actionMode: boolean) {
  const identity = await readIdentity();
  if (!identity) redirect("/sign-in");

  const { data: legacyProfile, error } = await readRoleProfile(identity);
  if (error || !legacyProfile) redirect("/sign-in?error=profile");

  const role = String(legacyProfile.role) as AppRole;
  if (role !== expectedRole) {
    if (actionMode) redirect("/sign-in?error=role");
    redirect(role === "doctor" ? "/doctor" : "/patient");
  }

  const composedName = [legacyProfile.first_name, legacyProfile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const profile: CompatibleProfile = {
    id: legacyProfile.id,
    role,
    full_name: legacyProfile.display_name || composedName || null,
  };

  return {
    user: {
      id: identity.id,
      email: identity.email || legacyProfile.email || undefined,
    },
    profile,
  };
}

export async function requireRole(expectedRole: AppRole) {
  return resolveRole(expectedRole, false);
}

export async function requireActionRole(expectedRole: AppRole) {
  return resolveRole(expectedRole, true);
}
