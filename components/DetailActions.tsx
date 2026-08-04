"use client";

import { PrimaryButton } from "./Button";
import { track, AnalyticsEvent } from "@/lib/analytics";

export interface DetailActionData {
  id: string;
  name: string;
  ticketUrl: string;
}

// Action bar at the bottom of the detail. It is a NORMAL flex child below the
// scroll area (not position:fixed), so it can never overlap the content — the
// last item ("Visto en") is always fully scrollable above it on every device.
// No padding/margin math, no scroll listeners: the layout guarantees clearance.
// The safe-area padding keeps the CTA above the iPhone home indicator.
export function DetailActions({ data }: { data: DetailActionData }) {
  async function share() {
    track(AnalyticsEvent.clicCompartir, { id: data.id, name: data.name });
    // utm_source=share: cuando quien recibe el enlace abra la ficha, Umami
    // atribuye la visita al canal "compartido" (si no, sería tráfico directo).
    let url = "";
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.set("utm_source", "share");
      url = u.toString();
    }
    try {
      if (navigator.share) {
        // El enlace va DENTRO del texto a propósito: WhatsApp (y otros chats)
        // ignoran el campo `url` cuando también reciben `text`, y solo pegaban
        // el nombre. Metiéndolo en el texto, el enlace viaja siempre.
        await navigator.share({ title: data.name, text: `${data.name}\n${url}` });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado");
      }
    } catch {
      /* user cancelled */
    }
  }

  const hasTicket = Boolean(data.ticketUrl);

  return (
    <div className="shrink-0 border-t border-muted bg-bg px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div
        className={
          "mb-2 flex " + (hasTicket ? "justify-between" : "justify-center")
        }
      >
        {/* A plain <a> (not next/link) so the browser makes a real request to
            the .ics route: iOS opens the native "Add to Calendar" sheet, and
            Android/desktop download the file into their default calendar. No
            `download` attr — on iOS it would divert the file to Files instead. */}
        <a
          href={`/event/${data.id}/calendar`}
          onClick={() =>
            track(AnalyticsEvent.clicAnadirCalendario, {
              id: data.id,
              name: data.name,
            })
          }
          className="flex items-center justify-center rounded-full py-4 text-[15px] font-medium uppercase tracking-[0.06em] text-muted transition-colors hover:text-blue"
        >
          Añadir a calendario
        </a>
        {hasTicket && (
          <button
            type="button"
            onClick={share}
            className="flex items-center justify-center rounded-full py-4 text-[15px] font-medium uppercase tracking-[0.06em] text-muted transition-colors hover:text-blue"
          >
            Compartir
          </button>
        )}
      </div>

      {hasTicket ? (
        <PrimaryButton
          href={data.ticketUrl}
          external
          onClick={() =>
            track(AnalyticsEvent.clicComprarEntrada, {
              id: data.id,
              name: data.name,
            })
          }
        >
          Comprar entradas
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={share}>Compartir</PrimaryButton>
      )}
    </div>
  );
}
