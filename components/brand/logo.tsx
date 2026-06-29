import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Brand logo system (Phase 2A, BD8).
 *
 * `LogoMark` is the standalone glyph (gradient civic-pulse tile).
 * `Wordmark` is the typeset name. `Logo` composes both. All sizes derive from
 * one `size` prop so usages never drift.
 */
const MARK_SIZE = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
} as const;

const GLYPH_SIZE = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

type Size = keyof typeof MARK_SIZE;

export function LogoMark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-brand inline-flex items-center justify-center text-brand-foreground shadow-elev-2",
        MARK_SIZE[size],
        className,
      )}
      aria-hidden
    >
      <Activity className={GLYPH_SIZE[size]} strokeWidth={2.25} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-base font-bold tracking-tight",
        className,
      )}
    >
      Velora{" "}
      <span className="text-gradient-brand">
        {
          // i18n-exempt — brand wordmark
          "Civic AI"
        }
      </span>
    </span>
  );
}

export function Logo({
  size = "md",
  showTagline = false,
  className,
}: {
  size?: Size;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="leading-tight">
        <Wordmark />
        {showTagline && (
          <span className="block text-xs text-muted-foreground">
            {
              // i18n-exempt — brand tagline (logo lockup)
              "AI Civic Operations Center"
            }
          </span>
        )}
      </span>
    </span>
  );
}
