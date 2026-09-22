"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, LoaderCircle, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { saveConsultationDraft, submitConsultation } from "@/app/actions";

type IntakeDefaults = {
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  sex?: string | null;
};

type Draft = {
  id: string;
  primary_concern: string;
  responses: Record<string, unknown>;
};

type FormState = {
  primaryConcern: string;
  heightUnit: "cm" | "ftin";
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  weightUnit: "kg" | "lb";
  weightValue: string;
  age: string;
  sex: string;
  conditions: string[];
  currentMedications: string;
  allergies: string;
  medicalHistory: string;
  careGoal: string;
  consentTruth: boolean;
  consentTelehealth: boolean;
  consentPrivacy: boolean;
};

const conditionOptions = [
  "Hypertension (High Blood Pressure)",
  "Type 2 Diabetes / Prediabetes",
  "Thyroid disease or family history of MTC",
  "Cardiovascular or kidney conditions",
  "Currently pregnant or breastfeeding",
  "None of the above",
];

const careAreas = [
  {
    id: "weight",
    title: "Medical Weight Loss",
    description: "Doctor-guided metabolic and weight-management care.",
  },
  {
    id: "hair",
    title: "Hair Growth",
    description: "Clinical assessment for hair loss, density, and regrowth.",
  },
  {
    id: "sex",
    title: "Sexual Health",
    description: "Private clinician-led care for sexual health and vitality.",
  },
];

const stepNames = [
  "Care area",
  "Measurements",
  "Screening",
  "Medication",
  "Context",
  "Consent",
];

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNumberString(value: unknown, fallback = "") {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : fallback;
}

function initialState(draft?: Draft, defaults?: IntakeDefaults): FormState {
  const r = draft?.responses ?? {};
  const conditions = Array.isArray(r.conditions) ? r.conditions.filter((item): item is string => typeof item === "string") : [];

  return {
    primaryConcern: draft?.primary_concern || readString(r.primary_concern, "weight"),
    heightUnit: readString(r.height_unit) === "ftin" ? "ftin" : "cm",
    heightCm: readNumberString(r.height_cm_input, defaults?.height_cm ? String(defaults.height_cm) : ""),
    heightFeet: readNumberString(r.height_feet),
    heightInches: readNumberString(r.height_inches),
    weightUnit: readString(r.weight_unit) === "lb" ? "lb" : "kg",
    weightValue: readNumberString(r.weight_value, defaults?.weight_kg ? String(defaults.weight_kg) : ""),
    age: readNumberString(r.age, defaults?.age ? String(defaults.age) : ""),
    sex: readString(r.sex, defaults?.sex || ""),
    conditions,
    currentMedications: readString(r.current_medications),
    allergies: readString(r.allergies),
    medicalHistory: readString(r.medical_history),
    careGoal: readString(r.care_goal),
    consentTruth: r.consent_truth === true,
    consentTelehealth: r.consent_telehealth === true,
    consentPrivacy: r.consent_privacy === true,
  };
}

