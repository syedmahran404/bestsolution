import { SiteHeader } from "@/components/site-header";
import { CivicMap } from "@/components/map/civic-map";
import { AggregationMetrics } from "@/components/aggregation-metrics";
import { AIInsights } from "@/components/ai/ai-insights";
import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { CATEGORY_META } from "@/lib/constants";
import { computeAggregationMetrics } from "@/lib/aggregation";
import { computeCivicInsights } from "@/lib/insights";
import { listCivicCases } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { SEED_ISSUES } from "@/lib/seed-data";
import type { CivicCase, CivicMapMarker } from "@/types";

// Reads live civic cases from Firestore — never statically cache.
export const dynamic = "force-dynamic";

/**
 * Civic Operations Center home.
 *
 * Renders the India map fed by aggregated civic cases (Phase 3). When Firebase
 * is not configured, it falls back to the Phase 1 seed dataset so the map and
 * legend still work (no regression).
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
      }))
    : SEED_ISSUES.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        status: i.status,
        lat: i.location.lat,
        lng: i.location.lng,
        reportCount: 1,
      }));

  const metrics = usingLiveData
    ? computeAggregationMetrics(cases)
    : {
        totalReports: SEED_ISSUES.length,
        totalCases: SEED_ISSUES.length,
        avgReportsPerCase: 1,
      };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex flex-1 flex-col gap-5 py-6">
        <section className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            India Civic Operations Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Citizen reports are automatically aggregated into civic cases.
            Explore them on the map and track resolution status.
            {!usingLiveData && " (Showing demo data.)"}
          </p>
        </section>

        <AggregationMetrics {...metrics} />

        {usingLiveData && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              AI insights
            </h2>
            <AIInsights insights={computeCivicInsights(cases)} />
          </section>
        )}

        <section className="min-h-[480px]">
          <div className="h-[58vh] min-h-[440px] w-full">
            <CivicMap markers={markers} />
          </div>
        </section>

        {usingLiveData && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Civic cases
            </h2>
            <div className="space-y-3">
              {cases.slice(0, 10).map((c) => (
                <CivicCaseCard key={c.id} civicCase={c} />
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
