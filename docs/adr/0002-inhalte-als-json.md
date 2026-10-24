# 0002 – Inhalte als JSON, App als Engine

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Das Curriculum umfasst über hundert Lektionen und wächst laufend. Inhalte sollen ohne TypeScript-Kenntnisse ergänzt werden können, und eine neue Lektion darf keine Code-Änderung erfordern.

## Entscheidung

- Jede Lektion ist eine JSON-Datei unter `content/phase-N/<id>.json`.
- `content/curriculum.json` legt die Reihenfolge von Phasen, Modulen und Lektionen fest.
- Die App lädt alle Lektionsdateien über `import.meta.glob`. Eine neue Datei wird damit automatisch gefunden.
- `schema/lesson.schema.json` beschreibt das Format. `scripts/validate-content.mjs` prüft zusätzlich, was ein Schema nicht ausdrücken kann: gültige Indizes, Anzahl Lücken, Anteil interaktiver Schritte, Dateiname = id, Eintrag im Curriculum, Schweizer Rechtschreibung (kein „ß“).
- `tests/inhalte.test.ts` rendert jede Übung und löst sie mit der hinterlegten Lösung. So fällt eine formal gültige, aber unlösbare Übung auf.
- Texte unterstützen ein kleines Markdown (`Code`, **fett**, Listen). HTML in Inhalten wird immer escaped.

## Konsequenzen

- **Einfacher:** Inhalte lassen sich per Pull Request ergänzen und reviewen. Die CI lehnt fehlerhafte Lektionen ab.
- **Schwieriger:** Mehrzeiliger Code in JSON ist umständlich. Deshalb ist Code als Array von Zeilen gespeichert (`zeilen`).
- Schritte ohne eigene `id` werden in den Wiederholungs-Boxen über ihren Index angesprochen. Wer Schritte umsortiert, sollte daher `id` vergeben, damit der Fortschritt erhalten bleibt.
- **Verworfen:** Markdown-Dateien mit Frontmatter. Sie lesen sich angenehmer, die Übungsstrukturen (Optionen, Paare, Lücken) wären darin aber schwer zu validieren.
