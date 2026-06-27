import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Iconography standard (Phase 2A, BD6).
 *
 * One wrapper to enforce consistent icon sizing and stroke weight across the
 * product. Pass any lucide icon as `icon`. Existing direct lucide usages
 * already follow the h-4/h-5 + default-stroke convention; new surfaces should
 * prefer this wrapper so sizing/stroke never drift.
 */
const ICON_SIZE = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type IconSize = keyof typeof ICON_SIZE;

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  /** Stroke weight — 2 is the Velora default; 1.75 for large display icons. */
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function Icon({
  icon: LucideGlyph,
  size = "sm",
  strokeWidth = 2,
  className,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel,
}: IconProps) {
  return (
    <LucideGlyph
      className={cn(ICON_SIZE[size], "shrink-0", className)}
      strokeWidth={strokeWidth}
      aria-hidden={ariaLabel ? undefined : ariaHidden}
      aria-label={ariaLabel}
    />
  );
}
