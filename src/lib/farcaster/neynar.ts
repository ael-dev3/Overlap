interface NeynarBulkUsersResponse {
  users?: Array<{
    fid: number;
    experimental?: {
      neynar_user_score?: number;
    };
  }>;
}

export async function fetchNeynarScores(apiKey: string, fids: number[]) {
  if (fids.length === 0) {
    return new Map<number, number>();
  }

  const url = new URL("https://api.neynar.com/v2/farcaster/user/bulk/");
  url.searchParams.set("fids", fids.join(","));

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "x-neynar-experimental": "true",
    },
    signal: AbortSignal.timeout(5_000),
    next: { revalidate: 3_600 },
  });

  if (!response.ok) {
    throw new Error(`Neynar request failed: ${response.status}`);
  }

  const payload = (await response.json()) as NeynarBulkUsersResponse;

  return new Map(
    (payload.users ?? [])
      .map((user) => {
        const score = user.experimental?.neynar_user_score;
        return typeof score === "number" ? [user.fid, score] : null;
      })
      .filter((item): item is [number, number] => item !== null),
  );
}
