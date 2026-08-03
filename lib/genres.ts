import type { LaEvent } from "./types";

// Agrupación de géneros para el filtro. Cada chip agrupa varias etiquetas
// canónicas (el vocabulario que produce el scraper, ver normalize.py). Un evento
// pertenece a un grupo si alguno de sus `genres` está en la lista del grupo.
//
// "En familia" NO es un grupo de géneros: es un chip especial (ver FAMILY /
// isFamilyFriendly) que recoge lo etiquetado como "Infantil" más cualquier
// evento que empiece antes de las 20:00.

export interface GenreGroup {
  label: string;
  genres: string[];
}

export const GENRE_GROUPS: GenreGroup[] = [
  {
    label: "Rock",
    genres: [
      "Rock",
      "Punk",
      "Hardcore",
      "Metal",
      "Garage",
      "Rock & Roll",
      "Psicodelia",
      "Post-rock",
      "Experimental",
      "Surf",
    ],
  },
  { label: "Pop e indie", genres: ["Pop", "Power pop", "Indie"] },
  { label: "Electrónica", genres: ["DJ Set", "Techno", "Electrónica"] },
  { label: "Urbano", genres: ["Hip-hop", "Reggaeton", "R&B"] },
  { label: "Jazz, soul y blues", genres: ["Jazz", "Swing", "Blues", "Soul", "Funk"] },
  {
    label: "Folk y tradicional",
    genres: [
      "Folk",
      "Folk asturiano",
      "Folk tradicional",
      "Canción asturiana",
      "Cantautor",
      "Country",
    ],
  },
  {
    label: "Clásica y lírica",
    genres: [
      "Música clásica",
      "Ópera",
      "Zarzuela",
      "Música coral",
      "Gospel",
      "Música antigua",
      "Banda de música",
    ],
  },
  { label: "Verbena y baile", genres: ["Verbena", "Versiones", "Copla", "Ranchera"] },
  { label: "Flamenco y latino", genres: ["Flamenco", "Cumbia", "Son cubano", "Bolero", "Reggae", "Ska"] },
];

// Chip especial. Se coloca el primero en el filtro de géneros.
export const FAMILY = "En familia";

// Orden de los chips de género en el overlay: "En familia" primero.
export const GENRE_CHIPS: string[] = [FAMILY, ...GENRE_GROUPS.map((g) => g.label)];

const GROUP_SET = new Map<string, Set<string>>(
  GENRE_GROUPS.map((g) => [g.label, new Set(g.genres)]),
);

/** Un evento es "en familia" si es Infantil o empieza antes de las 19:00.
 *  Los eventos sin hora conocida (hour === "") quedan fuera salvo que sean
 *  Infantil: sin hora no podemos prometer que sea pronto. */
export function isFamilyFriendly(ev: LaEvent): boolean {
  if (ev.genres.includes("Infantil")) return true;
  return ev.hour !== "" && ev.hour < "19:00";
}

/** Filtro por género (unión dentro de la sección): sin selección pasa todo;
 *  con selección, el evento debe encajar en AL MENOS un chip elegido. */
export function eventMatchesGenres(ev: LaEvent, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((sel) => {
    if (sel === FAMILY) return isFamilyFriendly(ev);
    const set = GROUP_SET.get(sel);
    return set ? ev.genres.some((g) => set.has(g)) : false;
  });
}
