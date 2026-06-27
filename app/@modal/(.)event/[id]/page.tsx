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
    // scrollbar. The middle card carries the slide animation and is a flex
    // column: the scroll area flexes to fill, the action bar sits BELOW it as a
    // normal child (never overlaps the content). The scroll element itself is
    // never the one being transformed, which iOS WebKit needs to scroll smoothly.
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="detail-overlay mx-auto flex h-full max-w-[480px] flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.18)] animate-detail-in motion-reduce:animate-none">
        <div className="detail-scroll min-h-0 w-full flex-1 overflow-y-auto overscroll-contain bg-bg">
          <EventDetail event={ev} />
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
    </div>
  );
}
