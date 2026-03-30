import {
  ecosystemLabels,
  interestLabels,
  offeringLabels,
  roleLabels,
  seekingLabels,
} from "@/lib/taxonomy";
import type {
  CandidateProfile,
  MatchBreakdown,
  MatchReason,
  OfferingIntent,
  RankedMatch,
  SeekingIntent,
  ViewerProfile,
} from "@/lib/types";
import {
  clamp,
  formatActivitySnapshot,
  uniqueIntersection,
  uniqueUnion,
} from "@/lib/utils";

const weights = {
  roles: 0.18,
  ecosystems: 0.14,
  interests: 0.14,
  intent: 0.18,
  topics: 0.16,
  channels: 0.1,
  graph: 0.06,
  activity: 0.04,
} as const;

const compatibilityMap: Record<SeekingIntent, OfferingIntent[]> = {
  cofounder: ["build", "brainstorm", "role_opening"],
  dev: ["build", "role_opening"],
  designer: ["design", "role_opening"],
  feedback: ["feedback", "brainstorm"],
  distribution: ["distribution", "brainstorm"],
  brainstorm: ["brainstorm", "feedback", "build"],
};

function jaccardScore<T extends string | number>(
  left: readonly T[],
  right: readonly T[],
) {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const shared = uniqueIntersection(left, right);
  const union = uniqueUnion(left, right);

  return union.length === 0 ? 0 : shared.length / union.length;
}

function scoreActivity(candidate: CandidateProfile) {
  const days7d = clamp(candidate.activity.activeDays7d / 7);
  const days30d = clamp(candidate.activity.activeDays30d / 25);
  const casts = clamp(candidate.activity.castsLast7d / 14);
  const replies = clamp(candidate.activity.repliesLast7d / 10);

  return clamp(days7d * 0.35 + days30d * 0.2 + casts * 0.3 + replies * 0.15);
}

function scoreGraph(viewer: ViewerProfile, candidate: CandidateProfile) {
  const shared = uniqueIntersection(
    viewer.activity.followingFids,
    candidate.activity.followingFids,
  );

  if (shared.length === 0) {
    return 0;
  }

  return clamp(
    shared.length /
      Math.max(
        1,
        Math.min(
          viewer.activity.followingFids.length,
          candidate.activity.followingFids.length,
        ),
      ),
  );
}

function qualityBoost(score?: number | null) {
  if (typeof score !== "number") {
    return 1;
  }

  return clamp(0.92 + score * 0.16, 0.92, 1.08);
}

function compatibilityScore(
  seeking: readonly SeekingIntent[],
  offering: readonly OfferingIntent[],
) {
  if (seeking.length === 0 || offering.length === 0) {
    return 0;
  }

  const satisfied = seeking.filter((need) =>
    compatibilityMap[need].some((offer) => offering.includes(offer)),
  );

  return satisfied.length / seeking.length;
}

function findCompatibleIntentPair(
  seeking: readonly SeekingIntent[],
  offering: readonly OfferingIntent[],
) {
  for (const need of seeking) {
    const matchedOffer = compatibilityMap[need].find((offer) =>
      offering.includes(offer),
    );

    if (matchedOffer) {
      return { need, offer: matchedOffer };
    }
  }

  return null;
}

function scoreIntent(viewer: ViewerProfile, candidate: CandidateProfile) {
  const forward = compatibilityScore(
    viewer.discovery.seeking,
    candidate.discovery.offering,
  );
  const reverse = compatibilityScore(
    candidate.discovery.seeking,
    viewer.discovery.offering,
  );
  const sharedSeeking = jaccardScore(
    viewer.discovery.seeking,
    candidate.discovery.seeking,
  );
  const sharedOffering = jaccardScore(
    viewer.discovery.offering,
    candidate.discovery.offering,
  );

  return clamp(
    forward * 0.45 + reverse * 0.35 + sharedSeeking * 0.1 + sharedOffering * 0.1,
  );
}

function buildBreakdown(
  viewer: ViewerProfile,
  candidate: CandidateProfile,
): MatchBreakdown {
  const roles = jaccardScore(viewer.discovery.roles, candidate.discovery.roles);
  const ecosystems = jaccardScore(
    viewer.discovery.ecosystems,
    candidate.discovery.ecosystems,
  );
  const interests = jaccardScore(
    viewer.discovery.interests,
    candidate.discovery.interests,
  );
  const intent = scoreIntent(viewer, candidate);
  const topics =
    jaccardScore(
      viewer.discovery.interests,
      candidate.activity.extractedInterests,
    ) *
      0.75 +
    jaccardScore(
      viewer.discovery.ecosystems,
      candidate.activity.extractedEcosystems,
    ) *
      0.25;
  const channels = jaccardScore(
    viewer.activity.channels,
    candidate.activity.channels,
  );
  const graph = scoreGraph(viewer, candidate);
  const activity = scoreActivity(candidate);
  const qualityMultiplier = qualityBoost(candidate.neynarScore);
  const baseScore = clamp(
    roles * weights.roles +
      ecosystems * weights.ecosystems +
      interests * weights.interests +
      intent * weights.intent +
      topics * weights.topics +
      channels * weights.channels +
      graph * weights.graph +
      activity * weights.activity,
  );

  return {
    roles,
    ecosystems,
    interests,
    intent,
    topics,
    channels,
    graph,
    activity,
    qualityMultiplier,
    baseScore,
    finalScore: clamp(baseScore * qualityMultiplier),
  };
}

