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
- `@farcaster/quick-auth`
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
NEXT_PUBLIC_APP_URL=http://localhost:3000
SNAPCHAIN_BASE_URL=http://127.0.0.1:3381
NEYNAR_API_KEY=...
FARCASTER_HEADER=...
FARCASTER_PAYLOAD=...
FARCASTER_SIGNATURE=...
FARCASTER_WEBHOOK_URL=https://your-domain.tld/api/webhooks/farcaster
```

Notes:

- `SNAPCHAIN_BASE_URL` is the preferred live data source.
- `NEYNAR_API_KEY` only enriches the bounded quality signal today.
- `FARCASTER_*` association values are needed for a production-valid `/.well-known/farcaster.json` manifest.

## Validation

```bash
npm run lint
npm run test
npm run build
```

For a local smoke pass, start the production server and then run:

```bash
PORT=3100 npm run start
SMOKE_URL=http://127.0.0.1:3100 npm run smoke
```

## Repo map

- `src/components/overlap-app.tsx`: onboarding and discovery feed
- `src/components/match-card.tsx`: match presentation and Mini App actions
- `src/lib/scoring/overlap.ts`: deterministic scoring and explanation generation
- `src/lib/farcaster/snapchain.ts`: Snapchain normalization and hydration
- `src/lib/catalog.ts`: fixture catalog with optional live enrichment
- `src/app/.well-known/farcaster.json/route.ts`: Mini App manifest

## Current limits

- Candidate generation is still seeded rather than live graph expansion.
- Quick Auth verification exists server-side, but the prototype still uses a local seeded viewer profile.
- Production add-to-app flows require a real production domain and valid Farcaster account association.
