/**
 * Velora 3.0 — Map marker shaping (Phase 2B). Additive, deterministic helper
 * that converts civic cases into map markers. Mirrors the mapping the home
 * page already uses, so the Mission Control ops map renders identical markers.
 */
import { CATEGORY_META } from "@/lib/constants";
import type { CivicCase, CivicMapMarker } from "@/types";

export function casesToMarkers(cases: CivicCase[]): CivicMapMarker[] {
  return cases.map((c) => ({
    id: c.id,
    title: CATEGORY_META[c.category].label,
    category: c.category,
    status: c.status,
    lat: c.centerLocation.lat,
    lng: c.centerLocation.lng,
    reportCount: c.reportCount,
    href: `/cases/${c.id}`,
    severityLabel: c.severityLabel,
    locality: c.locality ?? null,
  }));
}
