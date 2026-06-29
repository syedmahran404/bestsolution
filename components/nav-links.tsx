"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import type { MessageKey } from "@/lib/i18n/messages";

const ITEMS: { href: string; key: MessageKey }[] = [
  { href: "/", key: "nav.map" },
  { href: "/admin", key: "nav.operations" },
  { href: "/reports", key: "nav.myReports" },
];

/**
 * Primary navigation with clear active-page state (U5). Highlights the current
 * route and exposes aria-current for assistive tech. Labels are localized (V3).
 */
export function NavLinks() {
  const pathname = usePathname();
  const t = useT();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav aria-label={t("nav.primary")} className="flex items-center gap-1">
      {ITEMS.map((it) => {
        const active = isActive(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {t(it.key)}
          </Link>
        );
      })}
      <Link
        href="/report"
        aria-current={pathname.startsWith("/report") ? "page" : undefined}
        className="ml-1 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("nav.report")}
      </Link>
    </nav>
  );
}
