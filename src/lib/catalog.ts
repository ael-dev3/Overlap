import { cache } from "react";

import { fetchNeynarScores } from "@/lib/farcaster/neynar";
import {
  hydrateWithSnapchain,
  SnapchainHttpClient,
} from "@/lib/farcaster/snapchain";
import { defaultViewerSeed, seedCandidates } from "@/lib/seed-data";
import type { CatalogSnapshot } from "@/lib/types";

export const loadCatalog = cache(async (): Promise<CatalogSnapshot> => {
  const generatedAt = new Date().toISOString();
  const snapchainBaseUrl = process.env.SNAPCHAIN_BASE_URL ?? null;
  const neynarApiKey = process.env.NEYNAR_API_KEY ?? null;

  let viewerSeed = structuredClone(defaultViewerSeed);
  let candidates = structuredClone(seedCandidates);
  const snapchainHydratedFids: number[] = [];
  const neynarHydratedFids: number[] = [];

  if (snapchainBaseUrl) {
    const client = new SnapchainHttpClient(snapchainBaseUrl);
    const hydratedViewer = await hydrateWithSnapchain(viewerSeed, client);

    if (hydratedViewer.fid !== null && hydratedViewer !== viewerSeed) {
      snapchainHydratedFids.push(hydratedViewer.fid);
    }

    viewerSeed = hydratedViewer;

    candidates = await Promise.all(
      candidates.map(async (candidate) => {
        const hydrated = await hydrateWithSnapchain(candidate, client);

        if (hydrated.fid !== null && hydrated !== candidate) {
          snapchainHydratedFids.push(hydrated.fid);
        }

        return hydrated;
      }),
    );
  }

  if (neynarApiKey) {
    const scoredFids = candidates
      .map((candidate) => candidate.fid)
      .filter((fid): fid is number => fid !== null);

    if (scoredFids.length > 0) {
      try {
        const scoreMap = await fetchNeynarScores(neynarApiKey, scoredFids);

        candidates = candidates.map((candidate) => {
          if (candidate.fid === null) {
            return candidate;
          }

          const score = scoreMap.get(candidate.fid);

          if (typeof score !== "number") {
            return candidate;
          }

          neynarHydratedFids.push(candidate.fid);

          return {
            ...candidate,
            neynarScore: score,
          };
        });
      } catch {
        // Keep fixture scores if Neynar is unavailable.
      }
    }
  }

  return {
    viewerSeed,
    candidates,
    providerStatus: {
      snapchain: {
        mode:
          snapchainBaseUrl === null
            ? "fixture"
            : snapchainHydratedFids.length > 0
              ? "hybrid"
              : "configured",
        baseUrl: snapchainBaseUrl,
        hydratedFids: [...new Set(snapchainHydratedFids)],
      },
      neynar: {
        mode:
          neynarApiKey === null
            ? "fixture"
            : neynarHydratedFids.length > 0
              ? "live"
              : "configured",
        hydratedFids: [...new Set(neynarHydratedFids)],
      },
      generatedAt,
    },
  };
});
