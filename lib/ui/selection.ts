/**
 * Velora shared UI — selection-index clamp helper (V3 Phase 3A).
 *
 * `clampSelectionIndex` is a pure, side-effect-free function (no DOM, no state)
 * shared by both the command palette (Arrow Up/Down result navigation,
 * Requirement 10.2) and the language selector (Arrow Up/Down option
 * navigation, Requirement 11.6). It centralizes the "move by one, clamp,
 * never wrap" logic that previously lived inline as `Math.min(i + 1, len - 1)`
 * and `Math.max(i - 1, 0)` in both components.
 *
 * The function is total: it never throws and always returns an in-range
 * integer (or 0 when there are no items). See design Property 16
 * (selection-index clamp).
 */

/**
 * Move a selection index by exactly one step in the requested direction and
 * clamp it to the valid range, never wrapping around.
 *
 * @param current   The current selection index.
 * @param length    The number of selectable items.
 * @param direction `1` to move one item later (e.g. Arrow Down), `-1` to move
 *                  one item earlier (e.g. Arrow Up).
 * @returns The next selection index, guaranteed to be within `[0, length - 1]`.
 *
 * Behavior:
 *  - **Empty list:** if `length <= 0` there is nothing to select, so `0` is
 *    returned as a safe sentinel.
 *  - **Out-of-range `current`:** clamped into `[0, length - 1]` *before* moving,
 *    so callers can pass a stale or sentinel index (e.g. `-1`) safely.
 *  - **No wrap-around:** at the top boundary (index `0`) moving up (`-1`) stays
 *    at `0`; at the bottom boundary (index `length - 1`) moving down (`+1`)
 *    stays at `length - 1`.
 */
export function clampSelectionIndex(
  current: number,
  length: number,
  direction: 1 | -1,
): number {
  // No items to select — return a safe sentinel.
  if (length <= 0) return 0;

  const maxIndex = length - 1;

  // Clamp `current` into range first (handles out-of-range / sentinel inputs).
  const start = Math.min(Math.max(current, 0), maxIndex);

  // Move by one step, then clamp again to enforce the no-wrap boundaries.
  const next = start + direction;
  return Math.min(Math.max(next, 0), maxIndex);
}
