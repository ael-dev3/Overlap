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

## Ranking model

Overlap should stay **deterministic and explainable**.
The current prototype intentionally does not use LLM ranking.

The scoring logic lives in `src/lib/scoring/overlap.ts` and combines:

- shared **roles**
- shared **ecosystems**
- shared **interests**
- bidirectional **collaboration intent** compatibility
- alignment between stated interests and recent **topic extraction**
- shared **channels**
- shared **follow-neighborhood / graph** signals
- recent **activity**
- a mild **Neynar quality multiplier**

### Current weight breakdown

The prototype currently weights components as:

- roles — **18%**
- collaboration intent — **18%**
- extracted topical overlap — **16%**
- ecosystems — **14%**
- interests — **14%**
- channels — **10%**
- graph overlap — **6%**
- activity — **4%**

Neynar score is applied as a **bounded quality modifier**, not a primary driver.
In code, that multiplier is intentionally mild.

### Product rules

The ranking should preserve a few strong product rules:

- relevant active people should beat passive prestige
- overlap should matter more than raw popularity
- collaboration fit should matter more than vanity metrics
- every surfaced match should have plain-language reasons
- Neynar should improve confidence, not dominate results

### Explainability output

Each ranked match should be able to explain itself with a compact breakdown and a short list of reasons, for example:

```json
{
  "score": 0.82,
  "overlapLabel": "High overlap",
  "reasons": [
    "Both selected Builder + Creator.",
    "Both show up on Base.",
    "Recent casts also point at AI + mini apps.",
    "Looking for feedback lines up with offering brainstorming.",
    "Active 6/7 days and posting right now."
  ]
}
```

That property matters for both product quality and implementation quality:

- users can understand why someone appeared
- operators can debug ranking changes quickly
- future scoring edits stay reviewable instead of becoming opaque
