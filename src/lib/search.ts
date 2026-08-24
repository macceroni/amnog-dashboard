import type { FlatRow } from "@/types/amnog";

export type MatchField =
  | "handelsname"
  | "wirkstoff_inn"
  | "pharmazeutischer_unternehmer"
  | "therapeutisches_gebiet_text"
  | "patientengruppe"
  | "awg_beschluss"
  | "icd_codes";

// wirkstoff_inn liegt schema-technisch auf PG-Ebene, ist aber im Datensatz
// nie unterschiedlich zwischen PGs desselben Verfahrens (geprueft) —
// daher hier wie ein Verfahrens-Feld behandelt.
const VERFAHREN_FIELDS: readonly MatchField[] = [
  "handelsname",
  "wirkstoff_inn",
  "pharmazeutischer_unternehmer",
  "therapeutisches_gebiet_text",
];

const PG_FIELDS: readonly MatchField[] = ["patientengruppe", "awg_beschluss", "icd_codes"];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Nur der Wortanfang muss auf einer Grenze liegen, das Wortende nicht:
// deutsche Komposita sind der Normalfall ("Lupusnephritis", "Mammakarzinom"),
// nicht die Ausnahme. Preis: "ALL" trifft auch "alle" — bewusst in Kauf
// genommen, Komposita sind haeufiger als Drei-Buchstaben-Abkuerzungen.
function buildWordBoundaryRegex(term: string): RegExp {
  const escaped = escapeRegExp(term);
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}`, "iu");
}

function fieldMatches(value: string | null, regex: RegExp): boolean {
  return value !== null && regex.test(value);
}

/** Liefert alle Felder, in denen der Suchbegriff (mit Wortgrenzen) auf Rohwerten trifft. */
export function matchingFields(row: FlatRow, term: string): MatchField[] {
  const trimmed = term.trim();
  if (!trimmed) return [];
  const regex = buildWordBoundaryRegex(trimmed);

  const hits: MatchField[] = [];
  if (fieldMatches(row.handelsname, regex)) hits.push("handelsname");
  if (fieldMatches(row.wirkstoff_inn, regex)) hits.push("wirkstoff_inn");
  if (fieldMatches(row.pharmazeutischer_unternehmer, regex)) hits.push("pharmazeutischer_unternehmer");
  if (fieldMatches(row.therapeutisches_gebiet_text, regex)) hits.push("therapeutisches_gebiet_text");
  if (fieldMatches(row.patientengruppe, regex)) hits.push("patientengruppe");
  if (fieldMatches(row.awg_beschluss, regex)) hits.push("awg_beschluss");
  if ((row.icd_codes ?? []).some((c) => regex.test(c.name))) hits.push("icd_codes");
  return hits;
}

export function rowMatchesSearch(row: FlatRow, term: string): boolean {
  return matchingFields(row, term).length > 0;
}

export type MatchLevel = "pg" | "verfahren" | "none";

/** Ob der Treffer (auch) auf PG-eigenen Feldern sitzt, oder ausschliesslich auf Verfahrens-Feldern. */
export function matchLevel(fields: MatchField[]): MatchLevel {
  if (fields.length === 0) return "none";
  if (fields.some((f) => PG_FIELDS.includes(f))) return "pg";
  if (fields.every((f) => VERFAHREN_FIELDS.includes(f))) return "verfahren";
  return "pg";
}
