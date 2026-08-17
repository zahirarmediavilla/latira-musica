import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/events";
import { siteUrl, absoluteUrl, eventPath } from "@/lib/seo";

// Sitemap entries require absolute URLs, so we emit nothing until a base URL is
// configured (lib/seo.ts). Includes the homepage and every event page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the bare base URL for the home entry (no trailing slash) so it matches
  // the canonical Next emits for "/" — otherwise the sitemap would list
  // "https://latira.org/" while the page canonicals to "https://latira.org".
  const home = siteUrl();
  if (!home) return [];

  const events = await getEvents();

  return [
    {
      url: home,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/info")!,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...events.map((ev) => ({
      url: absoluteUrl(eventPath(ev))!,
      // A STABLE per-URL date (when the event was added) instead of `new Date()`.
      // A lastmod that changes on every crawl/deploy teaches crawlers to ignore
      // it; a real timestamp lets them prioritise genuinely new events.
      lastModified: ev.createdAt ? new Date(ev.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
