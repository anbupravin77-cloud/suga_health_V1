import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell us what’s going on",
    body: "Share your symptoms and concerns in a private, structured consultation.",
    icon: FileText,
  },
  {
    number: "02",
    title: "A doctor reviews your consultation",
    body: "A real clinician carefully reviews the information you provide.",
    icon: Stethoscope,
  },
  {
    number: "03",
    title: "Communicate securely",
    body: "Continue the conversation in one private place.",
    icon: MessageSquareText,
  },
  {
    number: "04",
    title: "Receive your treatment plan",
    body: "Get clear guidance and a prescription when clinically appropriate.",
    icon: FileText,
  },
];

const faqs = [
  {
    question: "Who reviews my consultation?",
    answer:
      "A qualified doctor reviews the health information you submit and decides the appropriate next step.",
  },
  {
    question: "Is my consultation private?",
    answer:
      "Your consultation is kept within your private patient space and is available only to you and the clinicians involved in your care.",
  },
  {
    question: "What happens after I submit?",
    answer:
      "Your consultation enters the doctor workflow. You can follow its status, communicate securely, and view your treatment guidance when the review is complete.",
  },
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Suga.Health home">
          Suga.Health
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="#how-it-works">How it works</Link>
          <Link href="#why-suga">Why Suga.Health</Link>
          <Link href="#trust">Trust &amp; safety</Link>
        </nav>

        <div className="header-actions">
          <Link className="header-sign-in" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button-primary" href="/sign-up">
            Start consultation
          </Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <Menu aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#why-suga">Why Suga.Health</Link>
            <Link href="#trust">Trust &amp; safety</Link>
            <Link href="/sign-in">Sign in</Link>
            <Link className="button button-primary" href="/sign-up">
              Start consultation
            </Link>
          </nav>
        </details>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Care that begins with listening.</h1>
          <p>
            Tell us what’s going on. A real doctor reviews your consultation and
            guides the next step.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary hero-primary" href="/sign-up">
              Start consultation <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="hero-sign-in" href="/sign-in">
              Sign in
            </Link>
          </div>
          <p className="hero-proof">
            <LockKeyhole aria-hidden="true" />
            Private by design <span aria-hidden="true">·</span> Doctor-led care
          </p>
        </div>

        <div className="hero-image">
          <Image
            src="/images/doctor-consultation.png"
            alt="A doctor listening attentively during a consultation"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
          />
        </div>
      </section>

      <section className="how" id="how-it-works" aria-labelledby="how-title">
        <div className="section-intro">
          <h2 id="how-title">Healthcare, made easier to begin.</h2>
          <p>A clear path from your first concern to a doctor-guided next step.</p>
        </div>

        <div className="steps">
          {steps.map(({ number, title, body, icon: Icon }) => (
            <article className="step" key={number}>
              <div className="step-rail" aria-hidden="true">
                <span>{number}</span>
              </div>
              <div className="step-icon" aria-hidden="true">
                <Icon />
              </div>
              <div className="step-copy">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="care-principle" id="why-suga" aria-labelledby="care-title">
        <div className="care-principle-copy">
          <h2 id="care-title">Real care. Clear next steps.</h2>
          <p>
            Technology keeps the process simple. Medical decisions stay with
            qualified doctors.
          </p>
        </div>
        <div className="care-principles" id="trust">
          <div>
            <LockKeyhole aria-hidden="true" />
            <span>Private consultation</span>
          </div>
          <div>
            <UserRoundCheck aria-hidden="true" />
            <span>Doctor-led decisions</span>
          </div>
          <div>
            <FileText aria-hidden="true" />
            <span>Clear treatment guidance</span>
          </div>
        </div>
        <Link className="button button-primary care-cta" href="/sign-up">
          Start consultation <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="faq" id="trust" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions before you begin.</h2>
        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title">Ready to take the next step?</h2>
          <p>Begin a private consultation and tell us what’s going on.</p>
        </div>
        <Link className="button final-cta-button" href="/sign-up">
          Start consultation <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Link className="wordmark" href="/">
            Suga.Health
          </Link>
          <nav aria-label="Footer navigation">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#trust">Trust &amp; safety</Link>
            <Link href="/sign-in">Sign in</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </nav>
        </div>
        <div className="footer-meta">
          <p>Real doctors. Thoughtful care.</p>
          <p>© {new Date().getFullYear()} Suga.Health</p>
        </div>
      </footer>
    </main>
  );
}
