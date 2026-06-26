import Link from "next/link";
import { Activity } from "lucide-react";

import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Top navigation bar for the Civic Operations Center.
 * Brand + primary navigation with active-page highlighting (U5).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-sm">
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

        <div className="flex items-center gap-1">
          <NavLinks />
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
