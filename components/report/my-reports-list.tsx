"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ReportCard } from "@/components/report/report-card";
import { AIReasoningPanel } from "@/components/ai/ai-reasoning-panel";
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

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="space-y-2">
          <ReportCard report={report} />
          <AIReasoningPanel
            analysis={report.aiAnalysis}
            userCategory={report.category}
          />
        </div>
      ))}
    </div>
  );
}
