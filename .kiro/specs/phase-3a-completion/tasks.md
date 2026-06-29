# Implementation Plan: Phase 3A Completion

## Overview

This is a **gap-closing** plan, not a from-scratch build, and it is now sequenced
**hackathon-first**: visible, user-facing improvements are front-loaded so a judge
sees a fully polished, fully multilingual product first, and internal tooling and
tests are deferred to the end. Phase 3A is already substantially implemented and
working. Every task below targets only the gaps identified in the design's
per-requirement Gap Analysis and MUST preserve all existing working behavior: the
fail-open i18n provider, compile-time catalog typing, English fallback, the pure
in-memory zero-network search core, the single per-session case fetch, the
keyboard-navigable language selector, and cookie + localStorage persistence.

The implementation language is **TypeScript** (matching the existing codebase).

The work is ordered by demo impact:

1. **Priority 1 — Complete Localization (do first):** eliminate every mixed-language
   screen. Grow and translate the catalog to target size with key-set parity and
   wire `t()`/`getServerT()` into all remaining components and `/cases/[id]` so no
   heading, button, dialog, empty state, error, form, report, or case page shows
   untranslated text in any of the six locales. (Requirements 1, 3)
2. **Priority 2 — Complete Global Search:** report/case/locality/category/status
   search, AI mode, suggestions, recent and popular searches, keyboard navigation,
   accessibility, fast ranking, correct highlighting, reachable everywhere.
   (Requirements 6, 7, 8, 9, 10)
3. **Priority 3 — Premium Language Selector:** native scripts, searchable list,
   keyboard nav, mobile + desktop, accessibility, persistence, smooth UX.
   (Requirement 11)
4. **Priority 4 — Localized Formatting:** dates, numbers, and relative times across
   every supported locale wired into all primary screens. (Requirement 4)
5. **Priority 5 — Raw-String Lint Guard:** `scripts/check-i18n.mjs` chained into
   `npm run lint` so the zero-mixed-language guarantee cannot regress. (Requirement 5)
6. **Priority 6 — Quality Verification:** only after all user-facing features are
   complete, run the full Verification_Suite and fix any failure at the root.
   (Requirement 13)
7. **Priority 7 — Engineering Improvements (only if time remains):** Vitest +
   fast-check harness, property-based tests, and additional internal tests. These are
   all marked optional with `*` and intentionally placed last; they should only be
   done after every visible Phase 3A feature is complete. The two small
   correctness-hardening *implementation* steps (interpolation safety, format
   fallback totality) stay next to the user-facing work they underpin (Priorities 1
   and 4); only their property **tests** live here.

Guiding rules:
- Extend existing systems; do not recreate already-complete functionality.
- Add net-new code only where a required capability does not yet exist (report group,
  AI mode, i18n guard, recent/popular/clamp helpers).
- Each property test (Priority 7) implements a single Correctness Property from the
  design at ≥100 iterations, tagged `Feature: phase-3a-completion, Property {n}: ...`,
  and keeps its `Property N / Validates: Requirements` annotation.

## Tasks

### Priority 1 — Complete Localization (highest, do first)

- [x] 1. Eliminate every mixed-language screen
  - [x] 1.1 Make `translate` interpolation injection-safe and total
    - In `lib/i18n/messages.ts`, replace the `RegExp`-based interpolation with `split('{k}').join(String(v))` so arbitrary keys and `$`-bearing values are treated literally
    - Preserve the existing fallback chain `CATALOGS[locale]?.[key] ?? en[key] ?? key` and the "unsupplied placeholder left intact" behavior
    - This hardening underpins all localized rendering, so it lands with the localization work
    - _Requirements: 2.3, 2.4, 2.6_

  - [x] 1.2 Grow and translate the message catalog with key-set parity
    - In `lib/i18n/messages.ts`, add message keys for the literals found on every Primary_Screen and the un-wired `components/**` (admin charts/metrics, case cards, map legend/filters, AI panels, civic insight cards) and `/cases/[id]`
    - Grow the English catalog to between 250 and 400 keys (inclusive); add translations for `hi`, `kn`, `bn`, `mr`, `te` for every new key with non-empty values, keeping exact key-set parity (enforced by the `Messages` type)
    - Render locale values (never substitute English for keys that exist in the locale)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.3 Replace hardcoded literals with `t()` in all remaining `components/**`
    - Wire `t()`/`getServerT()` into admin charts/metrics, case cards, map legend/filters, AI panels, and civic insight cards using the keys added in 1.2, so no heading, button, dialog, empty state, error, or form shows untranslated text
    - _Requirements: 3.1, 3.2_

  - [x] 1.4 Localize the case detail screen `/cases/[id]` (strings)
    - Wire `t()`/`getServerT()` into `app/cases/[id]/page.tsx` so all user-facing strings render in the active locale (formatter wiring for this screen is completed in Priority 4)
    - _Requirements: 3.1, 3.2_

