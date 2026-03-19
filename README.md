# Overlap

Overlap is a Farcaster Mini App prototype for discovering active people you genuinely overlap with based on:

- self-selected roles
- ecosystem tags
- interest areas
- directional collaboration intent
- recent activity
- graph proximity
- channel context
- Neynar score as a bounded quality modifier

This build is intentionally deterministic. LLMs are not part of ranking. The product logic lives in TypeScript scoring functions and explainable reason generation.

It is structured to deploy with standard `firebase deploy` on the `overlap-fc` Firebase Hosting site.

## Product shape

The current prototype focuses on the core loop:

1. pick a lightweight discovery profile
2. express what you are seeking and offering
3. rank candidate matches with explainable reasons
4. preview Mini App actions like `composeCast` and `viewProfile`

The app is Snapchain-first for live social data. Neynar is optional and currently used only for quality enrichment when an API key is present.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- `@farcaster/miniapp-sdk`
- Vitest

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Optional environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://overlap-fc.web.app
SNAPCHAIN_BASE_URL=http://127.0.0.1:3381
NEYNAR_API_KEY=...
FARCASTER_HEADER=...
FARCASTER_PAYLOAD=...
FARCASTER_SIGNATURE=...
FARCASTER_WEBHOOK_URL=https://your-domain.tld/api/webhooks/farcaster
```

Notes:

- `NEXT_PUBLIC_APP_URL` defaults to `https://overlap-fc.web.app` in production builds.
- `SNAPCHAIN_BASE_URL` is used at build time for optional live enrichment before static export.
- `NEYNAR_API_KEY` only enriches the bounded quality signal at build time.
- `FARCASTER_*` values are injected into the generated static `/.well-known/farcaster.json` manifest.

## Validation

```bash
npm run lint
npm run test
npm run build
```

For a local Firebase Hosting smoke pass:

```bash
npm run build
firebase emulators:start --only hosting --project overlap-fc
SMOKE_URL=http://127.0.0.1:5000 npm run smoke
```

For a live deploy:

```bash
npm run deploy:firebase
```

## Repo map

- `src/components/overlap-app.tsx`: onboarding and discovery feed
- `src/components/match-card.tsx`: match presentation and Mini App actions
- `src/lib/scoring/overlap.ts`: deterministic scoring and explanation generation
- `src/lib/farcaster/snapchain.ts`: Snapchain normalization and hydration
- `src/lib/catalog.ts`: fixture catalog with optional live enrichment
- `scripts/build-farcaster-manifest.mjs`: generates the static Farcaster manifest into `public/.well-known/farcaster.json`
- `firebase.json`: Firebase Hosting config targeting `overlap-fc`

## Current limits

- Candidate generation is still seeded rather than live graph expansion.
- Build-time live enrichment is optional; the deployed app is a static export for reliable Firebase Hosting deployment on Spark.
- Production add-to-app flows still require a valid Farcaster account association for the manifest.
