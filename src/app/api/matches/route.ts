import { NextResponse } from "next/server";

import { loadCatalog } from "@/lib/catalog";
import { rankMatches } from "@/lib/scoring/overlap";
import { discoveryProfileSchema } from "@/lib/types";

export async function GET() {
  const snapshot = await loadCatalog();
  const matches = rankMatches(snapshot.viewerSeed, snapshot.candidates);

  return NextResponse.json({
    providerStatus: snapshot.providerStatus,
    viewer: snapshot.viewerSeed,
    matches,
  });
}

export async function POST(request: Request) {
  const snapshot = await loadCatalog();
  const payload = await request.json();
  const parsed = discoveryProfileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid discovery profile payload.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const viewer = {
    ...snapshot.viewerSeed,
    discovery: parsed.data,
  };

  return NextResponse.json({
    providerStatus: snapshot.providerStatus,
    viewer,
    matches: rankMatches(viewer, snapshot.candidates),
  });
}
