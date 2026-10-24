# 0001 – Statische App ohne Backend

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Die App soll kostenlos auf GitHub Pages laufen, ohne Konten und ohne Tracker. Sie richtet sich an Einzelpersonen, die im eigenen Tempo lernen. Es gibt keine Daten, die zwischen Personen geteilt werden müssen.

## Entscheidung

Die Rust Engineering Academy ist eine rein statische Web-App. Alle Inhalte werden beim Build in das JavaScript-Bundle aufgenommen, der Fortschritt bleibt im Browser (siehe [0004](0004-fortschritt-im-localstorage.md)). Ein Service Worker macht die App nach dem ersten Laden offline nutzbar.

## Konsequenzen

- **Einfacher:** kein Server, keine Datenbank, keine Kosten, kein Datenschutz-Aufwand. Deployment ist ein Kopieren von Dateien.
- **Schwieriger:** kein geräteübergreifender Sync. Das lösen wir mit Export/Import als JSON-Datei.
- **Verworfen:** ein kleines Backend (z. B. Serverless-Funktionen) für Konten und Sync. Es hätte Betrieb, Kosten und Datenschutzpflichten gebracht, ohne für das Lernen etwas Wesentliches beizutragen.
