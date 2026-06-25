/**
 * Civic insights + linkage explanations (Phase 4).
 *
 * These are DETERMINISTIC computations over the aggregation data — NO Gemini
 * calls (per the token-optimization rule: never call AI for clustering,
 * aggregation, or analytics). Pure functions, safe to use on server or client.
 */
import { AGGREGATION_RADIUS_M, CATEGORY_META } from "@/lib/constants";
import type { CivicCase, IssueCategory } from "@/types";

export interface CivicInsights {
  /** Category present in the most cases. */
  mostCommonCategory: { category: IssueCategory; caseCount: number } | null;
  /** The case with the highest report count. */
  largestCase: CivicCase | null;
  /** Multi-report cases, most recently updated first (top N). */
  growingCases: CivicCase[];
}

/** Compute the AI Insights card values from the set of civic cases. */
export function computeCivicInsights(
  cases: CivicCase[],
  growingLimit = 3,
): CivicInsights {
  if (cases.length === 0) {
    return { mostCommonCategory: null, largestCase: null, growingCases: [] };
  }

  // Most common category by number of cases.
  const counts = new Map<IssueCategory, number>();
  for (const c of cases) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }
  let mostCommonCategory: CivicInsights["mostCommonCategory"] = null;
  for (const [category, caseCount] of counts) {
    if (!mostCommonCategory || caseCount > mostCommonCategory.caseCount) {
      mostCommonCategory = { category, caseCount };
    }
  }

  // Largest case by reportCount.
  const largestCase = cases.reduce(
    (max, c) => (c.reportCount > (max?.reportCount ?? -1) ? c : max),
    null as CivicCase | null,
  );

  // Recently growing = multi-report cases sorted by updatedAt desc.
  const growingCases = cases
    .filter((c) => c.reportCount > 1)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, growingLimit);

  return { mostCommonCategory, largestCase, growingCases };
}

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
}

/**
 * Deterministic operations dashboard metrics (Phase 5). NO Gemini.
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

  return {
    totalReports,
    totalCases,
    openCases,
    closedCases,
    recentlyActive,
    topCategories,
    activeClusters,
    largestCases,
  };
}
