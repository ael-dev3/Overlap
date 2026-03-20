import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { buildMiniAppLaunchUrl } from "@/lib/miniapp-launch";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-overlap-body",
  subsets: ["latin"],
});

const defaultAppUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://overlap-fc.web.app";

const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? defaultAppUrl);
const launchUrl = buildMiniAppLaunchUrl(appUrl);

const miniAppEmbed = {
  version: "1",
  imageUrl: absoluteUrl(appUrl.toString(), "/overlap-card.svg"),
  button: {
    title: "Open Overlap",
    action: {
      type: "launch_miniapp",
      name: "Overlap",
      url: launchUrl,
      splashImageUrl: absoluteUrl(appUrl.toString(), "/overlap-icon.svg"),
      splashBackgroundColor: "#0f0d16",
    },
  },
};

const legacyFrameEmbed = {
  ...miniAppEmbed,
  button: {
    ...miniAppEmbed.button,
    action: {
      ...miniAppEmbed.button.action,
      type: "launch_frame",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: appUrl,
  title: "Overlap",
  description:
    "Overlap helps Farcaster users discover active people they genuinely match with using self-selected roles, tags, directional collaboration intent, live activity, graph context, and bounded trust signals.",
  applicationName: "Overlap",
  keywords: [
    "Farcaster",
    "Mini App",
    "social discovery",
    "collaboration",
    "Snapchain",
    "Neynar",
  ],
  icons: {
    icon: "/overlap-icon.svg",
    apple: "/overlap-icon.svg",
  },
  openGraph: {
    title: "Overlap",
    description:
      "Discover active people you genuinely overlap with on Farcaster.",
    images: [
      {
        url: "/overlap-card.svg",
        width: 1200,
        height: 800,
        alt: "Overlap Mini App preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Overlap",
    description:
      "Collaborator discovery for Farcaster, ranked by real overlap instead of raw clout.",
    images: ["/overlap-card.svg"],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
    "fc:frame": JSON.stringify(legacyFrameEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} dark h-full antialiased`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://cdn.jsdelivr.net/npm/@farcaster/miniapp-sdk/dist/index.min.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function () {
              var attempts = 0;
              var maxAttempts = 40;
              var delayMs = 125;

              function callReady() {
                attempts += 1;

                var ready = window.miniapp &&
                  window.miniapp.sdk &&
                  window.miniapp.sdk.actions &&
                  window.miniapp.sdk.actions.ready;

                if (typeof ready !== "function") {
                  if (attempts < maxAttempts) {
                    window.setTimeout(callReady, delayMs);
                  }
                  return;
                }

                Promise.resolve(ready())
                  .then(function () {
                    window.__OVERLAP_MINIAPP_READY__ = true;
                  })
                  .catch(function () {
                    if (attempts < maxAttempts) {
                      window.setTimeout(callReady, delayMs);
                    }
                  });
              }

              callReady();
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-full bg-background-dark font-sans text-on-surface selection:bg-primary/30 selection:text-on-surface">
        {children}
      </body>
    </html>
  );
}
