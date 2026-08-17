import type { Metadata } from "next";
import { AboutContent } from "@/components/AboutContent";
import { TrackView } from "@/components/TrackView";
import { AnalyticsEvent } from "@/lib/analytics";
import { HOME_DESCRIPTION, SITE_NAME, canonicalFor, openGraphFor } from "@/lib/seo";

// Static content: no data, so it can be fully prerendered and CDN-cached.
const INFO_TITLE = "Información";

export const metadata: Metadata = {
  title: INFO_TITLE,
  description: HOME_DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: canonicalFor("/info"),
  openGraph: openGraphFor({
    title: `${INFO_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    path: "/info",
  }),
};

// Direct visits (deep link, refresh, shared /info URL) land on the full page
// instead of the intercepting overlay. Same viewport-locked flex column as the
// event detail page, so the layout and the close control behave identically.
export default function InfoPage() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Carga directa (enlace compartido, SEO) → origen "directo". */}
      <TrackView event={AnalyticsEvent.abrirMenu} data={{ origen: "directo" }} />
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
        <div className="detail-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-bg">
          <AboutContent />
        </div>
      </div>
    </div>
  );
}
