import Link from "next/link";
import { MapPin, Layers, ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CivicCase } from "@/types";

const STATUS_CIRCLE: Record<"open" | "progress" | "resolved", string> = {
  open: "bg-status-open",
  progress: "bg-status-progress",
  resolved: "bg-status-resolved",
};

/** Compact civic case row linking to the case detail page. */
export function CivicCaseCard({ civicCase }: { civicCase: CivicCase }) {
  const category = CATEGORY_META[civicCase.category];
  const status = STATUS_META[civicCase.status];
  const aggregated = civicCase.reportCount > 1;

  return (
    <Link href={`/cases/${civicCase.id}`} className="group block">
      <Card className="flex items-center gap-4 p-4 transition-colors duration-150 hover:border-brand/40 hover:bg-accent/50">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
            STATUS_CIRCLE[status.group],
          )}
        >
          {civicCase.reportCount > 99 ? "99+" : civicCase.reportCount}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {category.glyph} {category.label}
            </span>
            {aggregated && (
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3 w-3" />
                Aggregated case
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {civicCase.reportCount} report
              {civicCase.reportCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {civicCase.centerLocation.lat.toFixed(4)},{" "}
              {civicCase.centerLocation.lng.toFixed(4)}
            </span>
            <StatusBadge status={civicCase.status} />
          </div>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Card>
    </Link>
  );
}
