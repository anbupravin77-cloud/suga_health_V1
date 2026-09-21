"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {isSignUp && (
        <label>
          Full name
          <input name="fullName" type="text" autoComplete="name" required />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      {mode !== "forgot-password" && (
        <label>
          Password
          <input name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} minLength={8} required />
        </label>
      )}
      {isSignIn && <Link className="form-link" href="/forgot-password">Forgot password?</Link>}
      <button className="button button-primary auth-submit" type="submit" disabled={loading}>
        {loading ? "Please wait…" : isSignIn ? "Sign in" : isSignUp ? "Create account" : "Send reset link"}
      </button>
      {mode !== "forgot-password" && (
        <>
          <div className="auth-divider"><span>or</span></div>
          <button className="button button-secondary auth-submit" type="button" onClick={signInWithGoogle} disabled={loading}>
            Continue with Google
          </button>
        </>
      )}
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {message && <p className="form-message form-success" role="status">{message}</p>}
      <p className="auth-switch">
        {isSignIn ? "New to Suga.Health? " : isSignUp ? "Already have an account? " : "Remembered your password? "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"}>{isSignIn ? "Create account" : "Sign in"}</Link>
      </p>
    </form>
  );
}
