import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PriorityBadge } from "@/components/brand";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CivicCase, PriorityAssessment } from "@/types";

/**
 * Velora 3.0 — Mission Control Priority Board (Phase 2B, MC3).
 *
 * Ranked operations queue: each case shows its deterministic priority score as
 * a filled meter + PriorityBadge, with the top reasons. Reuses the existing
 * computePriority output (passed in) — no logic duplicated.
 */
const SCORE_FILL: Record<PriorityAssessment["label"], string> = {
  low: "bg-success",
  medium: "bg-info",
  high: "bg-warning",
  critical: "bg-critical",
};

export function PriorityBoard({
  ranked,
}: {
  ranked: { c: CivicCase; p: PriorityAssessment }[];
}) {
  return (
    <section
      aria-label="Priority board"
      className="rounded-xl border border-border/70 bg-card shadow-elev-1"
    >
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-h3">Priority board</h2>
        <span className="text-xs text-muted-foreground">
          Deterministic ranking
        </span>
      </header>

      {ranked.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No cases to prioritize yet.
        </p>
      ) : (
        <ol className="divide-y divide-border/60">
          {ranked.map(({ c, p }, i) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="ring-focus group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
              >
                <span className="w-5 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {CATEGORY_META[c.category].glyph}{" "}
                      {CATEGORY_META[c.category].label}
                      {c.locality ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {c.locality}
                        </span>
                      ) : null}
                    </span>
                    <PriorityBadge severity={p.label} className="shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          SCORE_FILL[p.label],
                        )}
                        style={{ width: `${p.score}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {p.score}
                    </span>
                  </div>
                  {p.reasons?.[0] && (
                    <p className="truncate text-xs text-muted-foreground">
                      {p.reasons[0]}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
