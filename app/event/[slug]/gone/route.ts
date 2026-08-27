import { getEventById, getEvents } from "@/lib/events";
import { eventIdFromSlug, eventPath, eventCity } from "@/lib/seo";
import { zoneForEvent } from "@/lib/zones";
import { formatMediumDate } from "@/lib/format";
import type { LaEvent } from "@/lib/types";

// The "ya pasó" page for a PAST event. `proxy.ts` detects a past dated slug (from
// the slug alone, no DB) and rewrites the request here; this handler reads the
// event and answers 410 Gone — the explicit "this is permanently gone" signal so
// crawlers drop the stale URL fast. A recently-passed event is still in `eventos`
// (archival is weekly), so we can show a branded hero plus the next events nearby
// to catch the human who clicked a stale Google result. When the event is already
// archived (getEventById → null) we fall back to the simple message.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  // The 410 must NEVER depend on the DB being up. If any read fails (Supabase
  // down/slow), we fall back to the simple message but still answer 410 — never
  // a 500, which would make crawlers retry the stale URL instead of dropping it.
  let ev: LaEvent | null = null;
  let upcoming: LaEvent[] = [];
  try {
    const id = eventIdFromSlug(slug);
    ev = id === null ? null : await getEventById(String(id));
    if (ev) {
      const zone = zoneForEvent(ev);
      if (zone) {
        const self = ev.id;
        const all = await getEvents(); // cached; upcoming only, sorted by date
        upcoming = all
          .filter((e) => e.id !== self && zoneForEvent(e) === zone)
          .slice(0, 10);
      }
    }
  } catch {
    ev = null;
    upcoming = [];
  }

  const html = ev ? richGonePage(ev, upcoming) : simpleGonePage();

  return new Response(html, {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// ── HTML builders ───────────────────────────────────────────────────────────
// The route handler has no Tailwind/React pipeline, so the page is a plain HTML
// string with inlined CSS — the same approach the previous proxy 410 used,
// mirroring the app's tokens, self-hosted display font and the branded header.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Este evento ya ha pasado | LaTira</title>
<style>
@font-face{font-family:"Vremena Grotesk";src:url("/Vremena%20Grotesk/Web%20Fonts/vremenagrotesk_bold_macroman/vremenagroteskbold-webfont.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
*{margin:0;box-sizing:border-box}
body{min-height:100dvh;background:#ebebeb;color:#1a1a1a;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
header{background:#1a1a1a}
.bar{height:118px;display:flex;align-items:center;padding:0 20px}
.mark{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:40px;color:#fff;letter-spacing:-0.01em}
.line{height:10px;background:#0076dd}
.content{max-width:480px;margin:0 auto}
.hero{text-align:center;padding:120px 32px 0}
.hero h1{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:28px;line-height:1.05}
.hero .sub{font-size:18px;color:#545454;margin-top:12px;line-height:1.4}
.btn{max-width:280px;margin:40px auto 0;height:48px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:9999px;background:#0076dd;color:#fff;font-size:15px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;text-decoration:none}
.btn:hover{background:#0061b8}
.btn svg{width:20px;height:20px}
.list-title{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.09em;color:rgba(26,26,26,.5);padding:120px 20px 10px}
.rows{padding:0 20px 40px}
.row{display:block;padding:22px 0;border-bottom:1px solid #cacaca;text-decoration:none;color:inherit}
.row:last-child{border-bottom:none}
.row h3{font-family:"Vremena Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:28px;line-height:1.05}
.row .a{font-size:20px;font-weight:700;line-height:1.3;margin-top:4px}
.row .m{font-size:16px;color:#545454;margin-top:8px}
.row .m b{font-weight:700}
.row .h{font-size:16px;color:#545454;margin-top:4px}
.row .h b{font-weight:700}
.only{padding-bottom:120px}
</style>`;

const ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const HEADER =
  '<header><div class="bar"><span class="mark">LaTira</span></div><div class="line"></div></header>';

function page(body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
</head>
<body>
${HEADER}
<div class="content">
${body}
</div>
</body>
</html>`;
}

function rowHtml(e: LaEvent): string {
  const priceLabel = e.free ? "Gratis" : e.price;
  const venueName = e.venue?.name ?? "";
  const locationLabel = e.venue?.localidad || e.location;
  const place =
    (locationLabel ? `<b>${esc(locationLabel)}</b>` : "") +
    (locationLabel && venueName ? " · " : "") +
    (venueName ? esc(venueName) : "");
  const when =
    (e.hour ? `<b>${esc(e.hour)}</b>` : "") +
    (e.hour && priceLabel ? " · " : "") +
    (priceLabel ? esc(priceLabel) : "");
  return (
    `<a class="row" href="${esc(eventPath(e))}">` +
    `<h3>${esc(e.name)}</h3>` +
    (e.artists ? `<p class="a">${esc(e.artists)}</p>` : "") +
    (place ? `<p class="m">${place}</p>` : "") +
    (when ? `<p class="h">${when}</p>` : "") +
    `</a>`
  );
}

function richGonePage(ev: LaEvent, upcoming: LaEvent[]): string {
  // "Martes, 26 de agosto" → "26 de agosto" (drop the weekday for the sentence).
  const dateShort = formatMediumDate(ev.date).replace(/^[^,]+,\s*/, "");
  const city = eventCity(ev);
  const sub = city
    ? `${esc(ev.name)} fue el ${esc(dateShort)} en ${esc(city)}.`
    : `${esc(ev.name)} fue el ${esc(dateShort)}.`;

  const hasList = upcoming.length > 0;
  const hero =
    `<div class="hero${hasList ? "" : " only"}">` +
    `<h1>Este concierto ya pasó</h1>` +
    `<p class="sub">${sub}</p>` +
    `<a class="btn" href="/">Ver toda la agenda ${ARROW}</a>` +
    `</div>`;

  const list = hasList
    ? `<p class="list-title">Lo próximo por la zona</p>` +
      `<div class="rows">${upcoming.map(rowHtml).join("")}</div>`
    : "";

  return page(hero + list);
}

function simpleGonePage(): string {
  return page(
    `<div class="hero only">` +
      `<h1>Este evento ya ha pasado</h1>` +
      `<a class="btn" href="/">Volver a home ${ARROW}</a>` +
      `</div>`,
  );
}
