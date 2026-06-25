"use client";

import { useMemo, useState } from "react";

import { CivicCaseCard } from "@/components/cases/civic-case-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_META, STATUS_META, WORKFLOW_STATUSES } from "@/lib/constants";
import { REPORT_CATEGORIES } from "@/lib/validation/report";
import type { CivicCase } from "@/types";

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * Civic case management list with client-side Search & Filters (Phase 5):
 * category, status, minimum report count, and start date. Deterministic.
 */
export function CaseFilters({ cases }: { cases: CivicCase[] }) {
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [minReports, setMinReports] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");

  const filtered = useMemo(() => {
    const min = minReports === "" ? 0 : Number(minReports);
    const from = fromDate ? new Date(fromDate).getTime() : null;
    return cases.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (status !== "all" && c.status !== status) return false;
      if (c.reportCount < min) return false;
      if (from !== null && new Date(c.createdAt).getTime() < from) return false;
      return true;
    });
  }, [cases, category, status, minReports, fromDate]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label
            htmlFor="filter-category"
            className="text-xs text-muted-foreground"
          >
            Category
          </Label>
          <select
            id="filter-category"
            className={selectCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="filter-status"
            className="text-xs text-muted-foreground"
          >
            Status
          </Label>
          <select
            id="filter-status"
            className={selectCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {WORKFLOW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-min" className="text-xs text-muted-foreground">
            Min reports
          </Label>
          <Input
            id="filter-min"
            type="number"
            min={0}
            placeholder="0"
            value={minReports}
            onChange={(e) => setMinReports(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="filter-from"
            className="text-xs text-muted-foreground"
          >
            From date
          </Label>
          <Input
            id="filter-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} case{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          No cases match the current filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CivicCaseCard key={c.id} civicCase={c} />
          ))}
        </div>
      )}
    </div>
  );
}
