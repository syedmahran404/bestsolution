# Requirements Document

## Introduction

Phase 3A delivers three capabilities for the Velora Civic AI application: complete
localization across six locales, a product-grade global search, and a premium
language selector. The infrastructure for all three already exists in the codebase
(`lib/i18n/*`, `lib/search/index.ts`, `components/search/*`, `components/i18n/*`),
and much of it works today. This spec defines the **production-quality target
state** so that a subsequent gap analysis and incremental implementation can close
the remaining gaps without regressing existing, working behavior.

The goal is to make the product's multilingual and discovery claims real and
verifiable: every primary screen renders fully in the active locale (no stray
English), dates and numbers are locale-formatted, a lint guard prevents new raw
user-facing strings, global search is reachable from everywhere and returns cases,
reports, localities, and categories, and both search and the language selector are
fully keyboard accessible. The existing fail-open i18n provider, English fallback,
and compile-time catalog typing MUST be preserved.

This spec deliberately frames requirements around the target acceptance criteria
rather than a from-scratch rebuild. Where the current implementation already
satisfies a criterion, the requirement records the bar that MUST continue to hold.

## Glossary

- **Application**: The Velora Civic AI Next.js web application as a whole.
- **Localization_System**: The i18n subsystem comprising the message catalogs
  (`lib/i18n/messages.ts`), the `translate` helper, the client provider
  (`lib/i18n/provider.tsx`), and the server resolver (`lib/i18n/server.ts`).
- **Message_Catalog**: A per-locale typed map of message keys to translated
  strings. `en` is the source of truth and defines the key set; every other locale
  satisfies the same `Messages` type.
- **Supported_Locale**: One of the six locales defined in `lib/i18n/locales.ts`:
  English (en), Hindi (hi), Kannada (kn), Bengali (bn), Marathi (mr), Telugu (te).
- **Primary_Screen**: A user-facing route rendered by the Application that is part
  of the core experience: the map/home (`/`), report (`/report`), my reports
  (`/reports`), operations center (`/admin`), case management (`/admin/cases`), and
  case detail (`/cases/[id]`).
- **User_Facing_String**: Any literal text rendered to a Primary_Screen that a user
  reads, excluding code identifiers, proper nouns (e.g. "Velora", "Vibe2Ship"),
  technical tokens (e.g. environment variable names), numerals, and symbols.
- **Format_System**: The locale-aware date, number, and relative-time formatters in
  `lib/i18n/format.ts`.
- **Raw_String_Guard**: A static lint check that detects new untranslated
  User_Facing_Strings in application source and reports them as violations.
- **Global_Search**: The search subsystem comprising the header trigger
  (`components/search/search-trigger.tsx`), the command palette
  (`components/search/command-palette.tsx`), and the ranking core
  (`lib/search/index.ts`).
- **Command_Palette**: The modal search surface opened from the header trigger or
  the keyboard shortcut.
- **Search_Mode**: A scope filter applied to search results. Modes are: all,
  location, problem, category, status, and AI.
- **Search_Result_Group**: A category of search result: case, report, locality,
  category, status, or page.
- **Language_Selector**: The premium header language selector
  (`components/i18n/language-selector.tsx`).
- **Keyboard_Accessible**: Operable end-to-end using only the keyboard, supporting
  Arrow Up, Arrow Down, Enter, Escape, and type-to-filter, with managed focus and
  ARIA combobox/listbox semantics.
- **Verification_Suite**: The commands `npm run typecheck`, `npm run lint`,
  `npm run build`, and `npm run check:gemini`.

## Requirements

### Requirement 1: Complete Localization Catalog

**User Story:** As a non-English-speaking citizen, I want every interface string
available in my language, so that I can use the Application without encountering
untranslated text.

#### Acceptance Criteria

1. THE Localization_System SHALL provide a Message_Catalog that is resolvable for
   each of the six Supported_Locales (en, hi, kn, bn, mr, te).
2. FOR ALL Primary_Screens, THE English Message_Catalog SHALL contain a message key
   for every User_Facing_String rendered on that Primary_Screen.
3. THE English Message_Catalog SHALL define no fewer than 250 and no more than 400
   message keys (inclusive) after extraction is complete.
