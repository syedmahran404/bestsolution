# Contributing to Velora Civic AI

Thanks for your interest! This project was built for the Coding Ninjas × Google
Vibe2Ship hackathon, but contributions are welcome.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

## Before opening a PR

Please make sure all checks pass:

```bash
npm run typecheck
npm run lint
npm run build
```

## Conventions

- **TypeScript**, strict mode. Prefer explicit types at module boundaries.
- **Formatting:** Prettier (`npm run format`). CI/PRs expect formatted code.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`…).
- **Architecture rules:**
  - Gemini is the **perception layer only** — never use it for distance,
    clustering, aggregation, or analytics (those stay deterministic).
  - Extend existing modules; avoid rewrites and duplicated logic.
  - Keep AI outputs explainable and cached.

## Branching

Branch from the latest integration branch; open a PR with a clear description
of what changed and how it was tested.
