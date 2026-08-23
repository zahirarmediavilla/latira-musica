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
// `/event/<slug>/calendar` subroute and bare-id links (`/event/123`), which fall
// through to the page untouched.
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
// former URL must not linger in Google as a soft-404/404. We answer 410 Gone —
// the explicit "this is permanently gone" signal — so crawlers drop it fast.
export function proxy(request: NextRequest): NextResponse | undefined {
  const m = request.nextUrl.pathname.match(SLUG_DATE);
  if (!m) return; // not a dated event detail URL → let the page handle it

  const [, day, mon, year] = m;
  const eventDate = `${year}-${String(MONTHS[mon]).padStart(2, "0")}-${day.padStart(2, "0")}`;
  if (eventDate >= today()) return; // still upcoming → render normally

  return new NextResponse(gonePage(), {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Self-contained 410 page (the proxy can't import the React not-found UI, but it
// mirrors it: brand header, the "ya ha pasado" message and a blue "Volver a
// home" pill). `noindex` reinforces removal from search results.
function gonePage(): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Este evento ya ha pasado | LaTira</title>
<style>
@font-face{font-family:"Vremena Grotesk";src:url("/Vremena%20Grotesk/Web%20Fonts/vremenagrotesk_bold_macroman/vremenagroteskbold-webfont.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
*{margin:0;box-sizing:border-box}
body{min-height:100dvh;display:flex;flex-direction:column;background:#ebebeb;color:#1a1a1a;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif}
header{background:#1a1a1a}
.bar{height:118px;display:flex;align-items:center;padding:0 20px}
.mark{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:40px;color:#fff;letter-spacing:-0.01em}
.line{height:10px;background:#0076dd}
main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px}
h1{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:28px;line-height:1.05}
a.btn{margin-top:32px;width:100%;max-width:260px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:#0076dd;color:#fff;font-size:15px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none}
a.btn:hover{background:#0061b8}
</style>
</head>
<body>
<header><div class="bar"><span class="mark">LaTira</span></div><div class="line"></div></header>
<main>
<h1>Este evento ya ha pasado</h1>
<a class="btn" href="/">Volver a home</a>
</main>
</body>
</html>`;
}
