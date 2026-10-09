"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
const additionalProfiles: DoctorPreview[] = [
  {
    id: "care-team-profile-placeholder",
    name: "More profiles soon",
    credentials: "",
    role: "CARE TEAM",
    specialty: "Additional clinician profiles will appear here once verified.",
  },
  {
    id: "care-team-second-placeholder",
    name: "Meet the care team",
    credentials: "",
    role: "PROFILE PENDING",
    specialty: "A verified clinician profile will be added here.",
  },
];

// Five visible slots with two offscreen buffers each side.
// Three repeated copies provide a physical wrap with no last-to-first jump.
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
  const cards = [...doctors, ...additionalProfiles];
  const count = cards.length;
  const [position, setPosition] = useState(count);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const moveDoneRef = useRef<number | null>(null);
  const resetFrameRef = useRef<number | null>(null);
  const restoreFrameRef = useRef<number | null>(null);
  const movingRef = useRef(false);
  const positionRef = useRef(count);
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
    if (moveDoneRef.current !== null) window.clearTimeout(moveDoneRef.current);
    if (resetFrameRef.current !== null) window.cancelAnimationFrame(resetFrameRef.current);
    if (restoreFrameRef.current !== null) window.cancelAnimationFrame(restoreFrameRef.current);
  }, []);

  // Each stable, keyed card animates its transform to the next physical slot.
  // Transition completion (rather than a guessed 980ms state switch) controls
  // the featured copy and the invisible rebase between identical cloned sets.
  const finishMove = useCallback(() => {
    if (!movingRef.current) return;
    if (moveDoneRef.current !== null) {
      window.clearTimeout(moveDoneRef.current);
      moveDoneRef.current = null;
    }

    const current = positionRef.current;
    setDisplayedIndex(indexFor(current, count));
    const rewind = current >= 2 * count ? count
      : current < count ? 2 * count - 1 : null;

    if (rewind === null) {
      movingRef.current = false;
      setIsMoving(false);
      return;
    }

    // Cloned cards at these two positions have identical screen coordinates.
    // Suppress transitions ONLY while rebasing, between painted frames.
    setIsResetting(true);
    positionRef.current = rewind;
    setPosition(rewind);
    resetFrameRef.current = window.requestAnimationFrame(() => {
      resetFrameRef.current = null;
      restoreFrameRef.current = window.requestAnimationFrame(() => {
        setIsResetting(false);
        setIsMoving(false);
        movingRef.current = false;
        restoreFrameRef.current = null;
      });
    });
  }, [count]);

  const advance = useCallback((direction: -1 | 1) => {
    if (movingRef.current || count < 2) return;
    movingRef.current = true;
    setIsMoving(true);
    const next = positionRef.current + direction;
    positionRef.current = next;
    setPosition(next);

    // A safety fallback for hidden tabs or interrupted CSS transitions.
    // Normal movement completes on the incoming center card's transitionend.
    moveDoneRef.current = window.setTimeout(finishMove, reducedMotion ? 0 : 1250);
  }, [count, finishMove, reducedMotion]);

  // An ordinary one-card move every 4.6 seconds. Hover, focus, touch, hidden
  // sections, inactive tabs and the modal suspend automatic navigation.
  useEffect(() => {
    if (doctors.length < 2 || paused || !inView || !pageVisible || reducedMotion ||
      hoverPaused || focusPaused || touchPaused) return;
    const timer = window.setTimeout(() => advance(1), 4600);
    return () => window.clearTimeout(timer);
  }, [doctors.length, paused, inView, pageVisible, reducedMotion,
    hoverPaused, focusPaused, touchPaused, position, advance]);

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
      advance(slot < 0 ? -1 : 1);
    } else if (additionalProfiles.some((profile) => profile.id === doctorId)) {
      advance(1);
    } else {
      onViewProfile(doctorId);
    }
  }

  if (!doctors.length) return null;
  const featured = cards[indexFor(displayedIndex, count)];
  const placeholderFeatured = additionalProfiles.some((profile) => profile.id === featured.id);

  return (
    <div className={styles.root}>
      <div
        ref={railRef}
        className={`${styles.rail} ${isMoving ? styles.isMoving : ""} ${isResetting ? styles.isResetting : ""}`}
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
          advance(diff < 0 ? 1 : -1);
        }}
      >
        <div className={styles.glow} aria-hidden="true" />
        {Array.from({ length: count * 3 }, (_, absoluteIndex) => {
          const offset = absoluteIndex - position;
          const doctor = cards[indexFor(absoluteIndex, count)];
          const isPlaceholder = additionalProfiles.some((profile) => profile.id === doctor.id);
          const isCenter = offset === 0;
          const offscreen = Math.abs(offset) >= 3;
          const positionClass = positions[Math.max(0, Math.min(8, offset + 4))];

          return (
            <button
              key={absoluteIndex}
              type="button"
              className={`${styles.card} ${positionClass} ${isCenter ? styles.isCenter : ""} ${isPlaceholder ? styles.placeholderCard : ""}`}
              style={{ ["--portrait-color" as string]: ["#c3c8c5", "#afb9bf", "#c4bebb", "#b6c1b5", "#919da0"][indexFor(absoluteIndex, count)] }}
              tabIndex={offscreen ? -1 : 0}
              aria-hidden={offscreen ? true : undefined}
              aria-label={isCenter ? (isPlaceholder ? "Continue to the next clinician" : `View credentials for ${doctor.name}`) : `Feature ${doctor.name}`}
              onTransitionEnd={(event) => {
                if (event.target === event.currentTarget && event.propertyName === "transform" && isCenter && !isResetting) {
                  finishMove();
                }
              }}
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
            onClick={() => { holdForTouch(); advance(-1); }}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next clinician"
            onClick={() => { holdForTouch(); advance(1); }}
          >
            <ArrowRight size={19} />
          </button>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => {
              holdForTouch();
              if (placeholderFeatured) {
                advance(1);
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
