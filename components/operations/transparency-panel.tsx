import { Scale } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadges } from "@/components/trust/trust-badges";
import type { HealthFactor, PriorityAssessment, Recommendation } from "@/types";

/**
 * Transparency panel (U4) — judge-facing. Shows the exact inputs, their
 * weights, and contributions behind a recommendation, plus the decision and
 * its reason. Nothing hidden.
 */
export function TransparencyPanel({
  priority,
  recommendation,
}: {
  priority: PriorityAssessment;
  recommendation: Recommendation;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Scale className="h-4 w-4" />
            Decision transparency
          </CardTitle>
          <TrustBadges
            mode="deterministic"
            confidence={priority.confidence}
            sources={["reports", "context (Maps)", "severity model"]}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Input</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Weight</th>
                <th className="px-3 py-2 text-right font-medium">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody>
              {priority.inputs.map((f: HealthFactor) => (
                <tr key={f.label} className="border-t">
                  <td className="px-3 py-2">{f.label}</td>
                  <td className="px-3 py-2 tabular-nums">{f.value}</td>
                  <td className="px-3 py-2 tabular-nums">{f.weight}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {f.contribution >= 0 ? "+" : ""}
                    {f.contribution}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/30 font-semibold">
                <td className="px-3 py-2" colSpan={3}>
                  Priority score
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {priority.score}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Decision</p>
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
