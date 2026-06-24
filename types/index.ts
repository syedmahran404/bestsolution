/**
 * Velora Civic AI — Core Domain Models
 *
 * These types are the single source of truth shared across the client,
 * server (API routes), Firestore documents, and the seed scripts.
 *
 * Phase 1 scope: shapes are defined and used by the map + seed data.
 * Later phases (reporting, aggregation, agent) build on these without
 * changing the foundational contracts.
 */

/* -------------------------------------------------------------------------- */
/*                              Enumerated unions                             */
/* -------------------------------------------------------------------------- */

/**
 * Lifecycle of a civic issue. Drives map marker color and dashboard filters.
 *  - reported    → just submitted by a citizen (RED on map)
 *  - verified    → confirmed by community/agent
 *  - assigned    → routed to a responsible department
 *  - in_progress → work underway (YELLOW on map)
 *  - resolved    → closed (GREEN on map)
 */
export type IssueStatus =
  | "reported"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved";

/** High-level category of a civic problem. */
export type IssueCategory =
  | "pothole"
  | "water_leak"
  | "garbage"
  | "streetlight"
  | "drainage"
  | "other";

/** Human severity bands derived from the numeric severity score (0-100). */
export type SeverityLabel = "low" | "medium" | "high" | "critical";

/** How a report entered the system. */
export type ReportInputType = "photo" | "voice";

/** A single status-change record in a civic case's operational timeline. */
export interface StatusHistoryEntry {
  status: IssueStatus;
  /** ISO timestamp of the change. */
  at: string;
  /** Optional operator note. */
  note?: string;
}

/* -------------------------------------------------------------------------- */
/*                               AI Analysis                                  */
/* -------------------------------------------------------------------------- */

/**
 * Structured AI analysis of a report (Phase 4 — Civic Intelligence Layer).
 *
 * Produced by a single Gemini call at submit time. Stored on the report so it
 * is generated exactly once (immutable cache — never re-called). Reasoning is
 * always surfaced in the UI: no black-box AI.
 */
export interface AIAnalysis {
  /** AI-predicted category (may differ from the citizen's selection). */
  category: IssueCategory;
  /** Model confidence, 0-1. */
  confidence: number;
  /** Human-readable explanation of the classification. */
  reasoning: string;
  /** Signal keywords the model detected. */
  keywords: string[];
  /** Concise one-line summary of the issue. */
  summary: string;
  /** Voice transcript (null when there is no audio / transcription failed). */
  transcript: string | null;
  /** Model used (e.g. gemini-2.5-flash). */
  model: string;
  /** ISO timestamp of generation. */
  generatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Geography                                  */
/* -------------------------------------------------------------------------- */

/** A geographic point with a human-readable address + geohash for clustering. */
export interface GeoLocation {
  lat: number;
  lng: number;
  /** Geohash (precision ~7) used by the Phase 3 aggregation engine. */
  geohash?: string;
  /** Reverse-geocoded address, when available. */
  address?: string;
  /** City label, useful for grouping demo/seed data. */
  city?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Citizen Report                                */
/* -------------------------------------------------------------------------- */

/**
 * A citizen-submitted report (Phase 2 — Citizen Reporting System).
 *
 * Stored in the `reports` Firestore collection. This is the raw submission
 * captured from a citizen BEFORE any AI processing (Phase 3+ enriches it into
 * the richer `Issue` model). The flat lat/lng + url shape matches the Phase 2
 * schema and keeps Storage/Firestore writes simple.
 */
export interface CivicReport {
  /** Firestore document id. */
  id: string;

  /** Short title of the problem. */
  title: string;

  /** Citizen-provided description. */
  description: string;

  /** Selected category. */
  category: IssueCategory;

  /** Public Firebase Storage URL of the uploaded photo, if any. */
  imageUrl: string | null;

  /** Public Firebase Storage URL of the recorded/uploaded voice note, if any. */
  audioUrl: string | null;

  /** Captured latitude. */
  latitude: number;

  /** Captured longitude. */
  longitude: number;

  /** Lifecycle status — always "reported" at creation in Phase 2. */
  status: IssueStatus;

  /** Linked civic case id (set by the Phase 3 aggregation engine). */
  civicCaseId?: string | null;

