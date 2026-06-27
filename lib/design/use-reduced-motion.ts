"use client";

import { useEffect, useState } from "react";

/**
 * Velora 3.0 — reduced-motion hook (Phase 2A, XC4).
 *
 * Reactively tracks the user's `prefers-reduced-motion` setting so client
 * components in later phases can disable or simplify animations. SSR-safe
 * (starts `false`, syncs on mount) and updates live if the OS setting changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
