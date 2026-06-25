# Velora Civic AI

**An AI Civic Operations Center — from issue reporting to issue resolution.**

Built for the **Coding Ninjas × Google — Vibe2Ship** Hackathon
(Problem Statement #2 — _Community Hero: Hyperlocal Problem Solver_).

Velora is not a complaint form. It is an AI-powered civic intelligence platform:
citizens report issues by photo or voice, AI explains its understanding, the
system **aggregates many reports into one undeniable civic case**, and an
operations center tracks every case to resolution.

---

## Problem Statement

Communities face everyday civic problems — potholes, water leaks, broken
streetlights, garbage, drainage. Existing reporting is **fragmented**, **opaque**,
**hard to track**, and **slow to resolve**. Crucially, a single citizen complaint
carries little weight and is easily lost in a queue.

## Solution Overview

Velora turns scattered individual reports into **structured, prioritized civic
cases** and makes the whole pipeline transparent:

1. **Report** — a citizen submits an issue (photo or voice, with location).
2. **Understand** — Gemini classifies the issue and **explains its reasoning**
   (no black box), transcribing voice notes in any language.
3. **Aggregate** — a deterministic engine merges nearby same-category reports
   into one **civic case** (duplicate detection without AI/embeddings).
4. **Operate** — an operations center prioritizes cases, tracks a status
   workflow, and surfaces deterministic intelligence.

## Key Features

- **Interactive India map** — civic cases as numbered bubbles, single reports as
  pins; red/amber/green status colors.
- **Citizen reporting** — title, description, category, **photo upload**,
  **voice recording/upload**, one-tap **geolocation** (manual fallback).
- **Visible AI reasoning** — category, confidence, reasoning, keywords, summary,
  and voice transcript shown for every report.
- **Aggregation engine** — deterministic geospatial clustering into civic cases.
- **AI case intelligence** — concise case summary + community-impact line.
- **Operations Center** — KPI dashboard, most-reported categories, largest cases,
  active clusters, recent activity.
- **Case management** — search & filters (category, status, report count, date).
- **Status workflow** — Reported → Verified → In Progress → Resolved, with a
  status timeline; changes cascade to all member reports.

## Architecture

```
Next.js 14 (App Router, RSC)            ── one app, one Vercel deploy
 ├─ Client components: map, report form, voice recorder, filters, status mgr
 ├─ Server components: home, admin, case detail, my reports
 └─ Route Handlers (/api): reports, cases, case status
        │
        ├─ Gemini 2.5 Flash  ── perception ONLY (classify, transcribe, reason, summarize)
        ├─ Deterministic core ── distance, clustering, aggregation, insights (no AI)
        ├─ Firebase Firestore ── reports, civicCases
        ├─ Firebase Storage   ── photos, voice notes
        └─ Google Maps        ── interactive map + markers
```

**Design principle:** Gemini is used **only** for perception. All distance,
clustering, aggregation, and analytics are deterministic — fast, free, and
demo-stable. AI outputs are cached (report analysis is immutable; case summaries
are cached by report count) to minimize token usage.

## Tech Stack

| Layer    | Choice                                    |
| -------- | ----------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript       |
| UI       | Tailwind CSS, shadcn/ui, lucide-react     |
| Backend  | Next.js Route Handlers                    |
| Database | Firebase Firestore                        |
| Storage  | Firebase Storage                          |
| Maps     | Google Maps (`@vis.gl/react-google-maps`) |
| AI       | Gemini 2.5 Flash (Google AI Studio)       |
| Forms    | React Hook Form + Zod                     |
| Geo      | geolib (haversine distance)               |
| Deploy   | Vercel                                    |

## Google Technologies Used

- **Gemini 2.5 Flash** (via Google AI Studio) — multimodal classification,
  voice transcription, reasoning, and case summaries.
- **Google Maps Platform** — the interactive India civic map.
- **Firebase** (Firestore + Storage) — data and media persistence.

## AI Workflow

```
Report submitted (photo/voice + text + location)
   │
   ├─ ONE Gemini multimodal call ─▶ { category, confidence, reasoning,
   │                                  keywords, summary, transcript }
   │      (stored immutably on the report — never re-called)
   │
   ├─ Deterministic aggregation ─▶ attach to nearest same-category case
   │      within 150m, or create a new case (running-average centroid)
   │
   └─ On case view ─▶ cached AI case summary + community impact
          (regenerated only when the case grows; deterministic fallback)
```

Robustness: if a voice format is unsupported, analysis retries text-only so
classification still succeeds. If Gemini is unconfigured, reports still submit
and aggregate (analysis simply omitted).

---

## Installation

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev                  # http://localhost:3000
```

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run seed         # seed demo issues into Firestore (needs admin creds)
npm run check:gemini # validate the live Gemini classification path
```

## Environment Setup

Copy `.env.example` → `.env.local` and provide:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps JavaScript API key
- `GEMINI_API_KEY` — from Google AI Studio
- `NEXT_PUBLIC_FIREBASE_*` — Firebase web app config (client)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — base64 or raw service-account JSON (server)
- `FIREBASE_STORAGE_BUCKET` — e.g. `your-project.appspot.com`

The app degrades gracefully when keys are missing (map shows a placeholder /
demo data; AI features are skipped).

### Firebase rules (demo)

```
// Storage — allow citizen uploads under reports/
match /reports/{allPaths=**} { allow read, write: if true; }
```

Firestore `reports` / `civicCases` are written server-side via the Admin SDK.

## Deployment (Vercel)

1. Push to GitHub and import the repo into Vercel (Next.js auto-detected).
2. Add every variable from `.env.example` under **Settings → Environment
   Variables**.
3. Deploy. No extra configuration required (`package-lock.json` ensures
   reproducible installs).

## Project Structure

```
app/         routes (home, report, reports, cases/[id], admin, admin/cases) + /api
components/  ui/ (shadcn), map/, report/, ai/, cases/, admin/
lib/         aggregation, civic-cases, insights, reports, constants, ai/, firebase/, gemini/
types/       domain models
scripts/     seed.ts, check-gemini.mjs
docs/        hackathon submission content
```

## Future Scope

- Department routing & resolution recommendations (AI-assisted).
- Authenticated citizen/admin roles.
- Temporal auto-escalation of unresolved cases.
- Multilingual UI and SLA accountability scoreboards.

---

_Built with Google AI Studio (Gemini), Google Maps, and Firebase._
