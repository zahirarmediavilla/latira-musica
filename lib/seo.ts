// Single source of truth for SEO config and metadata helpers.
//
// Base URL: configure it in ONE place via the NEXT_PUBLIC_SITE_URL env var
// (e.g. "https://latira.org"). Until it exists, every helper degrades
// gracefully — no absolute URLs, canonicals or sitemap entries are emitted,
// and the app keeps working with relative metadata.

import type { Metadata } from "next";
import type { LaEvent } from "./types";
import { formatMediumDate, formatShortDate } from "./format";

export const SITE_NAME = "LaTira";

export const HOME_TITLE = "Agenda de conciertos y eventos musicales en Asturias";
export const HOME_DESCRIPTION =
  "Descubre conciertos, festivales y eventos musicales en Asturias. Consulta la agenda actualizada con información sobre fechas, salas y artistas.";

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
 * Complete Open Graph block. Centralized because Next merges metadata
 * shallowly — a page that sets a partial `openGraph` would drop the shared
 * fields (siteName, locale, type), so every page builds the full object here.
 * `og:url` is included only once a base URL is configured.
 */
export function openGraphFor(opts: {
  title: string;
  description: string;
  type?: "website" | "article";
  path?: string;
}): NonNullable<Metadata["openGraph"]> {
  const url = opts.path ? absoluteUrl(opts.path) : undefined;
  return {
    type: opts.type ?? "website",
    siteName: SITE_NAME,
    locale: "es_ES",
    title: opts.title,
    description: opts.description,
    ...(url ? { url } : {}),
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
  const place = eventPlace(ev);
  const date = ev.date ? formatMediumDate(ev.date) : "";
  const when = date ? ` el ${date}` : "";
  const where = place ? ` en ${place}` : "";
  return `${ev.name} actúa${when}${where}. Consulta horarios, ubicación y toda la información del evento.`;
}
