# 0005 – Lerndidaktik und Aufbau des Curriculums

- Status: Angenommen, ergänzt durch [0008](0008-embedded-architektur-und-neues-design.md)
- Datum: 2026-10-23

## Kontext

Das Ziel ist, das Wissen für eine Rolle als **Senior Rust- und Embedded-Entwickler** aufzubauen. Rust-Tutorials hören oft nach Ownership und Traits auf. Im Alltag zeigt sich Seniorität aber an anderen Stellen: Wie arbeiten `rustc`, LLVM und der Linker zusammen? Wie schneidet man Workspaces und Crates? Wie hält man eine öffentliche API nach SemVer stabil? Wie testet man Treiber ohne Hardware? Ausserdem soll die App nicht nur Wissen präsentieren, sondern nach gut belegten Lernprinzipien funktionieren.

## Entscheidung

### Curriculum in 13 Phasen

| Phase | Schwerpunkt |
|---|---|
| 1 Unter der Haube | `rustc`-Pipeline (HIR, MIR, LLVM IR), Codegen-Units, Linker, Mangling, Crate-Typen, FFI, ELF, `memory.x`, rustup, Targets, Cargo, `build.rs`, reproduzierbare Builds |
| 2 Rust-Fundamente | Speicherlayout, Ownership, Borrowing, Drop, Move/Copy/Clone, Lifetimes, Traits, `dyn`, Monomorphisierung, `const`, `unsafe`, Fehlerbehandlung |
| 3 Fortgeschrittenes Rust | Assoziierte Typen, GATs, Closures, Iteratoren, Operator-Traits, Smart Pointers, Allokatoren, `Pin`, Makros, async/await, Editionen |
| 4 Testen, Debuggen, Analysieren | `cargo test`, Doctests, Mocks, Property-Tests, rust-gdb, Backtraces, Miri, Sanitizer, Clippy, rustfmt, cargo-deny |
| 5 Nebenläufigkeit und Performance | Threads, `Send`/`Sync`, Mutex, Kanäle, Atomics, Speichermodell, criterion, Profiling, Allokationen |
| 6 Embedded: Hardware verstehen | `no_std`, Register, PACs, embedded-hal, GPIO, Timer, Interrupts, Schnittstellen, ADC, DMA, Startcode |
| 7 Embedded-Software und RTOS | Echtzeit, RTIC, Embassy, heapless, Codegrösse, Embedded Linux, probe-rs, defmt |
| 8 CI/CD | Rust-Pipelines, Quality Gates, Jenkins, Shared Libraries, GitHub Actions, Git im Team |
| 9 Architektur in grossen Projekten | Module, Crates, Workspaces, öffentliche APIs, SemVer, ABI-Grenzen, Abhängigkeiten, Reviews |
| 10 Architektur-Konzepte in Rust | SOLID, Komposition, HAL, Ports & Adapters, Typestate, Muster, Generics vs. `dyn`, Newtypes, ADRs |
| 11 Architekturstile und Systemarchitektur | Ereignisse, Actors, Plugins, IPC, serde, AUTOSAR, ROS 2, DDS, ECS, arc42, C4, ATAM |
| 12 Funktionale Sicherheit und Security | ISO 26262, IEC 61508, Ferrocene, formale Verifikation, STRIDE, Supply Chain, Fuzzing |
| 13 Senior-Kompetenzen | Technische Schulden, Migration von C/C++, Trade-offs, Schätzen, Kommunikation, Mentoring |

### Lernmechaniken

- **Abrufen statt Lesen** (retrieval practice): Mindestens die Hälfte der Schritte sind Übungen. Der Validator erzwingt das.
- **Erst denken, dann erklären:** Viele Lektionen beginnen mit einer Frage, bevor das Konzept erklärt wird.
- **Echte Compiler-Meldungen:** Rust lernt man zu einem grossen Teil über die Fehlermeldungen des Compilers. Die Übungen *Terminal deuten* und *Code lesen* zeigen deshalb echte Ausgaben von `rustc`, `cargo` und `clippy` mit ihren Fehlercodes (`E0382`, `E0502` …).
- **Sofortige Korrektur in der Sitzung:** Falsch beantwortete Übungen kommen am Ende der Lektion einmal wieder.
- **Verteiltes Wiederholen:** Leitner-System mit 5 Boxen und Abständen von 1, 2, 4, 8 und 16 Tagen.
- **Interleaving:** Das *Mischtraining* mischt Übungen aus verschiedenen Modulen.
- **Begründung pro Option** (`begruendungen`): Erklärt, warum die richtige Antwort richtig ist und warum jede falsche falsch ist.
- **Labor:** Optionale Aufgabe am eigenen Rechner. Die App kann nicht kompilieren, aber `cargo`, `rustc --emit`, `nm`, `cargo expand` oder `rust-gdb` lernt man nur durch Benutzen.
- **Glossar:** wird automatisch aus den `begriffe` aller Lektionen aufgebaut. Englische Originalbegriffe stehen in Klammern.
- **Weiterlesen:** Links auf Primärquellen (The Rust Book, Reference, Rustonomicon, Cargo Book, Embedded Rust Book, docs.rs) statt Zitaten.
- **Erkundungsmodus:** Wer ein Thema kennt, kann alle Lektionen freischalten, statt sich durchzuklicken.
- **Streak:** zählt auch abgeschlossene Wiederholungen, nicht nur neue Lektionen.

## Konsequenzen

- Das Curriculum umfasst 168 Lektionen. Module ohne fertige Lektionen können im Lernpfad als *In Vorbereitung* erscheinen (`geplant` in `curriculum.json`).
- Die Level-Schwellen (Junior 0, Mid 450, Senior 1350, Principal 2700 XP) sind so gewählt, dass *Senior* etwa nach der Hälfte des Curriculums inklusive Wiederholungen erreicht wird.
