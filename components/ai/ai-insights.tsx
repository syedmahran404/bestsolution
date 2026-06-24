import Link from "next/link";
import { Flame, Layers, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import type { CivicInsights } from "@/lib/insights";

/**
 * AI Insights cards (Phase 4, Feature 6) — most common issue, largest civic
 * case, and recently growing cases. Computed deterministically from the
 * aggregation data (no Gemini calls). Not a full analytics dashboard.
 */
export function AIInsights({ insights }: { insights: CivicInsights }) {
  const { mostCommonCategory, largestCase, growingCases } = insights;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {/* Most common issue type */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Most common issue
          </p>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </div>
        {mostCommonCategory ? (
          <>
            <p className="mt-1 text-lg font-bold">
              {CATEGORY_META[mostCommonCategory.category].glyph}{" "}
              {CATEGORY_META[mostCommonCategory.category].label}
            </p>
            <p className="text-xs text-muted-foreground">
              {mostCommonCategory.caseCount} case
              {mostCommonCategory.caseCount === 1 ? "" : "s"}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No data yet</p>
        )}
      </Card>

      {/* Largest civic case */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Largest civic case
          </p>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </div>
        {largestCase ? (
          <Link href={`/cases/${largestCase.id}`} className="hover:underline">
            <p className="mt-1 text-lg font-bold">
              {largestCase.reportCount} reports
            </p>
            <p className="text-xs text-muted-foreground">
              {CATEGORY_META[largestCase.category].label}
            </p>
          </Link>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No data yet</p>
        )}
      </Card>

      {/* Recently growing cases */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Recently growing
          </p>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        {growingCases.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {growingCases.map((c) => (
              <li key={c.id} className="text-sm">
                <Link href={`/cases/${c.id}`} className="hover:underline">
                  {CATEGORY_META[c.category].glyph}{" "}
                  {CATEGORY_META[c.category].label} · {c.reportCount}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            No multi-report cases yet
          </p>
        )}
      </Card>
    </div>
  );
}
