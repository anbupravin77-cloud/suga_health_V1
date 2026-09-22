"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  Info,
  Layers,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { rememberReturnPosition, useRestoreReturnPosition } from "@/components/public/return-position";
import { MobilePublicMenu } from "@/components/public/mobile-public-menu";
import { PublicImage } from "@/components/public/public-image";

const navLinks = [
  { name: "About", path: "/about", desc: "Our clinical mission & standards" },
  { name: "Weight Loss", path: "/weight-loss", desc: "GLP-1 medical protocols" },
  { name: "Hair Growth", path: "/hair-growth", desc: "Follicular regeneration" },
  { name: "Sexual Health", path: "/sexual-health", desc: "Performance & longevity" },
];

const pillars = [
  {
    id: "weight",
    title: "Medical Weight Loss",
    subtitle: "GLP-1 Metabolic Health Protocol",
    desc: "Target the biological roots of appetite and insulin response with FDA-approved Semaglutide and Tirzepatide.",
    stats: "Avg. 15% weight reduction",
    timeline: "Noticeable in 4–8 weeks",
    highlights: ["Doctor-prescribed GLP-1 medications", "Regulates hunger and metabolic signals", "Ongoing dose titration & clinician support"],
    path: "/weight-loss",
    img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop&grayscale=1",
  },
  {
    id: "hair",
    title: "Hair Restoration",
    subtitle: "Follicular Density & Regrowth",
    desc: "Combat DHT-driven thinning at the root with customized oral and topical combinations of Finasteride and Minoxidil.",
    stats: "92% stopped further loss",
    timeline: "Visible density in 90–120 days",
    highlights: ["Clinically proven active ingredients", "Custom formulas for men & women", "Protects active & dormant follicles"],
    path: "/hair-growth",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop&grayscale=1",
  },
  {
    id: "sexual",
    title: "Sexual Health",
    subtitle: "Performance & Endocrine Care",
    desc: "Confidential, judgment-free clinical treatments for ED and vitality with compounded and brand Sildenafil & Tadalafil.",
    stats: "95% clinical response rate",
    timeline: "Works in 30–60 minutes",
    highlights: ["On-demand or daily micro-dosing", "100% online & 100% confidential", "Delivered in unbranded discreet boxes"],
    path: "/sexual-health",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop&grayscale=1",
  },
];

const timelines = {
  weight: [
    { phase: "Month 1", label: "Metabolic Reset", description: "Initial micro-dose titration minimizes side effects while dampening constant food cravings and biological 'food noise'." },
    { phase: "Months 2–3", label: "Consistent Loss", description: "Steady 1–2 lbs weekly reduction. Improved insulin sensitivity, increased daytime energy, and reduced visceral fat." },
    { phase: "Months 4–6+", label: "Target Stability", description: "Reach your personal target weight. Physician evaluates maintenance dosing to lock in sustainable metabolic health." },
  ],
  hair: [
    { phase: "Months 1–2", label: "Follicle Stabilization", description: "DHT inhibition begins. Normal initial shedding of weak hairs as miniaturized follicles enter the active anagen growth phase." },
    { phase: "Months 3–4", label: "Initial Regrowth", description: "Early signs of thickening along the crown and hairline. Faint vellus hairs transition into stronger terminal strands." },
    { phase: "Months 6+", label: "Peak Density", description: "Noticeably denser coverage, reduced scalp visibility, and strengthened hair shafts with permanent daily routine." },
  ],
  sexual: [
    { phase: "Day 1", label: "Immediate Efficacy", description: "On-demand or daily protocol delivers reliable blood flow within 30 to 60 minutes of ingestion." },
    { phase: "Weeks 2–4", label: "Confidence Restored", description: "Elimination of performance anxiety. Daily micro-dosing allows completely spontaneous, natural intimacy." },
    { phase: "Ongoing", label: "Continuous Optimization", description: "Regular check-ins with your Suga physician to fine-tune dosage, refill automatically, and monitor total vascular health." },
  ],
};

const howItWorks = [
  { step: "01", title: "Online Health Intake", time: "5 Minutes", desc: "Complete a private health evaluation from any smartphone or computer. Share your health goals, medical history, and symptoms." },
  { step: "02", title: "Physician Evaluation", time: "Under 24 Hours", desc: "A licensed US physician reviews your chart to verify clinical suitability and prescribes the optimal custom medication dose." },
  { step: "03", title: "Discreet Delivery", time: "2-Day Doorstep", desc: "Medications ship free from a licensed US pharmacy in unbranded packaging, with continuous access to your care team for refills." },
];

