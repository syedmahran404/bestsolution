import { INTL_LOCALE, type Locale } from "@/lib/i18n/locales";

/** Locale-aware date formatting. */
export function formatDate(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
): string {
  if (Number.isNaN(new Date(iso).getTime())) return iso;
  try {
    return new Date(iso).toLocaleString(INTL_LOCALE[locale], opts);
  } catch {
    return iso;
  }
}

/** Locale-aware number formatting. */
export function formatNumber(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return String(value);
  try {
    return value.toLocaleString(INTL_LOCALE[locale]);
  } catch {
    return String(value);
  }
}

/**
 * Locale-aware relative time (e.g. "3 hours ago", "in 2 days") using the
 * native Intl.RelativeTimeFormat. Picks the largest sensible unit. Falls back
 * to an absolute date string on any error.
 */
export function formatRelativeTime(iso: string, locale: Locale): string {
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;
    const diffSec = Math.round((then - Date.now()) / 1000);
    const abs = Math.abs(diffSec);
    const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], {
      numeric: "auto",
    });
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
      ["year", 31536000],
      ["month", 2592000],
      ["week", 604800],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
      ["second", 1],
    ];
    for (const [unit, secs] of units) {
      if (abs >= secs || unit === "second") {
        return rtf.format(Math.round(diffSec / secs), unit);
      }
    }
    return formatDate(iso, locale);
  } catch {
    return iso;
  }
}
