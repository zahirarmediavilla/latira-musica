"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zoneChipLabel, type LaEvent } from "@/lib/types";
import {
  type Filters,
  applyFilters,
  countActive,
  emptyFilters,
  filtersActive,
  groupByDay,
} from "@/lib/filtering";
import { track, AnalyticsEvent } from "@/lib/analytics";
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

// Foto de los filtros aplicados para el evento `aplicar-filtros` / `filtros-sin-resultados`.
function filtersData(f: Filters) {
  return {
    fecha:
      f.chip ??
      (f.from ? (f.to && f.to !== f.from ? "rango" : "dia") : "cualquiera"),
    zonas: f.zones.join(", ") || "ninguna",
    generos: f.genres.join(", ") || "ninguno",
    n_filtros: countActive(f),
  };
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
  // El buscador va oculto por defecto; se despliega desde la lupa.
  const [searchOpen, setSearchOpen] = useState(false);

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

  // `buscar` con debounce: el buscador filtra en vivo, así que registramos el
  // término ya "asentado" (al parar de teclear ~0,8 s), no cada tecla. El nº de
  // resultados se lee de un ref sincronizado (no se puede tocar en render).
  const filteredLenRef = useRef(filtered.length);
  useEffect(() => {
    filteredLenRef.current = filtered.length;
  }, [filtered]);
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const t = window.setTimeout(() => {
      const resultados = filteredLenRef.current;
      track(AnalyticsEvent.buscar, { query: q, resultados });
      if (resultados === 0)
        track(AnalyticsEvent.busquedaSinResultados, { query: q });
    }, 800);
    return () => window.clearTimeout(t);
  }, [query]);

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        searchOpen={searchOpen}
        onToggleSearch={() => {
          if (searchOpen) {
            setSearchOpen(false);
            setQuery(""); // al cerrar, se limpia la búsqueda
          } else {
            setSearchOpen(true);
          }
        }}
        onFilter={() => {
          setFilterOpen(true);
          track(AnalyticsEvent.abrirFiltros);
        }}
        onInfo={() => {
          setMenuOpen(true);
          track(AnalyticsEvent.abrirMenu);
        }}
        resultCount={searching ? filtered.length : null}
        filterCount={countActive(filters)}
      />

      {filtersActive(filters) && !searchOpen && (
        <div
          className="no-scrollbar sticky z-20 flex gap-2 overflow-x-auto bg-blue px-5 pb-4 pt-2"
          style={{ top: HEADER_H }}
        >
          {dateLabel && (
            <RemovableTag
              label={dateLabel}
              onRemove={() => {
                setFilters((f) => ({ ...f, chip: null, from: null, to: null }));
                track(AnalyticsEvent.quitarFiltro, { tipo: "fecha" });
              }}
            />
          )}
          {filters.zones.map((z) => (
            <RemovableTag
              key={z}
              label={zoneChipLabel(z)}
              onRemove={() => {
                setFilters((f) => ({ ...f, zones: f.zones.filter((x) => x !== z) }));
                track(AnalyticsEvent.quitarFiltro, { tipo: "zona" });
              }}
            />
          ))}
          {filters.genres.map((g) => (
            <RemovableTag
              key={g}
              label={g}
              onRemove={() => {
                setFilters((f) => ({ ...f, genres: f.genres.filter((x) => x !== g) }));
                track(AnalyticsEvent.quitarFiltro, { tipo: "genero" });
              }}
            />
          ))}
        </div>
      )}

      {searchOpen && !searching ? (
        // Buscador desplegado y vacío: apoyo en lugar del listado (mismo estilo
        // que No-resultados).
        <div className="px-8 pt-20 text-center">
          <p className="text-lg text-muted">Busca por eventos o artistas</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="px-8 pt-20 text-center">
          <p className="text-lg text-muted">
            {searching
              ? `No encontramos nada por “${query.trim()}”`
              : "No hay eventos con estos filtros"}
          </p>
          {filtersActive(filters) && !searching && (
            <button
              type="button"
              onClick={() => {
                setFilters(emptyFilters);
                track(AnalyticsEvent.quitarTodosFiltros);
              }}
              className="mt-4 text-sm font-semibold text-blue"
            >
              Quitar filtros
            </button>
          )}
        </div>
      ) : (
        <EventList
          groups={groups}
          dateTop={
            filtersActive(filters) && !searchOpen
              ? HEADER_WITH_FILTERS
              : HEADER_H
          }
        />
      )}

      {filterOpen && (
        <FiltersOverlay
          initial={filters}
          events={events}
          onApply={(f) => {
            setFilters(f);
            setFilterOpen(false);
            // Show the freshly filtered list from the top, not at the old scroll.
            window.scrollTo(0, 0);
            const d = filtersData(f);
            track(AnalyticsEvent.aplicarFiltros, d);
            // Popularidad por filtro individual: un evento por valor activo, para
            // que Umami los pueda rankear (los strings combinados de
            // `aplicar-filtros` no se ordenan por zona/género suelto).
            f.zones.forEach((z) =>
              track(AnalyticsEvent.usarFiltro, { tipo: "zona", valor: z }),
            );
            f.genres.forEach((g) =>
              track(AnalyticsEvent.usarFiltro, { tipo: "genero", valor: g }),
            );
            if (d.fecha !== "cualquiera")
              track(AnalyticsEvent.usarFiltro, { tipo: "fecha", valor: d.fecha });
            // Combinación de filtros que deja la agenda vacía (respetando la
            // búsqueda activa, igual que la lista visible).
            if (filtersActive(f) && applyFilters(events, f, query).length === 0) {
              track(AnalyticsEvent.filtrosSinResultados, {
                fecha: d.fecha,
                zonas: d.zonas,
                generos: d.generos,
              });
            }
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
              <a
                href="mailto:hola@latira.org"
                className="font-medium underline"
                onClick={() => track(AnalyticsEvent.clicContactoEmail)}
              >
                hola@latira.org
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
