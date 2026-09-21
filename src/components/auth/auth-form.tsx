"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up" | "forgot-password";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");
    const supabase = createClient();

    if (mode === "forgot-password") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/patient`,
      });
      setLoading(false);
      if (resetError) return setError("We couldn't send the reset link. Please try again.");
      return setMessage("Check your email for a password reset link.");
    }

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      });
      setLoading(false);
      if (signUpError) return setError("We couldn't create your account. Please review the details and try again.");
      return setMessage("Account created. Check your email to confirm your address.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      return setError("The email or password is incorrect.");
    }

    const { data: profile } = await supabase.from("profiles").select("role").single();
    const fallback = searchParams.get("next");
    router.replace(fallback || (profile?.role === "doctor" ? "/doctor" : "/patient"));
    router.refresh();
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setLoading(false);
      setError("Google sign-in could not be started. Please try again.");
    }
  }

  const isSignIn = mode === "sign-in";
  const isSignUp = mode === "sign-up";

  return (
    <div>
      {mode !== "forgot-password" && (
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-stone-50 p-1 border border-stone-200">
          <Link href="/sign-in" className={"rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors " + (isSignIn ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900")}>Sign In</Link>
          <Link href="/sign-up" className={"rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors " + (isSignUp ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900")}>New Patient</Link>
        </div>
      )}

      {error && <div className="mb-5 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200" role="alert">{error}</div>}
      {message && <div className="mb-5 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200" role="status">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-semibold text-stone-700">Full Name</label>
            <input id="fullName" name="fullName" type="text" autoComplete="name" className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none" required />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold text-stone-700">Email Address</label>
          <input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none" required />
        </div>
        {mode !== "forgot-password" && (
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-stone-700">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete={isSignIn ? "current-password" : "new-password"} minLength={8} className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none" required />
          </div>
        )}

        {isSignIn && <div className="flex justify-end"><Link className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4" href="/forgot-password">Forgot password?</Link></div>}

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50 cursor-pointer shadow-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "sign-in" ? "Sign In" : mode === "sign-up" ? "Create Patient Account" : "Send Reset Link"}
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>

      {mode !== "forgot-password" && (
        <>
          <div className="mt-5 relative flex items-center justify-center"><div className="border-t border-stone-200 w-full" /><span className="bg-white px-3 text-[9px] font-semibold uppercase tracking-wider text-stone-400 absolute">Or continue with</span></div>
          <div className="mt-5"><button type="button" onClick={signInWithGoogle} disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50 cursor-pointer shadow-sm"><Mail className="h-4 w-4 text-stone-500" />Continue with Google</button></div>
        </>
      )}

      <p className="mt-5 text-center text-xs text-stone-500">
        {isSignIn ? <>New to Suga.Health? <Link href="/sign-up" className="font-semibold text-stone-950 underline underline-offset-4">Create account</Link></> : isSignUp ? <>Already have an account? <Link href="/sign-in" className="font-semibold text-stone-950 underline underline-offset-4">Sign in</Link></> : <>Remembered your password? <Link href="/sign-in" className="font-semibold text-stone-950 underline underline-offset-4">Sign in</Link></>}
      </p>
    </div>
  );
}
