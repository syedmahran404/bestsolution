/**
 * Escalation draft (U4 — one-tap escalation).
 *
 * Assembles a formal complaint addressed to the recommended department, built
 * DETERMINISTICALLY from the case's own facts. Deterministic (not AI) is the
 * right call here: a formal complaint must never contain hallucinated facts.
 * Pure function — safe to use anywhere.
 */
import { CATEGORY_META, DEPARTMENT_BY_CATEGORY } from "@/lib/constants";
import type { CivicCase, CivicReport, PriorityAssessment } from "@/types";

export interface EscalationDraft {
  department: string;
  subject: string;
  body: string;
}

export function buildEscalationDraft(
  civicCase: CivicCase,
  reports: CivicReport[],
  priority: PriorityAssessment,
): EscalationDraft {
  const department = DEPARTMENT_BY_CATEGORY[civicCase.category];
  const label = CATEGORY_META[civicCase.category].label;
  const where =
    civicCase.locality ??
    reports.find((r) => r.formattedAddress)?.formattedAddress ??
    `${civicCase.centerLocation.lat.toFixed(5)}, ${civicCase.centerLocation.lng.toFixed(5)}`;
  const today = new Date().toLocaleDateString("en-IN", {
    dateStyle: "long",
  });

  const subject = `Civic complaint: ${label} affecting ${where} (${civicCase.reportCount} report${civicCase.reportCount === 1 ? "" : "s"})`;

  const evidence = reports
    .slice(0, 5)
    .map(
      (r, i) =>
        `  ${i + 1}. ${r.title} — ${new Date(r.createdAt).toLocaleDateString("en-IN")}`,
    )
    .join("\n");

  const body = [
    `To: ${department}`,
    `Date: ${today}`,
    "",
    `Subject: ${subject}`,
    "",
    "Respected Sir/Madam,",
    "",
    `This is a consolidated civic complaint regarding a ${label.toLowerCase()} issue at ${where}. ` +
      `It has been reported ${civicCase.reportCount} time${civicCase.reportCount === 1 ? "" : "s"} by the community and assessed at ${priority.label.toUpperCase()} priority (score ${priority.score}/100).`,
    "",
    priority.contextFactors.length > 0
      ? `Context that raises the impact: this location is within close proximity to ${priority.contextFactors
          .map((f) => `a ${f.type} (${f.distanceM}m)`)
          .join(
            ", ",
          )}. An estimated ${priority.affectedPopulation.toLocaleString()} residents may be affected.`
      : `An estimated ${priority.affectedPopulation.toLocaleString()} residents may be affected.`,
    "",
    "Supporting reports:",
    evidence || "  (details available in the Velora civic case record)",
    "",
    "We request your department to inspect and resolve this issue at the earliest. " +
      "Kindly acknowledge this complaint and share an expected resolution timeline.",
    "",
    "Respectfully,",
    "Concerned Citizens (via Velora Civic AI)",
  ].join("\n");

  return { department, subject, body };
}
