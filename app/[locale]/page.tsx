"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { OrgCard } from "@/components/OrgCard";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import {
  Car, Home, Wrench, Search, ClipboardList, CheckCircle2,
  Star, ArrowRight, Shield, Zap, Users, ChevronRight, Award,
  MapPin, Clock, TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const step = target / (1600 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

/* ─── Fade up on scroll ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >{children}</motion.div>
  );
}

function FadeLeft({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >{children}</motion.div>
  );
}

function FadeRight({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >{children}</motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        className="h-full bg-amber-400 rounded-full"
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : {}}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─── Typewriter rotating words ─── */
function TypewriterHero({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const ACTIVITY_ICONS = [Wrench, Home, Star, CheckCircle2, Wrench, Home, Star, CheckCircle2];

function ActivityTicker() {
  const t = useTranslations("home");
  const items = t.raw("activityItems") as { text: string; time: string }[];
  return (
    <div className="relative overflow-hidden py-2.5 border-y border-border/40 bg-muted/20">
      <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map(({ text, time }, i) => {
          const Icon = ACTIVITY_ICONS[i % ACTIVITY_ICONS.length];
          return (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-muted-foreground shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground/80">{text}</span>
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <Clock className="h-3 w-3" />{time}
              </span>
              <span className="mx-4 text-border/40">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

const BA_URLS = [
  { before: "/slides/apartment-before.jpg", after: "/slides/apartment-after.jpg" },
  { before: "/slides/car-before.jpg",       after: "/slides/car-after.jpg" },
  { before: "/slides/bag-before.jpg",       after: "/slides/bag-after.jpg" },
  { before: "/slides/headphones-before.jpg",after: "/slides/headphones-after.jpg" },
  { before: "/slides/watch-before.jpg",     after: "/slides/watch-after.jpg" },
];

function BeforeAfterSlider() {
  const t = useTranslations("home");
  const slideTexts = t.raw("baSlides") as { label: string; beforeCaption: string; afterCaption: string }[];

  const [pos, setPos] = useState(50);
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);
  const hovered = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (hovered.current) return;
      setFading(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % BA_URLS.length);
        setPos(50);
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const urls = BA_URLS[slide];
  const text = slideTexts[slide];

  return (
    <div className="space-y-3">
      <div
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-col-resize select-none"
        style={{ opacity: fading ? 0 : 1, transition: "opacity 0.4s" }}
        onMouseEnter={() => { hovered.current = true; }}
        onMouseLeave={() => { hovered.current = false; }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)));
        }}
        onTouchMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos(Math.max(5, Math.min(95, ((e.touches[0].clientX - rect.left) / rect.width) * 100)));
        }}
      >
        {/* AFTER */}
        <div className="absolute inset-0 bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urls.after} alt="after" className="w-full h-full object-cover" />
        </div>

        {/* BEFORE — clipped to left of handle */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urls.before} alt="before" className="w-full h-full object-cover" />
        </div>

        {/* Caption overlays */}
        <div className="absolute bottom-3 left-3 right-1/2 pr-2">
          <span className="inline-block bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md truncate max-w-full">
            {text?.beforeCaption}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 left-1/2 pl-2 flex justify-end">
          <span className="inline-block bg-emerald-600/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md truncate max-w-full">
            {text?.afterCaption}
          </span>
        </div>

        {/* Divider handle */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-slate-400 rounded" />
              <div className="w-0.5 h-4 bg-slate-400 rounded" />
            </div>
          </div>
        </div>

        {/* BEFORE / AFTER labels */}
        <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">{t("before")}</div>
        <div className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">{t("after")}</div>

        {/* Slide label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
          {text?.label}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2 py-3">
        {BA_URLS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setSlide(i); setPos(50); setFading(false); }, 400); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
          />
        ))}
      </div>
    </div>
  );
}


/* ─── Scroll progress bar ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[100] origin-left"
      style={{ scaleX }}
    />
  );
}

const NAV_SECTION_IDS = ["hero", "before-after", "stats", "categories", "services", "how-it-works", "why-us", "testimonials", "cta"];

function SectionNav() {
  const t = useTranslations("home");
  const navLabels = t.raw("navLabels") as string[];
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers = NAV_SECTION_IDS.map((id, i) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, []);

  function scrollTo(id: string) {
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2.5 bg-background/70 backdrop-blur-md border border-border/40 shadow-sm rounded-full px-1.5 py-3">
      {NAV_SECTION_IDS.map((id, i) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          title={navLabels[i]}
          className="group relative flex items-center justify-end"
        >
          <span className="absolute right-5 whitespace-nowrap text-xs font-medium bg-popover border border-border text-foreground px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {navLabels[i]}
          </span>
          <div className={`rounded-full transition-all duration-300 ${
            active === i
              ? "h-3 w-3 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
              : "h-2 w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
          }`} />
        </button>
      ))}
    </div>
  );
}

/* ─── Wrapper that disables navigation for company users ─── */
function ClientLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const { user } = useAuth();
  if (user?.role === "company") {
    return <span className={`opacity-40 cursor-not-allowed pointer-events-none select-none ${className}`}>{children}</span>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth();
  const isCompany = user?.role === "company";
  const heroRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("home");

  const ROTATE_WORDS = t.raw("rotateWords") as string[];

  const STEPS = [
    { n: "01", icon: Search,        title: t("step1Title"), desc: t("step1Desc") },
    { n: "02", icon: ClipboardList, title: t("step2Title"), desc: t("step2Desc") },
    { n: "03", icon: CheckCircle2,  title: t("step3Title"), desc: t("step3Desc") },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("session_expired=1")) {
      import("sonner").then(({ toast }) => toast.error(t("sessionExpired")));
      window.history.replaceState({}, "", "/");
    }
  }, [t]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [featuredServices, setFeaturedServices] = useState<ServiceRecord[]>([]);
  const [liveStats, setLiveStats] = useState<{ services: number; companies: number; completedRequests: number; avgRating: number } | null>(null);

  useEffect(() => {
    void fetch("/api/stats").then(r => r.json()).then(setLiveStats).catch(() => null);
  }, []);

  useEffect(() => {
    void api.getServices({ active: true }).then((data) => {
      const sorted = [...data]
        .filter((s) => s.rating !== null && s.rating !== undefined)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3);
      setFeaturedServices(sorted.length >= 2 ? sorted : data.slice(0, 3));
    }).catch(() => null);
  }, []);

  const trustItems = [
    { icon: CheckCircle2, text: t("trustFree") },
    { icon: Shield,       text: t("trustVerified") },
    { icon: Star,         text: t("trustRating") },
    { icon: MapPin,       text: t("trustCities") },
  ];

  const catLinks = [
    { label: t("catAuto"),       href: "/repair?category=automobiles",  icon: Car },
    { label: t("catRenovation"), href: "/repair?category=renovation",   icon: Home },
    { label: t("catPlumbing"),   href: "/repair?category=plumbing",     icon: Wrench },
    { label: t("catElectrical"), href: "/repair?category=electrical",   icon: Zap },
    { label: t("catCleaning"),   href: "/repair?category=cleaning",     icon: CheckCircle2 },
    { label: t("catPainting"),   href: "/repair?category=painting",     icon: Shield },
    { label: t("catRoofing"),    href: "/repair?category=roofing",      icon: TrendingUp },
    { label: t("catAll"),        href: "/repair",                       icon: ArrowRight },
  ];

  const baBullets = t.raw("baBullets") as string[];

  const baStats = [
    { value: "98%",  label: t("baStatSatisfaction"), icon: Star },
    { value: "2h",   label: t("baStatFirstOffer"),   icon: Clock },
    { value: "500+", label: t("baStatJobs"),          icon: CheckCircle2 },
    { value: "4.8",  label: t("baStatRating"),        icon: TrendingUp },
  ];

  const mainStats = [
    { target: liveStats?.companies ?? 200,          suffix: "+", label: t("statVerifiedCompanies"), sub: t("statVerifiedSub"),    icon: Users,        color: "from-blue-500 to-cyan-500" },
    { target: liveStats?.completedRequests ?? 1500, suffix: "+", label: t("statCompleted"),         sub: t("statCompletedSub"),   icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
    { target: liveStats?.services ?? 14,            suffix: "+", label: t("statActive"),            sub: t("statActiveSub"),      icon: MapPin,       color: "from-violet-500 to-purple-500" },
    { target: Math.round((liveStats?.avgRating ?? 4.8) * 10), suffix: "%", label: t("statAvgRating"), sub: t("statAvgRatingSub"), icon: TrendingUp,   color: "from-amber-500 to-orange-500" },
  ];

  const secondaryStats = [
    { value: t("statTimeValue"),    label: t("statTimeLabel"),    icon: Clock },
    { value: t("statFreeValue"),    label: t("statFreeLabel"),    icon: CheckCircle2 },
    { value: t("statWarrantyValue"),label: t("statWarrantyLabel"),icon: Shield },
  ];

  const categoryCards = [
    {
      icon: Car, label: t("catAutoTitle"), href: "/repair?category=automobiles",
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-100 dark:border-blue-900",
      desc: t("catAutoDesc"),
      items: t.raw("catAutoItems") as string[],
      count: t("catAutoCount"),
    },
    {
      icon: Home, label: t("catRealEstateTitle"), href: "/repair?category=real-estate",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900",
      desc: t("catRealEstateDesc"),
      items: t.raw("catRealEstateItems") as string[],
      count: t("catRealEstateCount"),
    },
    {
      icon: Wrench, label: t("catOtherTitle"), href: "/repair?category=other",
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-900",
      desc: t("catOtherDesc"),
      items: t.raw("catOtherItems") as string[],
      count: t("catOtherCount"),
    },
  ];

  const benefits = [
    { icon: CheckCircle2, label: t("benefitFree") },
    { icon: Shield,       label: t("benefitVerified") },
    { icon: Clock,        label: t("benefitFirstOffer") },
    { icon: Star,         label: t("benefitRating") },
  ];

  const vcTags = [t("vcTag1"), t("vcTag2"), t("vcTag3")];

  const ratingMetrics = [
    { l: t("ratingQuality"), v: 96 },
    { l: t("ratingComm"),    v: 94 },
    { l: t("ratingOnTime"),  v: 91 },
  ];

  const whyCards = [
    { icon: Zap,          title: t("whyCard1Title"), desc: t("whyCard1Desc"), color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" },
    { icon: Users,        title: t("whyCard2Title"), desc: t("whyCard2Desc"), color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600" },
    { icon: CheckCircle2, title: t("whyCard3Title"), desc: t("whyCard3Desc"), color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600" },
  ];

  const reviews = [
    { name: t("review1Name"), city: t("review1City"), rating: 5, text: t("review1Text") },
    { name: t("review2Name"), city: t("review2City"), rating: 5, text: t("review2Text") },
    { name: t("review3Name"), city: t("review3City"), rating: 5, text: t("review3Text") },
  ];

  const ctaTrustItems = [
    { icon: CheckCircle2, label: t("trustFree") },
    { icon: Shield,       label: t("trustVerified") },
    { icon: Star,         label: t("trustRating") },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollProgress />
      <SectionNav />

      {/* ════ HERO ════ */}
      <section id="hero" ref={heroRef}
        className="relative overflow-hidden min-h-[calc(100vh-64px)] flex flex-col justify-center">

        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-20 dark:opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-8"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full opacity-10 dark:opacity-5"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="w-full">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center flex flex-col items-center gap-0">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary mb-8">
              <Award className="h-3.5 w-3.5" />
              {t("heroBadge")}
              <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            </motion.div>

            {/* Heading */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[80px] font-black tracking-tight leading-[1.05] mb-6">
              {t("heroTitle")}
              <br />
              <TypewriterHero words={ROTATE_WORDS} />
            </motion.h1>

            {/* Subtitle */}
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {t("heroDescription")}
            </motion.p>

            {/* CTA buttons */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-10">
              <ClientLink href="/repair">
                <Button size="lg" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base shadow-lg shadow-primary/20">
                  <Search className="h-4 w-4" /> {t("browseServices")}
                </Button>
              </ClientLink>
              <ClientLink href="/companies">
                <Button size="lg" variant="outline" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base">
                  <Users className="h-4 w-4" /> {t("viewCompanies")}
                </Button>
              </ClientLink>
            </motion.div>

            {/* Trust row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-14">
              {trustItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>

            {/* Category quick-links */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
              className="w-full">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-4 font-medium">{t("popularCategories")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {catLinks.map(({ label, href, icon: Icon }) => (
                  <ClientLink key={label} href={href}>
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:text-primary transition-all duration-200 text-sm text-muted-foreground cursor-pointer">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </div>
                  </ClientLink>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <ActivityTicker />
        </motion.div>
      </section>

      {/* ════ BEFORE / AFTER ════ */}
      <section id="before-after" className="min-h-screen flex flex-col justify-center py-16 overflow-hidden">

        <div className="mx-auto max-w-6xl w-full px-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <FadeLeft>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {t("baTitle")}
              </h2>
            </FadeLeft>
            <FadeRight delay={0.15}>
              <ul className="space-y-2.5">
                {baBullets.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeRight>
          </div>
        </div>

        <FadeUp delay={0.1}>
          <div className="mx-auto max-w-6xl w-full px-4">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border/30">
              <BeforeAfterSlider />
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="mx-auto max-w-6xl w-full px-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {baStats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/60 px-5 py-4">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="text-lg font-black leading-none">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

      </section>

      {/* ════ STATS ════ */}
      <section id="stats" className="min-h-screen flex flex-col justify-center px-4 py-20 bg-muted/20 overflow-hidden">
        <div className="mx-auto max-w-6xl w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("statsBadge")}</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
                {t("statsTitle")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t("statsDesc")}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {mainStats.map(({ target, suffix, label, sub, icon: Icon, color }, i) => (
              <ScaleIn key={label} delay={i * 0.12}>
                <div className="relative group rounded-3xl border border-border/50 bg-card p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} mb-5 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black tracking-tight mb-1">
                    <Counter target={target} suffix={suffix} />
                  </div>
                  <div className="font-semibold text-sm mb-1">{label}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </div>
              </ScaleIn>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {secondaryStats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/60 px-6 py-4">
                  <Icon className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <div className="text-xl font-black">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════ CATEGORIES ════ */}
      <section id="categories" className="min-h-screen flex flex-col justify-center px-4 py-16">
        <div className="mx-auto max-w-6xl w-full">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("catBadge")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("catTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                {t("catDesc")}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCards.map(({ icon: Icon, label, href, gradient, bg, border, desc, items, count }, i) => (
              <ScaleIn key={label} delay={i * 0.15}>
                <ClientLink href={href}>
                  <div className={`group relative rounded-3xl border p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer h-full flex flex-col ${bg} ${border} overflow-hidden`}>
                    <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-25 transition-opacity blur-2xl`} />
                    <div className={`relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-black">{label}</h3>
                      <span className="text-xs font-semibold text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full shrink-0 mt-1">{count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{desc}</p>
                    <div className="flex flex-wrap gap-2 mb-8 flex-1">
                      {items.map(item => (
                        <span key={item} className="text-xs bg-background/60 border border-border/40 px-2.5 py-1 rounded-full text-muted-foreground">{item}</span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-4 transition-all duration-300">
                      {t("browseAll")} <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </ClientLink>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURED SERVICES ════ */}
      <section id="services" className="min-h-screen flex flex-col justify-center px-4 py-16 bg-muted/20">
        {featuredServices.length > 0 ? (
          <div className="mx-auto max-w-6xl w-full">
            <FadeUp>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t("topRatedBadge")}</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t("featuredServices")}</h2>
                </div>
                {!isCompany && (
                  <Link href="/repair" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200">
                    {t("viewAll")} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </FadeUp>
            <div className="flex flex-col gap-4">
              {featuredServices.map((service, i) => (
                <FadeUp key={service.id} delay={i * 0.1}>
                  <OrgCard service={service} disableNavigation={isCompany} />
                </FadeUp>
              ))}
            </div>
            {!isCompany && (
              <div className="mt-6 text-center sm:hidden">
                <Link href="/repair">
                  <Button variant="outline" className="rounded-xl gap-2">
                    {t("viewAll")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl w-full text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("topRatedBadge")}</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">{t("featuredServices")}</h2>
            {!isCompany && (
              <Link href="/repair">
                <Button size="lg" className="rounded-xl gap-2 mt-4">
                  <Search className="h-4 w-4" /> {t("browseAllServices")}
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how-it-works" className="min-h-screen flex flex-col justify-center px-4 py-16">
        <div className="mx-auto max-w-6xl w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("processBadge")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("howItWorks")}</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">{t("howItWorksSubDesc")}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-16">
            <div className="hidden md:block absolute top-16 left-[calc(16.7%+56px)] right-[calc(16.7%+56px)] border-t-2 border-dashed border-primary/20" />
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <FadeUp key={n} delay={i * 0.15}>
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-8 h-32 w-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-primary/10" />
                    <div className="h-24 w-24 rounded-3xl bg-card border-2 border-primary/20 shadow-xl flex items-center justify-center group-hover:border-primary group-hover:shadow-primary/10 transition-all duration-300">
                      <Icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black shadow-lg ring-4 ring-background">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-primary/40 tracking-widest mb-2">{n}</p>
                  <h3 className="text-xl font-bold mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 px-5 py-4">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ════ WHY US ════ */}
      <section id="why-us" className="min-h-screen flex flex-col justify-center px-4 py-16 bg-muted/20">
        <div className="mx-auto max-w-6xl w-full">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("whyBadge")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("whyUs")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                {t("whyDesc")}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            <FadeLeft delay={0.05} className="lg:col-span-2">
              <div className="group relative rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-8 h-full overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 mb-6">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{t("vcTitle")}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{t("vcDesc")}</p>
                  <div className="flex flex-wrap gap-2">
                    {vcTags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeLeft>

            <FadeRight delay={0.1}>
              <div className="group relative rounded-3xl border border-border/50 bg-card p-8 h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/10 blur-xl" />
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 mb-6">
                  <Star className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-black mb-3">{t("ratingTitle")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t("ratingDesc")}</p>
                <div className="space-y-2">
                  {ratingMetrics.map(({ l, v }) => (
                    <div key={l}>
                      <div className="flex justify-between text-xs mb-1"><span>{l}</span><span className="font-bold">{v}%</span></div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeRight>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyCards.map(({ icon: Icon, title, desc, color }, i) => (
              <FadeUp key={title} delay={i * 0.1 + 0.2}>
                <div className="group rounded-2xl border border-border/50 bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section id="testimonials" className="min-h-screen flex flex-col justify-center px-4 py-16">
        <div className="mx-auto max-w-6xl w-full">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-14">
            <FadeLeft>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("reviewsBadge")}</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                  {t("reviewsTitle")}
                </h2>
                <p className="text-muted-foreground text-lg">{t("reviewsDesc")}</p>
              </div>
            </FadeLeft>
            <FadeRight delay={0.1}>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center">
                  <div className="text-7xl font-black tracking-tight text-primary">4.8</div>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-5 w-5 ${i <= 4 ? "fill-amber-400 text-amber-400" : "fill-amber-200 text-amber-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("outOf5")}</p>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[{stars:5,pct:82,d:0.1},{stars:4,pct:11,d:0.15},{stars:3,pct:4,d:0.2},{stars:2,pct:2,d:0.25},{stars:1,pct:1,d:0.3}].map(({stars,pct,d})=>(
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right text-muted-foreground">{stars}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      <AnimatedBar pct={pct} delay={d} />
                      <span className="w-6 text-muted-foreground">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeRight>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map(({ name, city, rating, text }, i) => (
              <ScaleIn key={name} delay={i * 0.12}>
                <div className="group rounded-2xl border border-border/50 bg-card p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-black text-primary">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      <p className="text-xs text-muted-foreground">{t("clientLabel")} · {city}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">{t("verifiedLabel")}</span>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>


      {/* ════ CTA ════ */}
      <section id="cta" className="min-h-screen flex flex-col">
        <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-600 flex flex-col items-center justify-center text-white text-center px-4 py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-3xl -translate-y-1/2 pointer-events-none" />

          <FadeUp className="relative max-w-3xl mx-auto w-full">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold mb-8">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
              {t("ctaBadge")}
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              {t("ctaTitle")}
            </h2>
            <p className="text-white/75 mb-10 text-xl max-w-lg mx-auto leading-relaxed">
              {t("ctaDesc")}
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <ClientLink href="/repair">
                <Button size="lg" variant="secondary" className="h-14 px-10 font-bold rounded-xl text-base shadow-xl">
                  {t("viewAll")}
                </Button>
              </ClientLink>
              {!user ? (
                <AuthModal defaultMode="register" trigger={
                  <Button size="lg" className="h-14 px-10 font-bold rounded-xl text-base bg-white text-primary hover:bg-white/95 shadow-xl">
                    {t("ctaButton")}
                  </Button>
                } />
              ) : !isCompany ? (
                <Link href="/repair">
                  <Button size="lg" className="h-14 px-10 font-bold rounded-xl text-base bg-white text-primary hover:bg-white/95 shadow-xl">
                    {t("ctaButton")}
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {ctaTrustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon className="h-4 w-4 text-white/80" /> {label}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
