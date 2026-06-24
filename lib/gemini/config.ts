/**
 * Gemini configuration layer — Phase 1.
 *
 * SCOPE: configuration + a ready-to-use model factory ONLY.
 * There is intentionally NO prompt, classification, vision, or agent logic
 * here yet — that arrives in Phase 2 (perception) and Phase 4 (agent).
 *
 * The API key is read from the GEMINI_API_KEY env var (generated in Google
 * AI Studio). This module is server-only; never expose the key to the client.
 */
import "server-only";

import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

import { GEMINI_MODEL } from "@/lib/constants";

/** True when a Gemini API key is present in the environment. */
export const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);

let cachedClient: GoogleGenerativeAI | null = null;

/** Lazily create (and cache) the Google Generative AI client. */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!isGeminiConfigured) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY (from Google AI Studio).",
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  }
  return cachedClient;
}

/**
 * Return a ready-to-use generative model. Defaults to the project model
 * (gemini-2.5-flash). Future phases pass generationConfig / tools here.
 */
export function getGeminiModel(
  modelName: string = GEMINI_MODEL,
): GenerativeModel {
  return getGeminiClient().getGenerativeModel({ model: modelName });
}
