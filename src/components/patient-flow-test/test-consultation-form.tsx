"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  HeartPulse,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { submitConsultation } from "@/app/actions";

type Patient = {
  name: string;
  email: string;
  phone: string;
  age: number | null;
  sex: string;
  heightCm: number | null;
  weightKg: number | null;
};

type CareArea = "weight" | "hair" | "sex";
type YesNo = "yes" | "none" | "";

const careAreas: Array<{ id: CareArea; title: string; copy: string; icon: typeof HeartPulse }> = [
  { id: "weight", title: "Weight Loss", copy: "Doctor-guided support for sustainable weight management.", icon: HeartPulse },
  { id: "hair", title: "Hair Growth", copy: "Clinical support for thinning, shedding and hair loss.", icon: Sparkles },
  { id: "sex", title: "Sexual Health", copy: "Private clinician-led care for sexual health concerns.", icon: ShieldCheck },
];

const conditions = ["Diabetes / prediabetes", "High blood pressure", "Thyroid condition", "Heart condition", "Kidney condition", "PCOS"];

const familyConditions = ["Diabetes", "Heart disease", "High blood pressure", "High cholesterol", "Thyroid disorder", "Obesity", "Cancer"];

const goals: Record<CareArea, string[]> = {
  weight: ["Lose weight", "Manage appetite", "Improve metabolic health", "Discuss treatment options"],
  hair: ["Reduce hair shedding", "Improve hair density", "Treat a receding hairline", "Understand the cause of hair loss"],
  sex: ["Improve erectile function", "Address premature ejaculation", "Discuss low libido", "Discuss another sexual-health concern"],
};

