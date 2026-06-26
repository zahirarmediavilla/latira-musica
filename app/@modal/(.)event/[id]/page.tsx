import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";
import { DetailActions } from "@/components/DetailActions";

// Intercepted detail: when navigating from within the app, the detail renders
// here as an overlay that slides in over the home list (which stays mounted).
export default async function EventModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) notFound();
  const place = [ev.venue?.name, ev.location].filter(Boolean).join(", ");

  return (
    // Fixed wrapper clips the off-screen start of the slide so it never adds a
    // scrollbar. The middle card carries the slide animation; a *separate* inner
    // element owns the scroll, so the scrollable layer is never the one being
    // transformed (iOS WebKit otherwise rebuilds it after the slide, which makes
    // scrolling unresponsive for a beat).
    // DetailActions is outside the scroll div so that position:fixed works
    // reliably on iOS WebKit (fixed inside overflow:scroll is unreliable).
    <div data-detail-root className="fixed inset-0 z-50 overflow-hidden">
      <div className="detail-overlay mx-auto h-full max-w-[480px] shadow-[-10px_0_30px_rgba(0,0,0,0.18)] animate-detail-in motion-reduce:animate-none">
        <div className="detail-scroll flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-bg pb-52">
          <EventDetail event={ev} />
        </div>
      </div>
      <DetailActions
        data={{
          name: ev.name,
          date: ev.date,
          hour: ev.hour,
          place,
          description: ev.description,
          ticketUrl: ev.ticketUrl,
        }}
      />
    </div>
  );
}
