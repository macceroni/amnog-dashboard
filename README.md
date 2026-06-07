# AMNOG Dashboard

**Durchsuchbarer Katalog der G-BA-Nutzenbewertungen nach §35a SGB V**

1.018 Verfahren · 1.682 Patientengruppen · Datenstand: 6. Juni 2026 · Offen · Kostenlos

---

## Was ist das?

### Das Problem

Der Gemeinsame Bundesausschuss (G-BA) bewertet seit 2011 jeden neu zugelassenen Wirkstoff nach dem AMNOG-Verfahren (§35a SGB V): Bringt das Medikament gegenüber der zweckmäßigen Vergleichstherapie einen Zusatznutzen — und wenn ja, in welchem Ausmaß?

Die Beschlüsse sind öffentlich — aber kaum nutzbar:

- Verteilt auf ~1.000 PDF-Steckbriefe und Beschlussdokumente auf g-ba.de
- Rohdaten (AIS-XML) nur nach Registrierung beim G-BA zugänglich
- Keine offene, durchsuchbare Gesamtübersicht

Kommerzielle Tools (AMNOG-Monitor, pharmazie.com u. a.) existieren, sind aber kostenpflichtig und primär pharma-orientiert.

### Die Lösung

Dieses Dashboard macht die G-BA-Rohdaten für alle zugänglich: durchsuchbar, filterbar, visualisiert — und als offener Datensatz herunterladbar. Kostenfrei und ohne Anmeldung.

---

## Bedienung

| Element | Funktion |
|---------|----------|
| **Suchfeld** | Suche nach Handelsname, Wirkstoff oder pharmazeutischem Unternehmer |
| **Filter** | Therapiegebiet, Ausmaß des Zusatznutzens, Jahresbereich (Slider) |
| **Diagramme** | Klick auf einen Balken filtert die Tabelle; mehrere Klicks kombinieren Filter |
| **Tabellenzeile** | Klick öffnet die Detail-Karte mit vollständigen Angaben, Endpunkten und direktem G-BA-Link |

---

## Datensatz herunterladen

Die Rohdaten sind offen und können frei verwendet werden.

| Datei | Format | Beschreibung |
|-------|--------|-------------|
| [`amnog_web.json`](/amnog_web.json) | JSON · 7,8 MB | Vollständig, verschachtelt (Verfahren → Patientengruppen). Für Entwickler, APIs, eigene Auswertungen. |
| [`amnog_flat.csv`](/amnog_flat.csv) | CSV · 1 MB | Flach, eine Zeile pro Patientengruppe. Für R, Excel, Pandas, Statistik. |

Quelle: G-BA AIS-XML, aufbereitet von [dossier_scout](https://github.com/macceroni/dossier_scout).

---

## Methoden und Limitationen

### Therapiegebiet
Abgeleitet aus dem Indikations-Klammerbegriff der G-BA-Steckbriefe (14 Kategorien). Im JSON-Datensatz liegt zusätzlich `therapiegebiet_atc` vor — abgeleitet aus der ATC-Wirkstoffklasse statt aus der Indikation.

### Pharmazeutischer Unternehmer (PU)
98,5 % der Verfahren enthalten einen PU-Eintrag. 15 Verfahren ohne PU betreffen ältere Einträge ohne aktuelle Webpräsenz. Schreibweisen variieren durch Umfirmierungen und unterschiedliche Rechtsformen; für aggregierte Auswertungen ist eine manuelle Normalisierung empfehlenswert.

### Was nicht enthalten ist

- **Erstattungspreise / Rabattverträge**: Die Nutzenbewertung ist Grundlage für Preisverhandlungen — die ausgehandelten Erstattungsbeträge sind eine separate, kostenpflichtige Datenquelle und nicht Bestandteil dieses Datensatzes.
- **Studientyp und indirekter Vergleich**: Stehen nur im Fließtext der Beschlüsse, nicht in strukturierter Form, und sind daher nicht enthalten.

### Sonderweg „Gilt als belegt"

Zwei Verfahrenstypen gelten per Gesetz als mit Zusatznutzen belegt:

- **Orphan Drug** (§35a SGB V): Zusatznutzen gilt als belegt, solange der GKV-Umsatz unter 30 Mio. € pro Jahr liegt. Bei Überschreiten dieser Grenze folgt eine reguläre Nutzenbewertung.
- **Reserveantibiotikum**: Sonderweg nach §35a SGB V mit eigenem Verfahrensablauf.

### Fehlende Felder
ICD-Codes, ATC-Codes und PZN können leer sein (`—` in der Anzeige) — das spiegelt die Quellsituation wider, keine Datenanreicherung. `"Unklar"` bedeutet: Feld vorhanden, aber nicht normalisierbar.

### Reproduzierbarkeit
Alle Werte stammen direkt aus den G-BA-Rohdaten (AIS-XML). Keine geschätzten oder erfundenen Werte. Jede Zeile verlinkt auf die G-BA-Originalquelle.

---

## Disclaimer

- **Keine medizinische Beratung.** Dieses Dashboard dient ausschließlich der Datenrecherche, nicht der Therapieentscheidung oder medizinischen Beratung.
- **Keine Erstattungspreise.** Angezeigt wird die Nutzenbewertung des G-BA, nicht die verhandelten Erstattungsbeträge (GKV-Spitzenverband / pharmazeutischer Unternehmer).
- **Inoffizielle Aufbereitung.** Dieses Projekt steht in keiner Verbindung zum G-BA. Bei Zweifeln ist die Originalquelle ([g-ba.de](https://www.g-ba.de)) maßgeblich — jede Zeile enthält einen direkten Link zum Beschluss.
- **Datenstand:** 6. Juni 2026. Der Datensatz wird aktuell nicht automatisch aktualisiert.

---

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Daten**: `amnog_web.json` — erzeugt von [dossier_scout](https://github.com/macceroni/dossier_scout) aus dem G-BA AIS-XML
- **Deployment**: Vercel
