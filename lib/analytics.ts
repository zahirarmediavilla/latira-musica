// Punto único de analytics (Umami). Aquí viven LOS NOMBRES de evento y un
// `track()` tipado que NO hace nada si Umami no está cargado (en local, o antes
// de que el script cargue). Así ningún sitio escribe el nombre a mano y no se
// parte una métrica en dos por una errata. Catálogo completo en
// ANALYTICS-KICKOFF.md.
//
// Umami asocia cada evento a la URL actual automáticamente, así que no hace
// falta pasar la ruta como dato.

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

export const AnalyticsEvent = {
  verFichaEvento: "ver-ficha-evento",
  clicComprarEntrada: "clic-comprar-entrada",
  clicAnadirCalendario: "clic-anadir-calendario",
  clicCompartir: "clic-compartir",
  clicUbicacionMapa: "clic-ubicacion-mapa",
  clicVistoEn: "clic-visto-en",
  clicVerVideoAudio: "clic-ver-video-audio",
  buscar: "buscar",
  busquedaSinResultados: "busqueda-sin-resultados",
  abrirFiltros: "abrir-filtros",
  aplicarFiltros: "aplicar-filtros",
  usarFiltro: "usar-filtro",
  quitarFiltro: "quitar-filtro",
  quitarTodosFiltros: "quitar-todos-filtros",
  filtrosSinResultados: "filtros-sin-resultados",
  abrirMenu: "abrir-menu",
  clicContactoEmail: "clic-contacto-email",
  paginaNoEncontrada: "pagina-no-encontrada",
  errorApp: "error-app",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** Envía un evento a Umami. No-op si Umami no está disponible. */
export function track(
  event: AnalyticsEventName,
  data?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  window.umami?.track(event, data);
}
