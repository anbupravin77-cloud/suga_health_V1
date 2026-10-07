import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const mechanisms = [
  {
    title: "Reduce DHT-related hair loss",
    copy: "Finasteride reduces conversion of testosterone to DHT, one of the main drivers of androgenetic hair loss.",
  },
  {
    title: "Support active hair growth",
    copy: "Minoxidil can help prolong the active growth phase of hair and is used in both topical and oral treatment approaches.",
  },
  {
    title: "Choose a route that fits the patient",
    copy: "Oral and topical treatment can have different trade-offs, which is why medical history and preference both matter.",
  },
];

const timeline = [
  { title: "Early months", copy: "The goal is often to reduce ongoing loss and establish a routine you can tolerate consistently." },
  { title: "Several months", copy: "Changes in shedding or density may become easier to judge as the hair cycle progresses." },
  { title: "Longer term", copy: "Hair-loss treatment usually requires ongoing use and periodic review rather than a short one-time course." },
];

export default function HairGrowthPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader
      title="Proven treatments for hair loss and thinning."
      subtitle="A clinician can assess your pattern of hair loss, previous treatment and health history before discussing options such as finasteride or minoxidil."
      image=""
      tone="hair"
    />

    <LegacySection>
      <div className="editorial-public-split editorial-public-split-top">
        <div>
          <h2>Treat the cause you can identify, not the anxiety around it.</h2>
          <p className="editorial-public-lead">Pattern hair loss often develops gradually. Good treatment starts by understanding what kind of loss is happening and whether prescription treatment is appropriate.</p>
        </div>
        <div className="editorial-public-rows editorial-public-rows-compact">
          {mechanisms.map((item) => <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>)}
        </div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="editorial-public-heading">
        <h2>Finasteride and minoxidil do different jobs.</h2>
        <p>They are often discussed together because one targets DHT-related loss while the other supports active growth.</p>
      </div>
      <div className="editorial-treatment-compare">
        <article>
          <h3>Finasteride</h3>
          <p>Primarily used to reduce DHT-related follicle miniaturization in androgenetic hair loss.</p>
          <div>
            <span><Check size={15} />Targets a hormonal driver of pattern hair loss</span>
            <span><Check size={15} />Can be considered in oral or topical approaches</span>
            <span><Check size={15} />Requires discussion of suitability and side effects</span>
          </div>
          <Link href="/sign-up" className="editorial-public-text-link">Discuss suitability <ArrowRight size={16} /></Link>
        </article>
        <article>
          <h3>Minoxidil</h3>
          <p>Used to support hair growth by affecting the hair-growth cycle and follicle activity.</p>
          <div>
            <span><Check size={15} />Commonly used for crown or diffuse thinning</span>
            <span><Check size={15} />Available in topical and some oral treatment plans</span>
            <span><Check size={15} />Consistency matters when judging response</span>
          </div>
          <Link href="/sign-up" className="editorial-public-text-link">Start consultation <ArrowRight size={16} /></Link>
        </article>
      </div>
    </LegacySection>

    <LegacySection>
      <div className="editorial-public-heading">
        <h2>Hair treatment is measured in months, not days.</h2>
        <p>The exact timeline varies, but these are the kinds of stages patients usually discuss during follow-up.</p>
      </div>
      <div className="editorial-timeline">
        {timeline.map((item) => <article key={item.title}>
          <span aria-hidden="true" />
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
        </article>)}
      </div>
    </LegacySection>

    <LegacyCta
      title="Start with the pattern of hair loss you are actually experiencing."
      description="A clinician can review the history first, then explain which treatment options are reasonable for your case."
    />
  </LegacyPublicFrame>;
}
