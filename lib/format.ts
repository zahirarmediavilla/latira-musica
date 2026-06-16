// Spanish date/time formatting. Airtable stores the intended wall-clock time
// as UTC (e.g. "2026-08-08T19:00:00.000Z" means 19:00), so we read the UTC
// parts to avoid a timezone shift.

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_ABBR = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];
const DIAS = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

// Parse a YYYY-MM-DD date string as a UTC date (noon to be safe).
function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00.000Z`);
}

/** "HH:MM" from an Airtable dateTime ISO string, read in UTC. "" if missing. */
export function formatHour(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Two-digit day for the lateral date label, e.g. "08". */
export function dayNumber(date: string): string {
  return String(parseDate(date).getUTCDate()).padStart(2, "0");
}

/** Short uppercase month for the lateral date label, e.g. "AGO". */
export function monthAbbr(date: string): string {
  return MESES_ABBR[parseDate(date).getUTCMonth()];
}

/** Weekday name, e.g. "sábado". */
export function weekday(date: string): string {
  return DIAS[parseDate(date).getUTCDay()];
}

/** Medium form for the detail screen (no year), e.g. "martes, 16 de junio".
 *  Rendered with CSS `capitalize` in the UI -> "Martes, 16 De Junio". */
export function formatMediumDate(date: string): string {
  const d = parseDate(date);
  return `${DIAS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}

/** Date for the filter field, e.g. "14 FEB 2026". */
export function formatFilterDate(date: string): string {
  const d = parseDate(date);
  return `${d.getUTCDate()} ${MESES_ABBR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Short date for ranges, e.g. "16 JUN" (no year). */
export function formatShortDate(date: string): string {
  const d = parseDate(date);
  return `${d.getUTCDate()} ${MESES_ABBR[d.getUTCMonth()]}`;
}
