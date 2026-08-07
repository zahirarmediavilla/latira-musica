import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";
import { DetailActions } from "@/components/DetailActions";
import { EventJsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";
import { AnalyticsEvent } from "@/lib/analytics";
import {
  SITE_NAME,
  canonicalFor,
  eventDescription,
  eventIdFromSlug,
  eventPath,
  eventSlug,
  eventTitle,
  openGraphFor,
  twitterFor,
} from "@/lib/seo";

// ISR: render each event once and cache it for 5 min (matches the Supabase data
// cache). This makes the page CDN-cacheable AND — crucially — renders it to
// completion before responding, so `notFound()` returns a real 404 and
// `permanentRedirect()` a real 308. While the route was dynamic/streamed (via
// the root loading.tsx boundary) both degraded: notFound() served a 200
// soft-404 and a redirect would have been a client-side meta tag.
export const revalidate = 300;

// Prerender nothing at build (slugs are unknown and churn daily), but opt the
// route into ISR: with `generateStaticParams` present, Next renders each event
// on first request to COMPLETION and caches it — instead of streaming it
// dynamically. Blocking render is what makes `notFound()`/`permanentRedirect()`
// return real 404/308 status codes rather than a 200 soft-404 or a client-side
// redirect meta tag (the streaming-context degradation). `dynamicParams` stays
// at its default `true`, so any event id still resolves on demand.
export function generateStaticParams(): { slug: string }[] {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = eventIdFromSlug(slug);
  const ev = id === null ? null : await getEventById(String(id));
  if (!ev) return {}; // falls back to the layout defaults

  const title = eventTitle(ev);
  const description = eventDescription(ev);
  // Always canonical to the enriched slug, so a bare-id or stale-slug URL
  // consolidates onto one address for search engines.
  const path = eventPath(ev);

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: canonicalFor(path),
    openGraph: openGraphFor({
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "article",
      path,
    }),
    twitter: twitterFor({
      title: `${title} | ${SITE_NAME}`,
      description,
    }),
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = eventIdFromSlug(slug);
  const ev = id === null ? null : await getEventById(String(id));
  if (!ev) notFound();

  // Consolidate every alias of this event onto its canonical slug: a bare-id
  // link (/event/532) or a stale slug (name/date edited since) 308-redirects to
  // the enriched address instead of serving a duplicate 200. The intercepting
  // modal never hits this — its links are already canonical.
  const canonical = eventSlug(ev);
  if (slug !== canonical) permanentRedirect(eventPath(ev));

  return (
    // Direct visits (hard navigation) land here instead of the intercepting
    // overlay. Fixed, viewport-locked flex column: the scroll area flexes to
    // fill the space and the action bar sits BELOW it as a normal child, so the
    // bar can never overlap the content — the last item ("Visto en") is always
    // scrollable into view on any device, with no padding/safe-area math.
    <div className="fixed inset-0 overflow-hidden">
      <EventJsonLd event={ev} />
      {/* Carga directa (deep link, SEO, enlace compartido) → origen "directo". */}
      <TrackView
        event={AnalyticsEvent.verFichaEvento}
        data={{ id: ev.id, name: ev.name, origen: "directo" }}
      />
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
        <div className="detail-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-bg">
          <EventDetail event={ev} />
        </div>
        <DetailActions
          data={{ id: ev.id, name: ev.name, ticketUrl: ev.ticketUrl }}
        />
      </div>
    </div>
  );
}
