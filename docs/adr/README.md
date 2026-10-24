# Architecture Decision Records

Hier sind die wichtigen Architektur-Entscheidungen der Rust Engineering Academy festgehalten. Jede Entscheidung steht in einer eigenen Datei mit Kontext, Entscheidung und Konsequenzen.

| Nr. | Titel | Status |
|---|---|---|
| [0001](0001-statische-app-ohne-backend.md) | Statische App ohne Backend | Angenommen |
| [0002](0002-inhalte-als-json.md) | Inhalte als JSON, App als Engine | Angenommen |
| [0003](0003-vite-typescript-ohne-framework.md) | Vite und TypeScript ohne UI-Framework | Angenommen |
| [0004](0004-fortschritt-im-localstorage.md) | Fortschritt im localStorage mit Export/Import | Angenommen |
| [0005](0005-lerndidaktik.md) | Lerndidaktik und Aufbau des Curriculums | Angenommen |
| [0006](0006-ci-validierung-vor-deployment.md) | Validierung als Bedingung für das Deployment | Angenommen |
| [0007](0007-eigener-syntax-highlighter.md) | Eigener Syntax-Highlighter | Angenommen |
| [0008](0008-embedded-architektur-und-neues-design.md) | Embedded, Systemarchitektur, Sicherheit und Design | Angenommen |
| [0009](0009-portierung-von-cpp-auf-rust.md) | Portierung der C++-Vorlage auf Rust | Angenommen |

## Neue ADR anlegen

1. Nächste freie Nummer wählen, Datei `NNNN-kurzer-titel.md` anlegen.
2. Vorlage unten kopieren und ausfüllen.
3. Tabelle oben ergänzen.
4. ADRs werden nicht nachträglich umgeschrieben. Ändert sich eine Entscheidung, entsteht eine neue ADR, und die alte bekommt den Status *Ersetzt durch NNNN*.

```markdown
# NNNN – Titel

- Status: Vorgeschlagen | Angenommen | Ersetzt durch NNNN
- Datum: JJJJ-MM-TT

## Kontext
Welches Problem lösen wir? Welche Kräfte und Randbedingungen wirken?

## Entscheidung
Was haben wir entschieden?

## Konsequenzen
Was wird dadurch einfacher, was schwieriger? Welche Alternativen haben wir verworfen und warum?
```
