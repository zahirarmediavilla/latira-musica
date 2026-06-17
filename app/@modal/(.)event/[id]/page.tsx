import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";

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

  return (
    // Fixed wrapper clips the off-screen start of the slide so it never adds a
    // scrollbar; the inner card carries the animation and slides over home.
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="detail-enter mx-auto flex h-full max-w-[480px] flex-col overflow-y-auto bg-bg pb-44 shadow-[-10px_0_30px_rgba(0,0,0,0.18)]">
        <EventDetail event={ev} />
      </div>
    </div>
  );
}
