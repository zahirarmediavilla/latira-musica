import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Bots de IA / scrapers agresivos a los que pedimos que no rastreen. NO son
// buscadores: bloquearlos no afecta al SEO (Googlebot, Bingbot, etc. siguen con
// `*: Allow /`) ni a los previews de enlaces de redes (facebookexternalhit,
// WhatsApp…), que sí queremos para el boca a boca. Bytespider (ByteDance/TikTok)
// es el que más nos machaca la home y las fichas; se refuerza con una regla de
// Firewall en Vercel porque a menudo ignora este archivo.
const AI_SCRAPERS = [
  "Bytespider",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Amazonbot",
  "Applebot-Extended",
  "Google-Extended",
  "Meta-ExternalAgent",
  "Diffbot",
  "Omgilibot",
  "ImagesiftBot",
  "DataForSeoBot",
];

// Allow crawling/indexing everything. The sitemap is referenced only once a
// base URL is configured (lib/seo.ts), since robots.txt needs an absolute URL.
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_SCRAPERS, disallow: "/" },
    ],
    ...(sitemap ? { sitemap } : {}),
  };
}