4. FOR ALL Supported_Locales, THE Message_Catalog SHALL define exactly the same set
   of keys as the English Message_Catalog, with no missing keys and no extra keys
   relative to the English key set (key-set parity).
5. FOR ALL message keys in all Supported_Locales, THE Message_Catalog SHALL map the
   key to a string value that contains at least one non-whitespace character.
6. WHERE a non-English Message_Catalog value is awaiting native-speaker review, THE
   Localization_System SHALL render that locale's catalog value and SHALL NOT
   substitute the English value.

### Requirement 2: Safe Fallback for Missing Keys

**User Story:** As a developer, I want missing translations to degrade gracefully,
so that a localization gap never produces a broken or blank screen.

#### Acceptance Criteria

1. WHEN a translation is requested for a key that is present in the English
   Message_Catalog but absent from the active Supported_Locale catalog, THE
   Localization_System SHALL return the English value for that key.
2. IF a requested key is absent from both the active locale catalog and the English
   catalog, THEN THE Localization_System SHALL return the requested key string
   unchanged.
3. WHEN a translation is requested with interpolation variables, THE
   Localization_System SHALL replace every occurrence of each `{name}` placeholder
   in the resolved string with the string form of the corresponding supplied value.
4. IF a `{name}` placeholder in the resolved string has no corresponding supplied
   interpolation value, THEN THE Localization_System SHALL leave that placeholder
   text unchanged and return the remaining resolved string.
5. THE Localization_System SHALL return identical strings for the same key, locale,
   and interpolation values whether invoked from a server component or a client
   component.
6. FOR ALL key, locale, and interpolation-value inputs, THE Localization_System
   SHALL return a string value without raising an error.

### Requirement 3: Zero Mixed-Language Primary Screens

**User Story:** As a citizen using a non-English locale, I want each primary screen
to render entirely in my chosen language, so that I am not confused by stray
English text.

#### Acceptance Criteria

1. WHILE a non-English Supported_Locale is active, THE Application SHALL render all
   User_Facing_Strings on each Primary_Screen using the active locale's
   Message_Catalog.
2. FOR ALL combinations of Supported_Locale and Primary_Screen, THE Application
   SHALL render no untranslated English User_Facing_String, excluding proper nouns
   and technical tokens defined as exclusions in the Glossary.
3. WHEN the active locale is changed through the Language_Selector, THE Application
   SHALL re-render all currently visible User_Facing_Strings in the newly selected
   locale within 1000 milliseconds and without a full page reload.
4. WHEN a Primary_Screen renders, THE Application SHALL set the document `lang`
   attribute to the active Supported_Locale code.
5. WHEN the active locale is changed through the Language_Selector, THE Application
   SHALL update the document `lang` attribute to the newly selected Supported_Locale
   code without a full page reload.

### Requirement 4: Localized Dates and Numbers

**User Story:** As a citizen, I want dates and numbers shown in my locale's format,
so that timestamps and counts read naturally in my language.

#### Acceptance Criteria

1. WHEN the Application displays a date or timestamp on a Primary_Screen, THE
   Application SHALL format that value using the Format_System bound to the active
   Supported_Locale, applying that locale's date field order and localized month and
   weekday names.
2. WHEN the Application displays a numeric count on a Primary_Screen, THE
   Application SHALL format that value using the Format_System bound to the active
   Supported_Locale, applying that locale's digit grouping separators.
3. WHEN the Application displays an elapsed-time value on a Primary_Screen, THE
   Application SHALL format that value as locale-aware relative time using the
   Format_System bound to the active Supported_Locale.
4. IF a value passed to the Format_System is null, undefined, NaN, or otherwise not
   a valid date or number, THEN THE Format_System SHALL return the original input
   value without raising an error.
5. THE Format_System SHALL produce identical formatted output for the same value and
   Supported_Locale whether invoked from a server component or a client component.

### Requirement 5: Raw-String Lint Guard

**User Story:** As a maintainer, I want new untranslated strings to be caught
automatically, so that the zero-mixed-language guarantee does not regress over
time.

#### Acceptance Criteria

1. THE Raw_String_Guard SHALL be executable as a named project script and SHALL run
   as part of the `npm run lint` step of the Verification_Suite.
2. WHEN application source contains one or more new untranslated User_Facing_Strings,
   THE Raw_String_Guard SHALL report every such occurrence as a violation
   identifying the source file path and line number.
