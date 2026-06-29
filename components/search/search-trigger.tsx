"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";

import { useT } from "@/lib/i18n/provider";

// The palette is only needed once the user opens search — load it on demand to
// keep it out of the initial (every-page) header bundle.
const CommandPalette = dynamic(
  () =>
    import("@/components/search/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Header search entry point + global ⌘K / Ctrl+K shortcut (V3 Phase 3A).
 * Owns the command-palette open state; renders a compact trigger on desktop
 * and an icon button on mobile. Mounting this once (in the header) makes
 * search reachable from every route.
 */
export function SearchTrigger() {
  const t = useT();
  const [open, setOpen] = useState(false);
  // The trigger button. We focus it before opening so the palette captures it
  // as the previously-focused element and restores focus here on close/Escape
  // (Requirements 6.5). Repeat ⌘K refocuses the live search input.
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // ⌘K is an idempotent OPEN — it never toggles the palette closed
        // (Requirements 6.6). A repeat press while open keeps the single
        // palette open and moves focus back to its search input.
        setOpen((isOpen) => {
          if (isOpen) {
            // Already open: keep one palette, refocus the search input.
            const input = document.querySelector<HTMLInputElement>(
              '[role="dialog"] input[role="combobox"]',
            );
            input?.focus();
            return true;
          }
          // Closed: focus the trigger first so the palette captures it as the
          // previously-focused element and returns focus here on close.
          triggerRef.current?.focus();
          return true;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("search.title")}
        aria-keyshortcuts="Control+K Meta+K"
        className="ring-focus inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background/60 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">{t("search.open")}</span>
        <kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline">
          ⌘K
        </kbd>
      </button>
      {open && <CommandPalette open onClose={() => setOpen(false)} />}
    </>
  );
}