const metrics = [
  { value: "5 Min", title: "Intake Time", desc: "Thoughtful and comprehensive online questions" },
  { value: "< 24h", title: "Doctor Review", desc: "Fast evaluation by board-certified physicians" },
  { value: "100%", title: "Human Doctors", desc: "Every single chart is reviewed by real clinicians" },
];

const traditional = [
  "3–6 weeks waiting for an in-person doctor appointment",
  "Uncomfortable waiting rooms and clinical interrogations",
  "In-person pharmacy pickup with public counter announcements",
  "Surprise insurance co-pays and facility fee invoices",
];

const sugaModel = [
  "Physician evaluation within 24 hours online",
  "100% confidential intake from the privacy of your home",
  "Free 2-day delivery in unmarked, discreet packaging",
  "Transparent upfront pricing with ongoing doctor messaging",
];

const doctors = [
  {
    id: "dr-marcus-vance",
    name: "Dr. Marcus Vance",
    credentials: "MD, FACP",
    role: "Chief Medical Officer",
    specialty: "Internal Medicine & Metabolic Pharmacology",
    education: "Johns Hopkins School of Medicine",
    licensedStatesCount: 32,
    quote: "Treating whole metabolic health, never cutting clinical corners.",
    bio: "Dr. Vance has over 16 years of experience in endocrinology, preventative longevity, and clinical weight management. He oversees Suga Health’s clinical safety protocols.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
    boardCertification: "American Board of Internal Medicine (ABIM)",
    yearsOfExperience: 16,
  },
  {
    id: "dr-elena-chen",
    name: "Dr. Elena Chen",
    credentials: "MD, FAAD",
    role: "Director of Clinical Dermatology",
    specialty: "Trichology & Follicular Regeneration",
    education: "Stanford University School of Medicine",
    licensedStatesCount: 26,
    quote: "Precision follicular stimulation with minimal systemic exposure.",
    bio: "Dr. Chen specializes in pattern hair loss in men and women, androgenetic alopecia, and dual-action compounds.",
    image: "https://images.unsplash.com/photo-1594824813583-294711319717?q=80&w=800&auto=format&fit=crop",
    boardCertification: "American Board of Dermatology (ABD)",
    yearsOfExperience: 12,
  },
  {
    id: "dr-julian-rivera",
    name: "Dr. Julian Rivera",
    credentials: "MD",
    role: "Lead Urologist & Men’s Health Director",
    specialty: "Endocrine Health & Sexual Vitality",
    education: "Columbia University Vagelos College of Physicians",
    licensedStatesCount: 28,
    quote: "Restoring vitality through exact, evidence-based therapeutic dosing.",
    bio: "Dr. Rivera is a practicing urologist with extensive clinical expertise in vascular erectile health and hormone optimization.",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop",
    boardCertification: "American Board of Urology (ABU)",
    yearsOfExperience: 14,
  },
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    credentials: "DO",
    role: "Director of Preventive Longevity",
    specialty: "Integrative Wellness & Primary Care",
    education: "Georgetown University Medical Center",
    licensedStatesCount: 24,
    quote: "Proactive titration and ongoing clinician guidance ensure lasting health.",
    bio: "Dr. Jenkins champions whole-person osteopathic medicine and lifestyle-integrated pharmacotherapy.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    boardCertification: "American Osteopathic Board of Internal Medicine (AOBIM)",
    yearsOfExperience: 11,
  },
];

