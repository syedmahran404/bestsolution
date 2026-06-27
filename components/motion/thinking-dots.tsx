import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Thinking indicator (Phase 2C, MO3). Three brand dots that pulse
 * in sequence to signal the AI agent is reasoning. Reduced-motion users get
 * static dots (the global guard neutralizes the animation). Pure CSS.
 */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="status"
      aria-label="Thinking"
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
