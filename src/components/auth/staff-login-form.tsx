"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAppRole, roleCanReturnTo, roleHome } from "@/lib/roles";
import styles from "./patient-login-form.module.css";

/**
 * Email-password entry for existing staff and QA accounts.
 * It does not grant or select a role. Server layouts enforce roles separately.
 * No credentials are embedded in the client or supplied as defaults.
 */
export function StaffLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = !busy && validEmail && password.length > 0;

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError("");
    const supabase = createClient();

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError || !data.user || !data.session) {
        setError("The email address or password is incorrect.");
        setBusy(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile || !isAppRole(profile.role)) {
        await supabase.auth.signOut();
        setError("Your account does not have an accessible dashboard. Contact an administrator.");
        setBusy(false);
        return;
      }

      // Existing QA patient accounts go to their dashboard on this testing
      // entry point; normal patient login retains its own intake redirect.
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const destination = requestedNext && roleCanReturnTo(profile.role, requestedNext)
        ? requestedNext
        : roleHome(profile.role);

      router.replace(destination);
      router.refresh();
    } catch {
      setError("Sign in failed. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.formArea}>
      <form className={styles.form} onSubmit={signIn} noValidate>
        <div className={styles.field}>
          <label htmlFor="admin-login-email">Email address</label>
          <input
            id="admin-login-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setError(""); }}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="admin-login-password">Password</label>
          <div className={styles.passwordWrap}>
            <input
              id="admin-login-password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls="admin-login-password"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword
                ? <EyeOff size={19} aria-hidden="true" />
                : <Eye size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={styles.recovery}>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          {busy && <Loader2 size={18} className={styles.spinner} aria-hidden="true" />}
          {busy ? "Signing in..." : "Sign In"}
          {!busy && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>

      <p className={styles.register}>
        Patient phone login? <Link href="/sign-in">Go to Sign In</Link>
      </p>
    </div>
  );
}
