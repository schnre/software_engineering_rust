# 0007 – Eigener Syntax-Highlighter

- Status: Angenommen
- Datum: 2026-10-23

## Kontext

Code-Blöcke brauchen Syntax-Hervorhebung für Rust, TOML (`Cargo.toml`, `.cargo/config.toml`, `rust-toolchain.toml`), Shell, YAML, Groovy (Jenkinsfile), Bazel/Starlark, Linker-Skripte (`memory.x`), Assembler sowie C und C++ für FFI-Vergleiche. Übungen wie *Fehler finden* und *Lückentext* brauchen ausserdem Zugriff auf einzelne Zeilen und auf Fragmente zwischen Lücken.

## Entscheidung

Ein kleiner zeilenbasierter Tokenizer in `src/ui/highlight.ts` erkennt Kommentare (auch mehrzeilige Blockkommentare), Strings, Zahlen, Schlüsselwörter, Typen, Präprozessor-Direktiven und Variablen. Für Rust kommen hinzu:

- Attribute (`#[derive(Debug)]`, `#![no_std]`)
- Makro-Aufrufe (`println!`, `vec!`)
- Lifetimes (`'a`, `'static`) im Unterschied zu Zeichenliteralen (`'x'`, `'\n'`)
- Raw-Strings (`r"…"`, `r#"…"#`) und Zahlen mit Suffix und Trennzeichen (`1_000u32`, `0xFF_u8`)
- Typen anhand der Gross-/Kleinschreibung (`CamelCase`)

Für TOML werden Tabellen (`[dependencies]`) und Schlüssel (`serde = …`) hervorgehoben. Die Farben kommen aus CSS-Tokens und funktionieren im hellen und dunklen Modus.

## Konsequenzen

- **Einfacher:** keine Abhängigkeit, wenige Kilobyte, volle Kontrolle über die Zeilenstruktur.
- **Schwieriger:** Die Hervorhebung ist nicht perfekt (z. B. keine verschachtelten Blockkommentare, keine mehrzeiligen Strings). Für kurze Lernbeispiele genügt das.
- **Verworfen:** Prism oder Shiki. Beide arbeiten auf ganzen Blöcken und sind deutlich grösser (Shiki mehrere hundert KB).
