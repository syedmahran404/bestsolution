import { TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";

import type { TrendDirection } from "@/types";

const TREND_META: Record<
  TrendDirection,
  { label: string; hex: string; icon: typeof TrendingUp }
> = {
  rising: { label: "Rising", hex: "#f97316", icon: TrendingUp },
  improving: { label: "Improving", hex: "#22c55e", icon: TrendingDown },
  stable: { label: "Stable", hex: "#6b7280", icon: Minus },
  critical: { label: "Critical", hex: "#ef4444", icon: Flame },
};

/** Color-coded civic trend indicator (U4). */
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className ?? ""}`}
      style={{ backgroundColor: `${m.hex}1a`, color: m.hex }}
    >
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}
