"use client";

import { useEffect, useState } from "react";
import type { FlatRow } from "@/types/amnog";
import { AUSMASS_BADGE } from "@/lib/colors";
import { cleanPU } from "@/lib/format";

function val(v: string | null): string {
  return v === null ? "—" : v;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ausmassClass(ausmass: string | null): string {
  if (!ausmass) return "bg-zinc-100 text-zinc-500";
  return AUSMASS_BADGE[ausmass] ?? "bg-zinc-100 text-zinc-700";
}

const REG_STATUS_LABEL: Record<string, string> = {
  Beschluss_reg: "Reguläre Bewertung",
  Beschluss_orph: "Orphan Drug",
  Beschluss_antib: "Reserveantibiotikum",
};

const AUSMASS_TOOLTIP: Record<string, string> = {
  "Gilt als belegt (Orphan)":
    "Orphan Drugs gelten nach §35a SGB V als mit Zusatznutzen belegt, solange der GKV-Umsatz 30 Mio. € pro Jahr nicht übersteigt.",
  "Gilt als belegt (Antibiotikum)":
    "Reserveantibiotika gelten nach §35a SGB V als mit Zusatznutzen belegt (Sonderweg für Reserveantibiotika).",
};

const ENDPUNKT_LABELS: [keyof FlatRow["endpunkte"], string][] = [
  ["mortalitaet", "Mortalität"],
  ["morbiditaet", "Morbidität"],
  ["lebensqualitaet", "Lebensqualität"],
  ["ue", "Nebenwirkungen (UE)"],
];

const ZVT_COLLAPSE_THRESHOLD = 300;

function ZvtText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= ZVT_COLLAPSE_THRESHOLD) {
    return <p className="text-zinc-700 whitespace-pre-line leading-relaxed">{text}</p>;
  }

  const lines = text.split("\n");
  const preview = lines.slice(0, 3).join("\n");
  const optionCount = lines.filter((l) => l.startsWith("- ")).length;
  const expandLabel =
    optionCount >= 2 ? `Alle ${optionCount} Optionen anzeigen` : "Vollständigen Text anzeigen";

  return (
    <div>
      {expanded ? (
        <p className="text-zinc-700 whitespace-pre-line leading-relaxed">{text}</p>
      ) : (
        <p className="text-zinc-700 whitespace-pre-line leading-relaxed">{preview}…</p>
      )}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-1 text-xs text-blue-600 hover:underline"
      >
        {expanded ? "Weniger anzeigen" : expandLabel}
      </button>
    </div>
  );
}

export default function DetailPanel({
  row,
  onClose,
}: {
  row: FlatRow;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const regLabel = row.reg_status
    ? (REG_STATUS_LABEL[row.reg_status] ?? row.reg_status)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-label="Schließen"
      />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {val(row.handelsname)}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {val(row.wirkstoff_inn)}
              {row.wirkstoff_kombination ? ` / ${row.wirkstoff_kombination}` : ""}
            </p>
            <p className="text-sm text-zinc-400 mt-0.5">{cleanPU(row.pharmazeutischer_unternehmer)}</p>
            <p className="text-xs font-mono text-zinc-400 mt-1">{row.id_be_akz}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-zinc-400 hover:text-zinc-700 text-xl leading-none mt-0.5"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {row.therapiegebiet && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                {row.therapiegebiet}
              </span>
            )}
            {row.orphan_drug && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Orphan Drug
              </span>
            )}
            {row.atmp && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ATMP
              </span>
            )}
            {regLabel && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                {regLabel}
              </span>
            )}
          </div>

          {/* Zusatznutzen */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Zusatznutzen
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className={`px-2.5 py-1 rounded-md font-medium text-xs ${ausmassClass(row.zn_ausmass)}`}
                title={AUSMASS_TOOLTIP[row.zn_ausmass ?? ""] ?? undefined}
              >
                Ausmaß: {val(row.zn_ausmass)}
              </span>
              <span className="px-2.5 py-1 rounded-md font-medium text-xs bg-zinc-100 text-zinc-700">
                Wahrscheinlichkeit: {val(row.zn_wahrscheinlichkeit)}
              </span>
            </div>
            {row.zn_text && (
              <p className="text-zinc-600 leading-relaxed">{row.zn_text}</p>
            )}
          </section>

          {/* Endpunkte */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Endpunkte
            </h3>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {ENDPUNKT_LABELS.map(([key, label]) => {
                  const ep = row.endpunkte[key];
                  return (
                    <tr key={key} className="border-b border-zinc-100 last:border-0">
                      <td className="py-1.5 pr-3 text-zinc-500 whitespace-nowrap w-36">
                        {label}
                      </td>
                      <td className="py-1.5 pr-3 font-mono text-base w-10">
                        {ep?.effekt ?? "—"}
                      </td>
                      <td className="py-1.5 text-zinc-700">
                        {ep?.beschreibung ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Patientengruppe & Indikation */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Patientengruppe & Indikation
            </h3>
            <dl className="space-y-1.5">
              <Row label="Patientengruppe" value={val(row.patientengruppe)} />
              <Row label="Anwendungsgebiet" value={val(row.awg_kurz)} />
              <Row label="Indikation (präzise)" value={val(row.therapeutisches_gebiet_text)} />
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-36 shrink-0">ZVT</dt>
                <dd className="text-zinc-700 flex-1">
                  {row.zvt_best ? <ZvtText text={row.zvt_best} /> : "—"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Codes */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Codes
            </h3>
            <dl className="space-y-1.5">
              <dt className="text-zinc-500">ICD-10</dt>
              <dd className="text-zinc-700">
                {(row.icd_codes ?? []).length === 0
                  ? "—"
                  : (row.icd_codes ?? []).map((c) => (
                      <span key={c.code} className="mr-2">
                        <span className="font-mono">{c.code}</span>{" "}
                        <span className="text-zinc-500">{c.name}</span>
                      </span>
                    ))}
              </dd>
              <Row
                label="ATC"
                value={(row.atc_codes ?? []).length === 0 ? "—" : (row.atc_codes ?? []).join(", ")}
              />
              <Row
                label="PZN"
                value={(row.pzn ?? []).length === 0 ? "—" : (row.pzn ?? []).join(", ")}
              />
            </dl>
          </section>

          {/* Meta */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Verfahren
            </h3>
            <dl className="space-y-1.5">
              <Row label="Unternehmen" value={cleanPU(row.pharmazeutischer_unternehmer)} />
              <Row label="Therapiegebiet" value={val(row.therapiegebiet)} />
              <Row label="Beschlussdatum" value={formatDate(row.datum_beschluss)} />
              <Row
                label="Befristet bis"
                value={formatDate(row.datum_befristung_bis)}
              />
            </dl>
          </section>

          {/* Quelle */}
          {row.quelle_url && (
            <a
              href={row.quelle_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              Quelle auf g-ba.de ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-zinc-500 w-36 shrink-0">{label}</dt>
      <dd className="text-zinc-700">{value}</dd>
    </div>
  );
}
