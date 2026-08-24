"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { FlatRow } from "@/types/amnog";
import { displayPU, displayIndikation, capitalizeFirst } from "@/lib/format";
import { rowMatchesSearch, matchingFields, matchLevel, type MatchLevel } from "@/lib/search";
import DetailPanel from "./DetailPanel";

type SortKey = "handelsname" | "wirkstoff_inn" | "pharmazeutischer_unternehmer" | "therapiegebiet" | "therapeutisches_gebiet_text" | "patientengruppe" | "zn_ausmass" | "zn_wahrscheinlichkeit" | "datum_beschluss";
type SortDir = "asc" | "desc";

function display(value: string | null): string {
  if (value === null) return "—";
  return value;
}

function formatDate(iso: string | null): string {
  if (iso === null) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function compareValues(a: string | null, b: string | null, dir: SortDir, isDate = false): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  let result: number;
  if (isDate) {
    result = new Date(a).getTime() - new Date(b).getTime();
  } else {
    result = a.localeCompare(b, "de");
  }
  return dir === "asc" ? result : -result;
}

const COLUMNS: { key: SortKey; label: string; isDate?: boolean }[] = [
  { key: "handelsname", label: "Handelsname" },
  { key: "wirkstoff_inn", label: "Wirkstoff" },
  { key: "pharmazeutischer_unternehmer", label: "Unternehmen" },
  { key: "therapiegebiet", label: "Therapiegebiet" },
  { key: "therapeutisches_gebiet_text", label: "Indikation" },
  { key: "patientengruppe", label: "Patientengruppe" },
  { key: "zn_ausmass", label: "Ausmaß" },
  { key: "zn_wahrscheinlichkeit", label: "Wahrscheinlichkeit" },
  { key: "datum_beschluss", label: "Beschlussdatum", isDate: true },
];

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  optionLabel,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  optionLabel?: (opt: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(next);
  }

  const fmt = optionLabel ?? ((v: string) => v);
  const buttonLabel =
    selected.size === 0
      ? label
      : selected.size === 1
      ? fmt([...selected][0])
      : `${label} (${selected.size})`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 border rounded-lg px-3 py-2 text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-zinc-300 ${
          selected.size > 0
            ? "border-zinc-400 bg-zinc-100 text-zinc-900 font-medium"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
        }`}
      >
        {buttonLabel}
        <span className="text-zinc-400 ml-1">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 bg-white border border-zinc-200 rounded-lg shadow-md min-w-[200px] max-h-72 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => toggle(opt)}
                className="accent-zinc-700"
              />
              <span className="text-zinc-700">{fmt(opt)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [from, to] = value;
  const range = max - min || 1;
  const fromPct = ((from - min) / range) * 100;
  const toPct = ((to - min) / range) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 shrink-0">Jahr</span>
      <span className="text-xs text-zinc-700 font-medium tabular-nums w-8 text-right">{from}</span>
      <div className="relative w-36 h-5 shrink-0">
        {/* Track Hintergrund */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-200 rounded-full pointer-events-none" />
        {/* Aktiver Bereich zwischen den Griffen */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-zinc-500 rounded-full pointer-events-none"
          style={{ left: `${fromPct}%`, width: `${toPct - fromPct}%` }}
        />
        {/* Unterer Griff (von) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={from}
          onChange={(e) => onChange([Math.min(+e.target.value, to), to])}
          className="range-thumb absolute inset-0 w-full h-full"
          style={{ zIndex: from >= to ? 5 : 3 }}
        />
        {/* Oberer Griff (bis) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={to}
          onChange={(e) => onChange([from, Math.max(+e.target.value, from)])}
          className="range-thumb absolute inset-0 w-full h-full"
          style={{ zIndex: 4 }}
        />
      </div>
      <span className="text-xs text-zinc-700 font-medium tabular-nums w-8">{to}</span>
    </div>
  );
}

export default function AmnogTable({
  rows,
  search,
  setSearch,
  selectedGebiete,
  setSelectedGebiete,
  selectedAusmass,
  setSelectedAusmass,
  yearRange,
  setYearRange,
  minYear,
  maxYear,
  orphanFilter,
  setOrphanFilter,
}: {
  rows: FlatRow[];
  search: string;
  setSearch: (v: string) => void;
  selectedGebiete: Set<string>;
  setSelectedGebiete: (next: Set<string>) => void;
  selectedAusmass: Set<string>;
  setSelectedAusmass: (next: Set<string>) => void;
  yearRange: [number, number];
  setYearRange: (v: [number, number]) => void;
  minYear: number;
  maxYear: number;
  orphanFilter: "all" | "only" | "without";
  setOrphanFilter: (v: "all" | "only" | "without") => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("datum_beschluss");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeRow, setActiveRow] = useState<FlatRow | null>(null);

  const therapiegebiete = useMemo(() => {
    const vals = new Set<string>();
    for (const r of rows) if (r.therapiegebiet) vals.add(r.therapiegebiet);
    return [...vals].sort((a, b) => a.localeCompare(b, "de"));
  }, [rows]);

  const ausmassStufen = useMemo(() => {
    const vals = new Set<string>();
    for (const r of rows) if (r.zn_ausmass) vals.add(r.zn_ausmass);
    return [...vals].sort((a, b) => a.localeCompare(b, "de"));
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim();
    return rows.filter((r) => {
      if (term && !rowMatchesSearch(r, term)) {
        return false;
      }
      if (selectedGebiete.size > 0 && !selectedGebiete.has(r.therapiegebiet ?? "")) {
        return false;
      }
      if (selectedAusmass.size > 0 && !selectedAusmass.has(r.zn_ausmass ?? "")) {
        return false;
      }
      return true;
    });
  }, [rows, search, selectedGebiete, selectedAusmass]);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey);
    return [...filtered].sort((a, b) =>
      compareValues(a[sortKey], b[sortKey], sortDir, col?.isDate)
    );
  }, [filtered, sortKey, sortDir]);

  // Pro Verfahren: wie viele PGs (innerhalb des jahres-/orphan-gefilterten
  // rows-Sets) selbst PG-eigene Suchtreffer haben, plus die Match-Ebene
  // jeder einzelnen Zeile — fuer den Zaehler unter der Patientengruppe-Zelle.
  const searchMatchInfo = useMemo(() => {
    const term = search.trim();
    if (!term) return null;
    const byVerfahren = new Map<string, { total: number; pgMatches: number }>();
    const rowLevels = new Map<string, MatchLevel>();
    for (const r of rows) {
      const level = matchLevel(matchingFields(r, term));
      if (!byVerfahren.has(r.id_be_akz)) byVerfahren.set(r.id_be_akz, { total: 0, pgMatches: 0 });
      const g = byVerfahren.get(r.id_be_akz)!;
      g.total += 1;
      if (level === "pg") g.pgMatches += 1;
      rowLevels.set(r.pat_gr_id, level);
    }
    return { byVerfahren, rowLevels };
  }, [rows, search]);

  function searchNote(row: FlatRow): string | null {
    if (!searchMatchInfo) return null;
    const level = searchMatchInfo.rowLevels.get(row.pat_gr_id);
    if (level === "pg") {
      const g = searchMatchInfo.byVerfahren.get(row.id_be_akz)!;
      return `Treffer in ${g.pgMatches} von ${g.total} Patientengruppen`;
    }
    if (level === "verfahren") return "Treffer im Verfahren";
    return null;
  }

  const verfahrenCount = useMemo(() => new Set(sorted.map((r) => r.id_be_akz)).size, [sorted]);
  const verfahrenTotal = useMemo(() => new Set(rows.map((r) => r.id_be_akz)).size, [rows]);

  const isFullRange = yearRange[0] === minYear && yearRange[1] === maxYear;
  const hasActiveFilters =
    search.trim() !== "" || selectedGebiete.size > 0 || selectedAusmass.size > 0 || !isFullRange || orphanFilter !== "all";

  function resetAll() {
    setSearch("");
    setSelectedGebiete(new Set());
    setSelectedAusmass(new Set());
    setYearRange([minYear, maxYear]);
    setOrphanFilter("all");
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return <span className="text-zinc-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {activeRow && (
        <DetailPanel row={activeRow} search={search} onClose={() => setActiveRow(null)} />
      )}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Handelsname, Wirkstoff, Unternehmen oder Indikation suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <MultiSelectFilter
          label="Therapiegebiet"
          options={therapiegebiete}
          selected={selectedGebiete}
          onChange={setSelectedGebiete}
          optionLabel={capitalizeFirst}
        />
        <MultiSelectFilter
          label="Ausmaß"
          options={ausmassStufen}
          selected={selectedAusmass}
          onChange={setSelectedAusmass}
        />
        <RangeSlider
          min={minYear}
          max={maxYear}
          value={yearRange}
          onChange={setYearRange}
        />
        <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm">
          {(["all", "only", "without"] as const).map((val, i) => {
            const labels = { all: "Alle", only: "Nur Orphan", without: "Ohne Orphan" };
            const active = orphanFilter === val;
            return (
              <button
                key={val}
                onClick={() => setOrphanFilter(val)}
                className={`px-3 py-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-300 ${
                  i > 0 ? "border-l border-zinc-200" : ""
                } ${
                  active
                    ? "bg-zinc-800 text-white font-medium"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {labels[val]}
              </button>
            );
          })}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="text-sm text-zinc-500 hover:text-zinc-800 underline"
          >
            Filter zurücksetzen
          </button>
        )}
        <span className="text-sm text-zinc-500 ml-auto">
          {verfahrenCount.toLocaleString("de-DE")} von {verfahrenTotal.toLocaleString("de-DE")} Verfahren,{" "}
          {sorted.length.toLocaleString("de-DE")} von {rows.length.toLocaleString("de-DE")} Patientengruppen
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-xl border border-zinc-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="sticky top-0 bg-zinc-50 z-10 border-b border-zinc-200 text-left px-4 py-3 font-medium text-zinc-600 cursor-pointer select-none whitespace-nowrap hover:text-zinc-900"
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
              <th className="sticky top-0 bg-zinc-50 z-10 border-b border-zinc-200 text-left px-4 py-3 font-medium text-zinc-600 whitespace-nowrap select-none">PG</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <p className="text-sm text-zinc-500 mb-3">
                    Keine Verfahren für diese Filterkombination.
                  </p>
                  <button
                    onClick={resetAll}
                    className="text-sm text-zinc-600 underline hover:text-zinc-900"
                  >
                    Filter zurücksetzen
                  </button>
                </td>
              </tr>
            ) : sorted.map((row) => (
              <tr
                key={row.pat_gr_id}
                onClick={() => setActiveRow(row)}
                className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer"
              >
                <td className="px-4 py-2 font-medium text-zinc-900">{display(row.handelsname)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.wirkstoff_inn)}</td>
                <td className="px-4 py-2 text-zinc-700">{displayPU(row.pharmazeutischer_unternehmer)}</td>
                <td className="px-4 py-2 text-zinc-700">{capitalizeFirst(row.therapiegebiet)}</td>
                <td className="px-4 py-2 text-zinc-700 max-w-[22rem]">
                  <div
                    className="overflow-hidden whitespace-nowrap text-ellipsis"
                    title={displayIndikation(row.therapeutisches_gebiet_text)}
                  >
                    {displayIndikation(row.therapeutisches_gebiet_text)}
                  </div>
                </td>
                <td className="px-4 py-2 text-zinc-700 max-w-[14rem]">
                  <div
                    className="overflow-hidden whitespace-nowrap text-ellipsis"
                    title={row.patientengruppe ?? ""}
                  >
                    {row.patientengruppe ?? "—"}
                  </div>
                  {searchNote(row) && (
                    <div className="text-xs text-zinc-400 whitespace-nowrap">{searchNote(row)}</div>
                  )}
                </td>
                <td className="px-4 py-2 text-zinc-700">{display(row.zn_ausmass)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.zn_wahrscheinlichkeit)}</td>
                <td className="px-4 py-2 text-zinc-500 tabular-nums">{formatDate(row.datum_beschluss)}</td>
                <td className="px-4 py-2 text-zinc-400 tabular-nums text-xs whitespace-nowrap">
                  {`${row.pg_index} von ${row.pg_total}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
