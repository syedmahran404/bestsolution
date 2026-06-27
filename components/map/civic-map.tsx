"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

import {
  CATEGORY_META,
  INDIA_MAP_CONFIG,
  STATUS_GROUP_META,
  STATUS_META,
} from "@/lib/constants";
import { clusterMarkers } from "@/lib/map-cluster";
import { cn } from "@/lib/utils";
import type { CivicMapMarker, IssueCategory } from "@/types";
import { MapLegend } from "@/components/map/map-legend";
import { MapFilters, type StatusGroup } from "@/components/map/map-filters";

/** Literal status-group → token classes (kept literal for Tailwind's purge). */
const GROUP_DOT: Record<StatusGroup, string> = {
  open: "bg-status-open",
  progress: "bg-status-progress",
  resolved: "bg-status-resolved",
};

/** Colored teardrop pin (single report) as an inline SVG data-URI. */
function pinIcon(hex: string, scale = 1): string {
  const w = Math.round(28 * scale);
  const h = Math.round(40 * scale);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 40">
  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 26 14 26s14-16.5 14-26C28 6.27 21.73 0 14 0z" fill="${hex}"/>
  <circle cx="14" cy="14" r="5.5" fill="#ffffff"/>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Aggregated civic-case bubble with the report count drawn inside the SVG. */
function bubbleIcon(hex: string, count: number, scale = 1): string {
  const label = count > 99 ? "99+" : String(count);
  const s = Math.round(44 * scale);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="20" fill="${hex}" stroke="#ffffff" stroke-width="3"/>
  <text x="22" y="27" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="16" font-weight="700" fill="#ffffff">${label}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Concentric cluster bubble — size scales with density (MP3). */
function clusterIcon(hex: string, count: number): string {
  const label = count > 99 ? "99+" : String(count);
  const s = Math.min(72, 44 + Math.round(Math.log2(count + 1) * 8));
  const r = s / 2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${hex}" opacity="0.25"/>
  <circle cx="${r}" cy="${r}" r="${r - 7}" fill="${hex}" stroke="#ffffff" stroke-width="3"/>
  <text x="${r}" y="${r + 5}" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="15" font-weight="700" fill="#ffffff">${label}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

interface CivicMapProps {
  markers: CivicMapMarker[];
}

export function CivicMap({ markers }: CivicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
      <MapSurface markers={markers} />
    </APIProvider>
  );
}

/** Inner surface — needs to be inside APIProvider to use the map instance. */
function MapSurface({ markers }: CivicMapProps) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(INDIA_MAP_CONFIG.zoom);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Set<StatusGroup>>(
    () => new Set(["open", "progress", "resolved"]),
  );
  const [categories, setCategories] = useState<Set<IssueCategory>>(
    () => new Set(Object.keys(CATEGORY_META) as IssueCategory[]),
  );

  const filtered = useMemo(
    () =>
      markers.filter(
        (m) =>
          statuses.has(STATUS_META[m.status].group) &&
          categories.has(m.category),
      ),
    [markers, statuses, categories],
  );

  const { clusters, singles } = useMemo(
    () => clusterMarkers(filtered, zoom),
    [filtered, zoom],
  );

  const selected = useMemo(
    () => markers.find((m) => m.id === selectedId) ?? null,
    [markers, selectedId],
  );

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
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
        onCameraChanged={(e) => setZoom(e.detail.zoom)}
        className="h-full w-full"
      >
        {/* Cluster bubbles */}
        {clusters.map((c) => (
          <Marker
            key={c.id}
            position={{ lat: c.lat, lng: c.lng }}
            title={`${c.count} cases`}
            icon={clusterIcon(
              STATUS_GROUP_META[c.dominantGroup].hex,
              c.reportCount,
            )}
            onClick={() => {
              setSelectedId(null);
              map?.panTo({ lat: c.lat, lng: c.lng });
              map?.setZoom(Math.min(INDIA_MAP_CONFIG.maxZoom, zoom + 2));
            }}
          />
        ))}

        {/* Individual markers */}
        {singles.map((marker) => {
          const hex = STATUS_META[marker.status].hex;
          const aggregated = marker.reportCount > 1;
          const isSelected = marker.id === selectedId;
          const scale = isSelected ? 1.4 : 1;
          return (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              zIndex={isSelected ? 999 : undefined}
              icon={
                aggregated
                  ? bubbleIcon(hex, marker.reportCount, scale)
                  : pinIcon(hex, scale)
              }
              onClick={() => setSelectedId(marker.id)}
            />
          );
        })}
      </Map>

      {/* Filter chips (MP5) */}
      <div className="absolute left-3 top-3 z-10">
        <MapFilters
          activeStatuses={statuses}
          activeCategories={categories}
          onToggleStatus={(g) => setStatuses((s) => toggle(s, g))}
          onToggleCategory={(c) => setCategories((s) => toggle(s, c))}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10">
        <MapLegend />
      </div>

      {/* Selected-case preview — bottom sheet on mobile, floating card on desktop (MP7) */}
      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:right-3 sm:max-w-xs">
          <div className="animate-fade-in-up rounded-xl border border-border/70 bg-card p-4 shadow-elev-3">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 font-semibold">
                <span>{CATEGORY_META[selected.category].glyph}</span>
                {CATEGORY_META[selected.category].label}
              </p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close preview"
                className="ring-focus rounded-md p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    GROUP_DOT[STATUS_META[selected.status].group],
                  )}
                />
                {STATUS_META[selected.status].label}
              </span>
              {selected.reportCount > 1 && (
                <span>{selected.reportCount} reports</span>
              )}
              {selected.severityLabel && (
                <span className="capitalize">
                  {selected.severityLabel} severity
                </span>
              )}
            </div>
            {selected.locality && (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {selected.locality}
              </p>
            )}
            {selected.href && (
              <Link
                href={selected.href}
                className="ring-focus mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View civic case
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
