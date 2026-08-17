"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon, CloseIcon } from "./icons";

// Transparent top bar shared by every full-screen overlay (the event detail and
// the info screen). It carries the close control at the top-right and plays the
// reverse slide-out before navigating back, so the overlay leaves the same way
// it entered. `icon`/`label` switch between the detail's back arrow and the
// info screen's ✕, mirroring the design of each surface.
export function BackHeader({
  icon = "back",
  label = "Volver",
}: {
  icon?: "back" | "close";
  label?: string;
} = {}) {
  const router = useRouter();
  const Icon = icon === "close" ? CloseIcon : ArrowRightIcon;

  // Play the reverse slide-out, then navigate back once it finishes.
  function handleClose() {
    const container = document.querySelector<HTMLElement>(".detail-overlay");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!container || reduce) {
      router.back();
      return;
    }
    if (container.classList.contains("animate-detail-out")) return; // already closing
    container.classList.remove("animate-detail-in");
    container.classList.add("animate-detail-out");
    window.setTimeout(() => router.back(), 280);
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-bg px-5 pt-5">
      <div className="h-[3.33rem] w-0" aria-hidden />
      <button
        type="button"
        onClick={handleClose}
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
      >
        <Icon />
      </button>
    </div>
  );
}
