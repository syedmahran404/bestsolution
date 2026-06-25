# Velora Civic AI — Hackathon Submission

> Coding Ninjas × Google — **Vibe2Ship** Hackathon
> Problem Statement #2 — _Community Hero: Hyperlocal Problem Solver_
> Copy the sections below directly into the submission Google Doc.

---

## 1. Problem Statement

Communities deal with constant hyperlocal civic problems — potholes, water
leaks, damaged streetlights, garbage, and drainage failures. Today's reporting
systems are **fragmented**, **opaque**, **hard to track**, and **slow to
resolve**. A single citizen complaint carries almost no weight: it is easy to
ignore and easy to lose. Citizens lack a way to turn scattered individual
voices into collective, undeniable pressure — and authorities lack a clear,
prioritized view of what is actually happening on the ground.

## 2. Solution Overview

**Velora Civic AI** is an AI Civic Operations Center that takes an issue from
report to resolution:

1. **Report** — a citizen submits an issue with a photo or a voice note (in any
   language) and a location.
2. **Understand** — Gemini classifies the issue and **shows its reasoning**
   (category, confidence, keywords, summary) and transcribes voice notes.
3. **Aggregate** — a deterministic engine merges nearby same-category reports
   into a single **civic case**, performing duplicate detection without AI or
   embeddings.
4. **Operate** — an operations center prioritizes cases, runs a transparent
   status workflow, and surfaces deterministic civic intelligence.

The core differentiator is **aggregation**: Velora turns many weak, scattered
reports into one structured, prioritized civic case that is hard to ignore.

## 3. Key Features

- Interactive **India civic map** (aggregated cases vs. single reports; status
  colors).
- **Citizen reporting**: photo upload, **voice recording/upload**, one-tap
  geolocation with manual fallback.
- **Visible AI reasoning** on every report (no black box).
- **Deterministic aggregation engine** → civic cases with running-average
  centroids.
- **AI case intelligence**: case summary + community-impact line.
- **Operations Center**: KPIs, most-reported categories, largest cases, active
  clusters, recent activity.
- **Case management**: search & filters (category, status, report count, date).
- **Status workflow**: Reported → Verified → In Progress → Resolved with a
  status timeline; updates cascade to all related views.

## 4. Technologies Used

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Next.js Route Handlers (no separate server).
- **Database/Storage:** Firebase Firestore + Firebase Storage.
- **Forms/validation:** React Hook Form + Zod.
- **Geospatial:** geolib (haversine distance).
- **Voice capture:** react-audio-voice-recorder.
- **Deployment:** Vercel.

## 5. Google Technologies Used

- **Gemini 2.5 Flash** via **Google AI Studio** — multimodal classification,
  voice transcription, reasoning, and civic case summaries.
- **Google Maps Platform** — the interactive India civic map and markers.
- **Firebase** (Firestore + Storage) — persistence for reports, civic cases,
  and media.

## 6. AI Features

- **One multimodal Gemini call per report** returns category, confidence,
  human-readable reasoning, detected keywords, a concise summary, and a verbatim
  voice transcript (any language).
- **Visible reasoning** surfaced in the UI for every report — transparent, not a
  black box.
- **AI civic case summaries** ("N reports indicate recurring X near Y") plus a
  community-impact line.
- **Token-efficient by design:** exactly one call per report (cached
  immutably); case summaries cached by report count; deterministic fallbacks;
  Gemini is never used for distance, clustering, aggregation, or analytics.

## 7. Architecture Summary

A single Next.js 14 application (one Vercel deployment) with Route Handlers as
the backend. Gemini is the **perception layer only**; all distance, clustering,
aggregation, and analytics are **deterministic** — making the system fast,
low-cost, and demo-stable. Firestore stores `reports` and `civicCases` (one case
has many reports); Firebase Storage holds photos and voice notes; Google Maps
renders the civic map.

```
Citizen → Report (photo/voice + location)
        → Gemini (classify + transcribe + reason)   [perception only]
        → Deterministic aggregation → Civic Case
        → Operations Center (status workflow + intelligence)
```

## 8. Demo Flow (suggested 90 seconds)

1. Open the map — civic cases as numbered bubbles across Indian cities.
2. Submit a report (photo or voice) — watch the AI reasoning appear.
3. Submit a second nearby same-category report — see it **aggregate** into one
   civic case (count increases).
4. Open the case — AI summary, member locations, linked reports, reasoning.
5. In the Operations Center, advance the case status to **Resolved** — the map,
   dashboards, and reports update.

## 9. Links

- GitHub: https://github.com/syedmahran404/bestsolution
- Live deployment: _add your Vercel URL here_
- Demo video: _add link here_
