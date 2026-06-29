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
import { StatusBadge } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AGGREGATION_RADIUS_M,
  CATEGORY_META,
  STATUS_META,
} from "@/lib/constants";
import { getCivicCase, getReportsForCase } from "@/lib/civic-cases";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import { formatDate, formatNumber } from "@/lib/i18n/format";
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
  const t = getServerT();
  const locale = getServerLocale();

  if (!isFirebaseAdminConfigured) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container max-w-3xl flex-1 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {t("caseDetail.backendNotConfigured")}
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
  const statusCircle = {
    open: "bg-status-open",
    progress: "bg-status-progress",
    resolved: "bg-status-resolved",
  }[status.group];
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
          {t("caseDetail.backToMap")}
        </Link>

        {/* Case summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
                  statusCircle,
                )}
              >
                {civicCase.reportCount > 99 ? "99+" : civicCase.reportCount}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {category.glyph}{" "}
                  {t("caseDetail.caseTitle", {
                    category: t(`categories.${civicCase.category}`),
                  })}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {civicCase.reportCount > 1 && (
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3 w-3" />
                      {t("caseDetail.aggregatedReports", {
                        n: formatNumber(civicCase.reportCount, locale),
                      })}
                    </Badge>
                  )}
                  <StatusBadge status={civicCase.status} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Metric
              label={t("caseDetail.metricReports")}
              value={formatNumber(civicCase.reportCount, locale)}
            />
            <Metric
              label={t("caseDetail.metricCategory")}
              value={t(`categories.${civicCase.category}`)}
            />
            <Metric
              label={t("caseDetail.metricStatus")}
              value={t(`statuses.${civicCase.status}`)}
            />
            <Metric
              label={t("caseDetail.metricCenter")}
              value={`${civicCase.centerLocation.lat.toFixed(4)}, ${civicCase.centerLocation.lng.toFixed(4)}`}
            />
            <Metric
              label={t("caseDetail.metricCreated")}
              value={formatDate(civicCase.createdAt, locale, {
                dateStyle: "medium",
              })}
            />
            <Metric
              label={t("caseDetail.metricUpdated")}
              value={formatDate(civicCase.updatedAt, locale, {
                dateStyle: "medium",
              })}
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
              {t("caseDetail.communityImpact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ImpactStat
                icon={Users}
                label={t("caseDetail.peopleAffected")}
                value={`~${formatNumber(impact.people, locale)}`}
              />
              <ImpactStat
                icon={School}
                label={t("caseDetail.schoolsNearby")}
                value={formatNumber(impact.schools, locale)}
              />
              <ImpactStat
                icon={Building2}
                label={t("caseDetail.hospitalsNearby")}
                value={formatNumber(impact.hospitals, locale)}
              />
              <ImpactStat
                icon={Bus}
                label={t("caseDetail.transitNearby")}
                value={formatNumber(impact.transit, locale)}
              />
              <ImpactStat
                icon={Building2}
                label={t("caseDetail.businessesNearby")}
                value={formatNumber(impact.businesses, locale)}
              />
              <ImpactStat
                icon={MapPinIcon}
                label={t("caseDetail.impactRadius")}
                value={`${formatNumber(impact.radiusM, locale)} m`}
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
              <CardTitle className="text-base">
                {t("caseDetail.operations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusManager
                caseId={civicCase.id}
                currentStatus={civicCase.status}
              />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("caseDetail.operationsTimeline")}
                </p>
                <OperationsTimeline events={timeline} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("caseDetail.aggregationInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Metric
                label={t("caseDetail.reportsAggregated")}
                value={formatNumber(civicCase.reportCount, locale)}
              />
              <Metric
                label={t("caseDetail.clusteringRadius")}
                value={`${formatNumber(AGGREGATION_RADIUS_M, locale)} m`}
              />
              <Metric
                label={t("caseDetail.centroid")}
                value={`${civicCase.centerLocation.lat.toFixed(4)}, ${civicCase.centerLocation.lng.toFixed(4)}`}
              />
              <Metric
                label={t("caseDetail.metricCategory")}
                value={t(`categories.${civicCase.category}`)}
              />
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
          <h2 className="flex items-center gap-1.5 text-h3">
            <MapPin className="h-5 w-5 text-brand" />
            {t("caseDetail.locations")}
          </h2>
          <div className="h-[40vh] min-h-[280px] w-full">
            <CivicMap markers={markers} />
          </div>
        </section>

        {/* Linked reports */}
        <section className="space-y-3">
          <h2 className="text-h3">
            {t("caseDetail.linkedReports", {
              n: formatNumber(reports.length, locale),
            })}
          </h2>

          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("caseDetail.noLinkedReports")}
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
