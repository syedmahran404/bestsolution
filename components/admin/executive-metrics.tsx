import {
  Flame,
  CheckCircle2,
  Timer,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { MetricCard } from "@/components/brand";
import { formatNumber } from "@/lib/i18n/format";
import { getServerLocale, getServerT } from "@/lib/i18n/server";

interface ExecutiveMetricsProps {
  criticalCount: number;
  resolutionRate: number;
  avgResolutionHours: number | null;
  dailyActive: number;
}

type Accent = "brand" | "success" | "warning" | "critical" | "info";

/** Executive KPI row (U4) — resolution velocity, critical load, activity. */
export function ExecutiveMetrics({
  criticalCount,
  resolutionRate,
  avgResolutionHours,
  dailyActive,
}: ExecutiveMetricsProps) {
  const t = getServerT();
  const locale = getServerLocale();
  const cards: {
    label: string;
    value: string;
    icon: LucideIcon;
    hint: string;
    accent: Accent;
  }[] = [
    {
      label: t("exec.criticalHigh"),
      value: formatNumber(criticalCount, locale),
      icon: Flame,
      hint: t("exec.criticalHint"),
      accent: "critical",
    },
    {
      label: t("exec.resolutionRate"),
      value: `${Math.round(resolutionRate * 100)}%`,
      icon: CheckCircle2,
      hint: t("exec.resolutionRateHint"),
      accent: "success",
    },
    {
      label: t("exec.avgResolution"),
      value:
        avgResolutionHours === null
          ? "—"
          : `${formatNumber(avgResolutionHours, locale)}h`,
      icon: Timer,
      hint: t("exec.avgResolutionHint"),
      accent: "info",
    },
    {
      label: t("exec.activeToday"),
      value: formatNumber(dailyActive, locale),
      icon: Activity,
      hint: t("exec.activeTodayHint"),
      accent: "brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <MetricCard
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          hint={c.hint}
          accent={c.accent}
        />
      ))}
    </div>
  );
}
