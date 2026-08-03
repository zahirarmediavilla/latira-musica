"use client";

import { useEffect } from "react";
import { track, type AnalyticsEventName } from "@/lib/analytics";

// Dispara un evento "al ver" una vez, cuando el componente se monta. Se usa
// desde server components (ficha, modal, 404) que no pueden llamar a track()
// por sí mismos. Umami asocia el evento a la URL actual automáticamente.
export function TrackView({
  event,
  data,
}: {
  event: AnalyticsEventName;
  data?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, data);
    // Solo al montar: un evento por apertura de la vista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
