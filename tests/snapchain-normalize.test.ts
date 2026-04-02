import { describe, expect, it } from "vitest";

import {
  normalizeCastsResponse,
  normalizeLinksResponse,
  normalizeUserDataResponse,
} from "../src/lib/farcaster/snapchain";

describe("Snapchain normalization", () => {
  it("accepts numeric user data types", () => {
    const result = normalizeUserDataResponse({
      messages: [
        {
          data: {
            userDataBody: { type: 1, value: "https://cdn.example.com/avatars/overlap.png" },
          },
        },
        {
          data: {
            userDataBody: { type: 6, value: "overlap" },
          },
        },
        {
          data: {
            userDataBody: { type: 2, value: "Overlap App" },
          },
        },
        {
          data: {
            userDataBody: { type: 3, value: "Discovery, not clout." },
          },
        },
      ],
    });

    expect(result).toEqual({
      pfpUrl: "https://cdn.example.com/avatars/overlap.png",
      username: "overlap",
      displayName: "Overlap App",
      bio: "Discovery, not clout.",
    });
  });

  it("ignores unsupported profile photo URLs", () => {
    const result = normalizeUserDataResponse({
      messages: [
        {
          data: {
            userDataBody: { type: 1, value: "javascript:alert('xss')" },
          },
        },
      ],
    });

    expect(result).toEqual({});
  });

  it("normalizes Farcaster-epoch cast timestamps and channel ids", () => {
    const result = normalizeCastsResponse({
      messages: [
        {
          data: {
            timestamp: 1,
            castAddBody: {
              text: "hello from a channel",
              parentUrl: "https://warpcast.com/~/channel/miniapps",
            },
          },
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      text: "hello from a channel",
      channelId: "miniapps",
      isReply: true,
      timestamp: "2021-01-01T00:00:01.000Z",
    });
  });

  it("normalizes link target fids from strings or numbers", () => {
    const result = normalizeLinksResponse({
      messages: [
        { data: { linkBody: { targetFid: 42 } } },
        { data: { linkBody: { targetFid: "84" } } },
      ],
    });

    expect(result).toEqual([42, 84]);
  });
});
