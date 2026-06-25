import { MapPin, Mic, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import type { CivicReport } from "@/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** A single submitted report in the "My Reports" list. */
export function ReportCard({ report }: { report: CivicReport }) {
  const category = CATEGORY_META[report.category];
  const status = STATUS_META[report.status];

  return (
    <Card className="flex gap-4 p-4">
      {report.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={report.imageUrl}
          alt={report.title}
          loading="lazy"
          decoding="async"
          className="h-20 w-20 shrink-0 rounded-md border object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-muted text-2xl">
          {category.glyph}
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{report.title}</h3>
          <Badge
            variant="outline"
            className="shrink-0"
            style={{ borderColor: status.hex, color: status.hex }}
          >
            {status.label}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {report.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {category.glyph} {category.label}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </span>
          {report.audioUrl && (
            <span className="inline-flex items-center gap-1">
              <Mic className="h-3.5 w-3.5" /> Voice note
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(report.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}
