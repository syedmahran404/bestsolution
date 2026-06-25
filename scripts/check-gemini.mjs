/**
 * Live Gemini validation harness (run on a machine WITH internet — e.g. your
 * laptop or CI, NOT the build sandbox which has no external network).
 *
 * Validates that the API key + model + JSON classification prompt actually work
 * end to end, mirroring lib/ai/analysis.ts.
 *
 * Usage:
 *   npm run check:gemini            (loads .env.local automatically)
 *   GEMINI_API_KEY=your_key node scripts/check-gemini.mjs
 *
 * The key is read from the environment only — never hardcode it.
 */
import { existsSync } from "node:fs";
import dotenv from "dotenv";

// Load local env files (gitignored) when the key isn't already in the
// environment, so `npm run check:gemini` works without extra flags. Existing
// environment variables are never overridden.
if (!process.env.GEMINI_API_KEY) {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) dotenv.config({ path: file });
  }
}

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("✗ GEMINI_API_KEY is not set in the environment.");
  process.exit(1);
}

const MODEL = "gemini-2.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

const prompt = [
  "You are a civic issue analyst. Return STRICT JSON.",
  "Report title: Water leaking near the bus stand",
  "Report description: A pipe has burst and water is flooding the road for two days.",
  "Classify into one of: pothole, water_leak, garbage, streetlight, drainage, other.",
  'Return JSON: {"category": "...", "confidence": 0..1, "reasoning": "...", "keywords": [], "summary": "..."}',
].join("\n");

try {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
  });

  console.log("HTTP status:", res.status);
  const data = await res.json();
  if (!res.ok) {
    console.error("✗ Gemini error:", JSON.stringify(data).slice(0, 400));
    process.exit(1);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("Raw model output:", text);
  const parsed = JSON.parse(text);
  console.log("✓ Parsed category:", parsed.category);
  console.log("✓ Confidence:", parsed.confidence);
  console.log("✓ Reasoning:", parsed.reasoning);
  console.log("\n✓ Gemini classification validation PASSED.");
  process.exit(0);
} catch (err) {
  console.error("✗ Validation failed:", err.message);
  process.exit(1);
}
