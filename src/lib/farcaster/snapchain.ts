import type {
  CandidateProfile,
  EcosystemTag,
  InterestTag,
  SnapchainCast,
  SnapchainLiveBundle,
  ViewerProfile,
} from "@/lib/types";
import { ecosystemOptions, interestOptions } from "@/lib/taxonomy";

const farcasterEpochMs = Date.UTC(2021, 0, 1, 0, 0, 0, 0);

const interestSignals: Record<InterestTag, RegExp[]> = {
  ai: [/\bai\b/i, /\bllm\b/i, /\bmodel\b/i, /\binference\b/i],
  defi: [/\bdefi\b/i, /\byield\b/i, /\bswap\b/i, /\bliquidity\b/i],
  trading: [/\btrading\b/i, /\btrade\b/i, /\borderflow\b/i, /\bperps?\b/i],
  memes: [/\bmeme(s)?\b/i, /\bshitpost\b/i],
  agents: [/\bagent(ic)?\b/i, /\bautonomous\b/i],
  content: [/\bcontent\b/i, /\bnarrative\b/i, /\bdistribution\b/i],
  mini_apps: [/\bmini[\s-]?apps?\b/i, /\bframe(s)?\b/i],
  nfts: [/\bnft(s)?\b/i, /\bcollectible(s)?\b/i],
  gaming: [/\bgaming\b/i, /\bgame\b/i, /\bplayable\b/i],
  socialfi: [/\bsocialfi\b/i, /\bsocial graph\b/i, /\bcreator economy\b/i],
};

const ecosystemSignals: Record<EcosystemTag, RegExp[]> = {
  btc_maxi: [/\bbtc\b/i, /\bbitcoin\b/i],
  eth_mainnet: [/\beth\b/i, /\bethereum\b/i, /\bmainnet\b/i],
  base: [/\bbase\b/i],
  solana: [/\bsolana\b/i, /\bsol\b/i],
  hyperliquid: [/\bhyperliquid\b/i, /\bhype\b/i],
};

function normalizeTimestamp(value: unknown) {
  if (typeof value === "number") {
    if (value > 1_000_000_000_000) {
      return new Date(value).toISOString();
    }

    if (value > 10_000_000) {
      return new Date(value * 1000).toISOString();
    }

    return new Date(farcasterEpochMs + value * 1000).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (!Number.isNaN(parsed)) {
      return normalizeTimestamp(parsed);
    }

    const isoParsed = Date.parse(value);

    if (!Number.isNaN(isoParsed)) {
      return new Date(isoParsed).toISOString();
    }
  }

  return undefined;
}

export function extractSignalsFromCasts(casts: string[]) {
  const extractedInterests = interestOptions
    .filter((interest) =>
      interestSignals[interest.id].some((pattern) =>
        casts.some((cast) => pattern.test(cast)),
      ),
    )
    .map((interest) => interest.id);

  const extractedEcosystems = ecosystemOptions
    .filter((ecosystem) =>
      ecosystemSignals[ecosystem.id].some((pattern) =>
        casts.some((cast) => pattern.test(cast)),
      ),
    )
    .map((ecosystem) => ecosystem.id);

  return { extractedInterests, extractedEcosystems };
}

function messageList(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  if (Array.isArray((raw as { messages?: unknown }).messages)) {
    return (raw as { messages: unknown[] }).messages;
  }

  if ("data" in (raw as Record<string, unknown>)) {
    return [raw];
  }

  return [];
}

function normalizeUserDataType(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const numeric = Number(value);

  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  switch (value) {
    case "USER_DATA_TYPE_PFP":
      return 1;
    case "USER_DATA_TYPE_DISPLAY":
      return 2;
    case "USER_DATA_TYPE_BIO":
      return 3;
    case "USER_DATA_TYPE_URL":
      return 5;
    case "USER_DATA_TYPE_USERNAME":
      return 6;
    default:
      return undefined;
  }
}

function normalizeProfileImageUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeUserDataResponse(raw: unknown) {
  const profile: Partial<SnapchainLiveBundle> = {};

  for (const message of messageList(raw)) {
    const base =
      message && typeof message === "object"
        ? (message as { data?: Record<string, unknown> }).data ??
          (message as Record<string, unknown>)
        : undefined;

    if (!base || typeof base !== "object") {
      continue;
    }

    const body = (base as { userDataBody?: Record<string, unknown> }).userDataBody;
    const type = normalizeUserDataType(body?.type);
    const value = body?.value;

    if (typeof value !== "string") {
      continue;
    }

    switch (type) {
      case 1:
        profile.pfpUrl = normalizeProfileImageUrl(value);
        break;
      case 2:
        profile.displayName = value;
        break;
      case 3:
        profile.bio = value;
        break;
      case 6:
        profile.username = value;
        break;
      default:
        break;
    }
  }

  return profile;
}

function extractChannelId(parentUrl: unknown) {
  if (typeof parentUrl !== "string") {
    return undefined;
  }

  try {
    const url = new URL(parentUrl);
    const pathname = url.pathname.replace(/\/+$/, "");
    const parts = pathname.split("/").filter(Boolean);
    return parts.at(-1)?.toLowerCase();
  } catch {
    return undefined;
  }
}