### Priority 2 — Complete Global Search

- [x] 2. Ship product-grade global search everywhere
  - [x] 2.1 Extend the search ranking core (report group + AI mode)
    - In `lib/search/index.ts`, add `report` to `SearchGroup` and `ai` to `SearchMode`; set `MODE_GROUPS` so `problem → [case, report]`, `location → [locality]`, `category → [category]`, `status → [status]`, `ai → [case]`, `all → null`
    - Add the `aiMatchable` flag to `SearchItem` so AI mode restricts case matches to AI-derived fields (summary + keywords); keep `rankItems` (≤24, indexed-only, non-increasing score) and `highlightSegments` algorithms unchanged
    - _Requirements: 7.1, 8.1, 8.2, 8.4_

  - [x] 2.2 Implement `lib/search/recent.ts`
    - Pure `addRecentSearch(list, rawQuery)`: trim, ignore length <2 or >100, case-insensitive dedup with move-to-front, cap 6, most-recent-first
    - Thin storage wrappers `loadRecentSearches`/`saveRecentSearches`/`clearRecentSearches` wrapped in try/catch (read → `[]`, write/clear → no-op)
    - _Requirements: 9.3, 9.4, 9.6_

  - [x] 2.3 Implement the `popularItems` helper
    - Pure helper (in `lib/search/popular.ts`) ordering by ascending group priority, then descending count, then case-insensitive ascending label; cap 6
    - _Requirements: 9.1_

  - [x] 2.4 Implement the shared selection-index clamp helper
    - Pure helper (in its own module) used by both search and the language selector: move ±1 in the requested direction, clamp to `[0, length-1]`, never wrap
    - _Requirements: 10.2, 11.6_

  - [x] 2.5 Complete the command palette results, modes, recent/popular
    - In `components/search/command-palette.tsx`, build `report` items from citizen reports in the in-memory index; add the sixth (`ai`) mode chip mapped to the six modes
    - Replace inline recent logic with `lib/search/recent.ts`; render popular via `popularItems` (cap 6) with recent above popular when present; wire a clear-recent control to the `search.clearRecent` key
    - Preserve the single-fetch, zero-network in-memory behavior
    - _Requirements: 7.3, 8.1, 9.1, 9.2, 9.5_

  - [x] 2.6 Add palette selection semantics, listbox ARIA, focus trap, focus restoration
    - On mode/results change select the first result if any, else clear selection; make Enter on an empty/no-selection list an explicit no-op
    - Add `role="listbox"` + accessible name to the result container, `role="option"` + `aria-selected` per row, and `aria-activedescendant` pointing at the active option; use the clamp helper for Arrow Up/Down; implement a focus trap and restore focus to the trigger on close
    - _Requirements: 6.5, 8.5, 8.6, 10.2, 10.4, 10.6, 10.7, 10.8_

  - [x] 2.7 Fix the search trigger keyboard behavior
    - In `components/search/search-trigger.tsx`, change ⌘K/Ctrl+K so a repeat press while open keeps one palette and refocuses the input (no toggle-close); track the trigger element and restore focus to it on Escape/close; keep `preventDefault()`
    - _Requirements: 6.2, 6.5, 6.6_

### Priority 3 — Premium Language Selector

- [x] 3. Polish and lock the language selector
  - [x] 3.1 Confirm and lock recent-locale semantics and shared clamp usage
    - In `components/i18n/language-selector.tsx`, ensure recent locales are most-recent-first, capped at 3, with the active locale excluded from the rendered recent list; use the shared clamp helper (from 2.4) for Arrow navigation
    - Preserve native + English name rendering, searchable filter, mobile + desktop support, persist-on-select, and persist-failure resilience; no structural change
    - _Requirements: 11.6, 11.13_

### Priority 4 — Localized Formatting

