/**
 * Explainable civic insights (U4) — deterministic, never hallucinated.
 *
 * Generates concise insight cards ("Water leak reports increased 32% this
 * week", "Most unresolved issues are within range of a hospital zone") where
 * every card carries WHY it matters, HOW it was calculated, and a confidence.
 * NO Gemini.
 */
import { CATEGORY_META } from "@/lib/constants";
import type { CivicCase, CivicInsight, IssueCategory } from "@/types";

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

function confidenceFromSample(n: number): number {
  return Number(Math.min(0.95, 0.4 + Math.min(0.5, n * 0.05)).toFixed(2));
}

/** Build deterministic insight cards from the current civic cases. */
export function generateCivicInsights(cases: CivicCase[]): CivicInsight[] {
  const insights: CivicInsight[] = [];
  if (cases.length === 0) return insights;

  // 1) Per-category week-over-week trend (reports).
  const cats = Array.from(new Set(cases.map((c) => c.category)));
  for (const cat of cats) {
    const subset = cases.filter((c) => c.category === cat);
    const recent = subset
      .filter((c) => hoursSince(c.createdAt) <= 24 * 7)
      .reduce((s, c) => s + c.reportCount, 0);
    const prior = subset
      .filter((c) => {
        const h = hoursSince(c.createdAt);
        return h > 24 * 7 && h <= 24 * 14;
      })
      .reduce((s, c) => s + c.reportCount, 0);
    if (recent === 0 && prior === 0) continue;
    const label = CATEGORY_META[cat as IssueCategory].label;
    if (prior > 0 && recent !== prior) {
      const pct = Math.round(((recent - prior) / prior) * 100);
      const dir = pct >= 0 ? "increased" : "decreased";
      insights.push({
        id: `trend-${cat}`,
        title: `${label} reports ${dir} ${Math.abs(pct)}% this week`,
        why: `${dir === "increased" ? "Rising" : "Falling"} volume signals a ${dir === "increased" ? "growing" : "easing"} ${label.toLowerCase()} problem.`,
        how: `Compared report volume in the last 7 days (${recent}) to the prior 7 days (${prior}).`,
        confidence: confidenceFromSample(subset.length),
        kind: "trend",
      });
    }
  }

  // 2) Hotspot: most affected locality among unresolved cases.
  const localityLoad = new Map<string, number>();
  for (const c of cases) {
    if (c.status === "resolved") continue;
    const loc = (c.locality ?? "").trim();
    if (!loc) continue;
    localityLoad.set(loc, (localityLoad.get(loc) ?? 0) + c.reportCount);
  }
  const topLocality = [...localityLoad.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (topLocality) {
    insights.push({
      id: "hotspot-locality",
      title: `Most unresolved reports are in ${topLocality[0]}`,
      why: "Concentrated unresolved load marks a priority hotspot for field action.",
      how: `Summed reportCount of unresolved cases per locality; ${topLocality[0]} leads with ${topLocality[1]}.`,
      confidence: confidenceFromSample(localityLoad.size + 3),
      kind: "hotspot",
    });
  }

  // 3) Elevated-priority zone: cases near hospitals/schools.
  const sensitive = cases.filter(
    (c) => c.severityLabel === "high" || c.severityLabel === "critical",
  );
  if (sensitive.length > 0) {
    insights.push({
      id: "priority-zone",
      title: `${sensitive.length} case(s) flagged high/critical priority`,
      why: "High context-aware severity (e.g. near hospitals/schools) warrants faster response.",
      how: "Counted cases whose deterministic context-aware severity is high or critical.",
      confidence: confidenceFromSample(sensitive.length + 5),
      kind: "priority",
    });
  }

  // 4) Resolution progress.
  const resolved = cases.filter((c) => c.status === "resolved").length;
  if (cases.length >= 3) {
    const rate = Math.round((resolved / cases.length) * 100);
    insights.push({
      id: "resolution-rate",
      title: `${rate}% of civic cases resolved`,
      why: "Resolution rate reflects responsiveness and accountability.",
      how: `Resolved cases (${resolved}) divided by total cases (${cases.length}).`,
      confidence: confidenceFromSample(cases.length),
      kind: "resolution",
    });
  }

  return insights;
}
