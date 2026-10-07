"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Menu,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { rememberReturnPosition, useRestoreReturnPosition } from "@/components/public/return-position";
import { MobilePublicMenu } from "@/components/public/mobile-public-menu";

const navLinks = [
  { name: "About", path: "/about" },
  { name: "Weight Loss", path: "/weight-loss" },
  { name: "Hair Growth", path: "/hair-growth" },
  { name: "Sexual Health", path: "/sexual-health" },
];

const careAreas = [
  {
    id: "weight",
    title: "Medical weight loss that starts with your health history.",
    copy: "A clinician reviews your weight history, medications, health risks and goals before deciding whether GLP-1 treatment is appropriate.",
    points: [
      "GLP-1 options when clinically appropriate",
      "Dose decisions based on your response",
      "Follow-up stays connected to your consultation",
    ],
    path: "/weight-loss",
  },
  {
    id: "hair",
    title: "Treat the causes behind ongoing hair loss.",
    copy: "Prescription options can include finasteride or minoxidil after a clinician reviews your pattern of hair loss, health history and treatment goals.",
    points: [
      "Oral and topical treatment options",
      "Your history is reviewed before prescribing",
      "Progress and side effects can be discussed in follow-up",
    ],
    path: "/hair-growth",
  },
  {
    id: "sexual",
    title: "Private care for sexual health concerns.",
    copy: "A clinician reviews symptoms, medications and relevant health factors before recommending treatment for concerns such as erectile dysfunction.",
    points: [
      "Confidential online assessment",
      "Treatment only when clinically appropriate",
      "Questions stay attached to the same consultation",
    ],
    path: "/sexual-health",
  },
];

const howItWorks = [
  {
    title: "Share the relevant details",
    copy: "Choose your concern and answer focused questions about your health, medications and treatment goals.",
  },
  {
    title: "A clinician reviews your case",
    copy: "A licensed clinician checks treatment suitability, safety and whether more information is needed.",
  },
  {
    title: "See your next step",
    copy: "If treatment is prescribed, your plan and follow-up stay attached to the same consultation.",
  },
];

const journeys = {
  weight: [
    { title: "Consultation", copy: "Your weight history, current medicines, health risks and goals are reviewed." },
    { title: "Treatment decision", copy: "If appropriate, your clinician recommends a treatment and starting approach." },
    { title: "Follow-up", copy: "Response, tolerability and side effects guide any later changes." },
  ],
  hair: [
    { title: "Assessment", copy: "Your pattern of hair loss, medical history and previous treatments are reviewed." },
    { title: "Treatment decision", copy: "Your clinician decides whether oral, topical or combined treatment is appropriate." },
    { title: "Progress review", copy: "Follow-up focuses on adherence, side effects and how your hair is responding." },
  ],
  sexual: [
    { title: "Private assessment", copy: "Symptoms, medicines and relevant cardiovascular or health factors are reviewed." },
    { title: "Treatment decision", copy: "A clinician recommends an option only when it is suitable for your health profile." },
    { title: "Follow-up", copy: "Questions, response and any side effects can be discussed in the same care thread." },
  ],
};

