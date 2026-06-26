/**
 * Velora Operations Agent (U3 — tool-using agentic layer).
 *
 * A genuinely agentic loop: Gemini is given TOOLS that wrap our deterministic
 * civic functions (priority ranking, hotspots, health, case lookup) and decides
 * which to call to answer a natural-language operations question. The tools run
 * locally over the already-loaded cases, so the agent is real (function calling)
 * yet token-bounded (no extra Firestore/Gemini work inside tools).
 *
 * Safety: isolated from the report-submit path; bounded tool rounds; if Gemini
 * is unconfigured or errors, a deterministic answer is returned. If the question
 * is ambiguous or data is thin, the agent asks ONE clarifying question instead
 * of guessing (uncertainty handling).
 */
import "server-only";

import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";

import { CATEGORY_META, GEMINI_MODEL } from "@/lib/constants";
import { getGeminiClient, isGeminiConfigured } from "@/lib/gemini/config";
import { computeCivicHealthOverview } from "@/lib/civic-health";
import { computeOperationsMetrics } from "@/lib/insights";
import { computePriority, recommendAction } from "@/lib/operations";
import type { CivicCase } from "@/types";

export interface AgentStep {
  tool: string;
  detail: string;
}

export interface AgentResult {
  answer: string;
  steps: AgentStep[];
  usedTools: string[];
  generatedBy: "ai" | "deterministic";
  /** True when the agent asked a clarifying question instead of answering. */
  needsClarification: boolean;
}

/* ------------------------------- Tools ---------------------------------- */

type ToolImpl = (cases: CivicCase[], args: Record<string, unknown>) => unknown;

const TOOLS: Record<string, ToolImpl> = {
  get_priority_ranking: (cases) =>
    cases
      .map((c) => {
        const p = computePriority(c);
        return {
          id: c.id,
          category: CATEGORY_META[c.category].label,
          reports: c.reportCount,
          priority: p.score,
          label: p.label,
          recommendation: recommendAction(c, p).label,
          locality: c.locality ?? "unknown",
          status: c.status,
        };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8),

  find_hotspots: (cases) => {
    const m = new Map<string, number>();
    for (const c of cases) {
      if (c.status === "resolved") continue;
      const loc = (c.locality ?? "").trim();
      if (!loc) continue;
      m.set(loc, (m.get(loc) ?? 0) + c.reportCount);
    }
    return [...m.entries()]
      .map(([locality, reports]) => ({ locality, reports }))
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 6);
  },

  get_health_summary: (cases) => {
    const o = computeCivicHealthOverview(cases);
    return {
      cityScore: o.city.score,
      cityTrend: o.city.trend,
      resolutionRate: o.resolution.resolutionRate,
      avgResolutionHours: o.resolution.avgResolutionHours,
      worstCategories: o.categories
        .slice(0, 3)
        .map((c) => ({ name: c.name, score: c.score, trend: c.trend })),
    };
  },

  get_case_counts: (cases) => {
    const m = computeOperationsMetrics(cases);
    return {
      totalCases: m.totalCases,
      totalReports: m.totalReports,
      open: m.openCases,
      resolved: m.closedCases,
      activeClusters: m.activeClusters.length,
    };
  },

  get_case_details: (cases, args) => {
    const id = String(args.caseId ?? "");
    const c = cases.find((x) => x.id === id);
    if (!c) return { error: "Case not found." };
    const p = computePriority(c);
    return {
      id: c.id,
      category: CATEGORY_META[c.category].label,
      reports: c.reportCount,
      status: c.status,
      locality: c.locality ?? "unknown",
      severity: c.severityLabel ?? "n/a",
      priority: p.score,
      recommendation: recommendAction(c, p).label,
    };
  },
};

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_priority_ranking",
    description:
      "Top open civic cases ranked by deterministic priority (severity + aggregation + recency), with recommended action.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "find_hotspots",
    description:
      "Localities with the most unresolved reports (civic hotspots).",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "get_health_summary",
    description:
      "Civic Health Index summary: city score, trend, resolution rate, worst categories.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "get_case_counts",
    description:
      "Aggregate counts: total cases/reports, open, resolved, clusters.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "get_case_details",
    description: "Details for a single civic case by its id.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        caseId: { type: SchemaType.STRING, description: "The civic case id." },
      },
      required: ["caseId"],
    },
  },
];

const SYSTEM_INSTRUCTION = [
  "You are Velora's civic operations agent for a city command center.",
  "Answer operations questions by CALLING the provided tools — never invent numbers.",
  "Tools return deterministic civic data; base every claim on tool results.",
  "If the question is ambiguous, or the tools return little/no data, ask ONE concise clarifying question instead of guessing (start it with 'CLARIFY:').",
  "Keep answers concise, specific, and action-oriented. Cite localities, counts, and priorities from the tools.",
].join(" ");

function summarize(out: unknown): string {
  const s = JSON.stringify(out);
  return s.length > 300 ? s.slice(0, 300) + "…" : s;
}

/** Deterministic fallback when Gemini is unconfigured or errors. */
function deterministicAnswer(cases: CivicCase[]): AgentResult {
  const ranking = TOOLS.get_priority_ranking(cases, {}) as Array<{
    category: string;
    priority: number;
    label: string;
    locality: string;
    recommendation: string;
  }>;
  const steps: AgentStep[] = [
    { tool: "get_priority_ranking", detail: summarize(ranking) },
  ];
  if (ranking.length === 0) {
    return {
      answer: "No civic cases are available yet to prioritize.",
      steps,
      usedTools: ["get_priority_ranking"],
      generatedBy: "deterministic",
      needsClarification: false,
    };
  }
  const top = ranking.slice(0, 3);
  const lines = top
    .map(
      (r, i) =>
        `${i + 1}. ${r.category} in ${r.locality} — priority ${r.priority} (${r.label}); ${r.recommendation}.`,
    )
    .join(" ");
  return {
    answer: `Top priorities right now: ${lines}`,
    steps,
    usedTools: ["get_priority_ranking"],
    generatedBy: "deterministic",
    needsClarification: false,
  };
}

/** Run the tool-using operations agent over the provided cases. */
export async function runOpsAgent(
  query: string,
  cases: CivicCase[],
): Promise<AgentResult> {
  if (!isGeminiConfigured) return deterministicAnswer(cases);

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: GEMINI_MODEL,
      tools: [{ functionDeclarations }],
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    const chat = model.startChat();
    const steps: AgentStep[] = [];

    let resp = await chat.sendMessage(query);
    let rounds = 0;
    const MAX_ROUNDS = 4;

    while (rounds < MAX_ROUNDS) {
      const calls = resp.response.functionCalls?.() ?? [];
      if (!calls || calls.length === 0) break;

      const responses = calls.map((call) => {
        const impl = TOOLS[call.name];
        const out = impl
          ? impl(cases, (call.args as Record<string, unknown>) ?? {})
          : { error: "unknown tool" };
        steps.push({ tool: call.name, detail: summarize(out) });
        return {
          functionResponse: { name: call.name, response: { result: out } },
        };
      });

      resp = await chat.sendMessage(responses);
      rounds += 1;
    }

    const text = resp.response.text().trim();
    const needsClarification = text.toUpperCase().startsWith("CLARIFY:");
    return {
      answer: text || "Could you rephrase that with a more specific question?",
      steps,
      usedTools: Array.from(new Set(steps.map((s) => s.tool))),
      generatedBy: "ai",
      needsClarification,
    };
  } catch (err) {
    console.error("[ai/agent] run failed:", err);
    return deterministicAnswer(cases);
  }
}
