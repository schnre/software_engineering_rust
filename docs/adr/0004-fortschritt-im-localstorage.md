# 0004 – Fortschritt im localStorage mit Export/Import

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Ohne Backend (siehe [0001](0001-statische-app-ohne-backend.md)) muss der Fortschritt im Browser liegen. `localStorage` kann aber fehlen oder Fehler werfen: in privaten Fenstern, bei blockierten Website-Daten oder wenn der Speicher voll ist.

## Entscheidung

- Ein einziger Schlüssel `rust-academy:fortschritt:v1` enthält den gesamten Fortschritt als JSON (`src/progress/zustand.ts`).
- Jeder Zugriff liegt in `try/catch` (`src/progress/speicher.ts`). Schlägt er fehl, arbeitet die App mit dem Zustand im Arbeitsspeicher weiter und zeigt im Profil einen Hinweis.
- Gelesene und importierte Daten laufen durch `normalisieren()`. Unbekannte oder ungültige Felder werden verworfen, Zahlen auf gültige Bereiche begrenzt.
- Export als Datei `rust-academy-fortschritt-JJJJ-MM-TT.json`. Import ersetzt den Fortschritt erst nach Rückfrage.
- Datumswerte sind lokale Kalendertage (`JJJJ-MM-TT`), damit Streak und Fälligkeiten unabhängig von Zeitzonen funktionieren.

## Konsequenzen

- Löscht jemand die Browserdaten, ist der Fortschritt ohne Export weg. Das Profil weist darauf hin.
- Das Feld `version` erlaubt spätere Migrationen.
