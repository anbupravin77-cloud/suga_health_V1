"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import styles from "./doctor-spotlight.module.css";

type DoctorPreview = {
  id: string;
  name: string;
  credentials: string;
  role: string;
  specialty: string;
};

type DoctorSpotlightProps = {
  doctors: readonly DoctorPreview[];
  onViewProfile: (doctorId: string) => void;
};

const offsets = [-3, -2, -1, 0, 1, 2, 3] as const;
const positions = [
  styles.offscreenLeft,
  styles.farLeft,
  styles.nearLeft,
  styles.center,
  styles.nearRight,
  styles.farRight,
  styles.offscreenRight,
];

function indexFor(value: number, count: number) {
  return ((value % count) + count) % count;
}

export function DoctorSpotlight({ doctors, onViewProfile }: DoctorSpotlightProps) {
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const hoverResumeRef = useRef<number | null>(null);
  const touchResumeRef = useRef<number | null>(null);
  const pointerStartRef = useRef<number | null>(null);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => setReducedMotion(query.matches);
    const handleVisibility = () => setPageVisible(!document.hidden);
    handleMotion();
    handleVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= .24),
      { threshold: [0, .24, .45] },
    );
    observer.observe(node);
    query.addEventListener("change", handleMotion);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      query.removeEventListener("change", handleMotion);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => () => {
    if (hoverResumeRef.current !== null) window.clearTimeout(hoverResumeRef.current);
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
  }, []);

  useEffect(() => {
    if (doctors.length < 2 || !inView || !pageVisible || reducedMotion ||
      hoverPaused || focusPaused || touchPaused) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 4500);
    return () => window.clearTimeout(timer);
  }, [doctors.length, inView, pageVisible, reducedMotion,
    hoverPaused, focusPaused, touchPaused, step]);

  function pauseForPointer() {
    if (hoverResumeRef.current !== null) window.clearTimeout(hoverResumeRef.current);
    hoverResumeRef.current = null;
    setHoverPaused(true);
  }

  function resumeAfterPointer() {
    if (hoverResumeRef.current !== null) window.clearTimeout(hoverResumeRef.current);
    hoverResumeRef.current = window.setTimeout(() => {
      hoverResumeRef.current = null;
      setHoverPaused(false);
    }, 1100);
  }

  function holdForTouch() {
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
    setTouchPaused(true);
    touchResumeRef.current = window.setTimeout(() => {
      touchResumeRef.current = null;
      setTouchPaused(false);
    }, 8500);
  }

  function chooseSlot(slot: number, doctorId: string) {
    holdForTouch();
    if (slot === 0) {
      onViewProfile(doctorId);
      return;
    }
    setStep((current) => current + slot);
  }

  if (!doctors.length) return null;
  const featured = doctors[indexFor(step, doctors.length)];

  return (
    <div className={styles.root}>
      <div
        ref={railRef}
        className={styles.rail}
        aria-label="Featured clinicians carousel"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") pauseForPointer();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") resumeAfterPointer();
        }}
        onFocusCapture={(event) => {
          if ((event.target as HTMLElement).matches(":focus-visible")) setFocusPaused(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
        }}
        onTouchStart={(event) => {
          pointerStartRef.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (pointerStartRef.current === null) return;
          const diff = (event.changedTouches[0]?.clientX ?? pointerStartRef.current) - pointerStartRef.current;
          pointerStartRef.current = null;
          if (Math.abs(diff) < 45) return;
          holdForTouch();
          setStep((current) => current + (diff < 0 ? 1 : -1));
        }}
      >
        <div className={styles.glow} aria-hidden="true" />
        {offsets.map((offset, index) => {
          const logicalIndex = step + offset;
          const doctor = doctors[indexFor(logicalIndex, doctors.length)];
          const isCenter = offset === 0;
          const offscreen = Math.abs(offset) === 3;

          return (
            <button
              key={logicalIndex}
              type="button"
              className={`${styles.card} ${positions[index]} ${isCenter ? styles.isCenter : ""}`}
              style={{ ["--portrait-color" as string]: ["#c3c8c5", "#afb9bf", "#c4bebb", "#b6c1b5"][indexFor(logicalIndex, doctors.length)] }}
              tabIndex={offscreen ? -1 : 0}
              aria-hidden={offscreen ? true : undefined}
              aria-label={isCenter ? `View credentials for ${doctor.name}` : `Feature ${doctor.name}`}
              onClick={() => chooseSlot(offset, doctor.id)}
            >
              <span className={styles.portrait} aria-hidden="true">
                <span className={styles.portraitLabel}>PORTRAIT PLACEHOLDER</span>
              </span>
              <span className={styles.cardShade} aria-hidden="true" />
              <span className={styles.cardContents}>
                <span className={styles.cardRole}>{doctor.role}</span>
                <span className={styles.cardName}>{doctor.name}</span>
                <span className={styles.cardCredentials}>{doctor.credentials}</span>
              </span>
              {isCenter && (
                <span className={styles.centerArrow} aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.underRail}>
        <div className={styles.featuredCopy} aria-live="off">
          <span className={styles.featuredKicker}>FEATURED CLINICIAN</span>
          <h3>{featured.name}, {featured.credentials}</h3>
          <p>{featured.specialty}</p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous clinician"
            onClick={() => { holdForTouch(); setStep((current) => current - 1); }}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next clinician"
            onClick={() => { holdForTouch(); setStep((current) => current + 1); }}
          >
            <ArrowRight size={19} />
          </button>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => onViewProfile(featured.id)}
          >
            View credentials <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
      <p className={styles.note}>
        Portraits are placeholders. Clinician identities and credentials must be verified before publication.
      </p>
    </div>
  );
}
