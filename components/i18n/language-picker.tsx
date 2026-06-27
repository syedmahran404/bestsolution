"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * First-launch language picker (V3 Phase 1). Shown once, only when the visitor
 * has no stored locale preference (no cookie / localStorage). Choosing a
 * language persists it via the provider and dismisses the modal. Fail-open:
 * any storage error simply skips the modal (English default still applies).
 */
export function LanguagePicker() {
  const { locale, setLocale, t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(LOCALE_COOKIE) ??
        document.cookie
          .split("; ")
          .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
          ?.split("=")[1];
      if (!stored) setShow(true);
    } catch {
      /* fail open: do not block first paint */
    }
  }, []);

  if (!show) return null;

  function choose(code: Locale) {
    setLocale(code);
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("lang.choose")}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-elevated">
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="bg-gradient-brand mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-brand-foreground shadow-sm">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("lang.choose")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("lang.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {LOCALES.map((l) => {
            const selected = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => choose(l.code)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-accent"
                    : "hover:border-primary/40 hover:bg-accent",
                )}
              >
                <span className="text-base font-medium">{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => choose(locale)}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("lang.continue")}
        </button>
      </div>
    </div>
  );
}
