/**
 * Civic insights + linkage explanations (Phase 4).
 *
 * These are DETERMINISTIC computations over the aggregation data — NO Gemini
 * calls (per the token-optimization rule: never call AI for clustering,
 * aggregation, or analytics). Pure functions, safe to use on server or client.
 */
import { AGGREGATION_RADIUS_M, CATEGORY_META } from "@/lib/constants";
import type { CivicCase, IssueCategory } from "@/types";

/**
 * Human-readable explanation of why a report belongs to a civic case.
 * Deterministic — derived from the clustering rules (same category + within
 * the aggregation radius), no AI.
 */
export function explainLinkage(civicCase: CivicCase): string {
  const label = CATEGORY_META[civicCase.category].label;
  if (civicCase.reportCount <= 1) {
    return `This case currently has a single report of category “${label}”. New nearby reports of the same category will be aggregated here.`;
  }
  return `Linked because it shares the category “${label}” and falls within the ${AGGREGATION_RADIUS_M}m aggregation radius of the other reports in this case.`;
}

/* -------------------------------------------------------------------------- */
/*                      Operations analytics (Phase 5)                        */
/* -------------------------------------------------------------------------- */

export interface OperationsMetrics {
  totalReports: number;
  totalCases: number;
  openCases: number;
  closedCases: number;
  recentlyActive: CivicCase[];
  topCategories: { category: IssueCategory; reportCount: number }[];
  activeClusters: CivicCase[];
  largestCases: CivicCase[];
  /* ---- U3 operational analytics (additive) ---- */
  localities: { name: string; reportCount: number }[];
  districts: { name: string; reportCount: number }[];
  recentlyEscalated: CivicCase[];
  fastestGrowing: CivicCase | null;
  dailyActiveCount: number;
  weeklyActiveCount: number;
  avgClusterSize: number;
  /* ---- U4 accountability (additive) ---- */
  overdueCount: number;
  createdToday: number;
  resolvedToday: number;
}

/**
 * Deterministic operations dashboard metrics (Phase 5 + U3). NO Gemini.
 * "Open" = any non-resolved case; "Closed" = resolved.
 */
export function computeOperationsMetrics(
  cases: CivicCase[],
  listLimit = 5,
): OperationsMetrics {
  const totalCases = cases.length;
  const totalReports = cases.reduce((s, c) => s + (c.reportCount || 0), 0);
  const closedCases = cases.filter((c) => c.status === "resolved").length;
  const openCases = totalCases - closedCases;

  const byUpdated = [...cases].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
  const recentlyActive = byUpdated.slice(0, listLimit);

  // Reports per category.
  const catCounts = new Map<IssueCategory, number>();
  for (const c of cases) {
    catCounts.set(c.category, (catCounts.get(c.category) ?? 0) + c.reportCount);
  }
  const topCategories = [...catCounts.entries()]
    .map(([category, reportCount]) => ({ category, reportCount }))
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, listLimit);

  const byCount = [...cases].sort((a, b) => b.reportCount - a.reportCount);
  const largestCases = byCount.slice(0, listLimit);
  const activeClusters = byCount
    .filter((c) => c.reportCount > 1 && c.status !== "resolved")
    .slice(0, listLimit);

  // U3: reports grouped by locality / district.
  const groupCounts = (key: "locality" | "district") => {
    const m = new Map<string, number>();
    for (const c of cases) {
      const name = (c[key] ?? "").trim();
      if (!name) continue;
      m.set(name, (m.get(name) ?? 0) + c.reportCount);
    }
    return [...m.entries()]
      .map(([name, reportCount]) => ({ name, reportCount }))
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, listLimit);
  };

  const now = Date.now();
  const within = (iso: string, hours: number) =>
    (now - new Date(iso).getTime()) / 36e5 <= hours;

  const recentlyEscalated = byUpdated
    .filter((c) => c.status === "verified" || c.status === "in_progress")
    .slice(0, listLimit);

  const fastestGrowing = byCount.filter((c) => c.reportCount > 1)[0] ?? null;

  // U4 accountability: overdue = open case older than 7 days; today counters.
  const overdueCount = cases.filter(
    (c) => c.status !== "resolved" && !within(c.createdAt, 24 * 7),
  ).length;
  const createdToday = cases.filter((c) => within(c.createdAt, 24)).length;
  const resolvedToday = cases.filter(
    (c) => c.status === "resolved" && within(c.updatedAt, 24),
  ).length;

  return {
    totalReports,
    totalCases,
    openCases,
    closedCases,
    recentlyActive,
    topCategories,
    activeClusters,
    largestCases,
    localities: groupCounts("locality"),
    districts: groupCounts("district"),
    recentlyEscalated,
    fastestGrowing,
    dailyActiveCount: cases.filter((c) => within(c.updatedAt, 24)).length,
    weeklyActiveCount: cases.filter((c) => within(c.updatedAt, 24 * 7)).length,
    avgClusterSize:
      totalCases === 0 ? 0 : Number((totalReports / totalCases).toFixed(1)),
    overdueCount,
    createdToday,
    resolvedToday,
  };
}
