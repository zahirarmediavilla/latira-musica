import type { DayGroup } from "@/lib/types";
import { dayNumber, monthAbbr } from "@/lib/format";
import { HEADER_H } from "@/lib/layout";
import { EventRow } from "./EventRow";

// Home list spacing mirrors the Figma frame:
//  - date gutter: 72px wide, 20px gap -> event content starts at x=92
//  - the date block (yellow stripe sized to the day/month text + the day / month)
//    sticks to the top-left flush under the header (blue line, HEADER_H) while its
//    day's events scroll, until the next day pushes it away.
export function EventList({
  groups,
  dateTop = HEADER_H,
}: {
  groups: DayGroup[];
  dateTop?: number;
}) {
  return (
    <div className="pb-20">
      {groups.map((group) => (
        <div
          key={group.date}
          className="flex"
          style={{ borderBottom: "1.5px solid #b8b8b8" }}
        >
          <div className="w-[72px] shrink-0">
            <div className="sticky flex gap-3.5" style={{ top: dateTop }}>
              <div className="w-1.5 self-stretch bg-yellow" />
              <div className="flex flex-col justify-center py-5 text-center leading-none">
                <div className="font-display text-[26px] font-bold text-ink">
                  {dayNumber(group.date)}
                </div>
                <div className="mt-0.5 text-xs font-semibold tracking-wide text-muted">
                  {monthAbbr(group.date)}
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 pl-5">
            {group.events.map((ev, idx) => (
              <EventRow
                key={ev.id}
                event={ev}
                first={idx === 0}
                last={idx === group.events.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
