# LaTira — web

Agenda de conciertos y eventos musicales de Asturias. Es la web pública de
**Agendina**: lista los eventos próximos y permite filtrarlos por zona y fecha.

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.
- **Datos**: se leen de **Supabase** (tabla `eventos` + recintos), en server
  components. La web es **solo lectura** (clave anónima); las escrituras en la
  base de datos se hacen desde el repo `agenda-scraper`.

## Arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Otros scripts: `npm run build`, `npm run start`, `npm run lint`.

## Variables de entorno

Se ponen en `web/.env.local` (ya está en `.gitignore`):

```bash
# Lectura de datos (obligatorias)
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
SUPABASE_ANON_KEY=<clave anónima/publishable>

# SEO: base URL del sitio (opcional). Sin ella, la web funciona con metadata
# relativa; al definirla se activan canonical, og:url y sitemap.
NEXT_PUBLIC_SITE_URL=https://latira.org
```

## Estructura

- `app/page.tsx` — home (listado de eventos próximos). Es `force-dynamic` para
  que los eventos recién scrapeados aparezcan sin redeploy; la lectura de
  Supabase se cachea ~5 min (`lib/supabase.ts`).
- `app/event/[id]/page.tsx` — ficha de evento (visita directa).
- `app/@modal/(.)event/[id]` — la misma ficha como **modal interceptado** que
  se desliza sobre la home cuando navegas desde dentro de la app.
- `lib/` — capa de dominio: lectura de datos (`events.ts`, `supabase.ts`),
  tipos (`types.ts`), filtros (`filtering.ts`, `zones.ts`), formato de fechas
  (`format.ts`) y SEO/JSON-LD (`seo.ts`, `jsonld.ts`).
- `components/` — UI (home, ficha, cabecera, filtros, calendario…).

## Fuentes

- **Inter** (texto) vía `next/font`.
- **Vremena Grotesk** (titulares), self-hosted desde `public/Vremena Grotesk/`
  vía `@font-face` en `app/globals.css`. Solo se incluyen los 3 pesos usados
  (regular/medium/bold) en `woff2`/`woff`.

## Notas

- Antes de tocar código, lee `AGENTS.md`: esta versión de Next puede traer
  cambios respecto a lo conocido; consulta `node_modules/next/dist/docs/`.
- Integrar analytics (Umami): ver `ANALYTICS-KICKOFF.md`.
