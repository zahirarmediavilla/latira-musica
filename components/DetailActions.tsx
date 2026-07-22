"use client";

import { PrimaryButton } from "./Button";

export interface DetailActionData {
  name: string;
  date: string; // YYYY-MM-DD
  hour: string; // "HH:MM" or ""
  place: string;
  description: string;
  ticketUrl: string;
}

function buildIcs(ev: DetailActionData): string {
  const d = ev.date.replace(/-/g, "");
  const dtStart = ev.hour ? `${d}T${ev.hour.replace(":", "")}00` : d;
  const startLine = ev.hour
    ? `DTSTART:${dtStart}`
    : `DTSTART;VALUE=DATE:${dtStart}`;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LaTira//ES",
    "BEGIN:VEVENT",
    `UID:${dtStart}-${Math.random().toString(36).slice(2)}@latira`,
    startLine,
    `SUMMARY:${esc(ev.name)}`,
    ev.place ? `LOCATION:${esc(ev.place)}` : "",
    ev.description ? `DESCRIPTION:${esc(ev.description.slice(0, 300))}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// Action bar at the bottom of the detail. It is a NORMAL flex child below the
// scroll area (not position:fixed), so it can never overlap the content — the
// last item ("Visto en") is always fully scrollable above it on every device.
// No padding/margin math, no scroll listeners: the layout guarantees clearance.
// The safe-area padding keeps the CTA above the iPhone home indicator.
export function DetailActions({ data }: { data: DetailActionData }) {
  function addToCalendar() {
    const blob = new Blob([buildIcs(data)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name.slice(0, 40)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
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
    <div className="shrink-0 border-t border-muted bg-bg px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div
        className={
          "mb-2 flex " + (hasTicket ? "justify-between" : "justify-center")
        }
      >
        <button
          type="button"
          onClick={addToCalendar}
          className="flex items-center justify-center rounded-full py-4 text-[15px] font-medium uppercase tracking-[0.06em] text-muted transition-colors hover:text-blue"
        >
          Añadir a calendario
        </button>
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
        <PrimaryButton href={data.ticketUrl} external>
          Comprar entradas
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={share}>Compartir</PrimaryButton>
      )}
    </div>
  );
}
