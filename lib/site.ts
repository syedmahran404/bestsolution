/**
 * Velora 3.0 — Canonical site metadata (RC).
 *
 * Single source of truth for the public URL + product copy used by the layout
 * metadata, robots, sitemap, manifest, and social-card images. Override the
 * URL per environment via NEXT_PUBLIC_SITE_URL (set it in Vercel).
 */
export const SITE = {
  name: "Velora Civic AI",
  shortName: "Velora",
  title: "Velora Civic AI — AI Civic Operations Center",
  description:
    "An AI-powered civic intelligence platform. Citizens report issues by photo or voice in any language; AI classifies and explains them, a deterministic engine aggregates many reports into one civic case, and an operations center prioritizes, tracks, and resolves them.",
  tagline: "From issue reporting to issue resolution.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://velora-civic-ai.vercel.app"
  ).replace(/\/$/, ""),
  keywords: [
    "civic tech",
    "AI civic platform",
    "Gemini",
    "pothole reporting",
    "smart city",
    "Google Maps",
    "civic operations",
    "hyperlocal",
    "India",
  ],
} as const;
