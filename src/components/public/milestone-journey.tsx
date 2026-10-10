"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { rememberReturnPosition } from "./return-position";
import styles from "./milestone-journey.module.css";

// Keep the existing treatment milestones and claims unchanged.
const timelines = {
  weight: [
    { phase: "Month 1", label: "Metabolic Reset", description: "Initial micro-dose titration minimizes side effects while dampening constant food cravings and biological 'food noise'." },
    { phase: "Months 2–3", label: "Consistent Loss", description: "Steady 1–2 lbs weekly reduction. Improved insulin sensitivity, increased daytime energy, and reduced visceral fat." },
    { phase: "Months 4–6+", label: "Target Stability", description: "Reach your personal target weight. Physician evaluates maintenance dosing to lock in sustainable metabolic health." },
  ],
  hair: [
    { phase: "Months 1–2", label: "Follicle Stabilization", description: "DHT inhibition begins. Normal initial shedding of weak hairs as miniaturized follicles enter the active anagen growth phase." },
    { phase: "Months 3–4", label: "Initial Regrowth", description: "Early signs of thickening along the crown and hairline. Faint vellus hairs transition into stronger terminal strands." },
    { phase: "Months 6+", label: "Peak Density", description: "Noticeably denser coverage, reduced scalp visibility, and strengthened hair shafts with permanent daily routine." },
  ],
  sexual: [
    { phase: "Day 1", label: "Immediate Efficacy", description: "On-demand or daily protocol delivers reliable blood flow within 30 to 60 minutes of ingestion." },
    { phase: "Weeks 2–4", label: "Confidence Restored", description: "Elimination of performance anxiety. Daily micro-dosing allows completely spontaneous, natural intimacy." },
    { phase: "Ongoing", label: "Continuous Optimization", description: "Regular check-ins with your Suga physician to fine-tune dosage, refill automatically, and monitor total vascular health." },
  ],
};

type TimelineKey = keyof typeof timelines;
type TimelineStep = { phase: string; label: string; description: string };

const categories: { key: TimelineKey; title: string; suffix?: string }[] = [
  { key: "weight", title: "Weight Loss", suffix: "GLP-1" },
  { key: "hair", title: "Hair Regrowth" },
  { key: "sexual", title: "Sexual Vitality" },
];

function MilestoneCard({ step, index, forwardedRef }: {
  step: TimelineStep;
  index: number;
  forwardedRef?: (node: HTMLElement | null) => void;
}) {
  return (
    <div className={styles.cardGlowFrame} ref={forwardedRef}>
      <article className={styles.card}>
      <div className={styles.cardMeta}>
        <span className={styles.phase}>{step.phase}</span>
        <span className={styles.stepNumber}>STEP 0{index + 1}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{step.label}</h3>
        <p className={styles.cardDescription}>{step.description}</p>
      </div>
        <span className={styles.cardRule} aria-hidden="true" />
      </article>
    </div>
  );
}

