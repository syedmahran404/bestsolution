/**
 * POST /api/agent — Velora Operations Agent (U3).
 *
 * Body: { query: string }
 * Runs the tool-using agent over the current civic cases and returns its
 * answer plus the tool-call reasoning steps. Read-only; isolated from the
 * report pipeline.
 */
import { NextResponse } from "next/server";

import { runOpsAgent } from "@/lib/ai/agent";
import { listCivicCases } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      { error: "Server storage is not configured." },
      { status: 503 },
    );
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  if (query.length < 3) {
    return NextResponse.json(
      { error: "Please enter a question (min 3 characters)." },
      { status: 422 },
    );
  }

  try {
    const cases = await listCivicCases();
    const result = await runOpsAgent(query, cases);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error("[api/agent] failed:", err);
    return NextResponse.json(
      { error: "Agent failed to process the request." },
      { status: 500 },
    );
  }
}
