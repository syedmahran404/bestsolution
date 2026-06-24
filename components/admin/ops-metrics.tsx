import {
  FileText,
  FolderOpen,
  CheckCircle2,
  Layers,
  Activity,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { OperationsMetrics } from "@/lib/insights";

/** KPI cards for the Operations Center dashboard (Phase 5). */
export function OpsMetrics({ metrics }: { metrics: OperationsMetrics }) {
  const cards = [
    { label: "Total Reports", value: metrics.totalReports, icon: FileText },
    { label: "Civic Cases", value: metrics.totalCases, icon: Layers },
    { label: "Open Cases", value: metrics.openCases, icon: FolderOpen },
    { label: "Resolved", value: metrics.closedCases, icon: CheckCircle2 },
    {
      label: "Active Clusters",
      value: metrics.activeClusters.length,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {c.label}
            </p>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">{c.value}</p>
        </Card>
      ))}
    </div>
  );
}
