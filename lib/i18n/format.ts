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
  try {
    return new Date(iso).toLocaleString(INTL_LOCALE[locale], opts);
  } catch {
    return iso;
  }
}

/** Locale-aware number formatting. */
export function formatNumber(value: number, locale: Locale): string {
  try {
    return value.toLocaleString(INTL_LOCALE[locale]);
  } catch {
    return String(value);
  }
}
