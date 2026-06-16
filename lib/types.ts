// Normalized domain types for LaTira. The Airtable field IDs live in lib/airtable.ts.

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
}

export const ZONES = [
  "Gijón",
  "Oviedo",
  "Avilés y comarca",
  "Cuenca del Caudal",
  "Cuenca del Nalón",
  "Área central",
  "Oriente de Asturias",
  "Occidente de Asturias",
] as const;

export type Zone = (typeof ZONES)[number];

// Display label + sample municipios shown under each zone in the filter list.
export const ZONE_META: Record<Zone, { label: string; sub?: string }> = {
  Gijón: { label: "Gijón" },
  Oviedo: { label: "Oviedo" },
  "Avilés y comarca": { label: "Avilés y comarca", sub: "Castrillón, Carreño, Gozón…" },
  "Cuenca del Caudal": { label: "Cuenca del Caudal", sub: "Mieres, Aller, Lena" },
  "Cuenca del Nalón": {
    label: "Cuenca del Nalón",
    sub: "Langreo, SMRA, Laviana, Sobrescobio, Caso",
  },
  "Área central": { label: "Área central", sub: "Siero, Llanera, Piloña, Noreña…" },
  "Oriente de Asturias": {
    label: "Oriente",
    sub: "Villaviciosa, Llanes, Ribadesella…",
  },
  "Occidente de Asturias": {
    label: "Occidente",
    sub: "Navia, Valdés, Cangas del Narcea…",
  },
};

// A day's worth of events, for the grouped Home list.
export interface DayGroup {
  date: string; // YYYY-MM-DD
  events: LaEvent[];
}
