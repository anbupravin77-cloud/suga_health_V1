import { NextResponse } from "next/server";
import { getTrustedAppOrigin } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";
import { isAppRole, roleHome, roleCanReturnTo } from "@/lib/roles";
import { isQaPatient, QA_FRESH_INTAKE_PATH } from "@/lib/qa-patient";

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

      // Google sign-in and confirmed email sign-up should replay the same QA flow.
      if (role === "patient" && isQaPatient(user.id)) {
        return NextResponse.redirect(new URL(QA_FRESH_INTAKE_PATH, appOrigin));
      }

      const rolePath = roleHome(role);
      const safeNext =
        requestedNext &&
        requestedNext.startsWith("/") &&
        !requestedNext.startsWith("//") &&
        roleCanReturnTo(role, requestedNext)
          ? requestedNext
          : rolePath;

      return NextResponse.redirect(new URL(safeNext, appOrigin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=callback", appOrigin));
}
