import { NextResponse } from "next/server";
import { getTrustedAppOrigin } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";
import { isAppRole, roleHome, roleOwnsPath } from "@/lib/roles";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const appOrigin = getTrustedAppOrigin(requestUrl.origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(new URL("/sign-in?error=session", appOrigin));
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, requires_onboarding")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        return NextResponse.redirect(new URL("/sign-in?error=profile", appOrigin));
      }

      const profileRole = profile.role;
      const role = isAppRole(profileRole) ? profileRole : "patient";

      if (role === "patient" && profile.requires_onboarding) {
        return NextResponse.redirect(new URL("/onboarding", appOrigin));
      }

      const rolePath = roleHome(role);
      const safeNext =
        requestedNext &&
        requestedNext.startsWith("/") &&
        !requestedNext.startsWith("//") &&
        roleOwnsPath(role, requestedNext)
          ? requestedNext
          : rolePath;

      return NextResponse.redirect(new URL(safeNext, appOrigin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=callback", appOrigin));
}