3. WHEN application source contains no untranslated User_Facing_String, THE
   Raw_String_Guard SHALL terminate with a zero (success) exit code.
4. WHERE a string matches a Glossary exclusion (proper noun, technical token,
   numeral, or symbol) or carries an explicit exemption annotation, THE
   Raw_String_Guard SHALL exclude that string from violation reporting.
5. IF the Raw_String_Guard reports one or more violations, THEN THE `npm run lint`
   step SHALL terminate with a non-zero exit code.

### Requirement 6: Global Search Reachable Everywhere

**User Story:** As any user, I want to open search from anywhere in the
Application, so that I can find content without navigating to a specific page.

#### Acceptance Criteria

1. THE Application SHALL render the Global_Search header trigger on every
   Primary_Screen.
2. WHEN a user presses Ctrl+K or Cmd+K on any Primary_Screen, THE Global_Search
   SHALL suppress the browser's default action for that key combination and open the
   Command_Palette within 200 milliseconds.
3. WHEN a user activates the header search trigger, THE Global_Search SHALL open the
   Command_Palette within 200 milliseconds.
4. WHEN a user opens the Command_Palette on any Primary_Screen, THE Global_Search
   SHALL open it without changing the current route.
5. WHEN the Command_Palette is open and the user presses Escape, THE Global_Search
   SHALL close the Command_Palette and move focus to the element that triggered it.
6. IF a user presses Ctrl+K or Cmd+K while the Command_Palette is already open, THEN
   THE Global_Search SHALL keep a single Command_Palette open and move focus to the
   search input.

### Requirement 7: Search Result Coverage

**User Story:** As a user searching the Application, I want results spanning cases,
reports, localities, and categories, so that I can reach any relevant content from
one search box.

#### Acceptance Criteria

1. THE Global_Search SHALL return results in the case, report, locality, category,
   and status Search_Result_Groups.
2. WHEN a non-empty query case-insensitively matches the title or keywords of one or
   more civic cases, THE Global_Search SHALL include those cases in the results, each
   linking to its case detail screen.
3. WHEN a non-empty query case-insensitively matches the title or keywords of one or
   more citizen reports, THE Global_Search SHALL include those reports in the
   results, each linking to its report target.
4. WHEN a non-empty query case-insensitively matches the title or keywords of one or
   more localities, THE Global_Search SHALL include those localities in the results,
   each linking to its locality target.
5. WHEN a non-empty query case-insensitively matches the title or keywords of one or
   more categories, THE Global_Search SHALL include those categories in the results,
   each linking to its category target.
6. WHEN a result is selected, THE Global_Search SHALL navigate to that result's
   target and close the Command_Palette.
7. THE Global_Search SHALL rank and return at most 24 results, ordered by
   non-increasing relevance score.
8. FOR ALL returned results, THE Global_Search SHALL return only items that are
   members of its in-memory search index (no fabricated results).
9. IF a non-empty query matches no indexed item, THEN THE Global_Search SHALL return
   an empty result set and display a no-results indication.

### Requirement 8: Search Modes

**User Story:** As a user, I want to scope my search by type, so that I can narrow
results to the kind of content I am looking for.

#### Acceptance Criteria

1. THE Command_Palette SHALL present six selectable Search_Modes — all, location,
   problem, category, status, and AI — with exactly one Search_Mode active at any
   time and the all mode active by default when the Command_Palette first opens.
2. WHEN a Search_Mode other than all is selected, THE Global_Search SHALL return
   only results belonging to that mode's associated Search_Result_Groups, where
   location maps to the locality group, problem maps to the case and report groups,
   category maps to the category group, and status maps to the status group.
3. WHEN the all Search_Mode is active, THE Global_Search SHALL return results from
   every Search_Result_Group (case, report, locality, category, status, and page).
4. WHEN the AI Search_Mode is selected, THE Global_Search SHALL return only case
   results whose match is derived from AI-generated case content fields, limited to
   case summaries and case keywords.
5. WHEN the active Search_Mode changes and the resulting filtered result list
   contains one or more results, THE Global_Search SHALL set the active result
   selection to the first result in the list.
6. IF the active Search_Mode changes and the resulting filtered result list is
   empty, THEN THE Global_Search SHALL clear the active result selection and display
   an empty-results indication for the selected mode.

