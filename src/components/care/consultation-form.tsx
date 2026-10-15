"use client";

import {
  Check,
  CheckCircle2,
  LoaderCircle,
  Save,
  ShieldCheck,
  PersonStanding,
  HeartHandshake,
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
  medicationsNone: boolean;
  allergies: string;
  allergiesNone: boolean;
  medicalHistory: string;
  medicalHistoryChoice: "" | "none" | "yes";
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
  { value: "Hypertension (High Blood Pressure)", label: "High blood pressure" },
  { value: "Type 2 Diabetes / Prediabetes", label: "Type 2 diabetes or prediabetes" },
  { value: "Thyroid problems", label: "Thyroid problems" },
  { value: "Medullary thyroid cancer (MTC) in you or your family", label: "Medullary thyroid cancer (MTC) in you or your family" },
  { value: "Cardiovascular or kidney conditions", label: "Heart or kidney problems" },
  { value: "Currently pregnant or breastfeeding", label: "Currently pregnant or breastfeeding" },
  { value: "None of the above", label: "None of the above" },
];

// Three hair strands emerging from the scalp: a simple growth symbol
// at the same size and stroke weight as the other treatment icons.
function HairGrowthIcon({ className, size = 20, strokeWidth = 1.8 }: {
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19c4-1.6 12-1.6 16 0" />
      <path d="M7 17.5C4 13 8.8 10 7 4.5" />
      <path d="M12 17.5c-2.6-4.5 2.6-8 0-13" />
      <path d="M17 17.5c-1.7-4.5 3-7.5 0-13" />
    </svg>
  );
}

const careAreas = [
  { id: "weight", title: "Weight loss", icon: PersonStanding },
  { id: "hair", title: "Hair growth", icon: HairGrowthIcon },
  { id: "sex", title: "Sexual health", icon: HeartHandshake },
];
const legacyThyroidCondition = "Thyroid disease or family history of MTC";

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

function readOptionalDetails(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase() === "none" ? "" : value;
}

function readAnswerChoice(value: unknown, storedChoice: unknown): "" | "none" | "yes" {
  if (storedChoice === "none" || storedChoice === "yes") return storedChoice;
  if (typeof value !== "string" || !value.trim()) return "";
  return value.trim().toLowerCase() === "none" ? "none" : "yes";
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
    heightUnit: "cm",
    // The current profile wins over old draft measurements. Future consultations
    // always load the latest saved values, never historical weight/height.
    heightCm: defaults?.height_cm != null ? String(defaults.height_cm) : "",
    heightFeet: "",
    heightInches: "",
    weightUnit: "kg",
    weightValue: defaults?.weight_kg != null ? String(defaults.weight_kg) : "",
    age: ageFromDateOfBirth(defaults?.dateOfBirth ?? ""),
    sex: defaults?.sex ?? "",
    conditions,
    currentMedications: readOptionalDetails(r.current_medications),
    medicationsNone: readAnswerChoice(r.current_medications, r.current_medications_choice) === "none",
    allergies: readOptionalDetails(r.allergies),
    allergiesNone: readAnswerChoice(r.allergies, r.allergies_choice) === "none",
    medicalHistory: readString(r.medical_history).trim().toLowerCase() === "none" ? "" : readString(r.medical_history),
    medicalHistoryChoice: readAnswerChoice(r.medical_history, r.medical_history_choice),
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

function ConsultationSectionHeading({ number, title, description }: {
  number: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="patient-intake-copy consultation-section-heading">
      <div className="consultation-section-title">
        <span className="consultation-section-number" aria-hidden="true">{String(number).padStart(2, "0")}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}


type ProfileSnapshot = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  heightCm: number | null;
  weightKg: number | null;
};

function profileSnapshot(form: FormState): ProfileSnapshot {
  const heightValue = form.heightUnit === "cm"
    ? Number(form.heightCm)
    : Number(form.heightFeet) * 30.48 + Number(form.heightInches || "0") * 2.54;
  const weightValue = Number(form.weightValue);
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dateOfBirth: form.dateOfBirth,
    sex: form.sex === "intersex" ? "other" : form.sex,
    heightCm: form.heightUnit === "cm" && !form.heightCm.trim() ||
      form.heightUnit === "ftin" && !form.heightFeet.trim()
      ? null : Math.round(heightValue * 10) / 10,
    weightKg: !form.weightValue.trim() ? null
      : Math.round(weightValue * (form.weightUnit === "lb" ? .45359237 : 1) * 10) / 10,
  };
}

