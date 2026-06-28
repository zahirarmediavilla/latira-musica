"use client";

import Image from "next/image";
import { SearchIcon, SlidersIcon, MenuIcon, CloseIcon, ClearCircleIcon } from "./icons";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClearSearch: () => void;
  onFilter: () => void;
  onMenu: () => void;
  resultCount: number | null; // null when not searching
  filterCount: number; // active filters (zones + date)
}

export function Header({
  query,
  onQueryChange,
  onClearSearch,
  onFilter,
  onMenu,
  resultCount,
  filterCount,
}: HeaderProps) {
  const searching = query.trim().length > 0;

  return (
    <header className="sticky top-0 z-30 bg-ink text-white">
      <div className="flex items-center justify-between px-5 pt-5">
        {/* Brand logo — not the page heading (the H1 is the page's semantic
            title), so it renders as a plain element to keep one H1 per page. */}
        <div className="leading-none">
          <Image
            src="/LaTira-logo.svg"
            alt="LaTira"
            width={137}
            height={59}
            priority
            className="h-[3.33rem] w-auto"
          />
        </div>
        <button
          type="button"
          onClick={onMenu}
          aria-label="Menú"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
        >
          <MenuIcon />
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 pb-5 pt-4">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-ink">
          <SearchIcon className="h-5 w-5 text-muted" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="¿Qué buscas?"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          {searching && (
            <button type="button" onClick={onClearSearch} aria-label="Borrar búsqueda">
              <ClearCircleIcon className="h-5 w-5 text-muted" />
            </button>
          )}
        </div>
        {searching ? (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Cerrar búsqueda"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFilter}
            aria-label="Filtrar"
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          >
            <SlidersIcon />
            {filterCount > 0 && (
              <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-yellow ring-2 ring-ink" />
            )}
          </button>
        )}
      </div>

      {/* Blue bar: a thin rule normally, taller with a count while searching. */}
      {resultCount === null ? (
        <div className="h-2 bg-blue" />
      ) : (
        <p className="bg-blue px-5 py-2 text-sm font-semibold text-white">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </p>
      )}
    </header>
  );
}
