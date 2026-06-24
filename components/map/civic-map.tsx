"use client";

import { useMemo, useState } from "react";
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";

import { CATEGORY_META, INDIA_MAP_CONFIG, STATUS_META } from "@/lib/constants";
import type { Issue } from "@/types";
import { MapLegend } from "@/components/map/map-legend";

/**
 * Build a colored teardrop pin as an inline SVG data-URI.
 * Avoids depending on the google.maps namespace at render time, so markers
 * render reliably with just an API key (no vector Map ID required).
 */
function pinIcon(hex: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 26 14 26s14-16.5 14-26C28 6.27 21.73 0 14 0z" fill="${hex}"/>
  <circle cx="14" cy="14" r="5.5" fill="#ffffff"/>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

interface CivicMapProps {
  issues: Issue[];
}

export function CivicMap({ issues }: CivicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => issues.find((i) => i.id === selectedId) ?? null,
    [issues, selectedId],
  );

  // Graceful degradation: no key → informative placeholder (build still works).
  if (!apiKey) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/40 p-8 text-center">
        <p className="text-lg font-semibold">Velora Civic Map</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Set{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to load the interactive India map. {issues.length} demo civic issues
          are ready to display.
        </p>
        <MapLegend />
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative h-full w-full overflow-hidden rounded-xl border">
        <Map
          defaultCenter={INDIA_MAP_CONFIG.center}
          defaultZoom={INDIA_MAP_CONFIG.zoom}
          minZoom={INDIA_MAP_CONFIG.minZoom}
          maxZoom={INDIA_MAP_CONFIG.maxZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          className="h-full w-full"
        >
          {issues.map((issue) => (
            <Marker
              key={issue.id}
              position={{ lat: issue.location.lat, lng: issue.location.lng }}
              title={issue.title}
              icon={pinIcon(STATUS_META[issue.status].hex)}
              onClick={() => setSelectedId(issue.id)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{
                lat: selected.location.lat,
                lng: selected.location.lng,
              }}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="max-w-[220px] space-y-1 p-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <span>{CATEGORY_META[selected.category].glyph}</span>
                  <span>{selected.title}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {selected.location.address ?? selected.location.city}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_META[selected.status].hex,
                    }}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {STATUS_META[selected.status].label}
                  </span>
                  <span className="text-xs text-slate-500">
                    · severity {selected.severityScore}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        <div className="absolute bottom-3 left-3">
          <MapLegend />
        </div>
      </div>
    </APIProvider>
  );
}
