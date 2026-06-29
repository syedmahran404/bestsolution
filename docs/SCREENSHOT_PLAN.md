# Velora Civic AI — Screenshot Plan (8 Hero Shots)

> Capture at **2× device pixel ratio** for crisp images. Seed demo data first
> so screens look populated. Save to `docs/screenshots/` with the filenames
> below so the README gallery renders automatically.
>
> Pre-capture hygiene (all shots): no console errors, no loading skeletons
> visible (wait for content), no half-played animations, no empty states unless
> intentionally demonstrating one, clean typography and spacing.

| # | Screenshot | Route | Browser size | UI state | Actions required | Ideal framing | Filename |
|---|------------|-------|--------------|----------|------------------|---------------|----------|
| 1 | **Landing page** | `/` | 1440×900 desktop | Live/seed data, KPIs settled, map populated | Load, wait for hero + counters to finish animating | Full hero + Civic Health Index + top of map | `01-landing.png` |
| 2 | **Report an issue** | `/report` | 1440×900 desktop | Category selected, location captured, optional photo attached | Pick category, capture location, attach a sample photo | Whole form card with the AI-ready state visible | `02-report.png` |
| 3 | **Operations Center** | `/admin` | 1600×1000 desktop | Backend configured, cases loaded | Navigate from header; let dashboard settle | KPI strip + command-center grid + alert rail | `03-operations.png` |
| 4 | **Global search** | any (overlay) | 1440×900 desktop | Command palette open with a query + grouped results | Press ⌘K/Ctrl+K, type e.g. "Koramangala" | Centered palette with cases/localities/categories groups | `04-search.png` |
| 5 | **AI case detail** | `/cases/[id]` | 1440×1100 desktop | A case with AI summary + ops brief + transparency | Open a populated, aggregated case | AI Operations Brief + Priority assessment + transparency panel | `05-case-detail.png` |
| 6 | **India civic map** | `/` (map focus) | 1600×1000 desktop | Clusters + a selected case preview card | Scroll to map, click a cluster/case to open the preview | Map filling frame, legend + selected preview visible | `06-map.png` |
| 7 | **Localization** | `/` | 1440×900 desktop | A non-English locale active (e.g. हिन्दी or ಕನ್ನಡ) | Switch language via header selector | Hero/dashboard fully in the chosen script | `07-localization.png` |
| 8 | **Mobile view** | `/` or `/report` | 390×844 (iPhone 12/13) | Responsive layout, mobile nav, map bottom-sheet | Use device toolbar / responsive mode | Full mobile viewport, no horizontal scroll | `08-mobile.png` |

## Optional bonus shots (if time)
- `/reports` — "My civic impact" achievement card (success/empty-state quality).
- Dark theme variant of the landing page (toggle in header).
- The first-launch language picker modal (fresh profile / cleared storage).

## Tips
- For #4 and #8, use the browser's device toolbar; hide the URL bar where possible.
- For #7, capture the same screen as #1 in another language to show parity.
- Keep a consistent theme across shots (all light or all dark) for a cohesive gallery.
