import Link from "next/link";
import { MapPin, Layers, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import type { CivicCase } from "@/types";

/** Compact civic case row linking to the case detail page. */
export function CivicCaseCard({ civicCase }: { civicCase: CivicCase }) {
  const category = CATEGORY_META[civicCase.category];
  const status = STATUS_META[civicCase.status];
  const aggregated = civicCase.reportCount > 1;

  return (
    <Link href={`/cases/${civicCase.id}`}>
      <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/50">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: status.hex }}
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
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {civicCase.reportCount} report
              {civicCase.reportCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {civicCase.centerLocation.lat.toFixed(4)},{" "}
              {civicCase.centerLocation.lng.toFixed(4)}
            </span>
            <Badge
              variant="outline"
              style={{ borderColor: status.hex, color: status.hex }}
            >
              {status.label}
            </Badge>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  );
}
