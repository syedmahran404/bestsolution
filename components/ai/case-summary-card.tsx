import { Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CaseSummaryCardProps {
  summary: string;
  impact: string;
}

/** AI-generated civic case summary + community impact (Phase 4, Feature 5). */
export function CaseSummaryCard({ summary, impact }: CaseSummaryCardProps) {
  return (
    <Card className="border-violet-200 bg-violet-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-base text-violet-900">
          <Sparkles className="h-4 w-4" />
          AI Case Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-slate-800">{summary}</p>
        <p className="flex items-start gap-1.5 text-muted-foreground">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-medium text-slate-700">
              Community impact:
            </span>{" "}
            {impact}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
