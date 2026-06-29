"use client";

import { Cpu, Sparkles, DatabaseZap, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/provider";

interface TrustBadgesProps {
  /** "deterministic" = computed in code; "ai" = Gemini-assisted. */
  mode: "deterministic" | "ai";
  cached?: boolean;
  confidence?: number;
  sources?: string[];
}

/**
 * Trust indicators (U4) — every intelligence surface declares how it was
 * produced, whether it's cached, its confidence, and its data sources.
 * No black box.
 */
export function TrustBadges({
  mode,
  cached,
  confidence,
  sources,
}: TrustBadgesProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className="gap-1">
        {mode === "ai" ? (
          <Sparkles className="h-3 w-3" />
        ) : (
          <Cpu className="h-3 w-3" />
        )}
        {mode === "ai" ? t("trust.aiAssisted") : t("trust.deterministic")}
      </Badge>
      {cached && (
        <Badge variant="secondary" className="gap-1">
          <DatabaseZap className="h-3 w-3" />
          {t("trust.cached")}
        </Badge>
      )}
      {typeof confidence === "number" && (
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          {t("trust.confidence", { pct: Math.round(confidence * 100) })}
        </Badge>
      )}
      {sources && sources.length > 0 && (
        <span className="text-[11px] text-muted-foreground">
          {t("trust.sources", { sources: sources.join(", ") })}
        </span>
      )}
    </div>
  );
}
