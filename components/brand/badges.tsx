import { STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { IssueStatus, SeverityLabel } from "@/types";

/**
 * Velora 3.0 — Status + Priority badges (Phase 2A, BD8).
 *
 * Both use the premium "colored dot + foreground label" pattern so the text
 * always meets AA contrast (it stays foreground), while color communicates
 * state via the theme-aware status tokens. `critical` priority is the one
 * solid-filled chip, for deliberate visual urgency.
 */

const STATUS_DOT: Record<"open" | "progress" | "resolved", string> = {
  open: "bg-status-open",
  progress: "bg-status-progress",
  resolved: "bg-status-resolved",
};

export function StatusBadge({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[meta.group])}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}

const SEVERITY_META: Record<
  SeverityLabel,
  { label: string; dot: string; solid?: boolean }
> = {
  low: { label: "Low", dot: "bg-neutral" },
  medium: { label: "Medium", dot: "bg-info" },
  high: { label: "High", dot: "bg-warning" },
  critical: { label: "Critical", dot: "bg-critical", solid: true },
};

export function PriorityBadge({
  severity,
  className,
}: {
  severity: SeverityLabel;
  className?: string;
}) {
  const meta = SEVERITY_META[severity];

  if (meta.solid) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-critical px-2.5 py-0.5 text-xs font-semibold text-critical-foreground",
          className,
        )}
      >
        {meta.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
