import type { Metadata } from "next";
import { getEvents } from "@/lib/events";
import { HomeView } from "@/components/HomeView";
import { OrganizationJsonLd } from "@/components/JsonLd";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  canonicalFor,
  openGraphFor,
} from "@/lib/seo";

// Render on each request so newly scraped events appear without waiting for a
// redeploy. The Supabase read is still cached ~5 min (lib/supabase.ts), so this
// stays cheap; it just stops the homepage from freezing at build-time data.
export const dynamic = "force-dynamic";

// Title/description/robots are inherited from the root layout; here we add the
// home canonical and og:url (both only once a base URL is configured).
export const metadata: Metadata = {
  robots: { index: true, follow: true },
  alternates: canonicalFor("/"),
  openGraph: openGraphFor({
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    path: "/",
  }),
};

export default async function HomePage() {
  const events = await getEvents();
  return (
    <>
      <h1 className="sr-only">
        Agenda de conciertos y eventos musicales en Asturias
      </h1>
      <HomeView events={events} />
      <OrganizationJsonLd />
    </>
  );
}
