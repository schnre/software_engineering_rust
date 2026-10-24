import { describe, expect, it } from 'vitest';
import { md } from '../src/ui/markdown';

describe('Markdown', () => {
  it('rendert Codeblöcke mit Hervorhebung und escaped den Inhalt', () => {
    const html = md('Vorher\n\n```\nfn max<T: PartialOrd>(a: T, b: T) -> T {\nlet x = a < b;\n```\n\nNachher');
    expect(html).toContain('<div class="code-figur md-code">');
    expect(html).toContain('tok-kw');
    expect(html).toContain('a &lt; b;');
    expect(html).not.toContain('<T:');
    expect(html).not.toContain('```');
    expect(html.match(/class="zeile"/g)).toHaveLength(2);
    expect(html).toContain('<p>Nachher</p>');
  });

  it('hebt Rust-Besonderheiten hervor: Attribute, Makros, Lifetimes, Zeichen', () => {
    const html = md("```rust\n#[derive(Debug)]\nstruct S<'a> { c: char }\nlet c = 'x'; println!(\"{c}\");\n```");
    expect(html).toContain('<span class="tok-pp">#[derive(Debug)]</span>');
    expect(html).toContain(`<span class="tok-typ">&#39;a</span>`);
    expect(html).toContain(`<span class="tok-str">&#39;x&#39;</span>`);
    expect(html).toContain('<span class="tok-fn">println!</span>');
  });

  it('hebt TOML-Tabellen und Schlüssel hervor', () => {
    const html = md('```toml\n[dependencies]\nserde = "1"\n```');
    expect(html).toContain('<span class="tok-kw">[dependencies]</span>');
    expect(html).toContain('<span class="tok-typ">serde</span>');
  });

  it('lässt Aufzählungen und Absätze unverändert', () => {
    expect(md('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(md('**fett** und `code`')).toBe('<p><strong>fett</strong> und <code>code</code></p>');
  });
});
