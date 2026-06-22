import { PrimaryButton } from "@/components/Button";

// Shown when notFound() is called (e.g. an event id that doesn't exist) or for
// any unmatched route. Branded replacement for Next's default 404 screen.
// Reuses the app's display heading scale, muted body copy, and PrimaryButton.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <h2 className="font-display text-[28px] font-bold leading-[1.05] text-ink">
        No encontramos esto
      </h2>
      <p className="mt-3 text-lg text-muted">
        El evento que buscas no existe o ya ha pasado.
      </p>
      <div className="mt-8 w-full max-w-[260px]">
        <PrimaryButton href="/">Ver la agenda</PrimaryButton>
      </div>
    </div>
  );
}
