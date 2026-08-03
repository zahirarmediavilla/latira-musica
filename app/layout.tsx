import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  openGraphFor,
  siteUrl,
} from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Vremena Grotesk (the display font) is self-hosted via @font-face in globals.css.

// metadataBase only once a base URL is configured (lib/seo.ts) — it stays
// undefined otherwise so no absolute URLs are guessed.
const base = siteUrl();
const HOME_TITLE_FULL = `${HOME_TITLE} | ${SITE_NAME}`;

export const metadata: Metadata = {
  ...(base ? { metadataBase: new URL(base) } : {}),
  // The "| LaTira" suffix lives ONLY here: child pages set a bare title and the
  // template appends the brand.
  title: {
    default: HOME_TITLE_FULL,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  // robots is set per-page (home + event) rather than here, so Next's automatic
  // `noindex` on not-found pages isn't overridden by a global `index, follow`.
  openGraph: openGraphFor({
    title: HOME_TITLE_FULL,
    description: HOME_DESCRIPTION,
  }),
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh bg-bg text-ink font-sans antialiased">
        {children}
        {modal}
        {/* Umami (analytics privacy-first, sin cookies → sin banner). Solo se
            carga si hay website ID configurado, así que en local o donde no
            estén las variables no envía nada. `afterInteractive` es el estándar
            para analytics; el tracker capta también las navegaciones cliente del
            App Router (pushState). Al migrar a latira.org, restringir a los
            dominios vivos añadiendo p. ej. data-domains="latira.org" (NO ahora:
            cortaría la medición en el dominio Vercel actual). */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SRC}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
