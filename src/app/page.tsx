"use client";

import Link from "next/link";
import Image from "next/image";
import productStyles from "@/components/public/product-gallery.module.css";
import { Inter } from "next/font/google";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
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
  CircleUserRound,
  ArrowUpRight,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { rememberReturnPosition, useRestoreReturnPosition } from "@/components/public/return-position";
import { MobilePublicMenu } from "@/components/public/mobile-public-menu";
import { LivingMetrics } from "@/components/public/living-metrics";
import { MilestoneJourney } from "@/components/public/milestone-journey";
import { DoctorSpotlight } from "@/components/public/doctor-spotlight";
import { MotionLink } from "@/components/public/motion-link";
import { ProductShowcase } from "@/components/public/product-design-review";
import doctorStyles from "@/components/public/doctor-spotlight.module.css";
import { BrandLogo } from "@/components/brand-logo";

const homeInter = Inter({ subsets: ["latin"], variable: "--font-home", display: "swap" });
const bentoPortraits = [
  {
    src: "/images/bento/bento-weight-loss-man.webp",
    alt: "Indian gentleman in a blue polo holding a medication pen",
    focus: "70% 40%",
    tag: "WEIGHT MANAGEMENT",
    headline: "A plan built around you",
    cta: "Explore weight loss",
    href: "/weight-loss",
  },
  {
    src: "/images/bento/bento-hair-serum.webp",
    alt: "Indian man with styled dark hair holding a hair serum bottle",
    focus: "64% 38%",
    tag: "HAIR GROWTH",
    headline: "Your hair care options",
    cta: "Explore hair growth",
    href: "/hair-growth",
  },
  {
    src: "/images/bento/bento-tablet-water.webp",
    alt: "Indian woman in a blue top holding a tablet and water",
    focus: "70% 40%",
    tag: "PRIVATE CARE",
    headline: "Care on your terms",
    cta: "Explore sexual health",
    href: "/sexual-health",
  },
] as const;

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
    subtitle: "Metabolic Health Protocol",
    desc: "The revolutionary GLP 1 peptide helps re-balance the appetite and satiety cycle and help you reach an ideal body weight naturally.",
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
    desc: "Confidential, discreet, clinically proven medications to enhance your vitality and improve your sexual health.",
    stats: "95% clinical response rate",
    timeline: "Works in 30–60 minutes",
    highlights: ["On-demand or daily dosing", "100% online & 100% confidential", "Delivered in unbranded discreet boxes"],
    path: "/sexual-health",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop&grayscale=1",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Consultation",
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
    id: "dr-raja-prabhakaran-rajarethinam",
    name: "Dr. Raja Prabhakaran Rajarethinam",
    credentials: "MD, MBA",
    role: "Founder",
    specialty: "Founder, Suga.Health",
    image: "/images/doctors/Rajaprabhakaran_Rajarethinam_MD_MBA_Founder.jpeg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Founder of Suga.Health. More professional details coming soon.",
    experience: "Details to be updated.",
  },
  {
    id: "dr-arulprakash",
    name: "Dr. Arulprakash",
    credentials: "MD, FRCP, MCA",
    role: "Chief Medical Officer",
    specialty: "Medical Leadership",
    image: "/images/doctors/IMG-20261020-WA0005.jpg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Chief Medical Officer at Suga.Health. More profile details coming soon.",
    experience: "Details to be updated.",
  },
  {
    id: "dr-aishwarya-meenaloshini",
    name: "Dr. Aishwarya Meenaloshini",
    credentials: "MBBS, MD",
    role: "Dermatology Specialist",
    specialty: "Dermatology, Venereology & Leprosy",
    image: "/images/doctors/Dr.Aishwarya_Meenaloshini_MBBS_MD_Dermatology_Venereology_Leprosy.jpeg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Specialist in dermatology, venereology and leprosy. Full biography coming soon.",
    experience: "Details to be updated.",
  },
  {
    id: "dr-abi-sindhuja",
    name: "Dr. Abi Sindhuja",
    credentials: "MS, MCh",
    role: "Consultant Aesthetic Surgeon",
    specialty: "Aesthetic Surgery",
    image: "/images/doctors/Dr.Abi_Sindhuja_%20MS_MCH_Consultant_Aesthetic%20Surgeon.jpeg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Consultant in aesthetic surgery. Full biography coming soon.",
    experience: "Details to be updated.",
  },
  {
    id: "dr-s-c-vivekanandhan",
    name: "Dr. S. C. Vivekanandhan",
    credentials: "MD, DTCD",
    role: "Consultant Pulmonologist & Sleep Apnea Specialist",
    specialty: "Pulmonology & Sleep Apnea",
    image: "/images/doctors/S.C.Vivekanandhan_MD_DTCD_Consultant_Pulmonaligist_and_Sleep_Apnea_Specialist.jpeg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Consultant in pulmonology and sleep apnea. Full biography coming soon.",
    experience: "Details to be updated.",
  },
  {
    id: "dr-sampath-kumar",
    name: "Dr. Sampath Kumar",
    credentials: "MD, DM",
    role: "Consultant Nephrologist",
    specialty: "Nephrology",
    image: "/images/doctors/Sampath_Kumar_MD_DM_Consultant_Nephrologist.jpeg",
    education: "Details to be updated.",
    boardCertification: "Details to be updated.",
    bio: "Consultant in nephrology. Full biography coming soon.",
    experience: "Details to be updated.",
  },
];

