import { Sparkles, Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_META } from "@/lib/constants";
import type { AIAnalysis, IssueCategory } from "@/types";

interface AIReasoningPanelProps {
  analysis?: AIAnalysis | null;
  /** The category the citizen selected — shown for comparison. */
  userCategory: IssueCategory;
}

/**
 * Visible AI reasoning (Phase 4, Feature 3). Surfaces exactly why the AI
 * classified a report — category, confidence, reasoning, detected keywords,
 * summary, and voice transcript. Renders nothing when no analysis exists
 * (e.g. Gemini not configured) to keep lists clean.
 */
export function AIReasoningPanel({
  analysis,
  userCategory,
}: AIReasoningPanelProps) {
  if (!analysis) return null;

  const aiCat = CATEGORY_META[analysis.category];
  const disagrees = analysis.category !== userCategory;
  const confidencePct = Math.round(analysis.confidence * 100);

  return (
    <div className="rounded-md border border-violet-200 bg-violet-50/60 p-3 text-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-semibold text-violet-900">
          <Sparkles className="h-4 w-4" />
          AI Analysis
        </span>
        <Badge variant="secondary">{confidencePct}% confidence</Badge>
      </div>

      <div className="space-y-1.5 text-slate-700">
        <p>
          <span className="font-medium">Category:</span> {aiCat.glyph}{" "}
          {aiCat.label}
          {disagrees && (
            <span className="text-xs text-muted-foreground">
              {" "}
              (citizen selected {CATEGORY_META[userCategory].label})
            </span>
          )}
        </p>

        <p>
          <span className="font-medium">Reasoning:</span> {analysis.reasoning}
        </p>

        {analysis.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium">Detected:</span>
            {analysis.keywords.map((k) => (
              <Badge key={k} variant="outline" className="font-normal">
                {k}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-muted-foreground">{analysis.summary}</p>

        {analysis.transcript && (
          <div className="mt-1 flex gap-1.5 rounded bg-white/70 p-2 text-xs text-slate-600">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-medium">Voice transcript:</span>{" "}
              {analysis.transcript}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
