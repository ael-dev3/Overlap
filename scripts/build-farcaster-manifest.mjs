import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const defaultAppUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://overlap-fc.web.app";

const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? defaultAppUrl);
const outputPath = resolve(
  process.cwd(),
  "public",
  ".well-known",
  "farcaster.json",
);

const defaultAccountAssociation = {
  header:
    "eyJmaWQiOjUzOTg1NCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDc2RDBFN0ExMzI0ODk0NWVFOWY4MDhCNGE0NzIyNjJCMjg3Nzg5NDIifQ",
  payload: "eyJkb21haW4iOiJvdmVybGFwLWZjLndlYi5hcHAifQ",
  signature:
    "Oh7ad8id4G8rpmng9RIv2LVvLM8skqflhgr5V9AZ5IYW0ptaKS+UQtgCfcTD53cqKhvC+48qHYIued3ETnGikRs=",
};

const accountAssociationFromEnv =
  process.env.FARCASTER_HEADER &&
  process.env.FARCASTER_PAYLOAD &&
  process.env.FARCASTER_SIGNATURE
    ? {
        header: process.env.FARCASTER_HEADER,
        payload: process.env.FARCASTER_PAYLOAD,
        signature: process.env.FARCASTER_SIGNATURE,
      }
    : undefined;

const accountAssociation = accountAssociationFromEnv ?? defaultAccountAssociation;

const manifest = {
  accountAssociation,
  miniapp: {
    version: "1",
    name: "Overlap",
    iconUrl: new URL("/overlap-icon.svg", baseUrl).toString(),
    homeUrl: new URL("/?miniApp=true", baseUrl).toString(),
    imageUrl: new URL("/overlap-card.svg", baseUrl).toString(),
    buttonTitle: "Open Overlap",
    splashImageUrl: new URL("/overlap-icon.svg", baseUrl).toString(),
    splashBackgroundColor: "#0f0d16",
    subtitle: "Find your Farcaster overlap",
    description:
      "Overlap helps Farcaster users find relevant people through shared roles, ecosystems, and live profile context.",
    primaryCategory: "social",
    tags: ["farcaster", "social", "networking", "collaboration"],
    tagline: "Social discovery on Farcaster",
    ogTitle: "Overlap",
    ogDescription:
      "Discover relevant Farcaster people through roles, ecosystems, and real profile context.",
    ogImageUrl: new URL("/overlap-card.svg", baseUrl).toString(),
    castShareUrl: new URL("/?miniApp=true", baseUrl).toString(),
    webhookUrl: process.env.FARCASTER_WEBHOOK_URL || undefined,
    requiredCapabilities: [
      "actions.composeCast",
      "actions.viewProfile",
      "actions.signIn",
      "wallet.getEthereumProvider",
    ],
    canonicalDomain: baseUrl.hostname,
    ...(process.env.FARCASTER_WEBHOOK_URL
      ? { webhookUrl: process.env.FARCASTER_WEBHOOK_URL }
      : {}),
  },
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`wrote ${outputPath}`);
