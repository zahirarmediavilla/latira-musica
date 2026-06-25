import { formatMediumDate } from "@/lib/format";
import type { LaEvent } from "@/lib/types";
import { BackHeader } from "./BackHeader";
import { DetailActions } from "./DetailActions";
import { ExternalIcon } from "./icons";

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

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
  const place = [ev.venue?.name, ev.location].filter(Boolean).join(", ");

  return (
    <>
      <BackHeader />

      <article className="px-5 pt-2">
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

        <p className="mt-4 mb-3 text-[18px] font-bold capitalize text-muted">
          {formatMediumDate(ev.date)}
          {ev.hour && <span> · {ev.hour}</span>}
        </p>

        {(ev.venue?.name || ev.location) && (
          <p className="mt-1 text-[18px]">
            {ev.venue?.mapsUrl ? (
              <a
                href={ev.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-muted underline"
              >
                {ev.venue?.name || ev.location}
              </a>
            ) : (
              <span className="font-bold text-muted">
                {ev.venue?.name || ev.location}
              </span>
            )}
          </p>
        )}
        {ev.venue?.address && (
          <p className="mt-0.5 text-[16px] text-muted">{ev.venue.address}</p>
        )}

        <hr className="my-6 border-[#b8b8b8]" />

        {(ev.free || ev.price) && (
          <p className="text-[18px] font-bold text-muted">
            {ev.free ? "Gratis" : ev.price}
          </p>
        )}

        {ev.description && (
          <p className="whitespace-pre-line break-words py-6 text-[16px] leading-relaxed text-muted">
            {ev.description}
          </p>
        )}

        {samples.map((url) => {
          const embed = youtubeEmbed(url);
          return embed ? (
            <div key={url} className="mt-6 aspect-video overflow-hidden bg-black">
              <iframe src={embed} title="Vídeo" allowFullScreen className="h-full w-full" />
            </div>
          ) : (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-blue"
            >
              Ver vídeo / audio <ExternalIcon className="h-4 w-4" />
            </a>
          );
        })}

        {ev.eventUrl && sourceHost && (
          <>
            <hr className="my-6 border-[#b8b8b8]" />
            <a
              href={ev.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block pb-8 text-[15px] text-muted"
            >
              Visto en <span className="underline">{sourceHost}</span>
            </a>
          </>
        )}
      </article>

      <DetailActions
        data={{
          name: ev.name,
          date: ev.date,
          hour: ev.hour,
          place,
          description: ev.description,
          ticketUrl: ev.ticketUrl,
        }}
      />
    </>
  );
}