export function ConsultationForm({
  draft,
  defaults,
}: {
  draft?: Draft;
  defaults?: IntakeDefaults;
}) {
  const router = useRouter();
  const [draftId, setDraftId] = useState(draft?.id ?? "");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => initialState(draft, defaults));
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => Math.round((step / 6) * 100), [step]);

  function patch<K extends keyof FormState>(key: K, next: FormState[K]) {
    setForm((current) => ({ ...current, [key]: next }));
    setError("");
  }

  function toggleCondition(condition: string) {
    setForm((current) => {
      if (condition === "None of the above") {
        return {
          ...current,
          conditions: current.conditions.includes(condition) ? [] : [condition],
        };
      }

      const withoutNone = current.conditions.filter((item) => item !== "None of the above");
      return {
        ...current,
        conditions: withoutNone.includes(condition)
          ? withoutNone.filter((item) => item !== condition)
          : [...withoutNone, condition],
      };
    });
    setError("");
  }

  function toFormData() {
    const data = new FormData();
    if (draftId) data.set("id", draftId);
    data.set("primary_concern", form.primaryConcern);
    data.set("height_unit", form.heightUnit);
    data.set("height_cm", form.heightCm);
    data.set("height_feet", form.heightFeet);
    data.set("height_inches", form.heightInches);
    data.set("weight_unit", form.weightUnit);
    data.set("weight_value", form.weightValue);
    data.set("age", form.age);
    data.set("sex", form.sex);
    form.conditions.forEach((condition) => data.append("conditions", condition));
    data.set("current_medications", form.currentMedications);
    data.set("allergies", form.allergies);
    data.set("medical_history", form.medicalHistory);
    data.set("care_goal", form.careGoal);
    data.set("consent_truth", String(form.consentTruth));
    data.set("consent_telehealth", String(form.consentTelehealth));
    data.set("consent_privacy", String(form.consentPrivacy));
    return data;
  }

  function validate(currentStep: number) {
    if (currentStep === 1 && !form.primaryConcern) return "Choose the care area you want help with.";
    if (currentStep === 2) {
      if (form.heightUnit === "cm" && !form.heightCm) return "Enter your height.";
      if (form.heightUnit === "ftin" && !form.heightFeet) return "Enter your height in feet and inches.";
      if (!form.weightValue) return "Enter your weight.";
      if (!form.age) return "Enter your age.";
      if (!form.sex) return "Select the option that applies to you.";
    }
    if (currentStep === 3 && form.conditions.length === 0) {
      return 'Select any applicable conditions or choose "None of the above".';
    }
    if (currentStep === 4 && !form.currentMedications.trim()) {
      return 'List current medications or enter "None".';
    }
    if (currentStep === 4 && !form.allergies.trim()) {
      return 'List known drug allergies or enter "None".';
    }
    if (currentStep === 5 && !form.careGoal.trim()) {
      return "Tell the doctor what you want help with or what outcome you are seeking.";
    }
    if (
      currentStep === 6 &&
      (!form.consentTruth || !form.consentTelehealth || !form.consentPrivacy)
    ) {
      return "All three consent statements are required before submission.";
    }
    return "";
  }

  async function saveProgress(silent = false) {
    if (saveState === "saving" || isSubmitting) return;
    setSaveState("saving");
    const result = await saveConsultationDraft(toFormData());

    if (result.ok && result.id) {
      setDraftId(result.id);
      setSaveState("saved");
      if (!silent) setError("");
      window.setTimeout(() => setSaveState("idle"), 1600);
      return;
    }

    setSaveState("idle");
    if (!silent) setError(result.error || "We couldn’t save your draft.");
  }

  function nextStep() {
    const validationError = validate(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep((current) => Math.min(6, current + 1));
    void saveProgress(true);
  }

  async function handleSubmit() {
    const validationError = validate(6);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (saveState === "saving") {
      setError("Finishing your draft save. Submit again in a moment.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const result = await submitConsultation(toFormData());

    if (!result.ok || !result.id) {
      setIsSubmitting(false);
      setError(result.error || "We couldn’t submit the consultation.");
      return;
    }

    router.replace(`/patient/consultations/${result.id}?notice=submitted`);
    router.refresh();
  }

  return (
    <section className="intake-wizard" aria-label="Medical consultation intake">
      <header className="intake-progress-header">
        <div>
          <span className="eyebrow">Private medical intake</span>
          <strong>Step {step} of 6 · {stepNames[step - 1]}</strong>
        </div>
        <button
          type="button"
          className="intake-save"
          onClick={() => void saveProgress(false)}
          disabled={saveState === "saving" || isSubmitting}
        >
          {saveState === "saving" ? <LoaderCircle size={15} className="action-spinner" /> : <Save size={15} />}
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save progress"}
        </button>
        <div className="intake-progress-track" role="progressbar" aria-label="Consultation progress" aria-valuemin={0} aria-valuemax={6} aria-valuenow={step} aria-valuetext={`Step ${step} of 6: ${stepNames[step - 1]}`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>
      <ol className="intake-step-rail" aria-label="Consultation steps">{stepNames.map((name, index) => <li key={name} aria-current={step === index + 1 ? "step" : undefined} className={step > index + 1 ? "is-complete" : ""}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span>{name}</li>)}</ol>

      <div className="intake-step" key={step}>
        {step === 1 && (
          <>
            <div className="intake-step-copy">
              <span>01</span>
              <div>
                <h2>What would you like help with?</h2>
                <p>Choose the clinical pathway for this consultation.</p>
              </div>
            </div>
            <div className="intake-choice-grid">
              {careAreas.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className={form.primaryConcern === area.id ? "intake-choice selected" : "intake-choice"}
                  aria-pressed={form.primaryConcern === area.id}
                  onClick={() => patch("primaryConcern", area.id)}
                >
                  <span className="choice-check">{form.primaryConcern === area.id ? <Check size={15} /> : null}</span>
                  <strong>{area.title}</strong>
                  <small>{area.description}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="intake-step-copy">
              <span>02</span>
              <div>
                <h2>Your measurements and basics</h2>
                <p>Use whichever measurement system is most comfortable.</p>
              </div>
            </div>

            <div className="intake-field-block">
              <div className="field-label-row">
                <label htmlFor={form.heightUnit === "cm" ? "intake-height" : "intake-height-feet"}>Height</label>
                <div className="unit-switch">
                  <button type="button" className={form.heightUnit === "cm" ? "active" : ""} aria-pressed={form.heightUnit === "cm"} onClick={() => patch("heightUnit", "cm")}>cm</button>
                  <button type="button" className={form.heightUnit === "ftin" ? "active" : ""} aria-pressed={form.heightUnit === "ftin"} onClick={() => patch("heightUnit", "ftin")}>ft / in</button>
                </div>
              </div>
              {form.heightUnit === "cm" ? (
                <input type="number" inputMode="decimal" min="1" id="intake-height" value={form.heightCm} onChange={(e) => patch("heightCm", e.target.value)} placeholder="e.g. 175" />
              ) : (
                <div className="split-inputs">
                  <label><span>Feet</span><input type="number" inputMode="numeric" min="1" id="intake-height-feet" value={form.heightFeet} onChange={(e) => patch("heightFeet", e.target.value)} placeholder="5" /></label>
                  <label><span>Inches</span><input type="number" inputMode="numeric" min="0" max="11" value={form.heightInches} onChange={(e) => patch("heightInches", e.target.value)} placeholder="9" /></label>
                </div>
              )}
            </div>

            <div className="intake-field-block">
              <div className="field-label-row">
                <label htmlFor="intake-weight">Weight</label>
                <div className="unit-switch">
                  <button type="button" className={form.weightUnit === "kg" ? "active" : ""} aria-pressed={form.weightUnit === "kg"} onClick={() => patch("weightUnit", "kg")}>kg</button>
                  <button type="button" className={form.weightUnit === "lb" ? "active" : ""} aria-pressed={form.weightUnit === "lb"} onClick={() => patch("weightUnit", "lb")}>lb</button>
                </div>
              </div>
              <input type="number" inputMode="decimal" min="1" id="intake-weight" value={form.weightValue} onChange={(e) => patch("weightValue", e.target.value)} placeholder={form.weightUnit === "kg" ? "e.g. 78" : "e.g. 172"} />
            </div>

            <div className="intake-two-col">
              <label>Age<input type="number" inputMode="numeric" min="1" max="120" value={form.age} onChange={(e) => patch("age", e.target.value)} placeholder="Age" /></label>
              <label>
                Sex
                <select value={form.sex} onChange={(e) => patch("sex", e.target.value)}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </label>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="intake-step-copy">
              <span>03</span>
              <div>
                <h2>Medical screening</h2>
                <p>Select anything that currently applies or has applied in the past.</p>
              </div>
            </div>
            <div className="condition-list">
              {conditionOptions.map((condition) => {
                const selected = form.conditions.includes(condition);
                return (
                  <button
                    type="button"
                    key={condition}
                    className={selected ? "condition-option selected" : "condition-option"}
                    aria-pressed={selected}
                    onClick={() => toggleCondition(condition)}
                  >
                    <span>{condition}</span>
                    <span className="condition-check">{selected ? <Check size={15} /> : null}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="intake-step-copy">
              <span>04</span>
              <div>
                <h2>Medication and allergies</h2>
                <p>This helps the doctor review possible interactions and contraindications.</p>
              </div>
            </div>
            <label>
              Current medications
              <textarea rows={4} value={form.currentMedications} onChange={(e) => patch("currentMedications", e.target.value)} placeholder="List prescriptions, supplements, or enter None" />
            </label>
            <label>
              Known drug allergies
              <textarea rows={4} value={form.allergies} onChange={(e) => patch("allergies", e.target.value)} placeholder="List allergies or enter None" />
            </label>
          </>
        )}

        {step === 5 && (
          <>
            <div className="intake-step-copy">
              <span>05</span>
              <div>
                <h2>Medical context</h2>
                <p>Give the doctor the details that will make the review more useful.</p>
              </div>
            </div>
            <label>
              Relevant medical history <em>Optional</em>
              <textarea rows={5} value={form.medicalHistory} onChange={(e) => patch("medicalHistory", e.target.value)} placeholder="Previous diagnoses, procedures, treatment history, or anything clinically relevant" />
            </label>
            <label>
              What would you like the doctor to help you achieve?
              <textarea rows={5} value={form.careGoal} onChange={(e) => patch("careGoal", e.target.value)} placeholder="Describe the concern, symptoms, changes you noticed, and what you hope to improve" />
            </label>
          </>
        )}

        {step === 6 && (
          <>
            <div className="intake-step-copy">
              <span>06</span>
              <div>
                <h2>Review and consent</h2>
                <p>Confirm these statements before the consultation is sent for doctor review.</p>
              </div>
            </div>
            <div className="consent-list">
              <label className={form.consentTruth ? "consent-row checked" : "consent-row"}>
                <input type="checkbox" checked={form.consentTruth} onChange={(e) => patch("consentTruth", e.target.checked)} />
                <span><strong>Truthfulness</strong>I confirm that the health information I provided is accurate and complete.</span>
              </label>
              <label className={form.consentTelehealth ? "consent-row checked" : "consent-row"}>
                <input type="checkbox" checked={form.consentTelehealth} onChange={(e) => patch("consentTelehealth", e.target.checked)} />
                <span><strong>Telehealth evaluation</strong>I consent to a clinician reviewing this information as part of an online consultation.</span>
              </label>
              <label className={form.consentPrivacy ? "consent-row checked" : "consent-row"}>
                <input type="checkbox" checked={form.consentPrivacy} onChange={(e) => patch("consentPrivacy", e.target.checked)} />
                <span><strong>Medical privacy</strong>I acknowledge that my consultation information will be handled as private health information.</span>
              </label>
            </div>
            <div className="intake-security-note"><ShieldCheck size={18} /><span>Your submission stays inside your patient account and is routed as clinical data to the assigned doctor.</span></div>
          </>
        )}

        {error && <p className="page-error intake-error" role="alert">{error}</p>}

        <footer className="intake-controls">
          {step > 1 ? (
            <button type="button" className="button button-secondary" onClick={() => { setError(""); setStep((current) => Math.max(1, current - 1)); }} disabled={isSubmitting}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <span />}

          {step < 6 ? (
            <button type="button" className="button button-primary motion-cta" onClick={nextStep} disabled={isSubmitting}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="button button-primary motion-cta" onClick={() => void handleSubmit()} disabled={isSubmitting || saveState === "saving"}>
              {isSubmitting ? <><LoaderCircle size={16} className="action-spinner" /> Submitting…</> : <><CheckCircle2 size={16} /> Submit for doctor review</>}
            </button>
          )}
        </footer>
      </div>

      <p className="privacy-note">For emergencies or urgent symptoms, contact local emergency services rather than waiting for an online review.</p>
    </section>
  );
}