- [x] 4. Wire localized dates, numbers, and relative times everywhere
  - [x] 4.1 Harden `format.ts` fallbacks to return the original input on invalid values
    - In `lib/i18n/format.ts`, guard `formatNumber` against non-finite numbers (return `String(value)`) and `formatDate`/`formatRelativeTime` against invalid dates (`Number.isNaN(new Date(iso).getTime())` → return original `iso`)
    - Keep signatures and locale-aware output for valid inputs unchanged; this hardening underpins the formatter wiring below
    - _Requirements: 4.4_

  - [x] 4.2 Wire `useFormatters` across the remaining primary screens
    - Use the active-locale `formatDate`/`formatNumber`/`formatRelativeTime` for every date, count, and elapsed-time value rendered on `/`, `/report`, `/reports`, `/admin`, and `/admin/cases`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.3 Wire `useFormatters` into the case detail screen `/cases/[id]`
    - Use the active-locale formatters for every date, count, and relative-time value in `app/cases/[id]/page.tsx` (builds on the string localization in 1.4)
    - _Requirements: 4.1, 4.2, 4.3_

### Priority 5 — Raw-String Lint Guard

- [ ] 5. Prevent future untranslated UI
  - [ ] 5.1 Implement `scripts/check-i18n.mjs`
    - Dependency-free Node script (consistent with `scripts/check-gemini.mjs`) scanning `app/**/*.{ts,tsx}` and `components/**/*.{ts,tsx}` for JSX text nodes and user-facing string attributes (`placeholder`, `aria-label`, `title`, `alt`) not wrapped by `t()`/`getServerT()`
    - Exclude Glossary exclusions (proper nouns like `Velora`/`Vibe2Ship`, technical tokens, pure numerals/symbols) and lines annotated `// i18n-exempt`; print `path:line: message` per violation; exit non-zero only on real violations
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ] 5.2 Add the `check:i18n` script and chain it into `npm run lint`
    - Add `"check:i18n": "node scripts/check-i18n.mjs"` and update `"lint"` to `"next lint && npm run check:i18n"` so guard violations fail the lint step
    - _Requirements: 5.1, 5.5, 13.2_

### Priority 6 — Quality Verification (after all user-facing work)

- [ ] 6. Primary verification checkpoint — full Verification_Suite green
  - Ensure all user-facing features (Priorities 1–5) are complete first.
  - Run `npm run typecheck`, `npm run lint` (incl. `check:i18n`), `npm run build`, and `npm run check:gemini`; all must exit zero.
  - If any command fails: stop, find the root cause, fix it, and re-run the entire suite. Ask the user if questions arise.
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

### Priority 7 — Engineering Improvements (only if time remains)

> All tasks in this section are optional (`*`) and are intentionally last. Do them
> only after every visible Phase 3A feature is complete. They carry the
> property-based correctness guarantees and should be implemented for production
> readiness. Begin by setting up the harness, then add the tests.

