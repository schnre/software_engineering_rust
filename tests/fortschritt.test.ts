import { describe, expect, it } from 'vitest';
import { erreichteAbzeichen, neueAbzeichen } from '../src/progress/abzeichen';
import { lektionAbschliessen, wiederholungAbschliessen } from '../src/progress/aktionen';
import { plusTage, tageZwischen } from '../src/progress/datum';
import { importText, exportText } from '../src/progress/export';
import { faelligeKarten, wiederholungVerbuchen } from '../src/progress/leitner';
import { streakAktualisieren, streakHeute } from '../src/progress/streak';
import { levelFuer } from '../src/progress/xp';
import { leererFortschritt, normalisieren } from '../src/progress/zustand';

describe('Datum', () => {
  it('rechnet über Monatsgrenzen', () => {
    expect(plusTage('2026-01-31', 1)).toBe('2026-02-01');
    expect(tageZwischen('2026-03-28', '2026-04-02')).toBe(5);
  });
});

describe('Streak', () => {
  it('zählt aufeinanderfolgende Tage und beginnt nach einer Lücke neu', () => {
    let s = leererFortschritt().streak;
    s = streakAktualisieren(s, '2026-05-01');
    s = streakAktualisieren(s, '2026-05-02');
    s = streakAktualisieren(s, '2026-05-02');
    expect(s.aktuell).toBe(2);
    s = streakAktualisieren(s, '2026-05-05');
    expect(s).toEqual({ aktuell: 1, laengste: 2, letzterTag: '2026-05-05' });
  });

  it('zeigt einen verfallenen Streak als 0 an', () => {
    const s = { aktuell: 4, laengste: 4, letzterTag: '2026-05-01' };
    expect(streakHeute(s, '2026-05-02')).toBe(4);
    expect(streakHeute(s, '2026-05-03')).toBe(0);
  });
});

describe('Level', () => {
  it('ordnet XP den Stufen zu', () => {
    expect(levelFuer(0).level.name).toBe('Junior');
    expect(levelFuer(450).level.name).toBe('Mid');
    expect(levelFuer(5000).level.name).toBe('Principal');
    expect(levelFuer(225).anteil).toBeCloseTo(0.5);
  });
});

describe('Lektion abschliessen', () => {
  it('vergibt Bonus-XP für fehlerfreie Durchgänge', () => {
    const f = leererFortschritt();
    const e = lektionAbschliessen(f, 'p1-m1-l1', [{ schluessel: 'a', korrekt: true }], '2026-05-01');
    expect(e.xp).toBe(15);
    expect(e.fehlerfrei).toBe(true);
    expect(f.lektionen['p1-m1-l1'].durchgaenge).toBe(1);
  });

  it('legt falsche Antworten in Box 1 und gibt bei Wiederholung weniger XP', () => {
    const f = leererFortschritt();
    lektionAbschliessen(f, 'x', [{ schluessel: 'x#1', korrekt: false }, { schluessel: 'x#2', korrekt: true }], '2026-05-01');
    expect(f.leitner['x#1']).toEqual({ box: 1, faellig: '2026-05-01' });
    expect(f.leitner['x#2']).toBeUndefined();
    const e = lektionAbschliessen(f, 'x', [], '2026-05-01');
    expect(e.xp).toBe(4);
    expect(f.lektionen.x.besteGenauigkeit).toBe(1);
  });
});

describe('Leitner', () => {
  it('befördert bis Box 5 und meistert danach', () => {
    const f = leererFortschritt();
    f.leitner.k = { box: 1, faellig: '2026-05-01' };
    let tag = '2026-05-01';
    for (const box of [2, 3, 4, 5]) {
      expect(wiederholungVerbuchen(f, 'k', true, tag)).toBe('befoerdert');
      expect(f.leitner.k.box).toBe(box);
      tag = f.leitner.k.faellig;
    }
    expect(f.leitner.k.faellig).toBe(plusTage('2026-05-01', 2 + 4 + 8 + 16));
    expect(wiederholungVerbuchen(f, 'k', true, tag)).toBe('gemeistert');
    expect(f.leitner.k).toBeUndefined();
    expect(f.gemeistert).toBe(1);
  });

  it('setzt falsche Antworten zurück in Box 1, fällig am Folgetag', () => {
    const f = leererFortschritt();
    f.leitner.k = { box: 4, faellig: '2026-05-01' };
    wiederholungVerbuchen(f, 'k', false, '2026-05-01');
    expect(f.leitner.k).toEqual({ box: 1, faellig: '2026-05-02' });
    expect(faelligeKarten(f, '2026-05-01')).toEqual([]);
    expect(faelligeKarten(f, '2026-05-02')).toEqual(['k']);
  });

  it('Training befördert nicht, merkt aber Fehler', () => {
    const f = leererFortschritt();
    const e = wiederholungAbschliessen(f, [{ schluessel: 'a', korrekt: true }, { schluessel: 'b', korrekt: false }], '2026-05-01', 'training');
    expect(f.leitner.a).toBeUndefined();
    expect(f.leitner.b.box).toBe(1);
    expect(e.xp).toBe(1 + 3);
    expect(f.streak.aktuell).toBe(1);
  });
});

describe('Abzeichen', () => {
  it('werden aus dem Fortschritt berechnet und neue erkannt', () => {
    const f = leererFortschritt();
    const k = { fertigePhasen: new Set<number>(), lektionenGesamt: 3 };
    const vorher = erreichteAbzeichen(f, k);
    expect(vorher.size).toBe(0);
    lektionAbschliessen(f, 'p1-m1-l1', [{ schluessel: 'a', korrekt: true }], '2026-05-01');
    const nachher = erreichteAbzeichen(f, { ...k, fertigePhasen: new Set([1]) });
    expect(neueAbzeichen(vorher, nachher).map((a) => a.id)).toEqual(['erste', 'perfekt1', 'phase1']);
    expect(f.perfekt).toBe(1);
  });

  it('Tagesziel wird beim Import nur mit erlaubten Werten übernommen', () => {
    expect(normalisieren({ version: 2, einstellungen: { tagesziel: 35 } }).einstellungen.tagesziel).toBe(35);
    expect(normalisieren({ version: 2, einstellungen: { tagesziel: 999 } }).einstellungen.tagesziel).toBe(20);
  });
});

describe('Export und Import', () => {
  it('überträgt den Fortschritt verlustfrei', () => {
    const f = leererFortschritt();
    lektionAbschliessen(f, 'p1-m1-l1', [{ schluessel: 'p1-m1-l1#2', korrekt: false }], '2026-05-01');
    f.einstellungen.thema = 'dunkel';
    expect(importText(exportText(f))).toEqual(f);
  });

  it('weist fremde oder kaputte Dateien ab', () => {
    expect(() => importText('{kein json')).toThrow(/JSON/);
    expect(() => importText(JSON.stringify({ app: 'andere-app', fortschritt: {} }))).toThrow(/Rust Engineering Academy/);
    expect(() => importText(JSON.stringify({ version: 99 }))).toThrow();
  });

  it('bereinigt ungültige Felder', () => {
    const f = normalisieren({ version: 2, xp: -5, leitner: { a: { box: 9, faellig: '2026-01-01' }, b: { box: 1, faellig: 'gestern' } } });
    expect(f.xp).toBe(0);
    expect(f.leitner).toEqual({ a: { box: 5, faellig: '2026-01-01' } });
  });

  it('lehnt Fortschritt in einem fremden Format ab', () => {
    expect(() => normalisieren({ version: 1, lektionen: {} })).toThrow(/Fortschrittsformat/);
  });
});
