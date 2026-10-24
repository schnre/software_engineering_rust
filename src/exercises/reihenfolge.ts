// Elemente in die richtige Reihenfolge bringen. Primär per Antippen,
// auf dem Desktop zusätzlich per Drag & Drop.
import type { Reihenfolge } from '../types';
import { h, leeren, mischenUngleich } from '../ui/dom';
import { inline } from '../ui/markdown';
import { frageAnzeige } from './bausteine';
import type { Renderer } from './typen';

export function reihenfolgeKorrekt(soll: string[], ist: string[]): boolean {
  return soll.length === ist.length && soll.every((x, i) => x === ist[i]);
}

export const reihenfolge: Renderer<Reihenfolge> = (s, aenderung) => {
  const pool: number[] = mischenUngleich(s.elemente.map((_, i) => i));
  const antwort: number[] = [];
  let gesperrt = false;
  let gezogen: { quelle: 'pool' | 'antwort'; index: number } | null = null;

  const poolListe = h('div', { class: 'reihen-pool', role: 'group', 'aria-label': 'Verfügbare Elemente' });
  const antwortListe = h('ol', { class: 'reihen-antwort', 'aria-label': 'Deine Reihenfolge' });

  function neuZeichnen() {
    leeren(poolListe);
    leeren(antwortListe);
    pool.forEach((idx, pos) => {
      const k = h('button', {
        type: 'button', class: 'chip', draggable: 'true',
        'aria-label': `${s.elemente[idx]} – antippen, um anzuhängen`,
        onClick: () => anhaengen(pos),
        onDragstart: (e: DragEvent) => { gezogen = { quelle: 'pool', index: pos }; e.dataTransfer?.setData('text/plain', ''); },
        html: inline(s.elemente[idx]),
      });
      k.disabled = gesperrt;
      poolListe.append(k);
    });
    if (antwort.length === 0) {
      antwortListe.append(h('li', { class: 'reihen-leer' }, 'Tippe die Elemente in der richtigen Reihenfolge an.'));
    }
    antwort.forEach((idx, pos) => {
      const k = h('button', {
        type: 'button', class: 'reihen-element', draggable: 'true',
        'aria-label': `Position ${pos + 1}: ${s.elemente[idx]} – antippen, um zu entfernen`,
        onClick: () => entfernen(pos),
        onDragstart: (e: DragEvent) => { gezogen = { quelle: 'antwort', index: pos }; e.dataTransfer?.setData('text/plain', ''); },
        onDragover: (e: DragEvent) => e.preventDefault(),
        onDrop: (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); ablegen(pos); },
      }, h('span', { class: 'reihen-nr', 'aria-hidden': 'true' }, String(pos + 1)), h('span', { html: inline(s.elemente[idx]) }));
      k.disabled = gesperrt;
      antwortListe.append(h('li', {}, k));
    });
  }

  function anhaengen(pos: number) {
    if (gesperrt) return;
    antwort.push(...pool.splice(pos, 1));
    neuZeichnen();
    aenderung();
    (poolListe.querySelector('button') ?? antwortListe.querySelector('button:last-of-type'))?.focus();
  }

  function entfernen(pos: number) {
    if (gesperrt) return;
    pool.push(...antwort.splice(pos, 1));
    neuZeichnen();
    aenderung();
  }

  function ablegen(ziel: number) {
    if (!gezogen || gesperrt) return;
    const wert = gezogen.quelle === 'pool' ? pool.splice(gezogen.index, 1)[0] : antwort.splice(gezogen.index, 1)[0];
    antwort.splice(Math.min(ziel, antwort.length), 0, wert);
    gezogen = null;
    neuZeichnen();
    aenderung();
  }

  antwortListe.addEventListener('dragover', (e) => e.preventDefault());
  antwortListe.addEventListener('drop', (e) => { e.preventDefault(); ablegen(antwort.length); });
  neuZeichnen();

  return {
    element: h('div', { class: 'uebung reihenfolge' }, frageAnzeige(s.frage), antwortListe, poolListe),
    interaktiv: true,
    bereit: () => pool.length === 0,
    pruefen: () => {
      gesperrt = true;
      neuZeichnen();
      const ist = antwort.map((i) => s.elemente[i]);
      const korrekt = reihenfolgeKorrekt(s.elemente, ist);
      antwortListe.querySelectorAll('.reihen-element').forEach((el, pos) => {
        const ok = antwort[pos] === pos;
        el.classList.add(ok ? 'ist-richtig' : 'ist-falsch');
        el.append(h('span', { class: 'option-status' }, ok ? '✓' : '✗'));
      });
      const loesung = korrekt ? undefined : `<ol>${s.elemente.map((e) => `<li>${inline(e)}</li>`).join('')}</ol>`;
      return { korrekt, loesung };
    },
  };
};
