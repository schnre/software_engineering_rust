// @vitest-environment jsdom
// Rendert jede Übung jeder Lektion und beantwortet sie mit der hinterlegten Lösung.
// So fällt auf, wenn eine Lektion zwar dem Schema entspricht, aber nicht lösbar ist.
import { describe, expect, it } from 'vitest';
import { uebungErzeugen } from '../src/exercises';
import { korrekteIndizes } from '../src/exercises/auswahl';
import type { Lektion, Schritt } from '../src/types';
import { inline } from '../src/ui/markdown';

const lektionen = Object.values(
  import.meta.glob<Lektion>('../content/phase-*/*.json', { eager: true, import: 'default' }),
);

function klick(el: Element | null | undefined) {
  if (!el) throw new Error('Element zum Anklicken nicht gefunden');
  (el as HTMLElement).click();
}

function richtigBeantworten(s: Schritt, el: HTMLElement) {
  switch (s.typ) {
    case 'erklaerung':
      return;
    case 'multiple-choice':
    case 'code-lesen':
    case 'terminal-deuten':
      for (const i of korrekteIndizes(s.korrekt)) klick(el.querySelector(`.option[data-original="${i}"]`));
      return;
    case 'lueckentext':
      if (s.auswahl?.length) {
        for (const l of s.luecken) {
          const wort = l.loesungen.find((x) => s.auswahl!.includes(x))!;
          const chip = [...el.querySelectorAll<HTMLButtonElement>('.chip')].find((c) => !c.disabled && c.textContent === wort);
          klick(chip);
        }
      } else {
        el.querySelectorAll<HTMLInputElement>('.luecke-eingabe').forEach((inp, i) => {
          inp.value = s.luecken[i].loesungen[0];
          inp.dispatchEvent(new Event('input'));
        });
      }
      return;
    case 'reihenfolge':
      for (const e of s.elemente) {
        const html = inline(e);
        klick([...el.querySelectorAll('.reihen-pool .chip')].find((c) => c.innerHTML === html));
      }
      return;
    case 'zuordnen': {
      const spalten = el.querySelectorAll('.paar-spalte');
      s.paare.forEach((_, i) => {
        klick(spalten[0].children[i]);
        klick(spalten[1].querySelector(`[data-original="${i}"]`));
      });
      return;
    }
    case 'fehler-finden':
      klick(el.querySelector(`.zeile-knopf[data-nr="${s.fehlerZeile}"]`));
      return;
  }
}

describe('Inhalte', () => {
  it('es gibt Lektionen', () => expect(lektionen.length).toBeGreaterThan(0));

  for (const l of lektionen) {
    describe(l.id, () => {
      l.schritte.forEach((s, i) => {
        it(`Schritt ${i + 1} (${s.typ}) ist lösbar`, () => {
          const inst = uebungErzeugen(s, () => {});
          document.body.replaceChildren(inst.element);
          if (inst.interaktiv) expect(inst.bereit()).toBe(false);
          richtigBeantworten(s, inst.element);
          expect(inst.bereit()).toBe(true);
          expect(inst.pruefen().korrekt).toBe(true);
        });
      });
    });
  }
});
