// Lückentext in Fliesstext oder Code. Lücken werden mit {{?}} markiert.
// Mit "auswahl" füllt man Lücken per Antippen von Wortbausteinen, sonst per Texteingabe.
import type { Lueckentext } from '../types';
import { escapeHtml, h, mischen } from '../ui/dom';
import { fragmenteHervorheben } from '../ui/highlight';
import { inline } from '../ui/markdown';
import { frageAnzeige } from './bausteine';
import type { Renderer } from './typen';

export const MARKE = '{{?}}';

export function normalisieren(s: string, gross: boolean): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return gross ? t : t.toLowerCase();
}

export function lueckeKorrekt(loesungen: string[], eingabe: string, grossKlein: boolean): boolean {
  const ist = normalisieren(eingabe, grossKlein);
  return loesungen.some((l) => normalisieren(l, grossKlein) === ist);
}

interface Slot {
  wert: string;
  element: HTMLButtonElement | HTMLInputElement;
  chip?: HTMLButtonElement;
}

export const lueckentext: Renderer<Lueckentext> = (s, aenderung) => {
  const imCode = !!s.code;
  const slots: Slot[] = [];
  let aktiv = 0;
  let gesperrt = false;
  const mitAuswahl = !!s.auswahl?.length;

  function slotErzeugen(): HTMLElement {
    const nr = slots.length;
    const breite = Math.max(3, ...s.luecken[nr].loesungen.map((l) => l.length)) + 1;
    if (mitAuswahl) {
      const knopf = h('button', {
        type: 'button',
        class: 'luecke luecke-knopf leer',
        'aria-label': `Lücke ${nr + 1}, leer`,
        onClick: () => slotAntippen(nr),
      }, ' '.repeat(Math.min(breite, 12)));
      slots.push({ wert: '', element: knopf });
      return knopf;
    }
    const eingabe = h('input', {
      type: 'text',
      class: 'luecke luecke-eingabe',
      size: Math.min(breite, 24),
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'aria-label': `Lücke ${nr + 1}`,
    });
    const slot: Slot = { wert: '', element: eingabe };
    eingabe.addEventListener('input', () => {
      slot.wert = eingabe.value;
      aenderung();
    });
    slots.push(slot);
    return eingabe;
  }

  function mitLuecken(text: string, darstellen: (teile: string[]) => string[]): (Node | string)[] {
    const teile = text.split(MARKE);
    const html = darstellen(teile);
    const knoten: (Node | string)[] = [];
    html.forEach((teil, i) => {
      knoten.push(h('span', { html: teil }));
      if (i < teile.length - 1) knoten.push(slotErzeugen());
    });
    return knoten;
  }

  let inhalt: HTMLElement;
  if (s.code) {
    const sprache = s.code.sprache;
    inhalt = h('figure', { class: 'code-figur' },
      s.code.datei ? h('figcaption', { class: 'code-kopf' }, h('span', { class: 'code-datei' }, s.code.datei)) : null,
      h('pre', { class: 'code' }, h('code', {}, s.code.zeilen.map((zeile, i) =>
        h('span', { class: 'zeile', 'data-nr': i + 1 }, mitLuecken(zeile, (t) => fragmenteHervorheben(t, sprache)), zeile ? null : ' ')))),
    );
  } else {
    inhalt = h('p', { class: 'lueckentext' }, mitLuecken(s.text ?? '', (t) => t.map(inline)));
  }

  const chips: HTMLButtonElement[] = [];
  const bank = mitAuswahl
    ? h('div', { class: 'wortbank', role: 'group', 'aria-label': 'Bausteine' },
        mischen(s.auswahl!).map((wort) => {
          const chip = h('button', { type: 'button', class: 'chip', onClick: () => chipAntippen(chip, wort) },
            imCode ? h('code', {}, wort) : wort);
          chips.push(chip);
          return chip;
        }))
    : null;

  function markiereAktiv() {
    slots.forEach((sl, i) => sl.element.classList.toggle('aktiv', mitAuswahl && i === aktiv && !gesperrt));
  }

  function slotSetzen(nr: number, wert: string, chip?: HTMLButtonElement) {
    const slot = slots[nr];
    const knopf = slot.element as HTMLButtonElement;
    if (slot.chip) slot.chip.disabled = false;
    slot.wert = wert;
    slot.chip = chip;
    knopf.classList.toggle('leer', !wert);
    knopf.innerHTML = wert ? (imCode ? `<code>${escapeHtml(wert)}</code>` : escapeHtml(wert)) : '    ';
    knopf.setAttribute('aria-label', `Lücke ${nr + 1}, ${wert || 'leer'}`);
    if (chip) chip.disabled = true;
  }

  function chipAntippen(chip: HTMLButtonElement, wort: string) {
    if (gesperrt) return;
    let ziel = slots[aktiv] && !slots[aktiv].wert ? aktiv : slots.findIndex((sl) => !sl.wert);
    if (ziel < 0) ziel = aktiv;
    slotSetzen(ziel, wort, chip);
    const naechste = slots.findIndex((sl) => !sl.wert);
    aktiv = naechste >= 0 ? naechste : ziel;
    markiereAktiv();
    aenderung();
  }

  function slotAntippen(nr: number) {
    if (gesperrt) return;
    if (slots[nr].wert) slotSetzen(nr, '');
    aktiv = nr;
    markiereAktiv();
    aenderung();
  }

  markiereAktiv();
  const element = h('div', { class: 'uebung lueckentext-uebung' },
    frageAnzeige(s.frage), inhalt, bank,
    mitAuswahl ? null : h('p', { class: 'hinweis-klein' }, 'Tippe die fehlenden Begriffe in die Felder.'),
  );

  return {
    element,
    interaktiv: true,
    bereit: () => slots.every((sl) => sl.wert.trim() !== ''),
    pruefen: () => {
      gesperrt = true;
      markiereAktiv();
      let alle = true;
      slots.forEach((sl, i) => {
        const ok = lueckeKorrekt(s.luecken[i].loesungen, sl.wert, imCode || mitAuswahl);
        alle &&= ok;
        sl.element.classList.add(ok ? 'ist-richtig' : 'ist-falsch');
        sl.element.setAttribute('aria-label', `Lücke ${i + 1}: ${sl.wert}, ${ok ? 'richtig' : 'falsch'}`);
        if (sl.element instanceof HTMLInputElement) sl.element.readOnly = true;
        else sl.element.disabled = true;
      });
      for (const c of chips) c.disabled = true;
      const loesung = alle
        ? undefined
        : s.luecken.map((l, i) => `Lücke ${i + 1}: <code>${escapeHtml(l.loesungen[0])}</code>`).join('<br>');
      return { korrekt: alle, loesung };
    },
  };
};
