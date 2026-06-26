/**
 * Context Intelligence (U2).
 *
 * Enriches a report with Google Maps Platform context — reverse-geocoded
 * address and nearby sensitive places — and computes an EXPLAINABLE,
 * deterministic severity score. The AI never decides severity; this is
 * transparent math with human-readable reasons.
 *
 * API discipline:
 *   - Exactly ONE Geocoding call + ONE Places Nearby call per report.
 *   - Computed once at submit time and cached on the report document.
 *   - Fails OPEN: if the key is missing or a call fails, we return a base
 *     severity with no context (the report still works).
 */
import "server-only";

import { getDistance } from "geolib";

import {
  CONTEXT_RADIUS_M,
  CONTEXT_RULES,
  SEVERITY_BASE,
  severityLabelFromScore,
} from "@/lib/constants";
import type { ContextFactor, IssueCategory, SeverityLabel } from "@/types";

export interface ReportContext {
  formattedAddress: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  factors: ContextFactor[];
  severityScore: number;
  severityLabel: SeverityLabel;
  severityReasons: string[];
  source: string;
}

/** Server-side Maps key (unrestricted by HTTP referrer); falls back to public. */
function mapsKey(): string | undefined {
  return (
    process.env.GOOGLE_MAPS_SERVER_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  );
}

export const isContextConfigured = Boolean(
  process.env.GOOGLE_MAPS_SERVER_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
);

interface AddressParts {
  formattedAddress: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
}

async function reverseGeocode(
  lat: number,
  lng: number,
  key: string,
): Promise<AddressParts> {
  const empty: AddressParts = {
    formattedAddress: null,
    locality: null,
    district: null,
    state: null,
  };
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return empty;
    const data = (await res.json()) as {
      status: string;
      results?: Array<{
        formatted_address: string;
        address_components: Array<{ long_name: string; types: string[] }>;
      }>;
    };
    const first = data.results?.[0];
    if (!first) return empty;

    const pick = (type: string) =>
      first.address_components.find((c) => c.types.includes(type))?.long_name ??
      null;

    return {
      formattedAddress: first.formatted_address ?? null,
      locality:
        pick("locality") ?? pick("sublocality") ?? pick("sublocality_level_1"),
      district: pick("administrative_area_level_2"),
      state: pick("administrative_area_level_1"),
    };
  } catch (err) {
    console.error("[context] reverseGeocode failed:", err);
    return empty;
  }
}

async function nearbyFactors(
  lat: number,
  lng: number,
  key: string,
): Promise<ContextFactor[]> {
  try {
    // One ranked-by-distance Nearby call; classify results by their types.
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      status: string;
      results?: Array<{
        name: string;
        types: string[];
        geometry?: { location?: { lat: number; lng: number } };
      }>;
    };
    const places = data.results ?? [];

    const byType = new Map<string, ContextFactor>();
    for (const place of places) {
      const loc = place.geometry?.location;
      if (!loc) continue;
      const dist = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: loc.lat, longitude: loc.lng },
      );
      if (dist > CONTEXT_RADIUS_M) continue;

      for (const rule of CONTEXT_RULES) {
        if (place.types.some((t) => rule.googleTypes.includes(t))) {
          const existing = byType.get(rule.type);
          if (!existing || dist < existing.distanceM) {
            byType.set(rule.type, {
              type: rule.type,
              name: place.name,
              distanceM: dist,
              weight: rule.weight,
            });
          }
        }
      }
    }
    return Array.from(byType.values()).sort(
      (a, b) => a.distanceM - b.distanceM,
    );
  } catch (err) {
    console.error("[context] nearbyFactors failed:", err);
    return [];
  }
}

/** Deterministic, explainable severity from base + context factors. */
function computeSeverity(
  category: IssueCategory,
  factors: ContextFactor[],
): { score: number; label: SeverityLabel; reasons: string[] } {
  const base = SEVERITY_BASE[category] ?? 30;
  const reasons: string[] = [`Base severity for ${category}: ${base}`];
  let score = base;

  for (const f of factors) {
    score += f.weight;
    reasons.push(
      `Within ${f.distanceM}m of a ${f.type} (${f.name}): +${f.weight}`,
    );
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, label: severityLabelFromScore(score), reasons };
}

/**
 * Build the full context for a report. Always returns a result (fails open to
 * base severity when Maps is unconfigured or errors).
 */
export async function buildReportContext(report: {
  category: IssueCategory;
  latitude: number;
  longitude: number;
}): Promise<ReportContext> {
  const key = mapsKey();

  if (!key) {
    const { score, label, reasons } = computeSeverity(report.category, []);
    return {
      formattedAddress: null,
      locality: null,
      district: null,
      state: null,
      factors: [],
      severityScore: score,
      severityLabel: label,
      severityReasons: reasons,
      source: "unavailable (Maps key not configured)",
    };
  }

  const [address, factors] = await Promise.all([
    reverseGeocode(report.latitude, report.longitude, key),
    nearbyFactors(report.latitude, report.longitude, key),
  ]);

  const { score, label, reasons } = computeSeverity(report.category, factors);

  return {
    ...address,
    factors,
    severityScore: score,
    severityLabel: label,
    severityReasons: reasons,
    source: "Google Maps Platform",
  };
}
