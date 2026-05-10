"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrgCard } from "@/components/OrgCard";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import { KZ_CITIES } from "@/lib/cities";
import {
  Car, Home, Wrench, Search, ClipboardList, CheckCircle2,
  Star, ArrowRight, Shield, Zap, Users, ChevronRight, Award,
  MapPin, Clock, TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

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

/* ─── Activity ticker items ─── */
const ACTIVITY_ITEMS = [
  { icon: "🔧", text: "Arman completed auto repair in Almaty", time: "2 min ago" },
  { icon: "🏠", text: "New offer received: apartment renovation in Astana", time: "5 min ago" },
  { icon: "⭐", text: "Zarina rated StroiMaster 5 stars", time: "8 min ago" },
  { icon: "✅", text: "Request accepted: electrical work in Shymkent", time: "12 min ago" },
  { icon: "🔧", text: "Dmitry completed engine diagnostics in Almaty", time: "15 min ago" },
  { icon: "🏠", text: "New request: bathroom renovation in Astana", time: "18 min ago" },
  { icon: "⭐", text: "AutoCity received 5-star review", time: "22 min ago" },
  { icon: "✅", text: "Plumbing work completed in Karaganda", time: "25 min ago" },
];

function ActivityTicker() {
  return (
    <div className="relative overflow-hidden py-2.5 border-y border-border/40 bg-muted/20">
      <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        {[...ACTIVITY_ITEMS, ...ACTIVITY_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-muted-foreground shrink-0">
            <span>{item.icon}</span>
            <span className="font-medium text-foreground/80">{item.text}</span>
            <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <Clock className="h-3 w-3" />{item.time}
            </span>
            <span className="mx-4 text-border/60">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Before/After slider ─── */
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)));
      }}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const touch = e.touches[0];
        setPos(Math.max(5, Math.min(95, ((touch.clientX - rect.left) / rect.width) * 100)));
      }}
    >
      {/* AFTER */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
            <Home className="h-16 w-16 text-emerald-500" />
          </div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400">After renovation</p>
          <p className="text-sm text-muted-foreground mt-1">Clean, modern, beautiful</p>
        </div>
      </div>

      {/* BEFORE — clipped */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="text-center">
          <div className="w-32 h-32 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
            <Wrench className="h-16 w-16 text-orange-400" />
          </div>
          <p className="font-bold text-orange-700 dark:text-orange-400">Before repair</p>
          <p className="text-sm text-muted-foreground mt-1">Old, worn, needs work</p>
        </div>
      </div>

      {/* Divider handle */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-slate-400 rounded" />
            <div className="w-0.5 h-4 bg-slate-400 rounded" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">BEFORE</div>
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">AFTER</div>
    </div>
  );
}

/* ─── Company logos marquee ─── */
const COMPANIES = [
  "AutoCity KZ", "StroiMaster", "ElectroServ", "CleanPro", "PlumbingKZ",
  "RemontBytovoy", "AstanaFix", "AlmatyRepair", "TechService Pro", "BuildKazakhstan",
  "QuickFix KZ", "MasterHands", "ProRenovation", "AutoDiag", "HomeComfort",
];

function CompanyMarquee() {
  return (
    <div className="relative overflow-hidden py-5">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex animate-[marquee_30s_linear_infinite]">
        {[...COMPANIES, ...COMPANIES].map((name, i) => (
          <div key={i} className="flex items-center gap-3 px-5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
              {name[0]}
            </div>
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{name}</span>
            <div className="w-1 h-1 rounded-full bg-border ml-2 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Search bar ─── */
function HeroSearch() {
  const router = useRouter();
  const t = useTranslations("home");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/repair${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl p-2 shadow-xl shadow-black/5">
      {/* City */}
      <div className="flex items-center gap-2 flex-1 px-3 py-1 border-b sm:border-b-0 sm:border-r border-border/40">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="border-0 shadow-none h-9 p-0 font-medium focus:ring-0 text-sm">
            <SelectValue placeholder={t("allCities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("allCities")}</SelectItem>
            {KZ_CITIES.slice(0, 20).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 flex-1 px-3 py-1">
        <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="border-0 shadow-none h-9 p-0 font-medium focus:ring-0 text-sm">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any category</SelectItem>
            <SelectItem value="automobiles">Automobiles</SelectItem>
            <SelectItem value="real-estate">Real Estate</SelectItem>
            <SelectItem value="other">Other Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button */}
      <Button onClick={handleSearch} className="gap-2 rounded-xl h-11 px-5 font-semibold shrink-0">
        <Search className="h-4 w-4" /> {t("searchButton")}
      </Button>
    </div>
  );
}

/* ─── Constants ─── */
const CATEGORIES = [
  {
    icon: Car, label: "Automobiles", desc: "Body repair, diagnostics, detailing",
    href: "/repair?category=automobiles",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-100 dark:border-blue-900",
    count: "80+ services",
  },
  {
    icon: Home, label: "Real Estate", desc: "Renovation, plumbing, electrical",
    href: "/repair?category=real-estate",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900",
    count: "95+ services",
  },
  {
    icon: Wrench, label: "Other Services", desc: "Appliances, furniture, equipment",
    href: "/repair?category=other",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-100 dark:border-violet-900",
    count: "40+ services",
  },
];

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("home");

  const ROTATE_WORDS = t.raw("rotateWords") as string[];

  const STEPS = [
    { n: "01", icon: Search,        title: t("step1Title"), desc: t("step1Desc") },
    { n: "02", icon: ClipboardList, title: t("step2Title"), desc: t("step2Desc") },
    { n: "03", icon: CheckCircle2,  title: t("step3Title"), desc: t("step3Desc") },
  ];

  const FEATURES = [
    { icon: Shield, title: t("benefit1Title"), desc: t("benefit1Desc"), color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600" },
    { icon: Star,   title: t("benefit2Title"), desc: t("benefit2Desc"), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600" },
    { icon: Zap,    title: t("benefit3Title"), desc: t("benefit3Desc"), color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" },
    { icon: Users,  title: "200+ companies",   desc: "Wide network covering all major cities in Kazakhstan.", color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600" },
  ];

  // Show toast if redirected from session expiry
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("session_expired=1")) {
      import("sonner").then(({ toast }) => toast.error("Your session expired. Please log in again."));
      window.history.replaceState({}, "", "/");
    }
  }, []);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [featuredServices, setFeaturedServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    void api.getServices({ active: true }).then((data) => {
      const sorted = [...data]
        .filter((s) => s.rating !== null && s.rating !== undefined)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3);
      setFeaturedServices(sorted.length >= 2 ? sorted : data.slice(0, 3));
    }).catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ════ HERO ════ */}
      <section ref={heroRef} className="relative min-h-[92vh] flex flex-col overflow-hidden">
        {/* Animated mesh gradient background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          {/* Animated blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-15"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)", animation: "blob1 12s ease-in-out infinite" }} />
          <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", animation: "blob2 15s ease-in-out infinite 2s" }} />
          <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-8"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", animation: "blob1 18s ease-in-out infinite 4s" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0"
            style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </motion.div>

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }} className="flex-1 flex items-center">
          <div className="mx-auto max-w-6xl px-4 py-20 w-full">
            <div className="max-w-3xl">

              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary mb-7">
                <Award className="h-3.5 w-3.5" />
                #1 Repair marketplace in Kazakhstan
                <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              </motion.div>

              {/* Heading with typewriter */}
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.05] mb-6">
                {t("heroTitle")}
                <br />
                <TypewriterHero words={ROTATE_WORDS} />
              </motion.h1>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {t("heroDescription")}
              </motion.p>

              {/* Search bar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-xl mb-6">
                <HeroSearch />
              </motion.div>

              {/* Trust row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { icon: CheckCircle2, text: "Free for clients" },
                  { icon: Shield, text: "Verified contractors" },
                  { icon: Star, text: "4.8 average rating" },
                  { icon: MapPin, text: "14 cities in KZ" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════ ACTIVITY TICKER ════ */}
      <ActivityTicker />

      {/* ════ STATS ════ */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { target: 200, suffix: "+", label: t("stats.companies"), icon: Users },
              { target: 1500, suffix: "+", label: t("stats.requests"), icon: CheckCircle2 },
              { target: 14, suffix: "", label: t("stats.services"), icon: MapPin },
              { target: 98, suffix: "%", label: t("stats.rating"), icon: TrendingUp },
            ].map(({ target, suffix, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-black tracking-tight">
                  <Counter target={target} suffix={suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CATEGORIES ════ */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Browse</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Pick your category</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIES.map(({ icon: Icon, label, desc, href, gradient, bg, border, count }, i) => (
              <FadeUp key={label} delay={i * 0.1}>
                <Link href={href}>
                  <div className={`group relative rounded-2xl border p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${bg} ${border} overflow-hidden`}>
                    {/* Background glow */}
                    <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />

                    <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-bold">{label}</h3>
                        <span className="text-xs font-semibold text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">{count}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-3 transition-all duration-200">
                        Browse <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURED SERVICES (real data) ════ */}
      {featuredServices.length > 0 && (
        <section className="py-20 px-4 bg-muted/20">
          <div className="mx-auto max-w-6xl">
            <FadeUp>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Top rated</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t("featuredServices")}</h2>
                </div>
                <Link href="/repair" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200">
                  {t("viewAll")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeUp>

            <div className="flex flex-col gap-4">
              {featuredServices.map((service, i) => (
                <FadeUp key={service.id} delay={i * 0.1}>
                  <OrgCard service={service} />
                </FadeUp>
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/repair">
                <Button variant="outline" className="rounded-xl gap-2">
                  {t("viewAll")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════ HOW IT WORKS ════ */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Process</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{t("howItWorks")}</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">Get connected with verified contractors in 3 simple steps</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Dashed connector */}
            <div className="hidden md:block absolute top-12 left-[calc(16.7%+40px)] right-[calc(16.7%+40px)] border-t-2 border-dashed border-border/60" />

            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <FadeUp key={n} delay={i * 0.15}>
                <div className="relative">
                  <div className="relative mx-auto mb-6 h-24 w-24 flex items-center justify-center">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_20s_linear_infinite]" />
                    {/* Inner card */}
                    <div className="h-20 w-20 rounded-2xl bg-card border-2 border-primary/20 shadow-md flex items-center justify-center group-hover:border-primary transition-colors">
                      <Icon className="h-9 w-9 text-primary" />
                    </div>
                    {/* Step number */}
                    <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black shadow-md">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[10px] font-black text-primary/40 tracking-widest mb-1">{n}</p>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════ BEFORE / AFTER ════ */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">See the difference</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">We transform spaces</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  From broken and worn to fresh and functional. Our verified contractors
                  deliver quality work you can see and feel.
                </p>
                <ul className="space-y-3">
                  {["Professional quality guaranteed", "Transparent pricing — no hidden fees", "Work completed on schedule", "Warranty from every contractor"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-3">
                <BeforeAfterSlider />
                <p className="text-center text-xs text-muted-foreground">← Drag to compare before & after</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════ FEATURES / WHY US ════ */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Why choose us</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t("whyUs")}</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="group rounded-2xl border border-border/50 bg-card p-6 hover:shadow-lg hover:border-border hover:-translate-y-1 transition-all duration-300">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-all duration-200 group-hover:scale-110 ${color}`}>
                    <Icon className="h-5 w-5" />
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
      <section className="py-20 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Reviews</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Clients love Remont.kz</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Asel M.", city: "Almaty", rating: 5, text: "Found a great auto repair shop in 20 minutes. Fair price, excellent quality. Will definitely use again!", role: "Client" },
              { name: "Dmitry K.", city: "Astana", rating: 5, text: "Submitted a request for apartment renovation, got 4 offers the same day. Very happy with the result.", role: "Client" },
              { name: "Zarina T.", city: "Shymkent", rating: 5, text: "No need to call around — companies contact you. Saved a huge amount of time. Love this platform.", role: "Client" },
            ].map(({ name, city, rating, text, role }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <div className="group rounded-2xl border border-border/50 bg-card p-6 flex flex-col gap-4 hover:shadow-lg hover:border-border transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-black text-primary">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      <p className="text-xs text-muted-foreground">{role} · {city}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">Verified</span>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════ COMPANY LOGOS ════ */}
      <section className="py-14 px-4 border-y border-border/40">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <p className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-widest">
              Trusted by 200+ companies across Kazakhstan
            </p>
          </FadeUp>
          <CompanyMarquee />
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-blue-600 p-12 md:p-16 text-white text-center">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/5" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                  200+ companies waiting for your request
                </div>

                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                  {t("ctaTitle")}
                </h2>
                <p className="text-white/75 mb-8 max-w-md mx-auto text-lg">
                  {t("ctaDesc")}
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/repair">
                    <Button size="lg" variant="secondary" className="h-12 px-7 font-bold rounded-xl text-base shadow-lg">
                      {t("viewAll")}
                    </Button>
                  </Link>
                  {!user ? (
                    <AuthModal defaultMode="register" trigger={
                      <Button size="lg" className="h-12 px-7 font-bold rounded-xl text-base bg-white text-primary hover:bg-white/95 shadow-lg">
                        {t("ctaButton")}
                      </Button>
                    } />
                  ) : (
                    <Link href="/repair">
                      <Button size="lg" className="h-12 px-7 font-bold rounded-xl text-base bg-white text-primary hover:bg-white/95 shadow-lg">
                        {t("ctaButton")}
                      </Button>
                    </Link>
                  )}
                </div>

                <p className="mt-6 text-white/50 text-sm">No credit card required · Free for clients</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
