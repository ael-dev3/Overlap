import { describe, expect, it } from "vitest";

import { rankMatches } from "../src/lib/scoring/overlap";
import { defaultViewerSeed } from "../src/lib/seed-data";
import type { CandidateProfile } from "../src/lib/types";

function buildCandidate(
  id: string,
  overrides: Partial<CandidateProfile>,
): CandidateProfile {
  return {
    id,
    fid: null,
    username: id,
    displayName: id,
    bio: "Test candidate",
    avatar: {
      initials: id.slice(0, 2).toUpperCase(),
      start: "#8A5CFF",
      end: "#27D7FF",
    },
    discovery: {
      roles: ["builder"],
      ecosystems: ["base"],
      interests: ["ai", "mini_apps"],
      seeking: ["feedback"],
      offering: ["build"],
      about: "",
      building: "",
    },
    activity: {
      sampleCasts: ["Shipping another builder-facing mini app on Base."],
      extractedInterests: ["ai", "mini_apps"],
      extractedEcosystems: ["base"],
      channels: ["miniapps", "base"],
      castsLast7d: 8,
      repliesLast7d: 5,
      activeDays7d: 5,
      activeDays30d: 18,
      lastActiveAt: "2026-03-19T18:00:00.000Z",
      followingFids: [11, 18, 21],
      followerCount: 100,
    },
    neynarScore: 0.7,
    ...overrides,
  };
}

describe("rankMatches", () => {
  it("prefers structural overlap over a slightly higher Neynar score", () => {
    const structural = buildCandidate("structural", {
      discovery: {
        roles: ["builder", "creator"],
        ecosystems: ["base"],
        interests: ["ai", "mini_apps", "agents"],
        seeking: ["feedback"],
        offering: ["build", "brainstorm"],
        about: "",
        building: "",
      },
      neynarScore: 0.62,
    });

    const clout = buildCandidate("clout", {
      discovery: {
        roles: ["trader"],
        ecosystems: ["solana"],
        interests: ["trading"],
        seeking: ["distribution"],
        offering: ["distribution"],
        about: "",
        building: "",
      },
      neynarScore: 0.98,
    });

    const [first, second] = rankMatches(defaultViewerSeed, [clout, structural]);

    expect(first.candidate.id).toBe("structural");
    expect(first.score).toBeGreaterThan(second.score);
  });

  it("keeps the quality boost bounded", () => {
    const lowQuality = buildCandidate("low-quality", {
      neynarScore: 0,
    });
    const highQuality = buildCandidate("high-quality", {
      neynarScore: 1,
    });

    const [winner, runnerUp] = rankMatches(defaultViewerSeed, [highQuality, lowQuality]);

    expect(winner.candidate.id).toBe("high-quality");
    expect(winner.score - runnerUp.score).toBeLessThan(0.12);
  });

  it("rewards directional seeking and offering compatibility", () => {
    const compatible = buildCandidate("compatible", {
      discovery: {
        roles: ["builder"],
        ecosystems: ["base"],
        interests: ["ai"],
        seeking: ["feedback"],
        offering: ["build", "feedback"],
        about: "",
        building: "",
      },
    });

    const incompatible = buildCandidate("incompatible", {
      discovery: {
        roles: ["builder"],
        ecosystems: ["base"],
        interests: ["ai"],
        seeking: ["feedback"],
        offering: ["distribution"],
        about: "",
        building: "",
      },
    });

    const ranked = rankMatches(defaultViewerSeed, [incompatible, compatible]);

    expect(ranked[0].candidate.id).toBe("compatible");
    expect(ranked[0].breakdown.intent).toBeGreaterThan(ranked[1].breakdown.intent);
  });

  it("uses the compatible offer in the intent explanation", () => {
    const candidate = buildCandidate("reason-match", {
      discovery: {
        roles: ["builder"],
        ecosystems: ["base"],
        interests: ["ai"],
        seeking: [],
        offering: ["distribution", "brainstorm"],
        about: "",
        building: "",
      },
    });

    const [ranked] = rankMatches(defaultViewerSeed, [candidate]);
    const intentReason = ranked.reasons.find((reason) => reason.code === "shared_intent");

    expect(intentReason?.label).toBe(
      "You want feedback; they are open to brainstorming.",
    );
    expect(intentReason?.label).not.toContain("distribution");
  });

  it("explains reverse intent compatibility when the candidate needs what you offer", () => {
    const candidate = buildCandidate("reverse-intent", {
      discovery: {
        roles: ["builder"],
        ecosystems: ["base"],
        interests: ["ai"],
        seeking: ["dev"],
        offering: [],
        about: "",
        building: "",
      },
    });

    const [ranked] = rankMatches(defaultViewerSeed, [candidate]);
    const intentReason = ranked.reasons.find((reason) => reason.code === "shared_intent");

    expect(ranked.breakdown.intent).toBeGreaterThan(0.3);
    expect(intentReason?.label).toBe("They need a dev; you can build.");
  });

  it("keeps the activity explanation tied to the weekly snapshot", () => {
    const candidate = buildCandidate("snapshot-activity", {
      discovery: {
        roles: ["artist"],
        ecosystems: ["solana"],
        interests: ["nfts"],
        seeking: [],
        offering: [],
        about: "",
        building: "",
      },
      activity: {
        sampleCasts: ["Still sketching."],
        extractedInterests: ["nfts"],
        extractedEcosystems: ["solana"],
        channels: [],
        castsLast7d: 3,
        repliesLast7d: 1,
        activeDays7d: 2,
        activeDays30d: 5,
        lastActiveAt: "2026-03-01T18:00:00.000Z",
        followingFids: [],
        followerCount: 12,
      },
      neynarScore: null,
    });

    const [ranked] = rankMatches(defaultViewerSeed, [candidate]);
    const activityReason = ranked.reasons.find((reason) => reason.code === "recent_activity");

    expect(activityReason?.label).toBe("Recent cadence: 2/7 active days, 3 casts, 1 reply.");
    expect(activityReason?.label).not.toContain("posting right now");
  });
});
