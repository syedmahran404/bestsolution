import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { MyReportsList } from "@/components/report/my-reports-list";
import { InfoBanner } from "@/components/brand";
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
  const ordinal =
    voiceCount === 1
      ? "1st"
      : voiceCount === 2
        ? "2nd"
        : voiceCount === 3
          ? "3rd"
          : `${voiceCount}th`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-3xl flex-1 py-8">
        {justSubmitted && (
          <div className="mb-4">
            <InfoBanner tone="success" title="Report submitted">
              {voiceCount > 1
                ? `You're the ${ordinal} voice on this issue. Your report strengthened an existing civic case, making it harder to ignore.`
                : "Your report was analyzed and started a new civic case."}
            </InfoBanner>
          </div>
        )}

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
