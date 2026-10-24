# Rust Engineering Academy

Software Engineering für Rust- und Embedded-Entwickler in kurzen, spielerischen Lektionen, ähnlich wie Mimo oder Duolingo. Der Lernpfad führt von `rustc`, LLVM, Linker und Cargo über Ownership, Traits, Testen und Nebenläufigkeit zu Mikrocontrollern mit `no_std`, RTIC und Embassy, weiter zu CI/CD, Architektur auf allen Ebenen, funktionaler Sicherheit und Security bis zu den Kompetenzen, die einen Senior ausmachen.

Die App ist die Rust-Variante der [Engineering Academy für C++](https://github.com/schnre/software_engineering) und genauso aufgebaut (siehe [ADR 0009](docs/adr/0009-portierung-von-cpp-auf-rust.md)).

- Lektionen von 3 bis 7 Minuten, mindestens die Hälfte jeder Lektion sind Übungen
- 8 Übungstypen, alle per Antippen, Maus oder Tastatur bedienbar
- Echte Meldungen von `rustc`, `cargo` und `clippy` zum Deuten, inklusive Fehlercodes wie `E0382`
- XP, Tages-Streak, einstellbares Tagesziel, Level (Junior → Mid → Senior → Principal), 18 Abzeichen
- Wiederholung nach dem Leitner-System (5 Boxen) und Mischtraining über Module hinweg
- Labor-Aufgaben für den eigenen Rechner, Glossar, Links auf Primärquellen
- Modernes, verspieltes Design: Lernpfad im Zickzack, Farbe pro Phase, Fortschrittsringe, Aktivitätskalender, Konfetti bei Erfolgen
- Kein Backend, keine Konten, keine Tracker. Der Fortschritt bleibt im Browser und lässt sich als JSON exportieren
- Funktioniert offline, installierbar als App, heller und dunkler Modus

## Lernpfad

| Phase | Inhalt | Lektionen |
|---|---|---|
| 1 Unter der Haube | Stufen von `rustc` (HIR, MIR, LLVM IR), Codegen-Units, inkrementelle Kompilierung, Makro-Expansion, Fehlercodes, Symbole und Mangling, `#[no_mangle]`, Linkerfehler, Kohärenz und Orphan Rule, `lld`/`mold`, LTO, Crate-Typen (`rlib`, `staticlib`, `cdylib`, `proc-macro`), FFI mit `bindgen`/`cbindgen`, ELF-Sektionen, Binärgrösse, `memory.x`, rustup, Targets, Cross-Kompilierung, Cargo, Profile, Features, Workspaces, `build.rs`, Bazel, reproduzierbare Builds | 18 |
| 2 Rust-Fundamente | Stack und Heap, Layout und `repr`, Niche-Optimierung, Fat Pointer, Ownership, Borrowing, `Drop`, Move, `Copy`/`Clone`, Lifetimes, Traits, `dyn Trait` und vtable, Monomorphisierung, `const fn`, const generics, `unsafe`, Undefined Behavior, `Result`, `?`, `panic!`, fremde Codebases lesen | 18 |
| 3 Fortgeschrittenes Rust | Assoziierte Typen, Blanket Impls, `impl Trait`, Marker-Traits, GATs, HRTBs, Closures, Iteratoren, Vergleichs- und Operator-Traits, `Deref`, Enums und Pattern Matching, `Rc`/`Arc`/`RefCell`/`Cow`, Allokatoren, `Pin`, `MaybeUninit`, `macro_rules!`, prozedurale Makros, async/await, Editionen | 14 |
| 4 Testen, Debuggen, Analysieren | `cargo test`, Integrationstests, Doctests, Snapshot-Tests, Mocks über Traits, mockall, proptest, Coverage, rust-gdb, Backtraces, `git bisect`, Miri, Sanitizer, Clippy, rustfmt, cargo-deny, cargo-audit | 12 |
| 5 Nebenläufigkeit und Performance | Threads, `thread::scope`, `Send` und `Sync`, Fearless Concurrency, `Mutex`, `RwLock`, `Condvar`, Kanäle, Rayon, Atomics, Speichermodell, loom, criterion, Profiling, Flamegraphs, Allokationen, Caches | 10 |
| 6 Embedded: Hardware verstehen | Mikrocontroller, `no_std`/`no_main`, `read_volatile`, Bitmanipulation, PACs und svd2rust, Takt, GPIO als Typestate, Timer, PWM, Interrupts, `critical_section::Mutex`, UART, SPI, I²C, CAN mit embedded-hal, ADC, DMA, Startcode von cortex-m-rt, Bootloader, Updates, Watchdog, Low Power | 15 |
| 7 Embedded-Software und RTOS | Superloop, Echtzeit, WCET, RMS, RTIC, Embassy, Prioritätsinversion, heapless, `embedded-alloc`, Stackgrösse, Codegrösse, Zero-Cost-Abstraktionen, Embedded Linux, Yocto, Rust for Linux, PREEMPT_RT, probe-rs, RTT, defmt, HardFaults | 13 |
| 8 CI/CD | CI, Continuous Delivery, Rust-Pipeline-Stufen, Caching, Quality Gates, Jenkins, Jenkinsfile, Shared Libraries, GitHub Actions, die Pipeline dieser App, Branching, Rebase | 13 |
| 9 Architektur in grossen Projekten | Kohäsion und Kopplung, Module und Sichtbarkeit, Crates und Workspaces schneiden, Traits als Verträge, API Guidelines, SemVer, `#[non_exhaustive]`, C-ABI-Grenzen, Dependency Injection, Zyklen, crates.io, Supply Chain, Code-Reviews | 10 |
| 10 Architektur-Konzepte in Rust | SOLID, Law of Demeter, Komposition statt Vererbung, Schichten, embedded-hal als HAL, Ports & Adapters, State Machines und Typestate, Observer, Strategy, Builder, Singletons, Generics vs. `dyn`, Enum-Dispatch, Sealed Traits, Newtypes, Invarianten, Coding-Standards, ADRs | 17 |
| 11 Architekturstile und Systemarchitektur | Architekturstile, Publish-Subscribe, Actors, HSM, Plugins (C-ABI, WebAssembly), Pipes & Filters, IPC, serde, postcard, Protobuf, Endianness, AUTOSAR, SOME/IP, ROS 2, Zenoh, DDS, datenorientiertes Design, ECS, arc42, C4, ATAM | 13 |
| 12 Funktionale Sicherheit und Security | IEC 61508, ISO 26262, IEC 62304, ASIL/SIL, V-Modell, Ferrocene, MC/DC, Kani, sichere Zustände, Panics im Safety-Kontext, STRIDE, Cyber Resilience Act, SBOM, cargo-vet, Secure Boot, Fuzzing | 7 |
| 13 Senior-Kompetenzen | Technische Schulden, Migration von C/C++ nach Rust, Trade-offs, umkehrbare Entscheidungen, Schätzen, Risiken, Kommunikation, Mentoring | 8 |

Zusammen 168 Lektionen. Neue Lektionen lassen sich jederzeit ergänzen, siehe unten.

Welche Lernprinzipien die App umsetzt, steht in [ADR 0005](docs/adr/0005-lerndidaktik.md). Warum Embedded, Systemarchitektur und Sicherheit dazugehören und wie das Design aufgebaut ist, steht in [ADR 0008](docs/adr/0008-embedded-architektur-und-neues-design.md).

## Lokal starten

Voraussetzung: Node.js 20 oder neuer. Für die Labor-Aufgaben zusätzlich eine Rust-Toolchain über [rustup](https://rustup.rs).

```bash
npm install
npm run dev        # Entwicklungsserver mit Live-Reload
npm run validate   # alle Lektionen prüfen
npm test           # Logik-Tests und Lösbarkeit aller Übungen
npm run build      # validieren, Typen prüfen, nach dist/ bauen
npm run preview    # gebaute Version ansehen
```

## Projektstruktur

```
├─ index.html
├─ src/
│  ├─ engine/      Curriculum laden, Sitzungsablauf, Freischaltung
│  ├─ exercises/   ein Modul pro Übungstyp
│  ├─ progress/    XP, Streak, Tagesziel, Abzeichen, Leitner-Boxen, localStorage, Export/Import
│  └─ ui/          Lernpfad, Lektion, Ergebnis, Wiederholen, Glossar, Profil, Icons, Konfetti, Highlighter
├─ content/
│  ├─ curriculum.json   Reihenfolge von Phasen, Modulen und Lektionen
│  └─ phase-1 … phase-13 eine JSON-Datei pro Lektion
├─ schema/lesson.schema.json
├─ scripts/validate-content.mjs
├─ tests/
├─ docs/adr/       Architecture Decision Records
└─ .github/workflows/  validate.yml, deploy.yml
```

## Eine neue Lektion hinzufügen

Eine neue Lektion braucht **keine Code-Änderung**, nur eine JSON-Datei und einen Eintrag im Curriculum.

1. **Datei anlegen:** `content/phase-<N>/p<N>-m<M>-l<L>.json`. Der Dateiname muss der `id` entsprechen.
2. **Im Curriculum eintragen:** In `content/curriculum.json` die id beim passenden Modul unter `lektionen` ergänzen. Steht das Thema unter `geplant`, dort entfernen.
3. **Prüfen:** `npm run validate && npm test`
4. **Ansehen:** `npm run dev`. Unter *Profil → Erkundungsmodus* kannst du jede Lektion direkt öffnen.
5. **Pull Request:** Die CI validiert die Lektion. Ist etwas ungültig, schlägt die Pipeline fehl, und es wird nichts veröffentlicht.

### Minimales Beispiel

```json
{
  "$schema": "../../schema/lesson.schema.json",
  "id": "p2-m1-l1",
  "phase": 2,
  "modul": "2.1 Speicherlayout zur Laufzeit",
  "titel": "Stack und Heap",
  "lernziele": ["Erklären, wann ein Wert auf dem Stack und wann auf dem Heap liegt"],
  "dauerMinuten": 5,
  "schritte": [
    {
      "typ": "multiple-choice",
      "frage": "Wo liegen die Zeichen von `let s = String::from(\"hallo\");`?",
      "optionen": ["Auf dem Heap", "Auf dem Stack", "In `.rodata`"],
      "korrekt": 0,
      "erklaerung": "Der `String` selbst (Zeiger, Länge, Kapazität) liegt auf dem Stack, die Zeichen auf dem Heap …",
      "begruendungen": ["Richtig …", "Nur Zeiger, Länge und Kapazität …", "Nur das Literal `\"hallo\"` …"]
    }
  ],
  "praxis": "Wo begegnet dir das im Alltag? …"
}
```

Mit `"$schema"` bekommst du in VS Code Autovervollständigung und Fehlermarkierungen beim Schreiben.

### Übungstypen

| `typ` | Pflichtfelder | Hinweise |
|---|---|---|
| `erklaerung` | `text` | optional `titel`, `code`, `terminal`, `tabelle`, `diagramm`. Höchstens etwa 120 Wörter |
| `multiple-choice` | `frage`, `optionen` (3–4), `korrekt`, `erklaerung` | `korrekt` ist ein Index oder ein Array (Mehrfachauswahl) |
| `code-lesen` | wie oben plus `code` | 2–5 Optionen, z. B. „kompiliert / Fehler E0382 / Fehler E0502“ |
| `terminal-deuten` | wie oben plus `terminal` | `terminal.befehl` und `terminal.ausgabe` (Zeilen) |
| `lueckentext` | `frage`, `text` **oder** `code`, `luecken`, `erklaerung` | Lücken mit `{{?}}` markieren. Mit `auswahl` gibt es Bausteine zum Antippen, sonst Texteingabe |
| `reihenfolge` | `frage`, `elemente` (in **richtiger** Reihenfolge), `erklaerung` | Die App mischt selbst |
| `zuordnen` | `frage`, `paare` (`links`/`rechts`), `erklaerung` | 3–6 Paare. Die App mischt die rechte Spalte |
| `fehler-finden` | `frage`, `code`, `fehlerZeile` (1-basiert), `erklaerung` | |

Für alle Auswahl-Übungen gilt:

- `begruendungen` hat genau einen Eintrag pro Option und erklärt, warum sie richtig oder falsch ist. Bitte immer angeben.
- Die App mischt die Optionen. Mit `"fest": true` bleibt die Reihenfolge erhalten, z. B. bei „Ja/Nein“ oder Zahlenwerten.

Optionale Felder pro Schritt: `hinweis` (Tipp-Knopf) und `id`. Vergib eine `id`, wenn du Schritte später umsortieren willst: Die Wiederholungs-Boxen merken sich Übungen über `id` oder, ohne `id`, über die Position.

Code steht als Array von Zeilen: `"code": { "sprache": "rust", "datei": "src/main.rs", "zeilen": ["fn main() {", "}"], "anmerkungen": [{ "zeile": 1, "text": "…" }] }`. Sprachen: `rust`, `toml`, `c`, `cpp`, `bash`, `cmake`, `make`, `yaml`, `groovy`, `json`, `asm`, `starlark`, `python`, `linker`, `text`.

Texte unterstützen `Code`, **fett**, *kursiv*, Aufzählungen mit `- `, nummerierte Listen, Absätze (Leerzeile) und in Erklärungen Codeblöcke mit drei Backticks (ohne Leerzeilen im Block, ohne Sprachangabe als Rust hervorgehoben).

### Weitere Felder einer Lektion

| Feld | Zweck |
|---|---|
| `praxis` | Pflicht. Karte „Wo begegnet dir das im Alltag?“ am Ende der Lektion |
| `labor` | Aufgabe für den eigenen Rechner: `anleitung`, `befehle`, `beobachtung` |
| `begriffe` | Fachbegriffe mit `englisch` und `erklaerung`. Erscheinen im Glossar |
| `weiterlesen` | Links auf Primärquellen (`titel`, `url`, nur `https`) |

### Was der Validator prüft

Zusätzlich zum Schema prüft `scripts/validate-content.mjs`:

- Dateiname = `id`, Ordner = Phase, Lektion steht im Curriculum und umgekehrt
- mindestens die Hälfte der Schritte sind Übungen
- `korrekt` und `fehlerZeile` zeigen auf existierende Optionen bzw. Zeilen, `begruendungen` passt zur Anzahl Optionen
- Anzahl `{{?}}` entspricht der Anzahl `luecken`, jede Lösung kommt in `auswahl` vor
- kein „ß“ (Schweizer Rechtschreibung)

`tests/inhalte.test.ts` löst zusätzlich jede Übung mit der hinterlegten Lösung.

### Inhaltliche Richtlinien

- Deutsch in Schweizer Rechtschreibung (`ss` statt `ß`). Fachbegriffe beim ersten Auftreten erklären, englischer Originalbegriff in Klammern.
- Wo es passt, mit einer Frage beginnen und erst danach erklären.
- Falsche Optionen müssen plausibel sein, keine offensichtlich absurden Antworten.
- Code-Beispiele kurz halten und mit `anmerkungen` Zeile für Zeile erklären.
- Normen und Bücher in eigenen Worten erklären, nicht zitieren. Bei unsicheren Aussagen gegen die Primärquelle prüfen (The Rust Book, Reference, Rustonomicon, Cargo Book, Embedded Rust Book, docs.rs) und sie unter `weiterlesen` verlinken.
- Konkrete Ausgaben (`rustc`, `cargo`, `clippy`, `nm`, `objdump`) wenn möglich mit echten Werkzeugen erzeugen, nicht erfinden. Die Lektionen wurden mit Rust 1.97 (Edition 2024) erstellt.

## Deployment

Die App läuft auf GitHub Pages:

1. In den Repository-Einstellungen unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** wählen.
2. Auf `main` pushen. `validate.yml` prüft Inhalte, Typen und Tests und baut die App. War das erfolgreich, veröffentlicht `deploy.yml` den geprüften Commit.

Ein Pull Request mit einer ungültigen Lektion lässt *Validate* fehlschlagen, und *Deploy* läuft nicht.

## Architektur-Entscheidungen

Siehe [docs/adr/](docs/adr/README.md).
