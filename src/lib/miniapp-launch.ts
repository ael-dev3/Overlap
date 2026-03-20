import { miniAppLaunchVersion } from "@/lib/build-meta.generated";

export function buildMiniAppLaunchUrl(baseUrl: string | URL) {
  const resolvedBaseUrl = typeof baseUrl === "string" ? baseUrl : baseUrl.toString();
  const url = new URL("/?miniApp=true", resolvedBaseUrl);
  url.searchParams.set("v", miniAppLaunchVersion);
  return url.toString();
}

export { miniAppLaunchVersion };