const products = [
  {
    id: "semaglutide-b12",
    name: "Compounded Semaglutide + B12",
    category: "weight",
    activeIngredients: "Semaglutide + Cyanocobalamin (Vitamin B12)",
    deliveryMethod: "Once-Weekly Subcutaneous Micro-Injection",
    dosage: "Starting at 0.25mg titrated up to 2.5mg",
    clinicalProof: "Avg. 15% body weight reduction in landmark clinical trials",
    startingPrice: "$199",
    billingCadence: "per month, all-inclusive",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=900&auto=format&fit=crop",
    isPopular: true,
    description: "A customized formulation combining pharmaceutical-grade Semaglutide with Vitamin B12 to support metabolic energy while suppressing chronic appetite cravings.",
    benefits: ["Targets central nervous system hunger signals", "Slows gastric emptying for prolonged post-meal satiety"],
    mechanismOfAction: "Mimics natural glucagon-like peptide-1 (GLP-1), binding to satiety centers in the hypothalamus and optimizing postprandial insulin secretion.",
  },
  {
    id: "tirzepatide-dual",
    name: "Compounded Tirzepatide (Dual Incretin)",
    category: "weight",
    activeIngredients: "Tirzepatide + Pyridoxine (Vitamin B6)",
    deliveryMethod: "Once-Weekly Subcutaneous Injection",
    dosage: "Starting at 2.5mg titrated up to 15mg",
    clinicalProof: "Up to 20.9% average body weight loss in SURMOUNT trials",
    startingPrice: "$299",
    billingCadence: "per month, all-inclusive",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=900&auto=format&fit=crop",
    isPopular: false,
    description: "The premier next-generation dual incretin agonist targeting both GIP and GLP-1 receptors simultaneously for heightened metabolic response and fat oxidation.",
    benefits: ["Dual hormone pathway for deeper metabolic synergy", "Enhanced glycemic control and insulin sensitivity"],
    mechanismOfAction: "Simultaneously co-activates GIP and GLP-1 receptors, coordinating metabolic hormone pathways.",
  },
  {
    id: "dual-topical-hair",
    name: "Dual Topical Finasteride & Minoxidil",
    category: "hair",
    activeIngredients: "Finasteride 0.3% + Minoxidil 6% + Caffeine USP",
    deliveryMethod: "Direct Follicular Precision Dropper / Spray",
    dosage: "1 mL applied twice daily directly to thinning areas",
    clinicalProof: "88% stoppage of crown loss with negligible systemic absorption",
    startingPrice: "$45",
    billingCadence: "per month",
    image: "https://images.unsplash.com/photo-1608248597359-009587424683?q=80&w=900&auto=format&fit=crop",
    isPopular: true,
    description: "A targeted topical compounding that delivers clinical Finasteride directly to miniaturizing hair follicles while avoiding systemic serum DHT reduction.",
    benefits: ["Locally blocks DHT enzyme right at the dermal papilla", "Minoxidil dilates micro-capillaries to flood follicles with nutrients"],
    mechanismOfAction: "Inhibits type II 5-alpha reductase locally in the scalp while opening potassium channels to extend follicular anagen phase.",
  },
  {
    id: "oral-hair-capsule",
    name: "Oral Multi-Pathway Hair Density Formula",
    category: "hair",
    activeIngredients: "Oral Minoxidil 2.5mg + Biotin 5000mcg + Saw Palmetto",
    deliveryMethod: "Single Daily Oral Capsule",
    dosage: "1 capsule daily with water",
    clinicalProof: "94% user-reported improvement in overall hairline thickness",
    startingPrice: "$39",
    billingCadence: "per month",
    image: "https://images.unsplash.com/photo-1550572017-ed200f5e6343?q=80&w=900&auto=format&fit=crop",
    isPopular: false,
    description: "Convenient oral prescription combining low-dose micro-Minoxidil with botanical DHT regulators for individuals seeking complete coverage without topical application.",
    benefits: ["Effortless 5-second daily routine", "Provides uniform follicular stimulation across entire scalp & crown"],
    mechanismOfAction: "Systemically increases vascular perfusion to micro-follicles, revitalizing resting telogen hairs into active anagen growth cycles.",
  },
  {
    id: "tadalafil-odt",
    name: "Compounded Tadalafil Rapid-Dissolve (ODT)",
    category: "sexual",
    activeIngredients: "Tadalafil (5mg Daily or 20mg On-Demand) + L-Citrulline",
    deliveryMethod: "Sublingual Oral Disintegrating Tablet",
    dosage: "5mg once daily or 20mg 30 minutes before activity",
    clinicalProof: "Up to 36-hour clinical efficacy window with rapid sublingual onset",
    startingPrice: "$48",
    billingCadence: "per month (30-day supply)",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=900&auto=format&fit=crop",
    isPopular: true,
    description: "Fast-absorbing sublingual formulation that bypasses first-pass liver metabolism for rapid bioavailability and reliable performance.",
    benefits: ["Rapid absorption in 15–25 minutes", "Flexible 36-hour window allows natural, unpressured spontaneity"],
    mechanismOfAction: "Selective PDE-5 inhibitor preserving cyclic GMP levels, promoting smooth muscle relaxation and sustained arterial inflow.",
  },
  {
    id: "sildenafil-troche",
    name: "Compounded Sildenafil Quick-Action Troche",
    category: "sexual",
    activeIngredients: "Sildenafil Citrate 50mg or 100mg",
    deliveryMethod: "Dissolvable Sublingual Troche",
    dosage: "1 troche 15–30 minutes prior to intimacy",
    clinicalProof: "95% clinical response rate with faster onset than standard tablets",
    startingPrice: "$35",
    billingCadence: "per month (pack of 8–12)",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=900&auto=format&fit=crop",
    isPopular: false,
    description: "High-potency, on-demand compound engineered for immediate confidence and firm vascular responsiveness when peak timing matters most.",
    benefits: ["Rapid onset in as little as 15–30 minutes", "Sublingual delivery avoids delay caused by recent meals"],
    mechanismOfAction: "Potent competitive inhibitor of phosphodiesterase type 5 (PDE5), accelerating vascular nitric oxide signaling pathways.",
  },
];

