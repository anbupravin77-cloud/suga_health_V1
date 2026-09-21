import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, LockKeyhole, Menu, MessageSquareText, ShieldCheck, Stethoscope } from "lucide-react";

const pathways = [
  { index: "01", title: "Everyday health", body: "Share new or ongoing symptoms through one structured, private consultation." },
  { index: "02", title: "Ongoing wellbeing", body: "Get thoughtful guidance for health concerns that deserve a clinician’s attention." },
  { index: "03", title: "Sensitive concerns", body: "Ask personal health questions with privacy, clarity, and respect built in." },
];

const steps = [
  ["01", "Tell us what’s wrong", "Describe your concern, symptoms, and useful medical context."],
  ["02", "A doctor reviews it", "A verified clinician claims your case and reviews what you shared."],
  ["03", "Talk in one private place", "Ask questions and receive updates without losing the clinical context."],
  ["04", "Receive your treatment plan", "See clear doctor-written guidance and a prescription when appropriate."],
];

const faqs = [
  ["Is Suga.Health an AI doctor?", "No. Real doctors make every clinical decision. Technology simply keeps consultation, communication, and follow-up organized."],
  ["Who can see my consultation?", "Your consultation is available only to you and the doctor responsible for your care. Access is protected at the database level."],
  ["What happens after I submit?", "Your consultation enters the doctor queue. You can see when a doctor begins reviewing it and when your treatment plan is ready."],
  ["Does every consultation include a prescription?", "No. A doctor decides what is clinically appropriate. A prescription is provided only when the reviewing clinician determines it is suitable."],
];

export default function HomePage() {
  return <main className="marketing-page">
    <div className="trust-ticker"><span>REAL DOCTORS</span><i /> <span>PRIVATE CONSULTATIONS</span><i /> <span>CLEAR FOLLOW-UP</span></div>
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Suga.Health home">Suga.Health</Link>
      <nav className="desktop-nav" aria-label="Main navigation"><Link href="#care">Care</Link><Link href="#how-it-works">How it works</Link><Link href="#why-suga">Why Suga</Link><Link href="#questions">Questions</Link></nav>
      <div className="header-actions"><Link className="header-sign-in" href="/sign-in">Sign in</Link><Link className="button button-primary" href="/sign-up">Start consultation</Link></div>
      <details className="mobile-menu"><summary aria-label="Open navigation"><Menu /></summary><nav aria-label="Mobile navigation"><Link href="#care">Care</Link><Link href="#how-it-works">How it works</Link><Link href="#why-suga">Why Suga</Link><Link href="#questions">Questions</Link><Link href="/sign-in">Sign in</Link><Link className="button button-light" href="/sign-up">Start consultation</Link></nav></details>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><span className="eyebrow">Healthcare that listens first</span><h1 id="hero-title">Care, without the runaround.</h1><p>Tell us what’s going on. A real doctor reviews your consultation, talks with you privately, and guides the next step.</p><div className="hero-actions"><Link className="button button-primary hero-primary" href="/sign-up">Start consultation <ArrowRight /></Link><Link className="hero-sign-in" href="#how-it-works">See how it works <ArrowDown /></Link></div><p className="hero-proof"><ShieldCheck /> Doctor-led care <span>·</span> Private by design</p></div>
      <div className="hero-image"><Image src="/images/doctor-consultation.png" alt="A doctor listening attentively during a consultation" fill priority sizes="(max-width: 900px) 100vw, 52vw" /><div className="image-caption"><span>01</span><p>Thoughtful care begins with a real conversation.</p></div></div>
    </section>

    <section className="pathways" id="care"><div className="section-kicker"><span>Care pathways</span><p>Start with the concern—not a complicated menu.</p></div><div className="pathway-grid">{pathways.map((pathway) => <article key={pathway.index}><span>{pathway.index}</span><h2>{pathway.title}</h2><p>{pathway.body}</p><Link href="/sign-up" aria-label={`Start a consultation for ${pathway.title}`}><ArrowRight /></Link></article>)}</div></section>

    <section className="editorial-statement" id="why-suga"><div><span className="eyebrow light">What we believe</span><h2>The technology stays in the background. Your doctor stays at the center.</h2></div><div className="statement-points"><p><Stethoscope /> Medical decisions are made by clinicians.</p><p><LockKeyhole /> Your consultation stays private and protected.</p><p><MessageSquareText /> Every conversation remains connected to your care.</p></div></section>

    <section className="how" id="how-it-works"><div className="section-intro"><div><span className="eyebrow">From concern to clear next step</span><h2>Simple to begin.<br />Structured for care.</h2></div><p>No waiting-room maze. No disconnected messages. One visible consultation journey from start to completion.</p></div><div className="steps">{steps.map(([number, title, body]) => <article className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{body}</p></div><Check /></article>)}</div></section>

    <section className="comparison"><div className="comparison-title"><span className="eyebrow">A better care experience</span><h2>Less uncertainty.<br />More clarity.</h2></div><div className="comparison-columns"><article><span>THE USUAL FRICTION</span><p>Explaining the same concern repeatedly</p><p>Unclear status after reaching out</p><p>Instructions scattered across channels</p></article><article className="suga-column"><span>WITH SUGA.HEALTH</span><p><Check /> One structured consultation</p><p><Check /> A status you can follow</p><p><Check /> Treatment and messages together</p></article></div></section>

    <section className="doctor-story"><div className="doctor-story-image"><Image src="/images/doctor-consultation.png" alt="Doctor reviewing a patient consultation" fill sizes="(max-width: 900px) 100vw, 46vw" /></div><div className="doctor-story-copy"><span className="eyebrow">Real clinician review</span><h2>Good care is not an algorithm.</h2><p>Your doctor sees the context you shared, asks questions when needed, records private clinical notes, and decides the appropriate treatment.</p><ul><li>Verified doctor workspace</li><li>Clear patient-facing guidance</li><li>Prescriptions only when clinically appropriate</li></ul><Link className="button button-primary" href="/sign-up">Begin privately <ArrowRight /></Link></div></section>

    <section className="faq" id="questions"><div><span className="eyebrow">Before you begin</span><h2>Questions, answered clearly.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className="final-cta"><span className="eyebrow light">Your next step</span><h2>When something feels off,<br />start with a conversation.</h2><p>Share what’s going on in a private consultation reviewed by a real doctor.</p><Link className="button button-light" href="/sign-up">Start consultation <ArrowRight /></Link></section>

    <footer className="site-footer"><div className="footer-main"><div><Link className="wordmark" href="/">Suga.Health</Link><p>Real doctors. Thoughtful care.</p></div><nav aria-label="Footer navigation"><Link href="#care">Care</Link><Link href="#how-it-works">How it works</Link><Link href="#questions">Questions</Link><Link href="/sign-in">Sign in</Link></nav></div><div className="footer-meta"><p>For emergencies, contact local emergency services.</p><p>© {new Date().getFullYear()} Suga.Health · Privacy · Terms</p></div></footer>
  </main>;
}
