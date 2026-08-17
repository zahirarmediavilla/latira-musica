import type { Metadata, Viewport } from "next";
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
  // Installed (standalone) on iOS: black status bar always, so the OS clock band
  // stays dark and consistent between the home and the light detail/info screens
  // (no flip). Pairs with the dark `theme-color` in `viewport` below for browsers.
  appleWebApp: { capable: true, statusBarStyle: "black", title: SITE_NAME },
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

// A single, dark `theme-color` for every page. The browser tints its toolbar /
// status band with this one value — the same on the home and on the (light)
// detail/info screens — so that band never flips colour between screens. This
// is what makes the top of the screen stop "jumping" on navigation; there is no
// per-page theme-color to swap.
export const viewport: Viewport = {
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      {/* Preload de la fuente display (peso bold): es la que pinta el título de
          la ficha y los nombres/fechas del listado, todo above-the-fold. Sin
          esto el navegador no la descubre hasta parsear el CSS → FOUT en lo más
          visible. React 19 iza el <link> al <head>. */}
      <link
        rel="preload"
        href="/Vremena%20Grotesk/Web%20Fonts/vremenagrotesk_bold_macroman/vremenagroteskbold-webfont.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {/* Shell fijo: el documento nunca scrollea (cada pantalla scrollea en su
          propio contenedor interno). Así el navegador móvil no muestra/oculta su
          barra al pasar de la home a un overlay, que era el salto vertical del
          área superior. Los overlays (ficha, info) son `fixed inset-0` y quedan
          por encima; la home scrollea dentro de su contenedor `flex-1`. */}
      <body className="flex h-dvh flex-col overflow-hidden bg-bg text-ink font-sans antialiased">
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
          <>
            {/* Auto-exclusión de la propia medición, por dispositivo. Umami no
                cuenta a un navegador que tenga `umami.disabled` en su
                localStorage; esta marca es por navegador (el móvil y el
                ordenador son almacenes distintos). Abrir la web con `?notrack`
                la activa y con `?track` la quita. Va en `beforeInteractive`
                para que corra en el <head> ANTES que el script de Umami
                (afterInteractive) y no cuente ni el primer instante. En un
                iPhone, si añades a la pantalla de inicio desde `…/?notrack`,
                el icono reabre con el parámetro y se re-marca en cada apertura. */}
            <Script id="umami-optout" strategy="beforeInteractive">
              {`try{var p=new URLSearchParams(location.search);if(p.has('notrack')){localStorage.setItem('umami.disabled','1')}else if(p.has('track')){localStorage.removeItem('umami.disabled')}}catch(e){}`}
            </Script>
            <Script
              src={process.env.NEXT_PUBLIC_UMAMI_SRC}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              {...(umamiDomains ? { "data-domains": umamiDomains } : {})}
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
