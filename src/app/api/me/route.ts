import { NextResponse } from "next/server";

import { loadCatalog } from "@/lib/catalog";

export async function GET() {
  const snapshot = await loadCatalog();

  return NextResponse.json({
    viewer: snapshot.viewerSeed,
    providerStatus: snapshot.providerStatus,
  });
}
