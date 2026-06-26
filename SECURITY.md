# Security Policy

## Reporting a Vulnerability

If you discover a security issue in Velora Civic AI, please **do not open a
public issue**. Instead, report it privately to the maintainer via a GitHub
security advisory or direct contact. We aim to acknowledge reports within 72
hours.

## Secrets & Configuration

- No secrets are committed to this repository. All keys are provided via
  environment variables (see `.env.example`).
- Server-only secrets (`GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`,
  `GOOGLE_MAPS_SERVER_KEY`) must never be exposed to the client. They are read
  only in server modules (`"server-only"`-guarded) and Route Handlers.
- Public values (`NEXT_PUBLIC_*`) are safe for the browser by design.

## Handling Practices

- Restrict the Google Maps keys (referrer for the public key; API + IP for the
  server key).
- Lock down Firestore/Storage rules before any public deployment.
- All report inputs are validated server-side with Zod; external API calls
  fail open (never crash the request).
