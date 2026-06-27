/**
 * Velora 3.0 — Client-side marker clustering (Phase 2B, MP1/MP3).
 *
 * A dependency-free, zoom-aware grid clusterer. It groups nearby markers into
 * cells whose size shrinks as zoom increases, so dense areas collapse into
 * count bubbles at low zoom and expand into individual pins as you zoom in.
 *
 * This is a PURE function (no Google Maps dependency, no Map ID required —
 * classic markers don't need a vector basemap), so the clustering logic is
 * fully unit-verifiable offline; only the rendered overlay needs browser QA.
 */
import { STATUS_META } from "@/lib/constants";
import type { CivicMapMarker } from "@/types";

export interface MarkerCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  reportCount: number;
  markers: CivicMapMarker[];
  /** Lifecycle group with the most markers — drives bubble color. */
  dominantGroup: "open" | "progress" | "resolved";
}

export interface ClusterResult {
  clusters: MarkerCluster[];
  singles: CivicMapMarker[];
}

/** Above this zoom, never cluster — show every marker individually. */
export const MAX_CLUSTER_ZOOM = 11;

/** Degrees-per-cell for a given zoom (≈ halves each zoom level). */
function cellSizeDeg(zoom: number): number {
  const base = 64; // ~ whole-India cell at very low zoom
  return base / Math.pow(2, Math.max(0, zoom));
}

export function clusterMarkers(
  markers: CivicMapMarker[],
  zoom: number,
): ClusterResult {
  if (zoom >= MAX_CLUSTER_ZOOM) {
    return { clusters: [], singles: markers };
  }

  const size = cellSizeDeg(zoom);
  const cells = new Map<string, CivicMapMarker[]>();
  for (const m of markers) {
    const key = `${Math.floor(m.lat / size)}:${Math.floor(m.lng / size)}`;
    const arr = cells.get(key);
    if (arr) arr.push(m);
    else cells.set(key, [m]);
  }

  const clusters: MarkerCluster[] = [];
  const singles: CivicMapMarker[] = [];

  for (const [key, group] of cells) {
    if (group.length === 1) {
      singles.push(group[0]);
      continue;
    }
    // Centroid + dominant status group + total reports.
    let latSum = 0;
    let lngSum = 0;
    let reportCount = 0;
    const groupCounts = { open: 0, progress: 0, resolved: 0 };
    for (const m of group) {
      latSum += m.lat;
      lngSum += m.lng;
      reportCount += m.reportCount || 1;
      groupCounts[STATUS_META[m.status].group] += 1;
    }
    const dominantGroup = Object.entries(groupCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0] as MarkerCluster["dominantGroup"];

    clusters.push({
      id: `cluster-${key}`,
      lat: latSum / group.length,
      lng: lngSum / group.length,
      count: group.length,
      reportCount,
      markers: group,
      dominantGroup,
    });
  }

  return { clusters, singles };
}
