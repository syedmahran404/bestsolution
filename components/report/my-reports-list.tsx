"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";

import { ReportCard } from "@/components/report/report-card";
import { AIReasoningPanel } from "@/components/ai/ai-reasoning-panel";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getReporterId } from "@/lib/reporter";
import type { CivicReport } from "@/types";

/**
 * Isolated "My Reports" list (U1). Reads the anonymous reporter id from this
 * device and fetches only that reporter's reports — never the global list.
 */
export function MyReportsList() {
  const [reports, setReports] = useState<CivicReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reporterId = getReporterId();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/reports?reporterId=${encodeURIComponent(reporterId)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load reports.");
        const data = (await res.json()) as { reports: CivicReport[] };
        if (!cancelled) setReports(data.reports ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <EmptyState
        illustration="error"
        title="Couldn't load your reports"
        description="Something went wrong. Please try again later."
      />
    );
  }

  if (reports === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        illustration="reports"
        title="No reports yet"
        description="Reports you submit from this device will appear here."
        action={
          <Button asChild>
            <Link href="/report">Report an issue</Link>
          </Button>
        }
      />
    );
  }

  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="space-y-4">
      <Reveal className="rounded-xl border border-border/70 bg-gradient-to-br from-brand/8 to-brand-2/5 p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/12 text-brand">
            <Award className="h-5 w-5" />
          </span>
          <p className="font-medium">Your civic impact</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-metric !text-2xl">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Reports filed</p>
          </div>
          <div>
            <p className="text-metric !text-2xl text-brand">
              {reports.length * 10}
            </p>
            <p className="text-xs text-muted-foreground">Civic points</p>
          </div>
          <div>
            <p className="text-metric !text-2xl">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>
      </Reveal>

      {reports.map((report, i) => (
        <Reveal key={report.id} delay={i * 60} className="space-y-2">
          <ReportCard report={report} />
          <AIReasoningPanel
            analysis={report.aiAnalysis}
            userCategory={report.category}
          />
        </Reveal>
      ))}
    </div>
  );
}
