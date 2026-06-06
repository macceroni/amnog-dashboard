const PU_SUFFIXES = [
  "GmbH & Co. KGaA",
  "GmbH & Co KGaA",
  "GmbH & Co. KG",
  "GmbH & Co KG",
  "GmbH",
  "AG",
  "SE",
  "AB",
  "A/S",
  "UC",
  "NV",
  "B.V.",
  "B.V",
  "Inc.",
  "Inc",
  "Ltd.",
  "Ltd",
  "Limited",
  "S.p.A.",
  "S.p.A",
  "SARL",
  "EEIG",
];

export function cleanPU(name: string | null): string {
  if (!name) return "—";
  let s = name.trim().replace(/[\s·,]+$/, "").trim();
  for (const suffix of PU_SUFFIXES) {
    const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`[\\s,]+${escaped}\\s*$`, "i");
    if (pattern.test(s)) {
      s = s.replace(pattern, "").trim();
      break;
    }
  }
  return s || name.trim();
}