function buildReasons(
  viewer: ViewerProfile,
  candidate: CandidateProfile,
  breakdown: MatchBreakdown,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  const sharedRoles = uniqueIntersection(
    viewer.discovery.roles,
    candidate.discovery.roles,
  );
  if (sharedRoles.length > 0) {
    reasons.push({
      code: "shared_role",
      label: `Both selected ${sharedRoles
        .slice(0, 2)
        .map((role) => roleLabels[role])
        .join(" + ")}.`,
      weight: breakdown.roles * weights.roles,
    });
  }

  const sharedEcosystems = uniqueIntersection(
    viewer.discovery.ecosystems,
    candidate.discovery.ecosystems,
  );
  if (sharedEcosystems.length > 0) {
    reasons.push({
      code: "shared_ecosystem",
      label: `Both show up on ${sharedEcosystems
        .slice(0, 2)
        .map((ecosystem) => ecosystemLabels[ecosystem])
        .join(" + ")}.`,
      weight: breakdown.ecosystems * weights.ecosystems,
    });
  }

  const sharedInterests = uniqueIntersection(
    viewer.discovery.interests,
    candidate.discovery.interests,
  );
  if (sharedInterests.length > 0) {
    reasons.push({
      code: "shared_interest",
      label: `Both care about ${sharedInterests
        .slice(0, 2)
        .map((interest) => interestLabels[interest])
        .join(" + ")}.`,
      weight: breakdown.interests * weights.interests,
    });
  }

  if (breakdown.intent > 0.2) {
    const compatibleIntent = findCompatibleIntentPair(
      viewer.discovery.seeking,
      candidate.discovery.offering,
    );

    if (compatibleIntent) {
      reasons.push({
        code: "shared_intent",
        label: `${seekingLabels[compatibleIntent.need]} lines up with ${offeringLabels[compatibleIntent.offer]}.`,
        weight: breakdown.intent * weights.intent,
      });
    }
  }

  const sharedTopics = uniqueIntersection(
    viewer.discovery.interests,
    candidate.activity.extractedInterests,
  );
  if (sharedTopics.length > 0) {
    reasons.push({
      code: "shared_topic",
      label: `Recent casts also point at ${sharedTopics
        .slice(0, 2)
        .map((interest) => interestLabels[interest])
        .join(" + ")}.`,
      weight: breakdown.topics * weights.topics,
    });
  }

  const sharedChannels = uniqueIntersection(
    viewer.activity.channels,
    candidate.activity.channels,
  );
  if (sharedChannels.length > 0) {
    reasons.push({
      code: "shared_channel",
      label: `You both keep showing up in ${sharedChannels
        .slice(0, 2)
        .join(" + ")}.`,
      weight: breakdown.channels * weights.channels,
    });
  }

  const sharedGraph = uniqueIntersection(
    viewer.activity.followingFids,
    candidate.activity.followingFids,
  );
  if (sharedGraph.length > 0) {
    reasons.push({
      code: "graph_proximity",
      label: `${sharedGraph.length} shared follow-neighborhood signals.`,
      weight: breakdown.graph * weights.graph,
    });
  }

  reasons.push({
    code: "recent_activity",
    label: `Recent cadence: ${formatActivitySnapshot(candidate.activity)}.`,
    weight: breakdown.activity * weights.activity,
  });

  if (breakdown.qualityMultiplier > 1.02) {
    reasons.push({
      code: "quality_boost",
      label: "Healthy Neynar signal gives a mild quality boost, not the whole ranking.",
      weight: breakdown.qualityMultiplier - 1,
    });
  }

  return reasons
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5);
}

function labelForScore(score: number): RankedMatch["overlapLabel"] {
  if (score >= 0.72) {
    return "High overlap";
  }

  if (score >= 0.56) {
    return "Strong overlap";
  }

  return "Warm overlap";
}

export function rankMatches(
  viewer: ViewerProfile,
  candidates: CandidateProfile[],
) {
  return candidates
    .map<RankedMatch>((candidate) => {
      const breakdown = buildBreakdown(viewer, candidate);

      return {
        candidate,
        score: breakdown.finalScore,
        overlapLabel: labelForScore(breakdown.finalScore),
        reasons: buildReasons(viewer, candidate, breakdown),
        breakdown,
      };
    })
    .sort((left, right) => right.score - left.score);
}
