import { AnalyticsEvent } from "@/lib/analytics";
import { resolveSampleMedia } from "@/lib/sample-media";
import { ExternalIcon } from "./icons";

// Una URL de `sample_url`, resuelta al mejor formato de vista previa. Componente
// de servidor asíncrono (leer los metadatos de la fuente requiere fetch): se
// puede renderizar como hijo dentro de la ficha sin volverla asíncrona.
export async function SampleMedia({ url, eventId }: { url: string; eventId: string }) {
  const media = await resolveSampleMedia(url);

  if (media.kind === "youtube") {
    return (
      <div className="mt-6 aspect-video overflow-hidden bg-black">
        <iframe
          src={media.src}
          title="Vídeo"
          loading="lazy"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (media.kind === "embed") {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl bg-ink/[0.05]" style={{ height: media.height }}>
        <iframe
          src={media.src}
          title={media.title}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen"
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <a
      href={media.href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 flex items-center gap-3 rounded-2xl bg-ink/[0.05] px-4 py-3.5 transition-colors hover:bg-ink/[0.09]"
      data-umami-event={AnalyticsEvent.clicVerVideoAudio}
      data-umami-event-id={eventId}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
        <ExternalIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-bold text-ink">{media.label}</span>
        {media.sublabel && (
          <span className="mt-0.5 block truncate text-sm text-muted">{media.sublabel}</span>
        )}
      </span>
    </a>
  );
}
