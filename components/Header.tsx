"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

  // Keep the last real count so the text fades out with its true value
  // (not a flash of 0) while the bar collapses back to a thin rule.
  const [lastCount, setLastCount] = useState(0);
  useEffect(() => {
    if (resultCount !== null) setLastCount(resultCount);
  }, [resultCount]);

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
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 text-ink">
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

      {/* Blue bar: a thin rule that grows into the result count while
          searching. A single element (not a swap) so its height animates. */}
      <div
        className="overflow-hidden bg-blue"
        style={{
          height: resultCount === null ? "0.5rem" : "2.25rem",
          transition: "height 420ms cubic-bezier(0.34, 1.4, 0.5, 1)",
        }}
        aria-hidden={resultCount === null}
      >
        <p
          className="px-5 py-2 text-sm font-semibold text-white"
          style={{
            opacity: resultCount === null ? 0 : 1,
            transform: resultCount === null ? "translateY(6px)" : "none",
            transition:
              "opacity 280ms ease 60ms, transform 340ms cubic-bezier(0.34, 1.4, 0.5, 1) 60ms",
          }}
        >
          {lastCount} {lastCount === 1 ? "resultado" : "resultados"}
        </p>
      </div>
    </header>
  );
}
