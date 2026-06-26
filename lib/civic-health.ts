/**
 * Civic Health Index (U4) — the signature deterministic metric.
 *
 * Turns raw cases into a living 0-100 health score per scope (city, category,
 * ward/locality), with a trend and a fully explainable factor breakdown. NO
 * Gemini — every number is transparent math, safe to recompute anywhere.
 *
 * Higher score = healthier (fewer/less-severe unresolved issues, good
 * resolution rate, not rising).
 */
import { CATEGORY_META } from "@/lib/constants";
import type {
  CivicCase,
  HealthFactor,
  HealthScore,
  TrendDirection,
} from "@/types";

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Score the health of an arbitrary subset of cases. */
export function scoreHealth(
  cases: CivicCase[],
  scope: HealthScore["scope"],
  name: string,
): HealthScore {
  const total = cases.length;
  if (total === 0) {
    return {
      scope,
      name,
      score: 100,
      trend: "stable",
      trendReason: "No reported issues in scope.",
      factors: [],
      confidence: 0.3,
      sampleSize: 0,
    };
  }

  const resolved = cases.filter((c) => c.status === "resolved").length;
  const resolutionRate = resolved / total;
  const unresolvedRatio = (total - resolved) / total;
  const avgSeverity =
    cases.reduce((s, c) => s + (c.severityScore ?? 50), 0) / total;

  const recent = cases.filter((c) => hoursSince(c.createdAt) <= 24 * 7).length;
  const prior = cases.filter((c) => {
    const h = hoursSince(c.createdAt);
    return h > 24 * 7 && h <= 24 * 14;
  }).length;
  const growth = recent - prior;

  const unresolvedPenalty = unresolvedRatio * 40;
  const severityPenalty = (avgSeverity / 100) * 35;
  const growthPenalty = growth > 0 ? Math.min(15, growth * 3) : 0;
  const resolutionBonus = resolutionRate * 10;

  const score = clamp(
    Math.round(
      100 -
        unresolvedPenalty -
        severityPenalty -
        growthPenalty +
        resolutionBonus,
    ),
  );

  const factors: HealthFactor[] = [
    {
      label: "Unresolved load",
      weight: 40,
      value: Number(unresolvedRatio.toFixed(2)),
      contribution: -Math.round(unresolvedPenalty),
      note: `${total - resolved}/${total} unresolved`,
    },
    {
      label: "Average severity",
      weight: 35,
      value: Math.round(avgSeverity),
      contribution: -Math.round(severityPenalty),
    },
    {
      label: "Recent growth (7d vs prior)",
      weight: 15,
      value: growth,
      contribution: -Math.round(growthPenalty),
    },
    {
      label: "Resolution rate",
      weight: 10,
      value: Number(resolutionRate.toFixed(2)),
      contribution: Math.round(resolutionBonus),
    },
  ];

  // Trend (deterministic).
  let trend: TrendDirection;
  let trendReason: string;
  if (avgSeverity > 70 && growth > 0) {
    trend = "critical";
    trendReason = `High average severity (${Math.round(avgSeverity)}) with ${growth} more reports than the prior week.`;
  } else if (growth > 0) {
    trend = "rising";
    trendReason = `${growth} more reports this week than last.`;
  } else if (resolutionRate >= 0.5 || growth < 0) {
    trend = "improving";
    trendReason =
      growth < 0
        ? `${-growth} fewer reports this week than last.`
        : `Resolution rate ${Math.round(resolutionRate * 100)}%.`;
  } else {
    trend = "stable";
    trendReason = "Activity and severity are steady.";
  }

  const confidence = Math.min(0.95, 0.4 + Math.min(0.5, total * 0.05));

  return {
    scope,
    name,
    score,
    trend,
    trendReason,
    factors,
    confidence: Number(confidence.toFixed(2)),
    sampleSize: total,
  };
}

export interface ResolutionStats {
  resolvedCount: number;
  resolutionRate: number;
  /** Average hours from case creation to resolution (null if unknown). */
  avgResolutionHours: number | null;
}

/** Deterministic resolution velocity from status history. */
export function computeResolutionStats(cases: CivicCase[]): ResolutionStats {
  const total = cases.length;
  const resolvedCases = cases.filter((c) => c.status === "resolved");
  const durations: number[] = [];
  for (const c of resolvedCases) {
    const entry = (c.statusHistory ?? []).find((h) => h.status === "resolved");
    if (entry) {
      const hrs =
        (new Date(entry.at).getTime() - new Date(c.createdAt).getTime()) / 36e5;
      if (hrs >= 0) durations.push(hrs);
    }
  }
  const avg =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null;
  return {
    resolvedCount: resolvedCases.length,
    resolutionRate: total === 0 ? 0 : resolvedCases.length / total,
    avgResolutionHours: avg === null ? null : Number(avg.toFixed(1)),
  };
}

export interface CivicHealthOverview {
  city: HealthScore;
  categories: HealthScore[];
  wards: HealthScore[];
  resolution: ResolutionStats;
}

/** Top-level overview used by the home page + executive dashboard. */
export function computeCivicHealthOverview(
  cases: CivicCase[],
  wardLimit = 4,
): CivicHealthOverview {
  const city = scoreHealth(cases, "city", "City");

  const categories = Array.from(new Set(cases.map((c) => c.category)))
    .map((cat) =>
      scoreHealth(
        cases.filter((c) => c.category === cat),
        "category",
        CATEGORY_META[cat].label,
      ),
    )
    .sort((a, b) => a.score - b.score);

  const localityNames = Array.from(
    new Set(cases.map((c) => (c.locality ?? "").trim()).filter(Boolean)),
  );
  const wards = localityNames
    .map((name) =>
      scoreHealth(
        cases.filter((c) => (c.locality ?? "").trim() === name),
        "ward",
        name,
      ),
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, wardLimit);

  return {
    city,
    categories,
    wards,
    resolution: computeResolutionStats(cases),
  };
}