### Requirement 9: Search Suggestions, Recent, and Popular

**User Story:** As a returning user, I want suggested, recent, and popular searches,
so that I can quickly repeat or discover useful queries.

#### Acceptance Criteria

1. WHILE the Command_Palette is open with an empty query, THE Global_Search SHALL
   display at most six popular results, ordered first by ascending
   Search_Result_Group priority and then by descending associated report count, with
   ties broken by case-insensitive ascending result label.
2. WHILE the Command_Palette is open with an empty query AND at least one recent
   search is stored on the device, THE Global_Search SHALL display the stored recent
   searches, most recent first, positioned above the popular results.
3. WHEN a user submits a query of between 2 and 100 characters inclusive and selects
   a result, THE Global_Search SHALL persist that query, trimmed of leading and
   trailing whitespace, to the device's recent searches.
4. THE Global_Search SHALL retain at most six recent searches, ordered most recent
   first, with no two entries equal under case-insensitive comparison, and WHEN a
   query equal under case-insensitive comparison to an existing entry is persisted,
   THE Global_Search SHALL move that entry to the front rather than adding a
   duplicate.
5. WHEN a user clears recent searches, THE Global_Search SHALL remove all stored
   recent searches for the device and, while the query remains empty, display only
   the popular results.
6. IF persisting or reading recent searches fails because device storage is
   unavailable, THEN THE Global_Search SHALL continue to operate for the current
   session without raising an error and SHALL display the popular results while the
   query is empty.

### Requirement 10: Search Keyboard Accessibility

**User Story:** As a keyboard-only user, I want to operate search entirely from the
keyboard, so that I can use the Application without a pointing device.

#### Acceptance Criteria

1. WHEN the Command_Palette opens, THE Global_Search SHALL move keyboard focus to
   the search input as the palette's initial render completes, without requiring any
   additional keystroke or pointer input.
2. WHEN the user presses Arrow Down or Arrow Up, THE Global_Search SHALL move the
   active result selection one result later or one result earlier respectively,
   clamping the selection to the first result at the top boundary and to the last
   result at the bottom boundary.
3. WHEN the user presses Enter while a result is selected, THE Global_Search SHALL
   activate the currently selected result by navigating to its target and closing the
   Command_Palette.
4. IF the user presses Enter while no result is selected or the result list is empty,
   THEN THE Global_Search SHALL perform no navigation and SHALL keep the
   Command_Palette open.
5. WHILE the user navigates results, THE Global_Search SHALL keep the active result
   fully visible within the result list's scroll viewport, with both its top and
   bottom edges inside the visible area.
6. THE Command_Palette SHALL expose modal dialog semantics to assistive
   technologies.
7. THE Command_Palette SHALL provide an accessible name for its search input and for
   its result list, and SHALL convey which result is currently selected, to
   assistive technologies.
8. WHILE the Command_Palette is open, THE Global_Search SHALL keep keyboard focus
   contained within the Command_Palette.

### Requirement 11: Premium Language Selector

**User Story:** As a user, I want a polished, searchable language selector, so that
I can find and switch to my language quickly using the mouse or keyboard.

#### Acceptance Criteria

1. THE Language_Selector SHALL display each Supported_Locale by its native script
   name together with its English label.
2. WHILE a Supported_Locale is the active locale, THE Language_Selector SHALL mark
   that locale in the list with a selection indicator distinct from non-selected
   locales.
3. WHEN a user changes the text in the Language_Selector filter input, THE
   Language_Selector SHALL update the list in the same interaction to show only
   locales whose native name, English label, or locale code contains the entered
   text using case-insensitive substring matching.
4. IF no Supported_Locale matches the entered filter text, THEN THE Language_Selector
   SHALL display a localized no-results message in place of the locale list.
5. WHEN the Language_Selector opens, THE Language_Selector SHALL move keyboard focus
   to its filter input within 100 milliseconds.
6. WHILE the Language_Selector is open, THE Language_Selector SHALL move the
   highlighted option to the next locale on Arrow Down and to the previous locale on
   Arrow Up, clamping at the last and first visible options respectively without
   wrapping.
7. WHEN a user presses Enter while a locale is highlighted, THE Language_Selector
   SHALL select that highlighted locale.
