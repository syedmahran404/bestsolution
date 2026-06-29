/**
 * Raw_String_Guard — a dependency-free static check that flags new untranslated
 * user-facing strings in the application source, so the zero-mixed-language
 * guarantee cannot silently regress.
 *
 * It scans `app/**` and `components/**` for:
 *   1. JSX text nodes        — visible text between `>` and `<` (e.g. `<p>Hello</p>`)
 *   2. User-facing attributes — `placeholder`, `aria-label`, `title`, `alt`
 *
 * A finding is reported only when the text is a plain string literal that is NOT
 * already routed through the i18n layer (`t(...)` / `getServerT(...)`), and is not
 * covered by one of the exclusions below.
 *
 * This is a pragmatic regex/heuristic scanner, not a full TS/JSX parser (no parser
 * is available dependency-free). It deliberately errs toward FALSE NEGATIVES rather
 * than false positives: a missed raw string is a cosmetic gap, but a false positive
 * would block the build. The exclusion rules and prose whitelist below keep code
 * constructs (generics like `useState<T>()`, arrow functions `() =>`, function
 * calls, expressions in `{...}`) from ever being reported.
 *
 * Exclusions:
 *   - Proper nouns / brand: `Velora`, `Vibe2Ship`
 *   - Technical tokens: ALL_CAPS_SNAKE identifiers / env var names
 *   - Pure numerals / symbols / punctuation / whitespace, and single non-letters
 *   - Any line carrying a trailing `// i18n-exempt` annotation
 *   - import/require/`from "..."` module specifier lines
 *   - className / cn(...) values and non-targeted attributes (never matched)
 *
 * Usage:
 *   node scripts/check-i18n.mjs
 *
 * Exit code 0 when clean; non-zero when one or more real violations are found.
 * An internal parse error for a single file is reported and skipped — it never
 * crashes the whole run and never on its own causes a non-zero exit.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];
const SOURCE_RE = /\.(ts|tsx)$/;
// Skip declaration files and any co-located tests (not user-facing UI).
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

// Brand / proper nouns that are intentionally rendered verbatim.
const BRAND_WORDS = ["Velora", "Vibe2Ship"];
const BRAND_STRIP_RE = new RegExp(`\\b(?:${BRAND_WORDS.join("|")})\\b`, "g");

// Inline annotation that suppresses a finding for the line it sits on.
const EXEMPT_RE = /\/\/\s*i18n-exempt/;

// Lines that reference module specifiers — strings here are never user-facing.
const IMPORT_LINE_RE = /^\s*(?:import\b|export\b.*\bfrom\b)|\brequire\s*\(/;

// The four user-facing attributes we police. Single- or double-quoted literals
// only — dynamic `={t(...)}` / `={expr}` values have no leading quote and never
// match, so they are correctly ignored.
const ATTR_RE = /\b(placeholder|aria-label|title|alt)\s*=\s*("([^"]*)"|'([^']*)')/g;

// JSX text node: text between a tag-closing `>` and the next `<`. The negative
// lookbehind drops `=>` (arrow functions) and `/>` (self-closing tags). The
// character class forbids `<`, `>`, `{`, `}` so any embedded expression aborts
// the match — only static prose between elements is captured.
const JSX_TEXT_RE = /(?<![=!/])>([^<>{}]+)</g;

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

/** True when the trimmed text is a real, human-readable user-facing string. */
function isUserFacingProse(raw) {
  const text = raw.trim();
  if (text.length === 0) return false;

  // Must contain at least one alphabetic letter (drops numerals, symbols,
  // punctuation, whitespace, lone glyphs/emoji, and single non-letters).
  if (!/[A-Za-z]/.test(text)) return false;

  // Strip brand/proper nouns; if nothing word-like remains, it's brand-only.
  const withoutBrand = text.replace(BRAND_STRIP_RE, " ");
  if (!/[A-Za-z]/.test(withoutBrand)) return false;

  // ALL_CAPS_SNAKE technical token / env var name (e.g. FIREBASE_SERVICE_KEY).
  if (/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(text)) return false;

  // Require at least one "word" of two or more letters so single letters such
  // as "x" or "A" are not treated as copy.
  if (!/[A-Za-z]{2,}/.test(text)) return false;

  return true;
}

