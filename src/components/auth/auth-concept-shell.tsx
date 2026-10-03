import Link from "next/link";
import type { ReactNode } from "react";

export function AuthConceptShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-concept">
      <section className="auth-concept-story" aria-label="Suga.Health">
        <Link href="/" className="auth-concept-brand" aria-label="Suga.Health home">
          <span>SUGA<span>.</span>HEALTH</span>
          <small>live naturally</small>
        </Link>
        <div className="auth-concept-copy">
          <p className="auth-concept-kicker">PRIVATE CARE, WITHOUT THE WAITING ROOM</p>
          <h1>Your care.<br/><em>On your terms.</em></h1>
          <p>Secure access to your consultations, treatment plan and clinician messages, all in one calm place.</p>
        </div>
        <div className="auth-concept-trust">
          <span><i /> Secure & private</span>
          <span>Clinician-led care</span>
        </div>
      </section>
      <section className="auth-concept-panel">
        <div className="auth-concept-mobile-brand">
          <Link href="/" aria-label="Suga.Health home">SUGA<span>.</span>HEALTH</Link>
          <small>live naturally</small>
        </div>
        <div className="auth-concept-form-wrap">
          <div className="auth-concept-heading">
            <p>WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <span>Continue your care securely.</span>
          </div>
          {children}
          <p className="auth-concept-legal">By continuing, you agree to our Terms and Privacy Policy.</p>
          <Link className="auth-concept-home" href="/">← Back to home</Link>
        </div>
      </section>
    </main>
  );
}
