"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CornerDownLeft,
  FileText,
  Layers,
  MapPin,
  Search as SearchIcon,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";

import {
  CATEGORY_META,
  STATUS_META,
  WORKFLOW_STATUSES,
} from "@/lib/constants";
import { REPORT_CATEGORIES } from "@/lib/validation/report";
import { useT } from "@/lib/i18n/provider";
import {
  highlightSegments,
  rankItems,
  type SearchGroup,
  type SearchItem,
  type SearchMode,
} from "@/lib/search";
import { popularItems } from "@/lib/search/popular";
import {
  addRecentSearch,
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearches,
} from "@/lib/search/recent";
import { clampSelectionIndex } from "@/lib/ui/selection";
import { cn } from "@/lib/utils";
import type { CivicCase, CivicReport } from "@/types";

const GROUP_ICON: Record<SearchGroup, typeof Layers> = {
  case: Layers,
  report: FileText,
  category: Tag,
  locality: MapPin,
  status: TrendingUp,
  page: SearchIcon,
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const t = useT();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const [cases, setCases] = useState<CivicCase[] | null>(null);
  const [reports, setReports] = useState<CivicReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Element that held focus before the palette opened — focus returns here on
  // close so keyboard users land back on the trigger (Requirements 10.6/10.8).
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Stable per-row option id for aria-activedescendant wiring.
  const optionId = useCallback((idx: number) => `search-opt-${idx}`, []);

  const groupLabel = useCallback(
    (g: SearchGroup) =>
      ({
        case: t("search.groupCases"),
        report: t("search.groupReports"),
        category: t("search.groupCategories"),
        locality: t("search.groupLocalities"),
        status: t("search.groupStatuses"),
        page: t("search.groupPages"),
      })[g],
    [t],
  );

  // Static (always-available) navigation entries.
  const pageItems = useMemo<SearchItem[]>(
    () => [
      { id: "p-map", group: "page", title: t("nav.map"), href: "/", keywords: "map home cases civic" },
      { id: "p-ops", group: "page", title: t("nav.operations"), href: "/admin", keywords: "operations mission control admin dashboard" },
      { id: "p-reports", group: "page", title: t("nav.myReports"), href: "/reports", keywords: "my reports submissions" },
      { id: "p-report", group: "page", title: t("nav.report"), href: "/report", keywords: "report issue new submit" },
      { id: "p-cases", group: "page", title: t("adminCases.title"), href: "/admin/cases", keywords: "case management search filter" },
    ],
    [t],
  );

  // Category + status entries (link to case management).
  const taxonomyItems = useMemo<SearchItem[]>(() => {
    const cats: SearchItem[] = REPORT_CATEGORIES.map((c) => ({
      id: `c-${c}`,
      group: "category",
      title: `${CATEGORY_META[c].glyph} ${CATEGORY_META[c].label}`,
      href: "/admin/cases",
      keywords: `${c} ${CATEGORY_META[c].label}`.toLowerCase(),
    }));
    const statuses: SearchItem[] = WORKFLOW_STATUSES.map((s) => ({
      id: `s-${s}`,
      group: "status",
      title: STATUS_META[s].label,
      href: "/admin/cases",
      keywords: `${s} ${STATUS_META[s].label}`.toLowerCase(),
    }));
    return [...cats, ...statuses];
  }, []);

  // Case + locality entries derived from live data.
  const dataItems = useMemo<SearchItem[]>(() => {
    if (!cases) return [];
    const caseItems: SearchItem[] = cases.map((c) => {
      const cat = CATEGORY_META[c.category].label;
      const loc = c.locality ?? null;
      const hasAi = Boolean(c.aiSummary) || (c.keywords?.length ?? 0) > 0;
      return {
        id: `case-${c.id}`,
        group: "case",
        title: loc ? `${cat} · ${loc}` : cat,
        subtitle: c.aiSummary ?? undefined,
        href: `/cases/${c.id}`,
        count: c.reportCount,
        aiMatchable: hasAi,
        keywords: [
          cat,
          loc ?? "",
          c.district ?? "",
          c.status,
          c.severityLabel ?? "",
          c.aiSummary ?? "",
          ...(c.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase(),
      };
    });
    const locMap = new Map<string, number>();
    for (const c of cases) {
      const l = (c.locality ?? "").trim();
      if (l) locMap.set(l, (locMap.get(l) ?? 0) + c.reportCount);
    }
    const locItems: SearchItem[] = [...locMap.entries()].map(([name, count]) => ({
      id: `loc-${name}`,
      group: "locality",
      title: name,
      href: "/admin/cases",
      count,
      keywords: name.toLowerCase(),
    }));
    return [...caseItems, ...locItems];
  }, [cases]);

  // Citizen report entries derived from live data (fetched once per session).
  const reportItems = useMemo<SearchItem[]>(() => {
    if (!reports) return [];
    return reports.map((r) => {
      const cat = CATEGORY_META[r.category].label;
      const loc = r.locality ?? null;
      const title = r.title?.trim() || (loc ? `${cat} · ${loc}` : cat);
      const caseId = r.civicCaseId ?? null;
      return {
        id: `report-${r.id}`,
        group: "report",
        title,
        subtitle: loc ?? undefined,
        href: caseId ? `/cases/${caseId}` : "/reports",
        count: 1,
        keywords: [
          title,
          cat,
          loc ?? "",
          r.district ?? "",
          r.description ?? "",
        ]
          .join(" ")
          .toLowerCase(),
      };
    });
  }, [reports]);

  const allItems = useMemo(
    () => [...dataItems, ...reportItems, ...taxonomyItems, ...pageItems],
    [dataItems, reportItems, taxonomyItems, pageItems],
  );

  const results = useMemo(
    () => rankItems(allItems, debounced, mode, 24),
    [allItems, debounced, mode],
  );

  // Empty-query popular list (spec ordering + cap 6). Shown when idle; the
  // ranked `results` drive the active-query view.
  const popular = useMemo(() => popularItems(allItems, 6), [allItems]);

  // Items currently rendered + navigable: popular when idle, else ranked.
  const displayItems = debounced.trim() ? results : popular;

  // Debounce the query (150ms) and reset the active row.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);
  // On mode/results change: highlight the first result, or clear the selection
  // (active = -1) when the list is empty so Enter is an explicit no-op.
  useEffect(
    () => setActive(displayItems.length > 0 ? 0 : -1),
    [displayItems.length, mode],
  );

  // On open: reset, focus, load recent, and lazily fetch cases + reports once.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDebounced("");
    setMode("all");
    setActive(0);
    setRecent(loadRecentSearches());
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);

    if (cases === null && reports === null && !loading) {
      setLoading(true);
      setError(false);
      const casesReq = fetch("/api/cases", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error("failed");
          return r.json();
        })
        .then((d: { cases?: CivicCase[] }) => setCases(d.cases ?? []));
      const reportsReq = fetch("/api/reports?scope=all", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error("failed");
          return r.json();
        })
        .then((d: { reports?: CivicReport[] }) => setReports(d.reports ?? []))
        // Reports are supplementary — a failure here must not block cases or
        // crash the palette; reports simply won't appear.
        .catch(() => setReports([]));
      Promise.all([casesReq, reportsReq])
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
    return () => window.clearTimeout(id);
  }, [open, cases, reports, loading]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Capture the previously-focused element on open and restore focus to it on
  // close/unmount (focus restoration — Requirements 10.6 / 10.8).
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      prevFocusRef.current?.focus();
    };
  }, [open]);

  // Keep active row scrolled into view (skip when nothing is selected).
  useEffect(() => {
    if (active < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-row="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, displayItems]);

  const go = useCallback(
    (item: SearchItem) => {
      const next = addRecentSearch(loadRecentSearches(), query);
      saveRecentSearches(next);
      setRecent(next);
      onClose();
      router.push(item.href);
    },
    [onClose, query, router],
  );

  const onClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecent([]);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => clampSelectionIndex(i, displayItems.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => clampSelectionIndex(i, displayItems.length, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Explicit no-op when nothing is selected (empty/no-selection list).
      if (active < 0) return;
      const item = displayItems[active];
      if (item) go(item);
    } else if (e.key === "Tab") {
      // Focus trap: keep Tab / Shift+Tab cycling within the palette.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !panelRef.current?.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open) return null;

  const modes: { key: SearchMode; label: string }[] = [
    { key: "all", label: t("common.viewAll") },
    { key: "problem", label: t("search.groupCases") },
    { key: "location", label: t("search.groupLocalities") },
    { key: "category", label: t("search.groupCategories") },
    { key: "status", label: t("search.groupStatuses") },
    { key: "ai", label: t("search.modeAi") },
  ];

  // Group ranked results for display while preserving the flat active index.
  let flatIndex = -1;
  const grouped = new Map<SearchGroup, { item: SearchItem; idx: number }[]>();
  displayItems.forEach((item) => {
    flatIndex += 1;
    const arr = grouped.get(item.group) ?? [];
    arr.push({ item, idx: flatIndex });
    grouped.set(item.group, arr);
  });

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="animate-scale-in w-full max-w-xl overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-elev-4"
        onKeyDown={onKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 border-b px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.title")}
            role="combobox"
            aria-expanded={displayItems.length > 0}
            aria-controls="search-results-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0 ? optionId(active) : undefined
            }
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="ring-focus rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode chips */}
        <div className="flex flex-wrap gap-1.5 border-b px-3 py-2">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "ring-focus rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                mode === m.key
                  ? "bg-brand text-brand-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Recent searches (only when idle) */}
        {!query && recent.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {t("search.recent")}
            </span>
            {recent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setQuery(r)}
                className="ring-focus rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearRecent}
              className="ring-focus ml-auto rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {t("search.clearRecent")}
            </button>
          </div>
        )}

        {/* Results */}
        <div
          ref={listRef}
          id="search-results-listbox"
          role="listbox"
          aria-label={t("search.results")}
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {loading && cases === null ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t("search.loading")}
            </p>
          ) : error ? (
            <p className="px-3 py-8 text-center text-sm text-destructive">
              {t("search.error")}
            </p>
          ) : displayItems.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium">{t("search.empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("search.emptyHint")}
              </p>
            </div>
          ) : (
            <>
              {!query && (
                <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
                  {t("search.popular")}
                </p>
              )}
              {[...grouped.entries()].map(([group, rows]) => {
                const Icon = GROUP_ICON[group];
                return (
                  <div key={group} className="mb-1">
                    <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {groupLabel(group)}
                    </p>
                    {rows.map(({ item, idx }) => (
                      <button
                        key={item.id}
                        type="button"
                        id={optionId(idx)}
                        role="option"
                        aria-selected={idx === active}
                        data-row={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(item)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                          idx === active ? "bg-accent" : "hover:bg-accent/60",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {highlightSegments(item.title, debounced).map(
                              (seg, i) =>
                                seg.match ? (
                                  <mark
                                    key={i}
                                    className="bg-transparent font-semibold text-brand"
                                  >
                                    {seg.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{seg.text}</span>
                                ),
                            )}
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {typeof item.count === "number" && item.count > 1 && (
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                            {item.count}
                          </span>
                        )}
                        {idx === active && (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            <kbd className="rounded border bg-muted px-1">↑</kbd>{" "}
            <kbd className="rounded border bg-muted px-1">↓</kbd>{" "}
            {t("search.navigate")}
          </span>
          <span>
            <kbd className="rounded border bg-muted px-1">↵</kbd>{" "}
            {t("search.select")}
          </span>
          <span>
            <kbd className="rounded border bg-muted px-1">
              {
                // i18n-exempt — keyboard keycap label
                "esc"
              }
            </kbd>{" "}
            {t("search.dismiss")}
          </span>
        </div>
      </div>
    </div>
  );
}
