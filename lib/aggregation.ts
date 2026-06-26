/**
 * Aggregation Engine (Phase 3) — the heart of Velora.
 *
 * Transforms many individual reports into consolidated civic cases using
 * DETERMINISTIC geospatial clustering. No AI, no embeddings, no vectors.
 *
 * Rule: a new report is attached to the NEAREST existing civic case of the
 * SAME category whose centroid is within AGGREGATION_RADIUS_M. If none
 * qualifies, a new single-report case is created. Either way the report ends
 * up linked to exactly one case (reportCount === 1 just means "not yet a
 * duplicate"). The case centroid is maintained as a running average so we
 * never need to re-read all member reports.
 */
import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getDistance } from "geolib";

import {
  AGGREGATION_RADIUS_M,
  COLLECTIONS,
  SAME_SPOT_RADIUS_M,
} from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import type { CivicCase, CivicReport } from "@/types";

export interface AggregationResult {
  civicCaseId: string;
  /** True when a brand-new case was created for this report. */
  isNewCase: boolean;
  /** Member count of the case after this report was applied. */
  reportCount: number;
  /** Distance (m) to the matched case centroid, or null for a new case. */
  distanceM: number | null;
}

/** Meters between two lat/lng points (deterministic, via geolib/haversine). */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return getDistance(
    { latitude: a.lat, longitude: a.lng },
    { latitude: b.lat, longitude: b.lng },
  );
}

// Common words ignored when extracting signal keywords for the merge guard.
const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "near",
  "from",
  "this",
  "that",
  "there",
  "here",
  "have",
  "has",
  "are",
  "was",
  "were",
  "been",
  "being",
  "into",
  "out",
  "off",
  "on",
  "in",
  "at",
  "to",
  "of",
  "a",
  "an",
  "is",
  "it",
  "its",
  "by",
  "be",
  "or",
  "as",
  "we",
  "our",
  "my",
  "me",
  "you",
  "your",
  "issue",
  "problem",
  "please",
  "report",
  "reported",
  "area",
  "road",
  "street",
]);

/** Deterministic signal keywords from a report's title + description (U1). */
export function extractKeywords(report: CivicReport): string[] {
  const text = `${report.title} ${report.description}`.toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    if (t.length < 3 || STOPWORDS.has(t)) continue;
    if (!out.includes(t)) out.push(t);
    if (out.length >= 12) break;
  }
  return out;
}

function hasOverlap(a: string[], b: string[] | undefined): boolean {
  if (!b || b.length === 0) return false;
  const setB = new Set(b);
  return a.some((t) => setB.has(t));
}

/**
 * Find the nearest existing civic case (same category) that this report should
 * merge into. Within the tight same-spot radius we always merge; between the
 * tight and full radius we require keyword overlap so distinct nearby issues
 * stay separate. Legacy cases without keywords fall back to geo-only matching
 * (preserves pre-U1 behavior). Returns null when no case qualifies.
 */
async function findNearestCase(
  report: CivicReport,
  keywords: string[],
): Promise<{ id: string; data: CivicCase; distance: number } | null> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTIONS.civicCases)
    .where("category", "==", report.category)
    .get();

  let best: { id: string; data: CivicCase; distance: number } | null = null;
  const point = { lat: report.latitude, lng: report.longitude };

  for (const doc of snap.docs) {
    const data = doc.data() as CivicCase;
    const d = distanceMeters(point, data.centerLocation);
    if (d > AGGREGATION_RADIUS_M) continue;

    // Distinct-issue guard: beyond the same-spot radius, require either keyword
    // overlap, or a legacy case with no keywords recorded.
    const sameSpot = d <= SAME_SPOT_RADIUS_M;
    const legacy = !data.keywords || data.keywords.length === 0;
    const eligible = sameSpot || legacy || hasOverlap(keywords, data.keywords);
    if (!eligible) continue;

    if (best === null || d < best.distance) {
      best = { id: doc.id, data, distance: d };
    }
  }
  return best;
}

/**
 * Aggregate a freshly-created report: attach to an existing case or create a
 * new one. Writes both the case and the report's civicCaseId atomically.
 */
export async function aggregateReport(
  report: CivicReport,
): Promise<AggregationResult> {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const reportRef = db.collection(COLLECTIONS.reports).doc(report.id);
  const casesCol = db.collection(COLLECTIONS.civicCases);

  const keywords = extractKeywords(report);
  const match = await findNearestCase(report, keywords);

  // ---- Attach to existing case ------------------------------------------
  if (match) {
    const oldCount = match.data.reportCount;
    const newCount = oldCount + 1;
    // Incremental centroid (running average) — avoids reading all members.
    const newCenter = {
      lat:
        (match.data.centerLocation.lat * oldCount + report.latitude) / newCount,
      lng:
        (match.data.centerLocation.lng * oldCount + report.longitude) /
        newCount,
    };

    const batch = db.batch();
    const caseUpdate: Record<string, unknown> = {
      reportIds: FieldValue.arrayUnion(report.id),
      reportCount: newCount,
      centerLocation: newCenter,
      updatedAt: now,
    };
    if (keywords.length > 0) {
      caseUpdate.keywords = FieldValue.arrayUnion(...keywords);
    }
    // U2: keep the case's representative severity as the max of its members,
    // and fill locality/district from the first report that has them.
    const reportSev = report.severityScore ?? 0;
    if (reportSev > (match.data.severityScore ?? 0)) {
      caseUpdate.severityScore = reportSev;
      caseUpdate.severityLabel =
        report.severityLabel ?? match.data.severityLabel ?? null;
    }
    if (!match.data.locality && report.locality) {
      caseUpdate.locality = report.locality;
    }
    if (!match.data.district && report.district) {
      caseUpdate.district = report.district;
    }
    batch.update(casesCol.doc(match.id), caseUpdate);
    batch.update(reportRef, { civicCaseId: match.id });
    await batch.commit();

    return {
      civicCaseId: match.id,
      isNewCase: false,
      reportCount: newCount,
      distanceM: match.distance,
    };
  }

  // ---- Create a new single-report case ----------------------------------
  const caseRef = casesCol.doc();
  const civicCase: CivicCase = {
    id: caseRef.id,
    category: report.category,
    centerLocation: { lat: report.latitude, lng: report.longitude },
    reportCount: 1,
    status: "reported",
    locality: report.locality ?? null,
    district: report.district ?? null,
    reportIds: [report.id],
    keywords,
    createdAt: now,
    updatedAt: now,
  };
  // Only attach severity when present (avoid undefined in Firestore set()).
  if (typeof report.severityScore === "number") {
    civicCase.severityScore = report.severityScore;
    civicCase.severityLabel = report.severityLabel;
  }

  const batch = db.batch();
  batch.set(caseRef, civicCase);
  batch.update(reportRef, { civicCaseId: caseRef.id });
  await batch.commit();

  return {
    civicCaseId: caseRef.id,
    isNewCase: true,
    reportCount: 1,
    distanceM: null,
  };
}

/** Pure helper: aggregation metrics from a set of civic cases. */
export function computeAggregationMetrics(cases: CivicCase[]): {
  totalReports: number;
  totalCases: number;
  avgReportsPerCase: number;
} {
  const totalCases = cases.length;
  const totalReports = cases.reduce((sum, c) => sum + (c.reportCount || 0), 0);
  const avgReportsPerCase =
    totalCases === 0 ? 0 : Number((totalReports / totalCases).toFixed(1));
  return { totalReports, totalCases, avgReportsPerCase };
}
