import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const steps = [
  {
    title: "Review the health context",
    copy: "Weight history, current medicines, previous attempts, relevant conditions and treatment goals are reviewed before medication is considered.",
  },
  {
    title: "Decide whether a GLP-1 fits",
    copy: "A clinician evaluates suitability and may ask for more information before recommending a treatment.",
  },
  {
    title: "Adjust based on response",
    copy: "Follow-up should focus on tolerability, side effects, progress and whether the treatment still makes sense for you.",
  },
];

const medications = [
  {
    title: "Semaglutide",
    copy: "A GLP-1 receptor agonist used in weight-management care. It can reduce appetite and slow gastric emptying.",
    points: ["Usually given on a scheduled dosing plan", "Dose changes should follow clinician guidance", "Suitability depends on your health history"],
  },
  {
    title: "Tirzepatide",
    copy: "A dual GIP and GLP-1 receptor agonist that can affect appetite, satiety and blood-sugar regulation.",
    points: ["Treatment is individualized", "Monitoring matters as the dose changes", "Not appropriate for every patient"],
  },
];

export default function WeightLossPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader
      title="Medical weight loss that starts with your biology."
      subtitle="A clinician reviews your weight history, health risks, medications and goals before deciding whether GLP-1 treatment is appropriate."
      image=""
      tone="weight"
    />

    <LegacySection>
      <div className="editorial-public-split editorial-public-split-top">
        <div>
          <h2>Medication can help, but the decision starts before the prescription.</h2>
          <p className="editorial-public-lead">Weight regulation involves appetite signals, metabolism, sleep, medications, health conditions and daily habits. The consultation is where those pieces are brought together.</p>
        </div>
        <div className="editorial-public-rows editorial-public-rows-compact">
          {steps.map((item, index) => <article key={item.title}>
            <span className="editorial-row-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>)}
        </div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="editorial-public-heading">
        <h2>Two commonly discussed GLP-1 options.</h2>
        <p>The right treatment depends on your medical history and clinician review, not simply on which medication sounds stronger.</p>
      </div>
      <div className="editorial-treatment-compare">
        {medications.map((med) => <article key={med.title}>
          <h3>{med.title}</h3>
          <p>{med.copy}</p>
          <div>
            {med.points.map((item) => <span key={item}><Check size={15} />{item}</span>)}
          </div>
          <Link href="/sign-up" className="editorial-public-text-link">Check suitability <ArrowRight size={16} /></Link>
        </article>)}
      </div>
    </LegacySection>

    <LegacySection>
      <div className="editorial-public-statement">
        <h2>Progress matters more than a dramatic first week.</h2>
        <p>Your clinician can use follow-up to review response, side effects and whether the plan should stay the same, change or stop.</p>
      </div>
    </LegacySection>

    <LegacyCta
      title="Start with a clinical review of your weight history."
      description="Complete the consultation first. Treatment comes after a clinician has enough context to make a decision."
    />
  </LegacyPublicFrame>;
}
