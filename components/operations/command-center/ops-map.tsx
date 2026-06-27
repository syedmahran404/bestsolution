import { Map as MapIcon } from "lucide-react";

import { CivicMap } from "@/components/map/civic-map";
import type { CivicMapMarker } from "@/types";

/**
 * Velora 3.0 — Mission Control ops map (Phase 2B, MC5). Embeds the interactive
 * civic map as a first-class command-center surface with a framed header.
 */
export function OpsMap({ markers }: { markers: CivicMapMarker[] }) {
  return (
    <section
      aria-label="Operations map"
      className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-elev-1"
    >
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-h3">
          <MapIcon className="h-5 w-5 text-brand" />
          Live map
        </h2>
        <span className="text-xs text-muted-foreground">
          {markers.length} active {markers.length === 1 ? "case" : "cases"}
        </span>
      </header>
      <div className="h-[420px] w-full">
        <CivicMap markers={markers} />
      </div>
    </section>
  );
}
