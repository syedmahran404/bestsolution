import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { OpsMetrics } from "@/components/admin/ops-metrics";
import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import { listCivicCases } from "@/lib/civic-cases";
import { computeOperationsMetrics } from "@/lib/insights";
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
            <OpsMetrics metrics={metrics} />

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
          </>
        )}
      </main>
    </div>
  );
}

function EmptyHint({ text = "No data yet." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
