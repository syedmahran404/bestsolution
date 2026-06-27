import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { ChartFrame, type ChartDatum } from "./chart-frame";

/**
 * Velora 3.0 — Horizontal bar chart (Phase 2B, CH1). Dependency-free, token
 * colored, accessible. Bars are proportional to the max value; values are
 * shown inline. Ideal for distributions (category, locality, district).
 */
interface BarChartProps {
  title?: string;
  description?: string;
  ariaLabel: string;
  data: ChartDatum[];
  valueLabel?: string;
  /** Optional per-row glyph prefix (e.g. category emoji). */
  glyphs?: Record<string, string>;
  /** Tailwind fill/bg class for the bars. */
  barClassName?: string;
  className?: string;
}

export function BarChart({
  title,
  description,
  ariaLabel,
  data,
  valueLabel = "Reports",
  glyphs,
  barClassName = "bg-gradient-brand",
  className,
}: BarChartProps) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0) || 1;

  return (
    <ChartFrame
      title={title}
      description={description}
      ariaLabel={ariaLabel}
      data={data}
      valueLabel={valueLabel}
      className={className}
    >
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">
                {glyphs?.[d.label] ? `${glyphs[d.label]} ` : ""}
                {d.label}
              </span>
              <span className="font-semibold tabular-nums">{d.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  barClassName,
                )}
                style={{ width: `${Math.round((d.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}

/** Convenience: category distribution from a count map, with glyphs. */
export function categoryBarData(
  counts: { category: keyof typeof CATEGORY_META; reportCount: number }[],
): { data: ChartDatum[]; glyphs: Record<string, string> } {
  const data = counts.map((c) => ({
    label: CATEGORY_META[c.category].label,
    value: c.reportCount,
  }));
  const glyphs: Record<string, string> = {};
  for (const c of counts) {
    glyphs[CATEGORY_META[c.category].label] = CATEGORY_META[c.category].glyph;
  }
  return { data, glyphs };
}
