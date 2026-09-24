"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAppRole, roleHome, roleOwnsPath } from "@/lib/roles";

type Mode = "sign-in" | "sign-up" | "forgot-password";
type AuthMethod = "email" | "phone";

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "");
  return /^\+\d{8,15}$/.test(compact) ? compact : null;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [phone, setPhone] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const isSignIn = mode === "sign-in";
  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  async function routeAuthenticatedUser() {
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("role").single();
    const profileRole = profile?.role;
    const role = isAppRole(profileRole) ? profileRole : "patient";
    const fallback = searchParams.get("next");
    router.replace(fallback && roleOwnsPath(role, fallback) ? fallback : roleHome(role));
    router.refresh();
  }

  function selectMethod(method: AuthMethod) {
    if (loading) return;
    setAuthMethod(method);
    setError("");
    setMessage("");
    setOtp("");
    setOtpSent(false);
    setSentPhone("");
    setResendSeconds(0);
  }

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

    await routeAuthenticatedUser();
  }

  async function sendPhoneOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setLoading(false);
      setError("Enter a valid mobile number with country code, for example +91 98765 43210.");
      return;
    }

    if (isSignUp && phoneName.trim().length < 2) {
      setLoading(false);
      setError("Enter your full name before requesting the OTP.");
      return;
    }

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: isSignUp,
        data: isSignUp ? { full_name: phoneName.trim() } : undefined,
      },
    });

    setLoading(false);

    if (otpError) {
      if (isSignIn && /signups? not allowed|user not found|does not exist/i.test(otpError.message)) {
        setError("No account was found for this mobile number. Create a patient account first.");
      } else {
        setError(otpError.message || "We couldn't send the OTP. Please try again.");
      }
      return;
    }

    setSentPhone(normalizedPhone);
    setOtp("");
    setOtpSent(true);
    setResendSeconds(60);
    setMessage(`A 6-digit OTP was sent to ${normalizedPhone}.`);
  }

  async function verifyPhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your mobile.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: sentPhone,
      token: otp,
      type: "sms",
    });

    if (verifyError || !data.user) {
      setLoading(false);
      setError("The OTP is invalid or expired. Check the code and try again.");
      return;
    }

    await supabase
      .from("profiles")
      .update({
        phone_number: sentPhone,
        ...(isSignUp && phoneName.trim() ? { display_name: phoneName.trim() } : {}),
      })
      .eq("id", data.user.id);

    await routeAuthenticatedUser();
  }

  async function resendPhoneOtp() {
    if (resendSeconds > 0 || loading) return;
    await sendPhoneOtp();
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (oauthError) {
      setLoading(false);
      setError("Google sign-in could not be started. Please try again.");
    }
  }

  return (
    <div>
      {mode !== "forgot-password" && !otpSent && (
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone-100 p-1" aria-label="Choose sign in method">
          <button
            type="button"
            onClick={() => selectMethod("email")}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-all ${
              authMethod === "email"
                ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
                : "text-stone-500 hover:text-stone-900"
            }`}
            aria-pressed={authMethod === "email"}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => selectMethod("phone")}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-all ${
              authMethod === "phone"
                ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
                : "text-stone-500 hover:text-stone-900"
            }`}
            aria-pressed={authMethod === "phone"}
          >
            <Phone className="h-3.5 w-3.5" />
            Mobile OTP
          </button>
        </div>
      )}

      {error && <div className="mb-5 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200" role="alert">{error}</div>}
      {message && <div className="mb-5 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200" role="status">{message}</div>}

      {(mode === "forgot-password" || authMethod === "email") && !otpSent && (
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  minLength={8}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 pr-11 text-xs focus:border-stone-900 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-950"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {isSignIn && (
            <div className="flex justify-end">
              <Link className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4" href="/forgot-password">Forgot password?</Link>
            </div>
          )}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50 cursor-pointer shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "sign-in" ? "Sign In" : mode === "sign-up" ? "Create Patient Account" : "Send Reset Link"}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>
      )}

      {mode !== "forgot-password" && authMethod === "phone" && !otpSent && (
        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="phoneFullName" className="mb-1 block text-xs font-semibold text-stone-700">Full Name</label>
              <input
                id="phoneFullName"
                type="text"
                value={phoneName}
                onChange={(event) => setPhoneName(event.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="mobileNumber" className="mb-1 block text-xs font-semibold text-stone-700">Mobile Number</label>
            <input
              id="mobileNumber"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-xs focus:border-stone-900 focus:outline-none"
            />
            <p className="mt-1.5 text-[10px] leading-4 text-stone-400">Include the country code. We will send a 6-digit verification code by SMS.</p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={sendPhoneOtp}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            {isSignUp ? "Send OTP & Continue" : "Send OTP"}
          </button>

          <div className="flex items-start gap-2.5 rounded-lg bg-stone-50 px-3 py-2.5 text-[10px] leading-4 text-stone-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-700" />
            <span>{isSignUp ? "Mobile sign-up creates a patient account. Staff accounts remain administrator-managed." : "Sign in will only work for an existing account registered with this mobile number."}</span>
          </div>
        </div>
      )}

      {otpSent && (
        <form onSubmit={verifyPhoneOtp} className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4" />
              Verify your mobile
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-stone-500">Enter the 6-digit OTP sent to {sentPhone}.</p>
          </div>

          <div>
            <label htmlFor="phoneOtp" className="mb-1 block text-xs font-semibold text-stone-700">Verification Code</label>
            <input
              id="phoneOtp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-3 text-center text-lg font-semibold tracking-[0.35em] focus:border-stone-900 focus:outline-none"
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading || otp.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50 cursor-pointer shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify & Continue
          </button>

          <div className="flex items-center justify-between gap-3 text-[10px]">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
                setError("");
                setResendSeconds(0);
              }}
              className="font-semibold text-stone-600 underline underline-offset-4 hover:text-stone-950 disabled:opacity-50"
            >
              Change number
            </button>

            <button
              type="button"
              disabled={loading || resendSeconds > 0}
              onClick={resendPhoneOtp}
              className="flex items-center gap-1.5 font-semibold text-stone-600 hover:text-stone-950 disabled:text-stone-400"
            >
              <RefreshCw className="h-3 w-3" />
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {mode !== "forgot-password" && !otpSent && (
        <>
          <div className="mt-5 relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[9px] font-semibold uppercase tracking-wider text-stone-400 absolute">Or continue with</span>
          </div>
          <div className="mt-5">
            <button type="button" onClick={signInWithGoogle} disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50 cursor-pointer shadow-sm">
              <Mail className="h-4 w-4 text-stone-500" />
              Continue with Google
            </button>
          </div>
        </>
      )}

      <p className="mt-5 text-center text-xs text-stone-500">
        {isSignIn ? (
          <>New patient? <Link href="/sign-up" className="font-semibold text-stone-950 underline underline-offset-4">Create account</Link></>
        ) : isSignUp ? (
          <>Already registered? <Link href="/sign-in" className="font-semibold text-stone-950 underline underline-offset-4">Sign in</Link></>
        ) : (
          <>Remembered your password? <Link href="/sign-in" className="font-semibold text-stone-950 underline underline-offset-4">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
