import {
  Flame,
  CheckCircle2,
  Timer,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { MetricCard } from "@/components/brand";

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
  const cards: {
    label: string;
    value: string;
    icon: LucideIcon;
    hint: string;
    accent: Accent;
  }[] = [
    {
      label: "Critical / high",
      value: String(criticalCount),
      icon: Flame,
      hint: "Elevated-priority cases",
      accent: "critical",
    },
    {
      label: "Resolution rate",
      value: `${Math.round(resolutionRate * 100)}%`,
      icon: CheckCircle2,
      hint: "Resolved / total",
      accent: "success",
    },
    {
      label: "Avg resolution",
      value: avgResolutionHours === null ? "—" : `${avgResolutionHours}h`,
      icon: Timer,
      hint: "Create → resolved",
      accent: "info",
    },
    {
      label: "Active today",
      value: String(dailyActive),
      icon: Activity,
      hint: "Cases updated (24h)",
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
