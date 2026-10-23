# Git-CV Studio (`cv-studio/`)

Eigenständiges, lokales Werkzeug zum Erstellen, Konfigurieren und direkten Exportieren von **nativen PDF-Lebensläufen im Git-Graph-Design** — komplett entkoppelt von der Astro-Website und Keystatic.

## Schnellstart

```bash
cd cv-studio
npm start
```

Öffne anschließend im Browser: **[http://localhost:4400](http://localhost:4400)**

## Features

- **1-Klick Nativer PDF-Download (`⬇ Export Native PDF`)**: Erzeugt im lokalen Studio-Backend direkt eine fertige Vektor-PDF-Datei (kein `window.print()` Browser-Druckdialog!), lädt sie herunter und legt zusätzlich eine Kopie in `cv-studio/exports/` ab.
- **2 Vorschau-Modi**:
  - **⚡ Live Design Canvas (0ms)**: Sofortige Vorschau beim Tippen oder Ziehen von Reglern (inkl. A4-Seitenumbruch-Hilfslinien).
  - **📄 True Native PDF View**: Rendert das echte, binäre PDF direkt im eingebauten PDF-Viewer.
- **Bewerbungs-Profile (`cv-studio/data/profiles/`)**:
  - Vorinstalliert: `default-en.json` (Englisch) und `default-de.json` (Deutsch).
  - Beliebig viele eigene Profile für verschiedene Stellen anlegen, duplizieren, umbenennen oder als JSON importieren/exportieren.
- **Volle Konfiguration**:
  - Einzelne Stationen, Projekte oder `Started`-Knoten per Checkbox ein-/ausblenden (der Git-Graph berechnet seine Branches und Spalten automatisch neu).
  - Alle Texte, Bullet-Points, Skills, Labels und Farben frei anpassen.
  - Live-Slider für Schriftgröße, Abstände, Seitenränder und Git-Graph-Geometrie.

## Optionaler CLI-Export (ohne Browser)

```bash
cd cv-studio
npm run export default-en
# oder für das deutsche Profil:
npm run export default-de
```
