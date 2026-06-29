import { TrendingUp, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TrustBadges } from "@/components/trust/trust-badges";
import { getServerT } from "@/lib/i18n/server";
import type { CivicInsight } from "@/types";

const KIND_ICON = {
  trend: TrendingUp,
  hotspot: MapPin,
  priority: ShieldAlert,
  resolution: CheckCircle2,
} as const;

/** Explainable civic insight card (U4) — shows why + how + confidence. */
export function InsightCard({ insight }: { insight: CivicInsight }) {
  const t = getServerT();
  const Icon = KIND_ICON[insight.kind];
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Icon className="h-4 w-4" />
          </span>
          <p className="font-semibold leading-snug">{insight.title}</p>
        </div>
        <p className="text-sm text-muted-foreground">{insight.why}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {t("insight.how")}
          </span>{" "}
          {insight.how}
        </p>
        <TrustBadges mode="deterministic" confidence={insight.confidence} />
      </CardContent>
    </Card>
  );
}
