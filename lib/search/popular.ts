/**
 * Velora global search — popular results (V3 Phase 3A).
 *
 * `popularItems` is a pure, side-effect-free function used by the command
 * palette to render the empty-query "popular" list. It enforces the exact spec
 * ordering (Search_Result_Group priority ascending, then associated report
 * count descending, then case-insensitive result label ascending) and caps the
 * output at six. The input array is never mutated (a copy is sorted), so the
 * function is deterministic, total, and fully unit/property-testable.
 *
 * See Requirement 9.1 and design Property 11 (popular ordering and cap).
 */

import type { SearchGroup, SearchItem } from "@/lib/search";

/**
 * Search_Result_Group display priority (ascending = surfaced first).
 *
 * Lower number sorts earlier. Cases lead, then reports, localities,
 * categories, statuses, and finally generic pages.
 */
const GROUP_PRIORITY: Record<SearchGroup, number> = {
  case: 0,
  report: 1,
  locality: 2,
  category: 3,
  status: 4,
  page: 5,
};

/**
 * Return the most "popular" items for the empty-query state.
 *
 * Ordering (total + deterministic):
 *  1. ascending Search_Result_Group priority (see {@link GROUP_PRIORITY});
 *  2. descending associated report count (`count ?? 0`);
 *  3. case-insensitive ascending result label (`title`).
 *
 * The result is capped at `limit` (default 6). The input array is not mutated.
 */
export function popularItems(
  items: SearchItem[],
  limit = 6,
): SearchItem[] {
  return [...items]
    .sort((a, b) => {
      const groupDelta = GROUP_PRIORITY[a.group] - GROUP_PRIORITY[b.group];
      if (groupDelta !== 0) return groupDelta;

      const countDelta = (b.count ?? 0) - (a.count ?? 0);
      if (countDelta !== 0) return countDelta;

      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    })
    .slice(0, limit);
}
