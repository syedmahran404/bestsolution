# Velora Civic AI — Demo Script (90–120s)

> Coding Ninjas × Google — **Vibe2Ship** Hackathon
> Record at 1920×1080, light or dark theme (dark reads best on projectors).
> Pre-seed demo data first (`npm run seed`) so the map and dashboards look alive.

**Total target: ~110 seconds.** Timings are cumulative.

---

### 0:00–0:12 · Opening (first impression)
**On screen:** Landing page (`/`) — hero, Civic Health Index, animated KPIs, populated India map.
**Narration:**
> "This is Velora Civic AI — an AI civic operations center that turns scattered citizen complaints into prioritized, trackable civic cases. Everything you'll see is explainable, multilingual, and built on Google AI."

**Action:** Let the hero and KPIs animate in. Do not click yet.

---

### 0:12–0:24 · Problem + Solution
**On screen:** Slowly scroll the landing page — map clusters, insights, civic cases.
**Narration:**
> "A single pothole complaint is easy to ignore. Velora aggregates many reports into one undeniable case — and shows a living Civic Health Index for the whole city."

---

### 0:24–0:48 · Live Demo — Report an issue (the core loop)
**On screen:** Click **Report an issue** → `/report`.
**Action / click order:**
1. Select a category (e.g. *Water Leak*).
2. Add a short title.
3. Click **Use my location** (or search a place) — show the reverse-geocoded address (no raw coordinates).
4. (Optional) attach a photo or record a voice note.
5. Submit.
**Narration:**
> "A citizen reports in seconds — by photo or voice, in any of six languages. Gemini classifies it and shows its reasoning; it never asks the citizen to type coordinates."

---

### 0:48–1:05 · Perceived intelligence — AI reasoning + aggregation
**On screen:** The submitted report's **AI reasoning panel** (category, confidence, keywords, transcript), then open the resulting **case detail** (`/cases/[id]`).
**Narration:**
> "Every AI output is transparent — inputs, reasoning, confidence, and sources. Behind it, a deterministic engine merges nearby same-category reports into one civic case, with context-aware severity computed from real landmarks like schools and hospitals."

**Action:** Point to the **AI Operations Brief** and **Priority assessment** (note "computed deterministically").

---

### 1:05–1:24 · Mission Control + Global Search
**On screen:** Click **Operations center** → `/admin`.
**Action / click order:**
1. Show the KPI strip, alert rail, priority board, and live activity.
2. Press **⌘K / Ctrl+K** → global search; type a locality or category; show grouped results (cases, reports, localities, categories, AI mode).
3. Open a case from search and advance its status toward **Resolved**.
**Narration:**
> "Operators get a real command center — priorities, alerts, and an agentic brief. Global search reaches everything from anywhere, and status updates cascade across the map and dashboards instantly."

---

### 1:24–1:38 · Localization (the wow moment)
**On screen:** Open the **language selector** in the header; switch to **हिन्दी / ಕನ್ನಡ / বাংলা**.
**Narration:**
> "And it's genuinely multilingual — every screen, including dates and numbers, renders in the citizen's language. No mixed-language screens."

**Action:** Switch one or two languages and let a screen re-render live.

---

### 1:38–1:50 · Impact + Closing
**On screen:** Back to the landing page Civic Health Index.
**Narration:**
> "Velora makes civic problems measurable, explainable, and accountable — from the first report to resolution. That's Velora Civic AI."

---

## Recording checklist
- Seed demo data; confirm map, cases, and dashboards are populated.
- Use a clean browser profile (no extensions, no console open on camera).
- Disable notifications; full-screen the browser.
- Pre-open `/report` form once so assets are warm (avoids first-load jank).
- Have one report ready to submit live; one case ready to resolve.
- Keep cursor movements deliberate — every click should feel intentional.
