import { Gauge, Users, Layers, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  PriorityAssessment,
  Recommendation,
  SeverityLabel,
} from "@/types";

const PRIORITY_HEX: Record<SeverityLabel, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

/**
 * Explainable prioritization (U3). Shows the deterministic priority score with
 * its confidence, reasons, affected-population estimate, aggregation size, and
 * nearby context — plus the recommended action and its reasoning.
 */
export function PriorityPanel({
  priority,
  recommendation,
}: {
  priority: PriorityAssessment;
  recommendation: Recommendation;
}) {
  const hex = PRIORITY_HEX[priority.label];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Gauge className="h-4 w-4" />
          Priority assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white"
            style={{ backgroundColor: hex }}
          >
            <span className="text-xl font-bold leading-none">
              {priority.score}
            </span>
            <span className="text-[10px] uppercase">/ 100</span>
          </div>
          <div className="space-y-1">
            <Badge
              variant="outline"
              className="capitalize"
              style={{ borderColor: hex, color: hex }}
            >
              {priority.label} priority
            </Badge>
            <p className="text-xs text-muted-foreground">
              {Math.round(priority.confidence * 100)}% confidence · computed
              deterministically
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              ~{priority.affectedPopulation.toLocaleString()} affected (est.)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>{priority.reportCount} report(s)</span>
          </div>
        </div>

        {priority.contextFactors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {priority.contextFactors.map((f) => (
              <Badge key={f.type} variant="secondary" className="capitalize">
                {f.type} · {f.distanceM}m
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Why this priority
          </p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            {priority.reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Recommended action
          </p>
          <p className="font-medium">{recommendation.label}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
            {recommendation.reasoning.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
