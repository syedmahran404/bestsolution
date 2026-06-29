import { Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadges } from "@/components/trust/trust-badges";
import { getServerT } from "@/lib/i18n/server";

interface CaseSummaryCardProps {
  summary: string;
  impact: string;
}

/** AI-generated civic case summary + community impact (Phase 4, Feature 5). */
export function CaseSummaryCard({ summary, impact }: CaseSummaryCardProps) {
  const t = getServerT();
  return (
    <Card className="border-brand/20 bg-brand/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base text-brand">
            <Sparkles className="h-4 w-4" />
            {t("aiSummary.title")}
          </CardTitle>
          <TrustBadges mode="ai" cached sources={["case", "context"]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-foreground">{summary}</p>
        <p className="flex items-start gap-1.5 text-muted-foreground">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              {t("aiSummary.communityImpact")}
            </span>{" "}
            {impact}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
