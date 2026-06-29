import { Sparkles, Cpu, ListChecks, AlertTriangle, Link2 } from "lucide-react";

import { PriorityBadge } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/lib/i18n/server";
import type { OperationsBrief } from "@/types";

/**
 * Explainable AI Operations Brief (U3). Every conclusion is shown — current
 * issue, root cause, impact, why it matters, recommended actions (with
 * reasons), dependencies, and risks — plus provenance + confidence. No black box.
 */
export function OperationsBriefPanel({ brief }: { brief: OperationsBrief }) {
  const t = getServerT();
  return (
    <Card className="border-brand/20 bg-brand/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base text-brand">
            <Sparkles className="h-4 w-4" />
            {t("opsBrief.title")}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="gap-1">
              <Cpu className="h-3 w-3" />
              {brief.generatedBy === "ai"
                ? t("opsBrief.aiGenerated")
                : t("opsBrief.deterministic")}
            </Badge>
            <Badge variant="secondary">
              {t("trust.confidence", {
                pct: Math.round(brief.confidence * 100),
              })}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <Field label={t("opsBrief.currentIssue")} value={brief.currentIssue} />
        <Field label={t("opsBrief.rootCause")} value={brief.rootCause} />
        <Field
          label={t("opsBrief.communityImpact")}
          value={brief.communityImpact}
        />
        <Field label={t("opsBrief.whyItMatters")} value={brief.whyItMatters} />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("opsBrief.recommendedPriority")}
          </span>
          <PriorityBadge severity={brief.recommendedPriority} />
        </div>

        {brief.nextActions.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" />
              {t("opsBrief.nextActions")}
            </p>
            <ul className="space-y-1.5">
              {brief.nextActions.map((a, i) => (
                <li
                  key={i}
                  className="rounded-md bg-card/70 p-2 ring-1 ring-border/60"
                >
                  <p className="font-medium text-foreground">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {brief.dependencies.length > 0 && (
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              {t("opsBrief.dependencies")}
            </p>
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {brief.dependencies.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        {brief.risks.length > 0 && (
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t("opsBrief.risks")}
            </p>
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {brief.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}
