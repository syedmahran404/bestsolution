/**
 * Server-only data access for civic cases (Phase 3 reads).
 *
 * Centralizes Firestore reads on the `civicCases` collection and the linked
 * `reports`, shared by the map (home), the case-detail page, and the cases
 * API. Uses the Firebase Admin SDK — never import from a client component.
 */
import "server-only";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import type { CivicCase, CivicReport } from "@/types";

/** List civic cases, most-aggregated first (then most recently updated). */
export async function listCivicCases(max = 200): Promise<CivicCase[]> {
  const db = getAdminDb();
  // Single-field order (auto-indexed); final ordering done in memory to avoid
  // needing a composite index for the demo.
  const snap = await db
    .collection(COLLECTIONS.civicCases)
    .orderBy("updatedAt", "desc")
    .limit(max)
    .get();
  return snap.docs
    .map((d) => d.data() as CivicCase)
    .sort((a, b) => {
      if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    });
}

/** Fetch a single civic case by id (null if not found). */
export async function getCivicCase(id: string): Promise<CivicCase | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.civicCases).doc(id).get();
  return doc.exists ? (doc.data() as CivicCase) : null;
}

/** Fetch the reports linked to a civic case, newest first. */
export async function getReportsForCase(
  caseId: string,
): Promise<CivicReport[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTIONS.reports)
    .where("civicCaseId", "==", caseId)
    .get();
  // Sort in memory to avoid requiring a composite index for the demo.
  return snap.docs
    .map((d) => d.data() as CivicReport)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
