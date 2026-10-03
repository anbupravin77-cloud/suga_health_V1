import Link from "next/link";
import { ArrowRight, Activity, Sprout, HeartPulse } from "lucide-react";
import styles from "./page.module.css";

const treatments = [
  { href: "/weight-loss", label: "Medical weight loss", Icon: Activity },
  { href: "/hair-growth", label: "Hair growth", Icon: Sprout },
  { href: "/sexual-health", label: "Sexual health", Icon: HeartPulse },
];

export default function HeroTestPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.photo} aria-hidden="true" />
        <div className={styles.wash} aria-hidden="true" />

        <nav className={styles.nav} aria-label="Test landing navigation">
          <Link href="/hero-test" className={styles.brand} aria-label="Suga.Health test home">
            <strong>SUGA.HEALTH</strong>
            <span>live naturally</span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/about">About</Link>
            <Link href="/weight-loss">Weight Loss</Link>
            <Link href="/hair-growth">Hair Growth</Link>
            <Link href="/sexual-health">Sexual Health</Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/sign-in" className={styles.login}>Login</Link>
            <Link href="/sign-up" className={styles.navCta}>
              Start consultation <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </nav>

        <div className={styles.content}>
          <h1>
            <span>Clinically</span>
            <span>proven,</span>
            <span className={styles.accent}>FDA (USA)</span>
            <span>approved,</span>
            <span>treatment</span>
            <span>prescribed by experts.</span>
          </h1>

          <div className={styles.treatments}>
            {treatments.map(({ href, label, Icon }) => (
              <Link href={href} className={styles.treatment} key={href}>
                <span className={styles.icon}><Icon size={22} strokeWidth={1.65} /></span>
                <span>{label}</span>
                <ArrowRight className={styles.treatmentArrow} size={19} strokeWidth={1.7} />
              </Link>
            ))}
          </div>

          <Link href="/sign-up" className={styles.primaryCta}>
            <span>Start consultation</span>
            <ArrowRight size={25} strokeWidth={1.6} />
          </Link>
        </div>
      </section>
    </main>
  );
}
