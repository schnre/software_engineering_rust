import { describe, expect, it } from 'vitest';
import { naechsteLektion, statusListe } from '../src/engine/freischaltung';
import { Sitzung } from '../src/engine/session';
import { auswahlKorrekt } from '../src/exercises/auswahl';
import { lueckeKorrekt } from '../src/exercises/lueckentext';
import { reihenfolgeKorrekt } from '../src/exercises/reihenfolge';
import { zuordnungKorrekt } from '../src/exercises/zuordnen';

describe('Sitzung', () => {
  it('stellt falsch beantwortete Schritte einmal ans Ende', () => {
    const s = new Sitzung(['a', 'b', 'c'], 1);
    expect(s.aktuell).toBe('a');
    s.beantworten(false);
    s.weiter();
    s.beantworten(true);
    s.weiter();
    s.weiter(); // c: Erklärung
    expect(s.aktuell).toBe('a');
    expect(s.istWiederholung).toBe(true);
    s.beantworten(false); // zweiter Fehlversuch: nicht nochmals einreihen
    s.weiter();
    expect(s.fertig).toBe(true);
    expect(s.genauigkeit).toBe(0.5);
    expect(s.fehlerfrei).toBe(false);
  });

  it('wiederholt ohne Wiederholungen nichts', () => {
    const s = new Sitzung(['a'], 0);
    s.beantworten(false);
    s.weiter();
    expect(s.fertig).toBe(true);
  });
});

describe('Freischaltung', () => {
  const ids = ['a', 'b', 'c', 'd'];
  it('schaltet nur die nächste Lektion frei', () => {
    expect(statusListe(ids, new Set(['a']), false)).toEqual(['abgeschlossen', 'aktuell', 'gesperrt', 'gesperrt']);
  });
  it('öffnet im Erkundungsmodus alles', () => {
    expect(statusListe(ids, new Set(['c']), true)).toEqual(['aktuell', 'offen', 'abgeschlossen', 'offen']);
  });
  it('empfiehlt die nächste offene Lektion', () => {
    const st = statusListe(ids, new Set(['a', 'b']), false);
    expect(naechsteLektion(ids, st, 'b')).toBe('c');
  });
});

describe('Auswertung der Übungstypen', () => {
  it('Auswahl: exakte Menge zählt', () => {
    expect(auswahlKorrekt(1, [1])).toBe(true);
    expect(auswahlKorrekt([0, 2], [2, 0])).toBe(true);
    expect(auswahlKorrekt([0, 2], [0])).toBe(false);
    expect(auswahlKorrekt(1, [1, 2])).toBe(false);
  });
  it('Lücken: Leerzeichen egal, Gross/Klein je nach Modus', () => {
    expect(lueckeKorrekt(['-c'], ' -c ', true)).toBe(true);
    expect(lueckeKorrekt(['-c'], '-C', true)).toBe(false);
    expect(lueckeKorrekt(['Linker'], 'linker', false)).toBe(true);
    expect(lueckeKorrekt(['std::move', 'move'], 'move', true)).toBe(true);
  });
  it('Reihenfolge und Zuordnung', () => {
    expect(reihenfolgeKorrekt(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(reihenfolgeKorrekt(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(zuordnungKorrekt([0, 1, 2])).toBe(true);
    expect(zuordnungKorrekt([1, 0, 2])).toBe(false);
  });
});
