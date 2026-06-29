/**
 * Velora global search — recent searches (V3 Phase 3A).
 *
 * `addRecentSearch` is a pure function (no storage access) so it is fully
 * unit/property-testable. The load/save/clear wrappers are the only functions
 * that touch `localStorage`; each is wrapped in try/catch so they never throw
 * and are SSR-safe (guard against `window` being undefined).
 *
 * Backward-compatible with the previous inline palette logic: the same
 * localStorage key (`velora.recentSearches`) and the same `string[]` shape are
 * reused. The new rules tighten behavior: 2–100 char bounds, case-insensitive
 * dedup with move-to-front, and a cap of 6 (most-recent-first).
 */

/** localStorage key — kept identical to the legacy palette for compatibility. */
const RECENT_KEY = "velora.recentSearches";

/** Maximum number of recent searches retained. */
const MAX_RECENT = 6;

/** Inclusive query-length bounds for a query to be remembered. */
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * Pure recent-search reducer.
 *
 * Trims `rawQuery`; if the trimmed length is outside [2, 100] the list is
 * returned unchanged. Otherwise performs a case-insensitive dedup with
 * move-to-front: any existing entry equal under case-insensitive comparison is
 * removed and the new trimmed query is placed at the front. The list is capped
 * at 6 and ordered most-recent-first. The trimmed form is stored.
 */
export function addRecentSearch(list: string[], rawQuery: string): string[] {
  const trimmed = rawQuery.trim();
  if (trimmed.length < MIN_QUERY_LENGTH || trimmed.length > MAX_QUERY_LENGTH) {
    return list;
  }

  const lower = trimmed.toLowerCase();
  const deduped = list.filter((entry) => entry.toLowerCase() !== lower);
  return [trimmed, ...deduped].slice(0, MAX_RECENT);
}

/**
 * Read the recent searches from device storage.
 * Returns [] on any error or when `window` is undefined (SSR-safe).
 */
export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Persist the recent searches to device storage.
 * No-op on any error or when `window` is undefined (SSR-safe).
 */
export function saveRecentSearches(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* ignore — storage unavailable */
  }
}

/**
 * Remove all stored recent searches.
 * No-op on any error or when `window` is undefined (SSR-safe).
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore — storage unavailable */
  }
}
