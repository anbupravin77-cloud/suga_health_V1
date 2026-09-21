import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase.from("profiles").select("role").single();
      const rolePath = profile?.role === "doctor" ? "/doctor" : "/patient";
      const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : rolePath;
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=callback`);
}
