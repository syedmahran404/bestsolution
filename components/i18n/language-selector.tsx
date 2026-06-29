"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Globe, Search } from "lucide-react";

import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/provider";
import { clampSelectionIndex } from "@/lib/ui/selection";
import { cn } from "@/lib/utils";

const RECENT_KEY = "velora.recentLocales";

function readRecent(): Locale[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return arr.filter((c): c is Locale =>
      LOCALES.some((l) => l.code === c),
    );
  } catch {
    return [];
  }
}

function writeRecent(code: Locale) {
  try {
    const next = [code, ...readRecent().filter((c) => c !== code)].slice(0, 3);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Premium header language selector (V3 Phase 3A).
 *
 * Searchable, fully keyboard-navigable (↑/↓/Enter/Esc + type-to-filter),
 * shows native script + English name, a current-language indicator with a
 * checkmark, recently-used languages, and an animated popover. Switching is
 * instant (client context) and persisted by the provider; recent choices are
 * persisted locally. Accessible: combobox + listbox semantics, managed focus.
 */
export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<Locale[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // Ordered, filtered options: recent first (excluding current), then the rest.
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (code: Locale) => {
      const l = LOCALES.find((x) => x.code === code)!;
      return (
        !q ||
        l.native.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.code.includes(q)
      );
    };
    const recentCodes = recent.filter((c) => c !== locale && match(c));
    const rest = LOCALES.map((l) => l.code).filter(
      (c) => !recentCodes.includes(c) && match(c),
    );
    return [...recentCodes, ...rest];
  }, [query, recent, locale]);

  // Reset transient state whenever the menu opens; load recent + focus search.
  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      setQuery("");
      setActive(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Keep the active option in view as it changes.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function choose(code: Locale) {
    setLocale(code);
    writeRecent(code);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => clampSelectionIndex(i, options.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => clampSelectionIndex(i, options.length, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const code = options[active];
      if (code) choose(code);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        className="ring-focus inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.native}</span>
      </button>

      {open && (
        <div
          className="animate-scale-in absolute right-0 z-50 mt-1.5 w-60 origin-top-right overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-elev-3"
          onKeyDown={onKeyDown}
        >
          {/* Search */}
          <div className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder={t("lang.searchPlaceholder")}
              aria-label={t("lang.searchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label={t("lang.label")}
            className="mt-1.5 max-h-72 space-y-0.5 overflow-y-auto"
          >
            {options.length === 0 && (
              <li className="px-2.5 py-3 text-center text-sm text-muted-foreground">
                {t("lang.noneFound")}
              </li>
            )}
            {options.map((code, i) => {
              const l = LOCALES.find((x) => x.code === code)!;
              const selected = code === locale;
              const isActive = i === active;
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(code)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      isActive
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
                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-brand" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
