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
import { analyzeReport } from "@/lib/ai/analysis";
import type { CreateReportInput } from "@/lib/validation/report";
import type { AIAnalysis, CivicReport } from "@/types";

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
    reporterId: input.reporterId ?? null,
    reporterName: input.reporterName ?? null,
    createdAt: new Date().toISOString(),
  };

  await ref.set(report);
  return report;
}

/**
 * Create a report, run the aggregation engine (Phase 3), and run the Civic
 * Intelligence analysis (Phase 4). The report is linked to a civic case and
 * analyzed by Gemini in a single submit flow.
 *
 * AI analysis is best-effort: if Gemini is unconfigured or fails, the report
 * is still created and aggregated (analysis = null).
 */
export async function submitReport(input: CreateReportInput): Promise<{
  report: CivicReport;
  aggregation: AggregationResult;
  analysis: AIAnalysis | null;
}> {
  const report = await createReport(input);
  const aggregation = await aggregateReport(report);
  const linkedReport: CivicReport = {
    ...report,
    civicCaseId: aggregation.civicCaseId,
  };

  // Phase 4: one Gemini call; persisted on the report doc inside analyzeReport.
  const analysis = await analyzeReport(linkedReport);

  return {
    report: { ...linkedReport, aiAnalysis: analysis },
    aggregation,
    analysis,
  };
}

/** List reports, newest first. Admin-wide view (all reporters). */
export async function listReports(max = 50): Promise<CivicReport[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.reports)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => doc.data() as CivicReport);
}

/**
 * List only the reports submitted by a given anonymous reporter (U1).
 * Powers the isolated "My Reports" view. Sorted in memory to avoid requiring
 * a composite Firestore index.
 */
export async function listReportsByReporter(
  reporterId: string,
  max = 50,
): Promise<CivicReport[]> {
  if (!reporterId) return [];
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.reports)
    .where("reporterId", "==", reporterId)
    .limit(max)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as CivicReport)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
