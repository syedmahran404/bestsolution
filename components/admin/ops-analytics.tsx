import { MapPin, Building2, TrendingUp, Activity, Layers } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import type { OperationsMetrics } from "@/lib/insights";

/**
 * Deterministic operational analytics (U3) — most affected localities &
 * districts, recently escalated cases, fastest-growing cluster, and activity.
 * No Gemini.
 */
export function OpsAnalytics({ metrics }: { metrics: OperationsMetrics }) {
  return (
    <div className="space-y-6">
      {/* Activity chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Chip
          icon={Activity}
          label="Active today"
          value={metrics.dailyActiveCount}
        />
        <Chip icon={Activity} label="New today" value={metrics.createdToday} />
        <Chip
          icon={Activity}
          label="Resolved today"
          value={metrics.resolvedToday}
        />
        <Chip
          icon={TrendingUp}
          label="Overdue (>7d)"
          value={metrics.overdueCount}
        />
        <Chip
          icon={Layers}
          label="Avg cluster size"
          value={metrics.avgClusterSize}
        />
        <Chip
          icon={TrendingUp}
          label="Escalated"
          value={metrics.recentlyEscalated.length}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListCard
          title="Most affected localities"
          icon={MapPin}
          items={metrics.localities.map((l) => ({
            label: l.name,
            value: l.reportCount,
          }))}
        />
        <ListCard
          title="Most affected districts"
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
              Fastest-growing cluster
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {CATEGORY_META[metrics.fastestGrowing.category].glyph}{" "}
            {CATEGORY_META[metrics.fastestGrowing.category].label} ·{" "}
            {metrics.fastestGrowing.reportCount} reports
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
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
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
          <p className="text-sm text-muted-foreground">No location data yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{it.label}</span>
                <span className="font-semibold tabular-nums">{it.value}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
