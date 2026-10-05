"use client";

import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { ArrowRight, Menu, UserRound, Sprout, Mars, X } from "lucide-react";
import { useState } from "react";
import { rememberReturnPosition } from "@/components/public/return-position";
import "./landing-test.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const treatments = [
  { href: "/weight-loss", label: "Medical weight loss", Icon: UserRound },
  { href: "/hair-growth", label: "Hair growth", Icon: Sprout },
  { href: "/sexual-health", label: "Sexual health", Icon: Mars },
];

export default function LandingTestPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className={`${bebasNeue.className} landing-test`}>
      <header className="landing-test__nav">
        <Link href="/" className="landing-test__brand" aria-label="Suga.Health home">
          <strong>SUGA.HEALTH</strong>
          <span>live naturally</span>
        </Link>

        <nav className="landing-test__links" aria-label="Primary navigation">
          <Link href="/about">About</Link>
          <Link href="/weight-loss">Weight Loss</Link>
          <Link href="/hair-growth">Hair Growth</Link>
          <Link href="/sexual-health">Sexual Health</Link>
        </nav>

        <div className="landing-test__actions">
          <Link href="/sign-in" className="landing-test__login">Login</Link>
          <Link
            href="/sign-up"
            onClick={rememberReturnPosition}
            className="landing-test__nav-cta"
          >
            <span>Start consultation</span>
            <ArrowRight size={21} strokeWidth={1.8} />
          </Link>

          <button
            type="button"
            className="landing-test__menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="landing-test__mobile-menu" aria-label="Mobile navigation">
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/weight-loss" onClick={() => setMenuOpen(false)}>Weight Loss</Link>
          <Link href="/hair-growth" onClick={() => setMenuOpen(false)}>Hair Growth</Link>
          <Link href="/sexual-health" onClick={() => setMenuOpen(false)}>Sexual Health</Link>
          <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Login</Link>
        </nav>
      )}

      <section className="landing-test__hero">
        <div className="landing-test__copy">
          <h1>
            <span>Clinically</span>
            <span>proven,</span>
            <span className="landing-test__accent">FDA (USA)</span>
            <span>approved,</span>
            <span>treatment</span>
            <span>prescribed by experts.</span>
          </h1>

          <div className="landing-test__treatments" aria-label="Choose a treatment">
            {treatments.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="landing-test__treatment">
                <span className="landing-test__treatment-icon">
                  <Icon size={21} strokeWidth={1.7} />
                </span>
                <span className="landing-test__treatment-label">{label}</span>
                <ArrowRight className="landing-test__treatment-arrow" size={19} strokeWidth={1.7} />
              </Link>
            ))}
          </div>

          <Link
            href="/sign-up"
            onClick={rememberReturnPosition}
            className="landing-test__main-cta"
          >
            <span>Start consultation</span>
            <ArrowRight size={31} strokeWidth={1.65} />
          </Link>
        </div>
      </section>
    </main>
  );
}
