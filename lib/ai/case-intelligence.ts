/**
 * Civic case intelligence (Phase 4).
 *
 * Generates a concise case summary + community-impact line for a civic case.
 *
 * Token strategy:
 *   - Generated LAZILY (only when a case is viewed) and CACHED on the case
 *     document, keyed by reportCount. If the cache matches the current
 *     reportCount, NO Gemini call is made.
 *   - Single-report cases use a deterministic summary (no Gemini call).
 *   - When Gemini is unconfigured or errors, a deterministic fallback is used.
 */
import "server-only";

import { z } from "zod";

import { CATEGORY_META, COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { getGeminiModel, isGeminiConfigured } from "@/lib/gemini/config";
import type { CivicCase, CivicReport } from "@/types";

export interface CaseIntelligence {
  summary: string;
  impact: string;
  cached: boolean;
}

const intelSchema = z.object({
  summary: z.string(),
  impact: z.string(),
});

function deterministicSummary(
  civicCase: CivicCase,
  reports: CivicReport[],
): CaseIntelligence {
  const label = CATEGORY_META[civicCase.category].label.toLowerCase();
  const n = civicCase.reportCount;
  const example = reports[0]?.title ? ` (e.g. "${reports[0].title}")` : "";
  return {
    summary:
      n <= 1
        ? `A single ${label} report has been logged in this area${example}.`
        : `${n} reports indicate a recurring ${label} issue in this area${example}.`,
    impact:
      n <= 1
        ? "Limited community impact so far; monitoring for further reports."
        : `Affects multiple residents nearby; rising reports suggest growing community impact.`,
    cached: false,
  };
}

function buildPrompt(civicCase: CivicCase, reports: CivicReport[]): string {
  const label = CATEGORY_META[civicCase.category].label;
  const titles = reports
    .slice(0, 8)
    .map((r, i) => `${i + 1}. ${r.title}`)
    .join("\n");

  // U2: provide locality + nearby landmarks so the summary is context-aware.
  const locality =
    civicCase.locality ?? reports.find((r) => r.locality)?.locality ?? null;
  const landmarks = Array.from(
    new Set(
      reports.flatMap((r) =>
        (r.contextFactors ?? []).map((f) => `${f.type} (${f.name})`),
      ),
    ),
  ).slice(0, 6);
  const severity = civicCase.severityLabel ?? null;

  return [
    "You summarize aggregated civic cases for a city operations center. Return STRICT JSON.",
    `Category: ${label}`,
    `Number of reports in this case: ${civicCase.reportCount}`,
    locality ? `Locality: ${locality}` : "Locality: unknown",
    severity ? `Context-aware severity: ${severity}` : "",
    landmarks.length
      ? `Nearby impactful places: ${landmarks.join(", ")}`
      : "Nearby impactful places: none detected",
    "Report titles:",
    titles,
    "",
    "Return JSON with keys:",
    '- "summary": ONE concise sentence like "12 reports indicate recurring road damage near Mysuru Ring Road."',
    '- "impact": ONE concise sentence on community impact, referencing nearby places (e.g. a school/hospital) when relevant.',
    "Be specific and reference the locality and landmarks when possible. JSON only.",
  ]
    .filter(Boolean)
    .join("\n");
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s !== -1 && e > s) return JSON.parse(text.slice(s, e + 1));
    throw new Error("No JSON in response.");
  }
}

/**
 * Return cached intelligence when fresh; otherwise generate, persist, return.
 */
export async function getOrGenerateCaseIntelligence(
  civicCase: CivicCase,
  reports: CivicReport[],
): Promise<CaseIntelligence> {
  // Fresh cache hit → no Gemini call.
  if (
    civicCase.aiSummary &&
    civicCase.aiSummaryReportCount === civicCase.reportCount
  ) {
    return {
      summary: civicCase.aiSummary,
      impact: civicCase.aiImpact ?? "",
      cached: true,
    };
  }

  // Single-report cases or no Gemini → deterministic (free).
  if (civicCase.reportCount <= 1 || !isGeminiConfigured) {
    return deterministicSummary(civicCase, reports);
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: buildPrompt(civicCase, reports) }] },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: 200,
      },
    });

    const parsed = intelSchema.parse(parseJson(result.response.text()));
    const intel: CaseIntelligence = {
      summary: parsed.summary.trim(),
      impact: parsed.impact.trim(),
      cached: false,
    };

    // Cache on the case document keyed by the current reportCount.
    await getAdminDb()
      .collection(COLLECTIONS.civicCases)
      .doc(civicCase.id)
      .update({
        aiSummary: intel.summary,
        aiImpact: intel.impact,
        aiSummaryReportCount: civicCase.reportCount,
        aiGeneratedAt: new Date().toISOString(),
      });

    return intel;
  } catch (err) {
    console.error("[ai/case-intelligence] generation failed:", err);
    return deterministicSummary(civicCase, reports);
  }
}
