import { NextResponse } from "next/server";

import { discoveryProfileSchema } from "@/lib/types";

export async function POST(request: Request) {
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

  const profile = parsed.data;

  return NextResponse.json({
    profile,
    completeness: {
      roles: profile.roles.length,
      ecosystems: profile.ecosystems.length,
      interests: profile.interests.length,
      seeking: profile.seeking.length,
      offering: profile.offering.length,
      hasNarrative: Boolean(profile.building || profile.about),
    },
  });
}
