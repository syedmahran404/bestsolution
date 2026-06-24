import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, MapPin } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { CivicMap } from "@/components/map/civic-map";
import { ReportCard } from "@/components/report/report-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { getCivicCase, getReportsForCase } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { CivicMapMarker } from "@/types";

export const dynamic = "force-dynamic";

/** Phase 3 — read-only civic case detail screen. */
export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isFirebaseAdminConfigured) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container max-w-3xl flex-1 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Backend not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY to view
            civic cases.
          </p>
        </main>
      </div>
    );
  }

  const civicCase = await getCivicCase(params.id);
  if (!civicCase) notFound();

  const reports = await getReportsForCase(params.id);
  const category = CATEGORY_META[civicCase.category];
  const status = STATUS_META[civicCase.status];

  const markers: CivicMapMarker[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    lat: r.latitude,
    lng: r.longitude,
    reportCount: 1,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-3xl flex-1 space-y-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to map
        </Link>

        {/* Case summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: status.hex }}
              >
                {civicCase.reportCount > 99 ? "99+" : civicCase.reportCount}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {category.glyph} {category.label} case
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {civicCase.reportCount > 1 && (
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3 w-3" />
                      Aggregated · {civicCase.reportCount} reports
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    style={{ borderColor: status.hex, color: status.hex }}
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Metric label="Reports" value={String(civicCase.reportCount)} />
            <Metric label="Category" value={category.label} />
            <Metric label="Status" value={status.label} />
            <Metric
              label="Center"
              value={`${civicCase.centerLocation.lat.toFixed(4)}, ${civicCase.centerLocation.lng.toFixed(4)}`}
            />
            <Metric
              label="Created"
              value={new Date(civicCase.createdAt).toLocaleDateString("en-IN")}
            />
            <Metric
              label="Updated"
              value={new Date(civicCase.updatedAt).toLocaleDateString("en-IN")}
            />
          </CardContent>
        </Card>

        {/* Member report locations */}
        <section className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold">
            <MapPin className="h-5 w-5" />
            Locations
          </h2>
          <div className="h-[40vh] min-h-[280px] w-full">
            <CivicMap markers={markers} />
          </div>
        </section>

        {/* Linked reports */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Linked reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No linked reports found.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
