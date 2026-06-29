import Link from "next/link";
import { Activity } from "lucide-react";

import { LanguageSelector } from "@/components/i18n/language-selector";
import { NavLinks } from "@/components/nav-links";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import { getServerT } from "@/lib/i18n/server";

/**
 * Top navigation bar for the Civic Operations Center.
 * Brand + primary navigation with active-page highlighting (U5).
 */
export function SiteHeader() {
  const t = getServerT();
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="ring-focus flex items-center gap-2.5 rounded-md"
        >
          <div className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-brand-foreground shadow-elev-2">
            <Activity className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight">
              Velora{" "}
              <span className="text-gradient-brand">
                {
                  // i18n-exempt — brand wordmark
                  "Civic AI"
                }
              </span>
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {t("brand.tagline")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <NavLinks />
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <SearchTrigger />
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
