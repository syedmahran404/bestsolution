import { FileText, Layers, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";

interface AggregationMetricsProps {
  totalReports: number;
  totalCases: number;
  avgReportsPerCase: number;
}

/** Phase 3 aggregation metric cards (simple, read-only). */
export function AggregationMetrics({
  totalReports,
  totalCases,
  avgReportsPerCase,
}: AggregationMetricsProps) {
  const cards = [
    {
      label: "Total Reports",
      value: totalReports,
      icon: FileText,
      hint: "Citizen submissions",
    },
    {
      label: "Civic Cases",
      value: totalCases,
      icon: Layers,
      hint: "Aggregated from reports",
    },
    {
      label: "Avg Reports / Case",
      value: avgReportsPerCase,
      icon: TrendingUp,
      hint: "Aggregation density",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
