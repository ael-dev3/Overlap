import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives recent activity from live cast timestamps and distinct active days", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:00:00.000Z"));

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
    expect(hydrated.activity.activeDays7d).toBe(1);
    expect(hydrated.activity.activeDays30d).toBe(1);
  });

  it("drops stale casts from the 7-day snapshot while preserving the 30-day footprint", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05T12:00:00.000Z"));

    const candidate = buildCandidate();
    const liveBundle: SnapchainLiveBundle = {
      fid: candidate.fid!,
      casts: [
        {
          text: "Yesterday post",
          isReply: false,
          timestamp: "2026-04-04T09:00:00.000Z",
        },
        {
          text: "Reply this week",
          isReply: true,
          timestamp: "2026-03-31T14:00:00.000Z",
        },
        {
          text: "Still within 30d",
          isReply: false,
          timestamp: "2026-03-10T18:00:00.000Z",
        },
        {
          text: "Too old for the recent windows",
          isReply: false,
          timestamp: "2026-02-20T18:00:00.000Z",
        },
      ],
      followingFids: [11, 18, 21],
      followerCount: 80,
      lastActiveAt: "2026-04-04T09:00:00.000Z",
    };

    const hydrated = await hydrateWithSnapchain(candidate, {
      fetchUserBundle: async () => liveBundle,
    } as never);

    expect(hydrated.activity.castsLast7d).toBe(2);
    expect(hydrated.activity.repliesLast7d).toBe(1);
    expect(hydrated.activity.activeDays7d).toBe(2);
    expect(hydrated.activity.activeDays30d).toBe(3);
  });

  it("keeps the existing activity snapshot when live casts do not expose timestamps", async () => {
    const candidate = buildCandidate();
    const liveBundle: SnapchainLiveBundle = {
      fid: candidate.fid!,
      casts: [
        {
          text: "No timestamp available",
          isReply: false,
        },
      ],
      followingFids: [11, 18, 21],
      followerCount: 80,
    };

    const hydrated = await hydrateWithSnapchain(candidate, {
      fetchUserBundle: async () => liveBundle,
    } as never);

    expect(hydrated.activity.castsLast7d).toBe(candidate.activity.castsLast7d);
    expect(hydrated.activity.repliesLast7d).toBe(candidate.activity.repliesLast7d);
    expect(hydrated.activity.activeDays7d).toBe(candidate.activity.activeDays7d);
    expect(hydrated.activity.activeDays30d).toBe(candidate.activity.activeDays30d);
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
