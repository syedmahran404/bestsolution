/**
 * Velora 3.0 — Chart data shaping (Phase 2B, CH2).
 *
 * DETERMINISTIC, additive helpers that transform existing CivicCase data into
 * chart-ready series. NO Gemini, NO Firestore — pure functions over data the
 * caller already loaded. Kept separate from lib/insights.ts (unchanged) so the
 * operations engine stays untouched.
 */
import { STATUS_META } from "@/lib/constants";
import type { CivicCase, SeverityLabel } from "@/types";

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Case mix by lifecycle group (open / in-progress / resolved). */
export function statusMix(cases: CivicCase[]): Slice[] {
  const groups = { open: 0, progress: 0, resolved: 0 };
  for (const c of cases) groups[STATUS_META[c.status].group] += 1;
  return [
    { label: "Open", value: groups.open, color: "hsl(var(--status-open))" },
    {
      label: "In progress",
      value: groups.progress,
      color: "hsl(var(--status-progress))",
    },
    {
      label: "Resolved",
      value: groups.resolved,
      color: "hsl(var(--status-resolved))",
    },
  ];
}

const SEVERITY_ORDER: SeverityLabel[] = ["low", "medium", "high", "critical"];
const SEVERITY_COLOR: Record<SeverityLabel, string> = {
  low: "hsl(var(--success))",
  medium: "hsl(var(--info))",
  high: "hsl(var(--warning))",
  critical: "hsl(var(--critical))",
};

/** Case mix by severity band. */
export function severityMix(cases: CivicCase[]): Slice[] {
  const counts: Record<SeverityLabel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const c of cases) {
    if (c.severityLabel) counts[c.severityLabel] += 1;
  }
  return SEVERITY_ORDER.map((s) => ({
    label: s[0].toUpperCase() + s.slice(1),
    value: counts[s],
    color: SEVERITY_COLOR[s],
  }));
}

export interface DailyActivity {
  labels: string[];
  created: number[];
  resolved: number[];
}

/**
 * Reports created vs cases resolved over the last `days` days (default 7),
 * oldest → newest. Uses createdAt / (resolved) updatedAt timestamps.
 */
export function dailyActivity(cases: CivicCase[], days = 7): DailyActivity {
  const labels: string[] = [];
  const created: number[] = [];
  const resolved: number[] = [];
  const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short" });

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(new Date());
  const DAY = 86_400_000;

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = today - i * DAY;
    const dayEnd = dayStart + DAY;
    labels.push(fmt.format(new Date(dayStart)));
    created.push(
      cases.filter((c) => {
        const t = new Date(c.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length,
    );
    resolved.push(
      cases.filter((c) => {
        if (c.status !== "resolved") return false;
        const t = new Date(c.updatedAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length,
    );
  }

  return { labels, created, resolved };
}
