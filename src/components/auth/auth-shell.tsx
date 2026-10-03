import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="auth-surface">
      <div className="auth-studio-shape auth-studio-shape-one" aria-hidden="true" />
      <div className="auth-studio-shape auth-studio-shape-two" aria-hidden="true" />

      <section className="auth-card-premium">
        <div className="auth-brand-lockup">
          <Link href="/" className="auth-brand-link" aria-label="Suga.Health home">
            <span className="auth-brand-name font-sans">
              SUGA<span className="auth-brand-dot">.</span>HEALTH
            </span>
            <span className="brand-tagline auth-brand-tagline">live naturally</span>
          </Link>
        </div>

        {children}

        <div className="auth-home-link">
          <Link href="/">← <span>Back to Home</span></Link>
        </div>
      </section>
    </main>
  );
}
