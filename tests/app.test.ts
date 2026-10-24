// @vitest-environment jsdom
// End-to-End im simulierten DOM: App starten, erste Lektion vollständig durcharbeiten
// (die erste Übung absichtlich falsch), Ergebnis und gespeicherten Fortschritt prüfen.
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { lernpfad } from '../src/engine/content';
import { korrekteIndizes } from '../src/exercises/auswahl';
import type { Schritt } from '../src/types';
import { inline } from '../src/ui/markdown';

const warten = () => new Promise((r) => setTimeout(r, 0));
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);

function hauptKnopf() {
  return $<HTMLButtonElement>('.sitzung-fuss .knopf-primaer')!;
}

function beantworten(s: Schritt, richtig: boolean) {
  const el = $('.sitzung-buehne .uebung')!;
  switch (s.typ) {
    case 'multiple-choice':
    case 'code-lesen':
    case 'terminal-deuten': {
      const soll = korrekteIndizes(s.korrekt);
      const wahl = richtig ? soll : [s.optionen.findIndex((_, i) => !soll.includes(i))];
      for (const i of wahl) el.querySelector<HTMLElement>(`.option[data-original="${i}"]`)!.click();
      break;
    }
    case 'lueckentext':
      for (const l of s.luecken) {
        const wort = l.loesungen.find((x) => s.auswahl!.includes(x))!;
        [...el.querySelectorAll<HTMLButtonElement>('.chip')].find((c) => !c.disabled && c.textContent === wort)!.click();
      }
      break;
    case 'reihenfolge':
      for (const e of s.elemente) [...el.querySelectorAll<HTMLElement>('.reihen-pool .chip')].find((c) => c.innerHTML === inline(e))!.click();
      break;
    case 'zuordnen': {
      const spalten = el.querySelectorAll('.paar-spalte');
      s.paare.forEach((_, i) => {
        (spalten[0].children[i] as HTMLElement).click();
        spalten[1].querySelector<HTMLElement>(`[data-original="${i}"]`)!.click();
      });
      break;
    }
    case 'fehler-finden':
      el.querySelector<HTMLElement>(`.zeile-knopf[data-nr="${s.fehlerZeile}"]`)!.click();
      break;
    case 'erklaerung':
      break;
  }
}

beforeAll(async () => {
  Element.prototype.scrollIntoView = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  document.body.innerHTML = '<div id="app"></div>';
  localStorage.clear();
  location.hash = '#/';
  await import('../src/main');
});

describe('App', () => {
  it('zeigt den Lernpfad mit der ersten Lektion als aktuell', () => {
    expect(document.querySelectorAll('.phase').length).toBeGreaterThanOrEqual(5);
    const aktuell = $('.knoten.status-aktuell')!;
    expect(aktuell.getAttribute('href')).toBe(`#/lektion/${lernpfad[0].lektion.id}`);
    expect(document.querySelectorAll('a.knoten.status-gesperrt').length).toBe(0);
  });

  it('arbeitet eine Lektion durch und speichert den Fortschritt', async () => {
    const lektion = lernpfad[0].lektion;
    location.hash = `#/lektion/${lektion.id}`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await warten();
    expect($('.lektion-start h1')!.textContent).toBe(lektion.titel);
    $<HTMLButtonElement>('.lektion-start .knopf-primaer')!.click();

    // Schritte in Sitzungsreihenfolge: Die erste Übung wird absichtlich falsch beantwortet
    // und muss am Ende erneut erscheinen.
    const ersteUebung = lektion.schritte.findIndex((s) => s.typ !== 'erklaerung');
    const reihenfolge = [...lektion.schritte.keys(), ersteUebung];
    reihenfolge.forEach((i, n) => {
      const s = lektion.schritte[i];
      const falsch = n === ersteUebung;
      if (s.typ !== 'erklaerung') {
        expect(hauptKnopf().disabled).toBe(true);
        beantworten(s, !falsch);
        expect(hauptKnopf().disabled).toBe(false);
        hauptKnopf().click();
        expect($('.feedback')!.classList.contains(falsch ? 'feedback-falsch' : 'feedback-richtig')).toBe(true);
      }
      expect(hauptKnopf().textContent).toBe('Weiter');
      hauptKnopf().click();
    });

    // Praxis- und Laborkarte, dann Ergebnis
    expect($('.karte-praxis')).not.toBeNull();
    while (!$('.ergebnis')) $<HTMLButtonElement>('.abschluss .knopf-primaer')!.click();
    expect($('.ergebnis h1')!.textContent).toBe('Lektion abgeschlossen!');
    expect($('.ergebnis')!.textContent).toContain('+10');

    const gespeichert = JSON.parse(localStorage.getItem('rust-academy:fortschritt:v1')!);
    expect(gespeichert.xp).toBe(10);
    expect(gespeichert.lektionen[lektion.id].durchgaenge).toBe(1);
    expect(Object.keys(gespeichert.leitner)).toEqual([`${lektion.id}#${ersteUebung}`]);
    expect(gespeichert.streak.aktuell).toBe(1);
  });

  it('schaltet danach die zweite Lektion frei und zeigt die fällige Wiederholung', async () => {
    location.hash = '#/';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await warten();
    expect($('.knoten.status-aktuell')!.getAttribute('href')).toBe(`#/lektion/${lernpfad[1].lektion.id}`);
    expect($('.banner-wiederholen')!.textContent).toContain('1 Übung ist');
    expect($('.nav-badge')!.hidden).toBe(false);
  });

  it('wiederholt die fällige Übung und befördert sie in Box 2', async () => {
    location.hash = '#/wiederholen';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await warten();
    $<HTMLButtonElement>('.ansicht .knopf-primaer')!.click();
    const lektion = lernpfad[0].lektion;
    const ersteUebung = lektion.schritte.findIndex((s) => s.typ !== 'erklaerung');
    beantworten(lektion.schritte[ersteUebung], true);
    hauptKnopf().click();
    hauptKnopf().click();
    expect($('.ergebnis h1')!.textContent).toBe('Wiederholung abgeschlossen!');
    const gespeichert = JSON.parse(localStorage.getItem('rust-academy:fortschritt:v1')!);
    expect(gespeichert.leitner[`${lektion.id}#${ersteUebung}`].box).toBe(2);
  });

  it('rendert Glossar und Profil', async () => {
    for (const route of ['glossar', 'profil']) {
      location.hash = `#/${route}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      await warten();
      expect($('#inhalt h1')!.textContent).toBe(route === 'glossar' ? 'Glossar' : 'Profil');
    }
    expect(document.querySelectorAll('.glossar dt').length).toBe(0); // Profil ist aktiv
  });
});
