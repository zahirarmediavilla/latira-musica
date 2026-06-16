import "server-only";
import { fetchRecords, AirtableRecord, F, TBL_EVENTS, TBL_VENUES } from "./airtable";
import type { LaEvent, Venue } from "./types";
import { formatHour } from "./format";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function arr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}
function isFree(price: string): boolean {
  return /grat|libre/i.test(price);
}

// Convert ALL-CAPS values (e.g. "RITMO VUDÚ") to Title Case. Strings that
// already contain a lowercase letter are left untouched.
function fixCaps(s: string): string {
  if (!s || /\p{Ll}/u.test(s)) return s;
  return s
    .toLowerCase()
    .replace(/(^|[^\p{L}])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

async function getVenueMap(): Promise<Map<string, Venue>> {
  const records = await fetchRecords(TBL_VENUES, { pageSize: "100" });
  const map = new Map<string, Venue>();
  for (const r of records) {
    map.set(r.id, {
      id: r.id,
      name: fixCaps(str(r.fields[F.vName])),
      address: str(r.fields[F.vAddress]),
      mapsUrl: str(r.fields[F.vMaps]),
      municipio: str(r.fields[F.vMunicipio]),
      localidad: str(r.fields[F.vLocalidad]),
    });
  }
  return map;
}

function toEvent(r: AirtableRecord, venues: Map<string, Venue>): LaEvent {
  const venueIds = arr(r.fields[F.venue]);
  const venue = venueIds.length ? venues.get(venueIds[0]) ?? null : null;
  const price = str(r.fields[F.price]);
  const name = fixCaps(str(r.fields[F.name]));
  const artists = fixCaps(str(r.fields[F.artists]));
  return {
    id: r.id,
    name,
    date: str(r.fields[F.date]),
    hour: formatHour(str(r.fields[F.hour])),
    // Hide the artists line when it just duplicates the event name.
    artists: artists.trim().toLowerCase() === name.trim().toLowerCase() ? "" : artists,
    genres: arr(r.fields[F.genres]),
    price,
    free: isFree(price),
    ticketUrl: str(r.fields[F.ticketUrl]),
    eventUrl: str(r.fields[F.eventUrl]),
    location: str(r.fields[F.location]),
    venue,
    description: str(r.fields[F.description]),
    sampleUrl: str(r.fields[F.sample]),
  };
}

function byDateThenHour(a: LaEvent, b: LaEvent): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return (a.hour || "99:99").localeCompare(b.hour || "99:99");
}

/** Up to 100 upcoming events, sorted by date ascending (server-side), joined
 *  with venue data. The local sort additionally orders by hour within a day. */
export async function getEvents(): Promise<LaEvent[]> {
  const [records, venues] = await Promise.all([
    fetchRecords(TBL_EVENTS, {
      maxRecords: "100",
      pageSize: "100",
      "sort[0][field]": "Date",
      "sort[0][direction]": "asc",
      // Date is today or later (after yesterday).
      filterByFormula: "IS_AFTER({Date}, DATEADD(TODAY(), -1, 'days'))",
    }),
    getVenueMap(),
  ]);
  return records
    .map((r) => toEvent(r, venues))
    .filter((e) => e.date) // need a date to place it in the list
    .sort(byDateThenHour);
}

export async function getEventById(id: string): Promise<LaEvent | null> {
  const events = await getEvents();
  return events.find((e) => e.id === id) ?? null;
}
