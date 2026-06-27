import * as React from "react";

import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations";
import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — EmptyState (Phase 2A, BD7/BD8).
 *
 * One consistent treatment for empty / no-results / error / offline screens:
 * branded illustration + title + supporting copy + optional action. Replaces
 * ad-hoc "nothing here" blocks so every empty surface feels intentional.
 */
interface EmptyStateProps {
  illustration?: IllustrationName;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  illustration = "reports",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 px-6 py-12 text-center",
        className,
      )}
    >
      <Illustration name={illustration} size="md" />
      <div className="space-y-1.5">
        <h3 className="text-h3">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
