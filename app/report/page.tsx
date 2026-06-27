import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { ReportForm } from "@/components/report/report-form";
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
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-2xl flex-1 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-h1">Report an issue</h1>
          <p className="text-sm text-muted-foreground">
            Help your community. Add a photo or voice note, mark the location,
            and submit. You can track it on{" "}
            <Link
              href="/reports"
              className="font-medium text-brand hover:underline"
            >
              My Reports
            </Link>
            .
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New civic report</CardTitle>
            <CardDescription>
              All fields marked optional can be skipped, but a photo or voice
              note helps resolve issues faster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
