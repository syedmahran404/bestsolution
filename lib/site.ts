/**
 * Velora 3.0 — Canonical site metadata (RC).
 *
 * Single source of truth for the public URL + product copy used by the layout
 * metadata, robots, sitemap, manifest, and social-card images. Override the
 * URL per environment via NEXT_PUBLIC_SITE_URL (set it in Vercel).
 */

const DEFAULT_SITE_URL = "https://velora-civic-ai.vercel.app";

/**
 * Resolve the canonical site URL to a GUARANTEED-valid absolute URL string.
 *
 * Why this is defensive: `??` only guards null/undefined, NOT empty string.
 * `.env.example` ships `NEXT_PUBLIC_SITE_URL=` (empty), so a copied `.env.local`
 * inlines it as `""` — which `?? fallback` does NOT catch. An empty/invalid
 * value then makes `new URL(SITE.url)` (layout `metadataBase`) throw
 * "TypeError: Invalid URL" during static generation of /icon and
 * /opengraph-image. We normalize empty/whitespace to the default and validate
 * via `new URL`, falling back if the override is malformed.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = raw && raw.length > 0 ? raw : DEFAULT_SITE_URL;
  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE = {
  name: "Velora Civic AI",
  shortName: "Velora",
  title: "Velora Civic AI — AI Civic Operations Center",
  description:
    "An AI-powered civic intelligence platform. Citizens report issues by photo or voice in any language; AI classifies and explains them, a deterministic engine aggregates many reports into one civic case, and an operations center prioritizes, tracks, and resolves them.",
  tagline: "From issue reporting to issue resolution.",
  url: resolveSiteUrl(),
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
