"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Celebration } from "@/components/motion/celebration";
import { STATUS_META, WORKFLOW_STATUSES } from "@/lib/constants";
import { useT } from "@/lib/i18n/provider";
import type { IssueStatus } from "@/types";

interface StatusManagerProps {
  caseId: string;
  currentStatus: IssueStatus;
}

/**
 * Operations status workflow control (Phase 5). Advances a civic case through
 * Reported → Verified → In Progress → Resolved. PATCHes the API then refreshes
 * the route so all related views update.
 */
export function StatusManager({ caseId, currentStatus }: StatusManagerProps) {
  const t = useT();
  const router = useRouter();
  const [pending, setPending] = useState<IssueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  async function setStatus(status: IssueStatus) {
    if (status === currentStatus || pending) return;
    setPending(status);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? t("statusMgr.updateFailed"));
      }
      // Emotional payoff (EM1): celebrate when a case is resolved.
      if (status === "resolved") setCelebrate(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("statusMgr.updateFailed"),
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-2">
      <Celebration
        active={celebrate}
        message={t("statusMgr.caseResolved")}
        onDone={() => setCelebrate(false)}
      />
      <p className="text-xs font-medium text-muted-foreground">
        {t("statusMgr.updateStatus")}
      </p>
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_STATUSES.map((s) => {
          const active = s === currentStatus;
          return (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              disabled={Boolean(pending)}
              onClick={() => setStatus(s)}
              style={
                active ? { backgroundColor: STATUS_META[s].hex } : undefined
              }
            >
              {pending === s && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {t(`statuses.${s}`)}
            </Button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
