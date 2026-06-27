"use client";

import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { IssueCategory } from "@/types";

/**
 * Velora 3.0 — On-map filter chips (Phase 2B, MP5). Controlled, dependency-free
 * status + category toggles that filter the markers client-side. Overlaid on
 * the map; collapses to a scrollable row on mobile.
 */
export type StatusGroup = "open" | "progress" | "resolved";

const STATUS_CHIPS: { group: StatusGroup; label: string; dot: string }[] = [
  { group: "open", label: "Open", dot: "bg-status-open" },
  { group: "progress", label: "In progress", dot: "bg-status-progress" },
  { group: "resolved", label: "Resolved", dot: "bg-status-resolved" },
];

const CATEGORIES = Object.keys(CATEGORY_META) as IssueCategory[];

interface MapFiltersProps {
  activeStatuses: Set<StatusGroup>;
  activeCategories: Set<IssueCategory>;
  onToggleStatus: (g: StatusGroup) => void;
  onToggleCategory: (c: IssueCategory) => void;
}

export function MapFilters({
  activeStatuses,
  activeCategories,
  onToggleStatus,
  onToggleCategory,
}: MapFiltersProps) {
  return (
    <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl border border-border/70 bg-background/85 p-2 shadow-elev-2 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_CHIPS.map((s) => {
          const active = activeStatuses.has(s.group);
          return (
            <button
              key={s.group}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleStatus(s.group)}
              className={cn(
                "ring-focus inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-foreground/20 bg-secondary text-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-accent",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((c) => {
          const active = activeCategories.has(c);
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleCategory(c)}
              title={CATEGORY_META[c].label}
              className={cn(
                "ring-focus inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors",
                active
                  ? "border-brand/40 bg-brand/10 text-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-accent",
              )}
            >
              <span aria-hidden>{CATEGORY_META[c].glyph}</span>
              <span className="hidden sm:inline">{CATEGORY_META[c].label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
