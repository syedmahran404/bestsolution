"use client";

import { useState } from "react";
import { HeartHandshake } from "lucide-react";

import { Celebration } from "@/components/motion/celebration";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — "Your report mattered" moment (Phase 2C, EM3 + EM1).
 *
 * Shown once after a successful submission. Fires a one-shot celebration and
 * presents a warm, human confirmation that the citizen's action had impact —
 * turning the end of the report flow into a memorable, encouraging beat.
 */
export function ReportSubmitted({ voiceCount }: { voiceCount: number }) {
  const t = useT();
  const [celebrate, setCelebrate] = useState(true);

  const ordinal =
    voiceCount === 1
      ? "1st"
      : voiceCount === 2
        ? "2nd"
        : voiceCount === 3
          ? "3rd"
          : `${voiceCount}th`;

  const aggregated = voiceCount > 1;

  return (
    <div
      className={cn(
        "animate-fade-in-up mb-4 overflow-hidden rounded-xl border border-success/30 bg-success/10 p-4",
      )}
    >
      <Celebration
        active={celebrate}
        message="Report submitted!"
        onDone={() => setCelebrate(false)}
      />
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div className="space-y-0.5">
          <p className="font-display text-base font-semibold text-foreground">
            {t("report.submittedTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {aggregated
              ? `You're the ${ordinal} voice on this issue. Every added report makes a civic case harder to ignore — thank you for speaking up.`
              : "Your report was analyzed and started a new civic case. Thank you for helping your community."}
          </p>
        </div>
      </div>
    </div>
  );
}
