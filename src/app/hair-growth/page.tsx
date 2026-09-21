import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const pillars = [
  { num: "01", tag: "Clinical First-Line", title: "DHT Enzyme Inhibition", desc: "Finasteride blocks 5-alpha reductase, preventing testosterone from converting into DHT—the primary hormone causing follicular shrinkage and hair thinning." },
  { num: "02", tag: "Growth Stimulator", title: "Microvascular Follicular Stimulation", desc: "Minoxidil acts as a potassium channel opener, widening blood vessels around the dermal papilla to rush oxygen and key nutrients directly to growing hair bulbs." },
  { num: "03", tag: "Zero Hassle Routine", title: "Individualized Delivery Modes", desc: "Choose between convenient once-daily oral tablets or custom 2-in-1 compounded topical drops that absorb cleanly without greasy residue." },
];
const phases = [
  { phase: "Months 1–3", title: "Follicular Reset", desc: "Weak, miniaturized hairs shed to make room for robust new growth. DHT is successfully blocked at the follicle base." },
  { phase: "Months 4–6", title: "Early Regrowth", desc: "Fine new hairs emerge. Overall shedding drops dramatically. Hair texture begins feeling thicker and more resilient." },
  { phase: "Months 9–12+", title: "Noticeable Density", desc: "Significant improvement in scalp coverage and hair density. Routine maintenance maintains all clinical gains permanently." },
];

export default function HairGrowthPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader title="Evidence-Based Hair Regrowth. Act Before Follicles Sleep." subtitle="Clinically proven treatments targeting DHT and follicular blood flow, prescribed by licensed US dermatologists and physicians." image="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2000&auto=format&fit=crop&grayscale=1" />
    <LegacySection surface>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5 relative lg:sticky lg:top-32"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-3">Follicular Biology</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 leading-tight mb-6">Real medicine. Decades of proven clinical results.</h2><p className="text-neutral-600 text-base sm:text-lg leading-relaxed mb-6">No unproven light helmets or snake-oil serums. We prescribe the foundational medical therapies proven across clinical trials to halt follicular miniaturization.</p><div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90"><span className="text-xs font-bold text-neutral-950 block mb-1">Clinical Fact:</span><span className="text-xs text-neutral-600 leading-normal">Over 90% of men who begin Finasteride and Minoxidil during early thinning halt further loss, with over 65% experiencing measurable hair regrowth within 12 months.</span></div></div>
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">{pillars.map((item) => <article key={item.num} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 hover:border-neutral-950 transition-colors"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/60">{item.tag}</span><span className="font-mono text-sm font-bold text-neutral-400">{item.num}</span></div><h3 className="font-sans text-xl sm:text-2xl font-bold mb-2 text-neutral-950">{item.title}</h3><p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{item.desc}</p></article>)}</div>
      </div>
    </LegacySection>

    <LegacySection>
      <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-10"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Comparative Dermatology</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">Interactive Treatment Comparison</h2><p className="mt-3 text-neutral-600 text-sm sm:text-base">Explore side-by-side follicular biology, DHT suppression statistics, and expected clinical progression milestones.</p></div>
      <div className="grid md:grid-cols-2 rounded-3xl border border-neutral-200 overflow-hidden"><article className="p-6 sm:p-8 bg-neutral-50"><span className="legacy-label">Finasteride</span><h3 className="font-sans text-2xl font-bold mb-3">Protect existing follicles</h3><p className="text-sm text-neutral-600 mb-5">Reduces the DHT pathway responsible for progressive follicular miniaturization.</p><div className="space-y-2 text-xs text-neutral-700"><p className="flex gap-2"><Check size={14} />Targets the hormonal driver of male-pattern loss</p><p className="flex gap-2"><Check size={14} />Oral and topical pathways available</p></div></article><article className="p-6 sm:p-8 bg-neutral-950 text-white"><span className="legacy-label text-neutral-400">Minoxidil</span><h3 className="font-sans text-2xl font-bold text-white mb-3">Stimulate active growth</h3><p className="text-sm text-neutral-300 mb-5">Improves follicular blood-flow signaling and extends the active anagen growth cycle.</p><div className="space-y-2 text-xs text-neutral-300"><p className="flex gap-2"><Check size={14} />Supports crown and hairline density</p><p className="flex gap-2"><Check size={14} />Pairs with DHT-targeted treatment</p></div></article></div>
    </LegacySection>

    <LegacySection surface>
      <div className="max-w-5xl mx-auto"><div className="text-center mb-8 sm:mb-12"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Biological Timeline</span><h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">The Growth Cycle</h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{phases.map((item, idx) => <article key={item.phase} className={"p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border transition-colors " + (idx === 2 ? "border-neutral-950" : "border-neutral-200/90 hover:border-neutral-950")}><span className={"text-xs font-bold px-3 py-1 rounded-full uppercase block w-fit mb-4 " + (idx === 2 ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-800")}>{item.phase}</span><h4 className="font-sans text-lg font-bold text-neutral-950 mb-2">{item.title}</h4><p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p></article>)}</div></div>
    </LegacySection>
    <LegacyCta title="One confidential consultation. An honest plan." description="Complete your online intake in under 5 minutes. A board-certified physician will review your history and recommend the right course of treatment." />
  </LegacyPublicFrame>;
}
