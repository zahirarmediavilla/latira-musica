import { notFound } from "next/navigation";
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
  eventTitle,
  openGraphFor,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) return {}; // falls back to the layout defaults

  const title = eventTitle(ev);
  const description = eventDescription(ev);
  const path = `/event/${ev.id}`;

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
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) notFound();

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
