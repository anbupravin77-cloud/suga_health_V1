"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { roleCanReturnTo } from "@/lib/roles";
import styles from "./phone-signup-form.module.css";

type Gender = "" | "male" | "female" | "other" | "prefer-not-to-say";
type OtpStage = "idle" | "sent" | "verified";
const OTP_COOLDOWN_SECONDS = 60;

function calculateAge(dob: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const date = new Date(dob + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dob) return null;
  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  if (now.getUTCMonth() < date.getUTCMonth() ||
      (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate())) {
    years--;
  }
  return years;
}

function validPhone(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

export function PhoneSignupForm() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStage, setOtpStage] = useState<OtpStage>("idle");
  const [otpPhone, setOtpPhone] = useState("");
  const [verifiedUserId, setVerifiedUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const phone = "+91" + digits;
  const ageFromDob = calculateAge(birthDate);
  const requestedAge = Number(age);
  const ageMatches = age !== "" &&
    Number.isInteger(requestedAge) &&
    requestedAge >= 18 && requestedAge <= 120 &&
    ageFromDob !== null && ageFromDob === requestedAge;
  const nameValid = name.trim().length >= 2 && name.trim().length <= 100;
  const emailValid = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch = password.length >= 8 && password === confirmPassword;
  const phoneVerified = otpStage === "verified" && otpPhone === phone && verifiedUserId !== "";
  const canCreate = !busy && nameValid && ageMatches && gender !== "" &&
    validPhone(digits) && emailValid && passwordsMatch && phoneVerified;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  function updatePhone(raw: string) {
    // Country code is fixed to India for this version of the patient form.
    const localDigits = raw.replace(/\D/g, "").slice(0, 10);
    setDigits(localDigits);
    setOtpStage("idle");
    setOtpPhone("");
    setVerifiedUserId("");
    setOtp("");
    setError("");
    setNotice("");
  }

  async function sendOtp() {
    if (!validPhone(digits) || busy || cooldown > 0 || otpStage === "verified") return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: sendError } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (sendError) {
        setError(/unsupported phone provider|sms provider|phone provider/i.test(sendError.message)
          ? "SMS verification is not configured yet. Please contact support."
          : "Could not send an OTP. Check your number and try again.");
        return;
      }
      setOtpStage("sent");
      setOtpPhone(phone);
      setOtp("");
      setCooldown(OTP_COOLDOWN_SECONDS);
      setNotice("We sent a verification code to your mobile number.");
    } catch {
      setError("Could not contact the verification service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    if (otpStage !== "sent" || otpPhone !== phone || !/^\d{6}$/.test(otp) || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: otpPhone,
        token: otp,
        type: "sms",
      });
      if (verifyError || !data.user || data.user.phone !== otpPhone || !data.user.phone_confirmed_at) {
        setError("The verification code is incorrect or expired. Please try again.");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, display_name, profile_completed_at")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profileError || !profile) {
        setError("We could not check your account status. Please contact support.");
        return;
      }
      if (profile.role !== "patient" || profile.profile_completed_at || profile.display_name?.trim()) {
        await supabase.auth.signOut();
        setOtpStage("idle");
        setError("This number is already registered. Use the sign-in link below.");
        return;
      }
      setVerifiedUserId(data.user.id);
      setOtpStage("verified");
      setNotice("Phone number verified. Complete your details to create your account.");
    } catch {
      setError("Could not verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user ||
          auth.user.id !== verifiedUserId ||
          auth.user.phone !== phone ||
          !auth.user.phone_confirmed_at) {
        setVerifiedUserId("");
        setOtpStage("idle");
        setError("Phone verification expired. Please verify your number again.");
        return;
      }
      const computedAge = calculateAge(birthDate);
      if (computedAge === null || computedAge !== Number(age) || computedAge < 18) {
        setError("Your age must match your date of birth. Registration is for adults aged 18 or older.");
        return;
      }
      const parts = name.trim().split(/\s+/);
      const firstName = parts.shift() ?? "";
      const lastName = parts.join(" ");

      const { error: passwordError } = await supabase.auth.updateUser({
        password,
        data: { full_name: name.trim(), first_name: firstName, last_name: lastName },
      });
      if (passwordError) {
        setError("Could not save your password. Please try again.");
        return;
      }

      const { data: savedProfile, error: saveError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          display_name: name.trim(),
          date_of_birth: birthDate,
          sex: gender,
          phone_number: phone,
          email: email.trim() ? email.trim().toLowerCase() : null,
        })
        .eq("id", verifiedUserId)
        .select("id")
        .single();

      if (saveError || !savedProfile) {
        setError("Your phone is verified, but we could not save your details. Please retry.");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && roleCanReturnTo("patient", next) ? next : "/patient");
      router.refresh();
    } catch {
      setError("Unable to finish registration. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const validDob = ageFromDob !== null && ageFromDob >= 18 && ageFromDob <= 120;
  const dobAgeError = age !== "" && birthDate !== "" && !ageMatches;
  const phoneHint = otpStage === "verified"
    ? "Verified with Supabase SMS OTP"
    : otpStage === "sent" ? "Enter the code sent to your phone." : "";

  return (
    <form className={styles.form} onSubmit={createAccount} noValidate>
      <div className={styles.field}>
        <label htmlFor="signup-name">Name</label>
        <input
          id="signup-name" autoComplete="name" type="text" value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your full name" minLength={2} maxLength={100} required
        />
      </div>

      <div className={styles.twoColumn}>
        <div className={styles.field}>
          <label htmlFor="signup-age">Age</label>
          <input
            id="signup-age" type="number" min={18} max={120} inputMode="numeric"
            value={age} onChange={(event) => setAge(event.target.value)}
            placeholder="18+" required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="signup-dob">Date of birth</label>
          <input
            id="signup-dob" type="date" value={birthDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setBirthDate(event.target.value)}
            required
          />
        </div>
      </div>
      {dobAgeError && (
        <p className={styles.validation} role="status">
          {validDob ? "Age and date of birth must match." : "Registration is for adults aged 18 or older."}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="signup-gender">Gender</label>
        <select
          id="signup-gender" value={gender} required
          onChange={(event) => setGender(event.target.value as Gender)}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-email">Email for notifications <span className={styles.optional}>(optional)</span></label>
        <input
          id="signup-email" type="email" inputMode="email" autoComplete="email"
          value={email} onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-password">Enter new password</label>
        <div className={styles.passwordWrap}>
          <input
            id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password"
            value={password} onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters" minLength={8} required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls="signup-password"
          >
            {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-confirm">Confirm password</label>
        <div className={styles.passwordWrap}>
          <input
            id="signup-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
            value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password" minLength={8} required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
            aria-pressed={showConfirmPassword}
            aria-controls="signup-confirm"
          >
            {showConfirmPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        </div>
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <span className={styles.validation}>Passwords do not match.</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-phone">Phone number</label>
        <div className={styles.phoneInput}>
          <span className={styles.prefix} aria-label="India country code">+91</span>
          <input
            id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel-national"
            pattern="[6-9][0-9]{9}" minLength={10} maxLength={10}
            value={digits} onChange={(event) => updatePhone(event.target.value)}
            placeholder="9876543210" required
          />
        </div>
      </div>

      <div className={styles.otpBlock}>
        {otpStage !== "verified" && (
          <button
            type="button" className={styles.otpTrigger}
            onClick={sendOtp} disabled={busy || !validPhone(digits) || cooldown > 0}
          >
            {busy ? <Loader2 className={styles.spin} size={17} aria-hidden="true" /> : <ShieldCheck size={17} aria-hidden="true" />}
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Click for OTP verification"}
          </button>
        )}
        {otpStage === "sent" && (
          <div className={styles.otpEntry}>
            <div className={styles.field}>
              <label htmlFor="signup-otp">OTP verification code</label>
              <input
                id="signup-otp" type="text" inputMode="numeric" autoComplete="one-time-code"
                value={otp} maxLength={6} pattern="[0-9]{6}"
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button type="button" className={styles.verifyButton} onClick={verifyOtp} disabled={busy || otp.length !== 6}>
              Verify OTP <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
        {otpStage === "verified" && (
          <p className={styles.verified}><CheckCircle2 size={18} aria-hidden="true" /> Phone verified</p>
        )}
        {phoneHint && otpStage !== "verified" && <p className={styles.hint}>{phoneHint}</p>}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <button type="submit" className={styles.createButton} disabled={!canCreate}>
        {busy ? <Loader2 className={styles.spin} size={18} aria-hidden="true" /> : null}
        Create Account
        {!busy && <ArrowRight size={17} aria-hidden="true" />}
      </button>

      <p className={styles.loginText}>
        If you already registered, <Link href="/sign-in">login here</Link>.
      </p>
    </form>
  );
}
