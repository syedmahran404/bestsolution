import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";

/** Resolve the active locale from the cookie (server-side), default English. */
export function getInitialLocale(): Locale {
  try {
    const value = cookies().get(LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Active locale for server components (RSC). Mirrors `getServerT` so server
 * components can bind the locale-aware formatters (`formatDate`/`formatNumber`/
 * `formatRelativeTime` from `@/lib/i18n/format`) to the same request locale the
 * client `useFormatters()` hook uses, keeping server/client output identical.
 */
export function getServerLocale(): Locale {
  return getInitialLocale();
}

/**
 * Server-side translator bound to the request locale (RSC / server components).
 * Mirrors the client `useT()` so server and client render identical strings.
 */
export function getServerT(): (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string {
  const locale = getInitialLocale();
  return (key, vars) => translate(locale, key, vars);
}
