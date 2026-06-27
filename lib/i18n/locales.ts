/**
 * Velora multilingual foundation (V3 Phase 1).
 *
 * Six production locales. The provider is intentionally lightweight and
 * dependency-free (fail-open, no route/middleware changes) so it is safe to
 * ship without a build environment; its catalog shape mirrors next-intl, so a
 * later migration is a drop-in. See lib/i18n/provider.tsx.
 */
export const LOCALES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "velora.locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value);
}

/** BCP-47 tag for Intl date/number formatting per locale. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
};
