import "server-only";

// Airtable table + field IDs for base appUGxIY7mQumWqWX ("música").
export const TBL_EVENTS = "tbl0SOnnH5LykWJ36";
export const TBL_VENUES = "tblhlcTeLvaQmmZwn";

export const F = {
  // Events
  name: "fldv4ZcbgTo4roe4C",
  date: "fldRWrmAY7s8KKbCt",
  hour: "fldTYJQpZDv9Eedql",
  artists: "fld9ymmdvXMTr5pzG",
  genres: "fldQIW1LXX8pNiGQ5",
  price: "fldigWc47XIJE0g7q",
  ticketUrl: "fldTMMoistnOHH2zT",
  eventUrl: "fldam1MLV9GCo9bwo",
  location: "fldtQi1lJOUCF0C2F",
  venue: "fld5xM1fCQ2huwzYJ",
  source: "fldp1u5Tj9eXjbnN4",
  description: "fldGUrt1lB5mWZZKU",
  sample: "fldih3PqWZCOviOJe",
  // Venues
  vName: "fld6lZHiOCgEwd7c5",
  vAddress: "fldg2s3blZmn0y9ry",
  vMaps: "flde13Eqv0Sp5oA0R",
  vLocalidad: "fldkgOuu2vHaavkHC",
  vMunicipio: "fldLsaSF3dKvy1eio",
} as const;

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
}

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

/** Fetch records from a table. Server-only; caches for 5 min via revalidate. */
export async function fetchRecords(
  tableId: string,
  params: Record<string, string> = {},
): Promise<AirtableRecord[]> {
  if (!BASE_ID || !TOKEN) {
    throw new Error("Missing AIRTABLE_BASE_ID / AIRTABLE_TOKEN env vars.");
  }
  const qs = new URLSearchParams({
    returnFieldsByFieldId: "1",
    ...params,
  });
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?${qs}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { records: AirtableRecord[] };
  return data.records;
}
