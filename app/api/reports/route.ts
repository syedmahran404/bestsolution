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
import { createReport, listReports } from "@/lib/reports";
import { createReportSchema } from "@/lib/validation/report";

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
    const report = await createReport(parsed.data);
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error("[api/reports] create failed:", err);
    return NextResponse.json(
      { error: "Failed to create report." },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json({ reports: [] }, { status: 200 });
  }

  try {
    const reports = await listReports();
    return NextResponse.json({ reports }, { status: 200 });
  } catch (err) {
    console.error("[api/reports] list failed:", err);
    return NextResponse.json(
      { error: "Failed to list reports." },
      { status: 500 },
    );
  }
}