export function MilestoneJourney() {
  const [active, setActive] = useState<TimelineKey>("weight");
  const [departing, setDeparting] = useState<TimelineKey | null>(null);
  const [sequence, setSequence] = useState(0);
  const hasInteracted = useRef(false);
  const titleRefs = useRef<Partial<Record<TimelineKey, HTMLButtonElement | null>>>({});
  const incomingRefs = useRef<(HTMLElement | null)[]>([]);
  const outgoingRefs = useRef<(HTMLElement | null)[]>([]);
  const previousActive = useRef<TimelineKey>("weight");
  const departingRef = useRef<TimelineKey | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [glowVisible, setGlowVisible] = useState(false);

  // Keep the decorative border animation off the GPU while this section is
  // outside the viewport or the tab is in the background.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let intersecting = false;
    const sync = () => setGlowVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { threshold: 0.08 }
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);


  function selectCategory(key: TimelineKey) {
    if (active === key) return;
    hasInteracted.current = true;
    departingRef.current = active === key ? null : active;
    setDeparting(departingRef.current);
    previousActive.current = active;
    setActive(key);
    setSequence((current) => current + 1);
  }

  useLayoutEffect(() => {
    if (!hasInteracted.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 760px)").matches;
    if (reduced) {
      departingRef.current = null;
      setDeparting(null);
      return;
    }
    if (compact) {
      // Avoid animating the departing layer beneath the reader's finger.
      departingRef.current = null;
      setDeparting(null);
    }

    // Geometry is measured on every selection. Each card actually originates
    // at the chosen title, instead of faking the effect with an opacity swap.
    const source = titleRefs.current[active]?.getBoundingClientRect();
    if (!source) return;
    const animations: Animation[] = [];

    const translateToTitle = (rect: DOMRect, title: DOMRect) => ({
      x: title.left + title.width * .64 - (rect.left + rect.width / 2),
      y: title.top + title.height / 2 - (rect.top + rect.height / 2),
    });

    incomingRefs.current.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (compact && (rect.top >= window.innerHeight || rect.bottom <= 0)) return;
      const delta = compact ? { x: -16, y: 8 } : translateToTitle(rect, source);
      const animation = card.animate(
        [
          { transform: compact ? "translate3d(-16px, 8px, 0) scale(.985)" : `translate3d(${delta.x}px, ${delta.y}px, 0) scale(.28)`, opacity: 0 },
          { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
        ],
        { duration: compact ? 365 : 780, delay: index * (compact ? 35 : 65), easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" },
      );
      animations.push(animation);
    });

    if (departingRef.current && !compact) {
      const oldSource = titleRefs.current[previousActive.current]?.getBoundingClientRect();
      if (oldSource) {
        outgoingRefs.current.forEach((card, index) => {
          if (!card) return;
          const delta = translateToTitle(card.getBoundingClientRect(), oldSource);
          const animation = card.animate(
            [
              { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
              { transform: `translate3d(${delta.x}px, ${delta.y}px, 0) scale(.28)`, opacity: 0 },
            ],
            { duration: 480, delay: index * 40, easing: "cubic-bezier(.45, 0, .55, 1)", fill: "both" },
          );
          animations.push(animation);
        });
      }
    }

    const cleanup = window.setTimeout(() => {
      departingRef.current = null;
      setDeparting(null);
    }, 690);
    return () => {
      window.clearTimeout(cleanup);
      animations.forEach((animation) => animation.cancel());
    };
  }, [active, sequence]);

  return (
    <section className={`home-progression home-editorial-section ${styles.section}`} aria-labelledby="milestones-title">
      <div className={`home-section-shell ${styles.shell}`}>
        <header className={styles.topline}>
          <span className={styles.eyebrow}>Clinical progression</span>
          <h2 className={styles.heading} id="milestones-title">Clear Milestones from Day 1.</h2>
          <p className={styles.description}>Expect real, measurable physiological changes with continuous medical guidance.</p>
        </header>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <div className={styles.categoryGroup} role="group" aria-label="Choose a treatment to explore milestones">
              {categories.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  ref={(node) => { titleRefs.current[item.key] = node; }}
                  className={`${styles.category} ${active === item.key ? styles.selected : ""}`}
                  aria-pressed={active === item.key}
                  onPointerEnter={(event) => { if (event.pointerType === "mouse") selectCategory(item.key); }}
                  onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) selectCategory(item.key); }}
                  onClick={() => selectCategory(item.key)}
                >
                  <span className={styles.categoryText}>{item.title}{item.suffix && <span className={styles.suffix}> ({item.suffix})</span>}</span>
                  <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
                </button>
              ))}
            </div>

            <Link
              href="/sign-up?next=%2Fconsultation%2Fstart"
              onClick={rememberReturnPosition}
              className={styles.cta}
            >
              See if you qualify today <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div ref={stageRef} className={styles.stage} data-glow-visible={glowVisible} aria-live="polite" aria-atomic="false">
            <div className={styles.stageHeader}>
              <span>Treatment timeline</span>
              <span className={styles.stageCount}>03 MILESTONES</span>
            </div>
            <div className={styles.cardsArea}>
              {departing && (
                <div className={`${styles.cardsLayer} ${styles.outgoing}`} aria-hidden="true">
                  {timelines[departing].map((step, index) => (
                    <MilestoneCard
                      key={`departing-${departing}-${index}`}
                      step={step}
                      index={index}
                      forwardedRef={(node) => { outgoingRefs.current[index] = node; }}
                    />
                  ))}
                </div>
              )}
              <div className={styles.cardsLayer} key={`${active}-${sequence}`}>
                {timelines[active].map((step, index) => (
                  <MilestoneCard
                    key={`${active}-${index}`}
                    step={step}
                    index={index}
                    forwardedRef={(node) => { incomingRefs.current[index] = node; }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
