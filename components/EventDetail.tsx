import { formatMediumDate } from "@/lib/format";
import type { LaEvent } from "@/lib/types";
import { AnalyticsEvent } from "@/lib/analytics";
import { BackHeader } from "./BackHeader";
import { SampleMedia } from "./SampleMedia";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Shared detail content, rendered both as a full page (direct visits) and inside
// the intercepting-route overlay that slides in over the home list.
export function EventDetail({ event: ev }: { event: LaEvent }) {
  // sample_url puede traer varias URLs (una por artista) separadas por
  // espacios o saltos de línea. Cada una se muestra como embed propio.
  const samples = ev.sampleUrl.split(/\s+/).filter(Boolean);
  const sourceHost = hostOf(ev.eventUrl);
  // Misma preferencia que el listado: localidad del recinto sobre location cruda.
  const locationLabel = ev.venue?.localidad || ev.location;

  return (
    <>
      <BackHeader />

      {/* Regla única para TODAS las páginas de detalle: un colchón inferior
          generoso para que el último contenido ("Visto en", vídeo…) nunca quede
          pegado al borde ni a la barra de acciones, en cualquier dispositivo. */}
      <article className="px-5 pt-2 pb-24">
        {ev.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ev.genres.map((g) => (
              <span
                key={g}
                className="rounded-full bg-ink/[0.07] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink/55"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <h1 className="mt-3 break-words font-display text-[44px] font-bold leading-[1.02] text-ink">
          {ev.name}
        </h1>

        {ev.artists && (
          <p className="mt-3 text-[20px] font-bold leading-snug text-ink">{ev.artists}</p>
        )}

        <p className="mt-4 text-[18px] font-bold capitalize text-muted">
          {formatMediumDate(ev.date)}
          {ev.hour && <span> · {ev.hour}</span>}
        </p>

        {(ev.venue?.name || ev.location) && (
          <p className="mt-1 text-[18px]">
            {ev.venue?.name ? (
              <>
                {locationLabel && (
                  <>
                    <span className="font-bold text-muted">{locationLabel}</span>
                    <span className="text-muted"> · </span>
                  </>
                )}
                {ev.venue.mapsUrl ? (
                  <a
                    href={ev.venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline"
                    data-umami-event={AnalyticsEvent.clicUbicacionMapa}
                    data-umami-event-id={ev.id}
                    data-umami-event-venue={ev.venue.name}
                  >
                    {ev.venue.name}
                  </a>
                ) : (
                  <span className="text-muted">{ev.venue.name}</span>
                )}
              </>
            ) : (
              <span className="font-bold text-muted">{ev.location}</span>
            )}
          </p>
        )}
        {(ev.free || ev.price) && (
          <p className="mt-1 text-[18px] font-bold text-muted">
            {ev.free ? "Gratis" : ev.price}
          </p>
        )}

        {/* Everything below the divider is optional. Only draw the rule when
            there's actually something under it (description, apertura de puertas
            or media) — a poor event ends cleanly at price, with no orphan line. */}
        {(ev.description || ev.doorsTime || samples.length > 0) && (
          <hr className="my-6 border-[#b8b8b8]" />
        )}

        {(ev.description || ev.doorsTime) && (
          <div className="py-6 text-[16px] leading-relaxed text-muted">
            {ev.description && (
              <p className="whitespace-pre-line break-words">{ev.description}</p>
            )}
            {/* Apertura de puertas: last line of the text, plain and readable —
                the datum lives in `notes`, invisible until now. */}
            {ev.doorsTime && (
              <p className={ev.description ? "mt-4" : ""}>
                Apertura de puertas: {ev.doorsTime}.
              </p>
            )}
          </div>
        )}

        {samples.map((url) => (
          <SampleMedia key={url} url={url} eventId={ev.id} />
        ))}

        {ev.eventUrl && sourceHost && (
          // `data-nosnippet` keeps this source attribution visible to readers
          // but out of Google's result snippet: otherwise Google appends
          // "Visto en <fuente>" to the snippet, spending characters and pointing
          // the searcher at the original source (which often outranks us).
          <div data-nosnippet>
            <hr className="my-6 border-[#b8b8b8]" />
            <a
              href={ev.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block pb-8 text-[15px] text-muted"
              data-umami-event={AnalyticsEvent.clicVistoEn}
              data-umami-event-id={ev.id}
              data-umami-event-host={sourceHost}
            >
              Visto en <span className="underline">{sourceHost}</span>
            </a>
          </div>
        )}
      </article>

    </>
  );
}
