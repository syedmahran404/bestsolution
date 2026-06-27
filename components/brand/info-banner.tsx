import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — InfoBanner (Phase 2A, BD8).
 *
 * Inline contextual message in four semantic tones. Soft-tinted background with
 * a same-hue icon and foreground body text (AA-safe). Replaces the bespoke
 * amber/destructive notice blocks scattered across forms.
 */
type Tone = "info" | "success" | "warning" | "critical";

const TONE: Record<Tone, { icon: LucideIcon; wrap: string; icon_cls: string }> =
  {
    info: {
      icon: Info,
      wrap: "border-info/30 bg-info/10",
      icon_cls: "text-info",
    },
    success: {
      icon: CheckCircle2,
      wrap: "border-success/30 bg-success/10",
      icon_cls: "text-success",
    },
    warning: {
      icon: AlertTriangle,
      wrap: "border-warning/35 bg-warning/12",
      icon_cls: "text-warning",
    },
    critical: {
      icon: XCircle,
      wrap: "border-critical/30 bg-critical/10",
      icon_cls: "text-critical",
    },
  };

interface InfoBannerProps {
  tone?: Tone;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({
  tone = "info",
  title,
  children,
  className,
}: InfoBannerProps) {
  const t = TONE[tone];
  const IconGlyph = t.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border p-3 text-sm text-foreground",
        t.wrap,
        className,
      )}
      role={tone === "critical" || tone === "warning" ? "alert" : "status"}
    >
      <IconGlyph className={cn("mt-0.5 h-4 w-4 shrink-0", t.icon_cls)} />
      <div className="space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
