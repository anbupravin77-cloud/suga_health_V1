"use client";

import Link from "next/link";
import { ArrowRight, UserRound, Sprout, Mars } from "lucide-react";
import "./landing-test.css";

import { rememberReturnPosition } from "@/components/public/return-position";

export default function LandingTestPage() {
  return (
    <section className="suga-concept" aria-label="Doctor-led care">
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

          <Link href="/sign-in" className="suga-concept__login">Login</Link>
          <Link href="/sign-up" onClick={rememberReturnPosition} className="suga-concept__navCta">
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
              <span className="suga-concept__pillIcon"><UserRound size={20} strokeWidth={1.7} /></span>
              <span>Medical weight loss</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
            <Link href="/hair-growth" className="suga-concept__glassPill">
              <span className="suga-concept__pillIcon"><Sprout size={19} strokeWidth={1.7} /></span>
              <span>Hair growth</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
            <Link href="/sexual-health" className="suga-concept__glassPill">
              <span className="suga-concept__pillIcon"><Mars size={19} strokeWidth={1.7} /></span>
              <span>Sexual health</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </Link>
          </div>

          <Link href="/sign-up" onClick={rememberReturnPosition} className="suga-concept__mainCta">
            <span>Start consultation</span>
            <ArrowRight size={24} strokeWidth={1.7} />
          </Link>
        </div>
      </section>
    </section>
  );
}
