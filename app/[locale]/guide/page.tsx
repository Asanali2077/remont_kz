"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronDown, BookOpen, Star, Briefcase, Shield, User,
  Search, ThumbsUp, ThumbsDown, Clock, Play, Mail,
  MessageSquare, Phone, X, Zap, CheckCircle2,
  ClipboardList, Send, Building2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";

/* ─── Types ─── */
interface Article {
  q: string;
  a: string;
  tags?: string[];
  forRole?: "client" | "company" | "both";
}

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  iconColor: string;
  articles: Article[];
}

/* ─── Data ─── */
const SECTIONS: Section[] = [
  {
    id: "start", icon: BookOpen, title: "Getting Started",
    color: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    iconColor: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    articles: [
      { q: "How do I find a service?", a: "Open the Service Catalog at /repair. Use the sidebar filters — city, category, price range, and minimum rating — to narrow down results. Click any card to see full details, photos, reviews, and the company's contact information.", tags: ["catalog", "search"], forRole: "client" },
      { q: "How do I submit a request?", a: "Click the 'Request' button on any service card, or use the AI assistant (robot icon in the catalog header). Describe your task, set your budget range and city. Verified companies will respond with price offers within a few hours.", tags: ["request", "offer"], forRole: "client" },
      { q: "Is Remont.kz free for clients?", a: "Yes — completely free. Browsing the catalog, submitting requests, receiving offers, and chatting with companies costs nothing. You only pay the contractor directly for the work they complete.", tags: ["pricing", "free"], forRole: "client" },
      { q: "How do I compare companies?", a: "Click the compare icon (two overlapping arrows) on up to 3 service cards. A floating bar appears at the bottom of the screen — click 'Compare' to see them side by side in a feature table: price, rating, city, availability, and more.", tags: ["compare"], forRole: "client" },
      { q: "How do I save services for later?", a: "Click the heart icon on any service card or service detail page. Saved services appear in the 'Saved Services' section in your profile dropdown. You must be logged in as a client.", tags: ["favorites", "save"], forRole: "client" },
    ],
  },
  {
    id: "ratings", icon: Star, title: "Ratings & Reviews",
    color: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    iconColor: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400",
    articles: [
      { q: "Who can leave a review?", a: "Only clients whose request status reached 'Completed' can leave a review for that specific company. This guarantees all ratings are from real, verified interactions — no fake reviews.", tags: ["review", "verified"], forRole: "client" },
      { q: "How is the star rating calculated?", a: "The company's overall rating is the arithmetic average of all client star ratings (1 to 5 stars). The count shown next to the rating is the total number of completed requests — not just reviewed ones.", tags: ["rating", "stars"] },
      { q: "Can I edit or delete my review?", a: "Currently reviews cannot be edited after submission. If you submitted a review by mistake or wish to dispute it, contact support at support@remont.kz and we will review your request.", tags: ["review", "edit"] },
      { q: "Can companies respond to reviews?", a: "Yes. After a client leaves a review, the assigned company can post a public reply. This reply is visible to all users below the client's review on the service detail page.", tags: ["reply", "company"], forRole: "company" },
    ],
  },
  {
    id: "companies", icon: Briefcase, title: "For Companies",
    color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    iconColor: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
    articles: [
      { q: "How do I list my services?", a: "Register as a Company account. Go to Dashboard → Services → click 'Add service'. Fill in the service name, category, description, price range (from/to), city, address, and upload up to 10 photos. Set availability dates if applicable.", tags: ["listing", "service"], forRole: "company" },
      { q: "How do I receive and manage client requests?", a: "Go to Dashboard → Requests. You see two sections: 'Assigned to you' (direct requests) and 'Unassigned requests' (matching your categories). Click 'Make offer' on unassigned ones to send your price. Accept, start work, and complete assigned requests to build your rating.", tags: ["requests", "offer"], forRole: "company" },
      { q: "How do I update my company profile?", a: "Go to Profile (top-right menu → Profile). You can update your company name, phone number, address, and profile photo. This information is shown to clients on your service cards and in the chat header.", tags: ["profile", "edit"], forRole: "company" },
      { q: "Can I deactivate a service without deleting it?", a: "Yes. In Dashboard → Services, click the 'Active / Inactive' badge on any service card to toggle its visibility. Inactive services are hidden from the catalog but preserved with all their data and reviews.", tags: ["service", "toggle"], forRole: "company" },
    ],
  },
  {
    id: "safety", icon: Shield, title: "Safety & Trust",
    color: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
    iconColor: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400",
    articles: [
      { q: "How are companies verified?", a: "Companies register with their contact details and are visible in the catalog. We strongly recommend checking the rating, number of completed requests, and reviews before choosing. The platform shows real client feedback to help you decide.", tags: ["verification", "trust"] },
      { q: "What if something goes wrong with my job?", a: "First, use the in-app chat to communicate the issue directly with the company. Most disputes are resolved this way. If you cannot reach an agreement, contact our support team at support@remont.kz with your request ID.", tags: ["dispute", "support"] },
      { q: "Is my personal data safe?", a: "Yes. We store only the information you provide (email, name, phone). We do not share it with third parties. Passwords are hashed using bcrypt. All API connections use HTTPS encryption.", tags: ["privacy", "data"] },
    ],
  },
  {
    id: "account", icon: User, title: "Account & Settings",
    color: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    iconColor: "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400",
    articles: [
      { q: "How do I change my password?", a: "Go to Settings (top-right menu → Settings). Enter your current password, then your new password twice. Minimum 6 characters. Click 'Update password'. Your session remains active.", tags: ["password", "security"], },
      { q: "I forgot my password. How do I reset it?", a: "Click 'Forgot password?' on the login modal. Enter your registered email address. We'll send you a reset link valid for 1 hour. Click the link, enter your new password, and log in.", tags: ["password", "reset"] },
      { q: "Can I change my account role (client ↔ company)?", a: "Account roles cannot be changed after registration. If you need a different role, create a new account with a different email address. Contact support if you need your old account data transferred.", tags: ["role", "account"] },
      { q: "How do I delete my account?", a: "Contact us at support@remont.kz with subject 'Account deletion request'. Include your registered email. We will process your request within 5 business days and permanently delete all your data.", tags: ["delete", "account"] },
    ],
  },
];

