"use client";

import { useEffect, useRef } from "react";
import { AnalyticsEvent, track } from "@/lib/analytics";

// Envoltura cliente para medir la INTENCIÓN de reproducir un sample embebido
// (YouTube / Spotify / SoundCloud / Bandcamp). El "play" real ocurre DENTRO del
// iframe, en otro dominio, así que es inaccesible desde aquí. Lo que sí se puede
// detectar —y funciona igual en táctil que con ratón, sin añadir ninguna capa
// por encima ni un segundo tap— es que el foco se ha ido al iframe: al tocarlo,
// la ventana pierde el foco (`blur`) y `document.activeElement` pasa a ser ese
// <iframe>. Es un listener PASIVO: no toca el tap, el reproductor arranca con el
// primer toque como siempre. Se dispara una sola vez por ficha.
//
// Mismo nombre de evento (`clicVerVideoAudio`) que la tarjeta de enlace externo
// de SampleMedia, para no fragmentar la métrica entre embebido y enlace.
export function SampleFrameTracker({
  eventId,
  className,
  style,
  children,
}: {
  eventId: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let fired = false;
    function onBlur() {
      if (fired) return;
      const el = document.activeElement;
      // Solo cuenta si el foco fue a NUESTRO iframe (no al cambiar de pestaña/app,
      // donde `activeElement` sería el <body> u otro elemento).
      if (el && el.tagName === "IFRAME" && ref.current?.contains(el)) {
        fired = true;
        track(AnalyticsEvent.clicVerVideoAudio, { id: eventId });
        window.removeEventListener("blur", onBlur);
      }
    }
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [eventId]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
