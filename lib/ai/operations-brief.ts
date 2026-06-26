/**
 * Agentic Operations Brief (U3).
 *
 * Synthesizes the deterministic signals (severity, context, priority,
 * recommendation) into an explainable operational picture: current issue, root
 * cause, community impact, why it matters, recommended actions, dependencies,
 * and risks — each explained, never a black box.
 *
 * Token strategy (consistent with the project philosophy):
 *   - ONE Gemini call per case, generated LAZILY (only on the case view) and
 *     CACHED on the case doc, keyed by `${reportCount}:${status}`. If the cache
 *     matches, NO call is made.
 *   - When Gemini is unconfigured or errors, a DETERMINISTIC brief is returned
 *     (built from the priority + recommendation + context) — always available.
 */
import "server-only";

import { z } from "zod";

import { CATEGORY_META, COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { getGeminiModel, isGeminiConfigured } from "@/lib/gemini/config";
import type {
  CivicCase,
  CivicReport,
  OperationsBrief,
  PriorityAssessment,
  Recommendation,
} from "@/types";

function cacheKey(c: CivicCase): string {
  return `${c.reportCount}:${c.status}`;
}

const briefSchema = z.object({
  currentIssue: z.string(),
  rootCause: z.string(),
  communityImpact: z.string(),
  whyItMatters: z.string(),
  recommendedPriority: z.enum(["low", "medium", "high", "critical"]),
  nextActions: z
    .array(z.object({ action: z.string(), reason: z.string() }))
    .default([]),
  dependencies: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  confidence: z.number().optional(),
});

/** Deterministic brief (no Gemini) — always available, fully explainable. */
function deterministicBrief(
  civicCase: CivicCase,
  priority: PriorityAssessment,
  recommendation: Recommendation,
): OperationsBrief {
  const label = CATEGORY_META[civicCase.category].label;
  const where = civicCase.locality ? ` in ${civicCase.locality}` : "";
  const landmarks = priority.contextFactors.map((f) => f.type).join(", ");

  return {
    currentIssue: `${label} issue${where} with ${civicCase.reportCount} aggregated report(s).`,
    rootCause:
      "Root-cause synthesis requires AI (Gemini not configured); deterministic signals only.",
    communityImpact: `Estimated ~${priority.affectedPopulation.toLocaleString()} people potentially affected${landmarks ? `; sensitive sites nearby: ${landmarks}` : ""}.`,
    whyItMatters: priority.reasons.join(" "),
    recommendedPriority: priority.label,
    nextActions: [
      {
        action: recommendation.label,
        reason: recommendation.reasoning.join(" "),
      },
    ],
    dependencies: [],
    risks:
      priority.label === "critical" || priority.label === "high"
        ? ["Delay may increase safety risk and public impact."]
        : [],
    confidence: priority.confidence,
    generatedBy: "deterministic",
    generatedAt: new Date().toISOString(),
  };
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

function buildPrompt(
  civicCase: CivicCase,
  reports: CivicReport[],
  priority: PriorityAssessment,
  recommendation: Recommendation,
): string {
  const label = CATEGORY_META[civicCase.category].label;
  const titles = reports
    .slice(0, 8)
    .map((r, i) => `${i + 1}. ${r.title}`)
    .join("\n");
  const landmarks = priority.contextFactors
    .map((f) => `${f.type} (${f.name}, ${f.distanceM}m)`)
    .join(", ");

  return [
    "You are a civic operations analyst. Produce an explainable operations brief as STRICT JSON.",
    "You are given DETERMINISTIC signals — do NOT change the priority; explain it.",
    `Category: ${label}`,
    `Locality: ${civicCase.locality ?? "unknown"}`,
    `Aggregated reports: ${civicCase.reportCount}`,
    `Status: ${civicCase.status}`,
    `Context-aware severity: ${civicCase.severityLabel ?? "n/a"} (${civicCase.severityScore ?? "n/a"})`,
    `Computed priority: ${priority.label} (score ${priority.score}, confidence ${priority.confidence})`,
    `Estimated affected population: ~${priority.affectedPopulation}`,
    landmarks
      ? `Nearby sensitive places: ${landmarks}`
      : "Nearby sensitive places: none",
    `Baseline recommendation: ${recommendation.label}`,
    "Report titles:",
    titles,
    "",
    "Return JSON with keys: currentIssue, rootCause, communityImpact, whyItMatters,",
    "recommendedPriority (one of low|medium|high|critical, MATCH the computed priority),",
    "nextActions (array of {action, reason}), dependencies (array of strings),",
    "risks (array of strings), confidence (0..1).",
    "Each conclusion must be specific and explained. JSON only.",
  ].join("\n");
}

/**
 * Return the cached brief when fresh; otherwise generate (AI or deterministic),
 * persist AI briefs, and return.
 */
export async function getOrGenerateOperationsBrief(
  civicCase: CivicCase,
  reports: CivicReport[],
  priority: PriorityAssessment,
  recommendation: Recommendation,
): Promise<OperationsBrief> {
  const key = cacheKey(civicCase);

  // Fresh cache hit → no Gemini call.
  if (civicCase.opsBrief && civicCase.opsBriefKey === key) {
    return civicCase.opsBrief;
  }

  if (!isGeminiConfigured) {
    return deterministicBrief(civicCase, priority, recommendation);
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt(civicCase, reports, priority, recommendation) },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        maxOutputTokens: 600,
      },
    });

    const parsed = briefSchema.parse(parseJson(result.response.text()));
    const brief: OperationsBrief = {
      currentIssue: parsed.currentIssue,
      rootCause: parsed.rootCause,
      communityImpact: parsed.communityImpact,
      whyItMatters: parsed.whyItMatters,
      // Trust the deterministic priority over the model's echo.
      recommendedPriority: priority.label,
      nextActions: parsed.nextActions,
      dependencies: parsed.dependencies,
      risks: parsed.risks,
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : priority.confidence,
      generatedBy: "ai",
      generatedAt: new Date().toISOString(),
    };

    await getAdminDb()
      .collection(COLLECTIONS.civicCases)
      .doc(civicCase.id)
      .update({ opsBrief: brief, opsBriefKey: key });

    return brief;
  } catch (err) {
    console.error("[ai/operations-brief] generation failed:", err);
    return deterministicBrief(civicCase, priority, recommendation);
  }
}
