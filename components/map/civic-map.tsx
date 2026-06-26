"use client";

import { useMemo, useState } from "react";
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";

import { CATEGORY_META, INDIA_MAP_CONFIG, STATUS_META } from "@/lib/constants";
import type { CivicMapMarker } from "@/types";
import { MapLegend } from "@/components/map/map-legend";

/** Colored teardrop pin (single report) as an inline SVG data-URI. */
function pinIcon(hex: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 26 14 26s14-16.5 14-26C28 6.27 21.73 0 14 0z" fill="${hex}"/>
  <circle cx="14" cy="14" r="5.5" fill="#ffffff"/>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Aggregated civic-case bubble with the report count drawn inside the SVG. */
function bubbleIcon(hex: string, count: number): string {
  const label = count > 99 ? "99+" : String(count);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="20" fill="${hex}" stroke="#ffffff" stroke-width="3"/>
  <text x="22" y="27" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="16" font-weight="700" fill="#ffffff">${label}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

interface CivicMapProps {
  markers: CivicMapMarker[];
}

export function CivicMap({ markers }: CivicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => markers.find((m) => m.id === selectedId) ?? null,
    [markers, selectedId],
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
          to load the interactive India map. {markers.length} civic
          case(s)/report(s) ready to display.
        </p>
        <MapLegend />
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border"
        role="region"
        aria-label="Interactive civic issues map of India"
      >
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
          {markers.map((marker) => {
            const hex = STATUS_META[marker.status].hex;
            const aggregated = marker.reportCount > 1;
            return (
              <Marker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.title}
                icon={
                  aggregated
                    ? bubbleIcon(hex, marker.reportCount)
                    : pinIcon(hex)
                }
                onClick={() => setSelectedId(marker.id)}
              />
            );
          })}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="max-w-[240px] space-y-1 p-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <span>{CATEGORY_META[selected.category].glyph}</span>
                  <span>{selected.title}</span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
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
                    · {CATEGORY_META[selected.category].label}
                  </span>
                </div>

                {selected.reportCount > 1 ? (
                  <p className="text-xs font-medium text-slate-700">
                    Aggregated civic case · {selected.reportCount} reports
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Single report</p>
                )}

                {selected.severityLabel && (
                  <p className="text-xs text-slate-600">
                    Severity:{" "}
                    <span className="font-medium capitalize">
                      {selected.severityLabel}
                    </span>
                  </p>
                )}
                {selected.locality && (
                  <p className="text-xs text-slate-500">
                    📍 {selected.locality}
                  </p>
                )}

                {selected.href && (
                  <a
                    href={selected.href}
                    className="inline-block pt-1 text-xs font-semibold text-blue-600 underline-offset-2 hover:underline"
                  >
                    View civic case →
                  </a>
                )}
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
