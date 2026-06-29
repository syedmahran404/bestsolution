"use client";

import { STATUS_GROUP_META } from "@/lib/constants";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const GROUP_DOT: Record<string, string> = {
  open: "bg-status-open",
  progress: "bg-status-progress",
  resolved: "bg-status-resolved",
};

const GROUP_LABEL_KEY: Record<string, "map.open" | "map.inProgress" | "map.resolved"> = {
  open: "map.open",
  progress: "map.inProgress",
  resolved: "map.resolved",
};

/**
 * Compact status legend rendered as an overlay on the map (and inside the
 * no-key placeholder). Mirrors the red / amber / green marker palette via
 * theme-aware status tokens.
 */
export function MapLegend() {
  const t = useT();
  const groups = Object.entries(STATUS_GROUP_META);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/90 px-3 py-2 text-xs shadow-elev-1 backdrop-blur">
      {groups.map(([key]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2.5 w-2.5 rounded-full",
              GROUP_DOT[key] ?? "bg-muted-foreground",
            )}
          />
          <span className="font-medium text-foreground">
            {t(GROUP_LABEL_KEY[key])}
          </span>
        </div>
      ))}
    </div>
  );
}
