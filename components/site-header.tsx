import { Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * Top navigation bar for the Civic Operations Center.
 * Phase 1: brand + positioning only. Nav links arrive in later phases.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">
              Velora Civic AI
            </p>
            <p className="text-xs text-muted-foreground">
              AI Civic Operations Center
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          From Reporting to Resolution
        </Badge>
      </div>
    </header>
  );
}
