// Shared layout constants (in px), so the sticky offsets in the home stay in
// sync across the header, the date gutter and the loading skeleton.

/** Height of the sticky home header (logo + search + blue bar). */
export const HEADER_H = 161;

/** Extra height added by the active-filters chip row under the header. */
export const FILTER_ROW_H = 54;

/** Sticky offset for the date gutter when the filter chip row is visible. */
export const HEADER_WITH_FILTERS = HEADER_H + FILTER_ROW_H;
