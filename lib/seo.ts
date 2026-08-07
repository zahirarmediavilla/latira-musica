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
 * Shared social preview image: the app icon that already ships
 * (`app/apple-icon.png` → `/apple-icon.png`, 180×180). Square, so it renders as
 * a compact badge beside the text — the very image messaging apps already fall
 * back to, now declared explicitly for `og:image` and `twitter:image`.
 * `undefined` until a base URL exists: a relative image with no `metadataBase`
 * is a build error, and the tag needs an absolute URL anyway.
 */
function socialImage():
  | { url: string; width: number; height: number; alt: string }
  | undefined {
  const url = absoluteUrl("/apple-icon.png");
  return url ? { url, width: 180, height: 180, alt: SITE_NAME } : undefined;
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
 * Twitter/X card block. `summary` (not `summary_large_image`) because the
 * preview is the square 180×180 app icon — a small thumbnail next to the text,
 * matching what messaging apps already show. Same shallow-merge reasoning as
 * `openGraphFor`: build the whole object every place. Image only once a base
 * URL exists (see `socialImage`).
 */
export function twitterFor(opts: {
  title: string;
  description: string;
}): NonNullable<Metadata["twitter"]> {
  const image = socialImage();
  return {
    card: "summary",
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
 * Meta description built from whatever data the event has. Never leaves holes:
 * the place clause is dropped when there is no venue/location.
 */
export function eventDescription(ev: LaEvent): string {
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
