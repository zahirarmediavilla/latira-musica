"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SearchIcon, SlidersIcon, CloseIcon, InfoIcon } from "./icons";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchOpen: boolean;
  onToggleSearch: () => void; // abre/cierra el buscador (el padre limpia la query al cerrar)
  onFilter: () => void;
  onInfo: () => void;
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
  onInfo,
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
        <svg
          viewBox="20 0 150.456 87.2263"
          className="absolute left-5 top-0 h-[87.23px] w-auto"
          style={{
            opacity: searchOpen ? 0 : 1,
            transform: searchOpen ? "translateX(-8px)" : "none",
            pointerEvents: searchOpen ? "none" : "auto",
            transition: `opacity 200ms ease, transform 300ms ${EASE}`,
          }}
          role="img"
          aria-label="LaTira"
        >
          <path d="M150.955 87.2263C145.255 87.2263 141.355 83.8063 141.355 78.8263C141.355 73.1863 146.335 69.2863 155.095 68.5063L159.775 68.0863V67.2463C159.775 65.0863 158.395 63.6463 156.355 63.6463C154.315 63.6463 152.875 65.0863 152.755 67.1863L142.255 66.9463C142.495 60.1063 148.555 55.1263 156.655 55.1263C164.635 55.1263 170.455 60.4063 170.455 67.5463V77.0263C170.455 80.2063 170.635 84.1663 171.055 86.6263H160.555C160.315 85.3663 160.195 83.9863 160.195 83.0263C158.395 85.4263 155.035 87.2263 150.955 87.2263ZM154.915 79.9063C157.615 79.9063 159.895 77.5663 159.895 74.4463V74.2063L155.935 74.6263C153.775 74.8663 152.155 75.7663 152.155 77.5663C152.155 79.0063 153.235 79.9063 154.915 79.9063Z" fill="#FFFDFD" />
          <path d="M119.138 86.6263V56.0263H129.938L129.638 62.9263C131.138 56.6263 135.878 54.8263 140.738 56.0263V66.8263C135.938 65.9263 129.938 66.6463 129.938 74.0263V86.6263H119.138Z" fill="#FFFDFD" />
          <path d="M105.738 86.6263V56.0263H115.738V86.6263H105.738Z" fill="#FFFDFD" />
          <path d="M105.738 51.9961V0H115.738V51.9961H105.738Z" fill="#FF4203" />
          <path d="M102.029 86.5063C93.929 88.3063 85.8291 85.8463 85.8291 74.9263V65.0263H81.0291V56.0263H85.8291V48.2263H96.6291V56.0263H102.929V65.0263H96.6291V74.0263C96.6291 77.8063 99.1491 78.0463 102.029 77.5063V86.5063Z" fill="#FFFDFD" />
          <path d="M60.1884 87.2263C54.4884 87.2263 50.5884 83.8063 50.5884 78.8263C50.5884 73.1863 55.5684 69.2863 64.3284 68.5063L69.0084 68.0863V67.2463C69.0084 65.0863 67.6284 63.6463 65.5884 63.6463C63.5484 63.6463 62.1084 65.0863 61.9884 67.1863L51.4884 66.9463C51.7284 60.1063 57.7884 55.1263 65.8884 55.1263C73.8684 55.1263 79.6884 60.4063 79.6884 67.5463V77.0263C79.6884 80.2063 79.8684 84.1663 80.2884 86.6263H69.7884C69.5484 85.3663 69.4284 83.9863 69.4284 83.0263C67.6284 85.4263 64.2684 87.2263 60.1884 87.2263ZM64.1484 79.9063C66.8484 79.9063 69.1284 77.5663 69.1284 74.4463V74.2063L65.1684 74.6263C63.0084 74.8663 61.3884 75.7663 61.3884 77.5663C61.3884 79.0063 62.4684 79.9063 64.1484 79.9063Z" fill="#FFFDFD" />
          <path d="M20 86.6263V44.6263H31.4V77.2663H48.8V86.6263H20Z" fill="#FFFDFD" />
        </svg>

        {/* Info (sustituye a la hamburguesa; abre la pantalla de información) */}
        <button
          type="button"
          onClick={onInfo}
          aria-label="Información"
          className="absolute right-[116px] top-[43px] flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          style={hideWhenSearching}
        >
          <InfoIcon />
        </button>

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
