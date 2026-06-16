"use client";

import { CloseIcon } from "./icons";

// Toggleable filter chip (e.g. the date quick filters).
export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
        (selected
          ? "border-yellow bg-yellow text-ink"
          : "border-line text-ink hover:border-ink/40")
      }
    >
      {label}
      {selected && <CloseIcon className="h-3.5 w-3.5" />}
    </button>
  );
}

// Removable applied-filter tag shown in the strip above the list.
export function RemovableTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-yellow px-3.5 py-1.5 text-sm font-medium text-ink">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Quitar ${label}`}>
        <CloseIcon className="h-4 w-4" />
      </button>
    </span>
  );
}
