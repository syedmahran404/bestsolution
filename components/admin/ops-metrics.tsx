import {
  FileText,
  FolderOpen,
  CheckCircle2,
  Layers,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { MetricCard } from "@/components/brand";
import { formatNumber } from "@/lib/i18n/format";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import type { OperationsMetrics } from "@/lib/insights";

type Accent = "brand" | "info" | "warning" | "success" | "neutral";

/** KPI cards for the Operations Center dashboard (Phase 5). */
export function OpsMetrics({ metrics }: { metrics: OperationsMetrics }) {
  const t = getServerT();
  const locale = getServerLocale();
  const cards: {
    label: string;
    value: string;
    icon: LucideIcon;
    accent: Accent;
  }[] = [
    {
      label: t("opsMetrics.totalReports"),
      value: formatNumber(metrics.totalReports, locale),
      icon: FileText,
      accent: "brand",
    },
    {
      label: t("opsMetrics.civicCases"),
      value: formatNumber(metrics.totalCases, locale),
      icon: Layers,
      accent: "info",
    },
    {
      label: t("opsMetrics.openCases"),
      value: formatNumber(metrics.openCases, locale),
      icon: FolderOpen,
      accent: "warning",
    },
    {
      label: t("opsMetrics.resolved"),
      value: formatNumber(metrics.closedCases, locale),
      icon: CheckCircle2,
      accent: "success",
    },
    {
      label: t("opsMetrics.activeClusters"),
      value: formatNumber(metrics.activeClusters.length, locale),
      icon: Activity,
      accent: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c) => (
        <MetricCard
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          accent={c.accent}
        />
      ))}
    </div>
  );
}