8. WHEN a user presses Escape, THE Language_Selector SHALL close without changing the
   active locale.
9. WHEN a user clicks outside the Language_Selector while it is open, THE
   Language_Selector SHALL close without changing the active locale.
10. WHEN a user selects a Supported_Locale, THE Language_Selector SHALL apply that
    locale as the active locale, record it as the most recent entry in the recently
    used locales, and close.
11. WHEN a user selects a Supported_Locale, THE Language_Selector SHALL persist the
    selected locale for the device so that it is restored on the next visit.
12. IF persisting the selected locale fails, THEN THE Language_Selector SHALL still
    apply the selected locale and close without surfacing an error to the user.
13. THE Language_Selector SHALL list recently used locales, ordered most-recent
    first, ahead of the remaining locales, retaining at most three recent entries and
    excluding the active locale from the recent list.

### Requirement 12: Preserve Existing Functionality

**User Story:** As a stakeholder, I want all currently working behavior to remain
intact, so that completing Phase 3A does not introduce regressions.

#### Acceptance Criteria

1. IF a component renders outside the Localization_System provider, THEN THE
   Localization_System SHALL resolve translations against the English Message_Catalog
   and SHALL return a non-empty string without throwing an error or rendering a blank
   value.
2. WHEN `npm run typecheck` is executed, THE Application SHALL report a compile-time
   type error for any Supported_Locale Message_Catalog that omits a key defined in
   the English Message_Catalog.
3. WHILE the Command_Palette is processing a user query, THE Global_Search SHALL
   resolve results exclusively from its in-memory index and SHALL issue zero backend
   or AI network requests.
4. WHEN the Global_Search initializes its in-memory index, THE Global_Search SHALL
   fetch case data exactly once per session and SHALL build the index from that
   single fetch.
5. WHEN a Supported_Locale is applied, THE Application SHALL persist the selected
   locale code to both an HTTP cookie and device local storage.
6. WHEN the Application loads and a persisted locale code exists in the cookie or in
   device local storage, THE Application SHALL initialize the active Supported_Locale
   from that persisted value.

### Requirement 13: Quality Gates Green

**User Story:** As a maintainer, I want all verification commands to pass, so that
the completed Phase 3A is production-ready.

#### Acceptance Criteria

1. WHEN `npm run typecheck` is executed, THE Application SHALL terminate with a zero
   (success) exit code and report zero type errors.
2. WHEN `npm run lint` is executed, THE Application SHALL terminate with a zero
   (success) exit code and report zero lint violations, including zero
   Raw_String_Guard violations.
3. WHEN `npm run build` is executed, THE Application SHALL terminate with a zero
   (success) exit code and produce production build output with zero build errors.
4. WHEN `npm run check:gemini` is executed, THE Application SHALL terminate with a
   zero (success) exit code.
5. IF any command in the Verification_Suite terminates with a non-zero exit code,
   THEN THE Application SHALL NOT be considered production-ready for Phase 3A.

## Notes on Correctness Properties

The following acceptance criteria are well suited to property-based verification
during design and implementation:

- **Catalog key-set parity (Req 1.4)** — invariant: for every Supported_Locale, the
  key set equals the English key set.
- **Total non-empty values (Req 1.5)** — invariant: every key in every locale maps
  to a value with at least one non-whitespace character.
- **Translate fallback totality (Req 2.1, 2.2, 2.6)** — for any key and locale,
  `translate` returns a string and never throws.
- **Interpolation safety (Req 2.3, 2.4)** — every supplied placeholder is replaced;
  unsupplied placeholders are left intact.
- **Highlight round-trip (Req 7 / search highlighting)** — concatenating the
  segments produced by `highlightSegments(text, query)` reconstructs `text` exactly
  (round-trip property).
- **Ranking soundness (Req 7.7, 7.8)** — `rankItems` returns at most 24 items, each
  drawn from the input set, with non-increasing scores.
- **Mode filtering (Req 8.2)** — every result returned for a non-default mode
  belongs to that mode's allowed groups.
- **Recent-search bound and dedup (Req 9.4)** — the recent list never exceeds six
  entries and contains no duplicates; pushing the same query twice equals pushing it
  once (idempotence).
- **Format fallback totality (Req 4.4)** — formatters return the original input on
  bad input rather than throwing.
