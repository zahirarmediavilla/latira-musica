// Single source of truth for SEO config and metadata helpers.
//
// Base URL: configure it in ONE place via the NEXT_PUBLIC_SITE_URL env var
// (e.g. "https://latira.org"). Until it exists, every helper degrades
// gracefully — no absolute URLs, canonicals or sitemap entries are emitted,
// and the app keeps working with relative metadata.

import type { Metadata } from "next";
import type { LaEvent } from "./types";
import { formatFilterDate, formatMediumDate, formatShortDate } from "./format";

export const SITE_NAME = "LaTira";

export const HOME_TITLE = "Agenda de conciertos y eventos musicales en Asturias";
export const HOME_DESCRIPTION =
  "La Tira es la agenda de música de Asturias: conciertos, festivales, salas y bolos de bares actualizados a diario. Encuentra qué ver y escuchar hoy cerca de ti —Oviedo, Gijón, Avilés, y todo Asturias— con fecha, sala, artistas y entradas.";

/** Configured base URL without a trailing slash, or `undefined` if unset. */
export function siteUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

/** Absolute URL for a path, or `undefined` while no base URL is configured. */
export function absoluteUrl(path = "/"): string | undefined {
  const base = siteUrl();
  if (!base) return undefined;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `alternates` block with a canonical URL — only when a base URL exists. */
export function canonicalFor(path: string): Metadata["alternates"] {
  const canonical = absoluteUrl(path);
  return canonical ? { canonical } : undefined;
}

/**
 * Shared social preview image: a generic 1200×630 card (`/og.png`) — the white
 * LaTira wordmark centered on the brand's near-black background, with black
 * padding all around. 1200×630 is the size Facebook/X/WhatsApp/Telegram render
 * as a large banner, so the share shows a proper branded card instead of a tiny
 * icon. Deliberately generic (same image for every page): the site has no
 * per-event artwork, so a clean brand card beats a mismatched thumbnail.
 * `undefined` until a base URL exists: a relative image with no `metadataBase`
 * is a build error, and the tag needs an absolute URL anyway.
 */
function socialImage():
  | { url: string; width: number; height: number; alt: string }
  | undefined {
  const url = absoluteUrl("/og.png");
  return url ? { url, width: 1200, height: 630, alt: SITE_NAME } : undefined;
}

/**
 * Complete Open Graph block. Centralized because Next merges metadata
 * shallowly — a page that sets a partial `openGraph` would drop the shared
 * fields (siteName, locale, type), so every page builds the full object here.
 * `og:url` and `og:image` are included only once a base URL is configured.
 */
export function openGraphFor(opts: {
  title: string;
  description: string;
  type?: "website" | "article";
  path?: string;
}): NonNullable<Metadata["openGraph"]> {
  const url = opts.path ? absoluteUrl(opts.path) : undefined;
  const image = socialImage();
  return {
    type: opts.type ?? "website",
    siteName: SITE_NAME,
    locale: "es_ES",
    title: opts.title,
    description: opts.description,
    ...(url ? { url } : {}),
    ...(image ? { images: [image] } : {}),
  };
}

/**
 * Twitter/X card block. `summary_large_image` because the preview is now the
 * 1200×630 brand banner (see `socialImage`), which renders as a full-width card.
 * Same shallow-merge reasoning as `openGraphFor`: build the whole object every
 * place. Image only once a base URL exists.
 */
export function twitterFor(opts: {
  title: string;
  description: string;
}): NonNullable<Metadata["twitter"]> {
  const image = socialImage();
  return {
    card: image ? "summary_large_image" : "summary",
    title: opts.title,
    description: opts.description,
    ...(image ? { images: [image] } : {}),
  };
}

// ── Event-derived strings (shared by metadata + JSON-LD) ────────────────────

/** Town/city for the event: venue's locality, falling back to `location`. */
export function eventCity(ev: LaEvent): string {
  return ev.venue?.localidad || ev.location || "";
}

/** Human place name: venue name, falling back to `location`. */
export function eventPlace(ev: LaEvent): string {
  return ev.venue?.name || ev.location || "";
}

/**
 * Combined place label, same order the UI shows: "localidad · recinto".
 * Falls back to whichever half exists (e.g. only the venue, or only the town).
 */
export function eventPlaceLabel(ev: LaEvent): string {
  const city = ev.venue?.localidad || ev.location || "";
  const venue = ev.venue?.name || "";
  if (city && venue) return `${city} · ${venue}`;
  return venue || city;
}

/**
 * Page title for an event, WITHOUT the "| LaTira" suffix (the root layout's
 * title template adds it). Enriched with city and short date when available,
 * kept concise — e.g. "Sisters Of Doom · Gijón, 16 jun".
 */
export function eventTitle(ev: LaEvent): string {
  const city = eventCity(ev);
  const date = ev.date ? formatShortDate(ev.date).toLowerCase() : "";
  if (city && date) return `${ev.name} · ${city}, ${date}`;
  if (city) return `${ev.name} · ${city}`;
  return ev.name;
}

/**
 * Collapse whitespace and truncate to `max` chars on a word boundary, adding an
 * ellipsis when cut. Meta descriptions render on a single line and Google trims
 * around ~160 chars, so newlines and runs of spaces are flattened first and any
 * dangling punctuation at the cut is dropped.
 */
function truncateForMeta(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(
    /[\s.,;:·–—-]+$/,
    "",
  );
  return `${trimmed}…`;
}

/**
 * Meta description for an event. Prefers the event's own curated description —
 * a unique, compelling snippet gives a better search-result CTR and avoids the
 * near-duplicate boilerplate that repeats across hundreds of pages. Falls back
 * to a data-built sentence (name/date/place) when there's no real description,
 * or it's too short to stand on its own as a snippet. Never leaves holes: the
 * place/date clauses are dropped when absent.
 */
export function eventDescription(ev: LaEvent): string {
  const own = ev.description?.replace(/\s+/g, " ").trim() ?? "";
  if (own.length >= 40) return truncateForMeta(own);

  const place = eventPlaceLabel(ev);
  const date = ev.date ? formatMediumDate(ev.date) : "";
  const when = date ? ` el ${date}` : "";
  const where = place ? ` en ${place}` : "";
  return `${ev.name} actúa${when}${where}. Consulta horarios, ubicación y toda la información del evento.`;
}

// ── Event URL slug ──────────────────────────────────────────────────────────

/** URL-safe fragment: lowercase, accent-free, non-alphanumerics → hyphens. */
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * SEO-friendly slug for an event's URL — name + city + date, with the numeric
 * id appended LAST so the lookup stays by id. The id is the source of truth:
 * editing an event's name or date changes the slug but never breaks old links
 * (they still resolve, and the canonical points at the fresh slug).
 * e.g. "sisters-of-doom-gijon-16-jun-2026-123".
 */
export function eventSlug(ev: LaEvent): string {
  const parts = [ev.name, eventCity(ev), ev.date ? formatFilterDate(ev.date) : ""]
    .map(slugify)
    .filter(Boolean);
  return `${parts.join("-")}-${ev.id}`;
}

/** Detail-page path for an event, built from its slug. */
export function eventPath(ev: LaEvent): string {
  return `/event/${eventSlug(ev)}`;
}

/**
 * The numeric id embedded at the END of an event slug. Works for enriched
 * slugs ("…-2026-123" → 123) and for a bare id ("123" → 123), so old
 * `/event/123` links keep resolving.
 */
export function eventIdFromSlug(slug: string): number | null {
  const m = slug.match(/(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) ? n : null;
}
