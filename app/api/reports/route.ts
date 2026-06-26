/**
 * /api/reports — Citizen report endpoints (Phase 2).
 *
 *   POST  → create a new report (validated with Zod, persisted via Admin SDK)
 *   GET   → list recent reports (newest first)
 *
 * Backend is Next.js Route Handlers only (locked architecture). Media files
 * are uploaded to Firebase Storage on the client; this endpoint receives the
 * resulting URLs plus the report fields as JSON.
 */
import { NextResponse } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import {
  listReports,
  listReportsByReporter,
  submitReport,
} from "@/lib/reports";
import { createReportSchema } from "@/lib/validation/report";
import type { CivicReport } from "@/types";

// Reports are user data that must never be statically cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      {
        error:
          "Server storage is not configured (FIREBASE_SERVICE_ACCOUNT_KEY).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const { report, aggregation, analysis } = await submitReport(parsed.data);
    return NextResponse.json(
      { report, aggregation, analysis },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/reports] create failed:", err);
    return NextResponse.json(
      { error: "Failed to create report." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json({ reports: [] }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const reporterId = searchParams.get("reporterId");
  const scope = searchParams.get("scope");

  try {
    // Citizen view: must pass reporterId → only their own reports (U1).
    // Admin-wide view: explicit scope=all.
    let reports: CivicReport[];
    if (scope === "all") {
      reports = await listReports();
    } else if (reporterId) {
      reports = await listReportsByReporter(reporterId);
    } else {
      // No identity and no admin scope → never leak all reports.
      reports = [];
    }
    return NextResponse.json({ reports }, { status: 200 });
  } catch (err) {
    console.error("[api/reports] list failed:", err);
    return NextResponse.json(
      { error: "Failed to list reports." },
      { status: 500 },
    );
  }
}