const faqs = [
  {
    q: "Will I definitely receive a prescription?",
    a: "No. The consultation is an assessment. A clinician may decide treatment is not appropriate or may ask for more information before making a decision.",
  },
  {
    q: "Who reviews my consultation?",
    a: "A licensed clinician reviews the information you submit and decides what the appropriate next step should be.",
  },
  {
    q: "What happens after I submit?",
    a: "Your consultation is saved in your account and moves to clinical review. You can follow its status from your patient dashboard.",
  },
  {
    q: "Can I message my clinician?",
    a: "Messaging opens when your consultation is assigned to a clinician, keeping the conversation connected to that consultation.",
  },
  {
    q: "How is treatment selected?",
    a: "The decision is based on your concern, medical history, current medications, allergies and the clinician's medical judgment.",
  },
  {
    q: "Is Suga.Health for emergencies?",
    a: "No. For urgent or life-threatening symptoms, contact your local emergency services.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [journey, setJourney] = useState<keyof typeof journeys>("weight");
  useRestoreReturnPosition();

  return (
    <main className="suga-home-v3">
      <header className="suga-home-header">
        <Link href="/" className="suga-home-brand" aria-label="Suga.Health home">
          <strong>SUGA.HEALTH</strong>
          <span>live naturally</span>
        </Link>

        <nav className="suga-home-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>{link.name}</Link>
          ))}
        </nav>

        <div className="suga-home-header-actions">
          <Link href="/sign-in" className="suga-home-signin">Sign in</Link>
          <Link href="/sign-up" onClick={rememberReturnPosition} className="suga-home-primary">
            Start consultation <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className="suga-home-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <MobilePublicMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <section className="suga-home-hero">
        <div className="suga-home-hero-copy">
          <h1>Evidence-led treatment. Prescribed around you.</h1>
          <p>
            Private online care for weight loss, hair loss and sexual health,
            with clinician review before any prescription.
          </p>

          <div className="suga-home-hero-actions">
            <Link href="/sign-up" onClick={rememberReturnPosition} className="suga-home-primary suga-home-primary-lg">
              Start consultation <ArrowRight size={17} />
            </Link>
            <a href="#how-it-works" className="suga-home-text-link">How it works <ChevronRight size={16} /></a>
          </div>

          <div className="suga-home-trust-line">
            <ShieldCheck size={17} />
            <span>Your answers stay private until you submit them for clinical review.</span>
          </div>
        </div>

        <div className="suga-home-hero-media" aria-label="Image placeholder" role="img" />
      </section>

      <section className="suga-home-care">
        <div className="suga-home-section-intro">
          <h2>Care focused on a specific concern.</h2>
          <p>
            Each pathway asks different questions, but the principle stays the same:
            treatment decisions start with your health history, not a generic recommendation.
          </p>
        </div>

        <div className="suga-home-care-list">
          {careAreas.map((area, index) => (
            <article className="suga-home-care-row" key={area.id}>
              <div className={`suga-home-media suga-home-media-${area.id}`} aria-label="Image placeholder" role="img" />
              <div className="suga-home-care-copy">
                <h3>{area.title}</h3>
                <p>{area.copy}</p>
                <ul>
                  {area.points.map((point) => <li key={point}><Check size={15} />{point}</li>)}
                </ul>
                <Link href={area.path} className="suga-home-text-link">
                  Explore {area.id === "weight" ? "weight loss" : area.id === "hair" ? "hair treatment" : "sexual health"} <ArrowRight size={16} />
                </Link>
              </div>
              <span className="suga-home-care-index" aria-hidden="true">0{index + 1}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="suga-home-statement">
        <p>Treatment starts with context.</p>
        <span>
          Your medical history, current medicines and treatment goals are reviewed
          before a clinician decides what should happen next.
        </span>
      </section>

      <section className="suga-home-process" id="how-it-works">
        <div className="suga-home-section-intro">
          <h2>A private consultation, then a clinical decision.</h2>
          <p>
            The process stays simple for the patient while keeping the information
            a clinician needs to make a responsible decision.
          </p>
        </div>

        <div className="suga-home-process-list">
          {howItWorks.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="suga-home-facts" aria-label="How the care model is structured">
        <div>
          <strong>3</strong>
          <span>focused care areas</span>
        </div>
        <div>
          <strong>1</strong>
          <span>consultation record</span>
        </div>
        <div>
          <strong>Human</strong>
          <span>clinical review</span>
        </div>
      </section>

      <section className="suga-home-journey">
        <div className="suga-home-section-intro">
          <h2>What treatment can look like over time.</h2>
          <p>
            The exact plan depends on your case. These stages show how review,
            treatment decisions and follow-up stay connected.
          </p>
        </div>

        <div className="suga-home-journey-tabs" role="group" aria-label="Choose care area">
          <button type="button" className={journey === "weight" ? "is-active" : ""} onClick={() => setJourney("weight")}>Weight loss</button>
          <button type="button" className={journey === "hair" ? "is-active" : ""} onClick={() => setJourney("hair")}>Hair growth</button>
          <button type="button" className={journey === "sexual" ? "is-active" : ""} onClick={() => setJourney("sexual")}>Sexual health</button>
        </div>

        <div className="suga-home-journey-rail">
          {journeys[journey].map((item, index) => (
            <article key={item.title}>
              <span className="suga-home-journey-dot" aria-hidden="true" />
              <small>{index + 1}</small>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="suga-home-clinician">
        <div className="suga-home-media suga-home-media-blue" aria-label="Clinician image placeholder" role="img" />
        <div>
          <Stethoscope size={24} />
          <h2>A prescription is one decision. Follow-up is the rest of care.</h2>
          <p>
            Your consultation stays connected to the clinician who reviews it,
            so treatment decisions, questions and follow-up are not scattered across separate forms.
          </p>
          <div className="suga-home-clinician-points">
            <span><Check size={15} />Clinical review before prescribing</span>
            <span><Check size={15} />Consultation-linked messaging</span>
            <span><Check size={15} />Treatment details remain in your account</span>
          </div>
          <Link href="/about" className="suga-home-text-link">How our care model works <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="suga-home-questions">
        <div className="suga-home-section-intro">
          <h2>Questions patients usually ask before starting.</h2>
          <p>
            Clear answers matter more than another row of marketing claims.
          </p>
        </div>

        <div className="suga-home-faq-list">
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}<span aria-hidden="true">+</span></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="suga-home-final">
        <div>
          <h2>Start with a private consultation.</h2>
          <p>
            Tell us what you need help with. A clinician reviews the details before any treatment decision is made.
          </p>
        </div>
        <Link href="/sign-up" onClick={rememberReturnPosition} className="suga-home-primary suga-home-primary-lg">
          Start consultation <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="suga-home-footer">
        <div>
          <Link href="/" className="suga-home-brand">
            <strong>SUGA.HEALTH</strong>
            <span>live naturally</span>
          </Link>
          <p>Private online care with clinician review before treatment.</p>
        </div>

        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/weight-loss">Weight Loss</Link>
          <Link href="/hair-growth">Hair Growth</Link>
          <Link href="/sexual-health">Sexual Health</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>

        <p className="suga-home-legal">
          Suga.Health facilitates telehealth consultations through licensed medical professionals.
          Prescription treatment requires clinical review. For emergencies, contact local emergency services.
        </p>
      </footer>
    </main>
  );
}
