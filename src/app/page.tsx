import Image from "next/image";
import Link from "next/link";
import { FileText, LockKeyhole, Stethoscope, UsersRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  ["01", "Tell us what's wrong", "Share your symptoms and concerns in a private, structured consultation."],
  ["02", "A doctor reviews your consultation", "A qualified doctor carefully reviews the information you provide."],
  ["03", "Communicate securely", "Continue the conversation privately with the doctor handling your consultation."],
  ["04", "Receive your treatment plan", "Get clear guidance, instructions, and a prescription when clinically appropriate."],
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/">Suga.Health</Link>
        <nav aria-label="Main navigation"><Link href="#how-it-works">How it works</Link><Link href="#trust">Trust & safety</Link></nav>
        <div className="header-actions"><ButtonLink href="/sign-in" variant="secondary">Sign in</ButtonLink><ButtonLink href="/sign-up">Start consultation</ButtonLink></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Care that begins<br />with listening.</h1>
          <p>Connect with a real doctor through a private, structured consultation.</p>
          <div className="hero-actions"><ButtonLink href="/sign-up">Start consultation</ButtonLink><ButtonLink href="/sign-in" variant="text">Sign in →</ButtonLink></div>
          <p className="hero-proof">REAL DOCTORS. A MORE THOUGHTFUL WAY TO GET CARE.</p>
        </div>
        <div className="hero-image"><Image src="/images/doctor-consultation.png" alt="A doctor listening attentively to a patient" fill priority sizes="(max-width: 800px) 100vw, 55vw" /></div>
      </section>

      <section className="how" id="how-it-works">
        <div className="section-heading"><h2>How it works</h2><p>A simple, structured way to connect with expert care.</p></div>
        <div className="steps">{steps.map(([number, title, body]) => <article key={number}><div className="step-number"><span>{number}</span><i /></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="trust" id="trust">
        <div className="trust-image"><Image src="/images/doctor-consultation.png" alt="A private doctor consultation" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="trust-copy"><p className="section-label">TRUST & SAFETY</p><h2>Built on privacy.<br />Backed by real people.</h2><p>Your information is private and protected. It is only available to you and the clinicians involved in your care.</p><div className="trust-points"><div><LockKeyhole /><span>Private and secure</span></div><div><UsersRound /><span>Verified clinicians</span></div><div><FileText /><span>Your information stays with you</span></div></div></div>
      </section>

      <section className="final-cta"><Stethoscope aria-hidden="true" /><h2>Take the next step towards better care.</h2><p>Begin a private consultation with a real doctor.</p><ButtonLink href="/sign-up">Start consultation</ButtonLink></section>
      <footer><Link className="wordmark" href="/">Suga.Health</Link><p>Real clinicians. Thoughtful care.</p><nav><Link href="#how-it-works">How it works</Link><Link href="#trust">Trust & safety</Link><Link href="#">Privacy</Link><Link href="#">Terms</Link></nav><p>© {new Date().getFullYear()} Suga.Health</p></footer>
    </main>
  );
}
