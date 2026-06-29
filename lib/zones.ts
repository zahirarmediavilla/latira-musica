import type { LaEvent, Zone } from "./types";
import { norm } from "./text";

// Zone -> municipios that belong to it (spec section 5).
const ZONE_MUNICIPIOS: Record<Zone, string[]> = {
  Oviedo: ["Oviedo"],
  Gijón: ["Gijón"],
  "Avilés y comarca": [
    "Avilés",
    "Castrillón",
    "Corvera de Asturias",
    "Corvera",
    "Gozón",
    "Illas",
  ],
  "Cuenca del Caudal": ["Aller", "Lena", "Mieres", "Morcín", "Riosa"],
  "Cuenca del Nalón": [
    "Langreo",
    "San Martín del Rey Aurelio",
    "Laviana",
    "Sobrescobio",
    "Caso",
  ],
  "Área central": [
    "Llanera",
    "Las Regueras",
    "Noreña",
    "Siero",
    "Sariego",
    "Carreño",
    "Ribera de Arriba",
    "Proaza",
    "Santo Adriano",
    "Quirós",
    "Teverga",
    "Nava",
    "Bimenes",
  ],
  "Oriente de Asturias": [
    "Villaviciosa",
    "Colunga",
    "Caravia",
    "Ribadesella",
    "Llanes",
    "Ribadedeva",
    "Peñamellera Baja",
    "Peñamellera Alta",
    "Cabrales",
    "Onís",
    "Cangas de Onís",
    "Amieva",
    "Ponga",
    "Parres",
    "Piloña",
    "Cabranes",
  ],
  "Occidente de Asturias": [
    "Pravia",
    "Muros de Nalón",
    "Soto del Barco",
    "Cudillero",
    "Salas",
    "Valdés",
    "Tineo",
    "Cangas del Narcea",
    "Degaña",
    "Ibias",
    "Allande",
    "Belmonte de Miranda",
    "Somiedo",
    "Grado",
    "Candamo",
    "Yernes y Tameza",
    "Navia",
    "Coaña",
    "Villayón",
    "El Franco",
    "Tapia de Casariego",
    "Castropol",
    "Vegadeo",
    "Taramundi",
    "San Tirso de Abres",
    "Santa Eulalia de Oscos",
    "San Martín de Oscos",
    "Villanueva de Oscos",
    "Boal",
    "Pesoz",
    "Grandas de Salime",
    "Illano",
  ],
};

// Build a normalized name -> zone lookup, plus aliases for the values that
// actually appear in the Events.Location / Venues.Municipio single-selects.
const NAME_TO_ZONE = new Map<string, Zone>();
for (const [zone, municipios] of Object.entries(ZONE_MUNICIPIOS) as [Zone, string[]][]) {
  for (const m of municipios) NAME_TO_ZONE.set(norm(m), zone);
}
// Aliases seen in the data (abbreviations / accent-less spellings).
NAME_TO_ZONE.set(norm("Aviles"), "Avilés y comarca");
NAME_TO_ZONE.set(norm("SMRA"), "Cuenca del Nalón"); // San Martín del Rey Aurelio
NAME_TO_ZONE.set(norm("Sama"), "Cuenca del Nalón"); // Sama de Langreo
NAME_TO_ZONE.set(norm("La Felguera"), "Cuenca del Nalón");
NAME_TO_ZONE.set(norm("Pola de Siero"), "Área central");

export function zoneForName(name: string | undefined | null): Zone | null {
  if (!name) return null;
  return NAME_TO_ZONE.get(norm(name)) ?? null;
}

// Resolve an event's zone: prefer the linked venue's municipio, fall back to
// the event's Location, then the venue's locality.
export function zoneForEvent(ev: LaEvent): Zone | null {
  return (
    zoneForName(ev.venue?.municipio) ??
    zoneForName(ev.location) ??
    zoneForName(ev.venue?.localidad)
  );
}
