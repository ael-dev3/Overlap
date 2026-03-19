import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-overlap-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-overlap-display",
  subsets: ["latin"],
});

const defaultAppUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://overlap-fc.web.app";

const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? defaultAppUrl);

const miniAppEmbed = {
  version: "1",
  imageUrl: absoluteUrl(appUrl.toString(), "/overlap-card.svg"),
  button: {
    title: "Open Overlap",
    action: {
      type: "launch_frame",
      name: "Overlap",
      url: absoluteUrl(appUrl.toString(), "/?miniApp=true"),
      splashImageUrl: absoluteUrl(appUrl.toString(), "/overlap-icon.svg"),
      splashBackgroundColor: "#090b12",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian font-sans text-white selection:bg-fuchsia-400/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
