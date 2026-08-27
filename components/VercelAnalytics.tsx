"use client";

import { Analytics } from "@vercel/analytics/next";

// Envoltura cliente de Vercel Web Analytics para poder pasarle `beforeSend`
// (una función, así que no se puede pasar desde el layout, que es Server
// Component). `beforeSend` corre en el navegador antes de enviar cada evento;
// si devuelve `null`, el evento NO se manda.
//
// Reutilizamos la MISMA marca que Umami (`umami.disabled` en localStorage, la
// que activas con `?notrack` y quitas con `?track` — ver el script
// `umami-optout` en app/layout.tsx). Así un único interruptor, por navegador,
// silencia tu propio tráfico en Umami Y en Vercel a la vez. Sin la marca,
// Vercel mide con normalidad.
export default function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          if (localStorage.getItem("umami.disabled") === "1") return null;
        } catch {
          // localStorage no disponible (modo privado, etc.): medir normal.
        }
        return event;
      }}
    />
  );
}
