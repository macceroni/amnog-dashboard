import { loadAmnogData } from "@/lib/amnog";
import type { FlatRow } from "@/types/amnog";
import DashboardShell from "./components/DashboardShell";

export default function Home() {
  const data = loadAmnogData();

  const dateStr = data.generated_at.slice(0, 10);

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
      awg_beschluss: p.awg_beschluss,
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
        Datenstand: {dateStr} · Quelle: {data.source}
      </p>

      <section className="mb-8 border border-zinc-200 rounded-xl bg-zinc-50 p-5">
        <h2 className="text-sm font-semibold text-zinc-700 mb-1">Daten herunterladen</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Alle Beschlussdaten stehen zur freien Weiterverwendung bereit (amtliche Werke,{" "}
          §&nbsp;5 UrhG).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/amnog_web.json"
            download={`amnog_web_${dateStr}.json`}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 transition-colors"
          >
            <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-zinc-800 text-white">
              JSON
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900">amnog_web.json</p>
              <p className="text-xs text-zinc-500 mt-0.5">~7,8 MB · vollständig, verschachtelt</p>
              <p className="text-xs text-zinc-400 mt-1">Für Entwickler, APIs, eigene Auswertungen</p>
            </div>
          </a>
          <a
            href="/amnog_flat.csv"
            download={`amnog_flat_${dateStr}.csv`}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 transition-colors"
          >
            <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-emerald-700 text-white">
              CSV
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900">amnog_flat.csv</p>
              <p className="text-xs text-zinc-500 mt-0.5">~1 MB · flach, eine Zeile pro Patientengruppe</p>
              <p className="text-xs text-zinc-400 mt-1">Für R, Excel, Statistik-Tools</p>
            </div>
          </a>
        </div>
      </section>

      <DashboardShell rows={rows} />

      <footer className="mt-12 border-t border-zinc-200 pt-8 pb-6 text-xs text-zinc-500 space-y-3">
        <p>
          <span className="font-semibold text-zinc-600">Keine medizinische Beratung.</span>{" "}
          Dieses Dashboard dient der Datenrecherche und stellt keine medizinische oder
          therapeutische Beratung dar.
        </p>
        <p>
          <span className="font-semibold text-zinc-600">Nicht die Erstattungspreise.</span>{" "}
          Gezeigt wird die gesetzliche frühe Nutzenbewertung nach §&nbsp;35a SGB V — nicht die
          im Anschluss daran verhandelten Erstattungsbeträge.
        </p>
        <p>
          <span className="font-semibold text-zinc-600">Inoffizielle Aufbereitung.</span>{" "}
          Dieses Projekt hat keine Verbindung zum Gemeinsamen Bundesausschuss (G-BA). Maßgeblich
          sind stets die Originalbeschlüsse auf{" "}
          <a
            href="https://www.g-ba.de"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-700"
          >
            g-ba.de
          </a>{" "}
          — jede Tabellenzeile enthält einen Direktlink zur Quelle.
        </p>
        <p>
          <span className="font-semibold text-zinc-600">Datenherkunft.</span>{" "}
          Die Beschlussdaten sind amtliche Werke im Sinne von §&nbsp;5 UrhG und unterliegen
          keinem Urheberrechtsschutz. Quelle: Gemeinsamer Bundesausschuss (G-BA). Datenstand:
          {dateStr}. Kein automatisches Update.
        </p>
        <p>
          Quellcode:{" "}
          <a
            href="https://github.com/macceroni/amnog-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-700"
          >
            github.com/macceroni/amnog-dashboard
          </a>
        </p>
      </footer>
    </main>
  );
}
