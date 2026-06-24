/**
 * /api/cases — civic case read endpoints (Phase 3).
 *
 *   GET → list civic cases (most-aggregated first) + aggregation metrics
 */
import { NextResponse } from "next/server";

import { computeAggregationMetrics } from "@/lib/aggregation";
import { listCivicCases } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      {
        cases: [],
        metrics: { totalReports: 0, totalCases: 0, avgReportsPerCase: 0 },
      },
      { status: 200 },
    );
  }

  try {
    const cases = await listCivicCases();
    const metrics = computeAggregationMetrics(cases);
    return NextResponse.json({ cases, metrics }, { status: 200 });
  } catch (err) {
    console.error("[api/cases] list failed:", err);
    return NextResponse.json(
      { error: "Failed to list civic cases." },
      { status: 500 },
    );
  }
}
