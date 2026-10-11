import type { ReactNode } from "react";
import styles from "./empty-auth-card.module.css";

/**
 * Visual shell for the client-led authentication redesign.
 * Intentionally blank until each UI element is approved.
 * The previous AuthForm and AuthShell are preserved for later reuse.
 */
export function EmptyAuthCard({ heading, children }: { heading?: string; children?: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Authentication design card">
        <div className={styles.logo} role="img" aria-label="Suga.Health, live naturally">
          <span className={styles.wordmark} aria-hidden="true">
            SUGA<span className={styles.dot}>.</span>HEALTH
          </span>
          <span className={styles.tagline} aria-hidden="true">live naturally</span>
        </div>
        {heading && <h1 className={styles.heading}>{heading}</h1>}
        {children}
      </section>
    </main>
  );
}
