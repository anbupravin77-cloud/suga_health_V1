"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { isAppRole, roleCanReturnTo, roleHome } from "@/lib/roles";
import { isQaPatient, QA_FRESH_INTAKE_PATH } from "@/lib/qa-patient";
import styles from "./patient-login-form.module.css";

type LoginMethod = "phone" | "email";

function validIndianMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

export function PatientLoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    // Reading the query on the client keeps the Next.js sign-in page safe to prerender.
    setNext(new URLSearchParams(window.location.search).get("next"));
  }, []);

  const validIdentifier = method === "phone"
    ? validIndianMobile(mobile)
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = !busy && validIdentifier && password.length > 0;
  const signupHref = next && next.startsWith("/") && !next.startsWith("//")
    ? `/sign-up?next=${encodeURIComponent(next)}`
    : "/sign-up";

  function changeMethod() {
    if (busy) return;
    setMethod((current) => current === "phone" ? "email" : "phone");
    setError("");
  }

  function updateMobile(raw: string) {
    const digits = raw.replace(/\D/g, "");
    // Account for pasted Indian numbers with +91 at the start.
    const national = digits.startsWith("91") && digits.length > 10
      ? digits.slice(2)
      : digits;
    setMobile(national.slice(0, 10));
    setError("");
  }

  async function routeUser(userId: string) {
    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile || !isAppRole(profile.role)) {
      setError("Your account could not be loaded. Please contact support.");
      setBusy(false);
      return;
    }

    const role = profile.role;
    if (role === "patient" && isQaPatient(userId)) {
      router.replace(QA_FRESH_INTAKE_PATH);
    } else {
      const destination = next && roleCanReturnTo(role, next) ? next : roleHome(role);
      router.replace(destination);
    }
    router.refresh();
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError("");
    const supabase = createClient();
    try {
      const credentials = method === "phone"
        ? { phone: "+91" + mobile, password }
        : { email: email.trim().toLowerCase(), password };

      const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);
      if (signInError || !data.user || !data.session) {
        setError("The phone number or email and password do not match.");
        setBusy(false);
        return;
      }
      await routeUser(data.user.id);
    } catch {
      setError("We couldn't sign you in. Please try again.");
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(window.location.origin, next),
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) {
        setError("Google sign-in could not be started. Please try again.");
        setBusy(false);
      }
    } catch {
      setError("Google sign-in is temporarily unavailable.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.formArea}>
      <form className={styles.form} onSubmit={signIn} noValidate>
        <div className={styles.field}>
          <div className={styles.fieldHeading}>
            <label htmlFor="login-identifier">
              {method === "phone" ? "Phone number" : "Email address"}
            </label>
            <button
              type="button"
              className={styles.switchMethod}
              onClick={changeMethod}
              disabled={busy}
            >
              {method === "phone" ? "Use email instead" : "Use phone instead"}
            </button>
          </div>
          {method === "phone" ? (
            <div className={styles.phoneInput}>
              <span className={styles.prefix} aria-label="India calling code">+91</span>
              <input
                id="login-identifier"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                placeholder="9876543210"
                value={mobile}
                onChange={(event) => updateMobile(event.target.value)}
                maxLength={10}
                required
              />
            </div>
          ) : (
            <input
              id="login-identifier"
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(""); }}
              required
            />
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">Password</label>
          <div className={styles.passwordWrap}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(""); }}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls="login-password"
            >
              {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={styles.recovery}>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          {busy ? <Loader2 className={styles.spinner} size={18} aria-hidden="true" /> : null}
          {busy ? "Signing in..." : "Sign In"}
          {!busy && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>

      <div className={styles.separator} aria-hidden="true"><span>OR</span></div>

      <button
        type="button"
        className={styles.google}
        onClick={signInWithGoogle}
        disabled={busy}
      >
        <svg viewBox="0 0 18 18" width="21" height="21" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.614Z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"/>
          <path fill="#FBBC05" d="M3.963 10.706A5.42 5.42 0 0 1 3.681 9c0-.592.102-1.167.282-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"/>
        </svg>
        Continue with Google
      </button>

      <p className={styles.register}>
        Don't have an account? <Link href={signupHref}>Create your account</Link>
      </p>
    </div>
  );
}
