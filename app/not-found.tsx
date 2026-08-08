import Link from "next/link";
import { PrimaryButton } from "@/components/Button";
import { TrackView } from "@/components/TrackView";
import { Logo } from "@/components/Logo";
import { AnalyticsEvent } from "@/lib/analytics";

// Shown when notFound() is called (e.g. an event id that doesn't exist) or for
// any unmatched route. Branded replacement for Next's default 404 screen: the
// brand header on top (logo links back to the agenda — so the page keeps its
// identity and a way out), then the message and a primary action. Just the logo,
// no search/filter (those act on the event list this page doesn't have).
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Brand header: the black bar with the LaTira mark + the 10px blue line,
          mirroring the home header's resting state. */}
      <header className="bg-ink text-white">
        <div className="relative h-[118px]">
          <Link
            href="/"
            aria-label="LaTira, volver a la agenda"
            className="absolute left-5 top-0 inline-block"
          >
            <Logo className="h-[87.23px] w-auto" title="LaTira" />
          </Link>
        </div>
        <div className="h-[10px] bg-blue" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <TrackView event={AnalyticsEvent.paginaNoEncontrada} />
        <h2 className="font-display text-[28px] font-bold leading-[1.05] text-ink">
          No encontramos esto
        </h2>
        <p className="mt-3 text-lg text-muted">
          El evento que buscas no existe o ya ha pasado.
        </p>
        <div className="mt-8 w-full max-w-[260px]">
          <PrimaryButton href="/">Volver al listado</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
