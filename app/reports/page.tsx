import Link from "next/link";
import { FilePlus2, Inbox } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ReportCard } from "@/components/report/report-card";
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
export default async function ReportsPage() {
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-3xl flex-1 py-8">
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
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
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
