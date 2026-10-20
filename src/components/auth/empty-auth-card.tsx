import type { ReactNode } from "react";
import styles from "./empty-auth-card.module.css";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Visual shell for the client-led authentication redesign.
 * Intentionally blank until each UI element is approved.
 * The previous AuthForm and AuthShell are preserved for later reuse.
 */
export function EmptyAuthCard({ heading, children }: { heading?: string; children?: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Authentication design card">
        <div className={styles.logo}>
          <BrandLogo size="card" priority />
        </div>
        {heading && <h1 className={styles.heading}>{heading}</h1>}
        {children}
      </section>
    </main>
  );
}
