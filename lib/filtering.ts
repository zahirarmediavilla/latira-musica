import type { DayGroup, LaEvent, Zone } from "./types";
import { zoneForEvent } from "./zones";
import { norm } from "./text";

export type DateChip = "finde" | "semana" | "mes";

export interface Filters {
  zones: Zone[];
  from: string | null; // YYYY-MM-DD inclusive
  to: string | null; // YYYY-MM-DD inclusive
  chip: DateChip | null;
}

export const emptyFilters: Filters = { zones: [], from: null, to: null, chip: null };

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Inclusive date range (YYYY-MM-DD) for a quick chip, relative to today. */
export function rangeForChip(chip: DateChip): { from: string; to: string } {
  const today = new Date();
  const dow = today.getDay(); // 0 Sun .. 6 Sat
  if (chip === "finde") {
    if (dow === 0) return { from: ymd(today), to: ymd(today) }; // Sunday
    if (dow === 6) return { from: ymd(today), to: ymd(addDays(today, 1)) }; // Sat–Sun
    if (dow === 5) return { from: ymd(today), to: ymd(addDays(today, 2)) }; // Fri–Sun
    const fri = addDays(today, 5 - dow);
    return { from: ymd(fri), to: ymd(addDays(fri, 2)) }; // next Fri–Sun
  }
  if (chip === "semana") {
    const toSunday = (7 - dow) % 7;
    return { from: ymd(today), to: ymd(addDays(today, toSunday)) };
  }
  // mes: today through last day of current month
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: ymd(today), to: ymd(end) };
}

export function filtersActive(f: Filters): boolean {
  return f.zones.length > 0 || f.from !== null || f.to !== null;
}

export function countActive(f: Filters): number {
  return f.zones.length + (f.from || f.to ? 1 : 0);
}

/** Apply zone + date-range filters and a free-text query (name/artists).
 *
 *  Name/artists only, by design: the venue and locality a row displays are not
 *  searchable, and that is not a bug to fix. Geography belongs to the zone
 *  filter; a locality that does match ("Luanco") matches as part of the event
 *  name. Ask before widening the haystack. */
export function applyFilters(
  events: LaEvent[],
  f: Filters,
  query: string,
): LaEvent[] {
  const q = norm(query.trim());
  const zoneSet = new Set(f.zones);
  return events.filter((ev) => {
    if (f.from && ev.date < f.from) return false;
    if (f.to && ev.date > f.to) return false;
    if (zoneSet.size > 0) {
      const z = zoneForEvent(ev);
      if (!z || !zoneSet.has(z)) return false;
    }
    if (q) {
      const hay = norm(`${ev.name} ${ev.artists}`);
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Group an already-sorted list into consecutive day buckets. */
export function groupByDay(events: LaEvent[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const ev of events) {
    const last = groups[groups.length - 1];
    if (last && last.date === ev.date) last.events.push(ev);
    else groups.push({ date: ev.date, events: [ev] });
  }
  return groups;
}
