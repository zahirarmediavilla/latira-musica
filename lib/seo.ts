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
 * Meta description for an event. A real description the event carries — from
 * the source or hand-edited — wins, because it may hold a unique nugget (a
 * tribute act, a tour name, "de Navidad") the template can't know. The only
 * exception is a SHORT description whose every word is already in the event's
 * own fields: there the composed line strictly improves it without losing
 * anything. Truly empty fields always get the composed line.
 */
export function eventDescription(ev: LaEvent): string {
  const own = ev.description?.replace(/\s+/g, " ").trim() ?? "";
  // A standalone description (≥40 chars) always wins — never overwrite it.
  if (own.length >= 40) return truncateForMeta(own);
  // A short source description is replaced ONLY when it carries nothing the
  // composed line doesn't already say — so no unique detail is ever lost.
  if (own && !compositeCoversDescription(own, ev)) return truncateForMeta(own);
  // Empty, or short-and-fully-covered: build the line from structured fields.
  return truncateForMeta(composeEventSnippet(ev));
}

/** Split into lowercase, accent-free word tokens (for content comparison). */
function contentTokens(s: string): string[] {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Generic words that add no information beyond what the composed line already
// conveys: filler nouns ("concierto", "directo"…) plus articles/prepositions.
// A short description made ONLY of these — plus tokens already in the event's
// own fields — is safe to replace; anything else may carry a real detail.
const FILLER_TOKENS = new Set([
  "concierto", "conciertos", "directo", "actuacion", "espectaculo", "musica",
  "vivo", "evento", "gira",
  "de", "del", "la", "el", "los", "las", "lo", "un", "una", "unos", "unas",
  "y", "e", "o", "u", "en", "a", "al", "con", "por", "para", "sin", "the",
]);

/**
 * True when every content-bearing word of `desc` already appears in the event's
 * structured fields (name, line-up, genre, venue, town, date) or is generic
 * filler — i.e. replacing `desc` with the composed line loses no information.
 * When any word is novel, this returns false and the source description is kept.
 */
function compositeCoversDescription(desc: string, ev: LaEvent): boolean {
  const known = new Set(
    contentTokens(
      [
        ev.name,
        ev.artists,
        ev.genres.join(" "),
        ev.venue?.name ?? "",
        eventCity(ev),
        ev.date ? formatMediumDate(ev.date) : "",
      ].join(" "),
    ),
  );
  const meaningful = contentTokens(desc).filter(
    (t) => t.length > 1 && !FILLER_TOKENS.has(t),
  );
  return meaningful.every((t) => known.has(t));
}

/** Uppercase just the first letter, leaving the rest untouched (so canonical
 *  casing like "DJ Set" or a lowercase "desde 12 €" both come out right). */
function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Meta description built only from stored fields — no invented prose. Weaves in
 * genre, act/line-up, venue, town, date and price so every snippet is distinct
 * across the site (Google discounts near-duplicate meta descriptions). Facts
 * are separated with " · ", the same divider the UI uses for places, so the
 * result scans cleanly in a search result or a social preview instead of
 * reading like a keyword dump. Every clause is dropped when its data is
 * missing, so the sentence stays grammatical with or without genre/venue/price.
 */
function composeEventSnippet(ev: LaEvent): string {
  const city = eventCity(ev);
  const venue = ev.venue?.name || "";
  const date = ev.date ? formatMediumDate(ev.date) : "";

  // Keyword-first lead: "Rock en Gijón" / "Concierto en Gijón" / "Concierto".
  const kind = capitalizeFirst(ev.genres[0] || "Concierto");
  const lead = city ? `${kind} en ${city}` : kind;

  // The act, plus the line-up when it's a distinct list (festivals, bills).
  const artists = ev.artists?.trim() ?? "";
  const act = artists ? `${ev.name} con ${artists}` : ev.name;

  // Venue and date as clean, scannable segments (town is already in the lead).
  const where = venue ? ` · ${venue}` : "";
  const when = date ? ` · ${date}` : "";

  // Price hook only when we actually know it; matches the ficha's wording.
  const price = ev.free
    ? " Entrada gratis."
    : ev.price?.trim()
      ? ` ${capitalizeFirst(ev.price.trim())}.`
      : "";

  return `${lead}: ${act}${where}${when}.${price}`;
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
