import { z } from "zod";

import {
  ecosystemIds,
  interestIds,
  offeringIds,
  roleIds,
  seekingIds,
} from "@/lib/taxonomy";

export const roleSchema = z.enum(roleIds);
export const ecosystemSchema = z.enum(ecosystemIds);
export const interestSchema = z.enum(interestIds);
export const seekingSchema = z.enum(seekingIds);
export const offeringSchema = z.enum(offeringIds);

export type Role = z.infer<typeof roleSchema>;
export type EcosystemTag = z.infer<typeof ecosystemSchema>;
export type InterestTag = z.infer<typeof interestSchema>;
export type SeekingIntent = z.infer<typeof seekingSchema>;
export type OfferingIntent = z.infer<typeof offeringSchema>;

export const discoveryProfileSchema = z.object({
  roles: z.array(roleSchema).max(4),
  ecosystems: z.array(ecosystemSchema).max(5),
  interests: z.array(interestSchema).max(6),
  seeking: z.array(seekingSchema).max(6),
  offering: z.array(offeringSchema).max(6),
  about: z.string().trim().max(160).optional().default(""),
  building: z.string().trim().max(160).optional().default(""),
});

export type DiscoveryProfile = z.infer<typeof discoveryProfileSchema>;

export interface AvatarToken {
  initials: string;
  start: string;
  end: string;
}

export interface ActivitySnapshot {
  sampleCasts: string[];
  extractedInterests: InterestTag[];
  extractedEcosystems: EcosystemTag[];
  channels: string[];
  castsLast7d: number;
  repliesLast7d: number;
  activeDays7d: number;
  activeDays30d: number;
  lastActiveAt: string;
  followingFids: number[];
  followerCount: number;
}

export interface ViewerProfile {
  fid: number | null;
  username: string;
  displayName: string;
  bio: string;
  avatar: AvatarToken;
  discovery: DiscoveryProfile;
  activity: ActivitySnapshot;
}

export interface CandidateProfile extends ViewerProfile {
  id: string;
  neynarScore: number | null;
}

export type ReasonCode =
  | "shared_role"
  | "shared_ecosystem"
  | "shared_interest"
  | "shared_intent"
  | "shared_topic"
  | "shared_channel"
  | "graph_proximity"
  | "recent_activity"
  | "quality_boost";

export interface MatchReason {
  code: ReasonCode;
  label: string;
  weight: number;
}

export interface MatchBreakdown {
  roles: number;
  ecosystems: number;
  interests: number;
  intent: number;
  topics: number;
  channels: number;
  graph: number;
  activity: number;
  qualityMultiplier: number;
  baseScore: number;
  finalScore: number;
}

export interface RankedMatch {
  candidate: CandidateProfile;
  score: number;
  overlapLabel: "High overlap" | "Strong overlap" | "Warm overlap";
  reasons: MatchReason[];
  breakdown: MatchBreakdown;
}

export interface ProviderStatus {
  snapchain: {
    mode: "fixture" | "configured" | "hybrid" | "live";
    baseUrl: string | null;
    hydratedFids: number[];
  };
  neynar: {
    mode: "disabled" | "fixture" | "configured" | "live";
    hydratedFids: number[];
  };
  generatedAt: string;
}

export interface CatalogSnapshot {
  viewerSeed: ViewerProfile;
  candidates: CandidateProfile[];
  providerStatus: ProviderStatus;
}

export interface SnapchainCast {
  text: string;
  timestamp?: string;
  isReply: boolean;
  channelId?: string;
}

export interface SnapchainLiveBundle {
  fid: number;
  username?: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  casts: SnapchainCast[];
  followingFids: number[];
  followerCount: number;
  lastActiveAt?: string;
}
