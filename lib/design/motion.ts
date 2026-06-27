/**
 * Velora 3.0 — Motion foundation (Phase 2A, BD5).
 *
 * This is the FOUNDATION only: tokens + a reduced-motion helper. No animations
 * are shipped in Phase 2A. Phase 2C (transitions, AI-thinking, celebrations)
 * MUST consume these tokens rather than inventing one-off durations/easings, so
 * motion stays consistent and globally tunable from one place.
 *
 * Values mirror the CSS custom properties declared in app/globals.css
 * (--dur-*, --ease-*, --dist-*). Keep the two in sync.
 */

/** Duration scale (ms). 1 = micro feedback … 4 = page/scene level. */
export const DURATION = {
  instant: 0,
  fast: 120, // --dur-1: hovers, taps, color shifts
  base: 200, // --dur-2: most UI state changes
  slow: 320, // --dur-3: panels, sheets, expand/collapse
  scene: 520, // --dur-4: page / shared-element transitions
} as const;

/** Easing scale. Standard for entering/leaving; spring for playful accents. */
export const EASING = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.3, 0, 0, 1)",
  decelerate: "cubic-bezier(0, 0, 0, 1)",
  accelerate: "cubic-bezier(0.3, 0, 1, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Distance scale (px) for enter/exit translations. */
export const DISTANCE = {
  sm: 6,
  md: 12,
  lg: 24,
} as const;

/** Opacity scale for fades and disabled/scrim treatments. */
export const OPACITY = {
  hidden: 0,
  scrim: 0.5,
  muted: 0.7,
  visible: 1,
} as const;

export type DurationToken = keyof typeof DURATION;
export type EasingToken = keyof typeof EASING;

/**
 * SSR-safe check for the user's reduced-motion preference. Returns false on the
 * server and when the API is unavailable (fail-open: no motion assumptions).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Build a CSS transition string from tokens. When the user prefers reduced
 * motion, returns a near-instant transition so state still resolves but without
 * animation. Phase 2C wrappers should also guard structurally.
 */
export function transition(
  properties: string | string[] = "all",
  duration: DurationToken = "base",
  easing: EasingToken = "standard",
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  const ms = prefersReducedMotion() ? DURATION.instant : DURATION[duration];
  const ease = EASING[easing];
  return props.map((p) => `${p} ${ms}ms ${ease}`).join(", ");
}
