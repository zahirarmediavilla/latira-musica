// Normalized domain types for LaTira. Data is read from Supabase in lib/events.ts.

export interface Venue {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
  municipio: string;
  localidad: string;
}

export interface LaEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  hour: string; // "HH:MM", or "" when unknown
  doorsTime: string; // apertura de puertas "HH:MM", or "" when unknown
  artists: string; // raw text (comma/newline separated)
  genres: string[];
  price: string;
  free: boolean;
  ticketUrl: string;
  eventUrl: string;
  location: string;
  venue: Venue | null;
  description: string;
  sampleUrl: string;
  createdAt: string; // ISO timestamp the event was added (for sitemap lastmod)
}

export const ZONES = [
  "Gijón",
  "Oviedo",
  "Avilés y comarca",
  "Cuenca del Caudal",
  "Cuenca del Nalón",
  "Área central",
  "Montaña central",
  "Oriente de Asturias",
  "Occidente de Asturias",
] as const;

export type Zone = (typeof ZONES)[number];

// Display label + sample municipios + short chip label. `chip` is the short
// name shown in the filter chips (falls back to `label`); the internal Zone
// value is unchanged, so zone→municipio matching keeps working.
export const ZONE_META: Record<Zone, { label: string; sub?: string; chip?: string }> = {
  Gijón: { label: "Gijón" },
  Oviedo: { label: "Oviedo" },
  "Avilés y comarca": { label: "Avilés y comarca", sub: "Castrillón, Carreño, Gozón…" },
  "Cuenca del Caudal": { label: "Cuenca del Caudal", sub: "Mieres, Aller, Lena", chip: "Caudal" },
  "Cuenca del Nalón": {
    label: "Cuenca del Nalón",
    sub: "Langreo, SMRA, Laviana, Sobrescobio, Caso",
    chip: "Nalón",
  },
  "Área central": { label: "Área central", sub: "Siero, Llanera, Noreña…", chip: "Centro" },
  "Montaña central": {
    label: "Montaña central",
    sub: "Quirós, Teverga, Riosa, Morcín…",
  },
  "Oriente de Asturias": {
    label: "Oriente",
    sub: "Villaviciosa, Llanes, Ribadesella…",
  },
  "Occidente de Asturias": {
    label: "Occidente",
    sub: "Navia, Valdés, Cangas del Narcea…",
  },
};

/** Short label shown in a zone filter chip / removable tag. */
export function zoneChipLabel(z: Zone): string {
  const m = ZONE_META[z];
  return m.chip ?? m.label;
}

// A day's worth of events, for the grouped Home list.
export interface DayGroup {
  date: string; // YYYY-MM-DD
  events: LaEvent[];
}
