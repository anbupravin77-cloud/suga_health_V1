import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const pillars = [
  { num: "01", tag: "FDA-Regulated Protocol", title: "GLP-1 Receptor Agonists", desc: "Semaglutide and Tirzepatide mimic the body's natural satiety hormone, delaying gastric emptying and quieting perpetual 'food noise' in the brain." },
  { num: "02", tag: "Patient Safety First", title: "Comprehensive Clinical Screening", desc: "Every patient undergoes a full online review by a US-licensed doctor to evaluate BMI, thyroid history, and contraindications before any script is issued." },
  { num: "03", tag: "Lasting Results", title: "Metabolic Stabilization & Tapering", desc: "We focus on long-term health preservation, preserving lean muscle mass and assisting in sustainable lifestyle routines for permanent results." },
];

const medications = [
  { tag: "GLP-1 Mono-agonist", title: "Semaglutide", desc: "The gold-standard GLP-1 receptor agonist that slows digestion and communicates fullness directly with the hypothalamus.", benefits: ["Average 15% body weight reduction in trials", "Convenient once-weekly self-injection pen", "Slow monthly dose escalation to minimize nausea"] },
  { tag: "Dual GIP / GLP-1 Agonist", title: "Tirzepatide", desc: "Next-generation dual incretin mimetic activating both GIP and GLP-1 pathways for enhanced glycemic and adiposity control.", benefits: ["Up to 20.9% average body weight loss in SURMOUNT trials", "Dual receptor targeting for maximum metabolic impact", "Doctor-monitored dosage titration schedule"] },
];

export default function WeightLossPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader title="Medical Weight Loss. Driven by Biology." subtitle="FDA-approved GLP-1 treatments prescribed by licensed US clinicians to quiet biological cravings and restore metabolic balance." image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop&grayscale=1" />
    <LegacySection surface>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5 relative lg:sticky lg:top-32">
          <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-3">Metabolic Truth</span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 leading-tight mb-6">Why this works when traditional diets failed.</h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed mb-6">Chronic weight struggle is not a personal failure of willpower. It is controlled by evolutionary hormones, ghrelin spikes, and metabolic resistance.</p>
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90"><span className="text-xs font-bold text-neutral-950 block mb-1">Clinical Evidence:</span><span className="text-xs text-neutral-600 leading-normal">In NEJM clinical trials, patients taking GLP-1 therapies lost an average of 15% to 20% of baseline body weight over 68 weeks alongside lifestyle changes.</span></div>
        </div>
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">{pillars.map((item) => <article key={item.num} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 hover:border-neutral-950 transition-colors"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/60">{item.tag}</span><span className="font-mono text-sm font-bold text-neutral-400">{item.num}</span></div><h3 className="font-sans text-xl sm:text-2xl font-bold mb-2 text-neutral-950">{item.title}</h3><p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{item.desc}</p></article>)}</div>
      </div>
    </LegacySection>

    <LegacySection>
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Available Formulations</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">Evidence-based treatments prescribed for you.</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">{medications.map((med, idx) => <article key={med.title} className={"rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-neutral-200/90 hover:border-neutral-950 transition-all flex flex-col justify-between " + (idx === 1 ? "bg-white" : "bg-neutral-50/80 hover:bg-white")}><div><span className={"text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block " + (idx === 1 ? "bg-neutral-950 text-white" : "bg-neutral-200 text-neutral-800")}>{med.tag}</span><h3 className="font-sans text-2xl sm:text-3xl font-bold text-neutral-950 mb-3">{med.title}</h3><p className="text-neutral-600 text-sm leading-relaxed mb-6">{med.desc}</p><div className="space-y-2.5 mb-8">{med.benefits.map((item) => <div key={item} className="flex items-center gap-2.5 text-xs font-medium text-neutral-700"><Check size={14} className="shrink-0" /><span>{item}</span></div>)}</div></div><Link href="/sign-up" className="w-full text-center py-3.5 rounded-full bg-neutral-950 border border-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800">Assess for {med.title}</Link></article>)}</div>

      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-neutral-200/80">
        <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-10"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Comparative Pharmacology</span><h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">Interactive Protocol Comparison</h3><p className="mt-3 text-neutral-600 text-sm sm:text-base">Explore side-by-side clinical mechanisms, trial weight loss outcomes, and expected biological trajectories.</p></div>
        <div className="grid md:grid-cols-2 border border-neutral-200 rounded-3xl overflow-hidden"><div className="p-6 sm:p-8 bg-neutral-50"><span className="legacy-label">Semaglutide</span><h4 className="font-sans text-2xl font-bold mb-4">Single GLP-1 pathway</h4><p className="text-sm text-neutral-600">Established weekly protocol focused on appetite regulation, satiety and glycemic control.</p></div><div className="p-6 sm:p-8 bg-neutral-950 text-white"><span className="legacy-label text-neutral-400">Tirzepatide</span><h4 className="font-sans text-2xl font-bold text-white mb-4">Dual GIP + GLP-1 pathway</h4><p className="text-sm text-neutral-300">Dual incretin signaling with higher average trial weight-loss outcomes in eligible patients.</p></div></div>
      </div>
    </LegacySection>
    <LegacyCta title="One confidential consultation. An honest plan." description="Complete your online intake in under 5 minutes. A board-certified physician will review your history and recommend the right course of treatment." />
  </LegacyPublicFrame>;
}
