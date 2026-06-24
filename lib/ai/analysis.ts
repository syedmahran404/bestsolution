/**
 * Report AI analysis (Phase 4 — Civic Intelligence Layer).
 *
 * ONE Gemini call per report performs ALL perception in a single request:
 *   - voice transcription (if audio is present)
 *   - category classification + confidence
 *   - human-readable reasoning + detected keywords
 *   - a concise summary
 *
 * Token strategy: exactly one multimodal call per report; the result is stored
 * immutably on the report document, so it is NEVER regenerated (no duplicate
 * calls). Deterministic work (distance, clustering, aggregation) never touches
 * Gemini. If Gemini is unconfigured or errors, the report still succeeds with
 * aiAnalysis = null (graceful degradation).
 */
import "server-only";

import { z } from "zod";

import { GEMINI_MODEL } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/constants";
import { getGeminiModel, isGeminiConfigured } from "@/lib/gemini/config";
import { REPORT_CATEGORIES } from "@/lib/validation/report";
import type { AIAnalysis, CivicReport, IssueCategory } from "@/types";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB safety cap

/** Shape we ask Gemini to return (validated defensively after parse). */
const aiOutputSchema = z.object({
  category: z.string(),
  confidence: z.number().optional(),
  reasoning: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  summary: z.string().optional(),
  transcript: z.string().nullable().optional(),
});

function buildPrompt(report: CivicReport, hasAudio: boolean): string {
  const categories = REPORT_CATEGORIES.join(", ");
  return [
    "You are a civic issue analyst. Analyze the citizen report below and return STRICT JSON.",
    hasAudio
      ? "An audio voice note is attached: transcribe it verbatim into `transcript` (any language), and use it together with the text."
      : "There is no audio; set `transcript` to null.",
    "",
    `Report title: ${report.title}`,
    `Report description: ${report.description}`,
    `Citizen-selected category: ${report.category}`,
    "",
    `Classify into exactly one of: ${categories}.`,
    "Return JSON with keys:",
    '- "category": one of the allowed values',
    '- "confidence": number 0..1',
    '- "reasoning": 1-2 sentences explaining the classification, referencing the signal words you used',
    '- "keywords": array of up to 5 lowercase signal words detected',
    '- "summary": one concise sentence describing the issue',
    '- "transcript": the verbatim voice transcript, or null',
    "Respond with JSON only, no markdown.",
  ].join("\n");
}

/** Fetch audio from its Storage URL as inline base64 (best-effort). */
async function fetchAudioInline(
  url: string,
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType =
      res.headers.get("content-type")?.split(";")[0]?.trim() || "audio/ogg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_AUDIO_BYTES) return null;
    return { mimeType, data: buf.toString("base64") };
  } catch (err) {
    console.error("[ai/analysis] audio fetch failed:", err);
    return null;
  }
}

/** Extract a JSON object from a model response (handles stray text/fences). */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("No JSON object found in model response.");
  }
}

function coerceCategory(value: string): IssueCategory {
  const v = value?.toLowerCase().trim();
  return (REPORT_CATEGORIES as readonly string[]).includes(v)
    ? (v as IssueCategory)
    : "other";
}

function clampConfidence(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  const c = value > 1 ? value / 100 : value; // tolerate percentage form
  return Math.max(0, Math.min(1, Number(c.toFixed(2))));
}

/**
 * Analyze a report with Gemini and persist the result on the report document.
 * Returns the analysis, or null when Gemini is unconfigured or the call fails.
 */
export async function analyzeReport(
  report: CivicReport,
): Promise<AIAnalysis | null> {
  if (!isGeminiConfigured) return null;

  try {
    const audio = report.audioUrl
      ? await fetchAudioInline(report.audioUrl)
      : null;

    const model = getGeminiModel();
    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: buildPrompt(report, Boolean(audio)) }];
    if (audio) {
      parts.push({
        inlineData: { mimeType: audio.mimeType, data: audio.data },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        maxOutputTokens: 800,
      },
    });

    const parsed = aiOutputSchema.parse(parseJson(result.response.text()));

    const analysis: AIAnalysis = {
      category: coerceCategory(parsed.category),
      confidence: clampConfidence(parsed.confidence),
      reasoning: parsed.reasoning?.trim() || "No reasoning provided.",
      keywords: (parsed.keywords ?? []).slice(0, 5),
      summary: parsed.summary?.trim() || report.title,
      transcript: parsed.transcript?.trim() ? parsed.transcript.trim() : null,
      model: GEMINI_MODEL,
      generatedAt: new Date().toISOString(),
    };

    await getAdminDb()
      .collection(COLLECTIONS.reports)
      .doc(report.id)
      .update({ aiAnalysis: analysis });

    return analysis;
  } catch (err) {
    console.error("[ai/analysis] analysis failed:", err);
    return null;
  }
}
