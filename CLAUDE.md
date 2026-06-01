# CLAUDE.md — amnog-dashboard

## Datenvertrag
Dieses Projekt kennt **nur** das Schema aus `data/amnog_web.json` (definiert in plan.md §3).

Regeln:
- Nur Felder verwenden, die im TypeScript-Interface `AmnogData` (src/types/amnog.ts) definiert sind.
- Keine erfundenen Werte. `null` = Feld fehlt in der Quelle → als "—" oder "Keine Angabe" anzeigen.
- `"Unklar"` = Feld vorhanden, aber nicht normalisierbar → als "Unklar" anzeigen, nicht kaschieren.
- Endpunkt-Symbole (↑ ↓ ∅ n.b. k∅) sind Unicode, nicht HTML-Entities.

## Stack
- Next.js App Router, TypeScript, Tailwind
- Daten werden zum Build-Zeitpunkt geladen (Server Component, fs.readFileSync) — kein Runtime-Fetch
- Deployment: Vercel

## Scope V1
Durchsuchbarer Katalog — keine Analyse, kein Backend, kein Auto-Update.
