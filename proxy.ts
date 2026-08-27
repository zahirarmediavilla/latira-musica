import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only event routes reach this proxy.
export const config = {
  matcher: "/event/:path*",
};

// Canonical event slugs end with the event date and id, e.g.
// `/event/rollu-folk-villaviciosa-15-ago-2026-123`. We read the date straight
// from the slug — no DB call — so the proxy stays fast and CDN-friendly (the
// docs warn against fetching content here). The `\d+$` anchor also excludes the
// `/event/<slug>/calendar` and `/event/<slug>/gone` subroutes and bare-id links
// (`/event/123`), which fall through untouched.
const MONTHS: Record<string, number> = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};
const SLUG_DATE =
  /-(\d{1,2})-(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)-(\d{4})-\d+$/;

// Today (YYYY-MM-DD) in Europe/Madrid, to decide whether an event is past.
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(
    new Date(),
  );
}

// A past event no longer exists (it gets archived out of `eventos`), so its
// former URL must not linger in Google as a soft-404/404. We hand it off to the
// `/gone` route handler, which answers 410 Gone — the explicit "this is
// permanently gone" signal so crawlers drop it fast — and, for a recently-passed
// event still in the table, shows the branded "ya pasó" page with the next
// events nearby. The date check stays here (no DB) so the proxy is still fast;
// the DB read lives in the route, off the CDN-optimizable path.
export function proxy(request: NextRequest): NextResponse | undefined {
  const m = request.nextUrl.pathname.match(SLUG_DATE);
  if (!m) return; // not a dated event detail URL → let the page handle it

  const [, day, mon, year] = m;
  const eventDate = `${year}-${String(MONTHS[mon]).padStart(2, "0")}-${day.padStart(2, "0")}`;
  if (eventDate >= today()) return; // still upcoming → render normally

  return NextResponse.rewrite(
    new URL(`${request.nextUrl.pathname}/gone`, request.url),
  );
}
