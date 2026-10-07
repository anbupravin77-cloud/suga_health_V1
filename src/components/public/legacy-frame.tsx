"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { rememberReturnPosition, useRestoreReturnPosition } from "./return-position";
import { MobilePublicMenu } from "./mobile-public-menu";

const navLinks = [
  { name: "About", path: "/about" },
  { name: "Weight Loss", path: "/weight-loss" },
  { name: "Hair Growth", path: "/hair-growth" },
  { name: "Sexual Health", path: "/sexual-health" },
];

export function LegacyPublicFrame({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useRestoreReturnPosition();

  return <main className="legacy-public refined-treatment editorial-public min-h-screen bg-white text-black overflow-x-hidden">
    <header className="editorial-public-header">
      <div className="editorial-public-header-inner">
        <Link href="/" className="editorial-public-brand">
          <strong>SUGA.HEALTH</strong>
          <span>live naturally</span>
        </Link>

        <nav className="editorial-public-nav" aria-label="Primary navigation">
          {navLinks.map((link) => <Link key={link.path} href={link.path}>{link.name}</Link>)}
        </nav>

        <div className="editorial-public-actions">
          <Link href="/sign-in" className="editorial-public-signin">Sign in</Link>
          <Link href="/sign-up" onClick={rememberReturnPosition} className="editorial-public-primary">
            Start consultation <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="editorial-public-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>

    <MobilePublicMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

    <div className="editorial-public-content">{children}</div>

    <footer className="editorial-public-footer">
      <div>
        <Link href="/" className="editorial-public-brand">
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

      <p className="editorial-public-legal">
        Suga.Health facilitates telehealth consultations through licensed medical professionals.
        Prescription treatment requires clinical review. For emergencies, contact local emergency services.
      </p>
    </footer>
  </main>;
}

export function LegacyPageHeader({
  title,
  subtitle,
  image: _image,
  tone = "neutral",
}: {
  title: string;
  subtitle: string;
  image: string;
  tone?: "neutral" | "weight" | "hair" | "sexual";
}) {
  return <section className="editorial-page-hero">
    <div className="editorial-page-hero-copy">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <Link href="/sign-up" onClick={rememberReturnPosition} className="editorial-public-primary">
        Start consultation <ArrowRight size={16} />
      </Link>
    </div>
    <div className={`editorial-page-hero-media editorial-page-hero-media-${tone}`} aria-label="Image placeholder" role="img" />
  </section>;
}

export function LegacySection({ children, surface = false }: { children: ReactNode; surface?: boolean }) {
  return <section className={surface ? "editorial-page-section editorial-page-section-soft" : "editorial-page-section"}>
    <div className="editorial-page-shell">{children}</div>
  </section>;
}

export function LegacyCta({ title, description }: { title: string; description: string }) {
  return <section className="editorial-page-cta">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <Link href="/sign-up" onClick={rememberReturnPosition} className="editorial-public-primary editorial-public-primary-lg">
      Start consultation <ArrowRight size={17} />
    </Link>
  </section>;
}
