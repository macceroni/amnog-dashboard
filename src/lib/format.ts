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
  // Prosasuffix abschneiden: ", jetzt Teil der Takeda Group" o.ä.
  s = s.replace(/,\s+[a-z].*$/, "").trim();
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

const PU_PROTECTED = new Set([
  // Akronyme
  "AOP", "CSL", "CTI", "CTRS", "EU", "EUSA", "ITF", "LEO", "MEDICE",
  "MSD", "NPS", "PAION", "PTC", "SERB", "SIFI", "UCB",
  // Binnenmajuskel
  "AbbVie", "AstraZeneca", "BeOne", "BeiGene", "BioCryst", "BioMarin",
  "BioMonde", "EigerBio", "GlaxoSmithKline", "InterMune", "KalVista",
  "SpringWorks", "ViiV",
  // Rechtsformen, die cleanPU nicht vom Ende streift (stehen im Inneren)
  "GmbH", "KGaA", "KG",
  // Konjunktion in zusammengesetzten Firmennamen
  "und",
]);

function titleCaseToken(token: string): string {
  if (PU_PROTECTED.has(token)) return token;
  return token.replace(/[\p{L}\p{N}]+/gu, (part) => {
    if (PU_PROTECTED.has(part)) return part;
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });
}

export function displayPU(name: string | null): string {
  const clean = cleanPU(name);
  if (clean === "—") return "—";
  return clean.replace(/\S+/g, titleCaseToken);
}

export function displayIndikation(tgt: string | null): string {
  if (!tgt) return "—";
  const m = tgt.match(/^(.+?)\s*\([^)]+\)\s*$/);
  const before = m ? m[1].trim() : tgt.trim();
  if (!before) return "—";
  return before.charAt(0).toUpperCase() + before.slice(1);
}
