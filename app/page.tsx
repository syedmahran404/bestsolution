import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { CivicMap } from "@/components/map/civic-map";
import { AggregationMetrics } from "@/components/aggregation-metrics";
import { HealthIndex } from "@/components/health/health-index";
import { InsightCard } from "@/components/civic/insight-card";
import { CategoryDistribution } from "@/components/civic/category-distribution";
import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/lib/constants";
import { computeAggregationMetrics } from "@/lib/aggregation";
import { computeCivicHealthOverview } from "@/lib/civic-health";
import { generateCivicInsights } from "@/lib/civic-insights";
import { listCivicCases } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { SEED_ISSUES } from "@/lib/seed-data";
import type { CivicCase, CivicMapMarker } from "@/types";

// Reads live civic cases from Firestore — never statically cache.
export const dynamic = "force-dynamic";

/**
 * Civic Operations Center home (executive landing).
 *
 * Logic is unchanged from prior phases; U5 only enhances presentation. When
 * Firebase is not configured it falls back to the seed dataset so the map and
 * legend still work.
 */
export default async function HomePage() {
  let cases: CivicCase[] = [];
  if (isFirebaseAdminConfigured) {
    try {
      cases = await listCivicCases();
    } catch (err) {
      console.error("[home] failed to load civic cases:", err);
    }
  }

  const usingLiveData = cases.length > 0;

  const markers: CivicMapMarker[] = usingLiveData
    ? cases.map((c) => ({
        id: c.id,
        title: CATEGORY_META[c.category].label,
        category: c.category,
        status: c.status,
        lat: c.centerLocation.lat,
        lng: c.centerLocation.lng,
        reportCount: c.reportCount,
        href: `/cases/${c.id}`,
        severityLabel: c.severityLabel,
        locality: c.locality ?? null,
      }))
    : SEED_ISSUES.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        status: i.status,
        lat: i.location.lat,
        lng: i.location.lng,
        reportCount: 1,
        severityLabel: i.severityLabel,
        locality: i.location.city ?? null,
      }));

  const metrics = usingLiveData
    ? computeAggregationMetrics(cases)
    : {
        totalReports: SEED_ISSUES.length,
        totalCases: SEED_ISSUES.length,
        avgReportsPerCase: 1,
      };

  const healthOverview = usingLiveData
    ? computeCivicHealthOverview(cases)
    : null;
  const insights = usingLiveData ? generateCivicInsights(cases) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex flex-1 flex-col gap-6 py-6">
        {/* Hero */}
        <section className="animate-fade-in-up hero-surface overflow-hidden rounded-2xl border p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <Badge variant="secondary">AI Civic Intelligence</Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                India{" "}
                <span className="text-gradient-brand">Civic Operations</span>{" "}
                Center
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Citizens report issues; AI aggregates them into prioritized
                civic cases — explained, tracked, and resolved.
                {!usingLiveData && " (Showing demo data.)"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild>
                <Link href="/report">Report an issue</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin">Operations center</Link>
              </Button>
            </div>
          </div>
        </section>

        {healthOverview && <HealthIndex overview={healthOverview} />}

        <AggregationMetrics {...metrics} />

        {/* Map */}
        <section className="h-[58vh] min-h-[440px] w-full">
          <CivicMap markers={markers} />
        </section>

        {/* Insights + distribution */}
        {usingLiveData && (insights.length > 0 || cases.length > 0) && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Explainable civic insights
              </h2>
              {insights.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {insights.map((ins) => (
                    <InsightCard key={ins.id} insight={ins} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Insights appear as more reports arrive.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Distribution
              </h2>
              <CategoryDistribution cases={cases} />
            </div>
          </section>
        )}

        {/* Civic cases */}
        {usingLiveData && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Civic cases
            </h2>
            <div className="space-y-3">
              {cases.slice(0, 10).map((c) => (
                <div key={c.id} className="card-hover rounded-lg">
                  <CivicCaseCard civicCase={c} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-xs text-muted-foreground">
          Velora Civic AI · AI Civic Operations Center · Built for the Vibe2Ship
          Hackathon
        </div>
      </footer>
    </div>
  );
}
