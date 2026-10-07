"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LoaderCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
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
    title: "Weight Loss",
    description: "Doctor-guided metabolic and weight-management care.",
  },
  {
    id: "hair",
    title: "Hair Growth",
    description: "Clinical assessment for hair loss, density and regrowth.",
  },
  {
    id: "sex",
    title: "Sexual Health",
    description: "Private clinician-led care for sexual health concerns.",
  },
];

const steps = ["Reason", "Your details", "Medical history", "Review"];

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNumberString(value: unknown, fallback = "") {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : fallback;
}

function initialState(draft?: Draft, defaults?: IntakeDefaults): FormState {
  const r = draft?.responses ?? {};
  const conditions = Array.isArray(r.conditions)
    ? r.conditions.filter((item): item is string => typeof item === "string")
    : [];

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

function careTitle(id: string) {
  return careAreas.find((area) => area.id === id)?.title || id;
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

  const progress = useMemo(() => Math.round((step / steps.length) * 100), [step]);

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
    if (currentStep === 1 && !form.primaryConcern) return "Choose what you would like help with.";

    if (currentStep === 2) {
      if (form.heightUnit === "cm" && !form.heightCm) return "Enter your height.";
      if (form.heightUnit === "ftin" && !form.heightFeet) return "Enter your height.";
      if (!form.weightValue) return "Enter your weight.";
      if (!form.age) return "Enter your age.";
      if (!form.sex) return "Select the option that applies to you.";
      if (!form.careGoal.trim()) return "Briefly describe what you want help with.";
    }

    if (currentStep === 3) {
      if (form.conditions.length === 0) {
        return 'Select any applicable conditions or choose "None of the above".';
      }
      if (!form.currentMedications.trim()) return 'List current medications or enter "None".';
      if (!form.allergies.trim()) return 'List known drug allergies or enter "None".';
    }

    if (
      currentStep === 4 &&
      (!form.consentTruth || !form.consentTelehealth || !form.consentPrivacy)
    ) {
      return "All three consent statements are required before submission.";
    }

    return "";
  }

  async function saveProgress(silent = false) {
    if (saveState === "saving" || isSubmitting) return true;
    setSaveState("saving");
    const result = await saveConsultationDraft(toFormData());

    if (result.ok && result.id) {
      setDraftId(result.id);
      setSaveState("saved");
      if (!silent) setError("");
      window.setTimeout(() => setSaveState("idle"), 1400);
      return true;
    }

    setSaveState("idle");
    if (!silent) setError(result.error || "We couldn’t save your draft.");
    return false;
  }

  async function nextStep() {
    const validationError = validate(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    await saveProgress(true);
    setStep((current) => Math.min(steps.length, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const validationError = validate(4);
    if (validationError) {
      setError(validationError);
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

  if (isSubmitting) {
    return (
      <section className="patient-submit-state" aria-live="polite">
        <span className="patient-submit-icon"><LoaderCircle className="action-spinner" size={34} /></span>
        <h2>Submitting your consultation…</h2>
        <p>Please wait while we securely save your details and place the consultation into the clinical workflow.</p>
        <div className="patient-submit-progress"><span /></div>
      </section>
    );
  }

  return (
    <section className="patient-intake">
      <header className="patient-intake-header">
        <div className="patient-intake-stepper" aria-label="Consultation steps">
          {steps.map((name, index) => {
            const number = index + 1;
            const complete = step > number;
            const current = step === number;
            return (
              <div className={current ? "is-current" : complete ? "is-complete" : ""} key={name}>
                <span>{complete ? <Check size={14} /> : number}</span>
                <small>{name}</small>
              </div>
            );
          })}
        </div>
        <div className="patient-intake-progress"><span style={{ width: `${progress}%` }} /></div>
        <button
          className="patient-save-draft"
          type="button"
          onClick={() => void saveProgress(false)}
          disabled={saveState === "saving"}
        >
          {saveState === "saving" ? <LoaderCircle size={15} className="action-spinner" /> : <Save size={15} />}
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save draft"}
        </button>
      </header>

      {error && <p className="page-error patient-intake-error" role="alert">{error}</p>}

      <div className="patient-intake-card">
        {step === 1 && (
          <>
            <div className="patient-intake-copy">
              <span className="patient-kicker">STEP 1 OF 4</span>
              <h2>What would you like help with?</h2>
              <p>Select the care area for this consultation.</p>
            </div>

            <div className="patient-care-choice-grid">
              {careAreas.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className={form.primaryConcern === area.id ? "is-selected" : ""}
                  onClick={() => patch("primaryConcern", area.id)}
                  aria-pressed={form.primaryConcern === area.id}
                >
                  <span className="patient-choice-check">
                    {form.primaryConcern === area.id && <Check size={15} />}
                  </span>
                  <strong>{area.title}</strong>
                  <small>{area.description}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="patient-intake-copy">
              <span className="patient-kicker">STEP 2 OF 4</span>
              <h2>Tell us what is going on.</h2>
              <p>Share the basic information your clinician needs to understand this consultation.</p>
            </div>

            <div className="patient-form-grid">
              <div className="patient-form-field">
                <div className="patient-field-heading">
                  <label>Height</label>
                  <div className="patient-unit-switch">
                    <button type="button" className={form.heightUnit === "cm" ? "is-active" : ""} onClick={() => patch("heightUnit", "cm")}>cm</button>
                    <button type="button" className={form.heightUnit === "ftin" ? "is-active" : ""} onClick={() => patch("heightUnit", "ftin")}>ft / in</button>
                  </div>
                </div>
                {form.heightUnit === "cm" ? (
                  <input type="number" min="1" inputMode="decimal" value={form.heightCm} onChange={(e) => patch("heightCm", e.target.value)} placeholder="e.g. 175" />
                ) : (
                  <div className="patient-split-inputs">
                    <input aria-label="Height in feet" type="number" min="1" value={form.heightFeet} onChange={(e) => patch("heightFeet", e.target.value)} placeholder="Feet" />
                    <input aria-label="Height in inches" type="number" min="0" max="11" value={form.heightInches} onChange={(e) => patch("heightInches", e.target.value)} placeholder="Inches" />
                  </div>
                )}
              </div>

              <div className="patient-form-field">
                <div className="patient-field-heading">
                  <label>Weight</label>
                  <div className="patient-unit-switch">
                    <button type="button" className={form.weightUnit === "kg" ? "is-active" : ""} onClick={() => patch("weightUnit", "kg")}>kg</button>
                    <button type="button" className={form.weightUnit === "lb" ? "is-active" : ""} onClick={() => patch("weightUnit", "lb")}>lb</button>
                  </div>
                </div>
                <input type="number" min="1" inputMode="decimal" value={form.weightValue} onChange={(e) => patch("weightValue", e.target.value)} placeholder="Your weight" />
              </div>

              <label className="patient-form-field">
                <span>Age</span>
                <input type="number" min="18" max="120" value={form.age} onChange={(e) => patch("age", e.target.value)} placeholder="Age" />
              </label>

              <label className="patient-form-field">
                <span>Sex</span>
                <select value={form.sex} onChange={(e) => patch("sex", e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </label>

              <label className="patient-form-field patient-wide-field">
                <span>What are you experiencing, and what would you like help with?</span>
                <textarea
                  rows={6}
                  value={form.careGoal}
                  onChange={(e) => patch("careGoal", e.target.value)}
                  placeholder="Describe your symptoms, when they started, and the outcome you are hoping for."
                  maxLength={3000}
                />
              </label>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="patient-intake-copy">
              <span className="patient-kicker">STEP 3 OF 4</span>
              <h2>Medical history</h2>
              <p>Answer what applies to you. This information helps the clinician review your consultation safely.</p>
            </div>

            <fieldset className="patient-history-fieldset">
              <legend>Do any of these apply to you?</legend>
              <div className="patient-condition-grid">
                {conditionOptions.map((condition) => (
                  <button
                    type="button"
                    key={condition}
                    className={form.conditions.includes(condition) ? "is-selected" : ""}
                    onClick={() => toggleCondition(condition)}
                    aria-pressed={form.conditions.includes(condition)}
                  >
                    <span>{form.conditions.includes(condition) ? <Check size={14} /> : null}</span>
                    {condition}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="patient-form-grid">
              <label className="patient-form-field">
                <span>Current medications</span>
                <textarea
                  rows={4}
                  value={form.currentMedications}
                  onChange={(e) => patch("currentMedications", e.target.value)}
                  placeholder='List medications, or enter "None".'
                />
              </label>

              <label className="patient-form-field">
                <span>Known drug allergies</span>
                <textarea
                  rows={4}
                  value={form.allergies}
                  onChange={(e) => patch("allergies", e.target.value)}
                  placeholder='List allergies, or enter "None".'
                />
              </label>

              <label className="patient-form-field patient-wide-field">
                <span>Relevant medical history <small>Optional</small></span>
                <textarea
                  rows={5}
                  value={form.medicalHistory}
                  onChange={(e) => patch("medicalHistory", e.target.value)}
                  placeholder="Previous treatment, surgery, diagnoses or anything else your clinician should know."
                />
              </label>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="patient-intake-copy">
              <span className="patient-kicker">STEP 4 OF 4</span>
              <h2>Review your information</h2>
              <p>Check the details below before sending them to the clinical team.</p>
            </div>

            <div className="patient-review-list">
              <div>
                <span>Consultation</span>
                <strong>{careTitle(form.primaryConcern)}</strong>
                <button type="button" onClick={() => setStep(1)}>Edit</button>
              </div>
              <div>
                <span>Your concern</span>
                <strong>{form.careGoal}</strong>
                <button type="button" onClick={() => setStep(2)}>Edit</button>
              </div>
              <div>
                <span>Measurements</span>
                <strong>
                  {form.heightUnit === "cm" ? `${form.heightCm} cm` : `${form.heightFeet} ft ${form.heightInches || 0} in`}
                  {" · "}
                  {form.weightValue} {form.weightUnit}
                  {" · "}
                  age {form.age}
                </strong>
                <button type="button" onClick={() => setStep(2)}>Edit</button>
              </div>
              <div>
                <span>Medical screening</span>
                <strong>{form.conditions.join(", ")}</strong>
                <button type="button" onClick={() => setStep(3)}>Edit</button>
              </div>
              <div>
                <span>Current medications</span>
                <strong>{form.currentMedications}</strong>
                <button type="button" onClick={() => setStep(3)}>Edit</button>
              </div>
              <div>
                <span>Allergies</span>
                <strong>{form.allergies}</strong>
                <button type="button" onClick={() => setStep(3)}>Edit</button>
              </div>
            </div>

            <div className="patient-consent-card">
              <ShieldCheck size={24} />
              <div>
                <h3>Consent and confirmation</h3>
                <label>
                  <input type="checkbox" checked={form.consentTruth} onChange={(e) => patch("consentTruth", e.target.checked)} />
                  <span>I confirm that the information I provided is accurate to the best of my knowledge.</span>
                </label>
                <label>
                  <input type="checkbox" checked={form.consentTelehealth} onChange={(e) => patch("consentTelehealth", e.target.checked)} />
                  <span>I consent to receiving care through the Suga.Health telehealth workflow.</span>
                </label>
                <label>
                  <input type="checkbox" checked={form.consentPrivacy} onChange={(e) => patch("consentPrivacy", e.target.checked)} />
                  <span>I understand that my information is used to provide and manage this consultation.</span>
                </label>
              </div>
            </div>
          </>
        )}

        <footer className="patient-intake-actions">
          {step > 1 ? (
            <button className="patient-flow-arrow patient-flow-arrow-back" type="button" onClick={previousStep} aria-label="Previous step">
              <ArrowLeft size={20} />
            </button>
          ) : <span />}

          {step < steps.length ? (
            <button className="patient-flow-arrow patient-flow-arrow-next" type="button" onClick={() => void nextStep()} aria-label="Continue to next step">
              <ArrowRight size={20} />
            </button>
          ) : (
            <button className="patient-primary-button" type="button" onClick={() => void handleSubmit()}>
              <CheckCircle2 size={17} /> Submit Consultation
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}
