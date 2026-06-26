import { Sparkles, Cpu, ListChecks, AlertTriangle, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationsBrief, SeverityLabel } from "@/types";

const PRIORITY_HEX: Record<SeverityLabel, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

/**
 * Explainable AI Operations Brief (U3). Every conclusion is shown — current
 * issue, root cause, impact, why it matters, recommended actions (with
 * reasons), dependencies, and risks — plus provenance + confidence. No black box.
 */
export function OperationsBriefPanel({ brief }: { brief: OperationsBrief }) {
  return (
    <Card className="border-violet-200 bg-violet-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base text-violet-900">
            <Sparkles className="h-4 w-4" />
            AI Operations Brief
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="gap-1">
              <Cpu className="h-3 w-3" />
              {brief.generatedBy === "ai" ? "AI-generated" : "Deterministic"}
            </Badge>
            <Badge variant="secondary">
              {Math.round(brief.confidence * 100)}% confidence
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <Field label="Current issue" value={brief.currentIssue} />
        <Field label="Root cause (AI interpretation)" value={brief.rootCause} />
        <Field label="Community impact" value={brief.communityImpact} />
        <Field label="Why it matters" value={brief.whyItMatters} />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Recommended priority
          </span>
          <Badge
            variant="outline"
            className="capitalize"
            style={{
              borderColor: PRIORITY_HEX[brief.recommendedPriority],
              color: PRIORITY_HEX[brief.recommendedPriority],
            }}
          >
            {brief.recommendedPriority}
          </Badge>
        </div>

        {brief.nextActions.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" />
              Suggested next actions
            </p>
            <ul className="space-y-1.5">
              {brief.nextActions.map((a, i) => (
                <li key={i} className="rounded-md bg-white/70 p-2">
                  <p className="font-medium text-slate-800">{a.action}</p>
                  <p className="text-xs text-slate-600">{a.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {brief.dependencies.length > 0 && (
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              Dependencies
            </p>
            <ul className="list-inside list-disc text-xs text-slate-600">
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
              Potential risks
            </p>
            <ul className="list-inside list-disc text-xs text-slate-600">
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
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
