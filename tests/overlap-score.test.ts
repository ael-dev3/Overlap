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
        roles: ["investor"],
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
});
