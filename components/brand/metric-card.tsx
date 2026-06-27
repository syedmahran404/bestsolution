import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — MetricCard (Phase 2A, BD8).
 *
 * A premium KPI tile: label, large display value, optional icon, optional
 * trend pill, optional hint. Pure presentational; later phases pass real
 * data/charts as children via the `footer` slot.
 */
interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Signed percentage or delta; sign drives the up/down treatment. */
  trend?: number;
  trendLabel?: string;
  hint?: string;
  accent?: "brand" | "success" | "warning" | "critical" | "info" | "neutral";
  footer?: React.ReactNode;
  className?: string;
}

const ACCENT_ICON: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  brand: "text-brand bg-brand/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  critical: "text-critical bg-critical/10",
  info: "text-info bg-info/10",
  neutral: "text-muted-foreground bg-muted",
};

export function MetricCard({
  label,
  value,
  icon: IconGlyph,
  trend,
  trendLabel,
  hint,
  accent = "brand",
  footer,
  className,
}: MetricCardProps) {
  const trendUp = typeof trend === "number" && trend >= 0;
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-elev-1",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {IconGlyph && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              ACCENT_ICON[accent],
            )}
            aria-hidden
          >
            <IconGlyph className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-metric">{value}</span>
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trendUp ? "text-success" : "text-critical",
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}
            {trendLabel ? ` ${trendLabel}` : "%"}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
