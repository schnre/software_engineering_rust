// Begriffe und Definitionen verbinden: links antippen, dann rechts antippen.
// Verbundene Paare tragen dieselbe Nummer (Feedback nicht nur über Farbe).
import type { Zuordnen } from '../types';
import { h, mischenUngleich } from '../ui/dom';
import { inline } from '../ui/markdown';
import { frageAnzeige } from './bausteine';
import type { Renderer } from './typen';

/** zuordnung[links] = rechts-Index (Originalindex). Korrekt, wenn jedes links auf sich selbst zeigt. */
export function zuordnungKorrekt(zuordnung: (number | undefined)[]): boolean {
  return zuordnung.every((r, l) => r === l);
}

export const zuordnen: Renderer<Zuordnen> = (s, aenderung) => {
  const n = s.paare.length;
  const rechtsReihenfolge = mischenUngleich(s.paare.map((_, i) => i));
  const zuordnung: (number | undefined)[] = Array(n).fill(undefined);
  let auswahlLinks: number | null = null;
  let gesperrt = false;

  const links = s.paare.map((p, i) =>
    h('button', { type: 'button', class: 'paar-element', 'aria-pressed': 'false', onClick: () => linksAntippen(i) },
      h('span', { class: 'paar-nr', 'aria-hidden': 'true' }), h('span', { html: inline(p.links) })));
  const rechts = rechtsReihenfolge.map((orig) =>
    h('button', { type: 'button', class: 'paar-element', 'data-original': orig, onClick: () => rechtsAntippen(orig) },
      h('span', { class: 'paar-nr', 'aria-hidden': 'true' }), h('span', { html: inline(s.paare[orig].rechts) })));
  const rechtsNach = (orig: number) => rechts[rechtsReihenfolge.indexOf(orig)];

  function aktualisieren() {
    links.forEach((k, i) => {
      const r = zuordnung[i];
      const nr = k.querySelector('.paar-nr')!;
      nr.textContent = r === undefined ? '' : String(i + 1);
      k.classList.toggle('verbunden', r !== undefined);
      k.setAttribute('aria-pressed', String(auswahlLinks === i));
      k.setAttribute('aria-label', `${s.paare[i].links}${r === undefined ? '' : ` – verbunden mit: ${s.paare[r].rechts}`}`);
    });
    rechts.forEach((k) => {
      const orig = Number(k.dataset.original);
      const l = zuordnung.indexOf(orig);
      k.querySelector('.paar-nr')!.textContent = l < 0 ? '' : String(l + 1);
      k.classList.toggle('verbunden', l >= 0);
      k.setAttribute('aria-label', `${s.paare[orig].rechts}${l < 0 ? '' : ` – verbunden mit: ${s.paare[l].links}`}`);
    });
    for (const k of [...links, ...rechts]) {
      const nr = k.querySelector('.paar-nr')!.textContent;
      k.dataset.paar = nr ?? '';
    }
  }

  function linksAntippen(i: number) {
    if (gesperrt) return;
    if (zuordnung[i] !== undefined) zuordnung[i] = undefined;
    auswahlLinks = auswahlLinks === i ? null : i;
    aktualisieren();
    aenderung();
  }

  function rechtsAntippen(orig: number) {
    if (gesperrt) return;
    const bisher = zuordnung.indexOf(orig);
    if (auswahlLinks === null) {
      if (bisher >= 0) zuordnung[bisher] = undefined; // Verbindung lösen
      else {
        const frei = zuordnung.findIndex((r) => r === undefined);
        if (frei >= 0) auswahlLinks = frei;
        aktualisieren();
        links[frei]?.focus();
        return;
      }
    } else {
      if (bisher >= 0) zuordnung[bisher] = undefined;
      zuordnung[auswahlLinks] = orig;
      const naechste = zuordnung.findIndex((r) => r === undefined);
      auswahlLinks = null;
      if (naechste >= 0) links[naechste].focus();
    }
    aktualisieren();
    aenderung();
  }

  aktualisieren();
  const element = h('div', { class: 'uebung zuordnen' },
    frageAnzeige(s.frage),
    h('p', { class: 'hinweis-klein' }, 'Tippe links einen Begriff an und dann rechts die passende Beschreibung.'),
    h('div', { class: 'paar-raster' },
      h('div', { class: 'paar-spalte', role: 'group', 'aria-label': 'Begriffe' }, links),
      h('div', { class: 'paar-spalte', role: 'group', 'aria-label': 'Beschreibungen' }, rechts),
    ),
  );

  return {
    element,
    interaktiv: true,
    bereit: () => zuordnung.every((r) => r !== undefined),
    pruefen: () => {
      gesperrt = true;
      const korrekt = zuordnungKorrekt(zuordnung);
      links.forEach((k, i) => {
        const ok = zuordnung[i] === i;
        k.disabled = true;
        k.classList.add(ok ? 'ist-richtig' : 'ist-falsch');
        k.append(h('span', { class: 'option-status' }, ok ? '✓' : '✗'));
        const r = zuordnung[i];
        if (r !== undefined) {
          const rk = rechtsNach(r);
          rk.disabled = true;
          rk.classList.add(ok ? 'ist-richtig' : 'ist-falsch');
        }
      });
      const loesung = korrekt
        ? undefined
        : `<ul>${s.paare.map((p) => `<li>${inline(p.links)} → ${inline(p.rechts)}</li>`).join('')}</ul>`;
      return { korrekt, loesung };
    },
  };
};
