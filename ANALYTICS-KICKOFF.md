# Plan: analytics con Umami

Plan revisado y listo para implementar. Última revisión contra el repo real:
Next **16.2.12** (App Router), React 19, TS, Tailwind v4. La web es "Agendina"
(LaTira), agenda de eventos musicales de Asturias, que lee de Supabase.

> Estado: **plan aprobado, pendiente de implementar**. No tocar código hasta
> tener el `website ID` (ver checklist al final).

## Herramienta: Umami
Privacy-first por diseño: **sin cookies, sin datos personales identificables,
sin banner de consentimiento RGPD**, script ligero. Self-hosteable gratis.

**Consentimiento: NO hace falta banner.** Umami no usa cookies ni guarda
identificadores en el dispositivo y no procesa datos personales identificables
(IP anonimizada). Bajo RGPD/ePrivacy, la analítica sin cookies ni acceso a
información del dispositivo no requiere consentimiento. (Postura declarada de
Umami y consenso habitual; no es asesoría legal formal.)

## Dónde vive el servidor de Umami
Umami es una app aparte (Node + Postgres) que recibe los datos; la web solo
carga su script.

- **Umami Cloud** (plan gratuito, región EU) → para empezar mientras la web
  está en Vercel. **Fase actual.**
- **Self-host** (gratis) → en el VPS de Dinahosting cuando se migre. Node +
  Postgres (podría apoyarse en una base propia o incluso Supabase).

Migrar de instancia es solo cambiar `NEXT_PUBLIC_UMAMI_SRC` y el website ID.

## Dominio y migración (decidido)
- La web se moverá de un dominio Vercel a **latira.org**, y más adelante de
  Vercel a **Dinahosting**.
- Los datos de Umami se identifican por el **WEBSITE ID**, no por el dominio.
  Usar **UN solo website** en Umami y **conservar su ID** en todos los cambios
  de dominio. Al migrar solo se edita el **campo dominio** del sitio en el panel
  de Umami; **nunca se crea un website nuevo** (se perdería el histórico).
- Si se activa restricción por dominio (`data-domains`), añadir `latira.org`
  (y el dominio Vercel mientras siga vivo) a los permitidos.
- ⚠️ Next con SSR necesita **Node.js** en destino: confirmar que el plan de
  Dinahosting lo soporta antes de migrar.

---

## Qué se mide

### Automático (script de Umami, sin código)
Cada **page view** —incluidas las navegaciones cliente del App Router: home `/`,
ficha `/event/[id]` y apertura del modal interceptado— captura de serie:

- Tipo de **dispositivo** (móvil / tablet / escritorio)
- **Resolución** de pantalla (p. ej. `390×844`)
- **Navegador**, **sistema operativo** e **idioma**
- **País / región** (por IP, anonimizada)
- **Referrer** (Google, Instagram, enlace directo…) y parámetros **UTM**

### Eventos personalizados

**Ficha de evento** (componentes compartidos por la página suelta y el modal):

| Evento | Cuándo | Datos |
|---|---|---|
| `ver-ficha-evento` | Al abrirse la ficha | `id`, `name`, `origen` (lista/modal/directo) |
| `clic-comprar-entrada` | Botón "Comprar entradas" | `id`, `name` |
| `clic-anadir-calendario` | Enlace "Añadir a calendario" (.ics) | `id`, `name` |
| `clic-compartir` | Botón "Compartir" | `id`, `name` |
| `clic-ubicacion-mapa` | Nombre del recinto → Google Maps | `id`, `venue` |
| `clic-visto-en` | Enlace a la fuente ("Visto en …") | `id`, `host` |
| `clic-ver-video-audio` | Enlace de vídeo/audio **no** embebido | `id` |

**Buscador (home):**

| Evento | Cuándo | Datos |
|---|---|---|
| `buscar` | Al parar de teclear (debounce ~0,8 s) con texto | `query`, `resultados` |
| `busqueda-sin-resultados` | Búsqueda que da 0 | `query` |

