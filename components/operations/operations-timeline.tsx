import { User, Cpu, Sparkles, ShieldCheck } from "lucide-react";

import type { TimelineEvent } from "@/types";

const SOURCE_META: Record<
  TimelineEvent["source"],
  { hex: string; icon: typeof User }
> = {
  citizen: { hex: "#3b82f6", icon: User },
  system: { hex: "#6b7280", icon: Cpu },
  ai: { hex: "#8b5cf6", icon: Sparkles },
  admin: { hex: "#22c55e", icon: ShieldCheck },
};

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

/** Chronological operations timeline (U3). Deterministic — built from case data. */
export function OperationsTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline events yet.</p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((e, i) => {
        const meta = SOURCE_META[e.source];
        const Icon = meta.icon;
        return (
          <li key={`${e.type}-${e.at}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: meta.hex }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {i < events.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium">{e.label}</p>
              <p className="text-xs text-muted-foreground">{fmt(e.at)}</p>
              {e.detail && (
                <p className="text-xs text-muted-foreground">{e.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