- [ ] 7. Internal testing and verification hardening
  - [ ]* 7.1 Install and configure the Vitest + fast-check test harness
    - Add `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` as dev dependencies
    - Add `vitest.config.ts` (jsdom environment, TS/ESM, path aliases matching `tsconfig.json`) and a `"test": "vitest run"` script in `package.json`
    - Do NOT alter the Verification_Suite definition (typecheck/lint/build/check:gemini)
    - _Requirements: 13.1_

  - [ ]* 7.2 Write property tests for `translate`
    - **Property 3: Translate fallback chain** — **Validates: Requirements 2.1, 2.2**
    - **Property 4: Interpolation safety** — **Validates: Requirements 2.3, 2.4**
    - **Property 5: Translate totality** (inputs include `$`, `{`, `}`, regex metacharacters) — **Validates: Requirements 2.6**

  - [ ]* 7.3 Write property test for the Format_System
    - **Property 6: Format fallback totality** (null/undefined/NaN/invalid date or number return original input, never throw) — **Validates: Requirements 4.4**

  - [ ]* 7.4 Write property tests and a size assertion for the catalogs
    - **Property 1: Catalog key-set parity** — **Validates: Requirements 1.1, 1.4**
    - **Property 2: Total non-empty catalog values** (incl. fail-open English resolution) — **Validates: Requirements 1.5, 12.1**
    - Add an example test asserting `250 ≤ keys(en) ≤ 400` — _Requirements: 1.3_

  - [ ]* 7.5 Write example/component tests for localization and formatter wiring
    - Representative date/number/relative-time output per locale (Req 4.1–4.3); server/client parity for representative keys (Req 2.5, 4.5)
    - `lang` set on render and updated on locale change without reload (Req 3.4, 3.5); live re-render of visible strings on locale change (Req 3.3)
    - _Requirements: 2.5, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.5_

  - [ ]* 7.6 Write fixture-based tests for the Raw_String_Guard
    - Dirty fixture reports `file:line` and exits non-zero; clean fixture exits zero; Glossary exclusions and `// i18n-exempt` suppress violations
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.7 Write property tests for the ranking core
    - **Property 7: Highlight round-trip** — **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - **Property 8: Ranking soundness** (≤24, members of input, non-increasing, empty on no match) — **Validates: Requirements 7.7, 7.8, 7.9**
    - **Property 9: Mode filtering** — **Validates: Requirements 8.2**
    - **Property 10: AI-mode restriction** — **Validates: Requirements 8.4**

  - [ ]* 7.8 Write property tests for recent searches
    - **Property 12: Recent-search bound, dedup, and idempotence** — **Validates: Requirements 9.3, 9.4**
    - **Property 13: Storage-helper totality** — **Validates: Requirements 9.6**

  - [ ]* 7.9 Write property test for popular ordering
    - **Property 11: Popular ordering and cap** — **Validates: Requirements 9.1**

  - [ ]* 7.10 Write property test for the clamp helper
    - **Property 16: Selection-index clamp** — **Validates: Requirements 10.2, 11.6**

  - [ ]* 7.11 Write component tests for the command palette
    - Group coverage with a full-spectrum index (7.1), per-group match + href (7.2–7.5), select navigates + closes (7.6); six mode chips with `all` default (8.1), all-mode multi-group (8.3), mode-change selection/empty semantics (8.5, 8.6)
    - Keyboard open/focus, Arrow clamp, Enter, focus trap, ARIA listbox/activedescendant (10.1, 10.2, 10.3–10.8); single-fetch + zero query-time network (12.3, 12.4)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.3, 8.5, 8.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 12.3, 12.4_

  - [ ]* 7.12 Write component tests for the search trigger
    - ⌘K opens within budget and suppresses default; repeat ⌘K keeps one palette + refocuses input; Escape closes and returns focus to trigger
    - _Requirements: 6.2, 6.5, 6.6_

  - [ ]* 7.13 Write property and component tests for the language selector
    - **Property 14: Recent-locale bound, dedup, and active exclusion** — **Validates: Requirements 11.13**
    - **Property 15: Language-filter substring predicate** — **Validates: Requirements 11.3**
    - Example tests: native+label render, active indicator, no-results message, focus on open, Enter/Escape/outside-click, apply+persist+recent, persist-failure resilience
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12, 11.13_

  - [ ]* 7.14 Write regression tests for the preservation invariants
    - Fail-open provider returns non-empty English outside the provider (12.1); compile-time parity error on a missing key (12.2); zero query-time network + single per-session fetch (12.3, 12.4); locale persisted to cookie + localStorage and initialized from persisted value (12.5, 12.6)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 8. Final checkpoint - re-run the full Verification_Suite
  - Ensure all tests pass, ask the user if questions arise.
  - Re-run `npm run typecheck`, `npm run lint` (incl. `check:i18n`), `npm run build`, and `npm run check:gemini`; all must exit zero.

## Notes

- Tasks are ordered hackathon-first: Priorities 1–5 deliver visible, user-facing
  value; Priority 6 verifies it; Priority 7 (optional, `*`) adds the internal test
  suite and tooling only if time remains.
- This is a gap-closing plan: every task extends or hardens existing code or adds the
  few net-new pieces (report group, AI mode, recent/popular/clamp helpers, i18n
  guard). No already-complete functionality is recreated, and all preserved systems
  (fail-open provider, compile-time catalog typing, zero-network in-memory search,
  single per-session fetch, cookie + localStorage persistence) remain intact.
- The two correctness-hardening implementation steps (1.1 interpolation safety, 4.1
  format fallback totality) stay next to the user-facing work they support; only their
  property **tests** (7.2, 7.3) live in Priority 7.
- Tasks marked with `*` are optional and can be skipped for a faster demo MVP, but
  they carry the property-based correctness guarantees and should be implemented for
  production readiness.
- Each property test implements exactly one Correctness Property from the design at
  ≥100 iterations and is tagged `Feature: phase-3a-completion, Property {n}: ...`.
- The primary verification checkpoint is Priority 6 (after all user-facing work);
  task 8 re-runs the suite after the optional test suite lands.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3", "2.4", "4.1", "5.1"] },
    { "id": 1, "tasks": ["1.2", "2.5", "2.7", "3.1"] },
    { "id": 2, "tasks": ["1.3", "1.4", "2.6", "5.2"] },
    { "id": 3, "tasks": ["4.2", "4.3"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12", "7.13", "7.14"] }
  ]
}
```