const POPULAR_QUESTIONS = [
  { q: "How do I submit a request?",        section: "start" },
  { q: "Is Remont.kz free for clients?",    section: "start" },
  { q: "How do I change my password?",      section: "account" },
  { q: "How are companies verified?",       section: "safety" },
  { q: "Who can leave a review?",           section: "ratings" },
  { q: "How do I list my services?",        section: "companies" },
];

const VIDEOS = [
  { title: "How to submit your first request", duration: "2:45", thumbnail: "🔧" },
  { title: "Comparing companies side by side", duration: "1:58", thumbnail: "📊" },
  { title: "Setting up your company profile",  duration: "3:12", thumbnail: "🏢" },
];

/* ─── Reading time helper ─── */
function readingTime(text: string): string {
  const words = text.split(" ").length;
  const sec = Math.round((words / 200) * 60);
  return sec < 60 ? `${sec} sec read` : `${Math.round(sec / 60)} min read`;
}

/* ─── Highlight matching text ─── */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-primary rounded px-0.5 font-semibold not-italic">{part}</mark>
        ) : part
      )}
    </>
  );
}

/* ─── Helpful vote button ─── */
function HelpfulVote({ id }: { id: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`helpful:${id}`) as "up" | "down" | null;
  });

  function cast(v: "up" | "down") {
    const next = vote === v ? null : v;
    setVote(next);
    if (next) localStorage.setItem(`helpful:${id}`, next);
    else localStorage.removeItem(`helpful:${id}`);
  }

  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/40">
      <span className="text-xs text-muted-foreground">Was this helpful?</span>
      <button onClick={() => cast("up")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${vote === "up" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
        <ThumbsUp className="h-3.5 w-3.5" /> Yes
      </button>
      <button onClick={() => cast("down")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${vote === "down" ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
        <ThumbsDown className="h-3.5 w-3.5" /> No
      </button>
    </div>
  );
}

/* ─── Single accordion item ─── */
function ArticleItem({ article, sectionId, query }: { article: Article; sectionId: string; query: string }) {
  const [open, setOpen] = useState(false);
  const id = `${sectionId}:${article.q}`;

  // Auto-open when search matches
  useEffect(() => {
    if (query && (article.q.toLowerCase().includes(query.toLowerCase()) || article.a.toLowerCase().includes(query.toLowerCase()))) {
      setOpen(true);
    } else if (query) {
      setOpen(false);
    }
  }, [query, article.q, article.a]);

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        className="flex w-full items-start justify-between gap-4 py-4 text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className={`text-sm font-medium leading-relaxed transition-colors ${open ? "text-primary" : "group-hover:text-primary"}`}>
          <Highlight text={article.q} query={query} />
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>

      {open && (
        <div className="pb-4 space-y-3">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {readingTime(article.a)}
            </span>
            {article.forRole && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${article.forRole === "client" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : article.forRole === "company" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {article.forRole === "both" ? "Clients & Companies" : article.forRole === "client" ? "For clients" : "For companies"}
              </span>
            )}
            {article.tags?.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          {/* Answer */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            <Highlight text={article.a} query={query} />
          </p>

          {/* Helpful vote */}
          <HelpfulVote id={id} />
        </div>
      )}
    </div>
  );
}

/* ─── Request lifecycle timeline ─── */
const TIMELINE = [
  {
    n: "01",
    who: "client",
    icon: ClipboardList,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    title: "Client posts a request",
    desc: "Describes the task, sets a budget range and city. Takes about 2 minutes.",
    mockup: (
      <div className="rounded-xl border border-border/50 bg-background p-4 space-y-2.5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-3">New request</div>
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex gap-2 mt-3">
          <div className="h-7 bg-muted rounded-lg flex-1 flex items-center px-2">
            <div className="h-2 bg-muted-foreground/30 rounded w-16" />
          </div>
          <div className="h-7 bg-muted rounded-lg flex-1 flex items-center px-2">
            <div className="h-2 bg-muted-foreground/30 rounded w-12" />
          </div>
        </div>
        <div className="h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          <div className="h-2 bg-primary/60 rounded w-20" />
        </div>
      </div>
    ),
  },
  {
    n: "02",
    who: "company",
    icon: Building2,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    title: "Companies submit price offers",
    desc: "Verified contractors see requests matching their category and city — and compete with offers.",
    mockup: (
      <div className="rounded-xl border border-border/50 bg-background p-4 space-y-2.5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Incoming offers</div>
        {[["AutoCity KZ", "45,000 ₸", "★ 4.9"], ["StroiMaster", "38,000 ₸", "★ 4.7"]].map(([name, price, rating]) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 bg-muted/30">
            <div>
              <div className="text-xs font-semibold">{name}</div>
              <div className="text-[10px] text-muted-foreground">{rating}</div>
            </div>
            <div className="text-xs font-black text-primary">{price}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "03",
    who: "client",
    icon: CheckCircle2,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
    title: "Client accepts the best offer",
    desc: "Compare by price, rating and reviews — one click to confirm. The company is notified instantly.",
    mockup: (
      <div className="rounded-xl border border-border/50 bg-background p-4 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Select offer</div>
        <div className="rounded-lg border-2 border-primary/40 bg-primary/5 px-3 py-2.5 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">StroiMaster</span>
            <span className="text-xs font-black text-primary">38,000 ₸</span>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <div key={i} className="h-2 w-2 rounded-full bg-amber-400" />)}
          </div>
        </div>
        <div className="h-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="h-2 bg-primary-foreground/60 rounded w-16" />
        </div>
      </div>
    ),
  },
  {
    n: "04",
    who: "both",
    icon: MessageSquare,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
    title: "Chat opens — work begins",
    desc: "Direct messaging with file sharing. Company updates status: Accepted → In progress.",
    mockup: (
      <div className="rounded-xl border border-border/50 bg-background p-4 space-y-2 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-2">Chat</div>
        <div className="flex justify-start">
          <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-1.5 text-xs max-w-[75%]">
            When can you start?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-1.5 text-xs max-w-[75%]">
            Tomorrow at 10am ✓
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-1.5 text-xs max-w-[75%]">
            Perfect, see you then!
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "05",
    who: "client",
    icon: Star,
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300",
    title: "Job completed — leave a review",
    desc: "Company marks job as done. Client rates the work 1–5 stars. Rating updates the company profile.",
    mockup: (
      <div className="rounded-xl border border-border/50 bg-background p-4 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Rate your experience</div>
        <div className="flex justify-center gap-1.5 mb-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm ${i <= 5 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-500" : "bg-muted text-muted-foreground"}`}>
              ★
            </div>
          ))}
        </div>
        <div className="h-3 bg-muted rounded w-full mb-1.5" />
        <div className="h-3 bg-muted rounded w-3/4 mb-3" />
        <div className="h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Submit review</span>
        </div>
      </div>
    ),
  },
];

function StepCard({ step, index }: { step: typeof TIMELINE[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = index % 2 === 0;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center ${!isLeft ? "md:[&>*:first-child]:order-2" : ""}`}
    >
      {/* Text side */}
      <div className={`${step.bg} rounded-2xl border ${step.border} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
            <step.icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${step.badge}`}>
                {step.who === "client" ? "CLIENT" : step.who === "company" ? "COMPANY" : "BOTH"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{step.n}</span>
            </div>
            <h3 className="font-black text-base mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        </div>
      </div>

      {/* Mockup side */}
      <div className="px-2">
        {step.mockup}
      </div>
    </motion.div>
  );
}

function HowItWorksVisual() {
  return (
    <div className="rounded-3xl border border-border/50 bg-card p-8 my-10">
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Visual guide</p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">How a request works</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          From posting to completion in 5 steps — see what each side does
        </p>
      </div>

      {/* Role legend */}
      <div className="flex justify-center gap-4 mb-10 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Client action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Company action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Both</span>
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative space-y-6">
        {/* Center line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border/50 hidden md:block" />

        {TIMELINE.map((step, i) => (
          <div key={step.n} className="relative">
            {/* Center dot */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
              <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ring-4 ring-background`}>
                <span className="text-white text-[10px] font-black">{step.n}</span>
              </div>
            </div>
            <StepCard step={step} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function GuidePage() {
  const t = useTranslations("guide");
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("start");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* Scroll spy */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Filtered sections */
  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      articles: s.articles.filter((a) =>
        a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q) || a.tags?.some((t) => t.includes(q))
      ),
    })).filter((s) => s.articles.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((n, s) => n + s.articles.length, 0);

  function scrollTo(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handlePopular(_q: string, sectionId: string) {
    setQuery("");
    setTimeout(() => scrollTo(sectionId), 100);
  }

  return (
    <div className="min-h-screen bg-muted/30">

      {/* ════ HERO HEADER ════ */}
      <div className="bg-gradient-to-b from-primary/8 via-primary/3 to-transparent border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">{t("title")}</h1>
          <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
            Quick answers to everything about Remont.kz
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for answers… (e.g. 'password', 'review', 'request')"
              className="pl-10 pr-10 h-12 rounded-2xl border-border/60 bg-card shadow-sm text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search result count */}
          {query && (
            <p className="mt-3 text-sm text-muted-foreground">
              {totalResults === 0
                ? "No results found — try different keywords"
                : <><span className="font-semibold text-foreground">{totalResults}</span> answer{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</>}
            </p>
          )}

          {/* Stats row */}
          {!query && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" />{SECTIONS.reduce((n, s) => n + s.articles.length, 0)} articles</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{SECTIONS.length} categories</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />Updated daily</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* ════ HOW IT WORKS VISUAL ════ */}
        {!query && <HowItWorksVisual />}

        {/* ════ POPULAR QUESTIONS ════ */}
        {!query && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold">Most popular questions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {POPULAR_QUESTIONS.map(({ q, section }) => (
                <button key={q}
                  onClick={() => handlePopular(q, section)}
                  className="text-left rounded-xl border border-border/50 bg-card px-4 py-3.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Search className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{q}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ════ TWO-COLUMN: sidebar + content ════ */}
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          {!query && (
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-20 bg-card border border-border/50 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Categories</p>
                </div>
                <nav className="p-2">
                  {SECTIONS.map(({ id, icon: Icon, title, iconColor, articles }) => (
                    <button key={id} onClick={() => scrollTo(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 ${activeSection === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg shrink-0 transition-all ${activeSection === id ? "bg-primary/20 text-primary" : iconColor}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="flex-1 truncate">{title}</span>
                      <span className="text-[11px] tabular-nums opacity-60">{articles.length}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Content */}
          <div className={`flex-1 min-w-0 space-y-4 ${query ? "max-w-3xl mx-auto w-full" : ""}`}>

            {/* Mobile category tabs */}
            {!query && (
              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-hide">
                {SECTIONS.map(({ id, icon: Icon, title }) => (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${activeSection === id ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {title}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-card border border-border/50 rounded-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-muted-foreground mb-4">Try using different keywords or browse the categories below</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setQuery("")}>Clear search</Button>
              </div>
            )}

            {/* Section cards */}
            {filtered.map(({ id, icon: Icon, title, color, iconColor, articles }) => (
              <div key={id}
                ref={(el) => { sectionRefs.current[id] = el; }}
                className={`rounded-2xl border overflow-hidden ${color}`}
              >
                {/* Section header */}
                <div className="flex items-center justify-between gap-3 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconColor}`}>
                      <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    </div>
                    <h2 className="font-bold text-base">{title}</h2>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-background/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {articles.length} article{articles.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Articles */}
                <div className="bg-card px-6">
                  {articles.map((article) => (
                    <ArticleItem
                      key={article.q}
                      article={article}
                      sectionId={id}
                      query={query}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ VIDEO TUTORIALS ════ */}
        {!query && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
                  <Play className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="font-bold">Video guides</h2>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Coming soon</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {VIDEOS.map(({ title, duration, thumbnail }) => (
                <div key={title} className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-border transition-all duration-200">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                    <span className="text-5xl">{thumbnail}</span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                        <Play className="h-5 w-5 text-foreground ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════ CONTACT SUPPORT ════ */}
        <section className="mt-14">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Still need help?</h2>
            <p className="text-sm text-muted-foreground">Our support team is here for you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Mail, title: "Email support", sub: "support@remont.kz",
                desc: "Reply within 24 hours",
                action: "mailto:support@remont.kz",
                label: "Send email",
                color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
                border: "hover:border-blue-300 dark:hover:border-blue-700",
              },
              {
                icon: MessageSquare, title: "Live chat", sub: "Mon–Fri · 9:00–18:00",
                desc: "Response in under 5 min",
                action: "mailto:support@remont.kz",
                label: "Start chat",
                color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
                border: "hover:border-emerald-300 dark:hover:border-emerald-700",
                live: true,
              },
              {
                icon: Phone, title: "Phone", sub: "+7 (727) 000-00-00",
                desc: "Business hours only",
                action: "tel:+77270000000",
                label: "Call us",
                color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
                border: "hover:border-violet-300 dark:hover:border-violet-700",
              },
            ].map(({ icon: Icon, title, sub, desc, action, label, color, border, live }) => (
              <a key={title} href={action}
                className={`group flex flex-col items-center text-center rounded-2xl border border-border/50 bg-card p-7 hover:shadow-lg transition-all duration-200 ${border}`}>
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                  {live && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm mb-0.5">{title}</p>
                <p className="text-sm text-muted-foreground mb-0.5">{sub}</p>
                <p className="text-xs text-muted-foreground mb-4">{desc}</p>
                <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-2">{label} →</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
