"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "./Button";

// Find the detail scroll container. DetailActions is now a sibling of the
// scroll div (not a descendant), so we can't walk up ancestors — look by class.
function findScrollContainer(el: HTMLElement | null): HTMLElement | null {
  const root = el?.closest("[data-detail-root]") as HTMLElement | null;
  return root?.querySelector(".detail-scroll") as HTMLElement | null;
}

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
        await navigator.share({ title: data.name, text: data.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado");
      }
    } catch {
      /* user cancelled */
    }
  }

  const hasTicket = Boolean(data.ticketUrl);

  // Hide the bar when scrolling down the content, reveal it when scrolling up.
  const barRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const scroller = findScrollContainer(barRef.current);
    const target: HTMLElement | Window = scroller ?? window;
    // Read position + the max scrollable offset so we can clamp away iOS
    // rubber-band/overscroll values (negative at the top, beyond max at the bottom).
    const metrics = () =>
      scroller
        ? { top: scroller.scrollTop, max: scroller.scrollHeight - scroller.clientHeight }
        : {
            top: window.scrollY,
            max: document.documentElement.scrollHeight - window.innerHeight,
          };

    let last = metrics().top;
    let ticking = false;

    function update() {
      ticking = false;
      const { top, max } = metrics();
      const cur = Math.min(Math.max(top, 0), Math.max(max, 0)); // ignore bounce
      // Always reveal at the very bottom so the CTA stays reachable.
      if (max > 0 && cur >= max - 4) {
        setHidden(false);
        last = cur;
        return;
      }
      const delta = cur - last;
      if (Math.abs(delta) < 8) return; // ignore jitter/momentum noise
      if (delta > 0 && cur > 60) setHidden(true);
      else if (delta < 0) setHidden(false);
      last = cur;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  // Publish the bar's real rendered height (incl. iOS safe-area) so the scroll
  // container reserves exactly that much at the bottom (see .detail-scroll).
  // This replaces the brittle hardcoded padding that could under-clear the bar.
  useEffect(() => {
    const bar = barRef.current;
    const root = bar?.closest("[data-detail-root]") as HTMLElement | null;
    if (!bar || !root) return;
    const sync = () =>
      root.style.setProperty("--detail-bar-h", `${bar.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={barRef}
      className={
        "fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-muted bg-bg px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 transition-transform duration-300 ease-out " +
        (hidden ? "translate-y-full" : "translate-y-0")
      }
    >
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
