import Link from "next/link";
import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Top navigation bar for the Civic Operations Center.
 * Brand + primary navigation (Map / Report / My Reports).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">
              Velora Civic AI
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              AI Civic Operations Center
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Map</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/reports">My Reports</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/report">Report issue</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
