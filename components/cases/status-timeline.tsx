import { STATUS_META } from "@/lib/constants";
import type { IssueStatus, StatusHistoryEntry } from "@/types";

interface StatusTimelineProps {
  history?: StatusHistoryEntry[];
  /** Fallback when a case predates status history. */
  fallbackStatus: IssueStatus;
  createdAt: string;
}

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Vertical status timeline for the operational case view (Phase 5). */
export function StatusTimeline({
  history,
  fallbackStatus,
  createdAt,
}: StatusTimelineProps) {
  const entries =
    history && history.length > 0
      ? history
      : [{ status: fallbackStatus, at: createdAt }];

  return (
    <ol className="space-y-3">
      {entries.map((e, i) => {
        const meta = STATUS_META[e.status];
        return (
          <li key={`${e.status}-${e.at}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="mt-1 h-3 w-3 rounded-full"
                style={{ backgroundColor: meta.hex }}
              />
              {i < entries.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="text-xs text-muted-foreground">{fmt(e.at)}</p>
              {e.note && <p className="text-xs text-slate-600">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
