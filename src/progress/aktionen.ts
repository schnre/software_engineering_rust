// Fachliche Aktionen, die den Fortschritt verändern. Rein und testbar: der Aufrufer speichert.
import { alsFalschMerken, wiederholungVerbuchen } from './leitner';
import { streakAktualisieren } from './streak';
import { levelFuer, xpFuerLektion, XP_PRO_RICHTIGER_WIEDERHOLUNG, XP_WIEDERHOLUNG_ABGESCHLOSSEN } from './xp';
import type { Fortschritt } from './zustand';

export interface Antwort {
  schluessel: string;
  korrekt: boolean;
}

export interface Ergebnis {
  xp: number;
  genauigkeit: number;
  streak: number;
  levelAufstieg?: string;
  ersterAbschluss: boolean;
  fehlerfrei: boolean;
  gemeistert: number;
}

function xpGutschreiben(f: Fortschritt, xp: number, tag: string): string | undefined {
  const vorher = levelFuer(f.xp).index;
  f.xp += xp;
  f.aktivitaet[tag] = (f.aktivitaet[tag] ?? 0) + xp;
  const nachher = levelFuer(f.xp);
  return nachher.index > vorher ? nachher.level.name : undefined;
}

function anteilRichtig(antworten: Antwort[]): number {
  return antworten.length ? antworten.filter((a) => a.korrekt).length / antworten.length : 1;
}

export function lektionAbschliessen(f: Fortschritt, lektionId: string, antworten: Antwort[], tag: string): Ergebnis {
  const genauigkeit = anteilRichtig(antworten);
  const fehlerfrei = antworten.every((a) => a.korrekt);
  const bisher = f.lektionen[lektionId];
  const ersterAbschluss = !bisher;

  for (const a of antworten) if (!a.korrekt) alsFalschMerken(f, a.schluessel, tag);
  if (fehlerfrei) f.perfekt++;

  f.lektionen[lektionId] = {
    abgeschlossenAm: bisher?.abgeschlossenAm ?? tag,
    besteGenauigkeit: Math.max(bisher?.besteGenauigkeit ?? 0, genauigkeit),
    durchgaenge: (bisher?.durchgaenge ?? 0) + 1,
  };

  const xp = xpFuerLektion(ersterAbschluss, fehlerfrei);
  const levelAufstieg = xpGutschreiben(f, xp, tag);
  f.streak = streakAktualisieren(f.streak, tag);
  return { xp, genauigkeit, streak: f.streak.aktuell, levelAufstieg, ersterAbschluss, fehlerfrei, gemeistert: 0 };
}

export function wiederholungAbschliessen(
  f: Fortschritt,
  antworten: Antwort[],
  tag: string,
  modus: 'leitner' | 'training',
): Ergebnis {
  let gemeistert = 0;
  for (const a of antworten) {
    if (modus === 'leitner') {
      if (wiederholungVerbuchen(f, a.schluessel, a.korrekt, tag) === 'gemeistert') gemeistert++;
    } else if (!a.korrekt) {
      alsFalschMerken(f, a.schluessel, tag);
    }
  }
  const richtige = antworten.filter((a) => a.korrekt).length;
  const xp = antworten.length ? richtige * XP_PRO_RICHTIGER_WIEDERHOLUNG + XP_WIEDERHOLUNG_ABGESCHLOSSEN : 0;
  const levelAufstieg = xpGutschreiben(f, xp, tag);
  if (antworten.length) f.streak = streakAktualisieren(f.streak, tag);
  return {
    xp,
    genauigkeit: anteilRichtig(antworten),
    streak: f.streak.aktuell,
    levelAufstieg,
    ersterAbschluss: false,
    fehlerfrei: richtige === antworten.length,
    gemeistert,
  };
}
