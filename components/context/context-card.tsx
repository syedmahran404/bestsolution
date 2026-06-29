import { MapPin, Landmark, ShieldAlert, Info } from "lucide-react";

import { PriorityBadge } from "@/components/brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import type { ContextFactor, SeverityLabel } from "@/types";

interface ContextCardProps {
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  formattedAddress?: string | null;
  factors?: ContextFactor[];
  severityScore?: number;
  severityLabel?: SeverityLabel;
  severityReasons?: string[];
  source?: string | null;
}

/**
 * Explainable civic context (U2). Shows where the issue is, which nearby
 * places increase its impact, and exactly why the severity is what it is.
 */
export function ContextCard({
  locality,
  district,
  state,
  formattedAddress,
  factors = [],
  severityScore,
  severityLabel,
  severityReasons = [],
  source,
}: ContextCardProps) {
  const t = getServerT();
  const hasAnything =
    locality || district || state || factors.length > 0 || severityLabel;
  if (!hasAnything) return null;

  const areaLine =
    [locality, district, state].filter(Boolean).join(", ") || formattedAddress;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <MapPin className="h-4 w-4" />
            {t("context.title")}
          </CardTitle>
          {severityLabel && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {t("context.severity")}
              <PriorityBadge severity={severityLabel} />
              {typeof severityScore === "number" ? `(${severityScore})` : ""}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {areaLine && (
          <div>
            <p className="text-xs text-muted-foreground">{t("context.area")}</p>
            <p className="font-medium">{areaLine}</p>
          </div>
        )}

        {factors.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" />
              {t("context.nearbyPlaces")}
            </p>
            <ul className="space-y-1">
              {factors.map((f) => (
                <li
                  key={`${f.type}-${f.name}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="capitalize">
                    {t(`contextType.${f.type}` as MessageKey)} ·{" "}
                    <span className="text-muted-foreground">{f.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("context.distanceM", { n: f.distanceM })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {severityReasons.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              {t("context.whySeverity")}
            </p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {severityReasons.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {source && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            {t("context.source", { source })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
