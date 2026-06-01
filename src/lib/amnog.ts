import { readFileSync } from "fs";
import { join } from "path";
import type { AmnogData } from "@/types/amnog";

export function loadAmnogData(): AmnogData {
  const filePath = join(process.cwd(), "data", "amnog_web.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as AmnogData;
}
