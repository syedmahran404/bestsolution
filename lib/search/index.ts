/**
 * Velora global search core (V3 Phase 3A).
 *
 * Pure, dependency-free ranking over a pre-built in-memory index. The index is
 * assembled by the command palette from already-loaded civic cases plus static
 * navigation/category/status entries, so search adds NO extra Firestore or
 * Gemini work and feels instant. Deterministic and SSR-safe.
 */

export type SearchGroup =
  | "case"
  | "report"
  | "category"
  | "locality"
  | "status"
  | "page";

export type SearchMode =
  | "all"
  | "problem"
  | "location"
  | "category"
  | "status"
  | "ai";

export interface SearchItem {
  id: string;
  group: SearchGroup;
  /** Display title (already localized by the caller). */
  title: string;
  /** Optional secondary line (already localized). */
  subtitle?: string;
  /** Navigation target. */
  href: string;
  /** Lowercased searchable blob (title + synonyms + locality + summary…). */
  keywords: string;
  /** Optional count used as a tiebreaker / badge (e.g. report count). */
  count?: number;
  /**
   * Marks an item as eligible in AI mode. Set on `case` items whose match
   * derives from AI-generated fields (summary + keywords). AI mode restricts
   * the pool to items with `aiMatchable === true`.
   */
  aiMatchable?: boolean;
}

/** Which groups each search mode includes. */
const MODE_GROUPS: Record<SearchMode, SearchGroup[] | null> = {
  all: null, // all groups
  problem: ["case", "report"],
  location: ["locality"],
  category: ["category"],
  status: ["status"],
  ai: ["case"],
};

/** Score a single item against a lowercased query. Higher = better. */
function scoreItem(item: SearchItem, q: string): number {
  if (!q) {
    // No query: rank by group priority + count (surfaces big cases first).
    const groupBoost =
      item.group === "case" ? 3 : item.group === "page" ? 2 : 1;
    return groupBoost * 1000 + (item.count ?? 0);
  }
  const title = item.title.toLowerCase();
  let score = 0;
  if (title === q) score += 1000;
  else if (title.startsWith(q)) score += 600;
  else if (title.includes(q)) score += 350;
  if (item.keywords.includes(q)) score += 120;

  // Token coverage: every whitespace token must appear somewhere.
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const hay = `${title} ${item.keywords}`;
    if (tokens.every((tk) => hay.includes(tk))) score += 200;
  }
  if (score === 0) return 0;
  return score + Math.min(item.count ?? 0, 99); // gentle popularity tiebreak
}

/** Rank items for a query + mode. Returns the top `limit` matches. */
export function rankItems(
  items: SearchItem[],
  query: string,
  mode: SearchMode = "all",
  limit = 24,
): SearchItem[] {
  const q = query.trim().toLowerCase();
  const groups = MODE_GROUPS[mode];
  let pool = groups ? items.filter((i) => groups.includes(i.group)) : items;
  // AI mode further restricts case matches to AI-derived fields (summary +
  // keywords), i.e. only items explicitly flagged `aiMatchable`.
  if (mode === "ai") {
    pool = pool.filter((i) => i.aiMatchable === true);
  }

  return pool
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

/**
 * Split a string into segments marking the matched query span(s) for
 * highlighting. Case-insensitive, contiguous-substring match.
 */
export function highlightSegments(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const lq = q.toLowerCase();
  const out: Array<{ text: string; match: boolean }> = [];
  let from = 0;
  let idx = lower.indexOf(lq, from);
  if (idx === -1) return [{ text, match: false }];
  while (idx !== -1) {
    if (idx > from) out.push({ text: text.slice(from, idx), match: false });
    out.push({ text: text.slice(idx, idx + lq.length), match: true });
    from = idx + lq.length;
    idx = lower.indexOf(lq, from);
  }
  if (from < text.length) out.push({ text: text.slice(from), match: false });
  return out;
}
