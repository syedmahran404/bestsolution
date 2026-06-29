import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, categoryBarData } from "@/components/ui/chart";
import { getServerT } from "@/lib/i18n/server";
import type { CivicCase, IssueCategory } from "@/types";

/**
 * Category distribution (CH2) — now rendered with the shared, accessible
 * BarChart primitive. Deterministic: reports per category as proportional bars.
 */
export function CategoryDistribution({ cases }: { cases: CivicCase[] }) {
  const t = getServerT();
  const counts = new Map<IssueCategory, number>();
  for (const c of cases) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + c.reportCount);
  }
  const rows = [...counts.entries()]
    .map(([category, reportCount]) => ({ category, reportCount }))
    .sort((a, b) => b.reportCount - a.reportCount);

  if (rows.length === 0) return null;

  const { data, glyphs } = categoryBarData(rows);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {t("civic.reportsByCategory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          ariaLabel={t("civic.reportsByCategoryAria")}
          data={data}
          glyphs={glyphs}
          valueLabel={t("civic.valueReports")}
        />
      </CardContent>
    </Card>
  );
}
