"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, useInView } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Code2, Database, Shield, Zap, Globe, CheckCircle2,
  Users, MessageSquare, Star, MapPin, ArrowRight,
  Server, Lock, Mail, Smartphone, PlusCircle, Wrench, Building2, User,
} from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >{children}</motion.div>
  );
}

function FadeLeft({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
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
  const inView = useInView(ref, { once: true, margin: "-50px" });
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

const TECH_BADGES = [
  "Next.js 14", "TypeScript", "PostgreSQL", "Prisma 7",
  "Tailwind CSS", "JWT + 2FA", "Resend", "next-intl",
];

const LIFECYCLE_STEPS = [
  { status: "NEW",         icon: PlusCircle,  gradient: "from-blue-500 to-blue-600",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",       label: "Client posts request",  desc: "Category, city, description and budget in 2 min" },
  { status: "OFFERS",      icon: MessageSquare, gradient: "from-violet-500 to-violet-600", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", label: "Companies bid",         desc: "Multiple offers with prices and messages arrive" },
  { status: "ACCEPTED",    icon: CheckCircle2,  gradient: "from-amber-500 to-amber-600",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",    label: "Best offer chosen",     desc: "Client picks the winner — others auto-rejected" },
  { status: "IN PROGRESS", icon: Wrench,        gradient: "from-orange-500 to-orange-600", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", label: "Work underway",         desc: "Real-time SSE chat between client and company" },
  { status: "COMPLETED",   icon: Star,          gradient: "from-emerald-500 to-emerald-600", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", label: "Done & reviewed",  desc: "Client rates 1–5 stars; rating updates profile" },
];

const CLIENT_STEPS = [
  "Post a request in 2 minutes",
  "Receive competing offers from companies",
  "Chat with companies via real-time SSE",
  "Accept the best price & terms",
  "Rate the completed job (1–5 stars)",
];

const COMPANY_STEPS = [
  "Browse open requests by category & city",
  "Submit offers with price and message",
  "Manage all jobs in Kanban board",
  "Chat with clients in real time",
  "Build profile rating from client reviews",
];

/* Static icon arrays — parallel to translation arrays */
const STAT_ICONS = [Server, Globe, Users, MapPin];

const TECH_ICONS = [Code2, Database, Lock, Zap, Mail, Shield, Smartphone, Globe];
const TECH_COLORS = [
  "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
  "bg-violet-50 dark:bg-violet-950/40 text-violet-600",
  "bg-amber-50 dark:bg-amber-950/40 text-amber-600",
  "bg-pink-50 dark:bg-pink-950/40 text-pink-600",
  "bg-teal-50 dark:bg-teal-950/40 text-teal-600",
  "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
  "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600",
];

const FEATURE_ICONS = [Users, MessageSquare, Star, CheckCircle2, Shield, MapPin, Zap, Globe, Database, Code2, Lock, Mail];

/* Animated flow dot — mask on connector fades dot at card edges (illusion of going under) */
function FlowDot({ delay = 0, duration = 2, color = "bg-primary" }: { delay?: number; duration?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute h-2 w-2 rounded-full ${color} shadow-lg`}
      initial={{ top: "0%" }}
      animate={{ top: ["0%", "100%", "100%", "0%"] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      style={{ left: "calc(50% - 4px)" }}
    />
  );
}

/* Architecture interactive diagram */
function ArchDiagram() {
  const t = useTranslations("about");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const node = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    color: string,
    delay: number
  ) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl border-2 ${color} p-5 text-center hover:shadow-xl transition-shadow duration-300 bg-card`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </motion.div>
  );

  return (
    <div ref={ref} className="relative">
      {/* Row 1: Browser */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5 mb-0 text-center"
      >
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-blue-700 dark:text-blue-300">{t("browserClient")}</p>
              <p className="text-xs text-muted-foreground">{t("browserSubtitle")}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground border-l border-blue-200 dark:border-blue-800 pl-4">
            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> PWA</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 2FA TOTP</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> SSE stream</span>
          </div>
        </div>
      </motion.div>

      {/* Connector: Browser → Next.js */}
      <div className="relative h-14 flex items-center justify-center mx-auto w-0.5 bg-border/60"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)" }}>
        {inView && <FlowDot delay={0.2} duration={1.5} color="bg-blue-500" />}
        {inView && <FlowDot delay={0.9} duration={1.5} color="bg-blue-400" />}
        <span className="absolute right-3 text-[10px] text-muted-foreground whitespace-nowrap">{t("httpFetch")}</span>
      </div>

      {/* Row 2: Next.js */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 mb-0"
      >
        <p className="text-xs font-bold text-primary uppercase tracking-widest text-center mb-4">Next.js 14 App Router</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/20 bg-card p-3 text-center">
            <Code2 className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-xs font-semibold">{t("pagesSSR")}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("pagesSSRSub")}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-card p-3 text-center">
            <Server className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-xs font-semibold">{t("apiRoutes")}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("apiRoutesSub")}</p>
          </div>
        </div>
      </motion.div>

      {/* Connector: Next.js → services */}
      <div className="relative h-14 flex items-center justify-center mx-auto w-0.5 bg-border/60"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)" }}>
        {inView && <FlowDot delay={0.5} duration={1.8} color="bg-primary" />}
        {inView && <FlowDot delay={1.3} duration={1.8} color="bg-primary/60" />}
      </div>

      {/* Row 3: Services */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {node(
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>,
          "PostgreSQL", t("dbSubtitle"),
          "border-emerald-200 dark:border-emerald-800", 0.4
        )}
        {node(
          <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mx-auto">
            <Mail className="h-5 w-5 text-pink-600" />
          </div>,
          "Resend", t("emailSubtitle"),
          "border-pink-200 dark:border-pink-800", 0.5
        )}
        {node(
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>,
          "SSE Stream", t("sseSubtitle"),
          "border-amber-200 dark:border-amber-800", 0.6
        )}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground"
      >
        {[
          { color: "bg-blue-500", label: t("httpRequest") },
          { color: "bg-primary", label: t("apiCall") },
          { color: "bg-emerald-500", label: t("dbQuery") },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  const t = useTranslations("about");
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const stats = t.raw("stats") as { value: string; label: string }[];
  const tech = t.raw("tech") as { label: string; desc: string }[];
  const features = t.raw("features") as { label: string; desc: string }[];

  const missionPoints = [
    t("missionPoint1"),
    t("missionPoint2"),
    t("missionPoint3"),
    t("missionPoint4"),
  ];

  const missionStats = [
    { value: t("missionStat1Value"), label: t("missionStat1Label"), icon: Zap, color: "from-blue-500 to-cyan-500" },
    { value: t("missionStat2Value"), label: t("missionStat2Label"), icon: MessageSquare, color: "from-emerald-500 to-teal-500" },
    { value: t("missionStat3Value"), label: t("missionStat3Label"), icon: Star, color: "from-amber-500 to-orange-500" },
    { value: t("missionStat4Value"), label: t("missionStat4Label"), icon: CheckCircle2, color: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
          {t("heroBadge")}
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          {t("heroTitle")} <span className="text-primary">Remont.kz</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          {t("heroDesc")}
        </motion.p>

        {!isCompany && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-3">
            <Link href="/repair">
              <Button size="lg" className="rounded-xl gap-2 h-12 px-7 font-semibold">
                <Globe className="h-4 w-4" /> {t("browseServices")}
              </Button>
            </Link>
            <Link href="/companies">
              <Button size="lg" variant="outline" className="rounded-xl gap-2 h-12 px-7 font-semibold">
                <Users className="h-4 w-4" /> {t("viewCompanies")}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Tech badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {TECH_BADGES.map((badge, i) => (
            <motion.span key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="px-3 py-1.5 rounded-full bg-muted/80 border border-border/60 text-xs font-mono text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-default"
            >
              {badge}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-14 px-4 bg-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <ScaleIn key={label} delay={i * 0.1}>
                  <div className="text-center group">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors mx-auto">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-4xl font-black tracking-tight text-primary">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{label}</div>
                  </div>
                </ScaleIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeLeft>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("ourMission")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                {t("missionTitle")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{t("missionDesc")}</p>
              <ul className="space-y-3">
                {missionPoints.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeLeft>

            <FadeRight delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {missionStats.map(({ value, label, icon: Icon, color }, i) => (
                  <ScaleIn key={label} delay={i * 0.08}>
                    <div className="relative group rounded-2xl border border-border/50 bg-card p-6 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} mb-4 shadow-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-3xl font-black mb-1">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </FadeRight>
          </div>
        </div>
      </section>

      {/* ── Request Lifecycle ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("lifecycleBadge")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("lifecycleTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t("lifecycleDesc")}</p>
            </div>
          </FadeUp>

          {/* Step flow */}
          <div className="relative mb-16">
            {/* Gradient connector line — desktop only */}
            <div className="hidden lg:block absolute top-12 left-[calc(10%+2.5rem)] right-[calc(10%+2.5rem)] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 via-amber-500 via-orange-500 to-emerald-500 opacity-30" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {LIFECYCLE_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <ScaleIn key={step.status} delay={i * 0.1}>
                    <div className="relative flex flex-col items-center text-center gap-3">
                      <div className={`relative z-10 h-24 w-24 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-zinc-900`}>
                        <Icon className="h-10 w-10 text-white" />
                        {i === 4 && <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-20" />}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${step.badge}`}>
                        {step.status}
                      </span>
                      <p className="font-bold text-sm">{step.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-[150px]">{step.desc}</p>
                    </div>
                  </ScaleIn>
                );
              })}
            </div>
          </div>

          {/* Client vs Company split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeLeft delay={0.2}>
              <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-blue-500 flex items-center justify-center shadow">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{t("lifecycleClientTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("lifecycleClientDesc")}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {CLIENT_STEPS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeLeft>

            <FadeRight delay={0.2}>
              <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{t("lifecycleCompanyTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("lifecycleCompanyDesc")}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {COMPANY_STEPS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeRight>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("featuresBuilt")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("featuresTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t("featuresDesc")}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ label, desc }, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <ScaleIn key={label} delay={Math.floor(i / 3) * 0.1 + (i % 3) * 0.05}>
                  <div className="group flex gap-4 rounded-2xl border border-border/50 bg-card p-5 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </ScaleIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("techBuiltWith")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("techTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t("techDesc")}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tech.map(({ label, desc }, i) => {
              const Icon = TECH_ICONS[i];
              return (
                <ScaleIn key={label} delay={Math.floor(i / 4) * 0.1 + (i % 4) * 0.07}>
                  <div className="group rounded-2xl border border-border/50 bg-card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform ${TECH_COLORS[i]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-sm mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </ScaleIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("archHowItWorks")}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("archTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">{t("archDesc")}</p>
            </div>
          </FadeUp>

          <div className="rounded-3xl border border-border/50 bg-card p-8 mb-8">
            <ArchDiagram />
          </div>

          <FadeUp delay={0.2}>
            <div className="rounded-3xl border border-border/50 bg-card p-8">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> {t("dbSchema")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "User",           color: "bg-blue-500" },
                  { name: "Service",        color: "bg-emerald-500" },
                  { name: "ServiceImage",   color: "bg-teal-500" },
                  { name: "Request",        color: "bg-violet-500" },
                  { name: "RequestOffer",   color: "bg-purple-500" },
                  { name: "Message",        color: "bg-amber-500" },
                  { name: "Favorite",       color: "bg-pink-500" },
                  { name: "Payment",        color: "bg-orange-500" },
                  { name: "PortfolioPhoto", color: "bg-cyan-500" },
                  { name: "AuditLog",       color: "bg-red-500" },
                  { name: "PromoCode",      color: "bg-lime-500" },
                ].map(({ name, color }, i) => (
                  <motion.div key={name}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                    className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-2.5 text-sm font-mono hover:border-primary/30 transition-colors">
                    <span className={`h-2 w-2 rounded-full ${color} shrink-0`} />
                    {name}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground text-lg mb-8">{t("ctaDesc")}</p>
            {!isCompany && (
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/repair">
                  <Button size="lg" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base shadow-lg shadow-primary/20">
                    {t("browseServices")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button size="lg" variant="outline" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base">
                    {t("howItWorks")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
