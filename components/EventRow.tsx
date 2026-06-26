import Link from "next/link";
import type { LaEvent } from "@/lib/types";

// A single event in the list: title, optional artists, venue+location, hour+price.
// No card background — sits on the grey page. Same-date events are separated by an
// inset #CACACA line; the last event of a day uses the group's full-width separator.
export function EventRow({
  event,
  first = false,
  last = false,
}: {
  event: LaEvent;
  first?: boolean;
  last?: boolean;
}) {
  const priceLabel = event.free ? "Gratis" : event.price;
  const venueName = event.venue?.name ?? "";
  return (
    <Link
      href={`/event/${event.id}`}
      className={
        "block pb-6 pr-5 " +
        (first ? "pt-5" : "pt-6") +
        (last ? "" : " border-b border-line")
      }
    >
      <h3 className="font-display text-[28px] font-bold leading-[1.05] text-ink">
        {event.name}
      </h3>

      {event.artists && (
        <p className="mt-0.5 line-clamp-2 text-[20px] font-bold leading-snug text-ink">
          {event.artists}
        </p>
      )}

      <p className="mt-2 text-[16px]">
        {venueName && (
          <span className="font-bold text-muted">{venueName}</span>
        )}
        {venueName && event.location && " "}
        {event.location && <span className="text-muted">{event.location}</span>}
      </p>

      {(event.hour || priceLabel) && (
        <p className="mt-0.5 text-[16px]">
          {event.hour && <span className="font-bold text-muted">{event.hour}</span>}
          {event.hour && priceLabel && <span className="text-muted"> · </span>}
          {priceLabel && <span className="text-muted">{priceLabel}</span>}
        </p>
      )}
    </Link>
  );
}
