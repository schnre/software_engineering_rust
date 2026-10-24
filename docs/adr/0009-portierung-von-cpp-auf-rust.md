# 0009 – Portierung der C++-Vorlage auf Rust

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Die App entstand als Rust-Variante der [Engineering Academy für C++](https://github.com/schnre/software_engineering). Aufbau, Lernmechaniken und Übungstypen haben sich dort bewährt. Gesucht war dieselbe App für Rust, ohne die bewährte Engine neu zu erfinden.

## Entscheidung

- **Engine und Design unverändert übernommen:** Übungstypen, Sitzungsablauf, Leitner-Boxen, Abzeichen, Glossar, Validator, Tests und Workflows sind dieselben. Lektionen bleiben reine JSON-Daten (ADR 0002).
- **Gleiche Struktur des Curriculums:** 13 Phasen mit denselben Modulgrössen und Lektions-Ids (`pN-mM-lL`). Jedes Thema wurde auf sein Rust-Gegenstück abgebildet, zum Beispiel:

| C++ | Rust |
|---|---|
| Präprozessor, `-E`/`-S`/`-c` | Makro-Expansion, `rustc --emit=mir,llvm-ir,asm,obj` |
| ODR, Linkage | Kohärenz, Orphan Rule, Sichtbarkeit `pub(crate)` |
| CMake, Make, Ninja | Cargo, Profile, Features, Workspaces, `build.rs` |
| RAII, Smart Pointers, Move-Semantik | Ownership, Borrowing, `Drop`, `Box`/`Rc`/`Arc` |
| Templates, Concepts, SFINAE | Generics, Trait-Bounds, assoziierte Typen, GATs |
| GoogleTest, GoogleMock | `cargo test`, Doctests, mockall, proptest |
| ASan, TSan, Valgrind | Miri, Sanitizer, Valgrind |
| clang-tidy, clang-format | Clippy, rustfmt, cargo-deny |
| `volatile`, Register-Structs | `read_volatile`, svd2rust-PACs, embedded-hal |
| FreeRTOS, ETL | RTIC, Embassy, heapless |
| PIMPL, `enum class`, CRTP | Newtypes, Typestate, Sealed Traits, Enum-Dispatch |
| MISRA C++ | Clippy-Policies, Safety-Critical Rust Coding Guidelines |

- **Eigener Speicherschlüssel und Cache-Name** (`rust-academy:…`), damit beide Apps auf derselben Domain (z. B. GitHub Pages desselben Kontos) ihren Fortschritt und Offline-Cache nicht gegenseitig überschreiben. Der Service Worker löscht nur noch eigene alte Caches.
- **Keine Migration alter Fortschrittsformate:** Die Umnummerierung der Phasen aus der C++-Geschichte betrifft diese App nicht. `normalisieren()` akzeptiert nur Version 2.
- **Neue Code-Sprachen** `rust` und `toml` in Schema, Typen und Highlighter (ADR 0007). C und C++ bleiben für FFI-Beispiele erhalten.

## Konsequenzen

- Verbesserungen an der Engine lassen sich zwischen beiden Apps leicht übertragen, weil der Code fast identisch ist.
- Fortschritt aus der C++-App lässt sich nicht importieren (anderer `app`-Wert in der Export-Datei). Das ist gewollt, die Lektionen sind andere.
- **Verworfen:** eine gemeinsame App mit Sprachauswahl. Sie hätte Schema, Lernpfad und Fortschritt deutlich komplizierter gemacht, und die Zielgruppen überschneiden sich nur teilweise.
