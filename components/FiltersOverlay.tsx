"use client";

import { useState } from "react";
import { ZONES, ZONE_META, type Zone } from "@/lib/types";
import {
  type Filters,
  type DateChip,
  rangeForChip,
} from "@/lib/filtering";
import { formatFilterDate, formatShortDate } from "@/lib/format";
import { Chip } from "./Chip";
import { Calendar } from "./Calendar";
import { PrimaryButton } from "./Button";
import { CheckIcon, BackIcon } from "./icons";

const CHIPS: { id: DateChip; label: string }[] = [
  { id: "finde", label: "El finde" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
];

interface Props {
  initial: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}

export function FiltersOverlay({ initial, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<Filters>(initial);
  const [calOpen, setCalOpen] = useState(false);

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
      zones: d.zones.includes(z)
        ? d.zones.filter((x) => x !== z)
        : [...d.zones, z],
    }));
  }

  const dateValue = !draft.from
    ? "Cualquier fecha"
    : draft.to && draft.to !== draft.from
      ? `${formatShortDate(draft.from)} - ${formatShortDate(draft.to)}`
      : formatFilterDate(draft.from);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-bg">
      <header className="flex items-start justify-between px-5 pt-6">
        <h2 className="font-display text-3xl font-bold text-ink">Filtrar por</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Volver"
          className="rounded-full p-1 text-ink hover:bg-ink/5"
        >
          <BackIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-7">
        {/* Date */}
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Fecha
        </p>
        <button
          type="button"
          onClick={() => setCalOpen((o) => !o)}
          className="mt-2 w-full border-b border-line/80 pb-2 text-left text-lg text-ink"
        >
          {dateValue}
        </button>
        {calOpen && (
          <>
            {/* Scrim: tapping outside the calendar closes it, keeping the
                selected date / range in the draft. */}
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setCalOpen(false)}
            />
            <div className="relative z-20 mt-3">
              <Calendar from={draft.from} to={draft.to} onSelect={selectRange} />
            </div>
          </>
        )}
        <div className="mt-4 flex gap-2.5">
          {CHIPS.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={draft.chip === c.id}
              onClick={() => selectChip(c.id)}
            />
          ))}
        </div>

        {/* Zones */}
        <p className="mt-9 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Sitios
        </p>
        <ul className="mt-1">
          {ZONES.map((z) => {
            const checked = draft.zones.includes(z);
            const meta = ZONE_META[z];
            return (
              <li key={z}>
                <button
                  type="button"
                  onClick={() => toggleZone(z)}
                  className="flex w-full items-start gap-3 py-3 text-left"
                >
                  <span
                    className={
                      "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded border " +
                      (checked ? "border-yellow bg-yellow text-ink" : "border-ink/40")
                    }
                  >
                    {checked && <CheckIcon className="h-4 w-4" />}
                  </span>
                  <span>
                    <span className="block text-lg text-ink">{meta.label}</span>
                    {meta.sub && (
                      <span className="block text-sm text-muted">{meta.sub}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[#b8b8b8] px-5 pb-6 pt-4">
        <PrimaryButton onClick={() => onApply(draft)}>Aplicar filtros</PrimaryButton>
      </div>
    </div>
  );
}
