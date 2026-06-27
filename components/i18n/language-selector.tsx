"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";

import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Header language selector (V3 Phase 1). A lightweight, accessible dropdown
 * (no extra deps): globe trigger + a menu of the six locales in their native
 * script. Switching is instant (client context) and persisted by the provider.
 */
export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  function choose(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{active.native}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Languages"
          className="absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-elevated"
        >
          {LOCALES.map((l) => {
            const selected = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choose(l.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {l.native}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {l.label}
                  </span>
                </span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
