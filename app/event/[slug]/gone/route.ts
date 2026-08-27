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
/* Header estático (como en toda la app: h-dvh + overflow-hidden en el body); el
   scroll ocurre SOLO en .scroll, por debajo del header. */
body{height:100dvh;overflow:hidden;display:flex;flex-direction:column;background:#ebebeb;color:#1a1a1a;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
header{background:#1a1a1a;flex-shrink:0}
.bar{position:relative;height:118px}
.logo{position:absolute;left:20px;top:0;display:inline-block;height:87.23px}
.logo svg{height:100%;width:auto;display:block}
.line{height:10px;background:#0076dd}
.scroll{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
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

// Marca LaTira: copia EXACTA de los paths de components/Logo.tsx (un route
// handler no puede importar TSX, igual que scripts/generate-og.mjs). Si cambia
// el logo en Logo.tsx, actualizar aquí. Incluye la tira roja #FF4203 sobre la "i".
const LOGO_SVG =
  '<svg viewBox="20 0 150.456 87.2263" role="img" aria-label="LaTira" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M150.955 87.2263C145.255 87.2263 141.355 83.8063 141.355 78.8263C141.355 73.1863 146.335 69.2863 155.095 68.5063L159.775 68.0863V67.2463C159.775 65.0863 158.395 63.6463 156.355 63.6463C154.315 63.6463 152.875 65.0863 152.755 67.1863L142.255 66.9463C142.495 60.1063 148.555 55.1263 156.655 55.1263C164.635 55.1263 170.455 60.4063 170.455 67.5463V77.0263C170.455 80.2063 170.635 84.1663 171.055 86.6263H160.555C160.315 85.3663 160.195 83.9863 160.195 83.0263C158.395 85.4263 155.035 87.2263 150.955 87.2263ZM154.915 79.9063C157.615 79.9063 159.895 77.5663 159.895 74.4463V74.2063L155.935 74.6263C153.775 74.8663 152.155 75.7663 152.155 77.5663C152.155 79.0063 153.235 79.9063 154.915 79.9063Z" fill="#FFFDFD" />' +
  '<path d="M119.138 86.6263V56.0263H129.938L129.638 62.9263C131.138 56.6263 135.878 54.8263 140.738 56.0263V66.8263C135.938 65.9263 129.938 66.6463 129.938 74.0263V86.6263H119.138Z" fill="#FFFDFD" />' +
  '<path d="M105.738 86.6263V56.0263H115.738V86.6263H105.738Z" fill="#FFFDFD" />' +
  '<path d="M105.738 51.9961V0H115.738V51.9961H105.738Z" fill="#FF4203" />' +
  '<path d="M102.029 86.5063C93.929 88.3063 85.8291 85.8463 85.8291 74.9263V65.0263H81.0291V56.0263H85.8291V48.2263H96.6291V56.0263H102.929V65.0263H96.6291V74.0263C96.6291 77.8063 99.1491 78.0463 102.029 77.5063V86.5063Z" fill="#FFFDFD" />' +
  '<path d="M60.1884 87.2263C54.4884 87.2263 50.5884 83.8063 50.5884 78.8263C50.5884 73.1863 55.5684 69.2863 64.3284 68.5063L69.0084 68.0863V67.2463C69.0084 65.0863 67.6284 63.6463 65.5884 63.6463C63.5484 63.6463 62.1084 65.0863 61.9884 67.1863L51.4884 66.9463C51.7284 60.1063 57.7884 55.1263 65.8884 55.1263C73.8684 55.1263 79.6884 60.4063 79.6884 67.5463V77.0263C79.6884 80.2063 79.8684 84.1663 80.2884 86.6263H69.7884C69.5484 85.3663 69.4284 83.9863 69.4284 83.0263C67.6284 85.4263 64.2684 87.2263 60.1884 87.2263ZM64.1484 79.9063C66.8484 79.9063 69.1284 77.5663 69.1284 74.4463V74.2063L65.1684 74.6263C63.0084 74.8663 61.3884 75.7663 61.3884 77.5663C61.3884 79.0063 62.4684 79.9063 64.1484 79.9063Z" fill="#FFFDFD" />' +
  '<path d="M20 86.6263V44.6263H31.4V77.2663H48.8V86.6263H20Z" fill="#FFFDFD" />' +
  '</svg>';

const HEADER =
  `<header><div class="bar"><a class="logo" href="/" aria-label="LaTira, volver a la agenda">${LOGO_SVG}</a></div><div class="line"></div></header>`;

function page(body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
</head>
<body>
${HEADER}
<div class="scroll">
<div class="content">
${body}
</div>
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
