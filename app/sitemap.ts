import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/events";
import { absoluteUrl } from "@/lib/seo";

// Sitemap entries require absolute URLs, so we emit nothing until a base URL is
// configured (lib/seo.ts). Includes the homepage and every event page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home = absoluteUrl("/");
  if (!home) return [];

  const events = await getEvents();

  return [
    {
      url: home,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...events.map((ev) => ({
      url: absoluteUrl(`/event/${ev.id}`)!,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