export function normalizeCastsResponse(raw: unknown) {
  return messageList(raw).reduce<SnapchainCast[]>((casts, message) => {
      const base =
        message && typeof message === "object"
          ? (message as { data?: Record<string, unknown> }).data ??
            (message as Record<string, unknown>)
          : undefined;

      if (!base || typeof base !== "object") {
        return casts;
      }

      const castAddBody = (base as { castAddBody?: Record<string, unknown> }).castAddBody;
      const text = castAddBody?.text;

      if (typeof text !== "string") {
        return casts;
      }

      casts.push({
        text,
        timestamp: normalizeTimestamp((base as { timestamp?: unknown }).timestamp),
        isReply:
          Boolean(castAddBody?.parentCastId) ||
          typeof castAddBody?.parentUrl === "string",
        channelId: extractChannelId(castAddBody?.parentUrl),
      });

      return casts;
    }, []);
}

export function normalizeLinksResponse(raw: unknown) {
  return messageList(raw)
    .map((message) => {
      const base =
        message && typeof message === "object"
          ? (message as { data?: Record<string, unknown> }).data ??
            (message as Record<string, unknown>)
          : undefined;

      if (!base || typeof base !== "object") {
        return null;
      }

      const linkBody = (base as { linkBody?: Record<string, unknown> }).linkBody;
      const targetFid = linkBody?.targetFid;

      if (typeof targetFid === "number") {
        return targetFid;
      }

      if (typeof targetFid === "string") {
        const parsed = Number(targetFid);
        return Number.isNaN(parsed) ? null : parsed;
      }

      return null;
    })
    .filter((targetFid): targetFid is number => targetFid !== null);
}

export class SnapchainHttpClient {
  constructor(private readonly baseUrl: string) {}

  private async fetchJson(path: string) {
    const response = await fetch(new URL(path, this.baseUrl), {
      signal: AbortSignal.timeout(5_000),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Snapchain request failed for ${path}: ${response.status}`);
    }

    return response.json();
  }

  async fetchUserBundle(fid: number): Promise<SnapchainLiveBundle> {
    const [userData, casts, following, followers] = await Promise.all([
      this.fetchJson(`/v1/userDataByFid?fid=${fid}`),
      this.fetchJson(`/v1/castsByFid?fid=${fid}&reverse=true&pageSize=25`),
      this.fetchJson(`/v1/linksByFid?fid=${fid}&link_type=follow&pageSize=200`),
      this.fetchJson(
        `/v1/linksByTargetFid?target_fid=${fid}&link_type=follow&pageSize=200`,
      ),
    ]);

    const profile = normalizeUserDataResponse(userData);
    const normalizedCasts = normalizeCastsResponse(casts);

    return {
      fid,
      ...profile,
      casts: normalizedCasts,
      followingFids: normalizeLinksResponse(following),
      followerCount: normalizeLinksResponse(followers).length,
      lastActiveAt:
        normalizedCasts.find((cast) => typeof cast.timestamp === "string")
          ?.timestamp ?? undefined,
    };
  }
}

function mergeLiveSignals<T extends CandidateProfile | ViewerProfile>(
  actor: T,
  liveBundle: SnapchainLiveBundle,
) {
  const casts = liveBundle.casts.slice(0, 3).map((cast) => cast.text);
  const extracted = extractSignalsFromCasts(casts);
  const liveChannels = liveBundle.casts
    .map((cast) => cast.channelId)
    .filter((channelId): channelId is string => typeof channelId === "string");

  return {
    ...actor,
    username: liveBundle.username ?? actor.username,
    displayName: liveBundle.displayName ?? actor.displayName,
    bio: liveBundle.bio ?? actor.bio,
    avatar: liveBundle.pfpUrl
      ? {
          ...actor.avatar,
          imageUrl: liveBundle.pfpUrl,
        }
      : actor.avatar,
    activity: {
      ...actor.activity,
      sampleCasts: casts.length > 0 ? casts : actor.activity.sampleCasts,
      extractedInterests:
        extracted.extractedInterests.length > 0
          ? extracted.extractedInterests
          : actor.activity.extractedInterests,
      extractedEcosystems:
        extracted.extractedEcosystems.length > 0
          ? extracted.extractedEcosystems
          : actor.activity.extractedEcosystems,
      channels: liveChannels.length > 0 ? [...new Set(liveChannels)] : actor.activity.channels,
      castsLast7d: Math.max(actor.activity.castsLast7d, liveBundle.casts.length),
      repliesLast7d: Math.max(
        actor.activity.repliesLast7d,
        liveBundle.casts.filter((cast) => cast.isReply).length,
      ),
      activeDays7d: Math.max(actor.activity.activeDays7d, Math.min(7, liveBundle.casts.length)),
      activeDays30d: Math.max(
        actor.activity.activeDays30d,
        Math.min(30, liveBundle.casts.length * 2),
      ),
      lastActiveAt: liveBundle.lastActiveAt ?? actor.activity.lastActiveAt,
      followingFids:
        liveBundle.followingFids.length > 0
          ? liveBundle.followingFids
          : actor.activity.followingFids,
      followerCount: Math.max(actor.activity.followerCount, liveBundle.followerCount),
    },
  };
}

export async function hydrateWithSnapchain<T extends CandidateProfile | ViewerProfile>(
  actor: T,
  client: SnapchainHttpClient,
) {
  if (actor.fid === null) {
    return actor;
  }

  try {
    const liveBundle = await client.fetchUserBundle(actor.fid);
    return mergeLiveSignals(actor, liveBundle);
  } catch {
    return actor;
  }
}
