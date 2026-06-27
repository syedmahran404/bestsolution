import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/types";

const TREND_META: Record<
  TrendDirection,
  { label: string; cls: string; icon: LucideIcon }
> = {
  rising: {
    label: "Rising",
    cls: "bg-warning/15 text-warning",
    icon: TrendingUp,
  },
  improving: {
    label: "Improving",
    cls: "bg-success/15 text-success",
    icon: TrendingDown,
  },
  stable: {
    label: "Stable",
    cls: "bg-muted text-muted-foreground",
    icon: Minus,
  },
  critical: {
    label: "Critical",
    cls: "bg-critical/15 text-critical",
    icon: Flame,
  },
};

/** Color-coded civic trend indicator (U4), theme-aware via semantic tokens. */
export function TrendBadge({
  trend,
  className,
}: {
  trend: TrendDirection;
  className?: string;
}) {
  const m = TREND_META[trend];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        m.cls,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}
