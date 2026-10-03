import Link from "next/link";
import { ArrowRight, Activity, Sparkles, ShieldCheck } from "lucide-react";
import "./landing-test.css";

export const metadata = {
  title: "Suga.Health — Landing concept",
  description: "Experimental Suga.Health landing page concept.",
};

export default function LandingTestPage() {
  return (
    <main className="suga-concept">
      <div className="suga-concept__wash" aria-hidden="true" />
      <header className="suga-concept__nav">
        <Link href="/" className="suga-concept__brand" aria-label="Suga.Health home">
          <span>SUGA.HEALTH</span>
          <small>live naturally</small>
        </Link>

        <nav className="suga-concept__links" aria-label="Primary navigation">
          <Link href="/about">About</Link>
          <Link href="/weight-loss">Weight Loss</Link>
          <Link href="/hair-growth">Hair Growth</Link>
          <Link href="/sexual-health">Sexual Health</Link>
        </nav>

        <div className="suga-concept__navActions">
          <Link href="/login" className="suga-concept__login">Login</Link>
          <Link href="/patient/consultations/new" className="suga-concept__navCta">
            Start consultation <ArrowRight size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <section className="suga-concept__hero">
        <div className="suga-concept__copy">
          <h1>
            <span>Clinically</span>
            <span>proven,</span>
            <span className="suga-concept__accent">FDA (USA)</span>
            <span>approved,</span>
            <span>treatment</span>
            <span>prescribed by experts.</span>
          </h1>

          <div className="suga-concept__treatments">
            <Link href="/weight-loss" className="suga-concept__glassPill">
              <span className="suga-concept__pillIcon"><Activity size={21} strokeWidth={1.8} /></span>
              <span>Medical weight loss</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
            <Link href="/hair-growth" className="suga-concept__glassPill">
              <span className="suga-concept__pillIcon"><Sparkles size={20} strokeWidth={1.8} /></span>
              <span>Hair growth</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
            <Link href="/sexual-health" className="suga-concept__glassPill">
              <span className="suga-concept__pillIcon"><ShieldCheck size={20} strokeWidth={1.8} /></span>
              <span>Sexual health</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
          </div>

          <Link href="/patient/consultations/new" className="suga-concept__mainCta">
            <span>Start consultation</span>
            <ArrowRight size={25} strokeWidth={1.7} />
          </Link>
        </div>

        <div className="suga-concept__doctor" aria-hidden="true">
          <img src="/images/doctor-consultation.png" alt="" />
        </div>
      </section>
    </main>
  );
}
