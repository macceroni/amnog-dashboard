"use client";

import { useMemo } from "react";
import type { FlatRow } from "@/types/amnog";
import { AUSMASS_BAR, AUSMASS_ORDER } from "@/lib/colors";

type Props = {
  rows: FlatRow[];
  selectedGebiete: Set<string>;
  selectedAusmass: Set<string>;
  onGebieteChange: (next: Set<string>) => void;
  onAusmassChange: (next: Set<string>) => void;
};

export default function Charts({ rows, selectedGebiete, selectedAusmass, onGebieteChange, onAusmassChange }: Props) {
  // Hero: gefiltert nach selectedGebiete UND selectedAusmass, gruppiert nach Jahr × zn_ausmass
  const heroData = useMemo(() => {
    const src = rows.filter((r) => {
      if (selectedGebiete.size > 0 && !selectedGebiete.has(r.therapiegebiet ?? "")) return false;
      if (selectedAusmass.size > 0 && !selectedAusmass.has(r.zn_ausmass ?? "")) return false;
      return true;
    });

    const byYear = new Map<string, Map<string, number>>();
    for (const r of src) {
      if (!r.datum_beschluss) continue;
      const year = r.datum_beschluss.slice(0, 4);
      const ausmass = r.zn_ausmass ?? "—";
      if (!byYear.has(year)) byYear.set(year, new Map());
      const ym = byYear.get(year)!;
      ym.set(ausmass, (ym.get(ausmass) ?? 0) + 1);
    }

    const years = [...byYear.keys()].sort();
    const maxTotal = years.reduce((mx, y) => {
      const total = [...byYear.get(y)!.values()].reduce((s, n) => s + n, 0);
      return Math.max(mx, total);
    }, 1);

    return { byYear, years, maxTotal };
  }, [rows, selectedGebiete, selectedAusmass]);

  // Ausmaß-Verteilung: gefiltert nach selectedGebiete, Klick → selectedAusmass
  const ausmassData = useMemo(() => {
    const src = selectedGebiete.size > 0
      ? rows.filter((r) => selectedGebiete.has(r.therapiegebiet ?? ""))
      : rows;
    const counts = new Map<string, number>();
    for (const r of src) {
      if (r.zn_ausmass) counts.set(r.zn_ausmass, (counts.get(r.zn_ausmass) ?? 0) + 1);
    }
    const maxCount = Math.max(...[...counts.values()], 1);
    return { counts, maxCount };
  }, [rows, selectedGebiete]);

  // Therapiegebiet: gefiltert nach selectedAusmass, Klick → selectedGebiete
  const gebietData = useMemo(() => {
    const src = selectedAusmass.size > 0
      ? rows.filter((r) => selectedAusmass.has(r.zn_ausmass ?? ""))
      : rows;
    const counts = new Map<string, number>();
    for (const r of src) {
      if (r.therapiegebiet) counts.set(r.therapiegebiet, (counts.get(r.therapiegebiet) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(sorted[0]?.[1] ?? 0, 1);
    return { sorted, maxCount };
  }, [rows, selectedAusmass]);

  function toggleAusmass(a: string) {
    const next = new Set(selectedAusmass);
    next.has(a) ? next.delete(a) : next.add(a);
    onAusmassChange(next);
  }

  function toggleGebiet(g: string) {
    const next = new Set(selectedGebiete);
    next.has(g) ? next.delete(g) : next.add(g);
    onGebieteChange(next);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4 mb-8">
      <ChartCard title={`Zusatznutzen über die Jahre${selectedGebiete.size > 0 || selectedAusmass.size > 0 ? " (gefiltert)" : ""}`}>
        <HeroChart data={heroData} />
      </ChartCard>

      <ChartCard title="Verteilung Zusatznutzen">
        <HorizontalBars
          items={AUSMASS_ORDER.map((label) => ({
            label,
            count: ausmassData.counts.get(label) ?? 0,
            color: AUSMASS_BAR[label],
          })).filter((it) => it.count > 0)}
          maxCount={ausmassData.maxCount}
          selected={selectedAusmass}
          onToggle={toggleAusmass}
          labelWidth="w-28"
        />
      </ChartCard>

      <ChartCard title="Verfahren pro Therapiegebiet">
        <div className="max-h-56 overflow-y-auto pr-1">
          <HorizontalBars
            items={gebietData.sorted.map(([label, count]) => ({
              label,
              displayLabel: GEBIET_LABEL[label],
              count,
              color: "#71717a",
            }))}
            maxCount={gebietData.maxCount}
            selected={selectedGebiete}
            onToggle={toggleGebiet}
            labelWidth="w-32"
          />
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-200 rounded-xl p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Hero: gestapelte Balken nach Jahr ───────────────────────────────────────

type HeroData = {
  byYear: Map<string, Map<string, number>>;
  years: string[];
  maxTotal: number;
};

const CHART_H = 120;
// Alle Segmente in Reihenfolge rendern; mit flex-col-reverse erscheint
// der erste Eintrag unten (positiv) und der letzte oben (negativ/unklar).
const SEGMENT_ORDER = [...AUSMASS_ORDER, "—"];

function HeroChart({ data }: { data: HeroData }) {
  const { byYear, years, maxTotal } = data;

  if (years.length === 0) {
    return <p className="text-xs text-zinc-400">Keine Daten</p>;
  }

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height: CHART_H }}>
        {years.map((year) => {
          const ym = byYear.get(year)!;
          const total = [...ym.values()].reduce((s, n) => s + n, 0);
          const barH = (total / maxTotal) * CHART_H;

          return (
            <div
              key={year}
              className="flex-1 flex flex-col-reverse overflow-hidden rounded-t-sm"
              style={{ height: barH }}
              title={`${year}: ${total} Patientengruppen`}
            >
              {SEGMENT_ORDER.map((ausmass) => {
                const count = ym.get(ausmass) ?? 0;
                if (!count) return null;
                return (
                  <div
                    key={ausmass}
                    style={{
                      height: `${(count / total) * 100}%`,
                      backgroundColor: AUSMASS_BAR[ausmass] ?? "#d4d4d8",
                      flexShrink: 0,
                    }}
                    title={`${ausmass}: ${count}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      {/* X-Achse */}
      <div className="flex gap-[2px] mt-1 border-t border-zinc-100 pt-1">
        {years.map((year) => (
          <div key={year} className="flex-1 text-center text-[9px] text-zinc-400 truncate leading-none">
            {year.slice(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Nur Anzeige-Kürzel — der Datenwert (für Filter) bleibt der Original-String
const GEBIET_LABEL: Record<string, string> = {
  "onkologische Erkrankungen":                           "Onkologie",
  "Krankheiten des Nervensystems":                       "Nervensystem",
  "Krankheiten des Blutes und der blutbildenden Organe": "Blut & Blutbildung",
  "Krankheiten des Muskel-Skelett-Systems":              "Muskel-Skelett",
  "Krankheiten des Atmungssystems":                      "Atmungssystem",
  "Krankheiten des Verdauungssystems":                   "Verdauungssystem",
  "Krankheiten des Urogenitalsystems":                   "Urogenitalsystem",
  "Herz-Kreislauf-Erkrankungen":                         "Herz-Kreislauf",
};

// ─── Horizontale Balken (Ausmaß + Therapiegebiet) ────────────────────────────

type BarItem = { label: string; displayLabel?: string; count: number; color: string };

function HorizontalBars({
  items,
  maxCount,
  selected,
  onToggle,
  labelWidth,
}: {
  items: BarItem[];
  maxCount: number;
  selected: Set<string>;
  onToggle: (label: string) => void;
  labelWidth: string;
}) {
  const anySelected = selected.size > 0;

  if (items.length === 0) {
    return <p className="text-xs text-zinc-400">Keine Daten</p>;
  }

  return (
    <div className="space-y-1.5">
      {items.map(({ label, displayLabel, count, color }) => {
        const widthPct = (count / maxCount) * 100;
        const isActive = selected.has(label);
        const dimmed = anySelected && !isActive;

        return (
          <button
            key={label}
            onClick={() => onToggle(label)}
            className={`w-full flex items-center gap-2 text-left transition-opacity ${dimmed ? "opacity-35" : "opacity-100"}`}
          >
            <span className={`text-[10px] text-zinc-500 shrink-0 truncate text-right leading-tight ${labelWidth}`}>
              {displayLabel ?? label}
            </span>
            <div className="flex-1 h-4 bg-zinc-50 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-[width] duration-200"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-medium w-8 text-right shrink-0 leading-none self-center">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
