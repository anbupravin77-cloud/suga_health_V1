import { HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { LegacyCta, LegacyPageHeader, LegacyPublicFrame, LegacySection } from "@/components/public/legacy-frame";

const standards = [
  { title: "Physicians Listen First", desc: "Your medical questionnaire is thoroughly reviewed by a licensed doctor, not an automated AI classifier. Your complete health context matters before any treatment decision.", icon: Stethoscope },
  { title: "Prescribe Only When Clinically Sound", desc: "We are not a pill dispensary. If an in-person diagnostic test, lab panel, or lifestyle modification is the safer path, our physicians will tell you plainly.", icon: ShieldCheck },
  { title: "Proactive Ongoing Follow-Up", desc: "Health outcomes happen over months, not at checkout. We check in on your titration curve, monitor side effects, and adjust protocols as your body responds.", icon: HeartPulse },
];
const safety = [
  { title: "100% US-Licensed & Board-Certified", desc: "Every clinician reviewing patient files holds active medical licenses in the state where the patient resides." },
  { title: "Legitimate US Compounding & Partner Pharmacies", desc: "Medications are dispensed exclusively through licensed, inspected US pharmacies adhering to USP 795, 797, and cGMP standards." },
  { title: "Bank-Grade Security & End-to-End Encryption", desc: "Your consultations, health uploads, and medical history are stored in private, confidential encrypted medical vaults." },
  { title: "Transparent Pricing with Zero Hidden Fees", desc: "You see the exact monthly investment before ordering. No surprise hospital facility fees or subscription lock-ins." },
];
const metrics = [
  { value: "5 Min", title: "Intake Time", desc: "Thoughtful and comprehensive online questions" },
  { value: "< 24h", title: "Doctor Review", desc: "Fast evaluation by board-certified physicians" },
  { value: "100%", title: "Human Doctors", desc: "Every single chart is reviewed by real clinicians" },
];

export default function AboutPage() {
  return <LegacyPublicFrame>
    <LegacyPageHeader title="Clinical Care Built on Trust. Not Volume." subtitle="Suga.health was founded by US-trained clinicians with one core conviction: quality medical care should never depend on the length of a clinic waiting room line." image="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2000&auto=format&fit=crop&grayscale=1" />
    <LegacySection>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-3">Our Guiding Mission</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 leading-tight mb-4">What ‘live naturally’ actually means to us.</h2><span className="text-lg sm:text-xl font-medium text-neutral-600 block mt-2 tracking-tight">Medicine as a bridge, not a subscription trap.</span></div>
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-neutral-700 text-base sm:text-lg leading-relaxed"><p>To generic wellness brands, “natural” is an overused buzzword. To a practicing physician, it describes a direction of biological health. We do not believe in locking patients into endless dependency.</p><p>When treatment is appropriate, our licensed doctors prescribe it to treat, stabilize, and optimize your biology. We work steadily toward the minimal effective therapeutic dose that sustains your vitality and wellness.</p><p className="text-neutral-500 font-medium">That is the true essence of living naturally: empowering your body to do as much of the vital work as it safely can, with science and medicine filling only the necessary gap.</p></div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-2">Clinical Philosophy</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">Standard of Care</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">{standards.map((item) => { const Icon=item.icon; return <article key={item.title} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 hover:border-neutral-950 transition-colors"><div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-950 mb-6 border border-neutral-200/60"><Icon size={24} /></div><h3 className="font-sans text-xl font-bold text-neutral-950 mb-3">{item.title}</h3><p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p></article>; })}</div>
    </LegacySection>

    <LegacySection>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5 relative lg:sticky lg:top-32"><span className="text-xs font-bold tracking-widest text-neutral-500 uppercase block mb-3">Pharmacy & Compliance</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 leading-tight mb-4">Safety Without Compromise</h2><p className="text-neutral-600 text-base leading-relaxed">We hold our clinical protocols to the highest standards of safety and regulatory compliance.</p></div>
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">{safety.map((item) => <article key={item.title} className="bg-neutral-50/80 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950 transition-colors"><h3 className="font-sans text-lg font-bold text-neutral-950 mb-2">{item.title}</h3><p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p></article>)}</div>
      </div>
    </LegacySection>

    <LegacySection surface>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">{metrics.map((item) => <article key={item.title} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950 transition-colors"><span className="font-sans text-4xl sm:text-5xl font-extrabold text-neutral-950 block mb-2">{item.value}</span><span className="text-xs font-bold text-neutral-900 uppercase tracking-widest block mb-2">{item.title}</span><p className="text-xs text-neutral-500">{item.desc}</p></article>)}</div>
    </LegacySection>
    <LegacyCta title="Modern clinical care. Grounded in science." description="Experience healthcare that respects your time, dignity, and personal health journey." />
  </LegacyPublicFrame>;
}
