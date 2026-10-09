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
  paused?: boolean;
};

// Five distinct positions without fabricating a fifth doctor. Replace this
// placeholder when a verified fifth clinician profile becomes available.
const additionalProfile: DoctorPreview = {
  id: "care-team-profile-placeholder",
  name: "More profiles soon",
  credentials: "",
  role: "CARE TEAM",
  specialty: "Additional clinician profiles will appear here once verified.",
};

// Keep two invisible buffers on either end. Existing logical keys stay mounted
// as they move between positions, so the sequence genuinely travels across the
// rail rather than swapping one cover for another.
const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
const positions = [
  styles.offscreenFarLeft,
  styles.offscreenLeft,
  styles.farLeft,
  styles.nearLeft,
  styles.center,
  styles.nearRight,
  styles.farRight,
  styles.offscreenRight,
  styles.offscreenFarRight,
];

function indexFor(value: number, count: number) {
  return ((value % count) + count) % count;
}

export function DoctorSpotlight({ doctors, onViewProfile, paused = false }: DoctorSpotlightProps) {
  const cards = [...doctors, additionalProfile];
  const count = cards.length;
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
  const swipeHandledRef = useRef(false);

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
    if (doctors.length < 2 || paused || !inView || !pageVisible || reducedMotion ||
      hoverPaused || focusPaused || touchPaused) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 4800);
    return () => window.clearTimeout(timer);
  }, [doctors.length, paused, inView, pageVisible, reducedMotion,
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
    if (swipeHandledRef.current) {
      swipeHandledRef.current = false;
      return;
    }
    holdForTouch();
    if (slot !== 0) {
      setStep((current) => current + slot);
    } else if (doctorId === additionalProfile.id) {
      setStep((current) => current + 1);
    } else {
      onViewProfile(doctorId);
    }
  }

  if (!doctors.length) return null;
  const featured = cards[indexFor(step, count)];
  const placeholderFeatured = featured.id === additionalProfile.id;

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
          swipeHandledRef.current = false;
          pointerStartRef.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (pointerStartRef.current === null) return;
          const diff = (event.changedTouches[0]?.clientX ?? pointerStartRef.current) - pointerStartRef.current;
          pointerStartRef.current = null;
          if (Math.abs(diff) < 45) return;
          swipeHandledRef.current = true;
          holdForTouch();
          setStep((current) => current + (diff < 0 ? 1 : -1));
        }}
      >
        <div className={styles.glow} aria-hidden="true" />
        {offsets.map((offset, index) => {
          const logicalIndex = step + offset;
          const doctor = cards[indexFor(logicalIndex, count)];
          const isPlaceholder = doctor.id === additionalProfile.id;
          const isCenter = offset === 0;
          const offscreen = Math.abs(offset) >= 3;

          return (
            <button
              key={logicalIndex}
              type="button"
              className={`${styles.card} ${positions[index]} ${isCenter ? styles.isCenter : ""} ${isPlaceholder ? styles.placeholderCard : ""}`}
              style={{ ["--portrait-color" as string]: ["#c3c8c5", "#afb9bf", "#c4bebb", "#b6c1b5", "#919da0"][indexFor(logicalIndex, count)] }}
              tabIndex={offscreen ? -1 : 0}
              aria-hidden={offscreen ? true : undefined}
              aria-label={isCenter ? (isPlaceholder ? "Continue to the next clinician" : `View credentials for ${doctor.name}`) : `Feature ${doctor.name}`}
              onClick={() => chooseSlot(offset, doctor.id)}
            >
              <span className={styles.portrait} aria-hidden="true">
                <span className={styles.portraitLabel}>{isPlaceholder ? "ADDITIONAL PROFILE / PENDING VERIFICATION" : "PORTRAIT PLACEHOLDER"}</span>
              </span>
              <span className={styles.cardShade} aria-hidden="true" />
              <span className={styles.cardContents}>
                <span className={styles.cardRole}>{doctor.role}</span>
                <span className={styles.cardName}>{doctor.name}</span>
                {doctor.credentials && <span className={styles.cardCredentials}>{doctor.credentials}</span>}
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
          <h3>{featured.name}{featured.credentials ? `, ${featured.credentials}` : ""}</h3>
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
            onClick={() => {
              holdForTouch();
              if (placeholderFeatured) {
                setStep((current) => current + 1);
              } else {
                onViewProfile(featured.id);
              }
            }}
          >
            {placeholderFeatured ? "Next clinician" : "View credentials"} <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
      <p className={styles.note}>
        Portraits are placeholders. Clinician identities and credentials must be verified before publication.
      </p>
    </div>
  );
}
