import type { IssueCategory, IssueStatus } from "@/types";

/* -------------------------------------------------------------------------- */
/*                              Map configuration                             */
/* -------------------------------------------------------------------------- */

/**
 * Default map view: centered on India with a zoom that frames the whole
 * country. Chosen so all seeded cities (Delhi → Hyderabad → Bengaluru →
 * Mysuru → Mumbai) are visible on first load.
 */
export const INDIA_MAP_CONFIG = {
  center: { lat: 22.5937, lng: 78.9629 },
  zoom: 5,
  minZoom: 4,
  maxZoom: 18,
} as const;

/* -------------------------------------------------------------------------- */
/*                              Status metadata                               */
/* -------------------------------------------------------------------------- */

/**
 * Marker / badge colors per lifecycle status.
 * Mirrors the CSS custom properties declared in app/globals.css so the map
 * (which needs raw hex for the Google Maps pin) and the UI stay in sync.
 */
export const STATUS_META: Record<
  IssueStatus,
  { label: string; hex: string; group: "open" | "progress" | "resolved" }
> = {
  reported: { label: "Reported", hex: "#ef4444", group: "open" },
  verified: { label: "Verified", hex: "#ef4444", group: "open" },
  assigned: { label: "Assigned", hex: "#f59e0b", group: "progress" },
  in_progress: { label: "In Progress", hex: "#f59e0b", group: "progress" },
  resolved: { label: "Resolved", hex: "#22c55e", group: "resolved" },
};

/** Three top-level color buckets used by the map legend. */
export const STATUS_GROUP_META = {
  open: { label: "Open", hex: "#ef4444" },
  progress: { label: "In Progress", hex: "#f59e0b" },
  resolved: { label: "Resolved", hex: "#22c55e" },
} as const;

/* -------------------------------------------------------------------------- */
/*                             Category metadata                              */
/* -------------------------------------------------------------------------- */

/** Display label + emoji glyph for each category (used on markers/cards). */
export const CATEGORY_META: Record<
  IssueCategory,
  { label: string; glyph: string }
> = {
  pothole: { label: "Pothole", glyph: "🕳️" },
  water_leak: { label: "Water Leak", glyph: "💧" },
  garbage: { label: "Garbage", glyph: "🗑️" },
  streetlight: { label: "Streetlight", glyph: "💡" },
  drainage: { label: "Drainage", glyph: "🌊" },
  other: { label: "Other", glyph: "📍" },
};

/* -------------------------------------------------------------------------- */
/*                                AI / Gemini                                 */
/* -------------------------------------------------------------------------- */

/** Default Gemini model for all multimodal perception (used from Phase 2). */
export const GEMINI_MODEL = "gemini-2.5-flash";

/* -------------------------------------------------------------------------- */
/*                              Firestore paths                               */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS = {
  issues: "issues",
  clusters: "clusters",
  departments: "departments",
  reports: "reports",
} as const;
