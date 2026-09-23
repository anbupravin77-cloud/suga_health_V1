import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppRole, roleHome, type AppRole } from "@/lib/roles";

export type { AppRole } from "@/lib/roles";

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

  const { data: profileRecord, error } = await readRoleProfile(identity);
  if (error || !profileRecord) redirect("/sign-in?error=profile");

  const role: AppRole = isAppRole(profileRecord.role) ? profileRecord.role : "patient";
  if (role !== expectedRole) {
    if (actionMode) redirect("/sign-in?error=role");
    redirect(roleHome(role));
  }

  const composedName = [profileRecord.first_name, profileRecord.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const profile: CompatibleProfile = {
    id: profileRecord.id,
    role,
    full_name: profileRecord.display_name || composedName || null,
  };

  return {
    user: {
      id: identity.id,
      email: identity.email || profileRecord.email || undefined,
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
