"use client";

import {
  Check,
  CheckCircle2,
  LoaderCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveConsultationBasics, saveConsultationDraft, submitConsultation } from "@/app/actions";

type IntakeDefaults = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
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
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
  weightPreviousGlp1: string;
  weightDigestiveHistory: string;
  hairPattern: string;
  hairDuration: string;
  hairPreviousTreatment: string;
  sexualConcern: string;
  sexualFrequency: string;
  sexualNitrates: string;
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
    description: "Discuss medically guided weight-management options.",
  },
  {
    id: "hair",
    title: "Hair Growth",
    description: "Explore treatment for thinning or pattern hair loss.",
  },
  {
    id: "sex",
    title: "Sexual Health",
    description: "Discuss sexual health concerns confidentially.",
  },
];

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNumberString(value: unknown, fallback = "") {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : fallback;
}

function ageFromDateOfBirth(dateOfBirth: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return "";
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime()) || dob.toISOString().slice(0, 10) !== dateOfBirth) return "";
  const now = new Date();
  const age = now.getUTCFullYear() - dob.getUTCFullYear()
    - (now.getUTCMonth() < dob.getUTCMonth() ||
       (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate()) ? 1 : 0);
  return age >= 0 && age <= 120 ? String(age) : "";
}

function readTreatmentAnswers(responses: Record<string, unknown>) {
  const raw = responses.treatment_answers;
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function initialState(draft?: Draft, defaults?: IntakeDefaults): FormState {
  const r = draft?.responses ?? {};
  const treatment = readTreatmentAnswers(r);
  const conditions = Array.isArray(r.conditions)
    ? r.conditions.filter((item): item is string => typeof item === "string")
    : [];

  return {
    primaryConcern: draft?.primary_concern || readString(r.primary_concern),
    firstName: defaults?.firstName ?? "",
    lastName: defaults?.lastName ?? "",
    dateOfBirth: defaults?.dateOfBirth ?? "",
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
    weightPreviousGlp1: readString(treatment.previous_glp1),
    weightDigestiveHistory: readString(treatment.digestive_history),
    hairPattern: readString(treatment.pattern),
    hairDuration: readString(treatment.duration),
    hairPreviousTreatment: readString(treatment.previous_treatment),
    sexualConcern: readString(treatment.concern),
    sexualFrequency: readString(treatment.frequency),
    sexualNitrates: readString(treatment.nitrates_or_activity_restriction),
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
  const [form, setForm] = useState<FormState>(() => initialState(draft, defaults));
  const [error, setError] = useState("");
  const [invalidSection, setInvalidSection] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);


  function patch<K extends keyof FormState>(key: K, next: FormState[K]) {
    setForm((current) => ({ ...current, [key]: next }));
    setError("");
    setInvalidSection(null);
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
    setInvalidSection(null);
  }

  function toFormData() {
    const data = new FormData();
    if (draftId) data.set("id", draftId);
    data.set("primary_concern", form.primaryConcern);
    data.set("first_name", form.firstName.trim());
    data.set("last_name", form.lastName.trim());
    data.set("date_of_birth", form.dateOfBirth);
    data.set("height_unit", form.heightUnit);
    data.set("height_cm", form.heightCm);
    data.set("height_feet", form.heightFeet);
    data.set("height_inches", form.heightInches);
    data.set("weight_unit", form.weightUnit);
    data.set("weight_value", form.weightValue);
    data.set("age", ageFromDateOfBirth(form.dateOfBirth));
    data.set("sex", form.sex);
    form.conditions.forEach((condition) => data.append("conditions", condition));
    data.set("current_medications", form.currentMedications);
    data.set("allergies", form.allergies);
    data.set("medical_history", form.medicalHistory);
    data.set("care_goal", form.careGoal);
    data.set("weight_previous_glp1", form.weightPreviousGlp1);
    data.set("weight_digestive_history", form.weightDigestiveHistory);
    data.set("hair_pattern", form.hairPattern);
    data.set("hair_duration", form.hairDuration);
    data.set("hair_previous_treatment", form.hairPreviousTreatment);
    data.set("sexual_concern", form.sexualConcern);
    data.set("sexual_frequency", form.sexualFrequency);
    data.set("sexual_nitrates", form.sexualNitrates);
    data.set("consent_truth", String(form.consentTruth));
    data.set("consent_telehealth", String(form.consentTelehealth));
    data.set("consent_privacy", String(form.consentPrivacy));
    return data;
  }

  function validate(currentStep: number) {
    if (currentStep === 1 && !form.primaryConcern) {
      return "Choose what you would like help with.";
    }

    if (currentStep === 2) {
      if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your first and last name.";
      const age = Number(ageFromDateOfBirth(form.dateOfBirth));
      if (!form.dateOfBirth || !Number.isFinite(age) || age < 18 || age > 120) {
        return "Enter a valid date of birth. Consultations are for adults aged 18 and over.";
      }
      if (form.heightUnit === "cm" && !(Number(form.heightCm) > 0 && Number(form.heightCm) <= 300)) return "Enter a valid height.";
      if (form.heightUnit === "ftin" && !(Number(form.heightFeet) >= 1 && Number(form.heightFeet) <= 9 && Number(form.heightInches || "0") >= 0 && Number(form.heightInches || "0") < 12)) return "Enter a valid height.";
      const weightKg = Number(form.weightValue) * (form.weightUnit === "lb" ? 0.45359237 : 1);
      if (!(weightKg > 0 && weightKg <= 500)) return "Enter a valid weight.";
      if (!form.sex) return "Select the option that applies to you.";
    }

    if (currentStep === 3 && form.conditions.length === 0) {
      return 'Select any applicable conditions or choose "None of the above".';
    }

    if (currentStep === 4) {
      if (!form.currentMedications.trim()) return 'List current medications or enter "None".';
      if (!form.allergies.trim()) return 'List known drug allergies or enter "None".';
    }

    if (currentStep === 5) {
      if (!form.careGoal.trim()) return "Briefly describe what you want help with.";

      if (form.primaryConcern === "weight") {
        if (!form.weightPreviousGlp1) return "Tell us whether you have used a GLP-1 medicine before.";
        if (!form.weightDigestiveHistory) return "Answer the digestive-health screening question.";
      }

      if (form.primaryConcern === "hair") {
        if (!form.hairPattern) return "Select where the hair loss is most noticeable.";
        if (!form.hairDuration) return "Tell us how long the hair loss has been happening.";
        if (!form.hairPreviousTreatment) return "Tell us whether you have tried hair-loss treatment before.";
      }

      if (form.primaryConcern === "sex") {
        if (!form.sexualConcern) return "Choose the main concern you want help with.";
        if (!form.sexualFrequency) return "Tell us how often the problem happens.";
        if (!form.sexualNitrates) return "Answer the medication and heart-safety question.";
      }
    }

    if (
      currentStep === 6 &&
      (!form.consentTruth || !form.consentTelehealth || !form.consentPrivacy)
    ) {
      return "All three consent statements are required before submission.";
    }

    return "";
  }

  async function saveProgress() {
    if (saveState === "saving" || isSubmitting || !form.primaryConcern) return;
    setSaveState("saving");
    setInvalidSection(null);
    setError("");
    try {
      // Persist completed personal details alongside the draft so resuming does
      // not ask for the same details again. Incomplete drafts remain saveable.
      if (!validate(2)) {
        const basics = await saveConsultationBasics(toFormData());
        if (!basics.ok) {
          setSaveState("idle");
          setError(basics.error || "We couldn’t save your personal details.");
          return;
        }
      }
      const result = await saveConsultationDraft(toFormData());
      if (result.ok && result.id) {
        setDraftId(result.id);
        setSaveState("saved");
      } else {
        setSaveState("idle");
        setError(result.error || "We couldn’t save your draft.");
      }
    } catch {
      setSaveState("idle");
      setError("We couldn’t save your draft. Please try again.");
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const sectionIds = ["care-area", "about-you", "medical-history", "medications", "treatment-questions", "consent"];
    for (let current = 1; current <= sectionIds.length; current++) {
      const validationError = validate(current);
      if (validationError) {
        setInvalidSection(sectionIds[current - 1]);
        setError(validationError);
        document.getElementById(sectionIds[current - 1])?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    setError("");
    setInvalidSection(null);
    setIsSubmitting(true);

    try {
      const basics = await saveConsultationBasics(toFormData());
      if (!basics.ok) {
        setIsSubmitting(false);
        setInvalidSection("about-you");
        setError(basics.error || "Could not save your details.");
        document.getElementById("about-you")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const result = await submitConsultation(toFormData());
      if (!result.ok || !result.id) {
        setIsSubmitting(false);
        setError(result.error || "We couldn’t submit the consultation.");
        return;
      }

      router.replace("/patient?notice=submitted");
      router.refresh();
    } catch {
      setIsSubmitting(false);
      setError("We couldn’t submit the consultation. Please try again.");
    }
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
    <form className="patient-intake consultation-onepage" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }} noValidate>
      <div className="consultation-onepage-toolbar">
        <span>Private health consultation</span>
        <button
          type="button"
          className="patient-save-draft"
          onClick={() => void saveProgress()}
          disabled={saveState === "saving" || isSubmitting || !form.primaryConcern}
        >
          {saveState === "saving" ? <LoaderCircle size={16} className="action-spinner" /> : <Save size={16} />}
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Draft saved" : "Save draft"}
        </button>
      </div>

      <section className="consultation-onepage-section" id="care-area">
            <div className="patient-intake-copy">
              <h2>What would you like help with?</h2>
              <p>Choose the care area for this consultation.</p>
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
        {invalidSection === "care-area" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="about-you">
            <div className="patient-intake-copy">
              <h2>About you</h2>
              <p>Confirm your basic details once. We use them with your consultation, without a separate profile setup.</p>
            </div>

            <div className="patient-form-grid">
              <label className="patient-form-field">
                <span>First name</span>
                <input type="text" value={form.firstName} onChange={(e) => patch("firstName", e.target.value)} autoComplete="given-name" maxLength={100} required />
              </label>
              <label className="patient-form-field">
                <span>Last name</span>
                <input type="text" value={form.lastName} onChange={(e) => patch("lastName", e.target.value)} autoComplete="family-name" maxLength={100} required />
              </label>
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
                <span>Date of birth</span>
                <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => patch("dateOfBirth", e.target.value)} autoComplete="bday" required />
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
            </div>

        {invalidSection === "about-you" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="medical-history">
            <div className="patient-intake-copy">
              <h2>Medical history</h2>
              <p>Select any conditions that apply and add other relevant history if needed.</p>
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

            <label className="patient-form-field patient-wide-field">
              <span>Relevant medical history <small>Optional</small></span>
              <textarea
                rows={4}
                value={form.medicalHistory}
                onChange={(e) => patch("medicalHistory", e.target.value)}
                placeholder="Previous diagnoses, surgery, treatment or anything else your clinician should know."
              />
            </label>
        {invalidSection === "medical-history" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="medications">
            <div className="patient-intake-copy">
              <h2>Medications and allergies</h2>
              <p>Keep it simple. If there are none, enter “None”.</p>
            </div>

            <div className="patient-form-grid">
              <label className="patient-form-field">
                <span>Current medications</span>
                <textarea
                  rows={5}
                  value={form.currentMedications}
                  onChange={(e) => patch("currentMedications", e.target.value)}
                  placeholder='List medications, or enter "None".'
                />
              </label>

              <label className="patient-form-field">
                <span>Known drug allergies</span>
                <textarea
                  rows={5}
                  value={form.allergies}
                  onChange={(e) => patch("allergies", e.target.value)}
                  placeholder='List allergies, or enter "None".'
                />
              </label>
            </div>
        {invalidSection === "medications" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="treatment-questions">
            <div className="patient-intake-copy">
              <h2>{form.primaryConcern ? `${careTitle(form.primaryConcern)} questions` : "Treatment-specific questions"}</h2>
              <p>Answer the questions related to the care area you choose above.</p>
            </div>

            <div className="patient-form-grid">
              <label className="patient-form-field patient-wide-field">
                <span>What are you experiencing, and what would you like help with?</span>
                <textarea
                  rows={5}
                  value={form.careGoal}
                  onChange={(e) => patch("careGoal", e.target.value)}
                  placeholder="Describe the main concern, when it started, and what you are hoping to improve."
                  maxLength={3000}
                />
              </label>

              {form.primaryConcern === "weight" && (
                <>
                  <label className="patient-form-field">
                    <span>Have you used a GLP-1 medicine before?</span>
                    <select value={form.weightPreviousGlp1} onChange={(e) => patch("weightPreviousGlp1", e.target.value)}>
                      <option value="">Select</option>
                      <option value="never">No</option>
                      <option value="semaglutide">Yes, semaglutide</option>
                      <option value="tirzepatide">Yes, tirzepatide</option>
                      <option value="other">Yes, another GLP-1 medicine</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>History of pancreatitis, gallbladder disease or severe digestive problems?</span>
                    <select value={form.weightDigestiveHistory} onChange={(e) => patch("weightDigestiveHistory", e.target.value)}>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </label>
                </>
              )}

              {form.primaryConcern === "hair" && (
                <>
                  <label className="patient-form-field">
                    <span>Where is thinning most noticeable?</span>
                    <select value={form.hairPattern} onChange={(e) => patch("hairPattern", e.target.value)}>
                      <option value="">Select</option>
                      <option value="hairline">Hairline / temples</option>
                      <option value="crown">Crown</option>
                      <option value="diffuse">Diffuse thinning</option>
                      <option value="patchy">Patchy loss</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>How long has this been happening?</span>
                    <select value={form.hairDuration} onChange={(e) => patch("hairDuration", e.target.value)}>
                      <option value="">Select</option>
                      <option value="under-6-months">Under 6 months</option>
                      <option value="6-12-months">6–12 months</option>
                      <option value="1-3-years">1–3 years</option>
                      <option value="over-3-years">More than 3 years</option>
                    </select>
                  </label>
                  <label className="patient-form-field patient-wide-field">
                    <span>Have you tried finasteride or minoxidil before?</span>
                    <select value={form.hairPreviousTreatment} onChange={(e) => patch("hairPreviousTreatment", e.target.value)}>
                      <option value="">Select</option>
                      <option value="none">Neither</option>
                      <option value="minoxidil">Minoxidil</option>
                      <option value="finasteride">Finasteride</option>
                      <option value="both">Both</option>
                    </select>
                  </label>
                </>
              )}

              {form.primaryConcern === "sex" && (
                <>
                  <label className="patient-form-field">
                    <span>Main concern</span>
                    <select value={form.sexualConcern} onChange={(e) => patch("sexualConcern", e.target.value)}>
                      <option value="">Select</option>
                      <option value="erectile-dysfunction">Erectile dysfunction</option>
                      <option value="premature-ejaculation">Premature ejaculation</option>
                      <option value="low-desire">Low sexual desire</option>
                      <option value="other">Another concern</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>How often does the problem happen?</span>
                    <select value={form.sexualFrequency} onChange={(e) => patch("sexualFrequency", e.target.value)}>
                      <option value="">Select</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="often">Often</option>
                      <option value="most-times">Most times</option>
                    </select>
                  </label>
                  <label className="patient-form-field patient-wide-field">
                    <span>Do you take nitrate medicines, or has a clinician told you to avoid sexual activity for heart reasons?</span>
                    <select value={form.sexualNitrates} onChange={(e) => patch("sexualNitrates", e.target.value)}>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </label>
                </>
              )}
            </div>
        {invalidSection === "treatment-questions" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section consultation-consent-section" id="consent">
        <div className="patient-intake-copy">
          <h2>Consent &amp; submit</h2>
          <p>Check your answers above and confirm before sending them to your clinician.</p>
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
        {invalidSection === "consent" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      {error && !invalidSection && <p className="consultation-inline-error" role="alert">{error}</p>}

      <footer className="consultation-onepage-actions">
        <p>Submitting sends your answers for clinical review. A prescription is not guaranteed.</p>
        <button type="submit" className="patient-primary-button" disabled={isSubmitting}>
          <CheckCircle2 size={18} /> Submit consultation
        </button>
      </footer>
    </form>
  );
}
