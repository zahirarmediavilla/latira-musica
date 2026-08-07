import { Suspense } from "react";
import type { Metadata } from "next";
import { getEvents } from "@/lib/events";
import { HomeView } from "@/components/HomeView";
import { HomeSkeleton } from "@/components/HomeSkeleton";
import { OrganizationJsonLd } from "@/components/JsonLd";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  canonicalFor,
  openGraphFor,
} from "@/lib/seo";

// ISR: regenerate the homepage at most every 5 min (matches the Supabase data
// cache in lib/supabase.ts). Newly scraped events still appear within ~5 min,
// but — unlike the previous `force-dynamic` — the rendered page is now
// CDN-cacheable, so visitors and crawlers get a cached HTML response instead of
// a full re-render on every request (much better TTFB and crawl efficiency).
export const revalidate = 300;

// Title/description/robots are inherited from the root layout; here we add the
// home canonical and og:url (both only once a base URL is configured).
export const metadata: Metadata = {
  robots: { index: true, follow: true },
  alternates: canonicalFor("/"),
  openGraph: openGraphFor({
    // Marca delante en portada, igual que el <title> (ver app/layout.tsx).
    title: `${SITE_NAME} | ${HOME_TITLE}`,
    description: HOME_DESCRIPTION,
    path: "/",
  }),
};

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">
        Agenda de conciertos y eventos musicales en Asturias
      </h1>
      {/* Suspense scoped to the home ONLY (there is no global loading.tsx): the
          list streams behind the skeleton on a cold render, without imposing a
          streaming boundary on the event route — which would break its 404/308
          status codes. */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeList />
      </Suspense>
      <OrganizationJsonLd />
    </>
  );
}

// Async child so the awaited Supabase read sits inside the Suspense boundary.
async function HomeList() {
  const events = await getEvents();
  return <HomeView events={events} />;
}
