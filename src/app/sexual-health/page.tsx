import Link from "next/link";
import { ArrowRight, Check, Lock, Package } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const topics = [
  {
    title: "Erectile dysfunction",
    copy: "A clinician can review symptoms, current medicines and relevant health factors before discussing options such as sildenafil or tadalafil.",
  },
  {
    title: "Other sexual-health concerns",
    copy: "Some concerns need a broader review rather than an immediate prescription. The consultation helps identify what needs attention first.",
  },
  {
    title: "Underlying health factors",
    copy: "Blood pressure, cardiovascular risk, sleep, medications and metabolic health can all matter when evaluating sexual-health symptoms.",
  },
];

export default function SexualHealthPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader
      title="Private treatment for sexual health concerns."
      subtitle="Discuss symptoms through a confidential online consultation. A clinician reviews the relevant health factors before deciding whether treatment is appropriate."
      image=""
      tone="sexual"
    />

    <LegacySection>
      <div className="editorial-public-heading">
        <h2>Start with the concern, then look at the health context around it.</h2>
        <p>Sexual-health symptoms can have more than one cause. The consultation is designed to collect enough information for a clinician to make a safer decision.</p>
      </div>
      <div className="editorial-public-rows">
        {topics.map((item) => <article key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
        </article>)}
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="editorial-public-split editorial-public-split-top">
        <div>
          <h2>Sildenafil and tadalafil are related, but they are not interchangeable for everyone.</h2>
          <p className="editorial-public-lead">Both are PDE5 inhibitors, but timing, duration, dose and patient health can affect which option is suitable.</p>
          <Link href="/sign-up" className="editorial-public-text-link">Start a private assessment <ArrowRight size={16} /></Link>
        </div>
        <div className="editorial-public-checklist">
          <div><Check size={16} /><span>Review current medications and relevant conditions</span></div>
          <div><Check size={16} /><span>Consider interactions and contraindications</span></div>
          <div><Check size={16} /><span>Choose dose and timing with clinical guidance</span></div>
        </div>
      </div>
    </LegacySection>

    <LegacySection>
      <div className="editorial-public-heading">
        <h2>Privacy should be part of the product, not a marketing decoration.</h2>
        <p>The experience is designed so sensitive questions, treatment details and clinician communication stay inside the patient account.</p>
      </div>
      <div className="editorial-public-rows editorial-public-rows-two">
        <article>
          <Lock size={22} />
          <h3>Private consultation record</h3>
          <p>Your submitted answers and later care messages stay attached to the consultation they belong to.</p>
        </article>
        <article>
          <Package size={22} />
          <h3>Delivery details should stay discreet</h3>
          <p>Medication delivery and packaging information should be shown clearly before a patient commits to treatment.</p>
        </article>
      </div>
    </LegacySection>

    <LegacyCta
      title="Five private minutes can be enough to start the right conversation."
      description="Answer the relevant health questions first. A clinician reviews the details before recommending treatment."
    />
  </LegacyPublicFrame>;
}