**Filtros (home):**

| Evento | Cuándo | Datos |
|---|---|---|
| `abrir-filtros` | Botón de filtros | — |
| `aplicar-filtros` | "Aplicar filtros" | `fecha`, `zonas`, `generos`, `n_filtros` |
| `usar-filtro` | Al aplicar, uno por cada filtro activo | `tipo` (zona/genero/fecha), `valor` |
| `quitar-filtro` | Quitar una etiqueta de la barra azul | `tipo` (fecha/zona/genero) |
| `quitar-todos-filtros` | "Quitar filtros" del estado vacío | — |
| `filtros-sin-resultados` | Combinación que deja la agenda vacía | `fecha`, `zonas` |

**Menú / navegación (home):**

| Evento | Cuándo | Datos |
|---|---|---|
| `abrir-menu` | Botón de menú (☰) | — |
| `clic-contacto-email` | `mailto:hola@latira.org` | — |

**Errores:**

| Evento | Cuándo | Datos |
|---|---|---|
| `pagina-no-encontrada` | Se muestra la 404 (id muerto, enlace roto) | `path` |
| `error-app` | Salta el error boundary de la app | — |

### Lo que NO se mide (por límites reales, no por olvido)
- **Play del vídeo de YouTube embebido**: iría contra el modo *nocookie/lazy*
  actual (exigiría activar la API de YouTube, con coste de privacidad). Solo se
  mide el clic en enlaces de vídeo/audio que **no** son embed.
- **Resultado de "Compartir"**: `navigator.share` no dice si se completó o se
  canceló. Se mide el **clic**, no el destino.
- **Scroll / tiempo en página**: Umami no lo trae de serie; se puede añadir
  después si interesa.

---

## Decisiones de implementación

### Carga del script
En `app/layout.tsx`, dentro del `<body>`, con `next/script`:

```tsx
{process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
  <Script
    src={process.env.NEXT_PUBLIC_UMAMI_SRC}
    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
    strategy="afterInteractive"
  />
)}
```
- `strategy="afterInteractive"` es el estándar para analytics (no se usa `defer`
  a mano). No rompe el SSR: el layout sigue siendo server component.
- El guard `NEXT_PUBLIC_UMAMI_WEBSITE_ID && …` evita cargar el script en local o
  donde no esté configurada la variable.
- **`data-domains` va sin poner ahora a propósito**: restringirlo a `latira.org`
  cortaría la medición en el dominio Vercel actual. Se añade al migrar, con
  todos los dominios vivos. (Ya implementado así en `app/layout.tsx`.)

### Page views con navegación cliente
El tracker de Umami intercepta `pushState`/`replaceState`, que es lo que usa el
App Router (y el modal interceptado). **Se verifica en la pestaña Network** que
registra los cambios de ruta; solo si se pierde alguno se añade un pequeño client
component con `usePathname()` que llame a `track()` en cada cambio.

### Módulo central `lib/analytics.ts`
Un único punto para:
- Un `track(nombre, datos?)` tipado que **no hace nada si Umami no está cargado**
  (`window.umami?.track(...)`), con el tipo de `window.umami`.
- Las **constantes con los nombres de evento** (evita el clásico bug de escribir
  el nombre distinto en dos sitios y partir la métrica en dos).

Los clics sobre `<a>`/`<button>` que viven en **server components** (enlaces de
`EventDetail`: mapa, "Visto en", vídeo/audio) se instrumentan con el atributo
declarativo `data-umami-event="…"` (+ `data-umami-event-*` para los datos), que
Umami trackea solo **sin JS**. Los eventos "al ver" (`ver-ficha-evento`),
programáticos (`clic-compartir`) y de la home (buscar, filtros) usan `track()`
desde el client component correspondiente.

