// Builds an iCalendar (.ics) document for a single event.
//
// Why a shared builder served from the server (see app/event/[id]/calendar):
// iOS Safari does NOT open Calendar from a client-side blob download — it drops
// the .ics into Files and the user has to go dig for it. iOS only shows the
// native "Add to Calendar" sheet when it fetches a URL that answers with
// `Content-Type: text/calendar`. So the calendar link points at a route handler
// that returns this string with that header. Android/desktop download the same
// .ics, which opens their default calendar. One link, native everywhere.

export interface IcsEvent {
  name: string;
  date: string; // YYYY-MM-DD
  hour: string; // "HH:MM" or "" (all-day)
  place: string;
  description: string;
}

// Escapes the characters that carry meaning in an iCalendar value.
const esc = (s: string) =>
  s.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

// Local "floating" timestamp (no TZID): the event's wall-clock time, which is
// what we want — an event at 21:00 in Asturias should land at 21:00 on the
// attendee's calendar. We add `addHours` via pure UTC arithmetic so the +2h end
// time rolls the date over correctly without dragging in any timezone.
function floatingStamp(date: string, hhmm: string, addHours = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, min));
  dt.setUTCHours(dt.getUTCHours() + addHours);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}` +
    `T${p(dt.getUTCHours())}${p(dt.getUTCMinutes())}00`
  );
}

// UTC timestamp for DTSTAMP (required by RFC 5545), e.g. 20260731T090000Z.
function utcStamp(now = new Date()): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildIcs(ev: IcsEvent, now = new Date()): string {
  const dateCompact = ev.date.replace(/-/g, "");
  const uid = `${dateCompact}-${ev.name.slice(0, 20)}@latira`.replace(/\s+/g, "");

  const timeLines = ev.hour
    ? [
        `DTSTART:${floatingStamp(ev.date, ev.hour)}`,
        `DTEND:${floatingStamp(ev.date, ev.hour, 2)}`, // assume ~2h if unknown
      ]
    : [`DTSTART;VALUE=DATE:${dateCompact}`];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LaTira//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    ...timeLines,
    `SUMMARY:${esc(ev.name)}`,
    ev.place ? `LOCATION:${esc(ev.place)}` : "",
    ev.description ? `DESCRIPTION:${esc(ev.description.slice(0, 300))}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
