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
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hoverResumeRef = useRef<number | null>(null);
  const touchResumeRef = useRef<number | null>(null);
  const lastPointerTypeRef = useRef("mouse");

  // Only autoplay while this section is visible, the tab is active and
  // reduced-motion is not requested. One observer handles first reveal too.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => setReducedMotion(motionQuery.matches);
    const handlePageVisibility = () => setPageVisible(!document.hidden);

    handleMotion();
    handlePageVisibility();

    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25);
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: [0, 0.25, 0.5] },
    );
    observer.observe(node);
    motionQuery.addEventListener("change", handleMotion);
    document.addEventListener("visibilitychange", handlePageVisibility);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotion);
      document.removeEventListener("visibilitychange", handlePageVisibility);
    };
  }, []);

  useEffect(() => () => {
    if (hoverResumeRef.current !== null) window.clearTimeout(hoverResumeRef.current);
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
  }, []);

  // Timeout, not interval: every metric gets a full reading window and a
  // manual selection resets the clock. Hover, touch and focus always win.
  useEffect(() => {
    if (!inView || !pageVisible || reducedMotion || hoverPaused || focusPaused || touchPaused) return;

    const timer = window.setTimeout(() => {
      setPrevious(selected);
      setSelected((selected + 1) % metrics.length);
    }, 4700);
    return () => window.clearTimeout(timer);
  }, [inView, pageVisible, reducedMotion, hoverPaused, focusPaused, touchPaused, selected]);

  function pauseHover() {
    if (hoverResumeRef.current !== null) {
      window.clearTimeout(hoverResumeRef.current);
      hoverResumeRef.current = null;
    }
    setHoverPaused(true);
  }

  function releaseHover() {
    if (hoverResumeRef.current !== null) window.clearTimeout(hoverResumeRef.current);
    hoverResumeRef.current = window.setTimeout(() => {
      setHoverPaused(false);
      hoverResumeRef.current = null;
    }, 1100);
  }

  function selectOnTouch(index: number) {
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
    setTouchPaused(true);
    chooseMetric(index);
    // Preserve the reading time on small touchscreens before autoplay resumes.
    touchResumeRef.current = window.setTimeout(() => {
      setTouchPaused(false);
      touchResumeRef.current = null;
    }, 8500);
  }

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
        <h2 id="living-metrics-title">The Standards Behind Your Care.</h2>
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

        <nav
          className={styles.selection}
          aria-label="Select a care metric"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") pauseHover();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") releaseHover();
          }}
          onFocusCapture={(event) => {
            if ((event.target as HTMLElement).matches(":focus-visible")) setFocusPaused(true);
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
          }}
        >
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
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") chooseMetric(index);
              }}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  setFocusPaused(true);
                  chooseMetric(index);
                }
              }}
              onPointerDown={(event) => {
                lastPointerTypeRef.current = event.pointerType;
              }}
              onClick={(event) => {
                if (event.detail === 0) {
                  setFocusPaused(true);
                  chooseMetric(index);
                } else if (lastPointerTypeRef.current === "touch" || lastPointerTypeRef.current === "pen") {
                  selectOnTouch(index);
                } else {
                  chooseMetric(index);
                }
              }}
            >
              <span className={styles.selectorNumber}>0{index + 1}</span>
              <span className={styles.selectorTitle}>{item.label}</span>
              <ArrowUpRight className={styles.selectorArrow} aria-hidden="true" size={18} />
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.foot}>
        <p className={styles.description} aria-live="off">
          {metric.description}
        </p>
        <p className={styles.disclaimer}>
          Times shown are indicative, not guaranteed. Clinical suitability and next steps depend on individual review.
        </p>
      </div>
    </section>
  );
}
