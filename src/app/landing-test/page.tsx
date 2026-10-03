"use client";

import Link from "next/link";
import { ArrowRight, Menu, UserRound, Sprout, Mars, X } from "lucide-react";
import { useState } from "react";
import { rememberReturnPosition } from "@/components/public/return-position";
import "./landing-test.css";

const treatments = [
  { href: "/weight-loss", label: "Medical weight loss", Icon: UserRound },
  { href: "/hair-growth", label: "Hair growth", Icon: Sprout },
  { href: "/sexual-health", label: "Sexual health", Icon: Mars },
];

export default function LandingTestPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="mobile-template" aria-label="Suga Health mobile landing page">
      <header className="mobile-template__header">
        <Link href="/" className="mobile-template__brand" aria-label="Suga.Health home">
          <strong>SUGA.HEALTH</strong>
          <span>live naturally</span>
        </Link>
        <button
          type="button"
          className="mobile-template__menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-template__menu" aria-label="Primary navigation">
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/weight-loss" onClick={() => setMenuOpen(false)}>Weight loss</Link>
          <Link href="/hair-growth" onClick={() => setMenuOpen(false)}>Hair growth</Link>
          <Link href="/sexual-health" onClick={() => setMenuOpen(false)}>Sexual health</Link>
          <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Log in</Link>
        </nav>
      )}

      <section className="mobile-template__hero">
        <div className="mobile-template__content">
          <p className="mobile-template__eyebrow">Doctor-led online care</p>
          <h1>
            Clinically proven,<br />
            <em>FDA (USA)</em> approved,<br />
            treatment prescribed<br />
            by experts.
          </h1>

          <div className="mobile-template__treatments" aria-label="Choose a care pathway">
            {treatments.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="mobile-template__treatment">
                <span className="mobile-template__treatment-icon"><Icon size={18} strokeWidth={1.8} /></span>
                <span>{label}</span>
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>
            ))}
          </div>

          <Link href="/sign-up" onClick={rememberReturnPosition} className="mobile-template__cta">
            Start consultation <ArrowRight size={25} strokeWidth={1.8} />
          </Link>
          <p className="mobile-template__note">Private online consultation. A clinician reviews every request.</p>
        </div>
        <div className="mobile-template__photo" aria-hidden="true" />
      </section>
    </main>
  );
}
