/**
 * Operations engine (U3) — DETERMINISTIC, explainable operational intelligence.
 *
 * NO Gemini calls here. Priority, recommendation, affected-population estimate,
 * and the operational timeline are pure functions of the case + its reports, so
 * they are fast, free, transparent, and safe to run anywhere. The AI brief
 * (lib/ai/operations-brief.ts) *synthesizes* these signals but never overrides
 * the deterministic priority.
 */
import {
  CATEGORY_META,
  POPULATION_BASE,
  severityLabelFromScore,
} from "@/lib/constants";
import type {
  CivicCase,
  CivicReport,
  ContextFactor,
  PriorityAssessment,
  Recommendation,
  TimelineEvent,
} from "@/types";

/** Union of member context factors (closest per type). */
function aggregateFactors(reports: CivicReport[]): ContextFactor[] {
  const byType = new Map<string, ContextFactor>();
  for (const r of reports) {
    for (const f of r.contextFactors ?? []) {
      const ex = byType.get(f.type);
      if (!ex || f.distanceM < ex.distanceM) byType.set(f.type, f);
    }
  }
  return Array.from(byType.values()).sort((a, b) => a.distanceM - b.distanceM);
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

/** Rough, deterministic estimate of people affected (clearly an estimate). */
export function estimateAffectedPopulation(
  civicCase: CivicCase,
  factors: ContextFactor[],
): number {
  const base = POPULATION_BASE[civicCase.category] ?? 200;
  const aggregationMult = 1 + Math.max(0, civicCase.reportCount - 1) * 0.4;
  let contextMult = 1;
  for (const f of factors) {
    if (f.type === "hospital" || f.type === "school") contextMult += 0.6;
    else if (f.type === "transit" || f.type === "railway") contextMult += 0.4;
    else contextMult += 0.2;
  }
  return Math.round(base * aggregationMult * contextMult);
}

/**
 * Deterministic, explainable priority. Severity (context-aware, from U2) is the
 * backbone; aggregation size and recency add transparent boosts.
 */
export function computePriority(
  civicCase: CivicCase,
  reports: CivicReport[] = [],
): PriorityAssessment {
  const factors = aggregateFactors(reports);

  const severity =
    civicCase.severityScore ??
    Math.max(0, ...reports.map((r) => r.severityScore ?? 0), 0);

  const reasons: string[] = [`Context-aware severity: ${severity}`];

  const aggregationBoost = Math.min(
    20,
    Math.max(0, civicCase.reportCount - 1) * 3,
  );
  if (aggregationBoost > 0) {
    reasons.push(
      `Aggregation of ${civicCase.reportCount} reports: +${aggregationBoost}`,
    );
  }

  const recencyBoost = hoursSince(civicCase.updatedAt) <= 24 ? 5 : 0;
  if (recencyBoost > 0) reasons.push("Active in the last 24h: +5");

  if (factors.length > 0) {
    reasons.push(
      `Sensitive places nearby: ${factors.map((f) => f.type).join(", ")}`,
    );
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round(severity + aggregationBoost + recencyBoost)),
  );

  // Confidence rises with evidence (reports + context); capped.
  const confidence = Math.min(
    0.95,
    0.55 +
      Math.min(0.3, (civicCase.reportCount - 1) * 0.06) +
      (factors.length > 0 ? 0.1 : 0),
  );

  return {
    score,
    label: severityLabelFromScore(score),
    confidence: Number(confidence.toFixed(2)),
    reasons,
    affectedPopulation: estimateAffectedPopulation(civicCase, factors),
    contextFactors: factors,
    reportCount: civicCase.reportCount,
  };
}

/** Deterministic operational recommendation with reasoning (never a bare label). */
export function recommendAction(
  civicCase: CivicCase,
  priority: PriorityAssessment,
): Recommendation {
  const catLabel = CATEGORY_META[civicCase.category].label;

  if (civicCase.status === "resolved") {
    return {
      action: "close",
      label: "Close case",
      reasoning: ["Case is marked resolved; no further action required."],
    };
  }

  if (priority.label === "critical") {
    return {
      action: "inspect_immediately",
      label: "Inspect immediately & escalate",
      reasoning: [
        `Critical priority (score ${priority.score}).`,
        `~${priority.affectedPopulation.toLocaleString()} people potentially affected.`,
        ...(priority.contextFactors.length
          ? [`Near ${priority.contextFactors.map((f) => f.type).join(", ")}.`]
          : []),
      ],
    };
  }

  if (priority.label === "high") {
    return {
      action: "dispatch_crew",
      label: `Dispatch crew & coordinate ${catLabel} department`,
      reasoning: [
        `High priority (score ${priority.score}).`,
        `${civicCase.reportCount} report(s) aggregated.`,
        "Field action recommended; coordinate with the responsible department.",
      ],
    };
  }

  if (civicCase.reportCount === 1) {
    return {
      action: priority.label === "low" ? "await_more_reports" : "verify_report",
      label:
        priority.label === "low"
          ? "Await more reports"
          : "Verify report on site",
      reasoning: [
        "Single report so far.",
        priority.label === "low"
          ? "Low priority; monitor for corroborating reports before acting."
          : "Medium priority; verify before allocating resources.",
      ],
    };
  }

  return {
    action: "monitor",
    label: "Monitor & re-evaluate",
    reasoning: [
      `Medium priority (score ${priority.score}).`,
      `${civicCase.reportCount} reports; watch for growth or severity changes.`,
    ],
  };
}

/** Build a deterministic chronological operations timeline. */
export function buildOperationsTimeline(
  civicCase: CivicCase,
  reports: CivicReport[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const sortedReports = [...reports].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : 1,
  );

  if (sortedReports[0]) {
    events.push({
      type: "report",
      label: "First citizen report received",
      at: sortedReports[0].createdAt,
      detail: sortedReports[0].title,
      source: "citizen",
    });
  }

  events.push({
    type: "case",
    label: "Civic case created (aggregation)",
    at: civicCase.createdAt,
    source: "system",
  });

  if (typeof civicCase.severityScore === "number") {
    events.push({
      type: "context",
      label: `Context & severity determined (${civicCase.severityLabel ?? "scored"})`,
      at: civicCase.createdAt,
      source: "system",
    });
  }

  // Additional aggregated reports (after the first).
  for (const r of sortedReports.slice(1)) {
    events.push({
      type: "report",
      label: "Additional report aggregated",
      at: r.createdAt,
      detail: r.title,
      source: "citizen",
    });
  }

  if (civicCase.aiGeneratedAt) {
    events.push({
      type: "ai",
      label: "AI case summary generated",
      at: civicCase.aiGeneratedAt,
      source: "ai",
    });
  }

  if (civicCase.opsBrief?.generatedAt) {
    events.push({
      type: "ai",
      label: "AI operations brief generated",
      at: civicCase.opsBrief.generatedAt,
      source: "ai",
    });
  }

  for (const h of civicCase.statusHistory ?? []) {
    events.push({
      type: "status",
      label: `Status updated → ${h.status.replace("_", " ")}`,
      at: h.at,
      detail: h.note,
      source: "admin",
    });
  }

  return events.sort((a, b) => (a.at < b.at ? -1 : 1));
}
