"use client";

import { useMemo, useState } from "react";
import type { LaEvent } from "@/lib/types";
import {
  type Filters,
  applyFilters,
  countActive,
  emptyFilters,
  filtersActive,
  groupByDay,
} from "@/lib/filtering";
import Image from "next/image";
import { dayNumber, monthAbbr } from "@/lib/format";
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

export function HomeView({ events }: { events: LaEvent[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="no-scrollbar flex gap-2 overflow-x-auto bg-blue px-5 pb-4 pt-1.5">
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
        <EventList groups={groups} />
      )}

      {filterOpen && (
        <FiltersOverlay
          initial={filters}
          onApply={(f) => {
            setFilters(f);
            setFilterOpen(false);
          }}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-ink text-white">
          {/* Header: same height as the home header, with the logo + close icon
              placed like the home header's logo + menu icon (no search / filters). */}
          <div className="min-h-[200px] shrink-0">
            <div className="flex items-center justify-between px-5 pt-8">
              <h1 className="leading-none">
                <Image
                  src="/LaTira-logo.svg"
                  alt="LaTira"
                  width={137}
                  height={59}
                  className="h-20 w-auto"
                />
              </h1>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-2 hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="space-y-5 px-5 text-lg leading-relaxed text-white/80">
            <p>
              LaTira es la agenda de música en directo de Asturias: todos los
              conciertos en un único sitio, sin filtros de género ni zona.
            </p>
            <p>
              Reúne eventos de salas, ayuntamientos, festivales y promotoras de
              toda Asturias.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
