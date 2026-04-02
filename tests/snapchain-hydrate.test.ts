import { describe, expect, it } from "vitest";

import { hydrateWithSnapchain } from "../src/lib/farcaster/snapchain";
import type { CandidateProfile, SnapchainLiveBundle } from "../src/lib/types";

function buildCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: "candidate",
    fid: 42,
    username: "candidate",
    displayName: "Candidate",
    bio: "Builder shipping mini apps.",
    avatar: {
      initials: "CA",
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
      sampleCasts: ["Shipping another mini app."],
      extractedInterests: ["ai", "mini_apps"],
      extractedEcosystems: ["base"],
      channels: ["miniapps"],
      castsLast7d: 2,
      repliesLast7d: 1,
      activeDays7d: 2,
      activeDays30d: 5,
      lastActiveAt: "2026-03-19T18:00:00.000Z",
      followingFids: [11, 18],
      followerCount: 50,
    },
    neynarScore: 0.7,
    ...overrides,
  };
}

describe("hydrateWithSnapchain", () => {
  it("keeps the stronger reply count when live data shows more recent replies", async () => {
    const candidate = buildCandidate();
    const liveBundle: SnapchainLiveBundle = {
      fid: candidate.fid!,
      casts: [
        {
          text: "Reply one",
          isReply: true,
          timestamp: "2026-03-20T10:00:00.000Z",
        },
        {
          text: "Reply two",
          isReply: true,
          timestamp: "2026-03-20T09:00:00.000Z",
        },
        {
          text: "Reply three",
          isReply: true,
          timestamp: "2026-03-20T08:00:00.000Z",
        },
        {
          text: "Fresh post",
          isReply: false,
          timestamp: "2026-03-20T07:00:00.000Z",
        },
      ],
      followingFids: [11, 18, 21],
      followerCount: 80,
      lastActiveAt: "2026-03-20T10:00:00.000Z",
    };

    const hydrated = await hydrateWithSnapchain(candidate, {
      fetchUserBundle: async () => liveBundle,
    } as never);

    expect(hydrated.activity.repliesLast7d).toBe(3);
    expect(hydrated.activity.castsLast7d).toBe(4);
  });

  it("promotes a live profile photo onto the avatar token", async () => {
    const candidate = buildCandidate();
    const liveBundle: SnapchainLiveBundle = {
      fid: candidate.fid!,
      pfpUrl: "https://cdn.example.com/avatars/candidate.png",
      casts: [],
      followingFids: [],
      followerCount: 50,
    };

    const hydrated = await hydrateWithSnapchain(candidate, {
      fetchUserBundle: async () => liveBundle,
    } as never);

    expect(hydrated.avatar).toMatchObject({
      initials: "CA",
      start: "#8A5CFF",
      end: "#27D7FF",
      imageUrl: "https://cdn.example.com/avatars/candidate.png",
    });
  });
});
