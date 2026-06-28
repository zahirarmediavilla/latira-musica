# Kickoff: añadir analytics (Umami) a la web

Documento para arrancar una **sesión nueva** centrada en integrar analytics.
Abrir la sesión con el directorio de trabajo en `web/`.

## Herramienta elegida: Umami
Privacy-first por diseño: **sin cookies, sin datos personales, sin banner de
consentimiento RGPD**, script ligero (~2 KB). Self-hosteable gratis.

## Decisión previa: ¿dónde vive el servidor de Umami?
Umami es una app aparte (Node + base de datos Postgres) que recibe los datos. La
web solo carga su script. Hay que decidir dónde corre Umami:

- **Umami Cloud** (plan gratuito con límites, región EU) → rápido para empezar a
  probar mientras la web está en Vercel. **Recomendado para la fase de pruebas.**
- **Self-host** (gratis) → en el VPS de Dinahosting cuando se haga la migración.
  Necesita Node + Postgres (se puede usar una base Postgres propia; incluso podría
  apoyarse en Supabase como base de datos de Umami).

Plan sugerido: **empezar con Umami Cloud** (igual que la web empieza en Vercel) y
**migrar a self-host en Dinahosting** más adelante. Cambiar de instancia es solo
actualizar la URL del script y el website ID.

## Contexto del proyecto (para la sesión nueva)
- **Stack**: Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4.
- **Qué es**: "Agendina", agenda de eventos musicales de Asturias. Lee datos de
  **Supabase** (server components en `lib/events.ts`; cliente en `lib/supabase.ts`).
- **Rutas clave**: `app/page.tsx` (home, listado), `app/event/[id]/page.tsx`
  (ficha de evento), modal interceptado en `app/@modal/(.)event/[id]`.
- **Restricción de Next**: leer `web/AGENTS.md` — esta versión tiene cambios;
  consultar `node_modules/next/dist/docs/` antes de escribir código. Para cargar
  el script, valorar `next/script`.
- **Env**: las claves públicas van en `web/.env.local` con prefijo `NEXT_PUBLIC_`.
  `.env*` ya está en `.gitignore`.

## Prompt para pegar en la nueva sesión

```
Quiero integrar Umami (analytics privacy-first, sin cookies) en esta web
Next.js 16.2.9 (App Router, TS, Tailwind v4). Es "Agendina", agenda de eventos
musicales que lee de Supabase. Rutas: app/page.tsx (home), app/event/[id]/page.tsx
(ficha) y modal en app/@modal/(.)event/[id].

Servidor de Umami: empiezo con Umami Cloud (región EU); a futuro self-host en VPS.
Las variables (NEXT_PUBLIC_UMAMI_WEBSITE_ID y la URL del script) van en .env.local.

Lee web/AGENTS.md: esta versión de Next tiene cambios; consulta
node_modules/next/dist/docs/ antes de escribir código (p. ej. uso de next/script).

Quiero:
1. Cargar el script de Umami en app/layout.tsx (defer, con next/script), leyendo
   website ID y src desde NEXT_PUBLIC_*. Que no rompa el SSR ni la caché actual.
2. Tracking de page views incluyendo navegaciones cliente del App Router
   (verifica que Umami registra los cambios de ruta de pushState; si no, añade un
   pequeño tracker en un client component que escuche los cambios de ruta).
3. Eventos personalizados con umami.track():
   - "ver-ficha-evento" al abrir app/event/[id] (incluir id/nombre del evento).
   - "clic-comprar-entrada" al pulsar el enlace de ticketUrl en la ficha.
4. Confírmame que con Umami no hace falta banner de consentimiento (sin cookies).

Empieza proponiendo un plan antes de tocar código. No subas claves a git.
```

## Antes de la sesión: checklist
- [ ] Crear cuenta en Umami Cloud (o desplegar instancia) y dar de alta el sitio.
- [ ] Copiar el **website ID** y la **URL del script** (`https://.../script.js`).
- [ ] Tenerlos listos para poner en `web/.env.local`:
      `NEXT_PUBLIC_UMAMI_WEBSITE_ID=...`
      `NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js`

## Nota de dominio / migración (contexto, no es tarea de esta sesión)
- La web empieza en **Vercel**; a futuro migra a **Dinahosting**.
- El dominio propio es lo que hace la migración transparente: se re-apunta el DNS,
  no hace falta redirección.
- ⚠️ Next con SSR necesita **Node.js** en destino: confirmar que el plan de
  Dinahosting (VPS/Cloud) lo soporta antes de migrar.
- Mientras esté en Vercel, valorar redirecciones `www → apex` + forzar HTTPS en
  `next.config.ts` (`async redirects()`), independiente de los analytics.
