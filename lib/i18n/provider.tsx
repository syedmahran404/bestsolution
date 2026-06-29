"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/lib/i18n/format";

type TVars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  t: (key: MessageKey, vars?: TVars) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Lightweight, fail-open i18n provider. Seeded with the server-resolved locale
 * (from the cookie) to avoid a flash, persists choice to cookie + localStorage,
 * and updates <html lang>. Missing keys fall back to English, then the key.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
      localStorage.setItem(LOCALE_COOKIE, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: TVars) => translate(locale, key, vars),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Access the full i18n context (locale + t + setLocale). */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fail open: usable even if a component renders outside the provider.
    return {
      locale: DEFAULT_LOCALE,
      t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
      setLocale: () => {},
    };
  }
  return ctx;
}

/** Convenience translate hook. */
export function useT(): (key: MessageKey, vars?: TVars) => string {
  return useI18n().t;
}

/** Locale-bound formatters (date / number / relative time). */
export function useFormatters() {
  const { locale } = useI18n();
  return {
    formatDate: (iso: string, opts?: Intl.DateTimeFormatOptions) =>
      formatDate(iso, locale, opts),
    formatNumber: (value: number) => formatNumber(value, locale),
    formatRelativeTime: (iso: string) => formatRelativeTime(iso, locale),
  };
}
