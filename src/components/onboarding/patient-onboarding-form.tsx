"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { completePatientOnboarding, type OnboardingState } from "@/app/actions";
import styles from "./patient-onboarding-form.module.css";

type InitialProfile = {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  weightKg: number | null;
  heightCm: number | null;
};

type Step = 0 | 1 | 2;

const initialState: OnboardingState = { error: "" };
const titles = [
  "Tell us about you",
  "Where should care reach you?",
  "A few final details",
] as const;

function rounded(value: number) {
  return String(Math.round(value * 10) / 10);
}

function panelState(index: number, active: number) {
  if (index === active) return "active";
  return index < active ? "past" : "future";
}

export function PatientOnboardingForm({ initial }: { initial: InitialProfile }) {
  const [state, action, pending] = useActionState(completePatientOnboarding, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightValue, setWeightValue] = useState(initial.weightKg ? rounded(initial.weightKg) : "");
  const [heightValue, setHeightValue] = useState(initial.heightCm ? rounded(initial.heightCm) : "");

  const today = new Date().toISOString().slice(0, 10);
  const progress = ((step + 1) / 3) * 100;

  function field(name: string) {
    return formRef.current?.elements.namedItem(name) as HTMLInputElement | null;
  }

  function validateFields(names: string[]) {
    for (const name of names) {
      const control = field(name);
      if (!control) continue;
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    return true;
  }

  function continueFromPersonal() {
    const confirm = field("confirm_password");
    const password = field("new_password");
    confirm?.setCustomValidity("");

    if (
      !validateFields([
        "first_name",
        "last_name",
        "email",
        "date_of_birth",
        "new_password",
        "confirm_password",
      ])
    ) {
      return;
    }

    if (password && confirm && password.value !== confirm.value) {
      confirm.setCustomValidity("Passwords do not match.");
      confirm.reportValidity();
      confirm.focus();
      return;
    }

    setStep(1);
  }

  function continueFromAddress() {
    if (
      !validateFields([
        "street_address_1",
        "city",
        "region",
        "postal_code",
        "country",
      ])
    ) {
      return;
    }

    setStep(2);
  }

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
      <div className={styles.ambientGlow} aria-hidden="true" />

      <section className={styles.card} aria-labelledby="onboarding-title">
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Profile completion"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step + 1}
        >
          <span className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.cardTop}>
          <span className={styles.brand}>SUGA.HEALTH</span>
          <span className={styles.setupLabel}>Profile setup</span>
        </div>

        <div className={styles.headingBlock}>
          <h1 id="onboarding-title" className={styles.title}>{titles[step]}</h1>
        </div>

        <form ref={formRef} action={action} className={styles.form}>
          <div className={styles.panelShell}>
            <section
              className={styles.panel}
              data-state={panelState(0, step)}
              aria-hidden={step !== 0}
            >
              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <label htmlFor="first-name">First name</label>
                  <input
                    id="first-name"
                    name="first_name"
                    defaultValue={initial.firstName}
                    autoComplete="given-name"
                    required={step === 0}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="last-name">Last name</label>
                  <input
                    id="last-name"
                    name="last_name"
                    defaultValue={initial.lastName}
                    autoComplete="family-name"
                    required={step === 0}
                  />
                </div>
              </div>

              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <label htmlFor="onboarding-email">Email</label>
                  <input
                    id="onboarding-email"
                    name="email"
                    type="email"
                    defaultValue={initial.email}
                    autoComplete="email"
                    required={step === 0}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="date-of-birth">Date of birth</label>
                  <input
                    id="date-of-birth"
                    name="date_of_birth"
                    type="date"
                    max={today}
                    defaultValue={initial.dateOfBirth}
                    autoComplete="bday"
                    required={step === 0}
                  />
                </div>
              </div>

              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <label htmlFor="new-password">New password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="new-password"
                      name="new_password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required={step === 0}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide new password" : "Show new password"}
                      aria-pressed={showPassword}
                      tabIndex={step === 0 ? 0 : -1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="confirm-password">Confirm password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="confirm-password"
                      name="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required={step === 0}
                      onChange={(event) => event.currentTarget.setCustomValidity("")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((visible) => !visible)}
                      aria-label={showConfirm ? "Hide confirmed password" : "Show confirmed password"}
                      aria-pressed={showConfirm}
                      tabIndex={step === 0 ? 0 : -1}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={styles.panel}
              data-state={panelState(1, step)}
              aria-hidden={step !== 1}
            >
              <div className={styles.addressGrid}>
                <div className={styles.fieldWide}>
                  <label htmlFor="street-address-1">Street address</label>
                  <input
                    id="street-address-1"
                    name="street_address_1"
                    defaultValue={initial.streetAddress1}
                    autoComplete="address-line1"
                    required={step === 1}
                  />
                </div>

                <div className={styles.fieldWide}>
                  <label htmlFor="street-address-2">Address line 2</label>
                  <input
                    id="street-address-2"
                    name="street_address_2"
                    defaultValue={initial.streetAddress2}
                    autoComplete="address-line2"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    defaultValue={initial.city}
                    autoComplete="address-level2"
                    required={step === 1}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="region">Region / State</label>
                  <input
                    id="region"
                    name="region"
                    defaultValue={initial.region}
                    autoComplete="address-level1"
                    required={step === 1}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="postal-code">Postal / ZIP code</label>
                  <input
                    id="postal-code"
                    name="postal_code"
                    defaultValue={initial.postalCode}
                    autoComplete="postal-code"
                    inputMode="text"
                    required={step === 1}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    defaultValue={initial.country || "India"}
                    autoComplete="country-name"
                    required={step === 1}
                  />
                </div>
              </div>
            </section>

            <section
              className={styles.panel}
              data-state={panelState(2, step)}
              aria-hidden={step !== 2}
            >
              <div className={styles.measureGrid}>
                <div className={styles.field}>
                  <label htmlFor="weight-value">Weight</label>
                  <div className={styles.measureInput}>
                    <input
                      id="weight-value"
                      name="weight_value"
                      value={weightValue}
                      onChange={(event) => setWeightValue(event.target.value)}
                      type="number"
                      min="1"
                      max={weightUnit === "kg" ? "500" : "1102"}
                      step="0.1"
                      inputMode="decimal"
                      required={step === 2}
                    />
                    <span className={styles.unitSwitch} aria-label="Weight unit">
                      <button
                        type="button"
                        className={weightUnit === "kg" ? styles.activeUnit : ""}
                        onClick={() => changeWeightUnit("kg")}
                        aria-pressed={weightUnit === "kg"}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        className={weightUnit === "lb" ? styles.activeUnit : ""}
                        onClick={() => changeWeightUnit("lb")}
                        aria-pressed={weightUnit === "lb"}
                      >
                        lb
                      </button>
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="height-value">Height</label>
                  <div className={styles.measureInput}>
                    <input
                      id="height-value"
                      name="height_value"
                      value={heightValue}
                      onChange={(event) => setHeightValue(event.target.value)}
                      type="number"
                      min="1"
                      max={heightUnit === "cm" ? "300" : "118"}
                      step="0.1"
                      inputMode="decimal"
                      required={step === 2}
                    />
                    <span className={styles.unitSwitch} aria-label="Height unit">
                      <button
                        type="button"
                        className={heightUnit === "cm" ? styles.activeUnit : ""}
                        onClick={() => changeHeightUnit("cm")}
                        aria-pressed={heightUnit === "cm"}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        className={heightUnit === "in" ? styles.activeUnit : ""}
                        onClick={() => changeHeightUnit("in")}
                        aria-pressed={heightUnit === "in"}
                      >
                        in
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <input type="hidden" name="weight_unit" value={weightUnit} />
          <input type="hidden" name="height_unit" value={heightUnit} />

          <div className={styles.feedbackRow}>
            {state.error ? <p className={styles.error} role="alert">{state.error}</p> : <span />}
          </div>

          <div className={styles.actions}>
            {step > 0 ? (
              <button
                className={styles.backButton}
                type="button"
                onClick={() => setStep((current) => (current - 1) as Step)}
                disabled={pending}
              >
                <ArrowLeft size={17} />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <button
                className={styles.primaryButton}
                type="button"
                onClick={step === 0 ? continueFromPersonal : continueFromAddress}
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (
              <button className={styles.primaryButton} type="submit" disabled={pending}>
                {pending ? <Loader2 className={styles.spinner} size={18} /> : "Save & Continue"}
                {!pending && <ArrowRight size={17} />}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
