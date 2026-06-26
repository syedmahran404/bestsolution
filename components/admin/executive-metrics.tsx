import { Flame, CheckCircle2, Timer, Activity } from "lucide-react";

import { Card } from "@/components/ui/card";

interface ExecutiveMetricsProps {
  criticalCount: number;
  resolutionRate: number;
  avgResolutionHours: number | null;
  dailyActive: number;
}

/** Executive KPI row (U4) — resolution velocity, critical load, activity. */
export function ExecutiveMetrics({
  criticalCount,
  resolutionRate,
  avgResolutionHours,
  dailyActive,
}: ExecutiveMetricsProps) {
  const cards = [
    {
      label: "Critical / high",
      value: String(criticalCount),
      icon: Flame,
      hint: "Elevated-priority cases",
    },
    {
      label: "Resolution rate",
      value: `${Math.round(resolutionRate * 100)}%`,
      icon: CheckCircle2,
      hint: "Resolved / total",
    },
    {
      label: "Avg resolution",
      value: avgResolutionHours === null ? "—" : `${avgResolutionHours}h`,
      icon: Timer,
      hint: "Create → resolved",
    },
    {
      label: "Active today",
      value: String(dailyActive),
      icon: Activity,
      hint: "Cases updated (24h)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {c.label}
            </p>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">{c.value}</p>
          <p className="text-xs text-muted-foreground">{c.hint}</p>
        </Card>
      ))}
    </div>
  );
}
