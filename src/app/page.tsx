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
  ChevronLeft,
  ChevronRight,
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

const heroSlides = pillars.map((pillar) => ({
  src: pillar.img,
  label: pillar.title,
  caption: pillar.subtitle,
}));

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
  { step: "03", title: "Discrete Delivery", time: "2-Day Doorstep", desc: "Medications ship free from a licensed US pharmacy in unbranded packaging, with continuous access to your care team for refills." },
];

const metrics = [
  { target: 5, suffix: " MINUTES", title: "Intake Time", desc: "Thoughtful and comprehensive online questions" },
  { target: 24, prefix: "< ", suffix: " HOURS", title: "Doctor Review", desc: "Fast evaluation by board-certified physicians" },
  { target: 100, suffix: "%", title: "Human Doctors", desc: "Every single chart is reviewed by real clinicians" },
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

const customerVoices = [
  {
    id: "priya-chennai",
    quote: "For the first time, I didn't feel rushed explaining what I was going through.",
    name: "Priya",
    age: 32,
    city: "Chennai",
    journey: "Weight care patient",
  },
  {
    id: "arun-coimbatore",
    quote: "I had questions after my consultation. Being able to message my doctor made the biggest difference.",
    name: "Arun",
    age: 41,
    city: "Coimbatore",
    journey: "Ongoing care patient",
  },
];

const voiceCities = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode", "Puducherry"];

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
  const [heroSlide, setHeroSlide] = useState(0);
  const [voiceIndex, setVoiceIndex] = useState(0);
  useRestoreReturnPosition();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4600);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setVoiceIndex((current) => (current + 1) % customerVoices.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

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
            <Link href="/sign-up" onClick={rememberReturnPosition} className="start-consultation-swipe hidden sm:inline-flex items-center justify-center bg-neutral-950 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white group">
              <span>Start consultation</span><ArrowRight size={14} className="ml-2" />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="lg:hidden p-2 rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </div>
      </header>
      <MobilePublicMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="pt-[70px]">
        <section className="home-hero bg-[#FAFAFA] border-b border-neutral-200/80">
          <div className="home-trust-ticker" aria-label="Suga Health service highlights">
            <div className="animate-marquee">
              {[0, 1].map((group) => (
                <span key={group} aria-hidden={group === 1 ? true : undefined} className="home-ticker-sequence">
                  <span>Fully confidential</span><b>✦</b>
                  <span>Free and discrete shipping</span><b>✦</b>
                  <span>100% online process</span><b>✦</b>
                  <span>Used and trusted by millions around the world.</span><b>✦</b>
                </span>
              ))}
            </div>
          </div>

          <div className="home-hero-composition">
            <div className="hero-intro-grid">
              <div className="hero-intro-copy">
                <span className="home-kicker">Private care. Real clinicians. Your pace.</span>
                <h1 className="legacy-hero-title">
                  Clinically proven, FDA (USA) approved, treatment prescribed by experts.
                </h1>
              </div>

              <div className="hero-action-grid" aria-label="Explore Suga Health care">
                <Link href="/weight-loss" className="home-action-pill">Medical weight loss <ArrowUpRight size={15} /></Link>
                <Link href="/hair-growth" className="home-action-pill">Hair growth <ArrowUpRight size={15} /></Link>
                <Link href="/sexual-health" className="home-action-pill">Sexual health <ArrowUpRight size={15} /></Link>
                <Link href="/sign-up" onClick={rememberReturnPosition} className="home-action-pill home-action-primary start-consultation-swipe"><span>Start consultation</span><ArrowRight size={15} /></Link>
              </div>
            </div>

            <div className="hero-bento hero-bento-ro" aria-label="Suga Health care and treatment imagery">
              <div className="hero-bento-primary">
                <PublicImage
                  key={heroSlides[heroSlide].src}
                  src={heroSlides[heroSlide].src}
                  srcSet={imageSources(heroSlides[heroSlide].src)}
                  sizes="(max-width: 820px) 100vw, 50vw"
                  alt={heroSlides[heroSlide].label}
                  fetchPriority="high"
                  width={1200}
                  height={760}
                  className="hero-bento-slide-image"
                />
                <div className="hero-bento-caption">
                  <span>{heroSlides[heroSlide].caption}</span>
                  <strong>{heroSlides[heroSlide].label}</strong>
                </div>
                <div className="hero-bento-controls">
                  <button type="button" aria-label="Previous image" onClick={() => setHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft size={18} /></button>
                  <div className="hero-bento-dots" aria-hidden="true">
                    {heroSlides.map((slide, index) => <span key={slide.label} className={heroSlide === index ? "active" : ""} />)}
                  </div>
                  <button type="button" aria-label="Next image" onClick={() => setHeroSlide((current) => (current + 1) % heroSlides.length)}><ChevronRight size={18} /></button>
                </div>
              </div>

              <button type="button" className="hero-bento-support" onClick={() => setSelectedDoctor(doctors[0])} aria-label={"View credentials for " + doctors[0].name}>
                <PublicImage src={doctors[0].image} srcSet={imageSources(doctors[0].image)} sizes="(max-width: 820px) 50vw, 50vw" alt={doctors[0].name} width={760} height={960} />
                <div>
                  <span>Doctor-led from intake to follow-up</span>
                  <strong>{doctors[0].name}, {doctors[0].credentials}</strong>
                </div>
              </button>

              <button type="button" className="hero-bento-small hero-bento-small-one" onClick={() => setSelectedProduct(products[0])} aria-label={"View " + products[0].name}>
                <PublicImage src={products[0].image} srcSet={imageSources(products[0].image)} sizes="(max-width: 820px) 50vw, 25vw" alt={products[0].name} width={520} height={420} />
                <span>Metabolic care</span>
                <strong>{products[0].name}</strong>
              </button>

              <button type="button" className="hero-bento-small hero-bento-small-two" onClick={() => setSelectedProduct(products[4])} aria-label={"View " + products[4].name}>
                <PublicImage src={products[4].image} srcSet={imageSources(products[4].image)} sizes="(max-width: 820px) 50vw, 25vw" alt={products[4].name} width={520} height={420} />
                <span>Private care</span>
                <strong>{products[4].name}</strong>
              </button>
            </div>
          </div>
        </section>

        <section id="treatments" className="home-pathways home-editorial-section">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Targeted Therapeutics" title="Focused Clinical Pathways" subtitle="Precision treatment protocols designed for sustained biological optimization." />
            <div className="pathway-editorial-list">
              {pillars.map((pillar, idx) => (
                <article key={pillar.id} className="pathway-editorial-row">
                  <div className="pathway-editorial-image">
                    <PublicImage loading="lazy" decoding="async" src={pillar.img} srcSet={imageSources(pillar.img)} sizes="(max-width: 820px) 100vw, 44vw" width={900} height={680} alt={pillar.title} />
                    <span>0{idx + 1}</span>
                  </div>
                  <div className="pathway-editorial-copy">
                    <span className="home-kicker">{pillar.subtitle}</span>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.desc}</p>
                    <div className="pathway-proof-row">
                      <div><span>Efficacy</span><strong>{pillar.stats}</strong></div>
                      <div><span>Expected results</span><strong>{pillar.timeline}</strong></div>
                    </div>
                    <div className="pathway-highlight-list">
                      {pillar.highlights.map((item) => <span key={item}><Check size={14} />{item}</span>)}
                    </div>
                    <div className="pathway-actions">
                      <Link href={pillar.path}>View protocol <ArrowRight size={14} /></Link>
                      <Link href="/sign-up" onClick={rememberReturnPosition} className="start-consultation-swipe"><span>Start consultation</span><ArrowUpRight size={14} /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-progression home-editorial-section bg-white">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Clinical Progression" title="Clear Milestones from Day 1" subtitle="Expect real, measurable physiological changes with continuous medical guidance.">
              <div className="home-toggle-rail">
                {([["weight","Weight Loss (GLP-1)"],["hair","Hair Regrowth"],["sexual","Sexual Vitality"]] as const).map(([key,label]) => (
                  <button key={key} type="button" aria-pressed={timelineCategory === key} onClick={() => setTimelineCategory(key)} className={timelineCategory === key ? "legacy-toggle legacy-toggle-active" : "legacy-toggle"}>{label}</button>
                ))}
              </div>
            </SectionHeader>
            <div className="progression-line">
              {timelines[timelineCategory].map((step, idx) => (
                <article key={step.phase} className="progression-step">
                  <div className="progression-step-head">
                    <span className="progression-phase">{step.phase}</span>
                    <span className="progression-index">Step 0{idx + 1}</span>
                  </div>
                  <h3>{step.label}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
            <div className="home-centered-action"><Link href="/sign-up" onClick={rememberReturnPosition} className="legacy-dark-cta">See if you qualify today <ArrowRight size={14} /></Link></div>
          </div>
        </section>

        <section className="home-process home-editorial-section">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Intake Protocol" title="Clear. Fast. Confidential." subtitle="A frictionless medical pathway designed for immediate evaluation and discrete doorstep delivery." />
            <div className="process-track">
              {howItWorks.map((item, idx) => (
                <article key={item.step} className="process-step">
                  <div className="process-card-head">
                    <div className="process-step-icon">{idx === 0 ? <Activity size={21} /> : idx === 1 ? <ShieldCheck size={21} /> : <Truck size={21} />}</div>
                    <span className="process-time">{item.time}</span>
                  </div>
                  <div className="process-step-copy">
                    <span>Step {item.step}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-metrics home-editorial-section">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Clinical Standards" title="Metrics that matter." />
            <div className="metric-ledger">
              {metrics.map((metric) => (
                <article key={metric.title}>
                  <CountUp target={metric.target} prefix={metric.prefix} suffix={metric.suffix} />
                  <div><span>{metric.title}</span><p>{metric.desc}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-comparison home-editorial-section bg-neutral-950 text-white">
          <div className="home-section-shell">
            <SectionHeader dark eyebrow="The Difference" title="The Suga Standard vs Traditional Healthcare" />
            <div className="comparison-editorial">
              <div className="comparison-column comparison-traditional">
                <span className="home-kicker">Traditional System</span>
                {traditional.map((point, index) => <div key={point} className="comparison-row"><b>0{index + 1}</b><p>{point}</p></div>)}
              </div>
              <div className="comparison-column comparison-suga">
                <span className="home-kicker">The Suga Model</span>
                {sugaModel.map((point, index) => <div key={point} className="comparison-row"><b><Check size={14} /></b><p>{point}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="doctors" className="home-doctors home-editorial-section">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Medical Leadership & Care Team" title="Board-certified doctors behind every prescription." subtitle="No bots, no algorithmic shortcuts. Licensed US physicians personally evaluate every intake, design individualized treatment plans, and support you throughout your care." />

            <div className="doctor-card-grid">
              {doctors.map((doctor) => (
                <article key={doctor.id} className="doctor-card">
                  <div className="doctor-card-image">
                    <PublicImage
                      loading="lazy"
                      decoding="async"
                      src={doctor.image}
                      srcSet={imageSources(doctor.image)}
                      sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
                      width={760}
                      height={620}
                      alt={doctor.name}
                    />
                    <span className="doctor-verified"><ShieldCheck size={13} /> Verified MD/DO</span>
                  </div>

                  <div className="doctor-card-body">
                    <span className="doctor-role">{doctor.role}</span>
                    <h3>{doctor.name}, {doctor.credentials}</h3>
                    <p className="doctor-specialty">{doctor.specialty}</p>
                    <p className="doctor-quote">“{doctor.quote}”</p>

                    <div className="doctor-card-facts">
                      <span><GraduationCap size={15} />{doctor.education}</span>
                      <span><MapPin size={15} />Licensed in {doctor.licensedStatesCount} States</span>
                    </div>

                    <button type="button" className="doctor-credentials-button" onClick={() => setSelectedDoctor(doctor)}>
                      View credentials <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="doctor-trust-band">
              <div>
                <span><HeartHandshake size={16} /> Direct clinician access included</span>
                <h3>Real doctors. Direct access. Care built around you.</h3>
                <p>Your consultation is reviewed by a licensed clinician, with ongoing support throughout your care.</p>
              </div>
              <Link href="/sign-up" onClick={rememberReturnPosition} className="start-consultation-swipe">
                <span>Start consultation</span><ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="home-voices home-editorial-section" aria-labelledby="voices-title">
          <div className="home-section-shell">
            <div className="voices-heading">
              <span className="home-kicker">Voice of Our Customers</span>
              <h2 id="voices-title">Voices, not testimonials.</h2>
              <p>Short moments from patients describing what care felt like—not a wall of reviews.</p>
            </div>

            <div className="voices-stage">
              <div className="voices-story" key={customerVoices[voiceIndex].id}>
                <span className="voices-quote-mark" aria-hidden="true">“</span>
                <blockquote>{customerVoices[voiceIndex].quote}</blockquote>
                <div className="voices-person">
                  <strong>{customerVoices[voiceIndex].name}, {customerVoices[voiceIndex].age} · {customerVoices[voiceIndex].city}</strong>
                  <span>{customerVoices[voiceIndex].journey}</span>
                </div>
              </div>

              <div className="voices-wave-panel" aria-label="Abstract voice waveform visualization">
                <div className="voices-wave" aria-hidden="true">
                  {[34, 56, 42, 74, 52, 88, 61, 47, 79, 58, 92, 66, 49, 73, 55, 84, 63, 45, 70, 39].map((height, index) => (
                    <span key={index} style={{ "--voice-height": `${height}%`, "--voice-delay": `${index * 55}ms` } as React.CSSProperties} />
                  ))}
                </div>
                <div className="voices-wave-caption">
                  <span>Patient voice</span>
                  <strong>{customerVoices[voiceIndex].city}</strong>
                </div>
              </div>
            </div>

            <div className="voice-trail" aria-label="Patient voice trail across cities">
              <div className="voice-trail-line" aria-hidden="true">
                <span
                  className="voice-trail-indicator"
                  style={{ "--voice-city-index": voiceCities.indexOf(customerVoices[voiceIndex].city) } as React.CSSProperties}
                />
              </div>
              <div className="voice-trail-cities">
                {voiceCities.map((city) => (
                  <span key={city} className={city === customerVoices[voiceIndex].city ? "active" : ""}>{city}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="home-formulary home-editorial-section bg-white">
          <div className="home-section-shell">
            <SectionHeader eyebrow="Prescription Formulary" title="Targeted therapies compounded for maximum bioavailability." subtitle="Doctor-formulated treatments with pure active pharmaceutical ingredients, prepared exclusively in state-licensed 503A/503B pharmacies.">
              <div className="product-filter-bar" role="group" aria-label="Filter prescription formulary">
                {([["all","All Formulations"],["weight","Weight Loss"],["hair","Hair Growth"],["sexual","Sexual Health"]] as const).map(([key,label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={productCategory === key}
                    onClick={() => setProductCategory(key)}
                    className={productCategory === key ? "product-filter active" : "product-filter"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SectionHeader>

            <div className="product-card-grid">
              {visibleProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-card-image">
                    <PublicImage
                      loading="lazy"
                      decoding="async"
                      src={product.image}
                      srcSet={imageSources(product.image)}
                      sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
                      width={720}
                      height={560}
                      alt={product.name}
                    />
                    {product.isPopular && <span className="product-popular"><Sparkles size={11} />Most prescribed</span>}
                  </div>

                  <div className="product-card-body">
                    <span className="product-category">{product.category === "weight" ? "Metabolic GLP-1" : product.category === "hair" ? "Trichology Formula" : "Endocrine / Vascular"}</span>
                    <h3>{product.name}</h3>
                    <p className="product-ingredients">{product.activeIngredients}</p>

                    <div className="product-clinical-reference">
                      <span>Clinical reference</span>
                      <p>{product.clinicalProof}</p>
                    </div>

                    <div className="product-card-bottom">
                      <div className="product-card-price">
                        <span>From</span>
                        <strong>{product.startingPrice}<small>/mo</small></strong>
                        <em><Truck size={13} />Free 2-Day Ship</em>
                      </div>
                      <div className="product-card-actions">
                        <button type="button" onClick={() => setSelectedProduct(product)}>Details <Info size={14} /></button>
                        <Link href="/sign-up" onClick={rememberReturnPosition}>Get started <ArrowRight size={14} /></Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="formulary-assurance">
              <span><ShieldCheck size={16} />All prescription treatments require online clinical evaluation and doctor approval.</span>
              <div><b>100% US Licensed Pharmacies</b><b>Authentic Ingredients</b><b>Discrete Packaging</b></div>
            </div>
          </div>
        </section>

        <section className="home-faq home-editorial-section">
          <div className="home-section-shell home-faq-shell">
            <SectionHeader eyebrow="Patient Education" title="Common Questions" subtitle="Straightforward answers about our clinical protocols and prescription process." />
            <div className="faq-editorial-list">
              {faqs.map((faq, index) => (
                <details key={faq.q}>
                  <summary><span>0{index + 1}</span><strong>{faq.q}</strong><ChevronDown size={18} /></summary>
                  <div>{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="home-final-cta-inner">
            <span className="home-kicker">Take the first step</span>
            <div>
              <h2>Your personalized medical plan is 5 minutes away.</h2>
              <p>Answer quick medical questions. A licensed clinician will review your file and tailor your prescription.</p>
            </div>
            <Link href="/sign-up" onClick={rememberReturnPosition}>Start Free Assessment <ArrowRight size={16} /></Link>
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

function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    let started = false;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / 1050, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          frame = window.requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [target]);

  return <span ref={ref} className="metric-count"><span className="metric-count-value">{prefix}{value}</span><span className="metric-count-unit">{suffix}</span></span>;
}

function SectionHeader({ eyebrow, title, subtitle, children, dark = false }: { eyebrow: string; title: string; subtitle?: string; children?: React.ReactNode; dark?: boolean }) {
  return <div className="editorial-section-heading text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center"><span className={"text-xs font-bold tracking-widest uppercase block mb-2.5 " + (dark ? "text-neutral-400" : "text-neutral-500")}>{eyebrow}</span><h2 className={"font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance " + (dark ? "text-white" : "text-neutral-950")}>{title}</h2>{subtitle && <p className={"mt-3.5 sm:mt-4 text-sm sm:text-base max-w-2xl leading-relaxed " + (dark ? "text-neutral-400" : "text-neutral-600")}>{subtitle}</p>}{children}</div>;
}

function Modal({ children, label, onClose }: { children: React.ReactNode; label: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: html.style.overflow,
    };

    dialog?.showModal();
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      dialog?.close();
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return <dialog ref={ref} className="clinical-dialog" aria-label={label} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="clinical-dialog-content"><button type="button" onClick={onClose} aria-label="Close modal" className="clinical-dialog-close"><X size={20} /></button>{children}</div></dialog>;
}

function imageSources(source: string) {
  return [400, 800, 1200].map((width) => `${source.replace(/w=\d+/, `w=${width}`)} ${width}w`).join(", ");
}
