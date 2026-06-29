# Velora Civic AI — Deployment Checklist (Vercel)

> The app is a single Next.js 14 deployment. It **degrades gracefully** when keys
> are missing (map placeholder / demo data; AI features skipped), so it deploys
> even with partial configuration — but the full experience needs the keys below.

## 1. Pre-deploy verification (local)
- [ ] `npm install` (clean install; `package-lock.json` committed for reproducibility)
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → 0 errors (includes `check:i18n` raw-string guard)
- [ ] `npm run build` → succeeds, all routes compile
- [ ] `npm run check:gemini` → passes (validates the live Gemini path; needs `GEMINI_API_KEY`)
- [ ] No secrets committed (`.env*.local`, `*serviceAccount*.json` are git-ignored)

## 2. Vercel project setup
- [ ] Import the GitHub repo into Vercel (Next.js auto-detected; no build overrides needed)
- [ ] Framework preset: **Next.js**; build command `next build`; output handled automatically
- [ ] Node version ≥ 18.17 (matches `engines` in `package.json`)

## 3. Environment variables (Vercel → Settings → Environment Variables)
Add every key from `.env.example` for the **Production** (and Preview) environments:
- [ ] `NEXT_PUBLIC_SITE_URL` → your canonical Vercel URL (prevents OG/sitemap URL issues)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` → Maps JavaScript API (client); restrict by HTTP referrer to your domain
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` → optional vector map style
- [ ] `GOOGLE_MAPS_SERVER_KEY` → **separate** key; restrict by API (Geocoding + Places), not referrer
- [ ] `GEMINI_API_KEY` → Google AI Studio (server-only)
- [ ] `NEXT_PUBLIC_FIREBASE_*` (6 values) → Firebase web config (client)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` → base64 of the service-account JSON (single-line)
- [ ] `FIREBASE_STORAGE_BUCKET` → e.g. `your-project-id.appspot.com`

## 4. Google Cloud / Firebase enablement
- [ ] Enable **Maps JavaScript API**, **Geocoding API**, and **Places API** on the Maps project
- [ ] Public Maps key restricted to your Vercel domain(s) (referrer)
- [ ] Server Maps key restricted by API (Geocoding + Places)
- [ ] Firestore created; **security rules** locked down before public traffic
- [ ] Storage bucket created; rules allow citizen uploads under `reports/` (tighten for production)
- [ ] Gemini API key active in Google AI Studio

## 5. Build / runtime notes (already handled in code)
- [ ] `/icon` and `/opengraph-image` run on the **edge runtime** (next/og) — expected; do not change to Node
- [ ] `SITE.url` normalizes empty/invalid `NEXT_PUBLIC_SITE_URL` to a valid default (avoids `metadataBase` URL errors)
- [ ] Pages that read live data use `dynamic = "force-dynamic"` (no stale static cache)
- [ ] Images: report media served from Firebase Storage URLs; SVG markers are inline (no external image optimization needed)

## 6. Post-deploy smoke test (on the live URL)
- [ ] Landing page loads; map renders (or graceful placeholder if Maps key missing)
- [ ] Submit a test report (photo + voice) → AI reasoning appears
- [ ] Two nearby same-category reports aggregate into one case
- [ ] Operations Center loads; status update cascades to map/dashboards
- [ ] Global search (⌘K) returns cases/reports/localities/categories
- [ ] Language switch re-renders a screen fully (no mixed-language text)
- [ ] Social preview: paste the URL into a link unfurler → OG card renders
- [ ] Favicon shows in the browser tab
- [ ] Lighthouse: no critical a11y/perf regressions

## 7. Do NOT
- ❌ Force-push or rewrite deployment history
- ❌ Commit real `.env.local` or service-account JSON
- ❌ Disable the edge runtime on `/icon` or `/opengraph-image`
