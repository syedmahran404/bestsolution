import {
  FileText,
  FolderOpen,
  CheckCircle2,
  Layers,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { MetricCard } from "@/components/brand";
import type { OperationsMetrics } from "@/lib/insights";

type Accent = "brand" | "info" | "warning" | "success" | "neutral";

/** KPI cards for the Operations Center dashboard (Phase 5). */
export function OpsMetrics({ metrics }: { metrics: OperationsMetrics }) {
  const cards: {
    label: string;
    value: number;
    icon: LucideIcon;
    accent: Accent;
  }[] = [
    {
      label: "Total Reports",
      value: metrics.totalReports,
      icon: FileText,
      accent: "brand",
    },
    {
      label: "Civic Cases",
      value: metrics.totalCases,
      icon: Layers,
      accent: "info",
    },
    {
      label: "Open Cases",
      value: metrics.openCases,
      icon: FolderOpen,
      accent: "warning",
    },
    {
      label: "Resolved",
      value: metrics.closedCases,
      icon: CheckCircle2,
      accent: "success",
    },
    {
      label: "Active Clusters",
      value: metrics.activeClusters.length,
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
