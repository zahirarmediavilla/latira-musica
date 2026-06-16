import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/events";
import { formatMediumDate } from "@/lib/format";
import { BackHeader } from "@/components/BackHeader";
import { DetailActions } from "@/components/DetailActions";
import { ExternalIcon } from "@/components/icons";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEventById(id);
  return { title: ev ? `${ev.name} — LaTira` : "LaTira" };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) notFound();

  const embed = ev.sampleUrl ? youtubeEmbed(ev.sampleUrl) : null;
  const sourceHost = hostOf(ev.eventUrl);
  const place = [ev.venue?.name, ev.location].filter(Boolean).join(", ");

  return (
    <div className="min-h-dvh pb-44">
      <BackHeader />

      <article className="px-5">
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

        <h1 className="mt-3 font-display text-[50px] font-bold leading-[1.02] text-ink">
          {ev.name}
        </h1>

        {ev.artists && (
          <p className="mt-3 font-bold leading-snug text-ink">{ev.artists}</p>
        )}

        <p className="mt-4 text-[15px] font-bold capitalize text-muted">
          {formatMediumDate(ev.date)}
          {ev.hour && <span> · {ev.hour}</span>}
        </p>

        {(ev.venue?.name || ev.location) && (
          <p className="mt-3 text-[15px]">
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
            {ev.venue?.address && (
              <span className="text-muted">{"  "}{ev.venue.address}</span>
            )}
          </p>
        )}

        <hr className="my-6 border-[#b8b8b8]" />

        <p className="text-[18px] font-bold text-muted">
          {ev.free ? "Gratis" : ev.price || "Consultar precio"}
        </p>

        {ev.description && (
          <p className="whitespace-pre-line py-6 text-[16px] leading-relaxed text-muted">
            {ev.description}
          </p>
        )}

        {embed && (
          <div className="mt-6 aspect-video overflow-hidden bg-black">
            <iframe src={embed} title="Vídeo" allowFullScreen className="h-full w-full" />
          </div>
        )}
        {!embed && ev.sampleUrl && (
          <a
            href={ev.sampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-blue"
          >
            Ver vídeo / audio <ExternalIcon className="h-4 w-4" />
          </a>
        )}

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
    </div>
  );
}
