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

const accountAssociation =
  process.env.FARCASTER_HEADER &&
  process.env.FARCASTER_PAYLOAD &&
  process.env.FARCASTER_SIGNATURE
    ? {
        header: process.env.FARCASTER_HEADER,
        payload: process.env.FARCASTER_PAYLOAD,
        signature: process.env.FARCASTER_SIGNATURE,
      }
    : undefined;

const manifest = {
  ...(accountAssociation ? { accountAssociation } : {}),
  miniapp: {
    version: "1",
    name: "Overlap",
    iconUrl: new URL("/overlap-icon.svg", baseUrl).toString(),
    homeUrl: new URL("/?miniApp=true", baseUrl).toString(),
    imageUrl: new URL("/overlap-card.svg", baseUrl).toString(),
    buttonTitle: "Open Overlap",
    splashImageUrl: new URL("/overlap-icon.svg", baseUrl).toString(),
    splashBackgroundColor: "#090b12",
    requiredCapabilities: ["actions.composeCast", "actions.viewProfile"],
    ...(process.env.FARCASTER_WEBHOOK_URL
      ? { webhookUrl: process.env.FARCASTER_WEBHOOK_URL }
      : {}),
  },
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`wrote ${outputPath}`);