### Higiene de datos
1. **Excluir tráfico propio**: poner `localStorage['umami.disabled'] = 1` en el
   navegador de la usuaria (una vez). Sin esto, sus revisiones diarias ensucian
   todo. **Imprescindible.**
2. **Solo en producción**: dar de alta `NEXT_PUBLIC_UMAMI_*` **solo en el entorno
   Production de Vercel** (no Preview ni Development), para que previews y local
   no manden datos al mismo website.
3. **Restricción por dominio** (`data-domains`) y honrar *Do Not Track*.

### Crecimiento: bucle de compartir
Al construir la URL de "Compartir", añadir `?utm_source=share`. Así, cuando quien
recibe el enlace abre la ficha, Umami atribuye la visita a "compartido" y se
puede medir ese canal (hoy invisible).

### Análisis en el panel (configuración, no código)
- **Filtros más usados**: en la sección Events, abrir `usar-filtro` y ver el
  desglose de `valor` → ranking de zonas / géneros / fechas por popularidad.
  (`aplicar-filtros` guarda la combinación completa como texto, útil para ver
  combos, pero no se ordena por filtro suelto; para eso está `usar-filtro`.)
- **Búsquedas**: `buscar` y, sobre todo, `busqueda-sin-resultados` → qué se
  busca y qué no aparece (qué falta en la agenda).

> Nota: **no** se define embudo de conversión ni *goal* de compra: el objetivo
> del proyecto no es vender entradas. `clic-comprar-entrada` se mantiene solo
> como señal de interés, no como conversión.

---

## Archivos a tocar
- `app/layout.tsx` — carga del `<Script>`.
- `lib/analytics.ts` — **nuevo**: `track()` tipado + constantes de nombres.
- `components/DetailActions.tsx` — `ver-ficha-evento`, `clic-comprar-entrada`,
  `clic-anadir-calendario`, `clic-compartir`, `utm_source=share` en el share.
- `components/EventDetail.tsx` — `data-umami-event` en mapa, "Visto en", vídeo.
- `components/Button.tsx` — permitir `onClick`/atributos en el `<a>` (hoy los
  ignora cuando hay `href`).
- `components/HomeView.tsx` — `buscar`/`busqueda-sin-resultados` (debounce),
  `abrir-filtros`, `aplicar-filtros`, `quitar-filtro`, `quitar-todos-filtros`,
  `filtros-sin-resultados`, `abrir-menu`, `clic-contacto-email`.
- `app/not-found.tsx` — `pagina-no-encontrada` (client component pequeño).
- `app/error.tsx` — `error-app`.
- `.env.local` — valores (a mano, nunca a git).

## Variables de entorno
En `web/.env.local` (con prefijo `NEXT_PUBLIC_`, nunca a git — `.env*` ya está
en `.gitignore`):

```
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<el-id-del-website>
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
```
Recordatorio: darlas de alta también en **Vercel → Production** para que mida en
producción.

## Checklist antes de implementar
- [ ] Crear cuenta en Umami Cloud (región EU) y dar de alta **un** sitio.
- [ ] Copiar el **website ID** y confirmar la **URL del script**
      (`https://cloud.umami.is/script.js`).
- [ ] Ponerlos en `web/.env.local` y en **Vercel (Production)**.
- [ ] Tras desplegar: poner `localStorage['umami.disabled'] = 1` en el navegador
      propio para excluirse.
- [ ] Verificar en Network que los page views se registran al navegar (home →
      ficha/modal y atrás).

## Nota de migración (contexto, no es tarea de esta fase)
- Al migrar el dominio: editar el campo dominio del **mismo** website en Umami
  (no crear uno nuevo), actualizar `data-domains` y `NEXT_PUBLIC_SITE_URL`
  (lib/seo.ts). El website ID no cambia.
- Mientras esté en Vercel, valorar redirecciones `www → apex` + forzar HTTPS en
  `next.config.ts` (`async redirects()`), independiente de los analytics.
