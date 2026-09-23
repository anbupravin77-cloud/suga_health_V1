export type AppRole = "patient" | "doctor" | "pharmacist" | "admin";

const ROLE_HOMES: Record<AppRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  pharmacist: "/pharmacist",
  admin: "/admin",
};

export function isAppRole(value: unknown): value is AppRole {
  return value === "patient" || value === "doctor" || value === "pharmacist" || value === "admin";
}

export function roleHome(role: AppRole) {
  return ROLE_HOMES[role];
}

export function roleOwnsPath(role: AppRole, path: string) {
  const home = roleHome(role);
  return path === home || path.startsWith(`${home}/`);
}
