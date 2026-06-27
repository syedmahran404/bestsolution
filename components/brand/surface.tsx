import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Surface + GlassCard (Phase 2A, BD3/BD8).
 *
 * Surface is the elevation-aware container primitive: pick a level (0–4) and it
 * applies the matching token shadow + radius. GlassCard is the frosted variant
 * used for floating panels and overlays.
 */
const ELEVATION = {
  0: "bg-card",
  1: "bg-card shadow-elev-1",
  2: "bg-card shadow-elev-2",
  3: "bg-card shadow-elev-3",
  4: "bg-card shadow-elev-4",
} as const;

export type ElevationLevel = keyof typeof ELEVATION;

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ElevationLevel;
  bordered?: boolean;
}

export function Surface({
  level = 1,
  bordered = true,
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-xl text-card-foreground",
        ELEVATION[level],
        bordered && "border border-border/70",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass-card rounded-xl text-card-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}
