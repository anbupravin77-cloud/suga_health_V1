"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/sign-in?error=session");
      router.refresh();
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, requires_onboarding")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      router.replace("/sign-in?error=profile");
      router.refresh();
      return;
    }

    const profileRole = profile.role;
    const role = isAppRole(profileRole) ? profileRole : "patient";

    if (role === "patient" && profile.requires_onboarding) {
      router.replace("/onboarding");
      router.refresh();
      return;
    }

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
    const supabase = createClient();

    if (mode === "forgot-password") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl(window.location.origin, "/patient"),
      });
      setLoading(false);
      if (resetError) return setError("We couldn't send the reset link. Please try again.");
      return setMessage("Check your email for a password reset link.");
    }

    if (mode === "sign-up") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(window.location.origin),
        },
      });

      if (signUpError) {
        setLoading(false);
        return setError("We couldn't create your account. Please review the details and try again.");
      }

      if (signUpData.session) {
        await routeAuthenticatedUser();
        return;
      }

      setLoading(false);
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

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: isSignUp,
      },
    });

    setLoading(false);

    if (otpError) {
      if (/unsupported phone provider/i.test(otpError.message)) {
        setError("Mobile OTP is not configured on the server yet. Please use Email or Google while SMS setup is being completed.");
      } else if (isSignIn && /signups? not allowed|user not found|does not exist/i.test(otpError.message)) {
        setError("No account was found for this mobile number. Create a patient account first.");
      } else {
        setError("We couldn't send the OTP. Please try again.");
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
        redirectTo: getAuthCallbackUrl(window.location.origin, searchParams.get("next")),
        queryParams: { prompt: "select_account" },
      },
    });
    if (oauthError) {
      setLoading(false);
      setError("Google sign-in could not be started. Please try again.");
    }
  }

  return (
    <div className="auth-form-premium">
      {mode !== "forgot-password" && !otpSent && (
        <>
          <nav className="auth-route-tabs" aria-label="Account access">
            <Link href="/sign-in" className={isSignIn ? "is-active" : ""} aria-current={isSignIn ? "page" : undefined}>
              Sign In
            </Link>
            <Link href="/sign-up" className={isSignUp ? "is-active" : ""} aria-current={isSignUp ? "page" : undefined}>
              Sign Up
            </Link>
          </nav>

          <div className="auth-method-tabs" aria-label="Choose authentication method">
            <button type="button" onClick={() => selectMethod("email")} className={authMethod === "email" ? "is-active" : ""} aria-pressed={authMethod === "email"}>
              <Mail aria-hidden="true" />
              Email
            </button>
            <button type="button" onClick={() => selectMethod("phone")} className={authMethod === "phone" ? "is-active" : ""} aria-pressed={authMethod === "phone"}>
              <Phone aria-hidden="true" />
              Mobile OTP
            </button>
          </div>
        </>
      )}

      {error && <div className="auth-notice auth-notice-error" role="alert">{error}</div>}
      {message && <div className="auth-notice auth-notice-success" role="status">{message}</div>}

      {(mode === "forgot-password" || authMethod === "email") && !otpSent && (
        <form onSubmit={handleSubmit} className="auth-fields">
          <label className="auth-field" htmlFor="email">
            <span>Email Address</span>
            <div className="auth-input-shell">
              <Mail aria-hidden="true" />
              <input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required />
            </div>
          </label>

          {mode !== "forgot-password" && (
            <label className="auth-field" htmlFor="password">
              <span>Password</span>
              <div className="auth-input-shell">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </label>
          )}

          {isSignIn && (
            <div className="auth-forgot-row">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          )}

          <button type="submit" disabled={loading} className="suga-btn suga-btn-primary suga-btn-full auth-primary-action">
            <span>{loading ? "Please wait" : mode === "sign-in" ? "Sign In" : mode === "sign-up" ? "Create Patient Account" : "Send Reset Link"}</span>
            {loading ? <Loader2 className="auth-spinner" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
        </form>
      )}

      {mode !== "forgot-password" && authMethod === "phone" && !otpSent && (
        <div className="auth-fields">
          <label className="auth-field" htmlFor="mobileNumber">
            <span>Mobile Number</span>
            <div className="auth-input-shell auth-phone-shell">
              <Phone aria-hidden="true" />
              <input
                id="mobileNumber"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
              />
            </div>
          </label>

          <button type="button" disabled={loading} onClick={sendPhoneOtp} className="suga-btn suga-btn-primary suga-btn-full auth-primary-action">
            <span>{loading ? "Please wait" : isSignUp ? "Send OTP & Continue" : "Send OTP"}</span>
            {loading ? <Loader2 className="auth-spinner" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
        </div>
      )}

      {otpSent && (
        <form onSubmit={verifyPhoneOtp} className="auth-fields auth-otp-fields">
          <div className="auth-otp-heading">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>Verify your mobile</strong>
              <span>{sentPhone}</span>
            </div>
          </div>

          <label className="auth-field" htmlFor="phoneOtp">
            <span>Verification Code</span>
            <div className="auth-input-shell">
              <input
                id="phoneOtp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="auth-otp-input"
                autoFocus
              />
            </div>
          </label>

          <button type="submit" disabled={loading || otp.length !== 6} className="suga-btn suga-btn-primary suga-btn-full auth-primary-action">
            <span>{loading ? "Please wait" : "Verify & Continue"}</span>
            {loading ? <Loader2 className="auth-spinner" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>

          <div className="auth-otp-actions">
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
            >
              Change number
            </button>

            <button type="button" disabled={loading || resendSeconds > 0} onClick={resendPhoneOtp}>
              <RefreshCw aria-hidden="true" />
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {mode !== "forgot-password" && !otpSent && (
        <>
          <div className="auth-divider"><span>OR</span></div>
          <button type="button" onClick={signInWithGoogle} disabled={loading} className="suga-btn suga-btn-secondary suga-btn-full auth-google-action">
            <span className="auth-google-mark" aria-hidden="true">
              <svg viewBox="0 0 18 18" role="img" focusable="false">
                <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.614Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.963 10.706A5.42 5.42 0 0 1 3.681 9c0-.592.102-1.167.282-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
              </svg>
            </span>
            <span>Continue with Google</span>
          </button>
        </>
      )}

      {mode === "forgot-password" && (
        <div className="auth-reset-return">
          <Link href="/sign-in">Back to Sign In</Link>
        </div>
      )}
    </div>
  );
}
