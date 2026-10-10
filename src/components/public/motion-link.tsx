"use client";

import Link from "next/link";
import type { ComponentProps, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./motion-link.module.css";

type MotionVariant = "liquid" | "morph" | "radar" | "particle" | "magnetic";
type MotionLinkProps = Omit<ComponentProps<typeof Link>, "children" | "className"> & {
  variant: MotionVariant;
  tone?: "dark" | "light";
  alternateLabel?: string;
  className?: string;
  children: ReactNode;
};

// Pure presentation wrapper. Navigation remains a real Next.js Link,
// so keyboard behavior, routing, and existing return-position callbacks survive.
export function MotionLink({
  variant,
  tone = "dark",
  alternateLabel,
  className = "",
  children,
  onPointerMove,
  onPointerLeave,
  ...linkProps
}: MotionLinkProps) {
  const move = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (
      variant === "magnetic" &&
      event.pointerType === "mouse" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 13;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 9;
      event.currentTarget.style.setProperty("--mag-x", `${Math.max(-7, Math.min(7, x)).toFixed(2)}px`);
      event.currentTarget.style.setProperty("--mag-y", `${Math.max(-5, Math.min(5, y)).toFixed(2)}px`);
    }
    onPointerMove?.(event);
  };

  const leave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.removeProperty("--mag-x");
    event.currentTarget.style.removeProperty("--mag-y");
    onPointerLeave?.(event);
  };

  return (
    <Link
      {...linkProps}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`${className} ${styles.motion} ${styles[variant]} ${styles[tone]}`}
    >
      {variant === "liquid" && <span className={styles.orbit} aria-hidden="true" />}
      <span className={styles.surface} aria-hidden="true">
        {variant === "liquid" && <span className={styles.liquidFill} />}
      </span>
      {variant === "radar" && (
        <span className={styles.rings} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.ring} />
        </span>
      )}
      {variant === "particle" && (
        <span className={styles.particles} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <span key={index} className={styles.particleDot} />)}
        </span>
      )}
      {variant === "morph" ? (
        <span className={styles.swapWindow}>
          <span className={styles.swapTrack}>
            <span className={styles.swapText}>{children}</span>
            <span className={styles.swapText} aria-hidden="true">{alternateLabel ?? children}</span>
          </span>
        </span>
      ) : (
        <span className={styles.label}>{children}</span>
      )}
      <span className={styles.icon} aria-hidden="true"><ArrowRight size={16} strokeWidth={1.8}/></span>
    </Link>
  );
}
