import {
  BellRing,
  ClipboardList,
  CloudOff,
  PartyPopper,
  SearchX,
  Sparkles,
  TriangleAlert,
  Users,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Illustration set (Phase 2A, BD7).
 *
 * A cohesive, branded illustration family for empty / success / error / offline
 * and feature states. Each is a layered "gradient orb + glyph" composition that
 * is theme-aware (token colors), AA-safe (decorative, aria-hidden), and
 * dependency-free. One visual language so states never feel generic.
 */
export type IllustrationName =
  | "reports"
  | "search"
  | "success"
  | "error"
  | "offline"
  | "notifications"
  | "community"
  | "ai"
  | "loading";

const GLYPH: Record<IllustrationName, LucideIcon> = {
  reports: ClipboardList,
  search: SearchX,
  success: PartyPopper,
  error: TriangleAlert,
  offline: CloudOff,
  notifications: BellRing,
  community: Users,
  ai: Sparkles,
  loading: WifiOff,
};

const TONE: Record<IllustrationName, string> = {
  reports: "text-brand",
  search: "text-brand",
  success: "text-success",
  error: "text-critical",
  offline: "text-muted-foreground",
  notifications: "text-info",
  community: "text-brand",
  ai: "text-brand",
  loading: "text-muted-foreground",
};

const SIZE = {
  sm: { orb: "h-16 w-16", glyph: "h-7 w-7" },
  md: { orb: "h-24 w-24", glyph: "h-10 w-10" },
  lg: { orb: "h-32 w-32", glyph: "h-14 w-14" },
} as const;

interface IllustrationProps {
  name: IllustrationName;
  size?: keyof typeof SIZE;
  className?: string;
}

export function Illustration({
  name,
  size = "md",
  className,
}: IllustrationProps) {
  const Glyph = GLYPH[name];
  const dims = SIZE[size];
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        TONE[name],
        className,
      )}
      aria-hidden
    >
      {/* Outer soft halo */}
      <span className="absolute inset-0 rounded-full bg-current opacity-[0.07] blur-xl" />
      {/* Orb */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border border-current/15 bg-current/10",
          dims.orb,
        )}
      >
        <Glyph className={cn(dims.glyph)} strokeWidth={1.75} />
      </span>
    </div>
  );
}
