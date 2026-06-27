"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, Terminal, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThinkingDots } from "@/components/motion/thinking-dots";

interface AgentStep {
  tool: string;
  detail: string;
}
interface AgentResult {
  answer: string;
  steps: AgentStep[];
  usedTools: string[];
  generatedBy: "ai" | "deterministic";
  needsClarification: boolean;
}

const SUGGESTIONS = [
  "What needs attention today?",
  "Where are the worst hotspots?",
  "How healthy is the city right now?",
];

/**
 * "Ask Velora" command bar (U3) — natural-language civic operations queries
 * answered by the tool-using agent, with visible tool-call reasoning steps.
 */
export function OpsAgent() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    const question = q.trim();
    if (question.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });
      const data = (await res.json()) as {
        result?: AgentResult;
        error?: string;
      };
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Agent request failed.");
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-brand/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base text-brand">
          <Sparkles className="h-4 w-4" />
          Ask Velora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(query);
          }}
          className="flex gap-2"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about priorities, hotspots, city health…"
            aria-label="Ask the operations agent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                ask(s);
              }}
              className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* AI thinking choreography (MO3) */}
        {loading && (
          <div className="animate-fade-in space-y-2 rounded-md border border-brand/20 bg-brand/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-brand">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Velora is analyzing
              <ThinkingDots />
            </p>
            <div className="space-y-1.5">
              <div className="shimmer h-2.5 w-3/4 animate-shimmer rounded" />
              <div className="shimmer h-2.5 w-1/2 animate-shimmer rounded" />
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Visible reasoning steps */}
            {result.steps.length > 0 && (
              <div className="space-y-1 rounded-md border bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5" />
                  Reasoning ({result.usedTools.length} tool
                  {result.usedTools.length === 1 ? "" : "s"} used)
                </p>
                <ol className="space-y-1">
                  {result.steps.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <span className="font-mono text-brand">{s.tool}</span> →{" "}
                      {s.detail}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Answer */}
            <div className="rounded-md border border-brand/20 bg-brand/5 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                {result.needsClarification ? (
                  <HelpCircle className="h-4 w-4 text-warning" />
                ) : (
                  <Sparkles className="h-4 w-4 text-brand" />
                )}
                <Badge variant="secondary">
                  {result.generatedBy === "ai" ? "AI + tools" : "Deterministic"}
                </Badge>
                {result.needsClarification && (
                  <Badge variant="secondary">Needs clarification</Badge>
                )}
              </div>
              <p className="text-sm text-foreground">
                {result.answer.replace(/^CLARIFY:\s*/i, "")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
