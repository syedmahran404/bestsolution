import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { OpsAgent } from "@/components/ai/ops-agent";
import { OpsMetrics } from "@/components/admin/ops-metrics";
import { OpsAnalytics } from "@/components/admin/ops-analytics";
import { OpsCharts } from "@/components/admin/ops-charts";
import { ExecutiveMetrics } from "@/components/admin/executive-metrics";
import { HealthIndex } from "@/components/health/health-index";
import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { AlertRail } from "@/components/operations/command-center/alert-rail";
import { PriorityBoard } from "@/components/operations/command-center/priority-board";
import { ActivityStream } from "@/components/operations/command-center/activity-stream";
import { OpsMap } from "@/components/operations/command-center/ops-map";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCivicCases } from "@/lib/civic-cases";
import { computeOperationsMetrics } from "@/lib/insights";
import { computeCivicHealthOverview } from "@/lib/civic-health";
import { computePriority } from "@/lib/operations";
import { casesToMarkers } from "@/lib/map-markers";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { CivicCase } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mission Control — Velora Civic AI" };

/**
 * Phase 2B — Mission Control. A command-center layout (MC1) over the existing
 * deterministic operations data: KPI strip, an operations main column
 * (analytics charts → priority board → case lists), and a live right rail
 * (alerts + AI dock). All numbers reuse lib/insights + lib/operations.
 */
export default async function AdminPage() {
  let cases: CivicCase[] = [];
  let loadError = false;
  if (isFirebaseAdminConfigured) {
    try {
      cases = await listCivicCases();
    } catch (err) {
      console.error("[admin] failed to load cases:", err);
      loadError = true;
    }
  }

  const metrics = computeOperationsMetrics(cases);
  const healthOverview = computeCivicHealthOverview(cases);
  const criticalCount = cases.filter(
    (c) => c.severityLabel === "critical" || c.severityLabel === "high",
  ).length;

  // Deterministic priority ranking (reused) for the board + alert rail.
  const ranked = cases
    .map((c) => ({ c, p: computePriority(c) }))
    .sort((a, b) => b.p.score - a.p.score)
    .slice(0, 8);
  const attentionCases = ranked
    .filter((r) => r.c.status !== "resolved")
    .map((r) => r.c)
    .slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex-1 space-y-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Mission Control
            </p>
            <h1 className="text-h1">Operations Center</h1>
            <p className="text-sm text-muted-foreground">
              Live civic intelligence — prioritize, monitor, and resolve.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/cases">
              Manage cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {!isFirebaseAdminConfigured ? (
          <EmptyState
            illustration="offline"
            title="Backend not configured"
            description="Set FIREBASE_SERVICE_ACCOUNT_KEY to load operations data."
          />
        ) : loadError ? (
          <EmptyState
            illustration="error"
            title="Couldn't load operations data"
            description="Something went wrong fetching civic cases. Please try again later."
          />
        ) : (
          <>
            {/* KPI strip */}
            <ExecutiveMetrics
              criticalCount={criticalCount}
              resolutionRate={healthOverview.resolution.resolutionRate}
              avgResolutionHours={healthOverview.resolution.avgResolutionHours}
              dailyActive={metrics.dailyActiveCount}
            />
            <OpsMetrics metrics={metrics} />

            {/* Command-center grid: operations main + live rail */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <OpsMap markers={casesToMarkers(cases)} />

                <OpsCharts cases={cases} metrics={metrics} />

                <PriorityBoard ranked={ranked.slice(0, 6)} />

                <HealthIndex overview={healthOverview} />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Largest civic cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {metrics.largestCases.length === 0 ? (
                        <EmptyHint />
                      ) : (
                        metrics.largestCases.map((c) => (
                          <CivicCaseCard key={c.id} civicCase={c} />
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Recent activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {metrics.recentlyActive.length === 0 ? (
                        <EmptyHint />
                      ) : (
                        metrics.recentlyActive.map((c) => (
                          <CivicCaseCard key={c.id} civicCase={c} />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <OpsAnalytics metrics={metrics} />
              </div>

              {/* Live right rail (AI dock + alerts + activity stay in view) */}
              <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
                <AlertRail metrics={metrics} criticalCases={attentionCases} />
                <OpsAgent />
                <ActivityStream cases={cases} />
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyHint({ text = "No data yet." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
