/**
 * Server-side Google Maps helpers (V2.1) for the location picker.
 *
 * All calls are server REST (no client google.maps widget), so they are
 * typed normally and fail open. Powers: address autocomplete, place details
 * (→ coordinates), and reverse geocoding (coordinates → human address).
 *
 * Users never see or type coordinates; these helpers translate between a
 * human address and the lat/lng we store internally.
 */
import "server-only";

export interface AddressParts {
  formattedAddress: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
}

export interface PlaceLocation extends AddressParts {
  lat: number;
  lng: number;
}

export interface AutocompletePrediction {
  description: string;
  placeId: string;
}

export function serverMapsKey(): string | undefined {
  return (
    process.env.GOOGLE_MAPS_SERVER_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  );
}

export const isMapsServerConfigured = Boolean(
  process.env.GOOGLE_MAPS_SERVER_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
);

function parseComponents(
  components: Array<{ long_name: string; types: string[] }>,
): Omit<AddressParts, "formattedAddress"> {
  const pick = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? null;
  return {
    locality:
      pick("locality") ?? pick("sublocality") ?? pick("sublocality_level_1"),
    district: pick("administrative_area_level_2"),
    state: pick("administrative_area_level_1"),
  };
}

/** Reverse geocode coordinates → human-readable address parts. */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<AddressParts> {
  const empty: AddressParts = {
    formattedAddress: null,
    locality: null,
    district: null,
    state: null,
  };
  const key = serverMapsKey();
  if (!key) return empty;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return empty;
    const data = (await res.json()) as {
      results?: Array<{
        formatted_address: string;
        address_components: Array<{ long_name: string; types: string[] }>;
      }>;
    };
    const first = data.results?.[0];
    if (!first) return empty;
    return {
      formattedAddress: first.formatted_address ?? null,
      ...parseComponents(first.address_components),
    };
  } catch (err) {
    console.error("[maps-server] reverseGeocode failed:", err);
    return empty;
  }
}

/** Address autocomplete predictions (biased to India). */
export async function placesAutocomplete(
  query: string,
): Promise<AutocompletePrediction[]> {
  const key = serverMapsKey();
  if (!key || query.trim().length < 3) return [];
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}` +
      `&components=country:in&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      predictions?: Array<{ description: string; place_id: string }>;
    };
    return (data.predictions ?? []).slice(0, 6).map((p) => ({
      description: p.description,
      placeId: p.place_id,
    }));
  } catch (err) {
    console.error("[maps-server] placesAutocomplete failed:", err);
    return [];
  }
}

/** Resolve a placeId → coordinates + address parts. */
export async function placeDetails(
  placeId: string,
): Promise<PlaceLocation | null> {
  const key = serverMapsKey();
  if (!key || !placeId) return null;
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}` +
      `&fields=geometry,formatted_address,address_component&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: {
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: Array<{ long_name: string; types: string[] }>;
      };
    };
    const loc = data.result?.geometry?.location;
    if (!loc) return null;
    return {
      lat: loc.lat,
      lng: loc.lng,
      formattedAddress: data.result?.formatted_address ?? null,
      ...parseComponents(data.result?.address_components ?? []),
    };
  } catch (err) {
    console.error("[maps-server] placeDetails failed:", err);
    return null;
  }
}
