"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { useReducedMotion } from "@/lib/design/use-reduced-motion";

/**
 * Velora 3.0 — Celebration (Phase 2C, MO4 / EM1).
 *
 * A dependency-free confetti burst + success badge, shown briefly when a
 * meaningful moment lands (e.g. a civic case resolved). Reduced-motion users
 * get a calm static success badge with NO particles. Auto-dismisses and calls
 * onDone. Pure CSS transforms (GPU-friendly); the overlay is non-interactive.
 */
const COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--brand-2))",
  "hsl(var(--brand-3))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
];

const PARTICLE_COUNT = 44;
const DURATION_MS = 2200;

export function Celebration({
  active,
  message = "Resolved!",
  onDone,
}: {
  active: boolean;
  message?: string;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!active) return;
    setMounted(true);
    const t = setTimeout(() => {
      setMounted(false);
      onDone?.();
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        bg: COLORS[i % COLORS.length],
        delay: Math.random() * 400,
        duration: 1600 + Math.random() * 900,
        size: 6 + Math.round(Math.random() * 6),
        rounded: Math.random() > 0.5,
      })),
    [],
  );

  if (!mounted || !active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
      aria-hidden
    >
      {/* Confetti (motion users only) */}
      {!reduced &&
        pieces.map((p) => (
          <span
            key={p.id}
            className="absolute top-0"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.bg,
              borderRadius: p.rounded ? "9999px" : "2px",
              animation: `confetti-fall ${p.duration}ms var(--ease-standard) ${p.delay}ms forwards`,
            }}
          />
        ))}

      {/* Center success badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-scale-in flex items-center gap-2 rounded-full border border-success/30 bg-card/95 px-5 py-3 text-success shadow-elev-4 backdrop-blur">
          <CheckCircle2 className="h-6 w-6" />
          <span className="text-h3 text-foreground">{message}</span>
        </div>
      </div>
    </div>
  );
}
