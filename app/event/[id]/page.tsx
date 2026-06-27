import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";
import { DetailActions } from "@/components/DetailActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEventById(id);
  return { title: ev ? `${ev.name} — LaTira` : "LaTira" };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) notFound();
  const place = [ev.venue?.name, ev.location].filter(Boolean).join(", ");

  return (
    // Direct visits (hard navigation, e.g. opening the link in DuckDuckGo) land
    // here instead of the intercepting overlay. Use the same fixed,
    // viewport-locked scroll container as the modal so iOS WebKit scrolls it
    // reliably: document scroll with min-h-dvh is flaky on WebKit because the
    // dynamic toolbar resizes the viewport, so short pages barely scroll and
    // feel stuck. A definite-height .detail-scroll with momentum avoids that.
    // DetailActions is outside the scroll div so that position:fixed works
    // reliably on iOS WebKit (fixed inside overflow:scroll is unreliable).
    <div data-detail-root className="fixed inset-0 overflow-hidden">
      <div className="detail-scroll mx-auto flex h-full w-full max-w-[480px] flex-col overflow-y-auto overscroll-contain bg-bg pb-[calc(var(--detail-bar-h)_+_3rem)]">
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
  );
}
