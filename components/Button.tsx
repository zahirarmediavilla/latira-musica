"use client";

import { ArrowRightIcon } from "./icons";

const PRIMARY =
  "flex w-full items-center justify-center gap-2 rounded-full bg-blue py-4 text-[15px] font-medium uppercase tracking-[0.06em] text-white";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string; // renders an <a>; external opens in a new tab
  external?: boolean;
  arrow?: boolean;
}

// The primary action button (blue pill) used across the app: Aplicar filtros,
// Comprar entradas, Compartir.
export function PrimaryButton({
  children,
  onClick,
  href,
  external,
  arrow = true,
}: ButtonProps) {
  const content = (
    <>
      {children}
      {arrow && <ArrowRightIcon className="h-5 w-5" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={PRIMARY}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={PRIMARY}>
      {content}
    </button>
  );
}
