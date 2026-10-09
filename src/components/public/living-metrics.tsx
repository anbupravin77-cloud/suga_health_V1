"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import styles from "./living-metrics.module.css";

// Figures are the existing homepage claims, not independently verified results.
const metrics = [
  {
    figure: "5",
    unit: "MINUTES",
    label: "Complete your intake",
    index: "01 / INTAKE",
    description: "Tell us what you need help with, share your health history, and complete the consultation in one place.",
  },
  {
    figure: "<24",
    unit: "HOURS",
    label: "Clinical review",
    index: "02 / REVIEW",
    description: "A clinician reviews your answers, checks treatment suitability, and determines the appropriate next step.",
  },
  {
    figure: "100%",
    unit: "CLINICIAN-LED CARE",
    label: "Human clinical oversight",
    index: "03 / CLINICAL CARE",
    description: "Clinical decisions belong to qualified clinicians. Treatment is offered only when considered appropriate.",
  },
] as const;

export function LivingMetrics() {
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), 540);
    return () => window.clearTimeout(timer);
  }, [previous, selected]);

  function chooseMetric(index: number) {
    if (index === selected) return;
    setPrevious(selected);
    setSelected(index);
  }

  const metric = metrics[selected];

  return (
    <section ref={sectionRef} className={styles.root} aria-labelledby="living-metrics-title">
      <div className={styles.heading}>
        <h2 id="living-metrics-title">Care, in numbers.</h2>
        <p>Three things to know before you begin.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.stage} aria-live="off">
          <span className={styles.index}>{metric.index}</span>
          <div className={styles.counterWindow} aria-hidden="true">
            {previous !== null && (
              <span key={`exit-${previous}-${selected}`} className={styles.figureOutgoing}>
                {metrics[previous].figure}
              </span>
            )}
            <span key={`enter-${selected}`} className={`${styles.figure} ${entered ? styles.figureEntering : ""}`}>
              {metric.figure}
            </span>
          </div>
          <span className={styles.unit}>{metric.unit}</span>
        </div>

        <nav className={styles.selection} aria-label="Select a care metric">
          <span
            className={styles.movingBar}
            style={{ transform: `translateY(${selected * 100}%)` }}
            aria-hidden="true"
          />
          {metrics.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.selector} ${selected === index ? styles.selectorActive : ""}`}
              aria-pressed={selected === index}
              onMouseEnter={() => chooseMetric(index)}
              onFocus={() => chooseMetric(index)}
              onClick={() => chooseMetric(index)}
            >
              <span className={styles.selectorNumber}>0{index + 1}</span>
              <span className={styles.selectorTitle}>{item.label}</span>
              <ArrowUpRight className={styles.selectorArrow} aria-hidden="true" size={18} />
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.foot}>
        <p className={styles.description} aria-live="polite" aria-atomic="true">
          {metric.description}
        </p>
        <p className={styles.disclaimer}>
          Times shown are indicative, not guaranteed. Clinical suitability and next steps depend on individual review.
        </p>
      </div>
    </section>
  );
}
