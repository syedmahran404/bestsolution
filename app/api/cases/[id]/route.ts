/**
 * /api/cases/[id] — single civic case + its linked reports (Phase 3, read-only).
 */
import { NextResponse } from "next/server";

import { getCivicCase, getReportsForCase } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      { error: "Server storage is not configured." },
      { status: 503 },
    );
  }

  try {
    const civicCase = await getCivicCase(params.id);
    if (!civicCase) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }
    const reports = await getReportsForCase(params.id);
    return NextResponse.json({ case: civicCase, reports }, { status: 200 });
  } catch (err) {
    console.error("[api/cases/:id] failed:", err);
    return NextResponse.json(
      { error: "Failed to load civic case." },
      { status: 500 },
    );
  }
}
