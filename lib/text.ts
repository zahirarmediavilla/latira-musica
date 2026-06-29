// Shared text helpers.

/** Lowercase + strip accents (NFD combining marks) + trim, for
 *  accent-insensitive comparison and search. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .trim();
}
