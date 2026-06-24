/**
 * Server-only data access for citizen reports (Phase 2).
 *
 * Centralizes all Firestore operations on the `reports` collection so the
 * Route Handler (POST/GET) and the "My Reports" server component share one
 * implementation. Uses the Firebase Admin SDK — never import from a client
 * component.
 */
import "server-only";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { aggregateReport, type AggregationResult } from "@/lib/aggregation";
import type { CreateReportInput } from "@/lib/validation/report";
import type { CivicReport } from "@/types";

/** Persist a new report and return the created document. */
export async function createReport(
  input: CreateReportInput,
): Promise<CivicReport> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.reports).doc();

  const report: CivicReport = {
    id: ref.id,
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl ?? null,
    audioUrl: input.audioUrl ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
    status: "reported",
    civicCaseId: null,
    createdAt: new Date().toISOString(),
  };

  await ref.set(report);
  return report;
}

/**
 * Create a report AND run the aggregation engine (Phase 3): the report is
 * linked to a new or existing civic case. Returns the linked report plus the
 * aggregation outcome.
 */
export async function submitReport(input: CreateReportInput): Promise<{
  report: CivicReport;
  aggregation: AggregationResult;
}> {
  const report = await createReport(input);
  const aggregation = await aggregateReport(report);
  return {
    report: { ...report, civicCaseId: aggregation.civicCaseId },
    aggregation,
  };
}

/** List reports, newest first. */
export async function listReports(max = 50): Promise<CivicReport[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.reports)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => doc.data() as CivicReport);
}
