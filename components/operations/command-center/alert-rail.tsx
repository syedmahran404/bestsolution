import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  Clock,
  TrendingUp,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OperationsMetrics } from "@/lib/insights";
import type { CivicCase } from "@/types";

/**
 * Velora 3.0 — Mission Control Alert Rail (Phase 2B, MC2).
 *
 * The "what needs attention now" column: live counts of overdue / critical /
 * new / escalated load, then the actionable top-priority cases. Presentational
 * — all numbers come from the deterministic operations metrics (reused).
 */
interface AlertStat {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: "critical" | "warning" | "info" | "brand";
}

const TONE_DOT: Record<AlertStat["tone"], string> = {
  critical: "bg-critical text-critical",
  warning: "bg-warning text-warning",
  info: "bg-info text-info",
  brand: "bg-brand text-brand",
};

export function AlertRail({
  metrics,
  criticalCases,
}: {
  metrics: OperationsMetrics;
  criticalCases: CivicCase[];
}) {
  const stats: AlertStat[] = [
    {
      icon: Clock,
      label: "Overdue (>7d)",
      value: metrics.overdueCount,
      tone: "critical",
    },
    {
      icon: Flame,
      label: "Escalated",
      value: metrics.recentlyEscalated.length,
      tone: "warning",
    },
    {
      icon: TrendingUp,
      label: "New today",
      value: metrics.createdToday,
      tone: "info",
    },
    {
      icon: AlertTriangle,
      label: "Active clusters",
      value: metrics.activeClusters.length,
      tone: "brand",
    },
  ];

  return (
    <section
      aria-label="Alerts"
      className="rounded-xl border border-border/70 bg-card shadow-elev-1"
    >
      <header className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-critical opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-critical" />
        </span>
        <h2 className="text-h3">Alerts</h2>
      </header>

      <div className="grid grid-cols-2 gap-px bg-border/60">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-3">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md bg-current/10",
                  TONE_DOT[s.tone].split(" ")[1],
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-metric !text-2xl">{s.value}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 p-2">
        <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
          Needs attention
        </p>
        {criticalCases.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            Nothing critical right now.
          </p>
        ) : (
          criticalCases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="ring-focus group flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  c.severityLabel === "critical" ? "bg-critical" : "bg-warning",
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {CATEGORY_META[c.category].glyph}{" "}
                {CATEGORY_META[c.category].label}
                {c.locality ? ` · ${c.locality}` : ""}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {c.reportCount}×
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
