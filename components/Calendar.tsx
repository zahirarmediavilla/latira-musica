"use client";

import { useState } from "react";
import { ymd } from "@/lib/filtering";
import { MESES } from "@/lib/format";
import { CheckIcon } from "./icons";

const DOW = ["L", "M", "X", "J", "V", "S", "D"]; // Monday-first

interface CalendarProps {
  from: string | null;
  to: string | null;
  onSelect: (from: string, to: string | null) => void;
  onConfirm?: () => void;
}

export function Calendar({ from, to, onSelect, onConfirm }: CalendarProps) {
  const init = from ? new Date(`${from}T12:00:00`) : new Date();
  const [view, setView] = useState(new Date(init.getFullYear(), init.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset for the 1st of the month.
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(new Date(year, month, d)));

  function handleClick(day: string) {
    if (!from || (from && to)) {
      onSelect(day, null);
    } else if (day < from) {
      onSelect(day, from);
    } else {
      onSelect(from, day);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-center">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="-ml-2 flex h-11 w-11 items-center justify-center text-lg text-ink"
        >
          ‹
        </button>
        <span className="flex-1 text-center text-sm font-semibold capitalize">
          {MESES[month]} {year}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="flex h-11 w-11 items-center justify-center text-lg text-ink"
        >
          ›
        </button>
        <button
          type="button"
          aria-label="Aplicar fecha"
          onClick={onConfirm}
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue text-white transition-colors hover:bg-[#0061b8]"
        >
          <CheckIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-muted">
        {DOW.map((d, i) => (
          <span key={i} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const col = i % 7;
          const isFrom = day === from;
          const isTo = !!to && day === to;
          const isMid = !!to && day > from! && day < to;
          const isEnd = isFrom || isTo;
          return (
            <div key={i} className="relative h-10">
              {isMid && <span className="absolute inset-x-0 inset-y-0.5 bg-[#cccccc]" />}
              {isTo && col !== 0 && (
                <span className="absolute inset-y-0.5 left-0 w-1/2 bg-[#cccccc]" />
              )}
              {isFrom && !!to && day < to && col !== 6 && (
                <span className="absolute inset-y-0.5 right-0 w-1/2 bg-[#cccccc]" />
              )}
              <button
                type="button"
                onClick={() => handleClick(day)}
                className="relative flex h-full w-full items-center justify-center"
              >
                <span
                  className={
                    "flex h-9 w-10 items-center justify-center rounded-full " +
                    (isEnd ? "bg-yellow font-bold text-ink" : "")
                  }
                >
                  {Number(day.slice(8))}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
