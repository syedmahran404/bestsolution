"use client";

import { useState } from "react";
import { Megaphone, Copy, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/provider";
import type { EscalationDraft } from "@/lib/escalation";

/**
 * One-tap escalation (U4). Shows a deterministically-drafted formal complaint
 * to the recommended department; the citizen can copy it or open it in email.
 */
export function EscalationCard({ draft }: { draft: EscalationDraft }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Megaphone className="h-4 w-4" />
            {t("escalation.title")}
          </CardTitle>
          <Badge variant="secondary">
            {t("escalation.to", { department: draft.department })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
          {draft.body}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={copy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> {t("escalation.copied")}
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />{" "}
                {t("escalation.copyComplaint")}
              </>
            )}
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={mailto}>
              <Mail className="mr-1.5 h-4 w-4" /> {t("escalation.openInEmail")}
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("escalation.disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
