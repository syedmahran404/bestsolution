import { STATUS_GROUP_META } from "@/lib/constants";

/**
 * Compact status legend rendered as an overlay on the map (and inside the
 * no-key placeholder). Mirrors the red / amber / green marker palette.
 */
export function MapLegend() {
  const groups = Object.values(STATUS_GROUP_META);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
      {groups.map((g) => (
        <div key={g.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: g.hex }}
          />
          <span className="font-medium text-foreground">{g.label}</span>
        </div>
      ))}
    </div>
  );
}
