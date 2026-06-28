// Builders for Schema.org JSON-LD objects. Pure functions: they only return
// the data that actually exists — no empty properties, no invented values, no
// images. Rendered by components/JsonLd.tsx.

import type { LaEvent } from "./types";
import { SITE_NAME, absoluteUrl, eventPlace } from "./seo";

// Minimal JSON-LD shape: an object with @context/@type plus arbitrary fields.
type JsonLdObject = Record<string, unknown>;

/** Combine a YYYY-MM-DD date with an optional "HH:MM" into an ISO-like value
 *  ("2026-06-16T20:00" or just "2026-06-16"). Used for startDate. */
function startDate(date: string, hour: string): string {
  return hour ? `${date}T${hour}` : date;
}

/** Parse the numeric amount from a free-text price like "12 €" / "desde 12,50 €".
 *  Returns a dot-decimal string ("12.50"), or null when there's no number. */
function parsePrice(price: string): string | null {
  const m = price.replace(/\./g, "").match(/(\d+(?:,\d+)?)/);
  return m ? m[1].replace(",", ".") : null;
}

/** Official/reference links for the event (event page + sample media). Used as
 *  `sameAs`, the Schema.org property for canonical references to an entity. */
function referenceLinks(ev: LaEvent): string[] {
  const links = [ev.eventUrl, ...ev.sampleUrl.split(/\s+/)].filter(Boolean);
  return Array.from(new Set(links));
}

function buildOffers(ev: LaEvent): JsonLdObject | undefined {
  if (ev.free) {
    return {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      ...(ev.ticketUrl ? { url: ev.ticketUrl } : {}),
    };
  }
  const amount = parsePrice(ev.price);
  if (!amount && !ev.ticketUrl) return undefined;
  return {
    "@type": "Offer",
    ...(amount ? { price: amount, priceCurrency: "EUR" } : {}),
    ...(ev.ticketUrl ? { url: ev.ticketUrl } : {}),
  };
}

function buildLocation(ev: LaEvent): JsonLdObject | undefined {
  const name = eventPlace(ev);
  const hasAddress = ev.venue?.address || ev.venue?.localidad;
  if (!name && !hasAddress) return undefined;

  const address: JsonLdObject = {
    "@type": "PostalAddress",
    addressRegion: "Asturias",
    addressCountry: "ES",
    ...(ev.venue?.address ? { streetAddress: ev.venue.address } : {}),
    ...(ev.venue?.localidad ? { addressLocality: ev.venue.localidad } : {}),
  };

  return {
    "@type": ev.venue ? "MusicVenue" : "Place",
    ...(name ? { name } : {}),
    address,
  };
}

function buildPerformers(ev: LaEvent): JsonLdObject[] {
  // `artists` is comma/newline separated free text; fall back to the event
  // name, which is the act when no separate line-up is stored.
  const raw = ev.artists || ev.name;
  return raw
    .split(/\s*[,\n]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ "@type": "MusicGroup", name }));
}

/** Schema.org MusicEvent for an event detail page. */
export function buildEventJsonLd(ev: LaEvent): JsonLdObject {
  const url = absoluteUrl(`/event/${ev.id}`);
  const offers = buildOffers(ev);
  const location = buildLocation(ev);
  const sameAs = referenceLinks(ev);
  const organizer = buildOrganizationJsonLd({ asReference: true });

  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: ev.name,
    startDate: startDate(ev.date, ev.hour),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    performer: buildPerformers(ev),
    organizer,
    ...(ev.description ? { description: ev.description } : {}),
    ...(location ? { location } : {}),
    ...(offers ? { offers } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(url ? { url } : {}),
  };
}

/** Schema.org Organization for LaTira. Returns the bare object, including only
 *  the fields that exist (url/logo depend on a configured base URL). */
export function buildOrganizationJsonLd(opts?: {
  asReference?: boolean;
}): JsonLdObject {
  const url = absoluteUrl("/");
  const logo = absoluteUrl("/LaTira-logo.svg");
  return {
    ...(opts?.asReference ? {} : { "@context": "https://schema.org" }),
    "@type": "Organization",
    name: SITE_NAME,
    ...(url ? { url } : {}),
    ...(logo ? { logo } : {}),
    // sameAs (social profiles) intentionally omitted until they exist.
  };
}
