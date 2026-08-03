// Shared layout constants (in px), so the sticky offsets in the home stay in
// sync across the header, the date gutter and the loading skeleton.

/** Height of the sticky home header (logo + iconos + barra azul). Diseño a
 *  sangre del SVG: 118 px de contenido + 10 px de barra azul en reposo. */
export const HEADER_H = 128;

/** Extra height added by the active-filters chip row under the header. */
export const FILTER_ROW_H = 56;

/** Sticky offset for the date gutter when the filter chip row is visible. */
export const HEADER_WITH_FILTERS = HEADER_H + FILTER_ROW_H;
