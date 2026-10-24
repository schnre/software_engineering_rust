// Die fehlerhafte Zeile im Code antippen.
import type { FehlerFinden } from '../types';
import { h } from '../ui/dom';
import { codeZeilenAuswahl, frageAnzeige } from './bausteine';
import type { Renderer } from './typen';

export const fehlerFinden: Renderer<FehlerFinden> = (s, aenderung) => {
  let gewaehlt: number | null = null;
  let gesperrt = false;

  const { element: code, zeilen } = codeZeilenAuswahl(s.code, (nr) => {
    if (gesperrt) return;
    gewaehlt = nr;
    zeilen.forEach((z, i) => z.setAttribute('aria-pressed', String(i + 1 === nr)));
    aenderung();
  });

  const element = h('div', { class: 'uebung fehler-finden' },
    frageAnzeige(s.frage),
    h('p', { class: 'hinweis-klein' }, 'Tippe die Zeile an, die den Fehler verursacht.'),
    code,
  );

  return {
    element,
    interaktiv: true,
    bereit: () => gewaehlt !== null,
    pruefen: () => {
      gesperrt = true;
      const korrekt = gewaehlt === s.fehlerZeile;
      zeilen.forEach((z, i) => {
        z.disabled = true;
        if (i + 1 === s.fehlerZeile) {
          z.classList.add('ist-richtig');
          z.append(h('span', { class: 'zeilen-marke' }, korrekt ? ' ✓ gefunden' : ' ← hier liegt der Fehler'));
        } else if (i + 1 === gewaehlt) {
          z.classList.add('ist-falsch');
          z.append(h('span', { class: 'zeilen-marke' }, ' ✗ deine Wahl'));
        }
      });
      return { korrekt, loesung: korrekt ? undefined : `Der Fehler liegt in Zeile ${s.fehlerZeile}.` };
    },
  };
};
