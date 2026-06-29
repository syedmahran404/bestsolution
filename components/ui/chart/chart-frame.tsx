import * as React from "react";

import { cn } from "@/lib/utils";
import { getServerT } from "@/lib/i18n/server";

/**
 * Velora 3.0 — Chart frame (Phase 2B, CH1/XC5).
 *
 * Shared wrapper for every chart primitive. Provides the title/description,
 * an optional legend slot, and — critically for accessibility (XC5) — a
 * visually-hidden data table so screen readers and "view as text" users get
 * the exact values, not just an inaccessible SVG.
 */
export interface ChartDatum {
  label: string;
  value: number;
}

interface ChartFrameProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Accessible summary describing what the chart shows. */
  ariaLabel: string;
  /** Data rendered as the hidden accessible table (XC5). */
  data?: ChartDatum[];
  valueLabel?: string;
  legend?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ChartFrame({
  title,
  description,
  ariaLabel,
  data,
  valueLabel = "Value",
  legend,
  className,
  children,
}: ChartFrameProps) {
  const t = getServerT();
  return (
    <figure className={cn("space-y-3", className)}>
      {(title || description) && (
        <figcaption className="space-y-0.5">
          {title && <p className="text-label">{title}</p>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </figcaption>
      )}

      <div role="img" aria-label={ariaLabel}>
        {children}
      </div>

      {legend}

      {/* Accessible data table (visually hidden) — XC5 text alternative. */}
      {data && data.length > 0 && (
        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th scope="col">{t("chart.category")}</th>
              <th scope="col">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}

/** Cycling token fill classes for multi-series charts (theme-aware). */
export const SERIES_FILL = [
  "fill-brand",
  "fill-[hsl(var(--brand-2))]",
  "fill-[hsl(var(--brand-3))]",
  "fill-info",
  "fill-success",
  "fill-warning",
  "fill-critical",
  "fill-neutral",
] as const;

export const SERIES_HSL = [
  "hsl(var(--brand))",
  "hsl(var(--brand-2))",
  "hsl(var(--brand-3))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--critical))",
  "hsl(var(--neutral))",
] as const;
