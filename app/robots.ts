import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Allow crawling/indexing everything. The sitemap is referenced only once a
// base URL is configured (lib/seo.ts), since robots.txt needs an absolute URL.
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(sitemap ? { sitemap } : {}),
  };
}
