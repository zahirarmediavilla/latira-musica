import { HEADER_H } from "@/lib/layout";

// Loading placeholder for the home list, shown as the <Suspense> fallback in
// app/page.tsx while getEvents() resolves on a cold render. Mirrors the
// EventList layout — a date gutter plus a few rows — so the wait feels like the
// real list. Lives as a scoped Suspense fallback (not a route-level
// loading.tsx): a global loading boundary makes every route stream, which turns
// notFound()/permanentRedirect() in the event route into a 200 soft-404 / a
// client-side redirect instead of real 404/308 status codes.
export function HomeSkeleton() {
  return (
    <div
      className="min-h-0 flex-1 animate-pulse overflow-y-auto"
      style={{ paddingTop: HEADER_H }}
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, g) => (
        <div
          key={g}
          className="flex"
          style={{ borderBottom: "1.5px solid #b8b8b8" }}
        >
          <div className="w-[72px] shrink-0">
            <div className="flex gap-4">
              <div className="w-2 self-stretch bg-yellow" />
              <div className="flex flex-col gap-1 py-5">
                <div className="h-6 w-7 rounded bg-canvas" />
                <div className="h-3 w-6 rounded bg-canvas" />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3 py-5 pl-5 pr-5">
            <div className="h-5 w-3/4 rounded bg-canvas" />
            <div className="h-4 w-1/2 rounded bg-canvas" />
            <div className="h-4 w-2/5 rounded bg-canvas" />
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando eventos…</span>
    </div>
  );
}
