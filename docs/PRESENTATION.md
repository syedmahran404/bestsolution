# Velora Civic AI — Presentation Outline

> Suggested 8–10 slides. Pair with `DEMO_SCRIPT.md` for the live segment.

---

### Slide 1 — Title
- **Velora Civic AI** — *An AI Civic Operations Center.*
- Tagline: "From issue reporting to issue resolution."
- Vibe2Ship Hackathon · Problem Statement #2 — Community Hero: Hyperlocal Problem Solver.
- Logo / hero banner.

### Slide 2 — The Problem
- Hyperlocal civic issues (potholes, water leaks, streetlights, garbage, drainage).
- Today's reporting is **fragmented, opaque, hard to track, slow to resolve**.
- A single complaint carries little weight — scattered voices, no collective pressure.
- Authorities lack a prioritized operating picture.

### Slide 3 — Existing Challenges
- Complaint forms ≠ resolution; no aggregation, no prioritization.
- AI tools are black boxes → low trust.
- Language barriers exclude most citizens.
- No accountability metric for "how healthy is my city?"

### Slide 4 — The Solution
- Report → Understand → Contextualize → **Aggregate** → Operate.
- Many weak reports become **one undeniable, prioritized civic case**.
- Everything explainable; multilingual; tracked to resolution.

### Slide 5 — Architecture
- One Next.js 14 app (App Router) + Route Handlers; one Vercel deploy.
- **Gemini = perception only**; clustering, severity, priority, health are **deterministic** (fast, free, explainable, demo-stable).
- Google Maps + Geocoding + Places; Firebase Firestore + Storage.
- *(Use the Mermaid diagram from the README.)*

### Slide 6 — Technology Stack
- Next.js 14, TypeScript, Tailwind, shadcn/ui, lucide-react.
- Gemini 2.5 Flash (Google AI Studio), Google Maps Platform, Firebase.
- React Hook Form + Zod, geolib, dependency-free accessible SVG charts.
- 6-language i18n with per-script Noto fonts; reduced-motion-safe motion system.

### Slide 7 — AI Experience (perceived intelligence)
- One multimodal Gemini call per report → category, confidence, reasoning, keywords, summary, transcript (cached, immutable).
- **Visible reasoning** on every report; agentic operations brief; "Ask Velora" tool-using agent.
- Context-aware **explainable severity** from real landmarks.
- Token-disciplined and robust (deterministic fallbacks when AI is unconfigured).

### Slide 8 — Live Demo
- Switch to the app — follow `DEMO_SCRIPT.md` (report → AI reasoning → aggregation → Mission Control → search → localization).

### Slide 9 — Impact
- Collective pressure: aggregation makes issues undeniable.
- Inclusion: vernacular voice + 6-language UI.
- Accountability: the **Civic Health Index** (0–100 per city / category / ward).
- Operator efficiency: prioritized command center.

### Slide 10 — Future Scope + Winning Points
- **Roadmap:** department routing + notifications, authenticated roles, real-time dashboards, temporal auto-escalation.
- **Why we win:** explainable (not black box) · aggregation moat · context-aware severity · Civic Health Index · genuinely multilingual · deterministic-first reliability · premium, accessible UX.

---

## Judge Q&A — anticipated questions
- **"Is the AI just a wrapper?"** → No. Gemini handles perception only; aggregation, severity, priority, and health are deterministic and explainable. We show the reasoning and the math.
- **"How do you avoid duplicate/false merges?"** → Distance + same-category clustering with a keyword false-merge guard; no embeddings needed, fully deterministic.
- **"What if Gemini/Maps/Firebase is down or unconfigured?"** → The app fails open: reports still submit, aggregate, and get deterministic briefs; the map shows a graceful placeholder/demo data.
- **"How is severity computed?"** → Reverse-geocoded locality + nearby Places (schools, hospitals, transit) → transparent additive severity ("within 40m of a hospital: +25").
- **"Token cost at scale?"** → Exactly one cached call per report; summaries/briefs cached by state; deterministic core adds zero network cost.
- **"Localization depth?"** → Six locales, runtime switching, localized dates/numbers, a lint guard (`check:i18n`) preventing untranslated strings from regressing.
- **"Accessibility?"** → Keyboard nav with visible focus, ARIA on search/map/forms, reduced-motion support, screen-reader data-table alternatives for charts.
