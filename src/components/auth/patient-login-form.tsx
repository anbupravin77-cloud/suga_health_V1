"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAppRole, roleCanReturnTo, roleHome } from "@/lib/roles";
import { isQaPatient, QA_FRESH_INTAKE_PATH } from "@/lib/qa-patient";
import styles from "./patient-login-form.module.css";

function validIndianMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

export function PatientLoginForm() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    // Reading the query on the client keeps the Next.js sign-in page safe to prerender.
    setNext(new URLSearchParams(window.location.search).get("next"));
  }, []);

  const canSubmit = !busy && validIndianMobile(mobile) && password.length > 0;
  const signupHref = next && next.startsWith("/") && !next.startsWith("//")
    ? `/sign-up?next=${encodeURIComponent(next)}`
    : "/sign-up";

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
      const credentials = { phone: "+91" + mobile, password };

      const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);
      if (signInError || !data.user || !data.session) {
        setError("The phone number and password do not match.");
        setBusy(false);
        return;
      }
      await routeUser(data.user.id);
    } catch {
      setError("We couldn't sign you in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.formArea}>
      <form className={styles.form} onSubmit={signIn} noValidate>
        <div className={styles.field}>
          <label htmlFor="login-identifier">Phone number</label>
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

      <p className={styles.register}>
        Don't have an account? <Link href={signupHref}>Create your account</Link>
      </p>
    </div>
  );
}
