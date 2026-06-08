// Tailwind-Klassen für Badges (DetailPanel, Tabellenzellen)
export const AUSMASS_BADGE: Record<string, string> = {
  "Erheblich":                        "bg-green-100 text-green-800",
  "Beträchtlich":                     "bg-emerald-100 text-emerald-700",
  "Gering":                           "bg-green-50 text-green-600",
  "Nicht quantifizierbar":            "bg-stone-100 text-stone-600",
  "Gilt als belegt (Orphan)":         "bg-slate-100 text-slate-600",
  "Gilt als belegt (Antibiotikum)":   "bg-slate-200 text-slate-700",
  "Gilt als belegt":                  "bg-slate-100 text-slate-600",
  "Geringerer Nutzen":                "bg-amber-50 text-amber-700",
  "Kein Zusatznutzen belegt":         "bg-slate-100 text-slate-500",
};

// Hex-Farben für Chart-Balken
export const AUSMASS_BAR: Record<string, string> = {
  "Erheblich":                        "#1e7d45",
  "Beträchtlich":                     "#52b788",
  "Gering":                           "#b7e4c7",
  "Nicht quantifizierbar":            "#d9e8d4",
  "Gilt als belegt (Orphan)":         "#9ab8c8",
  "Gilt als belegt (Antibiotikum)":   "#9ab8c8",
  "Gilt als belegt":                  "#9ab8c8",
  "Geringerer Nutzen":                "#d4b896",
  "Kein Zusatznutzen belegt":         "#c8d3d6",
  "—":                                "#e5e7eb",
};

// Kanonische Reihenfolge für Charts und Legenden
export const AUSMASS_ORDER = [
  "Erheblich",
  "Beträchtlich",
  "Gering",
  "Nicht quantifizierbar",
  "Gilt als belegt (Orphan)",
  "Gilt als belegt (Antibiotikum)",
  "Gilt als belegt",
  "Geringerer Nutzen",
  "Kein Zusatznutzen belegt",
];