const products = [
  {
    "id": "mounjaro",
    "name": "Mounjaro",
    "category": "weight",
    "activeIngredients": "Tirzepatide",
    "form": "Prescription injection · KwikPen / vial",
    "manufacturer": "Eli Lilly",
    "image": "/images/products/weightloss%20image1.png",
    "imageAlt": "Illustration of a treatment pen near a person's thigh",
    "description": "Tirzepatide is a prescription medicine used for type 2 diabetes and weight management in eligible patients. A clinician determines suitability and the appropriate presentation.",
    "clinicalNote": "Prescription required. Not suitable for everyone; use only under medical supervision."
  },
  {
    "id": "yurpeak",
    "name": "Yurpeak",
    "category": "weight",
    "activeIngredients": "Tirzepatide",
    "form": "Prescription multi-dose KwikPen",
    "manufacturer": "Eli Lilly · distributed by Cipla",
    "image": "/images/products/weightloss%20image%202.png",
    "imageAlt": "Concept photograph of a hand holding a pen-style injection device",
    "description": "Tirzepatide is a prescription injectable medicine. A clinician determines the appropriate indication, presentation, dosage and follow-up.",
    "clinicalNote": "Prescription required. Medical assessment and follow-up are essential."
  },
  {
    "id": "obelit-120",
    "name": "Obelit 120",
    "category": "weight",
    "activeIngredients": "Orlistat 120 mg",
    "form": "Oral capsules",
    "manufacturer": "Intas Pharmaceuticals",
    "image": "/images/products/weightloss%20image%203.png",
    "imageAlt": "Concept photograph of capsules being picked up by fingertips",
    "description": "Orlistat is an oral medicine that reduces the absorption of dietary fat. Its use should be guided by an appropriate clinical assessment.",
    "clinicalNote": "A clinician or pharmacist should review suitability, interactions and dietary requirements."
  },
  {
    "id": "mintop-5",
    "name": "Mintop Forte 5%",
    "category": "hair",
    "activeIngredients": "Minoxidil 5% topical solution",
    "form": "Topical solution",
    "manufacturer": "Dr. Reddy's Laboratories",
    "image": "/images/products/hairloss%20image%201.png",
    "imageAlt": "Illustration of a minoxidil-style hair treatment bottle",
    "description": "Topical minoxidil 5% is used for certain forms of pattern hair loss. A clinician can assess the cause of hair loss and the suitability of this treatment.",
    "clinicalNote": "Treatment choice varies by hair-loss diagnosis and patient factors."
  },
  {
    "id": "morr-f-5",
    "name": "Morr-F 5%",
    "category": "hair",
    "activeIngredients": "Minoxidil 5% + Finasteride 0.1%",
    "form": "Topical solution",
    "manufacturer": "Intas Pharmaceuticals",
    "image": "/images/products/hairloss%20image%202.png",
    "imageAlt": "Illustration of a topical dropper being applied near a scalp parting",
    "description": "A prescription topical combination of minoxidil and finasteride used in selected patients with androgenetic hair loss.",
    "clinicalNote": "Requires a prescriber's review, including pregnancy-related precautions where relevant."
  },
  {
    "id": "lonitab",
    "name": "Lonitab",
    "category": "hair",
    "activeIngredients": "Oral minoxidil",
    "form": "Oral tablets",
    "manufacturer": "Intas Pharmaceuticals",
    "image": "/images/products/hairloss%20image%203.png",
    "imageAlt": "Concept photograph of tablets and a blister strip",
    "description": "Oral minoxidil was originally used to manage high blood pressure. Its use for hair growth is off-label and requires appropriate clinical supervision.",
    "clinicalNote": "Off-label hair-loss use requires careful clinician supervision due to possible cardiovascular effects."
  },
  {
    "id": "suhagra-100",
    "name": "Suhagra 100",
    "category": "sexual",
    "activeIngredients": "Sildenafil 100 mg",
    "form": "Oral tablets",
    "manufacturer": "Cipla",
    "image": "/images/products/sexualhealth%20image%201.png",
    "imageAlt": "Illustration of a blue tablet resting in an open palm",
    "description": "Sildenafil is a prescription treatment for erectile dysfunction. A clinician assesses whether it is appropriate, including possible interactions.",
    "clinicalNote": "Must not be combined with nitrate medicines; suitability and dosing require medical review."
  },
  {
    "id": "tadacip-20",
    "name": "Tadacip 20",
    "category": "sexual",
    "activeIngredients": "Tadalafil 20 mg",
    "form": "Oral tablets",
    "manufacturer": "Cipla",
    "image": "/images/products/sexualhealth%20image%202.png",
    "imageAlt": "Concept macro photograph of a tablet between fingertips",
    "description": "Tadalafil is a prescription treatment used for erectile dysfunction. The 20 mg strength is one presentation; prescribing decisions are individualized.",
    "clinicalNote": "Must not be combined with nitrate medicines; medical evaluation is required."
  },
  {
    "id": "duralast-30",
    "name": "Duralast 30",
    "category": "sexual",
    "activeIngredients": "Dapoxetine 30 mg",
    "form": "Oral tablets",
    "manufacturer": "Sun Pharma",
    "image": "/images/products/sexualhealth%20image%203.png",
    "imageAlt": "Concept photograph of a blister strip, tablets and fingertips",
    "description": "Dapoxetine is used for premature ejaculation in selected adult patients. It is not a general-purpose sexual performance supplement.",
    "clinicalNote": "Prescription-only use; a clinician must review interactions and precautions."
  }
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

type Product = (typeof products)[number];
type Doctor = (typeof doctors)[number];

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCareStep, setActiveCareStep] = useState<number | null>(null);
  const [careInView, setCareInView] = useState(false);
  const [carePageVisible, setCarePageVisible] = useState(true);
  const [careReducedMotion, setCareReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [careHoverPaused, setCareHoverPaused] = useState(false);
  const [careFocusPaused, setCareFocusPaused] = useState(false);
  const [careTouchPaused, setCareTouchPaused] = useState(false);
  const [careCompact, setCareCompact] = useState(false);
  const careExpanderRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const careHoverResumeRef = useRef<number | null>(null);
  const careTouchResumeRef = useRef<number | null>(null);
  const careLastPointerTypeRef = useRef("mouse");
  const [bentoPhotoIndex, setBentoPhotoIndex] = useState(0);
  const bentoTouchStart = useRef<{ x: number; y: number } | null>(null);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useRestoreReturnPosition();

  // Pause the marquee when offscreen to spare mobile rendering work.
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || typeof IntersectionObserver === "undefined") return;

    let inView = true;
    const syncVisibility = () => {
      ticker.dataset.tickerVisible = inView && !document.hidden ? "true" : "false";
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVisibility();
    }, { threshold: 0 });
    observer.observe(ticker);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setVoiceIndex((current) => (current + 1) % customerVoices.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  // Touch layouts are user-controlled: never rotate a card while somebody reads.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCareCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
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
    if (!careInView || !carePageVisible || careReducedMotion || careCompact ||
        careHoverPaused || careFocusPaused || careTouchPaused) return;

    if (activeCareStep === null) {
      const initialTimer = window.setTimeout(() => setActiveCareStep(0), 450);
      return () => window.clearTimeout(initialTimer);
    }
    const timer = window.setTimeout(() => {
      setActiveCareStep((current) => ((current ?? -1) + 1) % howItWorks.length);
    }, 4700);
    return () => window.clearTimeout(timer);
  }, [careInView, carePageVisible, careReducedMotion, careCompact,
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

    const revealTargets = targets.filter((element) => !element.closest(".home-process, .home-metrics, .home-progression"));
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

  return (
    <main className={`legacy-public refined-home ${homeInter.variable} min-h-screen bg-white text-black overflow-x-clip`}>
      <header className="legacy-header mobile-home-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="mobile-home-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex justify-between items-center">
          <Link href="/" className="mobile-home-brand flex flex-col items-start select-none shrink-0">
            <BrandLogo size="header" priority />
          </Link>

          <nav className="public-desktop-nav hidden lg:flex items-center" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="public-desktop-nav-link">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mobile-home-header-actions flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link href="/sign-in" className="mobile-home-login public-header-login suga-btn suga-btn-secondary suga-btn-compact">Login</Link>
            <span className="mobile-home-profile public-header-profile" aria-hidden="true">
              <CircleUserRound size={23} strokeWidth={1.85} />
            </span>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="mobile-home-menu lg:hidden p-2 rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </div>
      </header>
      <div ref={tickerRef} className="home-trust-ticker" data-ticker-visible="true" aria-label="Suga Health service highlights">
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
      <MobilePublicMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} fontClassName={`${homeInter.variable} home-inter-menu`} />

      <div className="home-page-content">
        <section className="home-hero bg-white border-b border-neutral-200/80">
          <div className="home-hero-composition">
            <div className="hero-intro-grid">
              <div className="hero-intro-copy">
                <h1 className="legacy-hero-title">
                  Clinically proven, FDA (USA) approved, treatments prescribed by experts.
                </h1>
              </div>

              <div className="hero-action-grid" aria-label="Explore Suga Health care">
                <Link href="/weight-loss" className="home-action-pill suga-btn suga-btn-secondary">Medical weight loss</Link>
                <Link href="/hair-growth" className="home-action-pill suga-btn suga-btn-secondary">Hair growth</Link>
                <Link href="/sexual-health" className="home-action-pill suga-btn suga-btn-secondary">Sexual Health</Link>
                <MotionLink href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} variant="magnetic" tone="hospital" className="home-action-pill home-action-primary suga-btn suga-btn-primary suga-consultation-cta">Start consultation</MotionLink>
              </div>
            </div>


            <div className="hero-bento-grid" aria-label="Suga Health treatment imagery">
              <Link href="/weight-loss" className="hero-bento-static hero-bento-feature" aria-label="Explore medical weight loss">
                <img src="/images/products/weightloss%20image1.png" alt="Weight management medication illustration" width={900} height={900} loading="lazy" decoding="async" />
                <span className="hero-bento-copy" aria-hidden="true">
                  <span className="hero-bento-eyebrow">WEIGHT MANAGEMENT</span>
                  <strong className="hero-bento-title">Medical weight loss</strong>
                  <span className="hero-bento-action"><span>Explore care</span><ArrowUpRight size={18} /></span>
                </span>
              </Link>
              <Link href="/hair-growth" className="hero-bento-static hero-bento-mini-one" aria-label="Explore hair growth treatments">
                <img src="/images/products/hairloss%20image%201.png" alt="Topical hair treatment bottle illustration" width={900} height={900} loading="lazy" decoding="async" />
                <span className="hero-bento-copy" aria-hidden="true">
                  <span className="hero-bento-eyebrow">HAIR CARE</span>
                  <strong className="hero-bento-title">Hair growth</strong>
                  <span className="hero-bento-action hero-bento-action-round"><ArrowUpRight size={18} /></span>
                </span>
              </Link>
              <Link href="/sexual-health" className="hero-bento-static hero-bento-mini-two" aria-label="Explore private sexual health care">
                <img src="/images/products/sexualhealth%20image%201.png" alt="Medicine tablet resting in an open palm" width={900} height={900} loading="lazy" decoding="async" />
                <span className="hero-bento-copy" aria-hidden="true">
                  <span className="hero-bento-eyebrow">PRIVATE CARE</span>
                  <strong className="hero-bento-title">Sexual health</strong>
                  <span className="hero-bento-action hero-bento-action-round"><ArrowUpRight size={18} /></span>
                </span>
              </Link>
              <div
                className="hero-photo-carousel hero-bento-models"
                role="region"
                aria-roledescription="carousel"
                aria-label="Suga Health treatment photography"
                tabIndex={0}
                onTouchStart={(event) => {
                  const touch = event.touches[0];
                  if (touch) bentoTouchStart.current = { x: touch.clientX, y: touch.clientY };
                }}
                onTouchEnd={(event) => {
                  const initial = bentoTouchStart.current;
                  bentoTouchStart.current = null;
                  const touch = event.changedTouches[0];
                  if (!initial || !touch) return;
                  const dx = touch.clientX - initial.x;
                  const dy = touch.clientY - initial.y;
                  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
                  setBentoPhotoIndex((current) =>
                    Math.max(0, Math.min(bentoPortraits.length - 1, current + (dx < 0 ? 1 : -1))),
                  );
                }}
                onTouchCancel={() => { bentoTouchStart.current = null; }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    setBentoPhotoIndex((current) => Math.min(bentoPortraits.length - 1, current + 1));
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    setBentoPhotoIndex((current) => Math.max(0, current - 1));
                  }
                }}
              >
                <div
                  className="hero-photo-carousel-track"
                  style={{ transform: `translate3d(-${bentoPhotoIndex * 100}%, 0, 0)` }}
                >
                  {bentoPortraits.map((portrait, index) => (
                    <div key={portrait.src} className="hero-photo-carousel-slide" aria-hidden={index !== bentoPhotoIndex}>
                      <img
                        src={portrait.src}
                        alt={portrait.alt}
                        width={1440}
                        height={960}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        draggable={false}
                        style={{ objectPosition: portrait.focus }}
                      />
                    </div>
                  ))}
                </div>
                <div className="hero-bento-portrait-copy" aria-live="polite" aria-atomic="true">
                  <span className="hero-bento-eyebrow">{bentoPortraits[bentoPhotoIndex].tag}</span>
                  <strong className="hero-bento-portrait-title">{bentoPortraits[bentoPhotoIndex].headline}</strong>
                </div>
                <Link
                  href={bentoPortraits[bentoPhotoIndex].href}
                  className="hero-bento-portrait-cta"
                  aria-label={bentoPortraits[bentoPhotoIndex].cta}
                >
                  <span className="hero-bento-portrait-cta-label">{bentoPortraits[bentoPhotoIndex].cta}</span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
                <div className="hero-photo-carousel-dots" role="group" aria-label="Select photo">
                  {bentoPortraits.map((portrait, index) => (
                    <button
                      key={portrait.src}
                      type="button"
                      className={index === bentoPhotoIndex ? "is-active" : ""}
                      aria-label={`Show photo ${index + 1} of ${bentoPortraits.length}`}
                      aria-pressed={index === bentoPhotoIndex}
                      onClick={() => setBentoPhotoIndex(index)}
                    >
                      <span aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
  
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
                    {pillar.id === "hair" && (
                      <video
                        className="home-uploaded-media home-uploaded-media-video"
                        src="/videos/suga_hair_growth_zero_gravity_duet_8s.mp4"
                        aria-label="Illustrative animation of gently floating hair treatment bottles"
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
                      <MotionLink href={pillar.path} variant="particle" tone="light" className="suga-btn suga-btn-secondary suga-btn-inline">View protocol</MotionLink>
                      <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary suga-btn-inline suga-consultation-cta"><span>Start consultation</span></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <MilestoneJourney />

        <section className="home-process home-editorial-section" aria-labelledby="care-expander-title">
          <div className="home-section-shell">
            <div className="care-expander-heading">
              <h2 id="care-expander-title"><span className="care-heading-full">What happens after you start?</span><span className="care-heading-compact">What happens next?</span></h2>
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
            <SectionHeader centered hideEyebrow eyebrow="Medical Leadership & Care Team" title={<><span className="section-title-line">Experienced clinicians</span><span className="section-title-line">behind every prescription</span></>} subtitle="Meet the doctors behind Suga.Health. Explore their roles, specialties, qualifications and professional profiles." />

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
              <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-btn-primary suga-consultation-cta">
                <span>Start consultation</span>
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
              <div className="voice-testimonial-quote-frame">
                <div className="voice-testimonial-quote-sizer" aria-hidden="true">
                  {customerVoices.map((customer) => (
                    <blockquote key={customer.id}>“{customer.quote}”</blockquote>
                  ))}
                </div>
                <blockquote className="voice-testimonial-active-quote">“{customerVoices[voiceIndex].quote}”</blockquote>
              </div>
            </article>
          </div>
        </section>

        <section id="products" className={`home-formulary home-editorial-section bg-white ${productStyles.productSection}`}>
          <div className="home-section-shell">
            <div className={productStyles.headingArea}>
              <SectionHeader centered hideEyebrow eyebrow="India treatment reference" title="Explore treatment options." subtitle="A reference gallery of real medicine brands marketed in India. Availability, suitability and prescribing are determined by a qualified clinician." />
            </div>

            <ProductShowcase products={products} onLearnMore={setSelectedProduct} />
            <div className="formulary-assurance">
              <span><ShieldCheck size={16} />Illustrative AI-generated images. Device shapes, pill imprints and packaging may differ from real products.</span>
              
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
            <MotionLink href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} variant="magnetic" tone="hospital" className="suga-btn suga-btn-large suga-consultation-cta">Start Free Assessment</MotionLink>
          </div>
        </section>
      </div>

      <footer className="bg-neutral-950 text-neutral-300 py-12 md:py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-12">
            <div className="md:col-span-6"><Link href="/" className="flex flex-col items-start mb-6"><BrandLogo size="footer" inverse /></Link><p className="text-neutral-400 max-w-md text-sm leading-relaxed">Confidential, doctor-guided treatments for medical weight loss, hair restoration, and sexual health. Real treatments delivered with care and complete privacy.</p></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Clinical Treatments</h4><ul className="space-y-3 text-sm text-neutral-400"><li><Link href="/weight-loss">Medical Weight Loss (GLP-1)</Link></li><li><Link href="/hair-growth">Hair Regrowth & Density</Link></li><li><Link href="/sexual-health">Sexual Health</Link></li><li><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition}>Start Online Consultation</Link></li></ul></div>
            <div className="md:col-span-3"><h4 className="font-semibold text-white mb-5 uppercase tracking-widest text-xs">Medical Practice</h4><ul className="space-y-3 text-sm text-neutral-400"><li><a href="#doctors">Our Doctors & Medical Board</a></li><li><a href="#products">Our Products & Formulary</a></li><li><Link href="/about">About Our Clinical Mission</Link></li><li><Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition}>Patient Medical Intake</Link></li></ul></div>
          </div>
          <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 space-y-2"><p>Suga.Health facilitates telehealth consultations through licensed medical professionals. Prescription products require an online evaluation with a licensed healthcare provider.</p><p>For emergencies, contact local emergency services.</p><p>© {new Date().getFullYear()} Suga.Health. All rights reserved.</p></div>
        </div>
      </footer>

      {selectedDoctor && <Modal label={selectedDoctor.name} stableScroll onClose={() => setSelectedDoctor(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white flex items-center gap-4">
          <Image
            src={selectedDoctor.image}
            alt={`Portrait of ${selectedDoctor.name}`}
            width={88}
            height={108}
            className={`w-20 h-24 sm:w-[88px] sm:h-[108px] shrink-0 rounded-xl object-cover ${selectedDoctor.id === "dr-arulprakash" ? "object-center" : "object-top"}`}
          />
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Suga.Health Medical Team</span>
            <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-white">{selectedDoctor.name}, {selectedDoctor.credentials}</h3>
            <p className="text-xs text-neutral-300">{selectedDoctor.role}</p>
          </div>
        </div>
        <div className="p-5 sm:p-7 space-y-5">
          <div><span className="legacy-label">Clinical Field / Role</span><p className="text-sm text-neutral-700">{selectedDoctor.specialty}</p></div>
          <div><span className="legacy-label">Additional Certifications</span><p className="text-sm text-neutral-700">{selectedDoctor.boardCertification}</p></div>
          <div><span className="legacy-label">Education</span><p className="text-sm text-neutral-700">{selectedDoctor.education}</p></div>
          <div><span className="legacy-label">About</span><p className="text-sm text-neutral-700">{selectedDoctor.bio}</p></div>
          <div><span className="legacy-label">Experience</span><p className="text-sm text-neutral-700">{selectedDoctor.experience}</p></div>
        </div>
      </Modal>}

      {selectedProduct && <Modal label={selectedProduct.activeIngredients} onClose={() => setSelectedProduct(null)}>
        <div className="p-5 sm:p-7 bg-neutral-950 text-white">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Medicine information</span>
          <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-white">{selectedProduct.activeIngredients}</h3>
          <p className="text-xs text-neutral-300 mt-1">{selectedProduct.form}</p>
        </div>
        <div className="p-5 sm:p-7 space-y-5">
          <div><span className="legacy-label">Overview</span><p className="text-sm text-neutral-700">{selectedProduct.description}</p></div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200"><span className="legacy-label">Presentation</span><p className="text-xs font-bold text-neutral-900">{selectedProduct.form}</p></div>
          <div><span className="legacy-label">Important considerations</span><p className="text-sm text-neutral-700">{selectedProduct.clinicalNote}</p></div>
          <p className="text-xs text-neutral-500">Medicine names are for information only. This is not a confirmation that Suga.Health stocks or dispenses this product. Prescribing decisions are made by licensed clinicians.</p>
        </div>
        <div className="p-5 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <span className="text-xs text-neutral-600">Ask a clinician about treatment suitability.</span>
          <Link href="/sign-up?next=%2Fconsultation%2Fstart" onClick={rememberReturnPosition} className="suga-btn suga-consultation-cta inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider">Start consultation</Link>
        </div>
      </Modal>}
    </main>
  );
}

function SectionHeader({ eyebrow, title, subtitle, children, dark = false, centered = false, hideEyebrow = false }: { eyebrow: string; title: React.ReactNode; subtitle?: string; children?: React.ReactNode; dark?: boolean; centered?: boolean; hideEyebrow?: boolean }) {
  return <div className={`editorial-section-heading text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center ${centered ? "editorial-section-heading-centered" : ""}`}>{!hideEyebrow && <span className={"text-xs font-bold tracking-widest uppercase block mb-2.5 " + (dark ? "text-neutral-400" : "text-neutral-500")}>{eyebrow}</span>}<h2 className={"font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance " + (dark ? "text-white" : "text-neutral-950")}>{title}</h2>{subtitle && <p className={"mt-3.5 sm:mt-4 text-sm sm:text-base max-w-2xl leading-relaxed " + (dark ? "text-neutral-400" : "text-neutral-600")}>{subtitle}</p>}{children}</div>;
}

function Modal({ children, label, onClose, stableScroll = false }: { children: React.ReactNode; label: string; onClose: () => void; stableScroll?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  // Keep the document in normal flow while the doctor dialog is open.
  // Fixing the entire body caused the viewport to jump to its top.
  useLayoutEffect(() => {
    if (!stableScroll) return;
    const dialog = ref.current;
    const html = document.documentElement;
    const body = document.body;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlScrollbarGutter: html.style.scrollbarGutter,
      bodyOverflow: body.style.overflow,
    };

    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>(".clinical-dialog-close")?.focus({ preventScroll: true });

    return () => {
      dialog?.close();
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.scrollbarGutter = previous.htmlScrollbarGutter;
      opener?.focus({ preventScroll: true });
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
