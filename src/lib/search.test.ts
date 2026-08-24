import { describe, expect, it } from "vitest";
import { matchingFields, matchLevel, rowMatchesSearch } from "./search";
import type { FlatRow } from "@/types/amnog";

function makeRow(overrides: Partial<FlatRow> = {}): FlatRow {
  return {
    pat_gr_id: "pg-1",
    id_be_akz: "verfahren-1",
    pg_index: 1,
    pg_total: 1,
    handelsname: "Testarin",
    wirkstoff_inn: "teststoffin",
    wirkstoff_kombination: null,
    therapeutisches_gebiet_text: null,
    therapiegebiet: null,
    pharmazeutischer_unternehmer: "Testpharma GmbH",
    orphan_drug: false,
    atmp: false,
    reg_status: null,
    datum_beschluss: null,
    datum_befristung_bis: null,
    patientengruppe: null,
    awg_kurz: "wird zu einem späteren Zeitpunkt ausgewiesen",
    awg_beschluss: null,
    icd_codes: null,
    atc_codes: null,
    pzn: null,
    zvt_best: null,
    zn_ausmass: null,
    zn_wahrscheinlichkeit: null,
    zn_text: null,
    endpunkte: { mortalitaet: null, morbiditaet: null, lebensqualitaet: null, ue: null },
    quelle_url: null,
    ...overrides,
  };
}

describe("rowMatchesSearch / matchingFields", () => {
  it("findet Treffer auf PG-Ebene (patientengruppe)", () => {
    const row = makeRow({ patientengruppe: "Erwachsene mit Lupus erythematodes" });
    expect(rowMatchesSearch(row, "Lupus")).toBe(true);
    expect(matchingFields(row, "Lupus")).toEqual(["patientengruppe"]);
  });

  it("findet Treffer in awg_beschluss", () => {
    const row = makeRow({ awg_beschluss: "Behandlung des metastasierten Prostatakarzinom" });
    expect(rowMatchesSearch(row, "Prostatakarzinom")).toBe(true);
  });

  it("findet Treffer in ICD-Namen", () => {
    const row = makeRow({ icd_codes: [{ code: "M32", name: "Systemischer Lupus erythematodes" }] });
    expect(rowMatchesSearch(row, "Lupus")).toBe(true);
    expect(matchingFields(row, "Lupus")).toEqual(["icd_codes"]);
  });

  it("durchsucht awg_kurz nicht", () => {
    const row = makeRow({ awg_kurz: "wird zu einem späteren Zeitpunkt ausgewiesen" });
    expect(rowMatchesSearch(row, "ausgewiesen")).toBe(false);
  });

  it("Wortanfang genuegt: 'Lupus' trifft das Kompositum 'Lupusnephritis'", () => {
    const row = makeRow({ patientengruppe: "Erwachsene mit aktiver Lupusnephritis" });
    expect(rowMatchesSearch(row, "Lupus")).toBe(true);
  });

  it("Wortanfang genuegt: 'Mamma' trifft 'Mammakarzinom'", () => {
    const row = makeRow({ therapeutisches_gebiet_text: "Mammakarzinom (onkologische Erkrankungen)" });
    expect(rowMatchesSearch(row, "Mamma")).toBe(true);
  });

  it("aber nicht mitten im Wort: 'karzinom' trifft nicht in 'Plattenepithelkarzinom'", () => {
    const row = makeRow({ therapeutisches_gebiet_text: "Plattenepithelkarzinom" });
    expect(rowMatchesSearch(row, "karzinom")).toBe(false);
  });

  it("Kompromiss bewusst in Kauf genommen: 'ALL' trifft jetzt auch 'alle'", () => {
    const row = makeRow({ patientengruppe: "Alle Altersgruppen" });
    expect(rowMatchesSearch(row, "ALL")).toBe(true);
  });

  it("'ALL' trifft weiterhin das eigenstaendige Wort ALL", () => {
    const row = makeRow({ patientengruppe: "Patienten mit ALL (akute lymphatische Leukämie)" });
    expect(rowMatchesSearch(row, "ALL")).toBe(true);
  });

  it("ist case-insensitiv", () => {
    const row = makeRow({ therapeutisches_gebiet_text: "Diabetes mellitus" });
    expect(rowMatchesSearch(row, "diabetes")).toBe(true);
  });

  it("sucht auf Rohwerten, nicht auf angezeigten Werten", () => {
    const row = makeRow({ therapeutisches_gebiet_text: "diabetes mellitus (Erwachsene)" });
    // Rohwert beginnt klein; capitalizeFirst() wuerde das in der Anzeige aendern,
    // die Suche muss trotzdem auf dem Rohwert treffen.
    expect(rowMatchesSearch(row, "diabetes")).toBe(true);
  });
});

describe("matchLevel", () => {
  it("PG-Feld hat Vorrang vor Verfahrens-Feld", () => {
    const level = matchLevel(["therapeutisches_gebiet_text", "patientengruppe"]);
    expect(level).toBe("pg");
  });

  it("ausschliesslich Verfahrens-Felder ergibt 'verfahren'", () => {
    const level = matchLevel(["handelsname", "therapeutisches_gebiet_text"]);
    expect(level).toBe("verfahren");
  });

  it("keine Treffer ergibt 'none'", () => {
    expect(matchLevel([])).toBe("none");
  });
});

describe("PG-Zaehler pro Verfahren (Simulation)", () => {
  it("zaehlt PG-eigene Treffer korrekt bei mehreren Patientengruppen desselben Verfahrens", () => {
    const rows = [
      makeRow({ pat_gr_id: "pg-1", id_be_akz: "v-1", patientengruppe: "Lupus Erwachsene" }),
      makeRow({ pat_gr_id: "pg-2", id_be_akz: "v-1", patientengruppe: "Kinder ohne Bezug" }),
      makeRow({ pat_gr_id: "pg-3", id_be_akz: "v-1", patientengruppe: "Jugendliche ohne Bezug" }),
      makeRow({ pat_gr_id: "pg-4", id_be_akz: "v-1", patientengruppe: "Sonderfall ohne Bezug" }),
    ];
    const term = "Lupus";
    const byVerfahren = new Map<string, { total: number; pgMatches: number }>();
    for (const r of rows) {
      const level = matchLevel(matchingFields(r, term));
      if (!byVerfahren.has(r.id_be_akz)) byVerfahren.set(r.id_be_akz, { total: 0, pgMatches: 0 });
      const g = byVerfahren.get(r.id_be_akz)!;
      g.total += 1;
      if (level === "pg") g.pgMatches += 1;
    }
    expect(byVerfahren.get("v-1")).toEqual({ total: 4, pgMatches: 1 });
  });
});
