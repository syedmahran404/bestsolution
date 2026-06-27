import { FileText, Layers, TrendingUp, type LucideIcon } from "lucide-react";

import { MetricCard } from "@/components/brand";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface AggregationMetricsProps {
  totalReports: number;
  totalCases: number;
  avgReportsPerCase: number;
}

type Accent = "brand" | "info" | "success";

/** Phase 3 aggregation metric cards with animated counters (U5). */
export function AggregationMetrics({
  totalReports,
  totalCases,
  avgReportsPerCase,
}: AggregationMetricsProps) {
  const cards: {
    label: string;
    value: number;
    icon: LucideIcon;
    hint: string;
    accent: Accent;
  }[] = [
    {
      label: "Total Reports",
      value: totalReports,
      icon: FileText,
      hint: "Citizen submissions",
      accent: "brand",
    },
    {
      label: "Civic Cases",
      value: totalCases,
      icon: Layers,
      hint: "Aggregated from reports",
      accent: "info",
    },
    {
      label: "Avg Reports / Case",
      value: avgReportsPerCase,
      icon: TrendingUp,
      hint: "Aggregation density",
      accent: "success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <MetricCard
          key={c.label}
          label={c.label}
          icon={c.icon}
          hint={c.hint}
          accent={c.accent}
          value={
            <AnimatedCounter
              value={c.value}
              decimals={Number.isInteger(c.value) ? 0 : 1}
            />
          }
        />
      ))}
    </div>
  );
}
