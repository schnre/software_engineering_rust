// Darstellungsbausteine, die mehrere Übungstypen nutzen: Code, Terminal, Tabelle, Diagramm.
import type { CodeBlock, Diagramm, Tabelle, Terminal } from '../types';
import { h } from '../ui/dom';
import { icon } from '../ui/icons';
import { zeilenHervorheben } from '../ui/highlight';
import { inline, md } from '../ui/markdown';

const SPRACH_NAMEN: Record<string, string> = {
  rust: 'Rust', toml: 'TOML', cpp: 'C++', c: 'C', bash: 'Shell', cmake: 'CMake', make: 'Makefile', yaml: 'YAML', groovy: 'Groovy',
  json: 'JSON', asm: 'Assembler', starlark: 'Bazel', python: 'Python', linker: 'Linker-Skript', text: 'Text',
};

function codeKopf(block: CodeBlock): HTMLElement {
  return h('figcaption', { class: 'code-kopf' },
    h('span', { class: 'code-datei' }, block.datei ?? ''),
    h('span', { class: 'code-sprache' }, SPRACH_NAMEN[block.sprache] ?? block.sprache),
  );
}

export function codeAnzeige(block: CodeBlock): HTMLElement {
  const html = zeilenHervorheben(block.zeilen, block.sprache);
  const markiert = new Set(block.anmerkungen?.map((a) => a.zeile));
  const pre = h('pre', { class: 'code', tabindex: 0 },
    h('code', {}, html.map((zeile, i) =>
      h('span', { class: markiert.has(i + 1) ? 'zeile markiert' : 'zeile', 'data-nr': i + 1, html: zeile || ' ' }),
    )),
  );
  const figur = h('figure', { class: 'code-figur' }, codeKopf(block), pre);
  if (block.anmerkungen?.length) {
    figur.append(h('dl', { class: 'anmerkungen' },
      block.anmerkungen.flatMap((a) => [
        h('dt', {}, `Zeile ${a.zeile}`),
        h('dd', { html: inline(a.text) }),
      ]),
    ));
  }
  return figur;
}

/** Code, bei dem jede Zeile ein auswählbarer Button ist (für fehler-finden). */
export function codeZeilenAuswahl(block: CodeBlock, gewaehlt: (nr: number) => void): { element: HTMLElement; zeilen: HTMLButtonElement[] } {
  const html = zeilenHervorheben(block.zeilen, block.sprache);
  const zeilen = html.map((zeile, i) =>
    h('button', {
      type: 'button',
      class: 'zeile zeile-knopf',
      'data-nr': i + 1,
      'aria-pressed': 'false',
      'aria-label': `Zeile ${i + 1}: ${block.zeilen[i].trim() || '(leer)'}`,
      onClick: () => gewaehlt(i + 1),
      html: zeile || ' ',
    }),
  );
  const element = h('figure', { class: 'code-figur' }, codeKopf(block),
    h('div', { class: 'code code-auswahl', role: 'group', 'aria-label': 'Codezeilen' }, zeilen));
  return { element, zeilen };
}

export function terminalAnzeige(t: Terminal): HTMLElement {
  return h('figure', { class: 'terminal', 'aria-label': 'Terminal-Ausgabe' },
    h('figcaption', { class: 'terminal-kopf' }, icon('terminal'), 'Terminal'),
    h('pre', { tabindex: 0 },
      t.befehl ? h('span', { class: 'prompt' }, h('span', { class: 'prompt-zeichen', 'aria-hidden': 'true' }, '$ '), t.befehl, '\n') : null,
      t.ausgabe.join('\n'),
    ),
  );
}

export function tabellenAnzeige(t: Tabelle): HTMLElement {
  return h('div', { class: 'tabelle-rahmen', tabindex: 0 },
    h('table', {},
      h('thead', {}, h('tr', {}, t.kopf.map((k) => h('th', { scope: 'col', html: inline(k) })))),
      h('tbody', {}, t.zeilen.map((z) => h('tr', {}, z.map((zelle, i) =>
        i === 0 ? h('th', { scope: 'row', html: inline(zelle) }) : h('td', { html: inline(zelle) }))))),
    ),
  );
}

export function diagrammAnzeige(d: Diagramm): HTMLElement {
  const liste = h('ol', { class: 'fluss', 'aria-label': d.beschriftung ?? 'Ablauf' },
    d.knoten.map((k) => h('li', { class: 'fluss-knoten', html: inline(k) })),
  );
  return h('figure', { class: 'diagramm' }, liste, d.beschriftung ? h('figcaption', {}, d.beschriftung) : null);
}

export function frageAnzeige(frage: string): HTMLElement {
  return h('div', { class: 'frage', html: md(frage) });
}
