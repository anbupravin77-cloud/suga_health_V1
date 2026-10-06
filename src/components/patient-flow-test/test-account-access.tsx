"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";
type Gender = "female" | "male" | "intersex" | "prefer-not-to-say" | "";

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "");
  return /^\+\d{8,15}$/.test(compact) ? compact : null;
}

function splitName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function TestAccountAccess({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  function changeMode(next: Mode) {
    if (loading) return;
    setMode(next);
    setOtpSent(false);
    setOtp("");
    setSentPhone("");
    setError("");
    setMessage("");
    setResendSeconds(0);
  }

  function validateSignup() {
    if (fullName.trim().length < 2) return "Enter your name.";
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge < 18 || numericAge > 120) return "Enter a valid age.";
    if (!gender) return "Select your gender.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    return "";
  }

  async function sendOtp() {
    setError("");
    setMessage("");

    if (mode === "signup") {
      const validationError = validateSignup();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError("Enter your phone number with country code, for example +91 98765 43210.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: { shouldCreateUser: mode === "signup" },
    });
    setLoading(false);

    if (otpError) {
      if (/unsupported phone provider/i.test(otpError.message)) {
        setError("Phone OTP is not configured in Supabase yet.");
      } else if (mode === "login" && /signups? not allowed|user not found|does not exist/i.test(otpError.message)) {
        setError("We could not find an account for this phone number.");
      } else {
        setError(otpError.message || "We couldn't send the OTP. Please try again.");
      }
      return;
    }

    setSentPhone(normalizedPhone);
    setOtp("");
    setOtpSent(true);
    setResendSeconds(60);
    setMessage(`We sent a 6-digit code to ${normalizedPhone}.`);
  }

  async function verifyOtp() {
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
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
      setError("That OTP is invalid or expired. Please try again.");
      return;
    }

    if (mode === "signup") {
      const { firstName, lastName } = splitName(fullName);
      const profileUpdate = await supabase
        .from("profiles")
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          display_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: sentPhone,
          sex: gender || null,
        })
        .eq("id", data.user.id);

      if (profileUpdate.error) {
        setLoading(false);
        setError("Your phone is verified, but we couldn't save your profile details.");
        return;
      }

      const metadataUpdate = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          age: Number(age),
          sex: gender,
          contact_email: email.trim().toLowerCase(),
          patient_flow_test: true,
        },
      });

      if (metadataUpdate.error) {
        setLoading(false);
        setError("Your profile was saved, but account setup could not finish.");
        return;
      }
    } else {
      await supabase
        .from("profiles")
        .update({ phone_number: sentPhone })
        .eq("id", data.user.id);
    }

    setLoading(false);
    router.replace("/patient-flow-test/consultation");
    router.refresh();
  }

  return (
    <main className="pft-shell">
      <div className="pft-orb pft-orb-one" />
      <div className="pft-orb pft-orb-two" />

      <section className="pft-account-frame">
        <header className="pft-topbar">
          <Link href="/landing-test" className="pft-icon-link" aria-label="Back to test landing page">
            <ArrowLeft size={21} />
          </Link>
          <Link href="/landing-test" className="pft-wordmark">
            <strong>Suga.health</strong>
            <span>live naturally</span>
          </Link>
          <span className="pft-topbar-spacer" />
        </header>

        <div className="pft-account-layout">
          <aside className="pft-account-intro">
            <span className="pft-eyebrow">PRIVATE TELEHEALTH CARE</span>
            <h1>{mode === "signup" ? "Your care starts with a secure account." : "Welcome back."}</h1>
            <p>
              {mode === "signup"
                ? "A few basic details, one phone verification, then straight into your consultation."
                : "Verify your phone number and continue where you left off."}
            </p>
            <div className="pft-trust-list">
              <span><ShieldCheck size={18} /> Licensed-clinician review</span>
              <span><Check size={18} /> Private and secure</span>
              <span><Phone size={18} /> Password-free phone access</span>
            </div>
          </aside>

          <section className="pft-form-card">
            <div className="pft-mode-tabs" aria-label="Account access">
              <button type="button" className={mode === "signup" ? "is-active" : ""} onClick={() => changeMode("signup")}>
                Create account
              </button>
              <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => changeMode("login")}>
                Log in
              </button>
            </div>

            {!otpSent ? (
              <>
                <div className="pft-form-heading">
                  <span className="pft-step-label">01 / ACCOUNT</span>
                  <h2>{mode === "signup" ? "Tell us a little about you" : "Log in with your phone"}</h2>
                  <p>{mode === "signup" ? "These details will appear in your patient profile." : "No password needed. We'll send a one-time code."}</p>
                </div>

                {error && <p className="pft-alert pft-alert-error" role="alert">{error}</p>}

                {mode === "signup" && (
                  <div className="pft-field-grid">
                    <label className="pft-field pft-field-wide">
                      <span>Full name</span>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As it appears on your ID" autoComplete="name" />
                    </label>

                    <label className="pft-field">
                      <span>Age</span>
                      <input type="number" min="18" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" inputMode="numeric" />
                    </label>

                    <label className="pft-field">
                      <span>Gender</span>
                      <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="intersex">Intersex</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </label>

                    <label className="pft-field pft-field-wide">
                      <span>Email</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                    </label>
                  </div>
                )}

                <label className="pft-field pft-field-wide">
                  <span>Phone number</span>
                  <div className="pft-phone-input">
                    <Phone size={18} />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" inputMode="tel" />
                  </div>
                </label>

                <button className="pft-primary-button" type="button" disabled={loading} onClick={sendOtp}>
                  {loading ? <Loader2 className="pft-spin" size={19} /> : null}
                  <span>{mode === "signup" ? "Create account & send OTP" : "Send login OTP"}</span>
                </button>

                <button className="pft-text-switch" type="button" onClick={() => changeMode(mode === "signup" ? "login" : "signup")}>
                  {mode === "signup" ? "Already a customer? Log in with phone OTP" : "New to Suga.Health? Create an account"}
                </button>
              </>
            ) : (
              <div className="pft-otp-panel">
                <span className="pft-otp-icon"><ShieldCheck size={28} /></span>
                <span className="pft-step-label">PHONE VERIFICATION</span>
                <h2>Enter your verification code</h2>
                <p>{message}</p>

                {error && <p className="pft-alert pft-alert-error" role="alert">{error}</p>}

                <label className="pft-field">
                  <span>6-digit OTP</span>
                  <input
                    className="pft-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </label>

                <button className="pft-primary-button" type="button" disabled={loading || otp.length !== 6} onClick={verifyOtp}>
                  {loading ? <Loader2 className="pft-spin" size={19} /> : null}
                  <span>Verify & continue</span>
                </button>

                <div className="pft-otp-actions">
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setError(""); setMessage(""); setResendSeconds(0); }}>
                    Change number
                  </button>
                  <button type="button" disabled={resendSeconds > 0 || loading} onClick={sendOtp}>
                    <RefreshCw size={14} />
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
