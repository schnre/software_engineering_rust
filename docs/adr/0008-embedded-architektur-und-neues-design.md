# 0008 – Embedded, Systemarchitektur, Sicherheit und Design

- Status: Angenommen
- Datum: 2026-10-23
- Ergänzt: [0005](0005-lerndidaktik.md)

## Kontext

Die App ist für Entwickler gedacht, die mit Rust im **Embedded-Bereich** arbeiten oder dorthin wechseln. Das Rust-Ökosystem für Mikrocontroller (`no_std`, PACs, embedded-hal, RTIC, Embassy, probe-rs, defmt) unterscheidet sich stark von Desktop-Rust und wird in allgemeinen Kursen kaum behandelt. Gleichzeitig wird Rust zunehmend in sicherheitskritischen Projekten eingesetzt (qualifizierte Toolchains wie Ferrocene), wo Normen wie ISO 26262 und IEC 61508 sowie der Cyber Resilience Act gelten.

Für eine App, die man täglich öffnen soll, ist ausserdem Motivation ein wichtiger Teil der Didaktik.

## Entscheidung

### Eigene Phasen für Embedded, Systemarchitektur und Sicherheit

- **Phase 6 und 7** behandeln Hardware und Embedded-Software durchgehend mit Rust-Werkzeugen: Register über `read_volatile` und svd2rust-PACs, Treiber generisch über embedded-hal-Traits, Interrupt-Daten mit `critical_section::Mutex`, RTIC und Embassy statt klassischem RTOS-Code, heapless statt Heap.
- **Phase 11** zeigt Architekturstile mit Rust-Bausteinen (Kanäle, Actors, serde, prost, Zenoh, ECS).
- **Phase 12** verbindet Normen mit dem, was Rust beiträgt (Speichersicherheit) und was es nicht ersetzt (Prozesse, Werkzeugqualifizierung, Supply-Chain-Sicherheit).

Weil auf dem Entwicklungsrechner keine Hardware hängt, verwenden die Embedded-Lektionen nur Ausgaben, die sich ohne Zielhardware sicher belegen lassen. Wo das nicht geht, sind die Übungen so gestellt, dass sie keine exakte Ausgabe brauchen.

### Motivation

- **Tagesziel** (10, 20, 35 oder 50 XP) mit Fortschrittsring auf der Startseite.
- **Abzeichen** werden aus dem Fortschritt *berechnet* und nicht gespeichert. Damit bleiben sie nach Import und auf jedem Gerät konsistent, und neue Abzeichen gelten rückwirkend.
- **Level-Schwellen** Mid 450, Senior 1350, Principal 2700 XP.
- Aktivitätskalender (16 Wochen), Serienzähler in der Sitzung, Konfetti bei sehr guten Ergebnissen, neuen Abzeichen oder Level-Aufstieg.

### Design

- Design-Tokens als CSS-Variablen für hell und dunkel, jede Phase mit eigener Farbe (`farbe` als Farbton im Curriculum) und eigenem Symbol.
- Lernpfad als Zickzack aus runden Knoten mit 3D-Schatten, statt einer Liste.
- Schwebende Navigation unten auf dem Handy, Seitenleiste ab 960 px Breite.
- Sitzung mit Fortschrittsbalken und Rückmeldung als Bottom Sheet.
- Eigenes SVG-Icon-Set und selbst gehostete variable Schriften (Inter, JetBrains Mono) über `@fontsource-variable`. Kein CDN, damit die App offline und ohne Tracker funktioniert (ADR 0001).
- Weiterhin ohne UI-Framework (ADR 0003).

## Konsequenzen

- Die Inhalte bleiben reine JSON-Daten, neue Lektionen brauchen keinen Code.
- Erklärungen dürfen Codeblöcke mit drei Backticks enthalten. Ohne Sprachangabe werden sie als Rust hervorgehoben (ADR 0007).
- Die Themen zu Normen (ISO 26262, IEC 61508, MISRA) werden in eigenen Worten erklärt und auf die Originalquellen verlinkt, ohne Normtexte zu zitieren.
- Aussagen über schnell wandelnde Teile des Ökosystems (Embassy, RTIC, Ferrocene-Qualifizierungen) müssen regelmässig überprüft werden.
