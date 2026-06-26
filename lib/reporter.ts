"use client";

/**
 * Anonymous reporter identity (U1 — Integrity & Credibility Hardening).
 *
 * Generates and persists a stable, anonymous reporter id in localStorage so a
 * citizen can see *their own* reports without any login or PII. An optional
 * display name enables "identified" reporting. No personal data leaves the
 * device unless the user explicitly provides a name.
 */

const ID_KEY = "velora.reporterId";
const NAME_KEY = "velora.reporterName";

function randomId(): string {
  // Prefer the platform UUID; fall back for older browsers.
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Get (or lazily create) the persistent anonymous reporter id. */
export function getReporterId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(ID_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(ID_KEY, id);
  }
  return id;
}

/** Get the saved reporter display name (empty string = anonymous). */
export function getReporterName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

/** Persist (or clear) the reporter display name. */
export function setReporterName(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (trimmed) {
    window.localStorage.setItem(NAME_KEY, trimmed);
  } else {
    window.localStorage.removeItem(NAME_KEY);
  }
}
