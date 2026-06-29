import { Gauge, Users, Layers, MapPin } from "lucide-react";

import { PriorityBadge } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import type {
  PriorityAssessment,
  Recommendation,
  SeverityLabel,
} from "@/types";

const PRIORITY_BG: Record<SeverityLabel, string> = {
  low: "bg-success",
  medium: "bg-info",
  high: "bg-warning",
  critical: "bg-critical",
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
  const t = getServerT();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Gauge className="h-4 w-4" />
          {t("priority.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white",
              PRIORITY_BG[priority.label],
            )}
          >
            <span className="text-xl font-bold leading-none">
              {priority.score}
            </span>
            <span className="text-[10px] uppercase">
              {t("priority.outOf100")}
            </span>
          </div>
          <div className="space-y-1.5">
            <PriorityBadge severity={priority.label} />
            <p className="text-xs text-muted-foreground">
              {t("trust.confidence", {
                pct: Math.round(priority.confidence * 100),
              })}{" "}
              · {t("priority.computedDeterministically")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {t("priority.affectedEst", {
                n: priority.affectedPopulation.toLocaleString(),
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>{t("priority.reportCount", { n: priority.reportCount })}</span>
          </div>
        </div>

        {priority.contextFactors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {priority.contextFactors.map((f) => (
              <Badge key={f.type} variant="secondary" className="capitalize">
                {t(`contextType.${f.type}` as MessageKey)} ·{" "}
                {t("context.distanceM", { n: f.distanceM })}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t("priority.whyPriority")}
          </p>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {priority.reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("priority.recommendedAction")}
          </p>
          <p className="font-medium">{recommendation.label}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {recommendation.reasoning.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
