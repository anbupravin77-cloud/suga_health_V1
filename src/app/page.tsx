"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
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
import { LivingMetrics } from "@/components/public/living-metrics";
import { DoctorSpotlight } from "@/components/public/doctor-spotlight";
import doctorStyles from "@/components/public/doctor-spotlight.module.css";

const homeInter = Inter({ subsets: ["latin"], variable: "--font-home", display: "swap" });

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
  {
    step: "01",
    title: "Share your details",
    brief: "Tell us what you need help with.",
    detail: [
      "Choose a care area and describe your symptoms.",
      "Add relevant medical history, medicines and allergies.",
    ],
    mediaClass: "care-expander-media-intake",
  },
  {
    step: "02",
    title: "Clinician review",
    brief: "A clinician checks your information.",
    detail: [
      "Your history is reviewed for treatment suitability.",
      "The clinician may ask for more details before deciding.",
    ],
    mediaClass: "care-expander-media-review",
  },
  {
    step: "03",
    title: "Treatment & delivery",
    brief: "See the decision and next steps.",
    detail: [
      "If prescribed, your treatment details appear in your account.",
      "Delivery options and timing depend on the treatment.",
    ],
    mediaClass: "care-expander-media-treatment",
  },
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
  { id: "sample-01", name: "Sample customer 01", age: 32, photo: "https://i.pravatar.cc/320?img=47", quote: "Sample copy: I felt heard, and the next steps were explained in a way I could actually follow." },
  { id: "sample-02", name: "Sample customer 02", age: 41, photo: "https://i.pravatar.cc/320?img=12", quote: "Sample copy: Having one clear place for my consultation and follow-up made care feel much simpler." },
  { id: "sample-03", name: "Sample customer 03", age: 29, photo: "https://i.pravatar.cc/320?img=32", quote: "Sample copy: The experience felt private, calm, and much more personal than I expected online." },
  { id: "sample-04", name: "Sample customer 04", age: 36, photo: "https://i.pravatar.cc/320?img=5", quote: "Sample copy: I knew what would happen next at every stage, which made the whole process feel easier." },
  { id: "sample-05", name: "Sample customer 05", age: 45, photo: "https://i.pravatar.cc/320?img=49", quote: "Sample copy: The clinician took time to answer the questions I had before deciding on a plan." },
  { id: "sample-06", name: "Sample customer 06", age: 34, photo: "https://i.pravatar.cc/320?img=15", quote: "Sample copy: Follow-up felt connected to the consultation instead of like starting over again." },
  { id: "sample-07", name: "Sample customer 07", age: 27, photo: "https://i.pravatar.cc/320?img=44", quote: "Sample copy: It felt reassuring to have a real person review my information and explain the options." },
  { id: "sample-08", name: "Sample customer 08", age: 39, photo: "https://i.pravatar.cc/320?img=8", quote: "Sample copy: The care journey was straightforward without feeling rushed or impersonal." },
  { id: "sample-09", name: "Sample customer 09", age: 31, photo: "https://i.pravatar.cc/320?img=23", quote: "Sample copy: I appreciated knowing who was reviewing my case and what I could expect afterwards." },
  { id: "sample-10", name: "Sample customer 10", age: 43, photo: "https://i.pravatar.cc/320?img=53", quote: "Sample copy: Everything was presented clearly, without making the experience feel clinical or cold." },
  { id: "sample-11", name: "Sample customer 11", age: 28, photo: "https://i.pravatar.cc/320?img=36", quote: "Sample copy: The process gave me enough space to explain what I needed before the consultation." },
  { id: "sample-12", name: "Sample customer 12", age: 38, photo: "https://i.pravatar.cc/320?img=3", quote: "Sample copy: I liked that the care plan felt considered rather than automatically generated." },
  { id: "sample-13", name: "Sample customer 13", age: 47, photo: "https://i.pravatar.cc/320?img=60", quote: "Sample copy: Questions after the appointment did not feel like an afterthought." },
  { id: "sample-14", name: "Sample customer 14", age: 30, photo: "https://i.pravatar.cc/320?img=25", quote: "Sample copy: The service felt easy to use while still keeping the doctor at the centre of care." },
  { id: "sample-15", name: "Sample customer 15", age: 35, photo: "https://i.pravatar.cc/320?img=51", quote: "Sample copy: I could understand the recommendation and why it was being suggested." },
  { id: "sample-16", name: "Sample customer 16", age: 42, photo: "https://i.pravatar.cc/320?img=11", quote: "Sample copy: The experience was focused and convenient without feeling transactional." },
  { id: "sample-17", name: "Sample customer 17", age: 33, photo: "https://i.pravatar.cc/320?img=41", quote: "Sample copy: From review to follow-up, the experience felt like one continuous conversation." },
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
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeCareStep, setActiveCareStep] = useState<number | null>(null);
  const [careInView, setCareInView] = useState(false);
  const [carePageVisible, setCarePageVisible] = useState(true);
  const [careReducedMotion, setCareReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [careHoverPaused, setCareHoverPaused] = useState(false);
  const [careFocusPaused, setCareFocusPaused] = useState(false);
  const [careTouchPaused, setCareTouchPaused] = useState(false);
  const careExpanderRef = useRef<HTMLDivElement>(null);
  const careHoverResumeRef = useRef<number | null>(null);
  const careTouchResumeRef = useRef<number | null>(null);
  const careLastPointerTypeRef = useRef("mouse");
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  // The cards cycle only while visible and while the visitor is not interacting.
  useEffect(() => {
    const root = careExpanderRef.current;
    if (!root) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setCareReducedMotion(motionQuery.matches);
    const updateVisibility = () => setCarePageVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => setCareInView(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5] },
    );
    observer.observe(root);
    motionQuery.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => () => {
    if (careHoverResumeRef.current) window.clearTimeout(careHoverResumeRef.current);
    if (careTouchResumeRef.current) window.clearTimeout(careTouchResumeRef.current);
  }, []);

  useEffect(() => {
    if (!careInView || !carePageVisible || careReducedMotion ||
        careHoverPaused || careFocusPaused || careTouchPaused) return;

    if (activeCareStep === null) {
      const initialTimer = window.setTimeout(() => setActiveCareStep(0), 450);
      return () => window.clearTimeout(initialTimer);
    }
    const timer = window.setTimeout(() => {
      setActiveCareStep((current) => ((current ?? -1) + 1) % howItWorks.length);
    }, 4700);
    return () => window.clearTimeout(timer);
  }, [careInView, carePageVisible, careReducedMotion,
      careHoverPaused, careFocusPaused, careTouchPaused, activeCareStep]);

  function holdCareOnHover(index: number) {
    if (careHoverResumeRef.current) window.clearTimeout(careHoverResumeRef.current);
    setCareHoverPaused(true);
    setActiveCareStep(index);
  }

  function releaseCareHover() {
    if (careHoverResumeRef.current) window.clearTimeout(careHoverResumeRef.current);
    careHoverResumeRef.current = window.setTimeout(() => {
      setCareHoverPaused(false);
      careHoverResumeRef.current = null;
    }, 1100);
  }

  function selectCareOnTouch(index: number) {
    if (careTouchResumeRef.current) window.clearTimeout(careTouchResumeRef.current);
    setCareTouchPaused(true);
    setActiveCareStep((current) => current === index ? null : index);
    careTouchResumeRef.current = window.setTimeout(() => {
      setCareTouchPaused(false);
      careTouchResumeRef.current = null;
    }, 9000);
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.querySelector(".home-page-content");
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      "h1, h2, h3, p, .home-kicker, .pathway-highlight-list > span, .process-step-copy, .metric-ledger > article, .comparison-row, .doctor-card-body, .doctor-trust-band > div, .voice-testimonial, .product-card-body, .formulary-assurance, .faq-question, .faq-answer"
    ));

    const revealTargets = targets.filter((element) => !element.closest(".home-process, .home-metrics"));
    revealTargets.forEach((element, index) => {
      element.classList.add("premium-text-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 55}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
          } else {
            element.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const visibleProducts = productCategory === "all" ? products : products.filter((product) => product.category === productCategory);

  return (
    <main className={`legacy-public refined-home ${homeInter.variable} min-h-screen bg-white text-black overflow-x-hidden`}>
      <header className="legacy-header mobile-home-header fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="mobile-home-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex justify-between items-center">
          <Link href="/" className="mobile-home-brand flex flex-col items-start select-none shrink-0">
            <span className="font-sans text-xl sm:text-2xl tracking-tighter uppercase font-black text-neutral-950 leading-none">SUGA<span className="text-neutral-400">.</span>HEALTH</span>
            <span className="brand-tagline text-neutral-500 mt-0.5">live naturally</span>
          </Link>

          <nav className="public-desktop-nav hidden lg:flex items-center" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="public-desktop-nav-link">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mobile-home-header-actions flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link href="/sign-in" className="mobile-home-signin suga-btn suga-btn-account suga-btn-compact hidden sm:inline-flex">Sign In</Link>
            <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="mobile-home-start suga-btn suga-btn-primary suga-btn-compact hidden sm:inline-flex">
              <span className="mobile-home-start-full">Start consultation</span>
              <span className="mobile-home-start-short">Start</span>
              <ArrowRight size={15} />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="mobile-home-menu lg:hidden p-2 rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </div>
      </header>
      <MobilePublicMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} fontClassName={`${homeInter.variable} home-inter-menu`} />

      <div className="home-page-content pt-[70px]">
        <section className="home-hero bg-white border-b border-neutral-200/80">
          <div className="home-trust-ticker" aria-label="Suga Health service highlights">
            <div className="home-marquee-track">
              {[0, 1, 2, 3].map((group) => (
                <span key={group} aria-hidden={group > 0 ? true : undefined} className="home-ticker-sequence">
                  <span>Fully confidential</span><b>✦</b>
                  <span>Free and discrete shipping</span><b>✦</b>
                  <span>100% online process</span><b>✦</b>
                  <span>Used and trusted by millions around the world</span><b>✦</b>
                </span>
              ))}
            </div>
          </div>

          <div className="home-hero-composition">
            <div className="hero-intro-grid">
              <div className="hero-intro-copy">
                <h1 className="legacy-hero-title">
                  Clinically proven, FDA (USA) approved, treatment prescribed by experts.
                </h1>
              </div>

              <div className="hero-action-grid" aria-label="Explore Suga Health care">
                <Link href="/weight-loss" className="home-action-pill suga-btn suga-btn-secondary">Medical weight loss <ArrowUpRight size={16} /></Link>
                <Link href="/hair-growth" className="home-action-pill suga-btn suga-btn-secondary">Hair growth <ArrowUpRight size={16} /></Link>
                <Link href="/sexual-health" className="home-action-pill suga-btn suga-btn-secondary">Sexual health <ArrowUpRight size={16} /></Link>
                <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="home-action-pill home-action-primary suga-btn suga-btn-primary"><span>Start consultation</span><ArrowRight size={16} /></Link>
              </div>
            </div>

            <div className="hero-bento hero-bento-ro" aria-label="Suga Health care and treatment imagery">
              <div className={`hero-bento-primary editorial-media editorial-media-large editorial-media-${pillars[heroSlide].id} ${pillars[heroSlide].id === "weight" ? "home-uploaded-media-frame" : ""}`}>
                <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
                {pillars[heroSlide].id === "weight" && (
                  <img
                    src="/images/wmremove-transformed.jpeg"
                    alt="Woman holding a small medicine vial against an orange studio background"
                    width={2048}
                    height={1529}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="home-uploaded-media home-uploaded-media-photo"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>

              <button type="button" className="hero-bento-support editorial-media editorial-media-doctor editorial-media-clickable" onClick={() => setSelectedDoctor(doctors[0])} aria-label={"View credentials for " + doctors[0].name}>
                <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
              </button>

              <button type="button" className="hero-bento-small hero-bento-small-one editorial-media editorial-media-product editorial-media-weight editorial-media-clickable" onClick={() => setSelectedProduct(products[0])} aria-label={"View " + products[0].name}>
                <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
              </button>

              <button type="button" className="hero-bento-small hero-bento-small-two editorial-media editorial-media-product editorial-media-sexual editorial-media-clickable" onClick={() => setSelectedProduct(products[4])} aria-label={"View " + products[4].name}>
                <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
              </button>
            </div>
          </div>
        </section>

        <section id="treatments" className="home-pathways home-editorial-section">
          <div className="home-section-shell">
            <SectionHeader centered hideEyebrow eyebrow="Targeted Therapeutics" title="Focused Clinical Pathways" subtitle="Precision treatment protocols designed for sustained biological optimization." />
            <div className="pathway-editorial-list">
              {pillars.map((pillar, idx) => (
                <article key={pillar.id} className="pathway-editorial-row">
                  <div className={`pathway-editorial-image editorial-media editorial-media-large editorial-media-${pillar.id} ${pillar.id === "weight" ? "home-uploaded-media-frame" : ""}`}>
                    <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
                    {pillar.id === "weight" && (
                      <video
                        className="home-uploaded-media home-uploaded-media-video"
                        src="/images/floating_medicines.mp4"
                        aria-label="Illustrative animation of floating medication devices"
                        autoPlay
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                      />
                    )}
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
                      <Link href={pillar.path} className="suga-btn suga-btn-secondary suga-btn-inline">View protocol <ArrowRight size={15} /></Link>
                      <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary suga-btn-inline"><span>Start consultation</span><ArrowUpRight size={15} /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-progression home-editorial-section bg-white">
          <div className="home-section-shell">
            <SectionHeader centered hideEyebrow eyebrow="Clinical Progression" title="Clear Milestones from Day 1" subtitle="Expect real, measurable physiological changes with continuous medical guidance.">
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
            <div className="home-centered-action"><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary">See if you qualify today <ArrowRight size={16} /></Link></div>
          </div>
        </section>

        <section className="home-process home-editorial-section" aria-labelledby="care-expander-title">
          <div className="home-section-shell">
            <div className="care-expander-heading">
              <h2 id="care-expander-title">What happens after you start?</h2>
              <p>One consultation. A clear next step, based on your health information.</p>
            </div>
            <div
              ref={careExpanderRef}
              className={`care-expander ${activeCareStep !== null ? "has-active-card" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  if (careHoverResumeRef.current) window.clearTimeout(careHoverResumeRef.current);
                  setCareHoverPaused(true);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") releaseCareHover();
              }}
              onFocusCapture={(event) => {
                if ((event.target as HTMLElement).matches(":focus-visible")) setCareFocusPaused(true);
              }}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setCareFocusPaused(false);
                }
              }}
            >
              {howItWorks.map((item, index) => {
                const expanded = activeCareStep === index;
                return (
                  <article
                    key={item.step}
                    className={`care-expander-card ${expanded ? "is-expanded" : ""}`}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") holdCareOnHover(index);
                    }}
                  >
                    <button
                      type="button"
                      className="care-expander-trigger"
                      aria-expanded={expanded}
                      aria-controls={`care-expander-detail-${index}`}
                      aria-label={`${expanded ? "Hide" : "Show"} details for ${item.title}`}
                      onFocus={(event) => {
                        if (event.currentTarget.matches(":focus-visible")) {
                          setCareFocusPaused(true);
                          setActiveCareStep(index);
                        }
                      }}
                      onPointerDown={(event) => {
                        careLastPointerTypeRef.current = event.pointerType;
                      }}
                      onClick={(event) => {
                        // Mouse hover has already selected the card; don't let
                        // click focus suspend the loop forever after pointer exit.
                        if (event.detail !== 0 && careLastPointerTypeRef.current === "mouse") {
                          setActiveCareStep(index);
                          return;
                        }
                        selectCareOnTouch(index);
                      }}
                    >
                      <span className="care-expander-number">{item.step}</span>
                      <span className="care-expander-arrow"><ArrowUpRight size={19} aria-hidden="true" /></span>
                    </button>
                    <div className="care-expander-layout">
                      <div className="care-expander-copy">
                        <h3>{item.title}</h3>
                        <p className="care-expander-brief">{item.brief}</p>
                        <div
                          className="care-expander-detail"
                          id={`care-expander-detail-${index}`}
                          hidden={!expanded}
                        >
                          {item.detail.map((line) => <p key={line}>{line}</p>)}
                        </div>
                      </div>
                      {expanded && (
                        <div className={`care-expander-media ${item.mediaClass}`} aria-hidden="true" />
                      )}
                    </div>
                    <span className="care-expander-hint" aria-hidden="true">
                      {expanded ? "Viewing details" : "Explore step"}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-metrics home-editorial-section">
          <div className="home-section-shell">
            <LivingMetrics />
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

        <section id="doctors" className={`home-doctors home-editorial-section ${doctorStyles.doctorSection}`}>
          <div className="home-section-shell">
            <SectionHeader centered hideEyebrow eyebrow="Medical Leadership & Care Team" title={<><span className="section-title-line">Board-certified doctors</span><span className="section-title-line">behind every prescription.</span></>} subtitle="No bots, no algorithmic shortcuts. Licensed US physicians personally evaluate every intake, design individualized treatment plans, and support you throughout your care." />

            <DoctorSpotlight
              doctors={doctors}
              paused={selectedDoctor !== null}
              onViewProfile={(doctorId) => {
                const doctor = doctors.find((item) => item.id === doctorId);
                if (doctor) setSelectedDoctor(doctor);
              }}
            />

            <div className="doctor-trust-band">
              <div>
                <span><HeartHandshake size={16} /> Direct clinician access included</span>
                <h3>Real doctors. Direct access. Care built around you.</h3>
                <p>Your consultation is reviewed by a licensed clinician, with ongoing support throughout your care.</p>
              </div>
              <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary">
                <span>Start consultation</span><ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="home-voices home-editorial-section" aria-labelledby="voices-title">
          <div className="home-section-shell">
            <div className="voices-heading">
              <span className="home-kicker">Voice of Our Customers</span>
              <h2 id="voices-title">Care, in their own words.</h2>
              <p>A living portrait wall that brings one customer story into focus at a time.</p>
              <span className="voices-demo-note">Demo preview — placeholder portraits and sample copy must be replaced with verified customer stories before publishing.</span>
            </div>

            <div className="voices-honeycomb" role="list" aria-label="Sample customer stories">
              {customerVoices.map((customer, index) => {
                const active = index === voiceIndex;
                return (
                  <button
                    key={customer.id}
                    type="button"
                    role="listitem"
                    className={`voice-hex ${active ? "is-active" : ""}`}
                    aria-label={`${customer.name}, age ${customer.age}`}
                    aria-pressed={active}
                    onClick={() => setVoiceIndex(index)}
                  >
                    <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
                    <span className="voice-hex-scrim" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <article className="voice-testimonial" key={customerVoices[voiceIndex].id} aria-live="polite">
              <div className="voice-testimonial-person">
                <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
                <div>
                  <strong>{customerVoices[voiceIndex].name}</strong>
                  <span>Age {customerVoices[voiceIndex].age}</span>
                </div>
              </div>
              <blockquote>“{customerVoices[voiceIndex].quote}”</blockquote>
            </article>
          </div>
        </section>

        <section id="products" className="home-formulary home-editorial-section bg-white">
          <div className="home-section-shell">
            <SectionHeader centered hideEyebrow eyebrow="Prescription Formulary" title="Targeted therapies compounded for maximum bioavailability." subtitle="Doctor-formulated treatments with pure active pharmaceutical ingredients, prepared exclusively in state-licensed 503A/503B pharmacies.">
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
                  <div className={`product-card-image editorial-media editorial-media-product editorial-media-${product.category}`}>
                    <div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} />
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
                        <button type="button" className="suga-btn suga-btn-secondary suga-btn-inline" onClick={() => setSelectedProduct(product)}>Details <Info size={15} /></button>
                        <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary suga-btn-inline">Get started <ArrowRight size={15} /></Link>
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

        <section className="home-faq home-editorial-section" aria-labelledby="faq-title">
          <div className="home-section-shell home-faq-shell">
            <div className="faq-heading">
              <h2 id="faq-title">Frequently Asked Questions</h2>
              <p>Clear answers about consultations, prescriptions, privacy, and ongoing care.</p>
            </div>

            <div className="faq-editorial-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article className={`faq-item ${isOpen ? "is-open" : ""}`} key={faq.q}>
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setOpenFaq((current) => current === index ? null : index)}
                    >
                      <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{faq.q}</strong>
                      <span className="faq-icon" aria-hidden="true"><ChevronDown size={20} /></span>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      className="faq-answer-shell"
                      aria-hidden={!isOpen}
                    >
                      <div className="faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="home-final-cta-inner">
            <span className="home-kicker">Take the first step</span>
            <div>
              <h2>Your personalized medical plan is&nbsp;5 minutes away.</h2>
              <p>Answer quick medical questions. A licensed clinician will review your file and tailor your prescription.</p>
            </div>
            <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary suga-btn-large">Start Free Assessment <ArrowRight size={17} /></Link>
          </div>
        </section>
      </div>

      <footer className="bg-neutral-950 text-neutral-300 py-12 md:py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-12">
            <div className="md:col-span-6"><Link href="/" className="flex flex-col items-start mb-6"><span className="font-sans text-2xl tracking-tighter uppercase font-black text-white">SUGA<span className="text-neutral-500">.</span>HEALTH</span><span className="brand-tagline text-neutral-400 mt-0.5">live naturally</span></Link><p className="text-neutral-400 max-w-md text-sm leading-relaxed">Confidential, doctor-guided treatments for medical weight loss, hair restoration, and sexual vitality. Real treatments delivered with care and complete privacy.</p></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Clinical Treatments</h4><ul className="space-y-3 text-sm text-neutral-400"><li><Link href="/weight-loss">Medical Weight Loss (GLP-1)</Link></li><li><Link href="/hair-growth">Hair Regrowth & Density</Link></li><li><Link href="/sexual-health">Sexual Health & Performance</Link></li><li><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition}>Start Online Consultation</Link></li></ul></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Medical Practice</h4><ul className="space-y-3 text-sm text-neutral-400"><li><a href="#doctors">Our Doctors & Medical Board</a></li><li><a href="#products">Our Products & Formulary</a></li><li><Link href="/about">About Our Clinical Mission</Link></li><li><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition}>Patient Medical Intake</Link></li></ul></div>
          </div>
          <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 space-y-2"><p>Suga.Health facilitates telehealth consultations through licensed medical professionals. Prescription products require an online evaluation with a licensed healthcare provider.</p><p>For emergencies, contact local emergency services.</p><p>© {new Date().getFullYear()} Suga.Health. All rights reserved.</p></div>
        </div>
      </footer>

      {selectedDoctor && <Modal label={selectedDoctor.name} stableScroll onClose={() => setSelectedDoctor(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white flex items-center gap-4"><div className="home-empty-image" aria-hidden="true" style={{ width: "100%", height: "100%" }} /><div><span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Board-Certified Clinician</span><h3 className="font-sans text-2xl font-extrabold text-white">{selectedDoctor.name}, {selectedDoctor.credentials}</h3><p className="text-xs text-neutral-300">{selectedDoctor.role}</p></div></div>
        <div className="p-5 sm:p-7 space-y-5"><div><span className="legacy-label">Clinical Specialty</span><p className="text-sm text-neutral-700">{selectedDoctor.specialty}</p></div><div><span className="legacy-label">Board Certification</span><p className="text-sm text-neutral-700">{selectedDoctor.boardCertification}</p></div><div><span className="legacy-label">Education</span><p className="text-sm text-neutral-700">{selectedDoctor.education}</p></div><div><span className="legacy-label">About</span><p className="text-sm text-neutral-700">{selectedDoctor.bio}</p></div><div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{selectedDoctor.yearsOfExperience} years clinical practice</div></div>
      </Modal>}

      {selectedProduct && <Modal label={selectedProduct.name} onClose={() => setSelectedProduct(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white"><span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Prescription Specification</span><h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-white">{selectedProduct.name}</h3><p className="text-xs text-neutral-300 font-mono mt-1">Active Ingredients: {selectedProduct.activeIngredients}</p></div>
        <div className="p-5 sm:p-7 space-y-5"><div><span className="legacy-label">Formulation Overview</span><p className="text-sm text-neutral-700">{selectedProduct.description}</p></div><div className="grid sm:grid-cols-2 gap-3"><div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200"><span className="legacy-label">Administration Method</span><p className="text-xs font-bold text-neutral-900">{selectedProduct.deliveryMethod}</p></div><div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200"><span className="legacy-label">Typical Dosage Range</span><p className="text-xs font-bold text-neutral-900">{selectedProduct.dosage}</p></div></div><div><span className="legacy-label">Mechanism of Action</span><p className="text-sm text-neutral-700">{selectedProduct.mechanismOfAction}</p></div><div><span className="legacy-label">Clinical Benefits & Outcomes</span><div className="grid sm:grid-cols-2 gap-2 mt-2">{selectedProduct.benefits.map((benefit) => <div key={benefit} className="flex gap-2 text-xs text-neutral-700"><Check size={13} className="shrink-0 mt-0.5" />{benefit}</div>)}</div></div></div>
        <div className="p-5 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between"><div><span className="text-[11px] text-neutral-500">All-inclusive pricing</span><div className="font-sans text-2xl font-extrabold">{selectedProduct.startingPrice} <span className="text-xs font-medium text-neutral-500">{selectedProduct.billingCadence}</span></div></div><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider">Check Eligibility <ArrowRight size={14} /></Link></div>
      </Modal>}
    </main>
  );
}

function SectionHeader({ eyebrow, title, subtitle, children, dark = false, centered = false, hideEyebrow = false }: { eyebrow: string; title: React.ReactNode; subtitle?: string; children?: React.ReactNode; dark?: boolean; centered?: boolean; hideEyebrow?: boolean }) {
  return <div className={`editorial-section-heading text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center ${centered ? "editorial-section-heading-centered" : ""}`}>{!hideEyebrow && <span className={"text-xs font-bold tracking-widest uppercase block mb-2.5 " + (dark ? "text-neutral-400" : "text-neutral-500")}>{eyebrow}</span>}<h2 className={"font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance " + (dark ? "text-white" : "text-neutral-950")}>{title}</h2>{subtitle && <p className={"mt-3.5 sm:mt-4 text-sm sm:text-base max-w-2xl leading-relaxed " + (dark ? "text-neutral-400" : "text-neutral-600")}>{subtitle}</p>}{children}</div>;
}

function Modal({ children, label, onClose, stableScroll = false }: { children: React.ReactNode; label: string; onClose: () => void; stableScroll?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  // The doctor profile uses a layout effect so the lock and restoration both
  // happen before paint. A normal effect caused a one-frame jump to the top.
  useLayoutEffect(() => {
    if (!stableScroll) return;

    const dialog = ref.current;
    const html = document.documentElement;
    const body = document.body;
    const x = window.scrollX;
    const y = window.scrollY;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlScrollBehavior: html.style.scrollBehavior,
      htmlScrollbarGutter: html.style.scrollbarGutter,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyWidth: body.style.width,
    };

    // A fixed body retains the exact visual viewport, including on mobile
    // Safari. Disable smooth scrolling before any focus or scroll work.
    html.style.scrollBehavior = "auto";
    html.style.scrollbarGutter = "stable";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = `-${x}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>(".clinical-dialog-close")?.focus({ preventScroll: true });

    return () => {
      dialog?.close();
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.width = previous.bodyWidth;
      html.style.overflow = previous.htmlOverflow;
      window.scrollTo(x, y);
      opener?.focus({ preventScroll: true });
      html.style.scrollbarGutter = previous.htmlScrollbarGutter;
      html.style.scrollBehavior = previous.htmlScrollBehavior;
    };
  }, [stableScroll]);

  // Product modals keep their existing behaviour and are not part of this fix.
  useEffect(() => {
    if (stableScroll) return;
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
  }, [stableScroll]);

  return <dialog ref={ref} className={stableScroll ? `clinical-dialog ${doctorStyles.doctorModal}` : "clinical-dialog"} aria-label={label} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="clinical-dialog-content"><button type="button" onClick={onClose} aria-label="Close modal" className="clinical-dialog-close"><X size={20} /></button>{children}</div></dialog>;
}

function imageSources(source: string) {
  return [400, 800, 1200].map((width) => `${source.replace(/w=\d+/, `w=${width}`)} ${width}w`).join(", ");
}
