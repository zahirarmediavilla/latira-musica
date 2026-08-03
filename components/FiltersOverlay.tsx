"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ZONES, zoneChipLabel, type Zone, type LaEvent } from "@/lib/types";
import {
  type Filters,
  type DateChip,
  rangeForChip,
  applyFilters,
} from "@/lib/filtering";
import { GENRE_CHIPS } from "@/lib/genres";
import { formatFilterDate, formatShortDate } from "@/lib/format";
import { Chip } from "./Chip";
import { Calendar } from "./Calendar";
import { CloseIcon, ArrowRightIcon } from "./icons";

const DATE_CHIPS: { id: DateChip; label: string }[] = [
  { id: "finde", label: "El finde" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
];

const LABEL = "text-xs font-semibold uppercase tracking-[0.12em] text-muted";

interface Props {
  initial: Filters;
  events: LaEvent[];
  onApply: (f: Filters) => void;
  onClose: () => void;
}

// Bottom-sheet modal: slides up on open, slides down on close. The sheet stays
// mounted through the close animation and only calls back (onClose / onApply)
// once the slide-down finishes.
export function FiltersOverlay({ initial, events, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<Filters>(initial);
  const [calOpen, setCalOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  // Enter: mount below the viewport, then slide up on the next frame.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Slide down, then run the callback that unmounts us.
  function close(after: () => void) {
    setDragY(0);
    setShown(false);
    window.setTimeout(after, 300);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(onClose);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(
    () => applyFilters(events, draft, "").length,
    [events, draft],
  );

  function selectChip(id: DateChip) {
    if (draft.chip === id) {
      setDraft({ ...draft, chip: null, from: null, to: null });
    } else {
      const { from, to } = rangeForChip(id);
      setDraft({ ...draft, chip: id, from, to });
    }
  }

  function selectRange(from: string, to: string | null) {
    setDraft({ ...draft, chip: null, from, to });
  }

  function toggleZone(z: Zone) {
    setDraft((d) => ({
      ...d,
      zones: d.zones.includes(z) ? d.zones.filter((x) => x !== z) : [...d.zones, z],
    }));
  }

  function toggleGenre(g: string) {
    setDraft((d) => ({
      ...d,
      genres: d.genres.includes(g) ? d.genres.filter((x) => x !== g) : [...d.genres, g],
    }));
  }

  function clearAll() {
    setCalOpen(false);
    setDraft({ zones: [], genres: [], from: null, to: null, chip: null });
  }

  // Drag the handle down to dismiss.
  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = e.clientY;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 110) close(onClose);
    else setDragY(0);
  }

  const dateValue = !draft.from
    ? "Elegir fechas"
    : draft.to && draft.to !== draft.from
      ? `${formatShortDate(draft.from)} - ${formatShortDate(draft.to)}`
      : formatFilterDate(draft.from);

  const applyCls =
    "flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-[15px] font-medium uppercase tracking-[0.06em] transition-colors " +
    (results === 0
      ? "cursor-not-allowed bg-line text-[#8a8a8a]"
      : "bg-blue text-white hover:bg-[#0061b8]");

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/35 transition-opacity duration-300"
        style={{ opacity: shown ? 1 : 0, pointerEvents: shown ? "auto" : "none" }}
        aria-hidden
        onClick={() => close(onClose)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar por"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94vh] max-w-[480px] flex-col overflow-hidden rounded-t-[20px] bg-bg shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
        style={{
          transform: shown ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging
            ? "none"
            : shown
              ? "transform 0.42s cubic-bezier(0.22,1,0.36,1)"
              : "transform 0.3s cubic-bezier(0.4,0,1,1)",
        }}
      >
        {/* Grab handle — drag down to dismiss. */}
        <div
          className="flex shrink-0 cursor-grab touch-none justify-center pb-0.5 pt-2.5"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-hidden
        >
          <span className="h-1.5 w-10 rounded-full bg-[#c2c2c2]" />
        </div>

        <header
          className={
            "flex shrink-0 items-center justify-between border-b px-5 pb-3.5 transition-colors " +
            (scrolled ? "border-[#b8b8b8]/70" : "border-transparent")
          }
        >
          <h2 className="font-display text-3xl font-bold text-ink">Filtrar por</h2>
          <button
            type="button"
            onClick={() => close(onClose)}
            aria-label="Cerrar"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
          >
            <CloseIcon />
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto px-5 pb-6 pt-5"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        >
          {/* Date */}
          <p className={LABEL}>Fecha</p>
          <button
            type="button"
            onClick={() => setCalOpen((o) => !o)}
            className={
              "mt-2 w-full border-b border-line/80 pb-2 text-left text-lg font-medium " +
              (draft.from ? "text-ink" : "text-muted")
            }
          >
            {dateValue}
          </button>
          {calOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setCalOpen(false)}
              />
              <div className="relative z-20 mt-3">
                <Calendar
                  from={draft.from}
                  to={draft.to}
                  onSelect={selectRange}
                  onConfirm={() => setCalOpen(false)}
                />
              </div>
            </>
          )}
          <div className="mt-4 flex gap-2.5">
            {DATE_CHIPS.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                selected={draft.chip === c.id}
                onClick={() => selectChip(c.id)}
              />
            ))}
          </div>

          {/* Zones */}
          <p className={"mt-14 " + LABEL}>Zonas</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {ZONES.map((z) => (
              <Chip
                key={z}
                label={zoneChipLabel(z)}
                selected={draft.zones.includes(z)}
                onClick={() => toggleZone(z)}
              />
            ))}
          </div>

          {/* Genres */}
          <p className={"mt-14 " + LABEL}>Géneros</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {GENRE_CHIPS.map((g) => (
              <Chip
                key={g}
                label={g}
                selected={draft.genres.includes(g)}
                onClick={() => toggleGenre(g)}
              />
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            «En familia» son los eventos que empiezan antes de las 20:00, más todos
            los de género «Infantil» aunque empiecen más tarde.
          </p>
        </div>

        <footer className="flex shrink-0 items-center gap-2 border-t border-[#b8b8b8] px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={clearAll}
            className="flex shrink-0 items-center justify-center rounded-full px-3 py-4 text-[15px] font-medium uppercase tracking-[0.06em] text-muted transition-colors hover:text-blue"
          >
            Limpiar
          </button>
          <button
            type="button"
            disabled={results === 0}
            onClick={() => close(() => onApply(draft))}
            className={applyCls}
          >
            {results === 0
              ? "Sin eventos"
              : `Ver ${results} ${results === 1 ? "evento" : "eventos"}`}
            {results > 0 && <ArrowRightIcon className="h-5 w-5" />}
          </button>
        </footer>
      </section>
    </>
  );
}
