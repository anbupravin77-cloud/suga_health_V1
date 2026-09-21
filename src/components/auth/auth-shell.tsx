import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Suga.Health">
        <Link className="wordmark" href="/">Suga.Health</Link>
        <div>
          <h2>Thoughtful care for a healthier you.</h2>
          <p>Real clinicians. Private conversations. Clear next steps.</p>
        </div>
        <p className="auth-story-foot">PEOPLE / CARE / PROGRESS</p>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Link className="auth-mobile-brand" href="/">Suga.Health</Link>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
