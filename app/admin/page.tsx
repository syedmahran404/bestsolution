import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { OpsMetrics } from "@/components/admin/ops-metrics";
import { OpsAnalytics } from "@/components/admin/ops-analytics";
import { ExecutiveMetrics } from "@/components/admin/executive-metrics";
import { HealthIndex } from "@/components/health/health-index";
import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import { listCivicCases } from "@/lib/civic-cases";
import { computeOperationsMetrics } from "@/lib/insights";
import { computeCivicHealthOverview } from "@/lib/civic-health";
import { computePriority } from "@/lib/operations";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { CivicCase } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Operations Center — Velora Civic AI" };

/** Phase 5 — Admin Operations Center dashboard (deterministic analytics). */
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

  // U3: deterministic priority ranking for the operations queue.
  const ranked = cases
    .map((c) => ({ c, p: computePriority(c) }))
    .sort((a, b) => b.p.score - a.p.score)
    .slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex-1 space-y-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Operations Center
            </h1>
            <p className="text-sm text-muted-foreground">
              Civic intelligence overview and case management.
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
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Backend not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY to load
              operations data.
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Couldn&apos;t load operations data. Please try again later.
            </CardContent>
          </Card>
        ) : (
          <>
            <HealthIndex overview={healthOverview} />

            <ExecutiveMetrics
              criticalCount={criticalCount}
              resolutionRate={healthOverview.resolution.resolutionRate}
              avgResolutionHours={healthOverview.resolution.avgResolutionHours}
              dailyActive={metrics.dailyActiveCount}
            />

            <OpsMetrics metrics={metrics} />

            {/* U3: highest-priority operations queue (deterministic ranking) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Highest priority cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ranked.length === 0 ? (
                  <EmptyHint />
                ) : (
                  ranked.map(({ c, p }) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="shrink-0 capitalize"
                      >
                        {p.label} · {p.score}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <CivicCaseCard civicCase={c} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Largest civic cases */}
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

              {/* Active clusters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active clusters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.activeClusters.length === 0 ? (
                    <EmptyHint text="No active multi-report clusters." />
                  ) : (
                    metrics.activeClusters.map((c) => (
                      <CivicCaseCard key={c.id} civicCase={c} />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Most reported categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Most reported categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.topCategories.length === 0 ? (
                    <EmptyHint />
                  ) : (
                    <ul className="space-y-2">
                      {metrics.topCategories.map((t) => (
                        <li
                          key={t.category}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {CATEGORY_META[t.category].glyph}{" "}
                            {CATEGORY_META[t.category].label}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {t.reportCount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent activity</CardTitle>
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

            {/* U3: deterministic operational analytics */}
            <OpsAnalytics metrics={metrics} />
          </>
        )}
      </main>
    </div>
  );
}

function EmptyHint({ text = "No data yet." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
