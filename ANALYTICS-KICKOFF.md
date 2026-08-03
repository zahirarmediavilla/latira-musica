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

- **Umami Cloud** (plan gratuito, región EU). **Fase actual.**
- Se podría autoalojar en el futuro (Node + Postgres) si hiciera falta; sería
  solo cambiar `NEXT_PUBLIC_UMAMI_SRC` y el website ID.

## Dominio (decidido)
- La web **se queda alojada en Vercel** (no hace falta hosting propio; Vercel es
  de los creadores de Next.js). Lo único que cambia es la dirección: se apunta el
  dominio propio **`latira.org` (apex, canónico)** al proyecto de Vercel.
- Los datos de Umami se identifican por el **WEBSITE ID**, no por el dominio.
  Usar **UN solo website** en Umami y **conservar su ID** si algún día cambia el
  dominio. Solo se edita el **campo dominio** del sitio en el panel de Umami;
  **nunca se crea un website nuevo** (se perdería el histórico).
- `data-domains` se deja **sin poner**, así que Umami mide en cualquier host
  (conviven el `.vercel.app` y `latira.org` sin problema).

Ver el paso a paso al final: **Runbook: migración de dominio a latira.org**.

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

---

## Runbook: migración de dominio a latira.org

La web **se queda en Vercel**. Solo se apunta el dominio propio. Dominio
canónico elegido: **`latira.org` (apex)**; `www.latira.org` redirige a él.

El código ya está preparado: la base URL es una única variable
(`NEXT_PUBLIC_SITE_URL`, ver `lib/seo.ts`) y no hay nada atado a un dominio en
`next.config.ts`. Vercel se encarga de HTTPS y de la redirección www↔apex.

### 1. Vercel — añadir el dominio (panel)
- Project → **Settings → Domains** → añadir `latira.org` y `www.latira.org`.
- Marcar **`latira.org` como principal** (Vercel configurará `www` → apex, 308).

### 2. DNS — en el registrador de latira.org (panel)
Copiar los registros **exactos** que muestre Vercel. Normalmente:
- **apex `latira.org`**: registro **A → `76.76.21.21`** (IP anycast de Vercel).
- **`www`**: registro **CNAME → `cname.vercel-dns.com`**.
- Esperar propagación DNS; Vercel emite el **SSL** solo.

### 3. Env — base URL del sitio (Vercel, Production)
- Añadir `NEXT_PUBLIC_SITE_URL=https://latira.org`.
- **Redeploy** (los cambios de env solo aplican en un despliegue nuevo).
- Con esto se activan canonical, sitemap, robots y og:url apuntando al dominio
  real (hoy, sin esa variable, no se emiten).

### 4. Analytics (Umami)
- No hay cambios de código: `data-domains` está sin poner, mide en cualquier host.
- En el panel de Umami, editar el **campo dominio** del sitio a `latira.org`
  (mismo **website ID**, no crear uno nuevo).

### 5. Comprobar
- [ ] `https://latira.org` carga la web con candado (HTTPS).
- [ ] `https://www.latira.org` redirige a `https://latira.org`.
- [ ] `https://latira.org/robots.txt` y `/sitemap.xml` traen URLs con el dominio nuevo.
- [ ] (Cuando Umami esté activo) las visitas siguen entrando en el mismo website.

### Notas
- El dominio viejo `*.vercel.app` **sigue vivo** en paralelo; Vercel no lo
  redirige solo. Se puede dejar así.
- No hace falta tocar `next.config.ts`: Vercel cubre HTTPS y www↔apex.
