import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import type { CivicCase, IssueCategory } from "@/types";

/**
 * Lightweight, dependency-free category distribution (U5 data viz). Deterministic
 * — reports per category as proportional bars.
 */
export function CategoryDistribution({ cases }: { cases: CivicCase[] }) {
  const counts = new Map<IssueCategory, number>();
  for (const c of cases) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + c.reportCount);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = rows.reduce((m, [, v]) => Math.max(m, v), 0) || 1;

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reports by category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map(([cat, count]) => (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>
                {CATEGORY_META[cat].glyph} {CATEGORY_META[cat].label}
              </span>
              <span className="font-semibold tabular-nums">{count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-gradient-brand h-full rounded-full transition-all"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