const faqs = [
  { q: "How does an online consultation work?", a: "You complete a 5-minute medical questionnaire covering your health history, symptoms, and lifestyle. A board-certified US physician reviews your submission within 24 hours." },
  { q: "Are the medications real and FDA-approved?", a: "All prescribed treatments are reviewed by licensed clinicians and dispensed through licensed pharmacy partners where appropriate." },
  { q: "How discreet is the packaging?", a: "Your prescription arrives in plain, unbranded packaging designed to protect your privacy." },
  { q: "Do I need health insurance to use Suga.health?", a: "No insurance is required. The service is designed around transparent direct-pay care." },
  { q: "Can I message my physician if I have questions or side effects?", a: "Yes. Ongoing clinician communication is part of the care experience." },
];

type TimelineKey = keyof typeof timelines;
type Product = (typeof products)[number];
type Doctor = (typeof doctors)[number];

export default function HomePage() {
  const [timelineCategory, setTimelineCategory] = useState<TimelineKey>("weight");
  const [productCategory, setProductCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useRestoreReturnPosition();

  const visibleProducts = productCategory === "all" ? products : products.filter((product) => product.category === productCategory);

  return (
    <main className="legacy-public refined-home min-h-screen bg-[#FAFAFA] text-neutral-950 overflow-x-hidden">
      <header className="legacy-header fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex justify-between items-center">
          <Link href="/" className="flex flex-col items-start select-none shrink-0">
            <span className="font-sans text-xl sm:text-2xl tracking-tighter uppercase font-black text-neutral-950 leading-none">SUGA<span className="text-neutral-400">.</span>HEALTH</span>
            <span className="brand-tagline text-neutral-500 mt-0.5">live naturally</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-neutral-100/80 p-1.5 rounded-full border border-neutral-200/80">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 transition-all whitespace-nowrap">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link href="/sign-in" className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-neutral-950 mr-2">Sign In</Link>
            <Link href="/sign-up" onClick={rememberReturnPosition} className="hidden sm:inline-flex items-center justify-center bg-neutral-950 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white hover:bg-neutral-800 transition-all group">
              Start consultation <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="lg:hidden p-2 rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </div>
      </header>
      <MobilePublicMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="pt-[70px]">
        <section className="home-hero relative pb-10 sm:pb-14 md:pb-16 overflow-hidden bg-[#FAFAFA] border-b border-neutral-200/80">
          <div className="w-full bg-[#F5F5F5] py-3.5 overflow-hidden border-b border-neutral-200/80">
            <div className="animate-marquee items-center text-[11px] font-bold text-neutral-600 uppercase tracking-widest whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} aria-hidden={i > 0 ? true : undefined} className="flex items-center shrink-0">
                  <span className="px-6">Fully confidential</span><span className="text-neutral-300">✦</span>
                  <span className="px-6">Free and discrete shipping</span><span className="text-neutral-300">✦</span>
                  <span className="px-6">100% online process</span><span className="text-neutral-300">✦</span>
                  <span className="px-6">Used and trusted by millions around the world.</span><span className="text-neutral-300">✦</span>
                </span>
              ))}
            </div>
          </div>

          <div className="home-hero-composition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 md:pt-24 pb-8">
            <div className="flex flex-col items-center text-center">
              <h1 className="legacy-hero-title font-sans text-[20px] sm:text-4xl md:text-[2.5rem] lg:text-[2.75rem] tracking-tight text-neutral-900 leading-[1.4] text-balance max-w-2xl">
                Clinically proven, FDA (USA) approved,<br className="hidden sm:block" /> treatment prescribed by experts.
              </h1>
              <div className="hero-pathway-links flex flex-col items-center gap-3.5 w-full max-w-[280px] sm:max-w-[320px] mt-10 sm:mt-14">
                <Link href="/weight-loss" className="legacy-pill-link">Medical weight loss</Link>
                <Link href="/hair-growth" className="legacy-pill-link">Hair growth</Link>
                <Link href="/sexual-health" className="legacy-pill-link">Sexual health</Link>
                <Link href="/sign-up" onClick={rememberReturnPosition} className="w-full inline-flex items-center justify-center bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-4 rounded-[2rem] text-[15px] font-medium transition-colors mt-3 shadow-sm">Start consultation</Link>
              </div>
            </div>
            <div className="home-hero-image"><PublicImage src={pillars[0].img} srcSet={imageSources(pillars[0].img)} sizes="(max-width: 640px) 100vw, 50vw" alt="" fetchPriority="high" width={720} height={860} /></div>
          </div>
        </section>

        <section id="treatments" className="home-pathways py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <SectionHeader eyebrow="Targeted Therapeutics" title="Focused Clinical Pathways" subtitle="Precision treatment protocols designed for sustained biological optimization." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {pillars.map((pillar) => (
              <article key={pillar.id} className="group relative bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950 transition-colors duration-300 flex flex-col overflow-hidden">
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-neutral-100">
                  <PublicImage loading="lazy" decoding="async" src={pillar.img} srcSet={imageSources(pillar.img)} sizes="(max-width: 640px) 100vw, 50vw" width={720} height={600} alt={pillar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs uppercase tracking-widest text-neutral-300 font-semibold block mb-0.5">{pillar.subtitle}</span>
                    <h3 className="font-sans text-2xl font-bold tracking-tight text-white">{pillar.title}</h3>
                  </div>
                </div>
                <div className="p-5 sm:p-7 md:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-5 sm:mb-6">{pillar.desc}</p>
                    <div className="grid grid-cols-2 gap-2 mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                      <div><span className="legacy-label">Efficacy Rate</span><span className="text-xs font-bold text-neutral-900">{pillar.stats}</span></div>
                      <div><span className="legacy-label">Expect Results</span><span className="text-xs font-bold text-neutral-900">{pillar.timeline}</span></div>
                    </div>
                    <div className="space-y-2.5 mb-6">
                      {pillar.highlights.map((item) => <div key={item} className="flex items-start gap-2.5 text-xs text-neutral-700"><span className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"><Check size={11} /></span><span className="font-medium">{item}</span></div>)}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <Link href={pillar.path} className="inline-flex items-center text-xs font-bold tracking-wider uppercase">View Protocol Details <ArrowRight size={14} className="ml-1.5" /></Link>
                    <Link href="/sign-up" onClick={rememberReturnPosition} className="p-2.5 rounded-full bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white transition-colors" aria-label="Start consultation"><ArrowUpRight size={15} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-progression py-10 sm:py-12 lg:py-16 bg-white border-y border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Clinical Progression" title="Clear Milestones from Day 1" subtitle="Expect real, measurable physiological changes with continuous medical guidance.">
              <div className="flex flex-wrap justify-center gap-1.5 p-1.5 bg-neutral-100 rounded-2xl sm:rounded-full mt-6 sm:mt-8 border border-neutral-200">
                {([["weight","Weight Loss (GLP-1)"],["hair","Hair Regrowth"],["sexual","Sexual Vitality"]] as const).map(([key,label]) => (
                  <button key={key} type="button" aria-pressed={timelineCategory === key} onClick={() => setTimelineCategory(key)} className={timelineCategory === key ? "legacy-toggle legacy-toggle-active" : "legacy-toggle"}>{label}</button>
                ))}
              </div>
            </SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {timelines[timelineCategory].map((step, idx) => (
                <article key={step.phase} className="group bg-neutral-50/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 hover:bg-white hover:border-neutral-950 transition-all">
                  <div className="flex items-center justify-between mb-6"><span className="px-3 py-1 rounded-full bg-neutral-950 text-white text-xs font-bold tracking-wider uppercase">{step.phase}</span><span className="text-xs font-bold text-neutral-400">Step 0{idx + 1}</span></div>
                  <h3 className="font-sans text-xl font-bold text-neutral-950 mb-3 tracking-tight">{step.label}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{step.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 sm:mt-10 text-center"><Link href="/sign-up" onClick={rememberReturnPosition} className="legacy-dark-cta">See if you qualify today <ArrowRight size={14} className="ml-2" /></Link></div>
          </div>
        </section>

        <section className="home-process py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader eyebrow="Intake Protocol" title="Clear. Fast. Confidential." subtitle="A frictionless medical pathway designed for immediate evaluation and discreet doorstep delivery." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {howItWorks.map((item, idx) => (
              <article key={item.step} className="group rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 lg:p-10 border border-neutral-200/90 hover:border-neutral-950 transition-colors">
                <div className="flex items-center justify-between mb-6 sm:mb-8"><span className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white">{idx === 0 ? <Activity size={24} /> : idx === 1 ? <ShieldCheck size={24} /> : <Truck size={24} />}</span><span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full uppercase tracking-wider">{item.time}</span></div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">Step {item.step}</span>
                <h3 className="font-sans text-2xl font-bold text-neutral-950 mb-3 tracking-tight">{item.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-metrics py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader eyebrow="Clinical Standards" title="Metrics that matter." />
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            {metrics.map((metric) => <article key={metric.title} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950"><span className="font-sans text-4xl sm:text-5xl font-extrabold text-neutral-950 block mb-2">{metric.value}</span><span className="text-xs font-bold uppercase tracking-widest block mb-2">{metric.title}</span><p className="text-xs text-neutral-500">{metric.desc}</p></article>)}
          </div>
        </section>

        <section className="home-comparison py-10 sm:py-12 lg:py-16 bg-neutral-950 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader dark eyebrow="The Difference" title="The Suga Standard vs Traditional Healthcare" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <article className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-neutral-900 border border-neutral-800"><span className="legacy-label text-neutral-400 mb-4">Traditional System</span><ul className="space-y-3.5 text-sm text-neutral-400">{traditional.map((point) => <li key={point} className="flex items-start gap-3"><span className="text-neutral-600 font-bold">✕</span><span>{point}</span></li>)}</ul></article>
              <article className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-white text-neutral-950 border border-neutral-200"><span className="legacy-label text-neutral-500 mb-4">The Suga Model</span><ul className="space-y-3.5 text-sm">{sugaModel.map((point) => <li key={point} className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</span><span className="font-medium">{point}</span></li>)}</ul></article>
            </div>
          </div>
        </section>

        <section id="doctors" className="home-doctors py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader eyebrow="Medical Leadership & Care Team" title="Board-certified doctors behind every prescription." subtitle="No bots, no algorithmic shortcuts. Licensed US physicians personally evaluate every intake, design individualized treatment plans, and support you throughout your care." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {doctors.map((doctor) => (
              <article key={doctor.id} className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950 transition-all flex flex-col overflow-hidden shadow-sm">
                <div className="relative h-64 sm:h-72 bg-neutral-100 overflow-hidden">
                  <PublicImage loading="lazy" decoding="async" src={doctor.image} srcSet={imageSources(doctor.image)} sizes="(max-width: 640px) 100vw, (max-width: 1150px) 50vw, 25vw" width={480} height={640} alt={doctor.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wider"><ShieldCheck size={12} />Verified MD/DO</span>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white"><h3 className="font-sans text-xl font-bold text-white">{doctor.name}</h3><span className="text-xs font-semibold text-neutral-300">{doctor.credentials} • {doctor.role}</span></div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                  <div><span className="inline-block text-[11px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md mb-3">{doctor.specialty}</span><div className="space-y-2 mb-4 text-xs text-neutral-600"><div className="flex items-start gap-2"><GraduationCap size={14} className="mt-0.5" /><span className="font-medium">{doctor.education}</span></div><div className="flex items-start gap-2"><MapPin size={14} /><span>Licensed in {doctor.licensedStatesCount} States</span></div></div><p className="text-xs italic text-neutral-500 border-l-2 border-neutral-200 pl-3 hidden sm:block">“{doctor.quote}”</p></div>
                  <div className="pt-3 mt-4 border-t border-neutral-100"><button type="button" onClick={() => setSelectedDoctor(doctor)} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-950 text-xs font-bold uppercase tracking-wider"><Award size={13} />View Credentials</button></div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 lg:mt-14 rounded-2xl sm:rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
              <div className="text-center lg:text-left max-w-2xl"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold mb-4"><HeartHandshake size={14} /><span>Direct Doctor Access Included</span></div><h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Care that feels personal.<br /><span className="text-neutral-300 font-medium">Guidance from real doctors, with someone you can reach whenever you need.</span></h3><p className="mt-3 text-xs sm:text-sm text-neutral-400">Your care doesn’t stop with a prescription. Message your clinician directly, request dosage adjustments, and receive periodic medical check-ins at zero added charge.</p></div>
              <Link href="/sign-up" onClick={rememberReturnPosition} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-neutral-950 text-xs font-bold uppercase tracking-wider">Meet Your Doctor <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section id="products" className="home-formulary py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader eyebrow="Prescription Formulary" title="Targeted therapies compounded for maximum bioavailability." subtitle="Doctor-formulated treatments with pure active pharmaceutical ingredients, prepared exclusively in state-licensed 503A/503B pharmacies.">
            <div className="mt-7 sm:mt-8 flex justify-center">
              <div className="flex flex-wrap justify-center p-1.5 bg-neutral-100 rounded-2xl sm:rounded-full border border-neutral-200 gap-1">
                {([["all","All Formulations"],["weight","Weight Loss"],["hair","Hair Growth"],["sexual","Sexual Health"]] as const).map(([key,label]) => <button key={key} type="button" aria-pressed={productCategory === key} onClick={() => setProductCategory(key)} className={productCategory === key ? "legacy-toggle legacy-toggle-active" : "legacy-toggle"}>{label}</button>)}
              </div>
            </div>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-950 transition-all flex flex-col overflow-hidden shadow-sm">
                <div className="relative h-60 sm:h-64 bg-neutral-100 overflow-hidden">
                  <PublicImage loading="lazy" decoding="async" src={product.image} srcSet={imageSources(product.image)} sizes="(max-width: 640px) 100vw, 210px" width={480} height={640} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between"><span className="px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wider">{product.category === "weight" ? "Metabolic GLP-1" : product.category === "hair" ? "Trichology Formula" : "Endocrine / Vascular"}</span>{product.isPopular && <span className="px-2.5 py-1 rounded-full bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles size={10} />Most Prescribed</span>}</div>
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white flex items-center gap-1.5 text-[11px] font-semibold"><Layers size={12} /><span className="truncate">{product.deliveryMethod}</span></div>
                </div>
                <div className="p-5 sm:p-6 lg:p-7 flex flex-col flex-grow justify-between">
                  <div><h3 className="font-sans text-lg sm:text-xl font-bold text-neutral-950 tracking-tight">{product.name}</h3><p className="mt-1 text-xs font-semibold text-neutral-500 font-mono line-clamp-1">{product.activeIngredients}</p><div className="my-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80"><div className="flex items-start gap-2"><span className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5"><Check size={10} /></span><span className="text-xs font-semibold text-neutral-800">{product.clinicalProof}</span></div></div></div>
                  <div className="pt-4 border-t border-neutral-100"><div className="flex items-baseline gap-1.5"><span className="text-xs text-neutral-500">From</span><span className="font-sans text-2xl sm:text-3xl font-black">{product.startingPrice}</span><span className="text-xs text-neutral-500">/mo</span></div><div className="mt-2.5 mb-4 inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold bg-neutral-100 px-2.5 py-1 rounded-full"><Truck size={12} />Free 2-Day Ship</div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setSelectedProduct(product)} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-950 text-xs font-bold uppercase tracking-wider"><Info size={13} />Details</button><Link href="/sign-up" onClick={rememberReturnPosition} className="inline-flex items-center justify-center gap-1 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider">Get Started <ArrowRight size={13} /></Link></div></div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-neutral-500"><div className="flex items-center gap-2"><ShieldCheck size={16} /><span>All prescription treatments require online clinical evaluation and doctor approval.</span></div><div className="flex flex-wrap justify-center gap-4 text-neutral-700 font-medium"><span>✓ 100% US Licensed Pharmacies</span><span>✓ Authentic Ingredients</span><span>✓ Discreet Packaging</span></div></div>
        </section>

        <section className="home-faq py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <SectionHeader eyebrow="Patient Education" title="Common Questions" subtitle="Straightforward answers about our clinical protocols and prescription process." />
          <div className="space-y-3">{faqs.map((faq) => <details key={faq.q} className="group rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-950 overflow-hidden"><summary className="list-none cursor-pointer p-5 sm:p-6 flex items-center justify-between gap-4 font-sans font-bold text-base sm:text-lg"><span>{faq.q}</span><ChevronDown size={18} className="transition-transform group-open:rotate-180" /></summary><div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">{faq.a}</div></details>)}</div>
        </section>

        <section className="home-final-cta py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-neutral-950 text-white p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl"><span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-2 sm:mb-3">Take the first step</span><h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">Your personalized medical plan is 5 minutes away.</h2><p className="text-neutral-400 text-base sm:text-lg">Answer quick medical questions. A licensed clinician will review your file and tailor your prescription.</p></div>
            <Link href="/sign-up" onClick={rememberReturnPosition} className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-neutral-950 px-8 py-4 rounded-full text-sm font-bold tracking-wider uppercase">Start Free Assessment <ArrowRight size={16} className="ml-2.5" /></Link>
          </div>
        </section>
      </div>

      <footer className="bg-neutral-950 text-neutral-300 py-12 md:py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-12">
            <div className="md:col-span-6"><Link href="/" className="flex flex-col items-start mb-6"><span className="font-sans text-2xl tracking-tighter uppercase font-black text-white">SUGA<span className="text-neutral-500">.</span>HEALTH</span><span className="brand-tagline text-neutral-400 mt-0.5">live naturally</span></Link><p className="text-neutral-400 max-w-md text-sm leading-relaxed">Confidential, doctor-guided treatments for medical weight loss, hair restoration, and sexual vitality. Real treatments delivered with care and complete privacy.</p></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Clinical Treatments</h4><ul className="space-y-3 text-sm text-neutral-400"><li><Link href="/weight-loss">Medical Weight Loss (GLP-1)</Link></li><li><Link href="/hair-growth">Hair Regrowth & Density</Link></li><li><Link href="/sexual-health">Sexual Health & Performance</Link></li><li><Link href="/sign-up" onClick={rememberReturnPosition}>Start Online Consultation</Link></li></ul></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Medical Practice</h4><ul className="space-y-3 text-sm text-neutral-400"><li><a href="#doctors">Our Doctors & Medical Board</a></li><li><a href="#products">Our Products & Formulary</a></li><li><Link href="/about">About Our Clinical Mission</Link></li><li><Link href="/sign-up" onClick={rememberReturnPosition}>Patient Medical Intake</Link></li></ul></div>
          </div>
          <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 space-y-2"><p>Suga.Health facilitates telehealth consultations through licensed medical professionals. Prescription products require an online evaluation with a licensed healthcare provider.</p><p>For emergencies, contact local emergency services.</p><p>© {new Date().getFullYear()} Suga.Health. All rights reserved.</p></div>
        </div>
      </footer>

      {selectedDoctor && <Modal label={selectedDoctor.name} onClose={() => setSelectedDoctor(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white flex items-center gap-4"><PublicImage loading="lazy" decoding="async" src={selectedDoctor.image} alt={selectedDoctor.name} className="w-20 h-20 rounded-2xl object-cover object-top" /><div><span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Board-Certified Clinician</span><h3 className="font-sans text-2xl font-extrabold text-white">{selectedDoctor.name}, {selectedDoctor.credentials}</h3><p className="text-xs text-neutral-300">{selectedDoctor.role}</p></div></div>
        <div className="p-5 sm:p-7 space-y-5"><div><span className="legacy-label">Clinical Specialty</span><p className="text-sm text-neutral-700">{selectedDoctor.specialty}</p></div><div><span className="legacy-label">Board Certification</span><p className="text-sm text-neutral-700">{selectedDoctor.boardCertification}</p></div><div><span className="legacy-label">Education</span><p className="text-sm text-neutral-700">{selectedDoctor.education}</p></div><div><span className="legacy-label">About</span><p className="text-sm text-neutral-700">{selectedDoctor.bio}</p></div><div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{selectedDoctor.yearsOfExperience} years clinical practice</div></div>
      </Modal>}

      {selectedProduct && <Modal label={selectedProduct.name} onClose={() => setSelectedProduct(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white"><span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Prescription Specification</span><h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-white">{selectedProduct.name}</h3><p className="text-xs text-neutral-300 font-mono mt-1">Active Ingredients: {selectedProduct.activeIngredients}</p></div>
        <div className="p-5 sm:p-7 space-y-5"><div><span className="legacy-label">Formulation Overview</span><p className="text-sm text-neutral-700">{selectedProduct.description}</p></div><div className="grid sm:grid-cols-2 gap-3"><div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200"><span className="legacy-label">Administration Method</span><p className="text-xs font-bold text-neutral-900">{selectedProduct.deliveryMethod}</p></div><div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200"><span className="legacy-label">Typical Dosage Range</span><p className="text-xs font-bold text-neutral-900">{selectedProduct.dosage}</p></div></div><div><span className="legacy-label">Mechanism of Action</span><p className="text-sm text-neutral-700">{selectedProduct.mechanismOfAction}</p></div><div><span className="legacy-label">Clinical Benefits & Outcomes</span><div className="grid sm:grid-cols-2 gap-2 mt-2">{selectedProduct.benefits.map((benefit) => <div key={benefit} className="flex gap-2 text-xs text-neutral-700"><Check size={13} className="shrink-0 mt-0.5" />{benefit}</div>)}</div></div></div>
        <div className="p-5 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between"><div><span className="text-[11px] text-neutral-500">All-inclusive pricing</span><div className="font-sans text-2xl font-extrabold">{selectedProduct.startingPrice} <span className="text-xs font-medium text-neutral-500">{selectedProduct.billingCadence}</span></div></div><Link href="/sign-up" onClick={rememberReturnPosition} className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider">Check Eligibility <ArrowRight size={14} /></Link></div>
      </Modal>}
    </main>
  );
}

function SectionHeader({ eyebrow, title, subtitle, children, dark = false }: { eyebrow: string; title: string; subtitle?: string; children?: React.ReactNode; dark?: boolean }) {
  return <div className="editorial-section-heading text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center"><span className={"text-xs font-bold tracking-widest uppercase block mb-2.5 " + (dark ? "text-neutral-400" : "text-neutral-500")}>{eyebrow}</span><h2 className={"font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance " + (dark ? "text-white" : "text-neutral-950")}>{title}</h2>{subtitle && <p className={"mt-3.5 sm:mt-4 text-sm sm:text-base max-w-2xl leading-relaxed " + (dark ? "text-neutral-400" : "text-neutral-600")}>{subtitle}</p>}{children}</div>;
}

function Modal({ children, label, onClose }: { children: React.ReactNode; label: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} className="clinical-dialog" aria-label={label} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="clinical-dialog-content"><button type="button" onClick={onClose} aria-label="Close modal" className="clinical-dialog-close"><X size={20} /></button>{children}</div></dialog>;
}

function imageSources(source: string) {
  return [400, 800, 1200].map((width) => `${source.replace(/w=\d+/, `w=${width}`)} ${width}w`).join(", ");
}
