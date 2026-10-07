import { Check, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const standards = [
  {
    title: "A clinician reviews the full picture",
    copy: "Your symptoms, medical history, current medicines and treatment goals are considered together before a treatment decision is made.",
    icon: Stethoscope,
  },
  {
    title: "Treatment is not automatic",
    copy: "A prescription should follow clinical judgment. If more information or another kind of care is needed, that should come first.",
    icon: ShieldCheck,
  },
  {
    title: "Follow-up stays connected",
    copy: "Questions about treatment, response and side effects belong to the same care record rather than a disconnected support thread.",
    icon: HeartPulse,
  },
];

const principles = [
  "Explain what is being considered before asking for a decision.",
  "Use clear language before medical shorthand.",
  "Keep consultation history, treatment and messages connected.",
  "Make it obvious when a clinician still needs more information.",
];

export default function AboutPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader
      title="Clinical care should feel clear before it feels convenient."
      subtitle="Suga.Health is designed around private online consultations, clinician review and a patient record that keeps the next step understandable."
      image=""
    />

    <LegacySection>
      <div className="editorial-public-split">
        <div>
          <h2>What “live naturally” means in practice.</h2>
        </div>
        <div className="editorial-public-longcopy">
          <p>We do not use “natural” as a substitute for medical evidence. For us, it means using treatment when it is appropriate, understanding why it is being used, and keeping the patient informed as care changes over time.</p>
          <p>The goal is not to turn a prescription into the whole experience. Consultation, clinical judgment, treatment information and follow-up should work as one connected system.</p>
        </div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="editorial-public-heading">
        <h2>Three rules behind the care experience.</h2>
        <p>Simple enough for a patient to understand. Detailed enough for a clinician to make a responsible decision.</p>
      </div>
      <div className="editorial-public-rows">
        {standards.map((item) => {
          const Icon = item.icon;
          return <article key={item.title}>
            <Icon size={22} />
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>;
        })}
      </div>
    </LegacySection>

    <LegacySection>
      <div className="editorial-public-split editorial-public-split-top">
        <div>
          <h2>Trust is easier to build when the interface explains itself.</h2>
          <p className="editorial-public-lead">Healthcare already asks people to process unfamiliar terms and personal questions. The product should not add unnecessary confusion.</p>
        </div>
        <div className="editorial-public-checklist">
          {principles.map((item) => <div key={item}><Check size={16} /><span>{item}</span></div>)}
        </div>
      </div>
    </LegacySection>

    <LegacyCta
      title="Start with your health history, not a product choice."
      description="A private consultation gives the clinician the context needed to decide what should happen next."
    />
  </LegacyPublicFrame>;
}
