// Shared layout constants (in px), so the sticky offsets in the home stay in
// sync across the header, the date gutter and the loading skeleton.

/** Height of the sticky home header (logo + iconos + barra azul). Diseño a
 *  sangre del SVG: 118 px de contenido + 10 px de barra azul en reposo. */
export const HEADER_H = 128;

/** Extra height added by the active-filters chip row under the header. */
export const FILTER_ROW_H = 56;

/** Sticky offset for the date gutter when the filter chip row is visible. */
export const HEADER_WITH_FILTERS = HEADER_H + FILTER_ROW_H;

/** Extra height the blue results bar adds while searching: it grows from its
 *  10px resting height (already counted in HEADER_H) up to 2.25rem (36px). */
export const SEARCH_BAR_EXTRA = 26;

/** Sticky offset for the date gutter while a search is active, so the day
 *  numbers pin just under the taller results bar instead of sliding beneath it. */
export const HEADER_WITH_SEARCH = HEADER_H + SEARCH_BAR_EXTRA;
