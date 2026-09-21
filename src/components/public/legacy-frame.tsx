"use client";

import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import type { ReactNode } from "react";

const navLinks = [
  { name: "Weight Loss", path: "/weight-loss", desc: "GLP-1 medical protocols" },
  { name: "Hair Growth", path: "/hair-growth", desc: "Follicular regeneration" },
  { name: "Sexual Health", path: "/sexual-health", desc: "Performance & longevity" },
  { name: "About", path: "/about", desc: "Clinical team & safety" },
];

export function LegacyPublicFrame({ children }: { children: ReactNode }) {
  return <main className="legacy-public min-h-screen bg-[#FAFAFA] text-neutral-950 overflow-x-hidden">
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex justify-between items-center">
        <Link href="/" className="flex flex-col items-start select-none shrink-0">
          <span className="font-sans text-xl sm:text-2xl tracking-tighter uppercase font-black text-neutral-950 leading-none">SUGA<span className="text-neutral-400">.</span>HEALTH</span>
          <span className="brand-tagline text-neutral-500 mt-0.5">live naturally</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-neutral-100/80 p-1.5 rounded-full border border-neutral-200/80">
          {navLinks.map((link) => <Link key={link.name} href={link.path} className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 transition-all whitespace-nowrap">{link.name}</Link>)}
        </nav>
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href="/sign-in" className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-neutral-950 mr-2">Sign In</Link>
          <Link href="/sign-up" className="hidden sm:inline-flex items-center justify-center bg-neutral-950 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white hover:bg-neutral-800 transition-all group">Start consultation <ArrowRight size={14} className="ml-2" /></Link>
          <details className="relative lg:hidden">
            <summary className="list-none p-2 rounded-xl cursor-pointer"><Menu size={22} /></summary>
            <div className="absolute right-0 top-12 w-[min(88vw,360px)] rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
              <div className="grid gap-2">
                {navLinks.map((link) => <Link key={link.name} href={link.path} className="rounded-xl bg-neutral-50 p-4"><span className="block font-bold">{link.name}</span><span className="text-xs text-neutral-500">{link.desc}</span></Link>)}
                <Link href="/sign-in" className="rounded-xl border border-neutral-200 p-3 text-center text-sm font-bold">Sign In</Link>
                <Link href="/sign-up" className="rounded-full bg-neutral-950 p-3 text-center text-xs font-bold uppercase tracking-wider text-white">Start consultation</Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
    <div className="pt-[70px]">{children}</div>
    <footer className="bg-neutral-950 text-neutral-300 py-12 md:py-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-12">
          <div className="md:col-span-6"><Link href="/" className="flex flex-col items-start mb-6"><span className="font-sans text-2xl tracking-tighter uppercase font-black text-white">SUGA<span className="text-neutral-500">.</span>HEALTH</span><span className="brand-tagline text-neutral-400 mt-0.5">live naturally</span></Link><p className="text-neutral-400 max-w-md text-sm leading-relaxed">Confidential, doctor-guided treatments for medical weight loss, hair restoration, and sexual vitality. Real treatments delivered with care and complete privacy.</p></div>
          <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Clinical Treatments</h4><ul className="space-y-3 text-sm text-neutral-400"><li><Link href="/weight-loss">Medical Weight Loss (GLP-1)</Link></li><li><Link href="/hair-growth">Hair Regrowth & Density</Link></li><li><Link href="/sexual-health">Sexual Health & Performance</Link></li><li><Link href="/sign-up">Start Online Consultation</Link></li></ul></div>
          <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Medical Practice</h4><ul className="space-y-3 text-sm text-neutral-400"><li><Link href="/#doctors">Our Doctors & Medical Board</Link></li><li><Link href="/#products">Our Products & Formulary</Link></li><li><Link href="/about">About Our Clinical Mission</Link></li><li><Link href="/sign-up">Patient Medical Intake</Link></li></ul></div>
        </div>
        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 space-y-2"><p>Suga.Health facilitates telehealth consultations through licensed medical professionals. Prescription products require an online evaluation with a licensed healthcare provider.</p><p>For emergencies, contact local emergency services.</p><p>© {new Date().getFullYear()} Suga.Health. All rights reserved.</p></div>
      </div>
    </footer>
  </main>;
}

export function LegacyPageHeader({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-neutral-200/80 bg-white">
    <div className="absolute inset-0 -z-0 opacity-10 md:opacity-15 grayscale overflow-hidden"><img src={image} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" /></div>
    <div className="relative z-10 max-w-7xl mx-auto w-full"><h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.15] pb-1 max-w-4xl">{title}</h1><p className="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">{subtitle}</p></div>
  </section>;
}

export function LegacySection({ children, surface = false }: { children: ReactNode; surface?: boolean }) {
  return <section className={"py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 w-full " + (surface ? "bg-neutral-50" : "bg-white")}><div className="max-w-7xl mx-auto w-full">{children}</div></section>;
}

export function LegacyCta({ title, description }: { title: string; description: string }) {
  return <LegacySection><div className="max-w-3xl mx-auto text-center py-4 sm:py-6"><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 mb-4 sm:mb-6 tracking-tight">{title}</h2><p className="text-neutral-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto">{description}</p><Link href="/sign-up" className="inline-flex items-center justify-center bg-neutral-950 border border-neutral-950 px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-wider uppercase text-white hover:bg-neutral-800 transition-all group">Start Free Assessment <ArrowRight size={16} className="ml-2.5" /></Link></div></LegacySection>;
}
