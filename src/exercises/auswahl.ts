// Gemeinsame Logik für multiple-choice, code-lesen und terminal-deuten.
import type { CodeLesen, MultipleChoice, TerminalDeuten } from '../types';
import { h, mischen } from '../ui/dom';
import { inline } from '../ui/markdown';
import { codeAnzeige, frageAnzeige, terminalAnzeige } from './bausteine';
import type { Renderer } from './typen';

type AuswahlSchritt = MultipleChoice | CodeLesen | TerminalDeuten;

export function korrekteIndizes(korrekt: number | number[]): number[] {
  return Array.isArray(korrekt) ? [...korrekt].sort((a, b) => a - b) : [korrekt];
}

/** Auswertung unabhängig vom DOM: Menge der gewählten Indizes muss exakt stimmen. */
export function auswahlKorrekt(korrekt: number | number[], gewaehlt: Iterable<number>): boolean {
  const soll = korrekteIndizes(korrekt);
  const ist = [...new Set(gewaehlt)].sort((a, b) => a - b);
  return soll.length === ist.length && soll.every((x, i) => x === ist[i]);
}

const BUCHSTABEN = 'ABCDEFGH';

export const auswahl: Renderer<AuswahlSchritt> = (s, aenderung) => {
  const mehrfach = Array.isArray(s.korrekt) && s.korrekt.length > 1;
  const reihenfolge = s.fest ? s.optionen.map((_, i) => i) : mischen(s.optionen.map((_, i) => i));
  const gewaehlt = new Set<number>();
  let gesperrt = false;

  const knoepfe = reihenfolge.map((original, pos) =>
    h('button', {
      type: 'button',
      class: 'option',
      'aria-pressed': 'false',
      'data-original': original,
      onClick: () => waehlen(original),
    },
      h('span', { class: 'option-taste', 'aria-hidden': 'true' }, BUCHSTABEN[pos]),
      h('span', { class: 'option-text', html: inline(s.optionen[original]) }),
      h('span', { class: 'option-status' }),
    ),
  );

  function waehlen(original: number) {
    if (gesperrt) return;
    if (mehrfach) {
      if (gewaehlt.has(original)) gewaehlt.delete(original);
      else gewaehlt.add(original);
    } else {
      gewaehlt.clear();
      gewaehlt.add(original);
    }
    for (const k of knoepfe) k.setAttribute('aria-pressed', String(gewaehlt.has(Number(k.dataset.original))));
    aenderung();
  }

  const element = h('div', { class: 'uebung auswahl' },
    frageAnzeige(s.frage),
    'code' in s && s.code ? codeAnzeige(s.code) : null,
    s.typ === 'terminal-deuten' ? terminalAnzeige(s.terminal) : null,
    mehrfach ? h('p', { class: 'hinweis-mehrfach' }, 'Mehrere Antworten sind richtig.') : null,
    h('div', { class: 'optionen', role: 'group', 'aria-label': 'Antwortoptionen' }, knoepfe),
  );

  return {
    element,
    interaktiv: true,
    bereit: () => gewaehlt.size > 0,
    pruefen: () => {
      gesperrt = true;
      const soll = new Set(korrekteIndizes(s.korrekt));
      const korrekt = auswahlKorrekt(s.korrekt, gewaehlt);
      for (const k of knoepfe) {
        const i = Number(k.dataset.original);
        k.disabled = true;
        const status = k.querySelector('.option-status')!;
        if (soll.has(i)) {
          k.classList.add('ist-richtig');
          status.textContent = gewaehlt.has(i) ? '✓ richtig gewählt' : '✓ richtige Antwort';
        } else if (gewaehlt.has(i)) {
          k.classList.add('ist-falsch');
          status.textContent = '✗ falsch';
        }
      }
      const details = s.begruendungen
        ? reihenfolge.map((i, pos) =>
            `<strong>${soll.has(i) ? '✓' : '✗'} ${BUCHSTABEN[pos]}:</strong> ${inline(s.begruendungen![i])}`)
        : undefined;
      return { korrekt, details };
    },
    taste: (key) => {
      const pos = BUCHSTABEN.toLowerCase().indexOf(key.toLowerCase());
      const ziffer = Number(key) - 1;
      const index = pos >= 0 ? pos : Number.isInteger(ziffer) ? ziffer : -1;
      if (index < 0 || index >= reihenfolge.length) return false;
      // Fokus bleibt, wo er ist: So prüft Enter danach die Antwort, statt die Option erneut umzuschalten.
      waehlen(reihenfolge[index]);
      return true;
    },
  };
};
