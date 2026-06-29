import { HeartPulse } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendBadge } from "@/components/health/trend-badge";
import { TrustBadges } from "@/components/trust/trust-badges";
import { getServerT } from "@/lib/i18n/server";
import type { CivicHealthOverview } from "@/lib/civic-health";
import type { HealthScore } from "@/types";

function scoreHex(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

/** Circular score gauge using a conic-gradient ring (no chart dependency). */
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const t = getServerT();
  const hex = scoreHex(score);
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${hex} ${score * 3.6}deg, hsl(var(--muted)) 0deg)`,
      }}
    >
      <div className="flex h-[78%] w-[78%] flex-col items-center justify-center rounded-full bg-background">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: hex }}
        >
          {score}
        </span>
        <span className="text-[10px] uppercase text-muted-foreground">
          {t("health.outOf100")}
        </span>
      </div>
    </div>
  );
}

function MiniScore({ item }: { item: HealthScore }) {
  const hex = scoreHex(item.score);
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <span className="text-sm font-bold tabular-nums" style={{ color: hex }}>
          {item.score}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${item.score}%`, backgroundColor: hex }}
        />
      </div>
      <div className="mt-1.5">
        <TrendBadge trend={item.trend} />
      </div>
    </div>
  );
}

/**
 * Civic Health Index (U4 signature). A living, deterministic 0-100 score for
 * the city, with per-category and per-ward breakdowns, trends, and an
 * explainable factor list.
 */
export function HealthIndex({ overview }: { overview: CivicHealthOverview }) {
  const t = getServerT();
  const { city, categories, wards } = overview;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <HeartPulse className="h-4 w-4" />
            {t("health.title")}
          </CardTitle>
          <TrustBadges
            mode="deterministic"
            confidence={city.confidence}
            sources={["cases", "severity", "resolutions"]}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* City headline */}
        <div className="flex items-center gap-4">
          <ScoreRing score={city.score} />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{t("health.cityHealth")}</p>
              <TrendBadge trend={city.trend} />
            </div>
            <p className="text-sm text-muted-foreground">{city.trendReason}</p>
            <ul className="pt-1 text-xs text-muted-foreground">
              {city.factors.map((f) => (
                <li key={f.label}>
                  {f.label}: {f.contribution >= 0 ? "+" : ""}
                  {f.contribution}
                  {f.note ? ` (${f.note})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("health.byCategory")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c) => (
                <MiniScore key={`cat-${c.name}`} item={c} />
              ))}
            </div>
          </div>
        )}

        {wards.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("health.byWard")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {wards.map((w) => (
                <MiniScore key={`ward-${w.name}`} item={w} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
