"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { SearchIcon, SlidersIcon, CloseIcon, InfoIcon } from "./icons";
import { Logo } from "./Logo";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchOpen: boolean;
  onToggleSearch: () => void; // abre/cierra el buscador (el padre limpia la query al cerrar)
  onFilter: () => void;
  resultCount: number | null; // null cuando no se está buscando
  filterCount: number; // filtros activos (zonas + fecha + géneros)
}

// Muelle compartido: barra azul, morphs y la tira de filtros usan el mismo
// gesto para crecer/volver.
export const SPRING = "cubic-bezier(0.34, 1.4, 0.5, 1)";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function Header({
  query,
  onQueryChange,
  searchOpen,
  onToggleSearch,
  onFilter,
  resultCount,
  filterCount,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Al desplegar el buscador, el foco entra en el input.
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Guardamos el último recuento real para que el texto se desvanezca con su
  // valor verdadero (no un 0 de golpe) mientras la barra se recoge. Se ajusta en
  // render (patrón oficial de estado derivado) en vez de en un efecto.
  const [lastCount, setLastCount] = useState(0);
  if (resultCount !== null && resultCount !== lastCount) {
    setLastCount(resultCount);
  }

  // Logo e iconos de info/filtros se ocultan a la vez que se despliega el buscador.
  const hideWhenSearching: CSSProperties = {
    opacity: searchOpen ? 0 : 1,
    transform: searchOpen ? "translateX(8px)" : "none",
    pointerEvents: searchOpen ? "none" : "auto",
    transition: `opacity 200ms ease, transform 300ms ${EASE}`,
  };

  const morph = (visible: boolean, rotOut: string): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : rotOut,
    transition: `opacity 240ms ease, transform 320ms ${SPRING}`,
  });

  return (
    <header className="sticky top-0 z-30 bg-ink text-white">
      <div className="relative h-[118px]">
        {/* Marca. No es el encabezado de la página (el H1 es sr-only), así que va
            como imagen decorativa. La tira roja llega a sangre al borde superior
            (top:0). Paths del SVG de diseño; el palo de la "i" (rojo + blanco) se
            estrecha a 10 px para igualar el grosor de la franja amarilla de la
            fecha y la barra azul del header. */}
        <Logo
          className="absolute left-5 top-0 h-[87.23px] w-auto"
          style={{
            opacity: searchOpen ? 0 : 1,
            transform: searchOpen ? "translateX(-8px)" : "none",
            pointerEvents: searchOpen ? "none" : "auto",
            transition: `opacity 200ms ease, transform 300ms ${EASE}`,
          }}
        />

        {/* Info: enlaza a /info. Al navegar desde aquí, la ruta interceptora
            (@modal/(.)info) la abre como overlay deslizante sobre la home,
            manteniendo /info en la barra de direcciones; una carga directa cae
            en la página completa. Mismo patrón que la ficha de evento. */}
        <Link
          href="/info"
          aria-label="Información"
          className="absolute right-[116px] top-[43px] flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          style={hideWhenSearching}
        >
          <InfoIcon />
        </Link>

        {/* Filtros (misma interacción que hasta ahora) */}
        <button
          type="button"
          onClick={onFilter}
          aria-label="Filtrar"
          className="absolute right-[68px] top-[43px] flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          style={hideWhenSearching}
        >
          <SlidersIcon />
          {filterCount > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow ring-2 ring-ink" />
          )}
        </button>

        {/* Buscador: se despliega de derecha a izquierda (anclado a la derecha,
            el borde izquierdo barre hasta el margen). El botón lupa/aspa queda a
            su derecha, fijo. */}
        <div
          className="absolute right-[76px] top-[44px] flex h-11 items-center gap-2 overflow-hidden rounded-[22px] bg-white text-ink"
          style={{
            width: searchOpen ? "calc(100% - 96px)" : "0px",
            transition: `width 420ms ${EASE}`,
          }}
          aria-hidden={!searchOpen}
        >
          <SearchIcon className="ml-4 h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="¿Qué buscas?"
            tabIndex={searchOpen ? 0 : -1}
            className="w-full min-w-0 bg-transparent pr-4 text-base text-ink outline-none placeholder:text-muted"
          />
        </div>

        {/* Lupa ↔ aspa (mismo botón, en la posición de la lupa) */}
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar"}
          className="absolute right-5 top-[43px] flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
        >
          <span className="absolute inset-0 flex items-center justify-center" style={morph(!searchOpen, "rotate(90deg)")}>
            <SearchIcon />
          </span>
          <span className="absolute inset-0 flex items-center justify-center" style={morph(searchOpen, "rotate(-90deg)")}>
            <CloseIcon />
          </span>
        </button>
      </div>

      {/* Barra azul: fina (10 px) en reposo; crece con muelle hasta el recuento
          mientras se busca. Un único elemento (no un intercambio) para que la
          altura anime, y vuelva sola a la inversa al vaciarse. */}
      <div
        className="overflow-hidden bg-blue"
        style={{
          height: resultCount === null ? "10px" : "2.25rem",
          transition: `height 420ms ${SPRING}`,
        }}
        aria-hidden={resultCount === null}
      >
        <p
          className="px-5 py-2 text-sm font-semibold text-white"
          style={{
            opacity: resultCount === null ? 0 : 1,
            transform: resultCount === null ? "translateY(6px)" : "none",
            transition: `opacity 280ms ease 60ms, transform 340ms ${SPRING} 60ms`,
          }}
        >
          {lastCount} {lastCount === 1 ? "resultado" : "resultados"}
        </p>
      </div>
    </header>
  );
}
