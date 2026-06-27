"use client";

import { usePathname } from "next/navigation";

import { useReducedMotion } from "@/lib/design/use-reduced-motion";

/**
 * Velora 3.0 — Page transition (Phase 2C, MO1).
 *
 * A subtle crossfade on route change. Keyed by pathname so React remounts the
 * wrapper and replays the enter animation on each navigation. Opacity-only
 * (no layout shift, GPU-friendly) and disabled under reduced motion. This is
 * the dependency-free substitute for full shared-element transitions (MO2),
 * which would require a layout-animation library.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
