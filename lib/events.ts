import "server-only";
import { supabase } from "./supabase";
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

// Spanish minor words kept lowercase in Title Case unless they open the title
// or a segment (after "+", "/", "&", "-", ":"…). Mirrors normalize.MINOR_WORDS.
const MINOR_WORDS = new Set([
  "y", "e", "o", "u", "ni",
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "del", "al",
  "a", "ante", "bajo", "con", "contra", "de", "desde", "durante", "en", "entre",
  "hacia", "hasta", "mediante", "para", "por", "según", "segun", "sin", "so",
  "sobre", "tras",
]);
const SEGMENT_SEPARATORS = new Set(["+", "/", "&", "-", "–", "—", ":", "|", "("]);

// Convert ALL-CAPS values (e.g. "RITMO VUDÚ") to Title Case. Strings that
// already contain a lowercase letter are left untouched. Minor words (y, de,
// la…) stay lowercase unless first / opening a segment. Mirrors
// agenda-scraper/normalize.py:title_case.
function fixCaps(s: string): string {
  if (!s || /\p{Ll}/u.test(s)) return s;
  const titled = s
    .toLowerCase()
    .replace(/(^|[^\p{L}])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
  let startsSegment = true;
  return titled
    .split(" ")
    .map((tok) => {
      const lowered = tok.toLowerCase();
      const out = !startsSegment && MINOR_WORDS.has(lowered) ? lowered : tok;
      startsSegment = SEGMENT_SEPARATORS.has(tok);
      return out;
    })
    .join(" ");
}

// Columns to select, including the joined venue (recintos) via venue_id.
// NB: the live `eventos` table has no `free` column — it is derived from price.
const SELECT =
  "id, name, date, start_at, artists, genres, price, ticket_url, " +
  "event_url, location, description, sample_url, " +
  "recintos ( id, nombre, direccion, maps_url, municipio, localidad )";

interface VenueRow {
  id: number;
  nombre: string | null;
  direccion: string | null;
  maps_url: string | null;
  municipio: string | null;
  localidad: string | null;
}

interface EventRow {
  id: number;
  name: string | null;
  date: string | null;
  start_at: string | null;
  artists: string | null;
  genres: string[] | null;
  price: string | null;
  ticket_url: string | null;
  event_url: string | null;
  location: string | null;
  description: string | null;
  sample_url: string | null;
  // Supabase returns a to-one embedded relation as an object (or null).
  recintos: VenueRow | VenueRow[] | null;
}

function toVenue(r: VenueRow | VenueRow[] | null): Venue | null {
  const v = Array.isArray(r) ? r[0] : r;
  if (!v) return null;
  const name = fixCaps(str(v.nombre));
  return {
    id: String(v.id),
    name,
    address: str(v.direccion),
    mapsUrl: str(v.maps_url),
    municipio: str(v.municipio),
    localidad: str(v.localidad),
  };
}

function toEvent(r: EventRow): LaEvent {
  const price = str(r.price);
  const name = fixCaps(str(r.name));
  const artists = fixCaps(str(r.artists));
  return {
    id: String(r.id),
    name,
    date: str(r.date),
    hour: formatHour(r.start_at),
    // Hide the artists line when it just duplicates the event name.
    artists: artists.trim().toLowerCase() === name.trim().toLowerCase() ? "" : artists,
    genres: arr(r.genres),
    price,
    free: isFree(price),
    ticketUrl: str(r.ticket_url),
    eventUrl: str(r.event_url),
    location: str(r.location),
    venue: toVenue(r.recintos),
    description: str(r.description),
    sampleUrl: str(r.sample_url),
  };
}

function byDateThenHour(a: LaEvent, b: LaEvent): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return (a.hour || "99:99").localeCompare(b.hour || "99:99");
}

// Today's date (YYYY-MM-DD) in Europe/Madrid, to filter out past events.
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(
    new Date(),
  );
}

/** All upcoming events (date today or later), sorted by date then hour,
 *  joined with venue data. */
export async function getEvents(): Promise<LaEvent[]> {
  const { data, error } = await supabase()
    .from("eventos")
    .select(SELECT)
    .gte("date", today())
    .order("date", { ascending: true })
    .limit(1000);

  if (error) throw new Error(`Supabase: ${error.message}`);

  return (data as unknown as EventRow[])
    .map(toEvent)
    .filter((e) => e.date) // need a date to place it in the list
    .sort(byDateThenHour);
}

export async function getEventById(id: string): Promise<LaEvent | null> {
  const numId = Number(id);
  if (!Number.isInteger(numId)) return null;

  const { data, error } = await supabase()
    .from("eventos")
    .select(SELECT)
    .eq("id", numId)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? toEvent(data as unknown as EventRow) : null;
}
