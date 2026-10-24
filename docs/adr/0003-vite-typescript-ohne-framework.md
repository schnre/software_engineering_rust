# 0003 – Vite und TypeScript ohne UI-Framework

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Die Oberfläche besteht aus wenigen Ansichten (Lernpfad, Lektion, Wiederholen, Glossar, Profil) und acht Übungstypen. Die App soll schnell laden, auch auf schwachen Smartphones, und langfristig ohne Framework-Upgrades wartbar bleiben.

## Entscheidung

- **Vite** als Build-Werkzeug, **TypeScript** im Strict-Modus.
- Kein UI-Framework. Ein kleiner Helfer `h()` in `src/ui/dom.ts` erzeugt DOM-Elemente.
- Fachlogik ohne DOM (`src/engine/session.ts`, `src/engine/freischaltung.ts`, `src/progress/*`) ist von der Darstellung getrennt und mit Vitest getestet.
- Jeder Übungstyp ist ein Modul in `src/exercises/` mit derselben Schnittstelle (`UebungsInstanz`: `bereit()`, `pruefen()`, optional `taste()`).

## Konsequenzen

- **Einfacher:** etwa 25 KB JavaScript (gzip) inklusive aller Logik, keine Laufzeit-Abhängigkeiten.
- **Schwieriger:** Neuzeichnen geschieht von Hand. Bei der überschaubaren Zahl an Ansichten ist das vertretbar.
- **Verworfen:** React/Vue/Svelte. Sie wären für diese Grösse mehr Abhängigkeit als Nutzen.
