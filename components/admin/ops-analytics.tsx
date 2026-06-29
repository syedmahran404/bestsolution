import { MapPin, Building2, TrendingUp, Activity, Layers } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import { formatNumber } from "@/lib/i18n/format";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import type { OperationsMetrics } from "@/lib/insights";

/**
 * Deterministic operational analytics (U3) — most affected localities &
 * districts, recently escalated cases, fastest-growing cluster, and activity.
 * No Gemini.
 */
export function OpsAnalytics({ metrics }: { metrics: OperationsMetrics }) {
  const t = getServerT();
  const locale = getServerLocale();
  return (
    <div className="space-y-6">
      {/* Activity chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Chip
          icon={Activity}
          label={t("opsAnalytics.activeToday")}
          value={metrics.dailyActiveCount}
        />
        <Chip
          icon={Activity}
          label={t("opsAnalytics.newToday")}
          value={metrics.createdToday}
        />
        <Chip
          icon={Activity}
          label={t("opsAnalytics.resolvedToday")}
          value={metrics.resolvedToday}
        />
        <Chip
          icon={TrendingUp}
          label={t("opsAnalytics.overdue")}
          value={metrics.overdueCount}
        />
        <Chip
          icon={Layers}
          label={t("opsAnalytics.avgClusterSize")}
          value={metrics.avgClusterSize}
        />
        <Chip
          icon={TrendingUp}
          label={t("opsAnalytics.escalated")}
          value={metrics.recentlyEscalated.length}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListCard
          title={t("opsAnalytics.mostAffectedLocalities")}
          icon={MapPin}
          items={metrics.localities.map((l) => ({
            label: l.name,
            value: l.reportCount,
          }))}
        />
        <ListCard
          title={t("opsAnalytics.mostAffectedDistricts")}
          icon={Building2}
          items={metrics.districts.map((d) => ({
            label: d.name,
            value: d.reportCount,
          }))}
        />
      </div>

      {metrics.fastestGrowing && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <TrendingUp className="h-4 w-4" />
              {t("opsAnalytics.fastestGrowing")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {CATEGORY_META[metrics.fastestGrowing.category].glyph}{" "}
            {t(`categories.${metrics.fastestGrowing.category}`)} ·{" "}
            {formatNumber(metrics.fastestGrowing.reportCount, locale)}{" "}
            {t("opsAnalytics.reports")}
            {metrics.fastestGrowing.locality
              ? ` · ${metrics.fastestGrowing.locality}`
              : ""}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  const locale = getServerLocale();
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">
        {formatNumber(value, locale)}
      </p>
    </Card>
  );
}

function ListCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof MapPin;
  items: { label: string; value: number }[];
}) {
  const t = getServerT();
  const locale = getServerLocale();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("opsAnalytics.noLocationData")}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{it.label}</span>
                <span className="font-semibold tabular-nums">
                  {formatNumber(it.value, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
