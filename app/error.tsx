"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { PrimaryButton } from "@/components/Button";

// Catches runtime errors thrown while rendering the home segment and its
// children (e.g. the Supabase read in lib/events.ts failing). Does NOT wrap the
// root layout. `unstable_retry` re-fetches and re-renders the segment, which is
// what we want when Supabase had a transient failure. Styled with the app's
// display heading scale, muted body copy, and PrimaryButton.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <h2 className="font-display text-[28px] font-bold leading-[1.05] text-ink">
        No pudimos cargar los eventos
      </h2>
      <p className="mt-3 text-lg text-muted">
        Ha habido un problema al conectar. Vuelve a intentarlo en un momento.
      </p>
      <div className="mt-8 w-full max-w-[260px]">
        <PrimaryButton onClick={() => unstable_retry()} arrow={false}>
          Reintentar
        </PrimaryButton>
      </div>
    </div>
  );
}