  /** AI analysis (Phase 4). Null until analyzed / when Gemini is unconfigured. */
  aiAnalysis?: AIAnalysis | null;

  /** ISO creation timestamp. */
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                Civic Case                                  */
/* -------------------------------------------------------------------------- */

/**
 * An aggregated civic case (Phase 3 — the Aggregation Engine).
 *
 * Many related reports (same category, geographically close) are collapsed
 * into one CivicCase. A case may contain a single report (reportCount === 1)
 * or many. Stored in the `civicCases` collection.
 *
 * Relationship: one CivicCase ── has many ──> reports (via reportIds, and
 * each report stores its civicCaseId).
 */
export interface CivicCase {
  /** Firestore document id. */
  id: string;

  /** Category shared by all member reports. */
  category: IssueCategory;

  /** Running centroid of all member report coordinates. */
  centerLocation: {
    lat: number;
    lng: number;
  };

  /** Number of reports aggregated into this case. */
  reportCount: number;

  /** Lifecycle status of the consolidated case. */
  status: IssueStatus;

  /** Ids of the member reports. */
  reportIds: string[];

  /** Status change history (Phase 5 — operations timeline). */
  statusHistory?: StatusHistoryEntry[];

  /**
   * AI-generated case summary (Phase 4). Cached on the document and keyed by
   * aiSummaryReportCount so it is only regenerated when the case grows.
   */
  aiSummary?: string | null;
  /** AI-generated community impact summary (Phase 4). */
  aiImpact?: string | null;
  /** reportCount at which the AI summary was generated (cache key). */
  aiSummaryReportCount?: number | null;
  /** ISO timestamp of AI summary generation. */
  aiGeneratedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              Map marker                                    */
/* -------------------------------------------------------------------------- */

/**
 * Unified marker shape consumed by the CivicMap. A marker with reportCount > 1
 * is rendered as an aggregated civic-case bubble; reportCount === 1 renders as
 * a single teardrop pin.
 */
export interface CivicMapMarker {
  id: string;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  lat: number;
  lng: number;
  reportCount: number;
  /** Optional link target (e.g. the civic case detail page). */
  href?: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Issue                                    */
/* -------------------------------------------------------------------------- */

/**
 * A single civic issue reported by a citizen.
 * Fields beyond the Phase 1 essentials are optional so the model can grow
 * across phases without breaking earlier data.
 */
export interface Issue {
  /** Firestore document id. */
  id: string;

  /** Category of the problem. */
  category: IssueCategory;

  /** Short title shown on markers / cards. */
  title: string;

  /** Longer description (AI-generated or user-provided in later phases). */
  description: string;

  /** Where the issue is located. */
  location: GeoLocation;

  /** Current lifecycle status. */
  status: IssueStatus;

  /** Numeric severity 0-100 (Phase 3 engine). */
  severityScore: number;

  /** Human band derived from severityScore. */
  severityLabel: SeverityLabel;

  /** Community upvote count. */
  upvotes: number;

  /** Link to an aggregated case, if this issue was merged (Phase 3). */
  clusterId?: string | null;

  /** How the report was submitted (Phase 2/4). */
  inputType?: ReportInputType;

  /** Public media URL (Firebase Storage), when present. */
  mediaUrl?: string | null;

  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Cluster                                   */
/* -------------------------------------------------------------------------- */

/**
 * An aggregated civic case — many related reports collapsed into one
 * undeniable systemic issue. This is the project moat (Phase 3).
 */
export interface Cluster {
  /** Firestore document id. */
  id: string;

  /** Category shared by all member issues. */
  category: IssueCategory;

  /** Centroid of all member reports. */
  centroid: GeoLocation;

  /** Approximate radius (meters) covered by member reports. */
  radiusM: number;

  /** Member issue ids. */
  issueIds: string[];

  /** Convenience count of member reports. */
  reportCount: number;

  /** Aggregate severity 0-100 (rises with report count). */
  aggregateSeverity: number;

  /** Current lifecycle status of the consolidated case. */
  status: IssueStatus;

  /** AI/template-generated systemic narrative (Phase 3+). */
  consolidatedCase?: string;

  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                              UI helper types                               */
/* -------------------------------------------------------------------------- */

/** Minimal shape the map needs to render a marker. */
export interface MapMarkerData {
  id: string;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  location: GeoLocation;
  severityLabel: SeverityLabel;
}
