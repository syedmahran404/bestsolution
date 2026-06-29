import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { ReportForm } from "@/components/report/report-form";
import { getServerT } from "@/lib/i18n/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Report an Issue — Velora Civic AI",
};

/** Phase 2 — Citizen report creation page. */
export default function ReportPage() {
  const t = getServerT();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-2xl flex-1 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-h1">{t("report.heading")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("report.pageHelp")}{" "}
            <Link
              href="/reports"
              className="font-medium text-brand hover:underline"
            >
              {t("report.myReportsLink")}
            </Link>
            .
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("report.cardTitle")}</CardTitle>
            <CardDescription>{t("report.cardDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
