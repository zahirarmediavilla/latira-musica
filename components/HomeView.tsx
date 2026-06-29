"use client";

import { useEffect, useMemo, useState } from "react";
import type { LaEvent } from "@/lib/types";
import {
  type Filters,
  applyFilters,
  countActive,
  emptyFilters,
  filtersActive,
  groupByDay,
} from "@/lib/filtering";
import { dayNumber, monthAbbr } from "@/lib/format";
import { HEADER_H, HEADER_WITH_FILTERS } from "@/lib/layout";
import { Header } from "./Header";
import { EventList } from "./EventList";
import { RemovableTag } from "./Chip";
import { FiltersOverlay } from "./FiltersOverlay";
import { CloseIcon } from "./icons";

const CHIP_LABELS: Record<string, string> = {
  finde: "El finde",
  semana: "Esta semana",
  mes: "Este mes",
};

function dateFilterLabel(f: Filters): string | null {
  if (f.chip) return CHIP_LABELS[f.chip];
  if (f.from && f.to) {
    if (f.from === f.to) return `${dayNumber(f.from)} ${monthAbbr(f.from)}`;
    return `${dayNumber(f.from)}–${dayNumber(f.to)} ${monthAbbr(f.to)}`;
  }
  if (f.from) return `${dayNumber(f.from)} ${monthAbbr(f.from)}`;
  return null;
}

// Filters persist while navigating to a detail and back (within the session).
// Held at module scope so a remount of HomeView restores them synchronously
// — only mutated client-side, so it never affects SSR/hydration.
let persistedFilters: Filters = emptyFilters;

export function HomeView({ events }: { events: LaEvent[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(persistedFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    persistedFilters = filters;
  }, [filters]);

  const searching = query.trim().length > 0;
  const filtered = useMemo(
    () => applyFilters(events, filters, query),
    [events, filters, query],
  );
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const dateLabel = dateFilterLabel(filters);

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        onClearSearch={() => setQuery("")}
        onFilter={() => setFilterOpen(true)}
        onMenu={() => setMenuOpen(true)}
        resultCount={searching ? filtered.length : null}
        filterCount={countActive(filters)}
      />

      {filtersActive(filters) && (
        <div
          className="no-scrollbar sticky z-20 flex gap-2 overflow-x-auto bg-blue px-5 pb-4 pt-1.5"
          style={{ top: HEADER_H }}
        >
          {dateLabel && (
            <RemovableTag
              label={dateLabel}
              onRemove={() =>
                setFilters((f) => ({ ...f, chip: null, from: null, to: null }))
              }
            />
          )}
          {filters.zones.map((z) => (
            <RemovableTag
              key={z}
              label={z}
              onRemove={() =>
                setFilters((f) => ({ ...f, zones: f.zones.filter((x) => x !== z) }))
              }
            />
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="px-8 pt-20 text-center">
          <p className="text-lg text-muted">
            {searching
              ? `No encontramos nada por “${query.trim()}”`
              : "No hay eventos con estos filtros"}
          </p>
          {filtersActive(filters) && !searching && (
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="mt-4 text-sm font-semibold text-blue"
            >
              Quitar filtros
            </button>
          )}
        </div>
      ) : (
        <EventList
          groups={groups}
          dateTop={filtersActive(filters) ? HEADER_WITH_FILTERS : HEADER_H}
        />
      )}

      {filterOpen && (
        <FiltersOverlay
          initial={filters}
          onApply={(f) => {
            setFilters(f);
            setFilterOpen(false);
            // Show the freshly filtered list from the top, not at the old scroll.
            window.scrollTo(0, 0);
          }}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-bg text-ink">
          <div className="flex justify-end px-5 pt-5">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar"
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="space-y-6 px-5 pt-8 text-lg leading-relaxed text-ink">
            <p>
              LaTira quiere ser un lugar donde se puedan ver todos los eventos
              musicales de Asturias, de cualquier género musical.
            </p>
            <p>
              Si quieres saber más sobre el proyecto, comentarnos cualquier cosa,
              o incluir eventos en la lista, puedes escribir a{" "}
              <a href="mailto:hola@latira.org" className="font-medium underline">
                hola@latira.org
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
