// Struktur des gespeicherten Fortschritts und Normalisierung (auch für den Import).

export interface LektionsFortschritt {
  abgeschlossenAm: string;
  besteGenauigkeit: number;
  durchgaenge: number;
}

export interface LeitnerKarte {
  box: number; // 1..5
  faellig: string; // YYYY-MM-DD
}

export interface Streak {
  aktuell: number;
  laengste: number;
  letzterTag: string | null;
}

export type Thema = 'system' | 'hell' | 'dunkel';

export interface Einstellungen {
  thema: Thema;
  erkunden: boolean; // alle Lektionen freischalten
  tagesziel: number; // XP pro Tag
}

export const TAGESZIELE = [10, 20, 35, 50];

export interface Fortschritt {
  version: 2;
  xp: number;
  lektionen: Record<string, LektionsFortschritt>;
  streak: Streak;
  leitner: Record<string, LeitnerKarte>;
  gemeistert: number;
  perfekt: number; // fehlerfrei abgeschlossene Lektionsdurchgänge
  aktivitaet: Record<string, number>; // Tag -> XP
  einstellungen: Einstellungen;
}

export function leererFortschritt(): Fortschritt {
  return {
    version: 2,
    xp: 0,
    lektionen: {},
    streak: { aktuell: 0, laengste: 0, letzterTag: null },
    leitner: {},
    gemeistert: 0,
    perfekt: 0,
    aktivitaet: {},
    einstellungen: { thema: 'system', erkunden: false, tagesziel: 20 },
  };
}

const TAG = /^\d{4}-\d{2}-\d{2}$/;

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function zahl(x: unknown, standard: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  return typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : standard;
}

/** Nimmt beliebige Daten entgegen und liefert einen gültigen Fortschritt (oder wirft). */
export function normalisieren(roh: unknown): Fortschritt {
  if (!istObjekt(roh) || roh.version !== 2) throw new Error('Unbekanntes Fortschrittsformat.');
  const f = leererFortschritt();
  f.xp = Math.round(zahl(roh.xp, 0));
  f.gemeistert = Math.round(zahl(roh.gemeistert, 0));
  f.perfekt = Math.round(zahl(roh.perfekt, 0));

  if (istObjekt(roh.lektionen)) {
    for (const [lektionId, l] of Object.entries(roh.lektionen)) {
      if (!istObjekt(l) || typeof l.abgeschlossenAm !== 'string' || !TAG.test(l.abgeschlossenAm)) continue;
      f.lektionen[lektionId] = {
        abgeschlossenAm: l.abgeschlossenAm,
        besteGenauigkeit: zahl(l.besteGenauigkeit, 0, 0, 1),
        durchgaenge: Math.round(zahl(l.durchgaenge, 1, 1)),
      };
    }
  }
  if (istObjekt(roh.streak)) {
    const s = roh.streak;
    f.streak = {
      aktuell: Math.round(zahl(s.aktuell, 0)),
      laengste: Math.round(zahl(s.laengste, 0)),
      letzterTag: typeof s.letzterTag === 'string' && TAG.test(s.letzterTag) ? s.letzterTag : null,
    };
  }
  if (istObjekt(roh.leitner)) {
    for (const [k, karte] of Object.entries(roh.leitner)) {
      if (!istObjekt(karte) || typeof karte.faellig !== 'string' || !TAG.test(karte.faellig)) continue;
      f.leitner[k] = { box: Math.round(zahl(karte.box, 1, 1, 5)), faellig: karte.faellig };
    }
  }
  if (istObjekt(roh.aktivitaet)) {
    for (const [tag, xp] of Object.entries(roh.aktivitaet)) {
      if (TAG.test(tag)) f.aktivitaet[tag] = Math.round(zahl(xp, 0));
    }
  }
  if (istObjekt(roh.einstellungen)) {
    const e = roh.einstellungen;
    if (e.thema === 'hell' || e.thema === 'dunkel' || e.thema === 'system') f.einstellungen.thema = e.thema;
    f.einstellungen.erkunden = e.erkunden === true;
    if (typeof e.tagesziel === 'number' && TAGESZIELE.includes(e.tagesziel)) f.einstellungen.tagesziel = e.tagesziel;
  }
  return f;
}
