"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Code2, Database, Shield, Zap, Globe, CheckCircle2,
  Users, MessageSquare, Star, MapPin, ArrowRight,
  Server, Lock, Mail, Smartphone,
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

const STATS = [
  { value: "34+",  label: "API endpoints",   icon: Server },
  { value: "10",   label: "Service categories", icon: Globe },
  { value: "200+", label: "Verified companies", icon: Users },
  { value: "14",   label: "Cities in KZ",     icon: MapPin },
];

const TECH = [
  { icon: Code2,    label: "Next.js 14",       desc: "App Router, SSR, API Routes",       color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600" },
  { icon: Database, label: "PostgreSQL",        desc: "Prisma ORM v7, connection pooling",  color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" },
  { icon: Lock,     label: "JWT Auth",          desc: "bcrypt, rate limiting, reCAPTCHA",  color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600" },
  { icon: Zap,      label: "SSE Chat",          desc: "Real-time via Server-Sent Events",  color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600" },
  { icon: Mail,     label: "Nodemailer",        desc: "Email verification, notifications", color: "bg-pink-50 dark:bg-pink-950/40 text-pink-600" },
  { icon: Shield,   label: "Security",          desc: "Zod validation, XSS sanitization",  color: "bg-teal-50 dark:bg-teal-950/40 text-teal-600" },
  { icon: Smartphone, label: "PWA",            desc: "Installable, offline-ready manifest", color: "bg-orange-50 dark:bg-orange-950/40 text-orange-600" },
  { icon: Globe,    label: "i18n",             desc: "next-intl: RU, EN, KZ locales",      color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600" },
];

const FEATURES = [
  { icon: Users,          label: "Client & Company roles",       desc: "Separate dashboards, permissions and flows for each role." },
  { icon: MessageSquare,  label: "Real-time chat",               desc: "SSE-powered messaging with file uploads and read receipts." },
  { icon: Star,           label: "Reviews & ratings",            desc: "Verified reviews from completed jobs only — no fake data." },
  { icon: CheckCircle2,   label: "Offer system",                 desc: "Companies compete for requests; clients accept the best offer." },
  { icon: Shield,         label: "Email verification",           desc: "Token-based flow with Mailtrap/SMTP for all environments." },
  { icon: MapPin,         label: "Geo-filtering",                desc: "Services filtered by city with OSM geocoding for coordinates." },
  { icon: Zap,            label: "Kanban board",                 desc: "Company dashboard with drag-friendly request status tracking." },
  { icon: Globe,          label: "Service comparison",           desc: "Side-by-side compare up to 3 services with all attributes." },
  { icon: Database,       label: "Admin panel",                  desc: "User management, audit logs, promo codes, service moderation." },
  { icon: Code2,          label: "Portfolio system",             desc: "Companies upload before/after work photos to their profile." },
  { icon: Lock,           label: "Rate limiting",                desc: "In-memory rate limits on auth, offers, messages endpoints." },
  { icon: Mail,           label: "Email notifications",          desc: "Transactional emails on offer, acceptance, job completion." },
];

/* ─── Animated flow dot on a path ─── */
function FlowDot({ delay = 0, duration = 2, color = "bg-primary" }: { delay?: number; duration?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute h-2 w-2 rounded-full ${color} shadow-lg`}
      initial={{ top: "0%", opacity: 0 }}
      animate={{ top: ["0%", "100%", "100%", "0%"], opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      style={{ left: "calc(50% - 4px)" }}
    />
  );
}

/* ─── Architecture interactive diagram ─── */
function ArchDiagram() {
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
              <p className="font-bold text-sm text-blue-700 dark:text-blue-300">Browser / Client</p>
              <p className="text-xs text-muted-foreground">React 18 · Tailwind · Framer Motion · next-intl</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground border-l border-blue-200 dark:border-blue-800 pl-4">
            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> PWA</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> reCAPTCHA v3</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> SSE stream</span>
          </div>
        </div>
      </motion.div>

      {/* Connector: Browser → Next.js */}
      <div className="relative h-10 flex items-center justify-center mx-auto w-0.5 bg-border/60">
        {inView && <FlowDot delay={0.2} duration={1.5} color="bg-blue-500" />}
        {inView && <FlowDot delay={0.9} duration={1.5} color="bg-blue-400" />}
        <span className="absolute right-3 text-[10px] text-muted-foreground whitespace-nowrap">HTTP / fetch</span>
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
            <p className="text-xs font-semibold">Pages (SSR)</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">App Router · i18n · SEO</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-card p-3 text-center">
            <Server className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-xs font-semibold">API Routes (34+)</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">JWT · Zod · RBAC</p>
          </div>
        </div>
      </motion.div>

      {/* Connector: Next.js → services */}
      <div className="relative h-10 flex items-center justify-center mx-auto w-0.5 bg-border/60">
        {inView && <FlowDot delay={0.5} duration={1.8} color="bg-primary" />}
        {inView && <FlowDot delay={1.3} duration={1.8} color="bg-primary/60" />}
      </div>

      {/* Row 3: Services */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* PostgreSQL */}
        {node(
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>,
          "PostgreSQL",
          "Prisma v7 · 8 models · 30+ indexes",
          "border-emerald-200 dark:border-emerald-800",
          0.4
        )}

        {/* Email */}
        {node(
          <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mx-auto">
            <Mail className="h-5 w-5 text-pink-600" />
          </div>,
          "Nodemailer",
          "Mailtrap · Gmail · 6 templates",
          "border-pink-200 dark:border-pink-800",
          0.5
        )}

        {/* SSE */}
        {node(
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>,
          "SSE Stream",
          "Real-time chat · 3s polling · Auto cleanup",
          "border-amber-200 dark:border-amber-800",
          0.6
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
          { color: "bg-blue-500", label: "HTTP request/response" },
          { color: "bg-primary", label: "API call" },
          { color: "bg-emerald-500", label: "DB query" },
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
          Diploma Project · Kazakhstan · 2026
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          About <span className="text-primary">Remont.kz</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          A full-stack marketplace connecting clients with verified repair and renovation contractors across Kazakhstan —
          built as a diploma project with production-grade architecture.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-3">
          <Link href="/repair">
            <Button size="lg" className="rounded-xl gap-2 h-12 px-7 font-semibold">
              <Globe className="h-4 w-4" /> Browse Services
            </Button>
          </Link>
          <Link href="/companies">
            <Button size="lg" variant="outline" className="rounded-xl gap-2 h-12 px-7 font-semibold">
              <Users className="h-4 w-4" /> View Companies
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-14 px-4 bg-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <ScaleIn key={label} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-black tracking-tight text-primary">{value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{label}</div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeLeft>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Our mission</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                Repair should be simple,<br />transparent & fast
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Finding a trustworthy specialist in Kazakhstan used to mean weeks of searching, phone calls with no guarantees, and opaque pricing.
                Remont.kz changes that — post a request in 2 minutes, get competing offers the same day.
              </p>
              <ul className="space-y-3">
                {[
                  "Free for clients — always",
                  "Only verified companies can submit offers",
                  "Ratings calculated from real completed jobs",
                  "Direct chat between client and contractor",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeLeft>

            <FadeRight delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "2 min", label: "To post a request", icon: Zap, color: "from-blue-500 to-cyan-500" },
                  { value: "2h",   label: "First offer arrives", icon: MessageSquare, color: "from-emerald-500 to-teal-500" },
                  { value: "4.8",  label: "Average rating", icon: Star, color: "from-amber-500 to-orange-500" },
                  { value: "Free", label: "For clients", icon: CheckCircle2, color: "from-violet-500 to-purple-500" },
                ].map(({ value, label, icon: Icon, color }, i) => (
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

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">What&apos;s built</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Platform features</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                12 major feature areas, 34+ API endpoints, production-grade code.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Built with</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Technology stack</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Modern, production-ready tools chosen for performance, type-safety and developer experience.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TECH.map(({ icon: Icon, label, desc, color }, i) => (
              <ScaleIn key={label} delay={Math.floor(i / 4) * 0.1 + (i % 4) * 0.07}>
                <div className="group rounded-2xl border border-border/50 bg-card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-sm mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Architecture overview</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Animated flow showing how data moves through the system in real time.
              </p>
            </div>
          </FadeUp>

          {/* Interactive diagram */}
          <div className="rounded-3xl border border-border/50 bg-card p-8 mb-8">
            <ArchDiagram />
          </div>

          {/* DB Schema */}
          <FadeUp delay={0.2}>
            <div className="rounded-3xl border border-border/50 bg-card p-8">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> Database schema — 8 models
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "User",          color: "bg-blue-500" },
                  { name: "Service",       color: "bg-emerald-500" },
                  { name: "ServiceImage",  color: "bg-teal-500" },
                  { name: "Request",       color: "bg-violet-500" },
                  { name: "RequestOffer",  color: "bg-purple-500" },
                  { name: "Message",       color: "bg-amber-500" },
                  { name: "Favorite",      color: "bg-pink-500" },
                  { name: "Payment",       color: "bg-orange-500" },
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
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Ready to try it?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Browse real services, create a request and get offers from verified contractors.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/repair">
                <Button size="lg" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base shadow-lg shadow-primary/20">
                  Browse Services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="rounded-xl gap-2 h-13 px-8 font-semibold text-base">
                  How it works
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
