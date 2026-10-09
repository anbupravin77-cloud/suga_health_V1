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
  const [counted, setCounted] = useState({ index: 0, value: 5 });
  const [entered, setEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [compact, setCompact] = useState(false);
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

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Timeout, not interval: every metric gets a full reading window and a
  // manual selection resets the clock. Hover, touch and focus always win.
  useEffect(() => {
    if (!inView || !pageVisible || reducedMotion || compact || hoverPaused || focusPaused || touchPaused) return;

    const timer = window.setTimeout(() => {
      setPrevious(selected);
      setSelected((selected + 1) % metrics.length);
    }, 4700);
    return () => window.clearTimeout(timer);
  }, [inView, pageVisible, reducedMotion, compact, hoverPaused, focusPaused, touchPaused, selected]);

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

  // Count the numeric portion from zero to the new target while the existing
  // split-flap transition plays. Keep "<" and "%" untouched, and cancel stale
  // frames whenever hover, tap, or autoplay changes the selected metric.
  useEffect(() => {
    if (!entered || !inView || !pageVisible || reducedMotion) return;

    const target = Number(metrics[selected].figure.match(/\d+/)?.[0] ?? 0);
    let frame = 0;
    let startTime: number | null = null;
    let lastPaint = 0;
    const duration = compact ? 680 : 1150;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      // ~30 Hz on phones: fewer React renders while remaining visually smooth.
      if (!compact || now - lastPaint >= 30 || progress >= 1) {
        lastPaint = now;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounted({ index: selected, value: Math.round(target * eased) });
      }
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [selected, entered, inView, pageVisible, reducedMotion, compact]);

  function chooseMetric(index: number) {
    if (index === selected) return;
    setPrevious(selected);
    setSelected(index);
  }

  const metric = metrics[selected];
  const currentValue = counted.index === selected ? counted.value : 0;
  const animatedFigure = reducedMotion || !entered || !inView || !pageVisible
    ? metric.figure
    : metric.figure.replace(/\d+/, String(currentValue));

  return (
    <section ref={sectionRef} className={styles.root} aria-labelledby="living-metrics-title">
      <div className={styles.heading}>
        <h2 id="living-metrics-title">The Standards Behind Your Care.</h2>
        <p>Three things to know before you begin.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.stage} aria-live="off">
          <span className={styles.index}>{metric.index}</span>
          <div className={styles.counterWindow} role="img" aria-label={`${metric.figure} ${metric.unit.toLowerCase()} — ${metric.label}`}>
            {previous !== null && (
              <span key={`exit-${previous}-${selected}`} className={styles.figureOutgoing} aria-hidden="true">
                {metrics[previous].figure}
              </span>
            )}
            <span key={`enter-${selected}`} className={`${styles.figure} ${entered ? styles.figureEntering : ""}`} aria-hidden="true">
              {animatedFigure}
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
