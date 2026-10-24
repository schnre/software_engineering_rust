import type { Erklaerung } from '../types';
import { h } from '../ui/dom';
import { md } from '../ui/markdown';
import { codeAnzeige, diagrammAnzeige, tabellenAnzeige, terminalAnzeige } from './bausteine';
import type { Renderer } from './typen';

export const erklaerung: Renderer<Erklaerung> = (s) => ({
  interaktiv: false,
  element: h('div', { class: 'uebung erklaerung' },
    s.titel ? h('h2', { class: 'schritt-titel' }, s.titel) : null,
    h('div', { class: 'text', html: md(s.text) }),
    s.diagramm ? diagrammAnzeige(s.diagramm) : null,
    s.code ? codeAnzeige(s.code) : null,
    s.terminal ? terminalAnzeige(s.terminal) : null,
    s.tabelle ? tabellenAnzeige(s.tabelle) : null,
  ),
  bereit: () => true,
  pruefen: () => ({ korrekt: true }),
});
