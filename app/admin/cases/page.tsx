import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { CaseFilters } from "@/components/admin/case-filters";
import { listCivicCases } from "@/lib/civic-cases";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { CivicCase } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Civic Case Management — Velora Civic AI" };

/** Phase 5 — Civic case management with search & filters. */
export default async function AdminCasesPage() {
  let cases: CivicCase[] = [];
  if (isFirebaseAdminConfigured) {
    try {
      cases = await listCivicCases();
    } catch (err) {
      console.error("[admin/cases] failed to load:", err);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container max-w-4xl flex-1 space-y-5 py-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Operations Center
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Civic Case Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Search and filter civic cases. Open a case to inspect reports, AI
            analysis, and manage its status.
          </p>
        </div>

        {!isFirebaseAdminConfigured ? (
          <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
            Backend not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY to load
            cases.
          </p>
        ) : (
          <CaseFilters cases={cases} />
        )}
      </main>
    </div>
  );
}
