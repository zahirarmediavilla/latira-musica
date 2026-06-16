"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

// Transparent top bar on the detail screen with a back arrow at the top-right.
// Mirrors the About header: same top padding, and a spacer that reserves the
// logo's height so the back arrow lines up with the About close icon.
export function BackHeader() {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-bg px-5 pt-8">
      <div className="h-20 w-0" aria-hidden />
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Volver"
        className="rounded-full p-2 text-ink hover:bg-ink/5"
      >
        <BackIcon />
      </button>
    </div>
  );
}
