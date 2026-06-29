"use client";

import { useEffect, useRef, useState } from "react";

import { useFormatters } from "@/lib/i18n/provider";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  decimals?: number;
}

/** Counts up to `value` on mount (U5). Respects prefers-reduced-motion. */
export function AnimatedCounter({
  value,
  durationMs = 900,
  decimals = 0,
}: AnimatedCounterProps) {
  const { formatNumber } = useFormatters();
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, durationMs]);

  const shown =
    decimals > 0
      ? display.toFixed(decimals)
      : formatNumber(Math.round(display));
  return <span className="tabular-nums">{shown}</span>;
}
