import { SiteHeader } from "@/components/site-header";
import { CivicMap } from "@/components/map/civic-map";
import { Card } from "@/components/ui/card";
import { STATUS_META } from "@/lib/constants";
import { SEED_ISSUES } from "@/lib/seed-data";

/**
 * Phase 1 landing page — the Civic Operations Center shell.
 *
 * Server component: computes lightweight stats from the seeded dataset and
 * renders the interactive India map (client). Live Firestore data replaces the
 * seed source in later phases without changing this layout.
 */
export default function HomePage() {
  const issues = SEED_ISSUES;

  const stats = {
    total: issues.length,
    open: issues.filter((i) => STATUS_META[i.status].group === "open").length,
    progress: issues.filter((i) => STATUS_META[i.status].group === "progress")
      .length,
    resolved: issues.filter((i) => STATUS_META[i.status].group === "resolved")
      .length,
  };

  const statCards = [
    { label: "Total Issues", value: stats.total, hex: "#0f172a" },
    { label: "Open", value: stats.open, hex: "#ef4444" },
    { label: "In Progress", value: stats.progress, hex: "#f59e0b" },
    { label: "Resolved", value: stats.resolved, hex: "#22c55e" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex flex-1 flex-col gap-5 py-6">
        <section className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            India Civic Operations Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Live view of reported civic issues across India. Explore, zoom, and
            track resolution status.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.hex }}
                />
                <p className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
            </Card>
          ))}
        </section>

        <section className="min-h-[480px] flex-1">
          <div className="h-[60vh] min-h-[480px] w-full">
            <CivicMap issues={issues} />
          </div>
        </section>
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-xs text-muted-foreground">
          Velora Civic AI · Built for the Vibe2Ship Hackathon · Phase 1
          Foundation
        </div>
      </footer>
    </div>
  );
}