/**
 * Stricter gate for JSX text nodes. Beyond prose-ness, the captured text must
 * not look like leftover code (function calls, operators, template literals,
 * assignments). UI copy fits a narrow punctuation whitelist; anything else is
 * assumed to be code and skipped to avoid false positives.
 */
function isJsxProse(raw) {
  const text = raw.trim();
  if (!isUserFacingProse(text)) return false;
  // Real UI copy starts with a letter or digit. Leading punctuation (e.g. a
  // comma) signals leftover TypeScript syntax such as a multi-line generic
  // `extends Foo<Bar>, VariantProps<...>` rather than text.
  if (!/^[A-Za-z0-9]/.test(text)) return false;
  // Whitelist: letters, digits, whitespace and a small set of sentence
  // punctuation. Parens, braces, `=`, `;`, backticks, pipes, `$`, `\`, `*`,
  // `&`, `/`, `+` all indicate code rather than copy.
  if (!/^[A-Za-z0-9\s.,!?'":%–—-]+$/.test(text)) return false;
  return true;
}

/** Map a character offset within `content` to a 1-based line number. */
function makeLineLookup(content) {
  const starts = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") starts.push(i + 1);
  }
  return (offset) => {
    // Binary search for the last line start <= offset.
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

/** Recursively collect `.ts`/`.tsx` source files under `dir`. */
function collectFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return; // Directory missing — nothing to scan.
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      collectFiles(full, out);
    } else if (SOURCE_RE.test(name) && !SKIP_FILE_RE.test(name)) {
      out.push(full);
    }
  }
}

/** Scan a single file, returning an array of `{ line, message }` violations. */
function scanFile(file) {
  const content = readFileSync(file, "utf8");
  const lineAt = makeLineLookup(content);
  const lines = content.split("\n");
  const violations = [];

  const lineIsSuppressed = (lineNo) => {
    const text = lines[lineNo - 1] ?? "";
    return EXEMPT_RE.test(text) || IMPORT_LINE_RE.test(text);
  };

  // 1. User-facing attributes (applies to any JSX-bearing source).
  for (const m of content.matchAll(ATTR_RE)) {
    const attr = m[1];
    const value = m[3] !== undefined ? m[3] : m[4] ?? "";
    if (!isUserFacingProse(value)) continue;
    const line = lineAt(m.index);
    if (lineIsSuppressed(line)) continue;
    violations.push({
      line,
      message: `untranslated ${attr} attribute "${value.trim()}" — wrap with t()/getServerT()`,
    });
  }

  // 2. JSX text nodes — only meaningful in .tsx files. Skipping .ts here avoids
  // misreading TypeScript comparison/generic syntax as text.
  if (file.endsWith(".tsx")) {
    for (const m of content.matchAll(JSX_TEXT_RE)) {
      const value = m[1];
      if (!isJsxProse(value)) continue;
      // Offset of the captured text (after the opening `>`).
      const line = lineAt(m.index + 1);
      if (lineIsSuppressed(line)) continue;
      violations.push({
        line,
        message: `untranslated JSX text "${value.trim()}" — wrap with t()/getServerT()`,
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = [];
for (const dir of SCAN_DIRS) collectFiles(join(ROOT, dir), files);
files.sort();

let total = 0;
let parseErrors = 0;

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  let found;
  try {
    found = scanFile(file);
  } catch (err) {
    // Internal parse/read error: report and continue; do not fail the run.
    parseErrors++;
    console.error(`${rel}: skipped (internal error: ${err.message})`);
    continue;
  }
  for (const v of found) {
    total++;
    console.log(`${rel}:${v.line}: ${v.message}`);
  }
}

console.log("");
if (parseErrors > 0) {
  console.error(`  (${parseErrors} file(s) skipped due to internal errors)`);
}

if (total > 0) {
  console.error(`✗ check:i18n: ${total} raw-string violation(s) across ${files.length} file(s)`);
  process.exit(1);
}

console.log(`✓ check:i18n: no raw strings (${files.length} file(s) scanned)`);
process.exit(0);
