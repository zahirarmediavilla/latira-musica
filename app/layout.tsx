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
  twitterFor,
} from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Vremena Grotesk (the display font) is self-hosted via @font-face in globals.css.

// metadataBase only once a base URL is configured (lib/seo.ts) — it stays
// undefined otherwise so no absolute URLs are guessed.
const base = siteUrl();
const HOME_TITLE_FULL = `${SITE_NAME} | ${HOME_TITLE}`;

// Umami: restringir la medición al dominio de producción, derivado del MISMO
// `siteUrl()` que ya es la fuente única (así un cambio de dominio se toca en un
// solo sitio). Sin base configurada (local, previews) queda `undefined` y no se
// emite `data-domains`, que es justo cuando no hay nada que medir.
const umamiDomains = base ? new URL(base).host : undefined;

export const metadata: Metadata = {
  ...(base ? { metadataBase: new URL(base) } : {}),
  // Home lleva la marca delante ("LaTira | …") por pedirlo así la pestaña; el
  // keyword sigue en el título, que es lo que cuenta para SEO en portada.
  // Las páginas hijas van al revés ("%s | LaTira"): el nombre único primero y la
  // marca de sufijo, que es la práctica SEO para páginas interiores.
  title: {
    default: HOME_TITLE_FULL,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  // Google Search Console verification via env var (no code change to claim the
  // domain). Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel to the token
  // Search Console gives you; emits <meta name="google-site-verification">.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  // robots is set per-page (home + event) rather than here, so Next's automatic
  // `noindex` on not-found pages isn't overridden by a global `index, follow`.
  openGraph: openGraphFor({
    title: HOME_TITLE_FULL,
    description: HOME_DESCRIPTION,
  }),
  // Default Twitter/X card for every page. Interior pages that need a distinct
  // title (the event detail) rebuild their own; the rest inherit this one.
  twitter: twitterFor({
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
            App Router (pushState). `data-domains` acota la medición al dominio
            de producción (`umamiDomains`), dejando fuera previews y el dominio
            Vercel; sin base configurada no se emite y no restringe nada. */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SRC}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            {...(umamiDomains ? { "data-domains": umamiDomains } : {})}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
