# 0006 – Validierung als Bedingung für das Deployment

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Eine fehlerhafte Lektion (z. B. ein `korrekt`-Index ausserhalb der Optionen) würde die App für alle Lernenden kaputt machen. Das Deployment darf deshalb nur geprüfte Stände veröffentlichen.

## Entscheidung

- `.github/workflows/validate.yml` läuft bei jedem Push und Pull Request: `npm ci`, Inhaltsvalidierung, Typprüfung, Tests (inklusive Lösbarkeit aller Übungen), Build.
- `.github/workflows/deploy.yml` wird über `workflow_run` erst ausgelöst, wenn *Validate* abgeschlossen ist. Er veröffentlicht nur, wenn *Validate* erfolgreich war und durch einen Push auf `main` ausgelöst wurde. Er checkt genau den geprüften Commit (`head_sha`) aus.
- Zusätzlich führt `npm run build` die Validierung und Typprüfung selbst aus. Auch ein lokaler oder manueller Build kann so keine ungültigen Inhalte erzeugen.

## Konsequenzen

- Ein Deployment dauert etwas länger, weil zwei Workflows nacheinander laufen.
- **Verworfen:** ein einziger Workflow mit zwei Jobs. Das wäre kürzer, die Vorgabe verlangt aber getrennte Dateien. Mit `workflow_run` ist die Trennung sauber, und Validate bleibt auch für Pull Requests unverändert nutzbar.
- **Vergleich mit Jenkins:** Dasselbe Muster heisst dort *Quality Gate* zwischen Pipeline-Stufen. Lektion 8.5 der App greift dieses Beispiel auf.
