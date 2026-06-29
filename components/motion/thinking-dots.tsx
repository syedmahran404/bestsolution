"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

/**
 * Velora 3.0 — Thinking indicator (Phase 2C, MO3). Three brand dots that pulse
 * in sequence to signal the AI agent is reasoning. Reduced-motion users get
 * static dots (the global guard neutralizes the animation). Pure CSS.
 */
export function ThinkingDots({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="status"
      aria-label={t("common.thinking")}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}
