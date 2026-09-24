"use client";

import { Eye, EyeOff, Loader2, MoveRight } from "lucide-react";
import { useActionState, useState } from "react";
import { completePatientOnboarding, type OnboardingState } from "@/app/actions";
import styles from "./patient-onboarding-form.module.css";

type InitialProfile = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  dateOfBirth: string;
  weightKg: number | null;
  heightCm: number | null;
};

const initialState: OnboardingState = { error: "" };

function rounded(value: number) {
  return String(Math.round(value * 10) / 10);
}

export function PatientOnboardingForm({ initial }: { initial: InitialProfile }) {
  const [state, action, pending] = useActionState(completePatientOnboarding, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightValue, setWeightValue] = useState(initial.weightKg ? rounded(initial.weightKg) : "");
  const [heightValue, setHeightValue] = useState(initial.heightCm ? rounded(initial.heightCm) : "");

  function changeWeightUnit(next: "kg" | "lb") {
    if (next === weightUnit) return;
    const current = Number(weightValue);
    if (Number.isFinite(current) && current > 0) {
      setWeightValue(rounded(next === "lb" ? current * 2.2046226218 : current / 2.2046226218));
    }
    setWeightUnit(next);
  }

  function changeHeightUnit(next: "cm" | "in") {
    if (next === heightUnit) return;
    const current = Number(heightValue);
    if (Number.isFinite(current) && current > 0) {
      setHeightValue(rounded(next === "in" ? current / 2.54 : current * 2.54));
    }
    setHeightUnit(next);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>SUGA.HEALTH</span>
        <span className={styles.step}>Profile setup</span>
      </header>

      <section className={styles.stage}>
        <h1 className={styles.title}>Complete your profile</h1>

        <form action={action} className={styles.form} noValidate>
          <fieldset className={styles.group}>
            <legend>Your name</legend>
            <div className={styles.twoColumn}>
              <label className={styles.field}>
                <span>First name</span>
                <input name="first_name" defaultValue={initial.firstName} autoComplete="given-name" required />
              </label>
              <label className={styles.field}>
                <span>Last name</span>
                <input name="last_name" defaultValue={initial.lastName} autoComplete="family-name" required />
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Account access</legend>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" defaultValue={initial.email} autoComplete="email" required />
            </label>
            <div className={styles.twoColumn}>
              <label className={styles.field}>
                <span>New password</span>
                <span className={styles.passwordWrap}>
                  <input
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide new password" : "Show new password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <label className={styles.field}>
                <span>Confirm password</span>
                <span className={styles.passwordWrap}>
                  <input
                    name="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((visible) => !visible)}
                    aria-label={showConfirm ? "Hide confirmed password" : "Show confirmed password"}
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Personal details</legend>
            <label className={styles.field}>
              <span>Address</span>
              <input name="address" defaultValue={initial.address} autoComplete="street-address" required />
            </label>
            <label className={styles.field}>
              <span>Date of birth</span>
              <input name="date_of_birth" type="date" defaultValue={initial.dateOfBirth} autoComplete="bday" required />
            </label>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Body details</legend>
            <div className={styles.measureGrid}>
              <label className={styles.field}>
                <span>Weight</span>
                <span className={styles.measureInput}>
                  <input
                    name="weight_value"
                    value={weightValue}
                    onChange={(event) => setWeightValue(event.target.value)}
                    type="number"
                    min="1"
                    max={weightUnit === "kg" ? "500" : "1102"}
                    step="0.1"
                    inputMode="decimal"
                    required
                  />
                  <span className={styles.unitSwitch} aria-label="Weight unit">
                    <button type="button" className={weightUnit === "kg" ? styles.activeUnit : ""} onClick={() => changeWeightUnit("kg")} aria-pressed={weightUnit === "kg"}>kg</button>
                    <button type="button" className={weightUnit === "lb" ? styles.activeUnit : ""} onClick={() => changeWeightUnit("lb")} aria-pressed={weightUnit === "lb"}>lb</button>
                  </span>
                </span>
              </label>

              <label className={styles.field}>
                <span>Height</span>
                <span className={styles.measureInput}>
                  <input
                    name="height_value"
                    value={heightValue}
                    onChange={(event) => setHeightValue(event.target.value)}
                    type="number"
                    min="1"
                    max={heightUnit === "cm" ? "300" : "118"}
                    step="0.1"
                    inputMode="decimal"
                    required
                  />
                  <span className={styles.unitSwitch} aria-label="Height unit">
                    <button type="button" className={heightUnit === "cm" ? styles.activeUnit : ""} onClick={() => changeHeightUnit("cm")} aria-pressed={heightUnit === "cm"}>cm</button>
                    <button type="button" className={heightUnit === "in" ? styles.activeUnit : ""} onClick={() => changeHeightUnit("in")} aria-pressed={heightUnit === "in"}>in</button>
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <input type="hidden" name="weight_unit" value={weightUnit} />
          <input type="hidden" name="height_unit" value={heightUnit} />

          {state.error && <p className={styles.error} role="alert">{state.error}</p>}

          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? <Loader2 className={styles.spinner} size={18} /> : <span>Save & Continue</span>}
            {!pending && <MoveRight size={18} />}
          </button>
        </form>
      </section>
    </main>
  );
}
