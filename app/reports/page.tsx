import Link from "next/link";
import { CheckCircle2, FilePlus2, Inbox } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ReportCard } from "@/components/report/report-card";
import { AIReasoningPanel } from "@/components/ai/ai-reasoning-panel";
import { Button } from "@/components/ui/button";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { listReports } from "@/lib/reports";
import type { CivicReport } from "@/types";

// Reports are live user data — never statically cache this page.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Reports — Velora Civic AI",
};

/** Phase 2 — submitted reports listing. */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { submitted?: string };
}) {
  let reports: CivicReport[] = [];
  let loadError = false;

  if (isFirebaseAdminConfigured) {
    try {
      reports = await listReports();
    } catch (err) {
      console.error("[reports/page] failed to load reports:", err);
      loadError = true;
    }
  }

  const justSubmitted = searchParams?.submitted === "1";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-3xl flex-1 py-8">
        {justSubmitted && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p>
              Report submitted and analyzed. It has been added to a civic case.
            </p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
            <p className="text-sm text-muted-foreground">
              Civic issues submitted to Velora.
            </p>
          </div>
          <Button asChild>
            <Link href="/report">
              <FilePlus2 className="mr-2 h-4 w-4" />
              New report
            </Link>
          </Button>
        </div>

        {!isFirebaseAdminConfigured ? (
          <EmptyState
            title="Backend not configured"
            body="Set FIREBASE_SERVICE_ACCOUNT_KEY to enable saving and listing reports."
          />
        ) : loadError ? (
          <EmptyState
            title="Couldn't load reports"
            body="Something went wrong fetching reports. Please try again later."
          />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            body="Be the first to report a civic issue in your community."
          />
        ) : (
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
        )}
      </main>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
