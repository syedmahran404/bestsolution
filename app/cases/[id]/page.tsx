import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, MapPin } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { CivicMap } from "@/components/map/civic-map";
import { ReportCard } from "@/components/report/report-card";
import { AIReasoningPanel } from "@/components/ai/ai-reasoning-panel";
import { CaseSummaryCard } from "@/components/ai/case-summary-card";
import { ContextCard } from "@/components/context/context-card";
import { OperationsBriefPanel } from "@/components/operations/operations-brief-panel";
import { PriorityPanel } from "@/components/operations/priority-panel";
import { TransparencyPanel } from "@/components/operations/transparency-panel";
import { OperationsTimeline } from "@/components/operations/operations-timeline";
import { EscalationCard } from "@/components/cases/escalation-card";
import { StatusManager } from "@/components/cases/status-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGGREGATION_RADIUS_M,
  CATEGORY_META,
  STATUS_META,
} from "@/lib/constants";
import { getCivicCase, getReportsForCase } from "@/lib/civic-cases";
import { getOrGenerateCaseIntelligence } from "@/lib/ai/case-intelligence";
import { getOrGenerateOperationsBrief } from "@/lib/ai/operations-brief";
import {
  buildOperationsTimeline,
  computeCaseCommunityImpact,
  computePriority,
  recommendAction,
} from "@/lib/operations";
import { explainLinkage } from "@/lib/insights";
import { buildEscalationDraft } from "@/lib/escalation";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import {
  Users,
  Building2,
  School,
  Bus,
  MapPin as MapPinIcon,
} from "lucide-react";
import type { CivicMapMarker, ContextFactor } from "@/types";

export const dynamic = "force-dynamic";

/** Phase 5 — operational civic case view (read + status workflow). */
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
  if (!civicCase) return notFound();

  const reports = await getReportsForCase(params.id);
  const category = CATEGORY_META[civicCase.category];
  const status = STATUS_META[civicCase.status];
  const intelligence = await getOrGenerateCaseIntelligence(civicCase, reports);
  const linkage = explainLinkage(civicCase);

  // U3 — agentic operations layer (priority + recommendation are deterministic;
  // the brief is a cached AI synthesis with a deterministic fallback).
  const priority = computePriority(civicCase, reports);
  const recommendation = recommendAction(civicCase, priority);
  const opsBrief = await getOrGenerateOperationsBrief(
    civicCase,
    reports,
    priority,
    recommendation,
  );
  const timeline = buildOperationsTimeline(civicCase, reports);
  const impact = computeCaseCommunityImpact(civicCase, reports);
  const escalation = buildEscalationDraft(civicCase, reports, priority);

  const markers: CivicMapMarker[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    lat: r.latitude,
    lng: r.longitude,
    reportCount: 1,
    severityLabel: r.severityLabel,
    locality: r.locality ?? null,
  }));

  // U2: aggregate member context for the case-level context card.
  const repBySeverity = [...reports].sort(
    (a, b) => (b.severityScore ?? 0) - (a.severityScore ?? 0),
  )[0];
  const aggFactors: ContextFactor[] = (() => {
    const byType = new Map<string, ContextFactor>();
    for (const r of reports) {
      for (const f of r.contextFactors ?? []) {
        const ex = byType.get(f.type);
        if (!ex || f.distanceM < ex.distanceM) byType.set(f.type, f);
      }
    }
    return Array.from(byType.values()).sort(
      (a, b) => a.distanceM - b.distanceM,
    );
  })();

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

        {/* AI case intelligence */}
        <CaseSummaryCard
          summary={intelligence.summary}
          impact={intelligence.impact}
        />

        {/* Civic context (U2) */}
        <ContextCard
          locality={civicCase.locality ?? repBySeverity?.locality}
          district={civicCase.district ?? repBySeverity?.district}
          state={repBySeverity?.state}
          formattedAddress={repBySeverity?.formattedAddress}
          factors={aggFactors}
          severityScore={
            civicCase.severityScore ?? repBySeverity?.severityScore
          }
          severityLabel={
            civicCase.severityLabel ?? repBySeverity?.severityLabel
          }
          severityReasons={repBySeverity?.severityReasons}
          source={repBySeverity?.contextSource}
        />

        {/* U3: agentic operations brief (explainable) */}
        <OperationsBriefPanel brief={opsBrief} />

        {/* U3: explainable prioritization + recommendation */}
        <PriorityPanel priority={priority} recommendation={recommendation} />

        {/* U4: decision transparency + community impact */}
        <TransparencyPanel
          priority={priority}
          recommendation={recommendation}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Users className="h-4 w-4" />
              Community impact (estimate)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ImpactStat
                icon={Users}
                label="People affected"
                value={`~${impact.people.toLocaleString()}`}
              />
              <ImpactStat
                icon={School}
                label="Schools nearby"
                value={String(impact.schools)}
              />
              <ImpactStat
                icon={Building2}
                label="Hospitals nearby"
                value={String(impact.hospitals)}
              />
              <ImpactStat
                icon={Bus}
                label="Transit nearby"
                value={String(impact.transit)}
              />
              <ImpactStat
                icon={Building2}
                label="Businesses nearby"
                value={String(impact.businesses)}
              />
              <ImpactStat
                icon={MapPinIcon}
                label="Impact radius"
                value={`${impact.radiusM} m`}
              />
            </div>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {impact.reasons.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Operations: status workflow + timeline + aggregation info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusManager
                caseId={civicCase.id}
                currentStatus={civicCase.status}
              />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Operations timeline
                </p>
                <OperationsTimeline events={timeline} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Aggregation information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Metric
                label="Reports aggregated"
                value={String(civicCase.reportCount)}
              />
              <Metric
                label="Clustering radius"
                value={`${AGGREGATION_RADIUS_M} m`}
              />
              <Metric
                label="Centroid"
                value={`${civicCase.centerLocation.lat.toFixed(4)}, ${civicCase.centerLocation.lng.toFixed(4)}`}
              />
              <Metric label="Category" value={category.label} />
              <div className="col-span-2 flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{linkage}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* U4: one-tap escalation */}
        <EscalationCard draft={escalation} />

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
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="space-y-2">
                  <ReportCard report={r} />
                  <AIReasoningPanel
                    analysis={r.aiAnalysis}
                    userCategory={r.category}
                  />
                </div>
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

function ImpactStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
