export interface Endpunkt {
  effekt: string | null;
  beschreibung: string | null;
}

export interface IcdCode {
  code: string;
  name: string;
}

export interface Patientengruppe {
  pat_gr_id: string;
  wirkstoff_inn: string | null;
  wirkstoff_kombination: string | null;
  datum_beschluss: string | null;
  datum_befristung_bis: string | null;
  patientengruppe: string | null;
  awg_kurz: string | null;
  icd_codes: IcdCode[] | null;
  atc_codes: string[] | null;
  pzn: string[] | null;
  zvt_best: string | null;
  zn_ausmass: string | null;
  zn_wahrscheinlichkeit: string | null;
  zn_text: string | null;
  endpunkte: {
    mortalitaet: Endpunkt | null;
    morbiditaet: Endpunkt | null;
    lebensqualitaet: Endpunkt | null;
    ue: Endpunkt | null;
  };
  quelle_url: string | null;
}

export interface Verfahren {
  id_be: string;
  id_be_akz: string;
  url: string;
  handelsname: string | null;
  pharmazeutischer_unternehmer: string | null;
  therapeutisches_gebiet_text: string | null;
  therapiegebiet: string | null;
  therapiegebiet_atc: string | null;
  orphan_drug: boolean;
  atmp: boolean;
  reg_status: string | null;
  patientengruppen: Patientengruppe[];
}

export interface AmnogData {
  schema_version: string;
  generated_at: string;
  source: string;
  count_verfahren: number;
  count_patientengruppen: number;
  verfahren: Verfahren[];
}

export interface FlatRow {
  pat_gr_id: string;
  id_be_akz: string;
  pg_index: number;
  pg_total: number;
  handelsname: string | null;
  wirkstoff_inn: string | null;
  wirkstoff_kombination: string | null;
  therapeutisches_gebiet_text: string | null;
  therapiegebiet: string | null;
  pharmazeutischer_unternehmer: string | null;
  orphan_drug: boolean;
  atmp: boolean;
  reg_status: string | null;
  datum_beschluss: string | null;
  datum_befristung_bis: string | null;
  patientengruppe: string | null;
  awg_kurz: string | null;
  icd_codes: IcdCode[] | null;
  atc_codes: string[] | null;
  pzn: string[] | null;
  zvt_best: string | null;
  zn_ausmass: string | null;
  zn_wahrscheinlichkeit: string | null;
  zn_text: string | null;
  endpunkte: {
    mortalitaet: Endpunkt | null;
    morbiditaet: Endpunkt | null;
    lebensqualitaet: Endpunkt | null;
    ue: Endpunkt | null;
  };
  quelle_url: string | null;
}