function savedProfileSnapshot(defaults?: IntakeDefaults): ProfileSnapshot {
  return {
    firstName: defaults?.firstName?.trim() ?? "",
    lastName: defaults?.lastName?.trim() ?? "",
    dateOfBirth: defaults?.dateOfBirth ?? "",
    sex: defaults?.sex ?? "",
    heightCm: defaults?.height_cm ?? null,
    weightKg: defaults?.weight_kg ?? null,
  };
}
function profileChanged(current: ProfileSnapshot, saved: ProfileSnapshot): boolean {
  const differs = (a: number | null, b: number | null) =>
    a === null || b === null ? a !== b : Math.abs(a - b) >= .05;
  return current.firstName !== saved.firstName ||
    current.lastName !== saved.lastName ||
    current.dateOfBirth !== saved.dateOfBirth ||
    current.sex !== saved.sex ||
    differs(current.heightCm, saved.heightCm) ||
    differs(current.weightKg, saved.weightKg);
}
function roundedMeasure(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function canSavePersonalDetails(form: FormState): boolean {
  if (!form.firstName.trim() || form.firstName.trim().length > 100 ||
      form.lastName.trim().length > 100) return false;

  if (form.dateOfBirth) {
    const age = Number(ageFromDateOfBirth(form.dateOfBirth));
    if (!Number.isFinite(age) || age < 18 || age > 120) return false;
  }
  if (form.sex && !["male", "female", "intersex", "other", "prefer-not-to-say"].includes(form.sex)) {
    return false;
  }
  if (form.heightUnit === "ftin" && !form.heightFeet.trim() && form.heightInches.trim()) {
    return false;
  }
  const { heightCm, weightKg } = profileSnapshot(form);
  if (heightCm !== null && (!Number.isFinite(heightCm) || heightCm < 80 || heightCm > 250)) return false;
  if (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400)) return false;
  return true;
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
  // Saved account details are visible immediately and remain editable.
  const [savedProfile, setSavedProfile] = useState<ProfileSnapshot>(() => savedProfileSnapshot(defaults));
  const [profileSaveState, setProfileSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [profileSaveError, setProfileSaveError] = useState("");
  const currentProfile = profileSnapshot(form);
  const isProfileDirty = profileChanged(currentProfile, savedProfile);
  const canSaveProfile = isProfileDirty && canSavePersonalDetails(form) && !isSubmitting && profileSaveState !== "saving";

  function changeHeightUnit(next: "cm" | "ftin") {
    setForm((current) => {
      if (current.heightUnit === next) return current;
      const cm = current.heightUnit === "cm"
        ? Number(current.heightCm)
        : Number(current.heightFeet) * 30.48 + Number(current.heightInches || "0") * 2.54;
      if (!(cm > 0)) return { ...current, heightUnit: next };
      if (next === "cm") {
        return { ...current, heightUnit: next, heightCm: roundedMeasure(cm) };
      }
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      return {
        ...current,
        heightUnit: next,
        heightFeet: String(feet),
        heightInches: String(Math.round((totalInches - feet * 12) * 1000) / 1000),
      };
    });
  }
  function changeWeightUnit(next: "kg" | "lb") {
    setForm((current) => {
      if (current.weightUnit === next) return current;
      const weight = Number(current.weightValue);
      return {
        ...current,
        weightUnit: next,
        weightValue: weight > 0
          ? String(Math.round(weight * (next === "lb" ? 2.2046226218 : .45359237) * 1000) / 1000)
          : current.weightValue,
      };
    });
  }
  async function saveProfileChanges() {
    if (!canSaveProfile) return;
    const snapshot = profileSnapshot(form);
    const data = toFormData();
    data.set("profile_only", "1");
    setProfileSaveError("");
    setProfileSaveState("saving");
    try {
      const result = await saveConsultationBasics(data);
      if (!result.ok) {
        setProfileSaveError(result.error || "Could not update your profile.");
        setProfileSaveState("idle");
        return;
      }
      setSavedProfile(snapshot);
      setProfileSaveState("saved");
      router.refresh();
    } catch {
      setProfileSaveError("Could not save your changes. Please try again.");
      setProfileSaveState("idle");
    }
  }


  function patch<K extends keyof FormState>(key: K, next: FormState[K]) {
    setForm((current) => ({ ...current, [key]: next }));
    setError("");
    setInvalidSection(null);
    if (["firstName", "lastName", "dateOfBirth", "sex", "heightCm", "heightFeet", "heightInches", "weightValue"].includes(key)) {
      setProfileSaveState("idle");
    }
  }

  function updateClinicalDetail(field: "currentMedications" | "allergies", text: string) {
    setForm((current) => ({
      ...current,
      [field]: text,
      ...(field === "currentMedications" ? { medicationsNone: false } : { allergiesNone: false }),
    }));
    setError("");
    setInvalidSection(null);
  }

  function confirmNone(field: "currentMedications" | "allergies") {
    setForm((current) => field === "currentMedications"
      ? { ...current, medicationsNone: !current.medicationsNone, currentMedications: "" }
      : { ...current, allergiesNone: !current.allergiesNone, allergies: "" });
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

      // Preserve ambiguous legacy thyroid/MTC history until the patient
      // explicitly selects one of the new thyroid/MTC choices.
      const clarifiesLegacy = condition === "Thyroid problems" ||
        condition === "Medullary thyroid cancer (MTC) in you or your family";
      const withoutNone = current.conditions.filter((item) =>
        item !== "None of the above" &&
        (!clarifiesLegacy || item !== legacyThyroidCondition));
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
    const medications = readOptionalDetails(form.currentMedications).trim();
    const allergies = readOptionalDetails(form.allergies).trim();
    data.set("current_medications_choice", form.medicationsNone ? "none" : medications ? "yes" : "");
    data.set("current_medications", form.medicationsNone ? "None" : medications);
    data.set("allergies_choice", form.allergiesNone ? "none" : allergies ? "yes" : "");
    data.set("allergies", form.allergiesNone ? "None" : allergies);
    data.set("medical_history_choice", form.medicalHistory.trim() ? "yes" : "none");
    data.set("medical_history", form.medicalHistory.trim() || "None");
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
    if (currentStep === 1) {
      if (!form.primaryConcern) return "Choose the type of care you need.";
      if (!form.careGoal.trim()) return "Tell us a little about what brought you here.";
    }

    if (currentStep === 2) {
      if (!form.firstName.trim()) return "Enter your name.";
      const age = Number(ageFromDateOfBirth(form.dateOfBirth));
      if (!form.dateOfBirth || !Number.isFinite(age) || age < 18 || age > 120) {
        return "Enter a valid date of birth. Consultations are for adults aged 18 and over.";
      }
      if (form.heightUnit === "cm" && !(Number(form.heightCm) >= 80 && Number(form.heightCm) <= 250)) return "Enter a valid height.";
      if (form.heightUnit === "ftin" && !(Number(form.heightFeet) * 30.48 + Number(form.heightInches || "0") * 2.54 >= 80 && Number(form.heightFeet) * 30.48 + Number(form.heightInches || "0") * 2.54 <= 250)) return "Enter a valid height.";
      const weightKg = Number(form.weightValue) * (form.weightUnit === "lb" ? 0.45359237 : 1);
      if (!(weightKg >= 20 && weightKg <= 400)) return "Enter a valid weight.";
      if (!form.sex) return "Select the option that applies to you.";
    }

    if (currentStep === 3) {
      if (form.conditions.includes(legacyThyroidCondition)) {
        return "Please clarify the previous combined thyroid/MTC answer using the two separate choices.";
      }
      if (form.conditions.length === 0) {
        return 'Select any applicable conditions or choose "None of the above".';
      }
    }

    if (currentStep === 4) {
      if (!form.medicationsNone && !readOptionalDetails(form.currentMedications).trim()) {
        return 'Enter your current medicines or select "None".';
      }
      if (!form.allergiesNone && !readOptionalDetails(form.allergies).trim()) {
        return 'Enter your medication allergies or select "None".';
      }
    }

    if (currentStep === 5) {
      if (form.primaryConcern === "weight") {
        if (!form.weightPreviousGlp1) return "Tell us whether you have used a weight-management medicine before.";
        if (!form.weightDigestiveHistory) return "Answer the pancreas, gallbladder and digestive-health question.";
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

    if (currentStep === 6 && (!form.consentTruth || !form.consentTelehealth || !form.consentPrivacy)) {
      return "Please review and confirm all three statements before submitting.";
    }

    return "";
  }

  async function saveProgress() {
    if (saveState === "saving" || isSubmitting || profileSaveState === "saving" || !form.primaryConcern) return;
    setSaveState("saving");
    setInvalidSection(null);
    setError("");
    try {
      // Draft saving does not modify the current patient profile. The dedicated
      // Save changes button, or successful consultation submission, does that.
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
    if (isSubmitting || profileSaveState === "saving") return;
    // Follow the order patients actually encounter each section on screen.
    // Keep the original validation keys so saved consultations remain compatible.
    const sections = [
      { id: "care-area", validationStep: 1 },
      { id: "treatment-questions", validationStep: 5 },
      { id: "about-you", validationStep: 2 },
      { id: "medical-history", validationStep: 3 },
      { id: "medications", validationStep: 4 },
      { id: "consent", validationStep: 6 },
    ];
    for (const section of sections) {
      const validationError = validate(section.validationStep);
      if (validationError) {
        setInvalidSection(section.id);
        setError(validationError);
        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            <ConsultationSectionHeading
              number={1}
              title="What brings you in today?"
            />

            <div className="patient-care-choice-grid consultation-care-options" role="group" aria-label="Choose a care area">
              {careAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    type="button"
                    key={area.id}
                    className={form.primaryConcern === area.id ? "is-selected" : ""}
                    onClick={() => patch("primaryConcern", area.id)}
                    aria-pressed={form.primaryConcern === area.id}
                  >
                    <Icon className="consultation-care-icon" size={20} strokeWidth={1.8} aria-hidden="true" />
                    <strong>{area.title}</strong>
                  </button>
                );
              })}
            </div>
            {form.primaryConcern && (
              <div className="patient-form-grid">
                <label className="patient-form-field patient-wide-field">
                  <span>In your own words, what brings you here today?</span>
                  <textarea
                    rows={5}
                    value={form.careGoal}
                    onChange={(e) => patch("careGoal", e.target.value)}
                    placeholder="Tell us what you're experiencing, when it started, and what you'd like help with."
                    maxLength={3000}
                  />
                </label>
              </div>
            )}
        {invalidSection === "care-area" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      {form.primaryConcern && (
      <section className="consultation-onepage-section" id="treatment-questions">
            <ConsultationSectionHeading
              number={2}
              title={`A few questions about ${careTitle(form.primaryConcern).toLowerCase()}`}
              description="These answers help your clinician understand your concern and check whether treatments may be safe for you."
            />

            <div className="patient-form-grid">
              {form.primaryConcern === "weight" && (
                <>
                  <label className="patient-form-field">
                    <span>Have you tried weight-management medicines such as semaglutide or tirzepatide?</span>
                    <select value={form.weightPreviousGlp1} onChange={(e) => patch("weightPreviousGlp1", e.target.value)}>
                      <option value="">Select</option>
                      <option value="never">No</option>
                      <option value="semaglutide">Yes, semaglutide</option>
                      <option value="tirzepatide">Yes, tirzepatide</option>
                      <option value="other">Yes, another GLP-1 medicine</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>Have you ever had inflammation of the pancreas (pancreatitis), gallbladder problems or severe digestive symptoms?</span>
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
                    <span>Where do you notice the most hair thinning or loss?</span>
                    <select value={form.hairPattern} onChange={(e) => patch("hairPattern", e.target.value)}>
                      <option value="">Select</option>
                      <option value="hairline">Hairline / temples</option>
                      <option value="crown">Crown</option>
                      <option value="diffuse">Diffuse thinning</option>
                      <option value="patchy">Patchy loss</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>How long have you noticed these changes?</span>
                    <select value={form.hairDuration} onChange={(e) => patch("hairDuration", e.target.value)}>
                      <option value="">Select</option>
                      <option value="under-6-months">Under 6 months</option>
                      <option value="6-12-months">6–12 months</option>
                      <option value="1-3-years">1–3 years</option>
                      <option value="over-3-years">More than 3 years</option>
                    </select>
                  </label>
                  <label className="patient-form-field patient-wide-field">
                    <span>Have you tried minoxidil or finasteride for hair loss?</span>
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
                    <span>Which sexual health concern would you like help with?</span>
                    <select value={form.sexualConcern} onChange={(e) => patch("sexualConcern", e.target.value)}>
                      <option value="">Select</option>
                      <option value="erectile-dysfunction">Erectile dysfunction</option>
                      <option value="premature-ejaculation">Premature ejaculation</option>
                      <option value="low-desire">Low sexual desire</option>
                      <option value="other">Another concern</option>
                    </select>
                  </label>
                  <label className="patient-form-field">
                    <span>How often does this concern affect you?</span>
                    <select value={form.sexualFrequency} onChange={(e) => patch("sexualFrequency", e.target.value)}>
                      <option value="">Select</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="often">Often</option>
                      <option value="most-times">Most times</option>
                    </select>
                  </label>
                  <label className="patient-form-field patient-wide-field">
                    <span>Do you take nitrates for chest pain (such as nitroglycerin), or have you been advised to avoid sexual activity because of a heart problem?</span>
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
      )}

      <section className="consultation-onepage-section" id="about-you">
        <ConsultationSectionHeading
          number={form.primaryConcern ? 3 : 2}
          title="Your details"
        />

        <div className="patient-form-grid">
            <label className="patient-form-field">
              <span>First name</span>
              <input type="text" value={form.firstName} onChange={(e) => patch("firstName", e.target.value)} autoComplete="given-name" maxLength={100} required />
            </label>
            <label className="patient-form-field">
              <span>Last name</span>
              <input type="text" value={form.lastName} onChange={(e) => patch("lastName", e.target.value)} autoComplete="family-name" maxLength={100} />
            </label>
            <label className="patient-form-field">
              <span>Date of birth</span>
              <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => patch("dateOfBirth", e.target.value)} autoComplete="bday" required />
            </label>
            <label className="patient-form-field">
              <span>Age (calculated from date of birth)</span>
              <input type="text" readOnly value={ageFromDateOfBirth(form.dateOfBirth)} aria-label="Age calculated from date of birth" />
            </label>
            <label className="patient-form-field">
              <span>Sex for medical screening</span>
              <select value={form.sex} onChange={(e) => patch("sex", e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="intersex">Intersex</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </label>
          </div>

        <div className="patient-form-grid">
              <div className="patient-form-field">
                <div className="patient-field-heading">
                  <label>Height</label>
                  <div className="patient-unit-switch">
                    <button type="button" className={form.heightUnit === "cm" ? "is-active" : ""} onClick={() => changeHeightUnit("cm")}>cm</button>
                    <button type="button" className={form.heightUnit === "ftin" ? "is-active" : ""} onClick={() => changeHeightUnit("ftin")}>ft / in</button>
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
                    <button type="button" className={form.weightUnit === "kg" ? "is-active" : ""} onClick={() => changeWeightUnit("kg")}>kg</button>
                    <button type="button" className={form.weightUnit === "lb" ? "is-active" : ""} onClick={() => changeWeightUnit("lb")}>lb</button>
                  </div>
                </div>
                <input type="number" min="1" inputMode="decimal" value={form.weightValue} onChange={(e) => patch("weightValue", e.target.value)} placeholder="Your weight" />
              </div>
        </div>

        <div className="consultation-profile-save">
          <p>Changes saved here will also update your profile and be used to prefill future consultations.</p>
          <button type="button" onClick={saveProfileChanges} disabled={!canSaveProfile} aria-disabled={!canSaveProfile}>
            <Save size={17} aria-hidden="true" />
            {profileSaveState === "saving" ? "Saving..." : profileSaveState === "saved" && !isProfileDirty ? "Saved" : "Save changes"}
          </button>
        </div>
        {profileSaveError && <p className="consultation-inline-error" role="alert">{profileSaveError}</p>}
        {profileSaveState === "saved" && !isProfileDirty && !profileSaveError && (
          <p className="consultation-profile-saved" role="status">Your latest details are saved to your profile.</p>
        )}

        {invalidSection === "about-you" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="medical-history">
            <ConsultationSectionHeading
              number={form.primaryConcern ? 4 : 3}
              title="Your health history"
              description="Choose any health conditions that apply to you. Your clinician can ask for further details if needed."
            />

            <fieldset className="patient-history-fieldset" aria-label="Health conditions">
              {form.conditions.includes(legacyThyroidCondition) && (
                <p className="consultation-legacy-condition-note" role="status">
                  Your previous answer combined thyroid problems with MTC. Please select the applicable option(s) separately below.
                </p>
              )}
              <div className="patient-condition-grid">
                {conditionOptions.map((condition) => (
                  <button
                    type="button"
                    key={condition.value}
                    className={form.conditions.includes(condition.value) ? "is-selected" : ""}
                    onClick={() => toggleCondition(condition.value)}
                    aria-pressed={form.conditions.includes(condition.value)}
                  >
                    <span>{form.conditions.includes(condition.value) ? <Check size={14} /> : null}</span>
                    {condition.label}
                  </button>
                ))}
              </div>
            </fieldset>

        {invalidSection === "medical-history" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section" id="medications">
        <ConsultationSectionHeading
          number={form.primaryConcern ? 5 : 4}
          title="Current Medications and Allergies"
        />

        <div className="patient-form-grid consultation-answer-grid consultation-optional-details">
          <div className="consultation-clinical-field">
            <div className="consultation-clinical-heading">
              <label htmlFor="consultation-medicines">Current medicines including supplement</label>
              <button
                type="button"
                className={`consultation-none-button${form.medicationsNone ? " is-selected" : ""}`}
                aria-pressed={form.medicationsNone}
                aria-label="No current medicines or supplements"
                onClick={() => confirmNone("currentMedications")}
              >
                <span className="consultation-none-indicator" aria-hidden="true" />
                None
              </button>
            </div>
            <textarea
              id="consultation-medicines"
              rows={3}
              value={form.currentMedications}
              onChange={(event) => updateClinicalDetail("currentMedications", event.target.value)}
              placeholder="Medicine or supplement names and doses"
              maxLength={3000}
              disabled={form.medicationsNone}
            />
          </div>
          <div className="consultation-clinical-field">
            <div className="consultation-clinical-heading">
              <label htmlFor="consultation-allergies">Medication allergies</label>
              <button
                type="button"
                className={`consultation-none-button${form.allergiesNone ? " is-selected" : ""}`}
                aria-pressed={form.allergiesNone}
                aria-label="No medication allergies"
                onClick={() => confirmNone("allergies")}
              >
                <span className="consultation-none-indicator" aria-hidden="true" />
                None
              </button>
            </div>
            <textarea
              id="consultation-allergies"
              rows={3}
              value={form.allergies}
              onChange={(event) => updateClinicalDetail("allergies", event.target.value)}
              placeholder="Medicine names and reactions"
              maxLength={3000}
              disabled={form.allergiesNone}
            />
          </div>
        </div>
        {invalidSection === "medications" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      <section className="consultation-onepage-section consultation-consent-section" id="consent">
        <ConsultationSectionHeading
          number={form.primaryConcern ? 6 : 5}
          title="Anything else your doctor should know?"
        />

        <label className="consultation-last-note">
          <span className="sr-only">Anything else your doctor should know?</span>
          <textarea
            rows={5}
            value={form.medicalHistory}
            onChange={(event) => patch("medicalHistory", event.target.value)}
            placeholder="Sleep, stress, past treatments, or anything else you'd like your doctor to know."
            maxLength={3000}
          />
        </label>

        <div className="consultation-last-checks" role="group" aria-label="Confirm before submitting">
          <label className="consultation-last-check">
            <input type="checkbox" checked={form.consentTruth} onChange={(event) => patch("consentTruth", event.target.checked)} />
            <span className="consultation-last-check-content">
              <strong>My answers are accurate</strong>
              <span>I confirm that the details I provided are true and complete to the best of my knowledge.</span>
            </span>
          </label>
          <label className="consultation-last-check">
            <input type="checkbox" checked={form.consentTelehealth} onChange={(event) => patch("consentTelehealth", event.target.checked)} />
            <span className="consultation-last-check-content">
              <strong>I consent to telehealth care</strong>
              <span>I understand a clinician will review my consultation remotely and may contact me for more details.</span>
            </span>
          </label>
          <label className="consultation-last-check">
            <input type="checkbox" checked={form.consentPrivacy} onChange={(event) => patch("consentPrivacy", event.target.checked)} />
            <span className="consultation-last-check-content">
              <strong>I understand how my health information is used</strong>
              <span>My answers will be used to assess and manage my consultation and may be shared with clinicians involved in my care.</span>
            </span>
          </label>
        </div>
        {invalidSection === "consent" && error && <p className="consultation-inline-error" role="alert">{error}</p>}
      </section>

      {error && !invalidSection && <p className="consultation-inline-error" role="alert">{error}</p>}

      <footer className="consultation-onepage-actions consultation-last-actions">
        <button type="submit" className="patient-primary-button" disabled={isSubmitting}>
          Send for clinical review
        </button>
      </footer>
    </form>
  );
}
