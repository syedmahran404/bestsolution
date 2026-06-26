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
/*                            Aggregation engine                              */
/* -------------------------------------------------------------------------- */

/**
 * Radius (meters) within which a new report of the SAME category is treated as
 * part of an existing civic case. Deterministic clustering threshold (Phase 3).
 * ~150m balances "same street/junction" grouping without merging unrelated
 * issues in a neighbourhood.
 */
export const AGGREGATION_RADIUS_M = 150;

/**
 * Reports within this very tight radius are treated as the same physical spot
 * and aggregated regardless of wording (U1 false-merge guard). Beyond this (but
 * within AGGREGATION_RADIUS_M) we additionally require keyword overlap so two
 * *different* nearby same-category issues do not merge.
 */
export const SAME_SPOT_RADIUS_M = 35;

/* -------------------------------------------------------------------------- */
/*                    Context-aware severity model (U2)                       */
/* -------------------------------------------------------------------------- */

/** Radius (m) within which nearby places are considered for context severity. */
export const CONTEXT_RADIUS_M = 250;

/** Base severity per category (0-100 scale, before context boosts). */
export const SEVERITY_BASE: Record<IssueCategory, number> = {
  water_leak: 55,
  drainage: 50,
  pothole: 45,
  streetlight: 35,
  garbage: 35,
  other: 30,
};

/**
 * Context boost per nearby sensitive place type. Each contributes its weight
 * when a matching place is within CONTEXT_RADIUS_M (closest match only).
 * Maps Google Place types → our normalized context type + weight + label.
 */
export const CONTEXT_RULES: Array<{
  type: string;
  label: string;
  weight: number;
  googleTypes: string[];
}> = [
  {
    type: "hospital",
    label: "hospital",
    weight: 25,
    googleTypes: ["hospital", "doctor"],
  },
  {
    type: "school",
    label: "school",
    weight: 22,
    googleTypes: ["school", "primary_school", "secondary_school", "university"],
  },
  {
    type: "transit",
    label: "bus/transit stop",
    weight: 12,
    googleTypes: ["bus_station", "transit_station", "subway_station"],
  },
  {
    type: "railway",
    label: "railway station",
    weight: 14,
    googleTypes: ["train_station", "light_rail_station"],
  },
  {
    type: "government",
    label: "government building",
    weight: 12,
    googleTypes: ["city_hall", "local_government_office", "courthouse"],
  },
  {
    type: "market",
    label: "market",
    weight: 10,
    googleTypes: ["market", "supermarket", "shopping_mall"],
  },
];

/** Severity band thresholds from the composite score. */
export function severityLabelFromScore(
  score: number,
): "low" | "medium" | "high" | "critical" {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
  return "low";
}

/* -------------------------------------------------------------------------- */
/*                          Status workflow (Phase 5)                         */
/* -------------------------------------------------------------------------- */

/**
 * Ordered operational workflow for a civic case. "reported" is the entry
 * ("Open") state; "resolved" closes the case.
 */
export const WORKFLOW_STATUSES = [
  "reported",
  "verified",
  "in_progress",
  "resolved",
] as const;

/* -------------------------------------------------------------------------- */
/*                              Firestore paths                               */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS = {
  issues: "issues",
  clusters: "clusters",
  departments: "departments",
  reports: "reports",
  civicCases: "civicCases",
} as const;
