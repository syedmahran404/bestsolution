# Velora Civic AI

**An AI Civic Operations Center — "From Issue Reporting to Issue Resolution."**

Built for the Coding Ninjas × Google **Vibe2Ship** Hackathon (Problem Statement #2 — _Community Hero: Hyperlocal Problem Solver_).

Velora is not a complaint form. It is an AI-powered civic intelligence platform where citizens report issues (by photo or voice) and AI agents classify, score severity, **aggregate many reports into one undeniable civic case**, recommend the responsible department, draft escalations, and track the issue through to resolution.

---

## Status: Phase 3 — Aggregation Engine ✅

The core differentiator: many individual reports are automatically collapsed
into consolidated **civic cases** using **deterministic geospatial clustering**
(no AI, no embeddings).

- **Duplicate detection / clustering**: a new report is attached to the nearest
  existing case of the **same category** within `AGGREGATION_RADIUS_M` (150m,
  via `geolib` haversine distance); otherwise a new case is created.
- **`CivicCase` entity** (`civicCases` collection): `id, category,
centerLocation, reportCount, status, reportIds, createdAt, updatedAt`. The
  centroid is maintained as a running average.
- **Relationship**: one `CivicCase` ── has many ──> `reports`
  (each report stores its `civicCaseId`).
- **Map visualization**: aggregated cases render as numbered bubbles; single
  reports render as teardrop pins (clear visual distinction).
- **Case detail screen** (`/cases/[id]`): category, report count, status,
  member locations (mini-map), and linked reports — read-only.
- **Aggregation metrics** on the home page: total reports, total civic cases,
  average reports per case.
- **API**: `GET /api/cases`, `GET /api/cases/[id]`. Report creation
  (`POST /api/reports`) now runs the aggregation engine automatically.

> No AI, severity scoring, department routing, resolution, or admin yet —
> those are Phases 4–5.

---

## Status: Phase 2 — Citizen Reporting System ✅

Builds on the Phase 1 foundation. Citizens can now submit civic reports.

- **Report form** (`/report`): title, description, category, photo upload, voice
  note (record or upload), and location (one-tap Geolocation + manual fallback)
- **Voice recording** via the open-source `react-audio-voice-recorder`
- **Image + audio** uploaded to **Firebase Storage**; URLs persisted in Firestore
- **Validation** with **Zod** + **React Hook Form** (shared client/server schema)
- **API**: `POST /api/reports` (create) and `GET /api/reports` (list) — Next.js
  Route Handlers writing via the Firebase Admin SDK
- **My Reports** (`/reports`): lists submitted reports with status, category,
  location, and timestamp
- New `reports` Firestore collection: `id, title, description, category,
imageUrl, audioUrl, latitude, longitude, status, createdAt`

> No AI, aggregation, severity, department routing, or admin yet — those are
> Phases 3–5.

### Required Firebase rules (demo)

Client-side uploads/reads need permissive rules for the hackathon demo. In
**Firestore** and **Storage**, allow the `reports` paths (tighten with Auth
later):

```
// Storage
match /reports/{allPaths=**} { allow read, write: if true; }
```

The `reports` collection is written server-side via the Admin SDK (bypasses
Firestore rules), and read on the server for "My Reports".

---

## Status: Phase 1 — Foundation & Infrastructure ✅

This phase delivers a production-ready foundation only (no AI logic yet):

- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Interactive **India civic map** (Google Maps via `@vis.gl/react-google-maps`)
- **Seeded demo issues** across Delhi, Mumbai, Hyderabad, Bengaluru, Mysuru
- Status-colored markers (red = open, amber = in progress, green = resolved)
- Firebase initialization layer (client + admin), Firestore + Storage ready
- Gemini configuration layer (config only — perception arrives in Phase 2)
- Typed domain models (`Issue`, `Cluster`, `GeoLocation`, `IssueStatus`)
- Vercel-ready environment handling

> Later phases: (2) Citizen reporting, (3) Aggregation engine — the moat,
> (4) Voice + agent reasoning, (5) Admin operations center, (6) Polish.

---

## Tech Stack

| Layer        | Choice                                    |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 14 (App Router), TypeScript       |
| Styling / UI | Tailwind CSS, shadcn/ui                   |
| Maps         | Google Maps + `@vis.gl/react-google-maps` |
| Database     | Firebase Firestore                        |
| Storage      | Firebase Storage                          |
| AI           | Gemini 2.5 Flash (Google AI Studio)       |
| Deploy       | Vercel                                    |

---

## Project Structure

```
app/                 App Router routes, layout, global styles
  layout.tsx         Root layout + metadata
  page.tsx           Civic Operations Center landing (stats + map)
  globals.css        Tailwind base + design tokens
components/
  ui/                shadcn primitives (button, card, badge)
  map/               CivicMap (client) + MapLegend
  site-header.tsx    Brand / top bar
lib/
  constants.ts       Map config, status/category metadata, model name
  utils.ts           cn() class merger
  seed-data.ts       Mock civic issues (Phase 1 demo data)
  firebase/
    client.ts        Browser Firebase singleton (Firestore + Storage)
    admin.ts         Server-only Admin SDK singleton
  gemini/
    config.ts        Gemini client factory (config only)
types/
  index.ts           Core domain models
scripts/
  seed.ts            Push seed data into Firestore (run locally/CI)
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#   then fill in the values (see .env.example for where to get each key)

# 3. Run the dev server
npm run dev
#   → http://localhost:3000
```

The map renders with just `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Without it, the
app shows a graceful placeholder (the build still succeeds).

### Useful scripts

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run seed       # push seed issues to Firestore (needs Firebase admin creds)
```

---

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo into Vercel (framework auto-detected as Next.js).
3. Add every variable from `.env.example` under
   **Project Settings → Environment Variables**.
4. Deploy. No additional configuration is required.

---

## Environment Variables

See [`.env.example`](./.env.example) for the full list and where to obtain each
key. Public (`NEXT_PUBLIC_*`) values are safe for the browser; `GEMINI_API_KEY`
and `FIREBASE_SERVICE_ACCOUNT_KEY` are server-only secrets.
