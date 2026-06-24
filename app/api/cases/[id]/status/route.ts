/**
 * PATCH /api/cases/[id]/status — update a civic case status (Phase 5 workflow).
 *
 * Body: { status: "reported" | "verified" | "in_progress" | "resolved", note?: string }
 * Cascades the new status to all member reports.
 */
import { NextResponse } from "next/server";

import { WORKFLOW_STATUSES } from "@/lib/constants";
import { updateCaseStatus } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { IssueStatus } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isFirebaseAdminConfigured) {
    return NextResponse.json(
      { error: "Server storage is not configured." },
      { status: 503 },
    );
  }

  let body: { status?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = body.status as IssueStatus;
  if (
    !WORKFLOW_STATUSES.includes(status as (typeof WORKFLOW_STATUSES)[number])
  ) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${WORKFLOW_STATUSES.join(", ")}` },
      { status: 422 },
    );
  }

  try {
    const updated = await updateCaseStatus(params.id, status, body.note);
    if (!updated) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }
    return NextResponse.json({ case: updated }, { status: 200 });
  } catch (err) {
    console.error("[api/cases/:id/status] failed:", err);
    return NextResponse.json(
      { error: "Failed to update status." },
      { status: 500 },
    );
  }
}
