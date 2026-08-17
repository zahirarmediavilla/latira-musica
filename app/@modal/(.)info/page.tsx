import { AboutContent } from "@/components/AboutContent";
import { TrackView } from "@/components/TrackView";
import { AnalyticsEvent } from "@/lib/analytics";

// Intercepted info screen: when opened from the header (internal navigation),
// it renders here as an overlay that slides in over the home — the same
// mechanism as the event detail — while keeping /info in the address bar.
export default function InfoModal() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Apertura desde el header de la home (navegación interna) → origen "modal". */}
      <TrackView event={AnalyticsEvent.abrirMenu} data={{ origen: "modal" }} />
      <div className="detail-overlay mx-auto flex h-full max-w-[480px] flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.18)] animate-detail-in motion-reduce:animate-none">
        <div className="detail-scroll min-h-0 w-full flex-1 overflow-y-auto overscroll-contain bg-bg">
          <AboutContent />
        </div>
      </div>
    </div>
  );
}
