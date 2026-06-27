import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  DonutChart,
  TrendChart,
  categoryBarData,
} from "@/components/ui/chart";
import { dailyActivity, severityMix, statusMix } from "@/lib/chart-data";
import type { OperationsMetrics } from "@/lib/insights";
import type { CivicCase } from "@/types";

/**
 * Velora 3.0 — Operations analytics charts (Phase 2B, CH2). Real, deterministic
 * data visualizations answering operational questions: where is the load, how
 * is the case mix, and is the team keeping pace (created vs resolved).
 */
export function OpsCharts({
  cases,
  metrics,
}: {
  cases: CivicCase[];
  metrics: OperationsMetrics;
}) {
  const status = statusMix(cases);
  const severity = severityMix(cases);
  const activity = dailyActivity(cases, 7);
  const { data: catData, glyphs } = categoryBarData(metrics.topCategories);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Case status mix</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            ariaLabel="Civic cases by lifecycle status"
            data={status}
            valueLabel="Cases"
            centerLabel="cases"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Severity distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            ariaLabel="Civic cases by severity band"
            data={severity}
            valueLabel="Cases"
            centerLabel="rated"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            ariaLabel="Reports created versus cases resolved over the last seven days"
            labels={activity.labels}
            series={[
              {
                name: "Created",
                points: activity.created,
                color: "hsl(var(--brand))",
              },
              {
                name: "Resolved",
                points: activity.resolved,
                color: "hsl(var(--success))",
              },
            ]}
          />
        </CardContent>
      </Card>

      {catData.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reports by category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              ariaLabel="Total reports per civic category"
              data={catData}
              glyphs={glyphs}
              valueLabel="Reports"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
