import { loadAmnogData } from "@/lib/amnog";
import type { FlatRow } from "@/types/amnog";
import DashboardShell from "./components/DashboardShell";

export default function Home() {
  const data = loadAmnogData();

  const rows: FlatRow[] = data.verfahren.flatMap((v) =>
    v.patientengruppen.map((p, idx) => ({
      pat_gr_id: p.pat_gr_id,
      id_be_akz: v.id_be_akz,
      pg_index: idx + 1,
      pg_total: v.patientengruppen.length,
      handelsname: v.handelsname,
      wirkstoff_inn: p.wirkstoff_inn,
      wirkstoff_kombination: p.wirkstoff_kombination,
      therapeutisches_gebiet_text: v.therapeutisches_gebiet_text,
      therapiegebiet: v.therapiegebiet,
      pharmazeutischer_unternehmer: v.pharmazeutischer_unternehmer,
      orphan_drug: v.orphan_drug,
      atmp: v.atmp,
      reg_status: v.reg_status,
      datum_beschluss: p.datum_beschluss,
      datum_befristung_bis: p.datum_befristung_bis,
      patientengruppe: p.patientengruppe,
      awg_kurz: p.awg_kurz,
      icd_codes: p.icd_codes,
      atc_codes: p.atc_codes,
      pzn: p.pzn,
      zvt_best: p.zvt_best,
      zn_ausmass: p.zn_ausmass,
      zn_wahrscheinlichkeit: p.zn_wahrscheinlichkeit,
      zn_text: p.zn_text,
      endpunkte: p.endpunkte,
      quelle_url: p.quelle_url,
    }))
  );

  return (
    <main className="min-h-screen bg-white px-8 py-10 font-sans">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
        AMNOG Dashboard
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        Datenstand: {data.generated_at.slice(0, 10)} · Quelle: {data.source}
      </p>
      <DashboardShell rows={rows} />
    </main>
  );
}
