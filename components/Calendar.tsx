"use client";

import { useState } from "react";
import { ymd } from "@/lib/filtering";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DOW = ["L", "M", "X", "J", "V", "S", "D"]; // Monday-first

interface CalendarProps {
  from: string | null;
  to: string | null;
  onSelect: (from: string, to: string | null) => void;
}

export function Calendar({ from, to, onSelect }: CalendarProps) {
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

  function inRange(day: string): boolean {
    if (from && to) return day >= from && day <= to;
    return day === from;
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="px-2 text-lg text-ink"
        >
          ‹
        </button>
        <span className="text-sm font-semibold capitalize">
          {MESES[month]} {year}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="px-2 text-lg text-ink"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {DOW.map((d, i) => (
          <span key={i} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((day, i) =>
          day === null ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(day)}
              className={
                "aspect-square rounded-lg " +
                (inRange(day)
                  ? "bg-ink font-semibold text-white"
                  : "hover:bg-ink/5")
              }
            >
              {Number(day.slice(8))}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
