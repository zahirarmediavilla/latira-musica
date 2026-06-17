"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "./icons";

// Transparent top bar on the detail screen with a back arrow at the top-right.
// Mirrors the About header: same top padding, and a spacer that reserves the
// logo's height so the back arrow lines up with the About close icon.
export function BackHeader() {
  const router = useRouter();

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
        aria-label="Volver"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}
