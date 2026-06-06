"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { FlatRow } from "@/types/amnog";
import { cleanPU } from "@/lib/format";
import DetailPanel from "./DetailPanel";

type SortKey = "handelsname" | "wirkstoff_inn" | "pharmazeutischer_unternehmer" | "therapiegebiet" | "zn_ausmass" | "zn_wahrscheinlichkeit" | "datum_beschluss";
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
  { key: "zn_ausmass", label: "Ausmaß" },
  { key: "zn_wahrscheinlichkeit", label: "Wahrscheinlichkeit" },
  { key: "datum_beschluss", label: "Beschlussdatum", isDate: true },
];

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
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

  const buttonLabel =
    selected.size === 0
      ? label
      : selected.size === 1
      ? [...selected][0]
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
        <div className="absolute z-10 mt-1 bg-white border border-zinc-200 rounded-lg shadow-md min-w-[200px] max-h-72 overflow-y-auto">
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
              <span className="text-zinc-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
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
}: {
  rows: FlatRow[];
  search: string;
  setSearch: (v: string) => void;
  selectedGebiete: Set<string>;
  setSelectedGebiete: (next: Set<string>) => void;
  selectedAusmass: Set<string>;
  setSelectedAusmass: (next: Set<string>) => void;
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
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (
        term &&
        !r.handelsname?.toLowerCase().includes(term) &&
        !r.wirkstoff_inn?.toLowerCase().includes(term) &&
        !r.pharmazeutischer_unternehmer?.toLowerCase().includes(term)
      ) {
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

  const hasActiveFilters = search.trim() !== "" || selectedGebiete.size > 0 || selectedAusmass.size > 0;

  function resetAll() {
    setSearch("");
    setSelectedGebiete(new Set());
    setSelectedAusmass(new Set());
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
        <DetailPanel row={activeRow} onClose={() => setActiveRow(null)} />
      )}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Handelsname, Wirkstoff oder Unternehmen suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <MultiSelectFilter
          label="Therapiegebiet"
          options={therapiegebiete}
          selected={selectedGebiete}
          onChange={setSelectedGebiete}
        />
        <MultiSelectFilter
          label="Ausmaß"
          options={ausmassStufen}
          selected={selectedAusmass}
          onChange={setSelectedAusmass}
        />
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="text-sm text-zinc-500 hover:text-zinc-800 underline"
          >
            Filter zurücksetzen
          </button>
        )}
        <span className="text-sm text-zinc-500 ml-auto">
          {sorted.length.toLocaleString("de-DE")} von {rows.length.toLocaleString("de-DE")} Patientengruppen
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-3 font-medium text-zinc-600 cursor-pointer select-none whitespace-nowrap hover:text-zinc-900"
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.pat_gr_id}
                onClick={() => setActiveRow(row)}
                className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer"
              >
                <td className="px-4 py-2 font-medium text-zinc-900">{display(row.handelsname)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.wirkstoff_inn)}</td>
                <td className="px-4 py-2 text-zinc-700">{cleanPU(row.pharmazeutischer_unternehmer)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.therapiegebiet)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.zn_ausmass)}</td>
                <td className="px-4 py-2 text-zinc-700">{display(row.zn_wahrscheinlichkeit)}</td>
                <td className="px-4 py-2 text-zinc-500 tabular-nums">{formatDate(row.datum_beschluss)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
