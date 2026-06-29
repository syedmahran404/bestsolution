import Link from "next/link";
import {
  CheckCircle2,
  Wrench,
  ShieldCheck,
  FilePlus2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { CATEGORY_META } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/i18n/format";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import type { CivicCase, IssueStatus } from "@/types";

/**
 * Velora 3.0 — Live activity stream (Phase 2B, MC6). A deterministic timeline
 * of the most recent case events, derived from each case's status + updatedAt.
 * No new data source — reuses the cases already loaded.
 */
const EVENT: Record<
  IssueStatus,
  { icon: LucideIcon; verb: string; dot: string }
> = {
  reported: { icon: FilePlus2, verb: "New report", dot: "bg-status-open" },
  verified: { icon: ShieldCheck, verb: "Verified", dot: "bg-info" },
  assigned: { icon: ClipboardList, verb: "Assigned", dot: "bg-info" },
  in_progress: {
    icon: Wrench,
    verb: "Work in progress",
    dot: "bg-status-progress",
  },
  resolved: {
    icon: CheckCircle2,
    verb: "Resolved",
    dot: "bg-status-resolved",
  },
};

function timeAgo(iso: string, locale: ReturnType<typeof getServerLocale>): string {
  return formatRelativeTime(iso, locale);
}

export function ActivityStream({
  cases,
  limit = 8,
}: {
  cases: CivicCase[];
  limit?: number;
}) {
  const locale = getServerLocale();
  const t = getServerT();
  const events = [...cases]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);

  return (
    <section
      aria-label={t("ops.liveActivity")}
      className="rounded-xl border border-border/70 bg-card shadow-elev-1"
    >
      <header className="border-b border-border/70 px-4 py-3">
        <h2 className="text-h3">{t("ops.liveActivity")}</h2>
      </header>

      {events.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          {t("ops.noRecentActivity")}
        </p>
      ) : (
        <ol className="relative space-y-0 p-2">
          {events.map((c, i) => {
            const e = EVENT[c.status];
            const Icon = e.icon;
            return (
              <li key={c.id} className="relative flex gap-3 px-2 py-2">
                {/* connector line */}
                {i < events.length - 1 && (
                  <span
                    className="absolute left-[1.4rem] top-9 h-[calc(100%-1rem)] w-px bg-border/70"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                    e.dot,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/cases/${c.id}`}
                    className="ring-focus block truncate rounded text-sm hover:underline"
                  >
                    <span className="font-medium">{e.verb}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {CATEGORY_META[c.category].glyph}{" "}
                      {CATEGORY_META[c.category].label}
                    </span>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.locality ? `${c.locality} · ` : ""}
                    {timeAgo(c.updatedAt, locale)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
