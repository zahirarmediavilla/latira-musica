import "server-only";

// Clasifica una URL de `sample_url` en cómo mostrarla en la ficha:
//  - "youtube": reproductor de vídeo embebido (nocookie).
//  - "embed":   reproductor de audio embebido (Bandcamp / Spotify / SoundCloud),
//               igual que YouTube: se ve el reproductor directamente.
//  - "link":    tarjeta "Ir a la web de X" para hosts no embebibles (sello,
//               tienda…), que deja claro que se abre la fuente fuera.
export type SampleMedia =
  | { kind: "youtube"; src: string }
  | { kind: "embed"; src: string; height: number; title: string }
  | { kind: "link"; href: string; label: string; sublabel: string };

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Entidades HTML habituales en og:title (&amp;, &#39;, comillas…).
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#0?39;|&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

function metaContent(html: string, prop: string): string {
  const esc = prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const a = html.match(
    new RegExp(`<meta[^>]+property=["']${esc}["'][^>]*content=["']([^"']*)["']`, "i"),
  );
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${esc}["']`, "i"),
  );
  return decodeEntities(a?.[1] ?? b?.[1] ?? "");
}

function pageTitle(html: string): string {
  return decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "");
}

// Quita el sufijo " | Sitio" / " - Sitio" que muchas webs añaden al título.
function stripSite(title: string, site: string): string {
  if (!site) return title;
  const esc = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return title.replace(new RegExp(`\\s*[|\\u2013\\u2014\\-]\\s*${esc}\\s*$`, "i"), "").trim();
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "user-agent": "Mozilla/5.0 (compatible; latira/1.0; +https://latira.org)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 120000); // los metadatos van en el <head>
  } catch {
    return null;
  }
}

// youtube-nocookie: el reproductor no deja cookies de seguimiento hasta que la
// persona pulsa play (mismo criterio privacy-first que el resto de la web).
function youtubeSrc(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

// Bandcamp: el id numérico del álbum/tema no está en la URL; se lee de la propia
// página (lo trae el meta og:video como EmbeddedPlayer/album=ID), junto con el
// título para la etiqueta accesible. Se cachea un día y si falla cae a "link".
async function bandcampEmbed(url: string): Promise<SampleMedia | null> {
  if (!/(^|\.)bandcamp\.com$/.test(hostOf(url))) return null;
  const html = await fetchText(url);
  if (!html) return null;
  const m = html.match(/EmbeddedPlayer\/(?:v=\d+\/)?(album|track)=(\d+)/);
  if (!m) return null;
  const [, type, id] = m;
  const og = metaContent(html, "og:title"); // "Título, by Artista"
  // bgcol/linkcol a juego con los tokens de la web (--color-bg / --color-blue).
  const src =
    `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/bgcol=ebebeb/` +
    `linkcol=0076dd/tracklist=false/artwork=small/transparent=true/`;
  return { kind: "embed", src, height: 120, title: og ? `${og} en Bandcamp` : "Reproductor de Bandcamp" };
}

// Spotify: el id va en la propia URL (admite prefijo de idioma /intl-es/).
function spotifyEmbed(url: string): SampleMedia | null {
  const m = url.match(
    /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/,
  );
  if (!m) return null;
  const [, type, id] = m;
  const single = type === "track" || type === "episode";
  return {
    kind: "embed",
    src: `https://open.spotify.com/embed/${type}/${id}`,
    height: single ? 152 : 352,
    title: "Reproductor de Spotify",
  };
}

// SoundCloud: el reproductor toma la URL original como parámetro, sin fetch.
function soundcloudEmbed(url: string): SampleMedia | null {
  if (!/(^|\.)soundcloud\.com$/.test(hostOf(url))) return null;
  const params = new URLSearchParams({
    url,
    color: "#0076dd",
    hide_related: "true",
    show_comments: "false",
    show_reposts: "false",
    visual: "false",
  });
  return {
    kind: "embed",
    src: `https://w.soundcloud.com/player/?${params.toString()}`,
    height: 166,
    title: "Reproductor de SoundCloud",
  };
}

// Fallback: host no embebible (web de sello, tienda…). Se titula "Ir a la web de
// X" para evidenciar que se sale fuera, con el nombre real de la página debajo.
async function linkCard(url: string): Promise<SampleMedia> {
  const host = hostOf(url);
  const html = await fetchText(url);
  const site = (html ? metaContent(html, "og:site_name") : "") || host;
  const rawTitle = html ? metaContent(html, "og:title") || pageTitle(html) : "";
  const title = stripSite(rawTitle, site);
  // Principal: el nombre real de lo que hay (artista / edición). Subtítulo: la
  // acción "Ir a la web de X", que evidencia que se abre la fuente fuera.
  const hasTitle = title && title.toLowerCase() !== site.toLowerCase();
  return {
    kind: "link",
    href: url,
    label: hasTitle ? title : site,
    sublabel: hasTitle ? `Ir a la web de ${site}` : "Ir a la web",
  };
}

export async function resolveSampleMedia(url: string): Promise<SampleMedia> {
  const yt = youtubeSrc(url);
  if (yt) return { kind: "youtube", src: yt };

  const sp = spotifyEmbed(url);
  if (sp) return sp;

  const sc = soundcloudEmbed(url);
  if (sc) return sc;

  const bc = await bandcampEmbed(url);
  if (bc) return bc;

  return linkCard(url);
}
