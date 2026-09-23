import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAppRole, roleHome, roleOwnsPath } from "@/lib/roles";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase.from("profiles").select("role").single();
      const role = isAppRole(profile?.role) ? profile.role : "patient";
      const rolePath = roleHome(role);
      const safeNext =
        requestedNext &&
        requestedNext.startsWith("/") &&
        !requestedNext.startsWith("//") &&
        roleOwnsPath(role, requestedNext)
          ? requestedNext
          : rolePath;

      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=callback", origin));
}
