import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events";
import { eventIdFromSlug } from "@/lib/seo";
import { EventDetail } from "@/components/EventDetail";
import { DetailActions } from "@/components/DetailActions";
import { TrackView } from "@/components/TrackView";
import { AnalyticsEvent } from "@/lib/analytics";

// Intercepted detail: when navigating from within the app, the detail renders
// here as an overlay that slides in over the home list (which stays mounted).
export default async function EventModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = eventIdFromSlug(slug);
  const ev = id === null ? null : await getEventById(String(id));
  if (!ev) notFound();

  return (
    // Fixed wrapper clips the off-screen start of the slide so it never adds a
    // scrollbar. The middle card carries the slide animation and is a flex
    // column: the scroll area flexes to fill, the action bar sits BELOW it as a
    // normal child (never overlaps the content). The scroll element itself is
    // never the one being transformed, which iOS WebKit needs to scroll smoothly.
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Se llega desde la lista de la home (navegación interna) → origen "modal". */}
      <TrackView
        event={AnalyticsEvent.verFichaEvento}
        data={{ id: ev.id, name: ev.name, origen: "modal" }}
      />
      <div className="detail-overlay mx-auto flex h-full max-w-[480px] flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.18)] animate-detail-in motion-reduce:animate-none">
        <div className="detail-scroll min-h-0 w-full flex-1 overflow-y-auto overscroll-contain bg-bg">
          <EventDetail event={ev} />
        </div>
        <DetailActions
          data={{ id: ev.id, name: ev.name, ticketUrl: ev.ticketUrl }}
        />
      </div>
    </div>
  );
}
