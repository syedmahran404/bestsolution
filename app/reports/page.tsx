import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { MyReportsList } from "@/components/report/my-reports-list";
import { ReportSubmitted } from "@/components/report/report-submitted";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Reports — Velora Civic AI",
};

/**
 * "My Reports" — isolated per anonymous reporter (U1).
 *
 * The page is a thin shell; the list is a client component that reads the
 * device's reporter id and fetches only that reporter's reports.
 */
export default function ReportsPage({
  searchParams,
}: {
  searchParams?: { submitted?: string; count?: string };
}) {
  const justSubmitted = searchParams?.submitted === "1";
  const voiceCount = Number(searchParams?.count ?? "1");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-3xl flex-1 py-8">
        {justSubmitted && <ReportSubmitted voiceCount={voiceCount} />}

        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-h1">My Reports</h1>
            <p className="text-sm text-muted-foreground">
              Civic issues you submitted from this device.
            </p>
          </div>
          <Button asChild>
            <Link href="/report">
              <FilePlus2 className="mr-2 h-4 w-4" />
              New report
            </Link>
          </Button>
        </div>

        <MyReportsList />
      </main>
    </div>
  );
}