function toggleFromList(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function TestConsultationForm({ patient }: { patient: Patient }) {
  const router = useRouter();
  const [careArea, setCareArea] = useState<CareArea | "">("");
  const [height, setHeight] = useState(patient.heightCm ? String(patient.heightCm) : "");
  const [weight, setWeight] = useState(patient.weightKg ? String(patient.weightKg) : "");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [noConditions, setNoConditions] = useState(false);
  const [surgery, setSurgery] = useState<YesNo>("");
  const [surgeryDetails, setSurgeryDetails] = useState("");
  const [familyHistory, setFamilyHistory] = useState<YesNo>("");
  const [selectedFamilyHistory, setSelectedFamilyHistory] = useState<string[]>([]);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState("");
  const [medications, setMedications] = useState<YesNo>("");
  const [medicationDetails, setMedicationDetails] = useState("");
  const [allergies, setAllergies] = useState<YesNo>("");
  const [allergyDetails, setAllergyDetails] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [extra, setExtra] = useState("");
  const [consentTruth, setConsentTruth] = useState(false);
  const [consentTelehealth, setConsentTelehealth] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progressLabel = useMemo(() => careArea ? "Treatment selected" : "Choose a treatment to begin", [careArea]);

  function chooseCondition(condition: string) {
    setNoConditions(false);
    setSelectedConditions((current) => toggleFromList(current, condition));
  }

  function chooseNoConditions() {
    setNoConditions((current) => !current);
    setSelectedConditions([]);
  }

  function validate() {
    if (!careArea) return "Choose what you would like help with.";
    if (!height || Number(height) <= 0) return "Enter your height.";
    if (!weight || Number(weight) <= 0) return "Enter your weight.";
    if (!noConditions && selectedConditions.length === 0) return "Select any current conditions or choose None.";
    if (!surgery) return "Tell us whether you have had surgery.";
    if (surgery === "yes" && !surgeryDetails.trim()) return "Add your surgical history.";
    if (!familyHistory) return "Choose whether relevant conditions run in your family.";
    if (!medications) return "Tell us whether you currently take medication.";
    if (medications === "yes" && !medicationDetails.trim()) return "List your current medications.";
    if (!allergies) return "Tell us whether you have any allergies.";
    if (allergies === "yes" && !allergyDetails.trim()) return "List your known allergies.";
    if (!goal) return "Choose your main treatment goal.";
    if (!duration) return "Choose how long this concern has been present.";
    if (!consentTruth || !consentTelehealth || !consentPrivacy) return "Please accept all three consent statements.";
    return "";
  }

  function buildMedicalHistory() {
    const parts = [
      surgery === "yes" ? `Surgical history: ${surgeryDetails.trim()}` : "Surgical history: None reported",
      familyHistory === "yes"
        ? `Family history: ${[...selectedFamilyHistory, familyHistoryDetails.trim()].filter(Boolean).join(", ") || "Relevant family history reported"}`
        : "Family history: None reported",
    ];
    return parts.join("\n");
  }

  function buildCareGoal() {
    return [
      `Primary goal: ${goal}`,
      `Duration: ${duration}`,
      extra.trim() ? `Additional information: ${extra.trim()}` : "",
    ].filter(Boolean).join("\n");
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      document.getElementById("pft-consultation-top")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");

    const data = new FormData();
    data.set("primary_concern", careArea);
    data.set("height_unit", "cm");
    data.set("height_cm", height);
    data.set("weight_unit", "kg");
    data.set("weight_value", weight);
    data.set("age", patient.age ? String(patient.age) : "");
    data.set("sex", patient.sex);

    if (noConditions) data.append("conditions", "None of the above");
    else selectedConditions.forEach((condition) => data.append("conditions", condition));

    data.set("current_medications", medications === "none" ? "None" : medicationDetails.trim());
    data.set("allergies", allergies === "none" ? "None known" : allergyDetails.trim());
    data.set("medical_history", buildMedicalHistory());
    data.set("care_goal", buildCareGoal());
    data.set("consent_truth", String(consentTruth));
    data.set("consent_telehealth", String(consentTelehealth));
    data.set("consent_privacy", String(consentPrivacy));

    const result = await submitConsultation(data);
    if (!result.ok || !result.id) {
      setSubmitting(false);
      setError(result.error || "We couldn't submit your consultation.");
      return;
    }

    router.replace(`/patient-flow-test/dashboard?consultation=${result.id}`);
    router.refresh();
  }

  return (
    <main className="pft-consultation-page" id="pft-consultation-top">
      <header className="pft-consultation-header">
        <Link href="/patient-flow-test/account" className="pft-round-arrow" aria-label="Back to account">
          <ArrowLeft size={22} />
        </Link>
        <div className="pft-wordmark pft-wordmark-centered">
          <strong>Suga.health</strong>
          <span>live naturally</span>
        </div>
        <span className="pft-secure-mark"><LockKeyhole size={15} /> Secure</span>
      </header>

      <section className="pft-consultation-hero">
        <span className="pft-eyebrow">CONFIDENTIAL PATIENT INTAKE</span>
        <h1>Tell your doctor what matters.</h1>
        <p>One clear form. Most questions are simple choices, and we only open extra fields when they are useful.</p>
        <div className="pft-mini-progress"><span className={careArea ? "is-active" : ""} /></div>
        <small>{progressLabel}</small>
      </section>

      {error && <p className="pft-alert pft-alert-error pft-consultation-error" role="alert">{error}</p>}

      <div className="pft-consultation-form">
        <section className="pft-form-section pft-form-section-care">
          <div className="pft-section-number">01</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>What would you like help with?</h2>
              <p>Choose one. Your doctor will tailor the consultation to your concern.</p>
            </div>

            <div className="pft-care-grid">
              {careAreas.map(({ id, title, copy, icon: Icon }) => (
                <button type="button" key={id} className={careArea === id ? "is-selected" : ""} onClick={() => { setCareArea(id); setGoal(""); }}>
                  <span className="pft-care-icon"><Icon size={22} /></span>
                  <span><strong>{title}</strong><small>{copy}</small></span>
                  <span className="pft-choice-dot">{careArea === id ? <Check size={15} /> : null}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="pft-form-section">
          <div className="pft-section-number">02</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>Your measurements</h2>
              <p>Used by your clinician when reviewing treatment suitability.</p>
            </div>
            <div className="pft-two-column">
              <label className="pft-field">
                <span>Height (cm)</span>
                <input type="number" min="1" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 172" />
              </label>
              <label className="pft-field">
                <span>Weight (kg)</span>
                <input type="number" min="1" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 84" />
              </label>
            </div>
            <div className="pft-profile-note">
              <strong>{patient.name}</strong>
              <span>{patient.age ? `${patient.age} years` : "Age saved in account"} · {patient.sex ? patient.sex.replaceAll("-", " ") : "Gender saved in account"} · {patient.phone}</span>
            </div>
          </div>
        </section>

        <section className="pft-form-section">
          <div className="pft-section-number">03</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>Medical history</h2>
              <p>Choose what applies. Extra typing only appears when you have something to add.</p>
            </div>

            <div className="pft-question-block">
              <h3>Do you currently have any of these conditions?</h3>
              <div className="pft-chip-grid">
                {conditions.map((condition) => (
                  <button type="button" key={condition} className={selectedConditions.includes(condition) ? "is-selected" : ""} onClick={() => chooseCondition(condition)}>
                    {condition}
                  </button>
                ))}
                <button type="button" className={noConditions ? "is-selected" : ""} onClick={chooseNoConditions}>None</button>
              </div>
            </div>

            <div className="pft-question-block">
              <h3>Have you had any surgery?</h3>
              <div className="pft-binary-options">
                <button type="button" className={surgery === "none" ? "is-selected" : ""} onClick={() => { setSurgery("none"); setSurgeryDetails(""); }}>No / None</button>
                <button type="button" className={surgery === "yes" ? "is-selected" : ""} onClick={() => setSurgery("yes")}>Yes</button>
              </div>
              {surgery === "yes" && (
                <label className="pft-field pft-reveal-field">
                  <span>Tell us about your surgery</span>
                  <textarea rows={3} value={surgeryDetails} onChange={(e) => setSurgeryDetails(e.target.value)} placeholder="Procedure and approximate year, if you remember" />
                </label>
              )}
            </div>

            <div className="pft-question-block">
              <h3>Any relevant family medical history?</h3>
              <div className="pft-binary-options">
                <button type="button" className={familyHistory === "none" ? "is-selected" : ""} onClick={() => { setFamilyHistory("none"); setSelectedFamilyHistory([]); setFamilyHistoryDetails(""); }}>None known</button>
                <button type="button" className={familyHistory === "yes" ? "is-selected" : ""} onClick={() => setFamilyHistory("yes")}>Yes</button>
              </div>
              {familyHistory === "yes" && (
                <div className="pft-reveal-field">
                  <div className="pft-chip-grid">
                    {familyConditions.map((condition) => (
                      <button type="button" key={condition} className={selectedFamilyHistory.includes(condition) ? "is-selected" : ""} onClick={() => setSelectedFamilyHistory((current) => toggleFromList(current, condition))}>
                        {condition}
                      </button>
                    ))}
                  </div>
                  <label className="pft-field">
                    <span>Anything else? <small>Optional</small></span>
                    <input value={familyHistoryDetails} onChange={(e) => setFamilyHistoryDetails(e.target.value)} placeholder="e.g. Father had a heart attack at 52" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pft-form-section">
          <div className="pft-section-number">04</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>Medications & allergies</h2>
              <p>Your doctor checks these before recommending treatment.</p>
            </div>

            <div className="pft-question-block">
              <h3>Do you currently take any medications?</h3>
              <div className="pft-binary-options">
                <button type="button" className={medications === "none" ? "is-selected" : ""} onClick={() => { setMedications("none"); setMedicationDetails(""); }}>None</button>
                <button type="button" className={medications === "yes" ? "is-selected" : ""} onClick={() => setMedications("yes")}>Yes</button>
              </div>
              {medications === "yes" && (
                <label className="pft-field pft-reveal-field">
                  <span>Current medications</span>
                  <textarea rows={3} value={medicationDetails} onChange={(e) => setMedicationDetails(e.target.value)} placeholder="Medicine name, dose if known, and how often you take it" />
                </label>
              )}
            </div>

            <div className="pft-question-block">
              <h3>Do you have any known allergies?</h3>
              <div className="pft-binary-options">
                <button type="button" className={allergies === "none" ? "is-selected" : ""} onClick={() => { setAllergies("none"); setAllergyDetails(""); }}>None known</button>
                <button type="button" className={allergies === "yes" ? "is-selected" : ""} onClick={() => setAllergies("yes")}>Yes</button>
              </div>
              {allergies === "yes" && (
                <label className="pft-field pft-reveal-field">
                  <span>Known allergies</span>
                  <textarea rows={3} value={allergyDetails} onChange={(e) => setAllergyDetails(e.target.value)} placeholder="Medicine, food or other allergy and reaction if known" />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="pft-form-section">
          <div className="pft-section-number">05</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>Your treatment goals</h2>
              <p>{careArea ? "These questions adapt to the treatment you selected." : "Choose a treatment above to see the relevant options."}</p>
            </div>

            {careArea && (
              <>
                <div className="pft-question-block">
                  <h3>What is your main goal?</h3>
                  <div className="pft-option-list">
                    {goals[careArea].map((item) => (
                      <button type="button" key={item} className={goal === item ? "is-selected" : ""} onClick={() => setGoal(item)}>
                        <span className="pft-radio-dot" /> {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pft-question-block">
                  <h3>How long have you been experiencing this concern?</h3>
                  <div className="pft-option-list">
                    {["A few weeks", "A few months", "More than 6 months", "More than a year", "Prefer not to say"].map((item) => (
                      <button type="button" key={item} className={duration === item ? "is-selected" : ""} onClick={() => setDuration(item)}>
                        <span className="pft-radio-dot" /> {item}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="pft-field pft-reveal-field">
              <span>Anything else your doctor should know? <small>Optional</small></span>
              <textarea rows={4} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Symptoms, previous attempts, worries, or anything else you want your doctor to understand" />
            </label>
          </div>
        </section>

        <section className="pft-form-section pft-consent-section">
          <div className="pft-section-number">06</div>
          <div className="pft-section-content">
            <div className="pft-section-heading">
              <h2>Consent & submit</h2>
              <p>Confirm these three statements before your consultation is sent to the clinical team.</p>
            </div>

            <div className="pft-consent-list">
              <label>
                <input type="checkbox" checked={consentTruth} onChange={(e) => setConsentTruth(e.target.checked)} />
                <span><strong>My answers are accurate</strong><small>I confirm the information I provided is true and complete to the best of my knowledge.</small></span>
              </label>
              <label>
                <input type="checkbox" checked={consentTelehealth} onChange={(e) => setConsentTelehealth(e.target.checked)} />
                <span><strong>I consent to telehealth care</strong><small>I understand a licensed clinician will review my consultation remotely and may contact me for more detail.</small></span>
              </label>
              <label>
                <input type="checkbox" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} />
                <span><strong>I accept the privacy terms</strong><small>I understand my health information is used and shared with my care team for treatment purposes.</small></span>
              </label>
            </div>

            <button className="pft-submit-button" type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="pft-spin" size={20} /> : <CheckCircle2 size={20} />}
              <span>{submitting ? "Sending securely…" : "Send to my doctor"}</span>
            </button>
            <p className="pft-submit-note"><ShieldCheck size={15} /> Your answers are transmitted through your authenticated Suga.Health account.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
