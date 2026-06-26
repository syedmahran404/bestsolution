import { Cpu, Sparkles, DatabaseZap, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className="gap-1">
        {mode === "ai" ? (
          <Sparkles className="h-3 w-3" />
        ) : (
          <Cpu className="h-3 w-3" />
        )}
        {mode === "ai" ? "AI assisted" : "Deterministic"}
      </Badge>
      {cached && (
        <Badge variant="secondary" className="gap-1">
          <DatabaseZap className="h-3 w-3" />
          Cached
        </Badge>
      )}
      {typeof confidence === "number" && (
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          {Math.round(confidence * 100)}% confidence
        </Badge>
      )}
      {sources && sources.length > 0 && (
        <span className="text-[11px] text-muted-foreground">
          Sources: {sources.join(", ")}
        </span>
      )}
    </div>
  );
}
