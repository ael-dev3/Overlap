import { NextResponse } from "next/server";

import { absoluteUrl } from "@/lib/utils";

function accountAssociationFromEnv() {
  const header = process.env.FARCASTER_HEADER;
  const payload = process.env.FARCASTER_PAYLOAD;
  const signature = process.env.FARCASTER_SIGNATURE;

  if (!header || !payload || !signature) {
    return undefined;
  }

  return { header, payload, signature };
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const accountAssociation = accountAssociationFromEnv();

  return NextResponse.json({
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: {
      version: "1",
      name: "Overlap",
      iconUrl: absoluteUrl(baseUrl, "/overlap-icon.svg"),
      homeUrl: absoluteUrl(baseUrl, "/?miniApp=true"),
      imageUrl: absoluteUrl(baseUrl, "/overlap-card.svg"),
      buttonTitle: "Open Overlap",
      splashImageUrl: absoluteUrl(baseUrl, "/overlap-icon.svg"),
      splashBackgroundColor: "#090b12",
      requiredCapabilities: ["actions.composeCast", "actions.viewProfile"],
      ...(process.env.FARCASTER_WEBHOOK_URL
        ? { webhookUrl: process.env.FARCASTER_WEBHOOK_URL }
        : {}),
    },
  });
}
