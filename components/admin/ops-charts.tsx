import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  DonutChart,
  TrendChart,
  categoryBarData,
} from "@/components/ui/chart";
import { dailyActivity, severityMix, statusMix } from "@/lib/chart-data";
import { getServerT } from "@/lib/i18n/server";
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
  const t = getServerT();
  const status = statusMix(cases);
  const severity = severityMix(cases);
  const activity = dailyActivity(cases, 7);
  const { data: catData, glyphs } = categoryBarData(metrics.topCategories);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("charts.statusMix")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            ariaLabel={t("charts.casesByStatusAria")}
            data={status}
            valueLabel={t("charts.valueCases")}
            centerLabel={t("charts.centerCases")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("charts.severityDistribution")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            ariaLabel={t("charts.casesBySeverityAria")}
            data={severity}
            valueLabel={t("charts.valueCases")}
            centerLabel={t("charts.centerRated")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("charts.activity7d")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            ariaLabel={t("charts.activityAria")}
            labels={activity.labels}
            series={[
              {
                name: t("charts.seriesCreated"),
                points: activity.created,
                color: "hsl(var(--brand))",
              },
              {
                name: t("charts.seriesResolved"),
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
            <CardTitle className="text-base">
              {t("charts.reportsByCategory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              ariaLabel={t("charts.reportsByCategoryAria")}
              data={catData}
              glyphs={glyphs}
              valueLabel={t("charts.valueReports")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
