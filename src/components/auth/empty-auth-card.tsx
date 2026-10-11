import styles from "./empty-auth-card.module.css";

/**
 * Visual shell for the client-led authentication redesign.
 * Intentionally blank until each UI element is approved.
 * The previous AuthForm and AuthShell are preserved for later reuse.
 */
export function EmptyAuthCard() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Authentication design card" />
    </main>
  );
}
