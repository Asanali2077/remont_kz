import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  return error instanceof Error ? error.message : fallback;
}

export function formatBudget(from?: number | null, to?: number | null): string | null {
  if (!from && !to) return null;
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (!to || from === to) return `${fmt(from ?? 0)} ₸`;
  if (!from) return `${fmt(to)} ₸`;
  return `${fmt(from)} – ${fmt(to)} ₸`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

/** Human-readable relative time: "5m ago", "2h ago", "3d ago" */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Shared Tailwind classes for category color chips */
export const CATEGORY_COLORS: Record<string, string> = {
  automobiles:  "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "real-estate":"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  plumbing:     "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  electrical:   "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  painting:     "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  cleaning:     "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  renovation:   "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  welding:      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  roofing:      "bg-stone-50 text-stone-700 dark:bg-stone-950/40 dark:text-stone-300",
  other:        "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

/** Category display labels */
/** Format a number as a price with consistent en-US comma separators */
export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

/** Strip HTML tags and their content for dangerous tags, preventing XSS */
export function sanitizeText(input: string, maxLength = 5000): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")   // strip script blocks + content
    .replace(/<style[\s\S]*?<\/style>/gi, "")     // strip style blocks + content
    .replace(/<[^>]+>/g, "")                       // strip remaining HTML tags
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .trim()
    .slice(0, maxLength);
}

export const CATEGORY_SHORT: Record<string, string> = {
  automobiles:  "Auto",
  "real-estate":"Real Estate",
  plumbing:     "Plumbing",
  electrical:   "Electric",
  painting:     "Painting",
  cleaning:     "Cleaning",
  renovation:   "Renovation",
  welding:      "Welding",
  roofing:      "Roofing",
  other:        "Other",
};
