import Link from "next/link";
import { ArrowRight, EyeOff, Lock, Package } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const conditions = [
  { title: "Erectile Dysfunction (ED)", stat: "Affects ~50% of men over 40", desc: "Proven daily micro-dosing or on-demand options like Sildenafil and Tadalafil, tailored to your vascular health profile.", meds: "Sildenafil (Viagra®) & Tadalafil (Cialis®)" },
  { title: "Premature Ejaculation (PE)", stat: "Over 90% respond to treatment", desc: "Medical and neurological interventions designed to significantly improve stamina and control without desensitizing satisfaction.", meds: "Custom formulations & PDE5 combinations" },
  { title: "Hormonal & Vitality Workup", stat: "Comprehensive physician evaluation", desc: "Thorough symptom screening for underlying metabolic and testosterone deficiency—treated responsibly only when clinically indicated.", meds: "Cardiovascular & endocrine review" },
];
const privacy = [
  { title: "Unbranded Packaging", desc: "Shipped in a plain brown mailer with zero logos, condition names, or medication details on the exterior.", icon: Package },
  { title: "Neutral Billing", desc: "Your bank statement reflects a generic healthcare provider charge. Nothing identifying your specific prescription.", icon: EyeOff },
  { title: "Bank-Grade Privacy & Security", desc: "Your health records are encrypted and protected under strict patient privacy standards. We never sell your personal data.", icon: Lock },
];

export default function SexualHealthPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader title="Sexual Health & Longevity. Handled with Complete Discretion." subtitle="Confidential medical treatment for erectile health and performance, reviewed by licensed physicians and delivered in unbranded packaging." image="https://images.unsplash.com/photo-1497250681558-e6d1cc5451a4?q=80&w=2000&auto=format&fit=crop&grayscale=1" tone="sexual" />
    <LegacySection surface>
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Treated Conditions</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">Comprehensive Coverage</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">{conditions.map((item) => <article key={item.title} className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 hover:border-neutral-950 transition-colors flex flex-col justify-between"><div><span className="text-[11px] font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 uppercase tracking-wider mb-4 inline-block border border-neutral-200/60">{item.stat}</span><h3 className="font-sans text-2xl font-bold mb-3 text-neutral-950">{item.title}</h3><p className="text-neutral-600 text-sm leading-relaxed mb-6">{item.desc}</p></div><div className="pt-4 border-t border-neutral-100"><span className="text-xs font-semibold text-neutral-900 block mb-3">{item.meds}</span><Link href="/sign-up" className="suga-btn suga-btn-secondary suga-btn-inline">Assess Eligibility <ArrowRight size={14} className="ml-1.5" /></Link></div></article>)}</div>
    </LegacySection>

    <LegacySection>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
        <div className="md:col-span-7"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Cardiovascular Insight</span><h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mb-4">Vascular health is whole-body health.</h2><p className="text-neutral-600 text-base leading-relaxed mb-4">Penile arteries are among the smallest vascular channels in the human body (1–2mm). Subtle changes in blood flow often serve as an early clinical window into cardiovascular and metabolic health.</p><p className="text-neutral-600 text-base leading-relaxed">That is why our physicians review your full profile—blood pressure, sleep apnea risk, metabolic markers, and lifestyle—ensuring the right, safe treatment.</p></div>
        <div className="md:col-span-5 bg-neutral-950 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center border border-neutral-900"><span className="text-5xl font-extrabold tracking-tight block mb-2 text-white">1 in 2</span><span className="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-3">Men Over 40</span><p className="text-xs text-neutral-300 leading-relaxed">Experience occasional or chronic ED. It is a biological condition that responds predictably to medical care.</p></div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Discretion</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">Total Privacy</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">{privacy.map((item) => { const Icon=item.icon; return <article key={item.title} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 hover:border-neutral-950 transition-colors"><div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-950 mb-6 border border-neutral-200/60"><Icon size={20} /></div><h3 className="font-sans text-xl font-bold text-neutral-950 mb-2">{item.title}</h3><p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p></article>; })}</div>
    </LegacySection>
    <LegacyCta title="Five quiet minutes. No waiting room." description="Answer private medical questions online. A licensed physician will review your history and prescribe the appropriate treatment if suitable." />
  </LegacyPublicFrame>;
}
