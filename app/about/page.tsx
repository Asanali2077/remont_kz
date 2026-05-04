import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Code2, Database, Zap, Globe, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Remont.kz — Kazakhstan's repair & renovation marketplace. Tech stack, features, and team.",
};

const STACK = [
  { category: "Frontend", items: ["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion"] },
  { category: "Backend",  items: ["Next.js API Routes", "Prisma ORM v7", "PostgreSQL", "Nodemailer", "JWT Auth"] },
  { category: "AI & Features", items: ["Anthropic Claude API", "SSE Real-time chat", "PWA Manifest", "Dynamic Sitemap", "Rate Limiting"] },
  { category: "Security", items: ["bcrypt hashing", "JWT tokens", "Zod validation", "Input sanitization", "CORS headers"] },
];

const STATS = [
  { label: "API endpoints", value: "35+" },
  { label: "DB models",     value: "8" },
  { label: "Pages",         value: "22" },
  { label: "Email types",   value: "6" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            Diploma Project · 2026
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">About Remont.kz</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            A full-stack marketplace connecting clients with verified repair and renovation contractors across Kazakhstan.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STATS.map(({ label, value }) => (
            <div key={label} className="bg-card border border-border/50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Client & Company accounts with JWT auth",
              "Email verification & password reset",
              "Real-time chat via Server-Sent Events",
              "AI-powered service summaries (Claude API)",
              "AI request assistant bot",
              "Multi-photo service galleries with lightbox",
              "Service comparison (up to 3 services)",
              "Favorites system with batch loading",
              "Kanban board for company requests",
              "Offer system with email notifications",
              "Star ratings and text reviews",
              "Company replies to reviews",
              "Company public profiles",
              "Dynamic SEO sitemap",
              "PWA manifest (installable app)",
              "Rate limiting on all auth endpoints",
              "Input sanitization (XSS prevention)",
              "CSV export for company data",
              "Kaspi Pay integration (mock)",
              "Geo-location city detection",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" /> Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STACK.map(({ category, items }) => (
              <div key={category}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{category}</p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" /> Architecture
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Single <span className="font-semibold text-foreground">Next.js 14</span> monorepo — frontend and backend in one repository using the App Router pattern.</p>
            <p><span className="font-semibold text-foreground">PostgreSQL</span> database via Prisma ORM with the <code className="bg-muted rounded px-1">@prisma/adapter-pg</code> driver adapter for connection pooling.</p>
            <p><span className="font-semibold text-foreground">Stateless JWT authentication</span> — tokens stored in localStorage, verified per-request in API middleware.</p>
            <p><span className="font-semibold text-foreground">SSE (Server-Sent Events)</span> for real-time chat instead of WebSockets — compatible with edge/serverless deployments.</p>
            <p><span className="font-semibold text-foreground">Email</span> via Nodemailer with SMTP — Mailtrap for testing, Gmail/custom SMTP for production.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/repair">
            <Button className="rounded-xl gap-2 h-12 px-8">
              <Globe className="h-4 w-4" /> Browse Services
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
