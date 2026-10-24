// Leitner-System mit 5 Boxen. Je höher die Box, desto länger der Abstand bis zur nächsten Abfrage.
import { plusTage } from './datum';
import type { Fortschritt } from './zustand';

export const BOXEN = 5;
/** Abstand in Tagen, nachdem eine Karte in Box n gelandet ist. */
export const INTERVALLE = [0, 1, 2, 4, 8, 16];

/** Falsch beantwortet in einer Lektion oder im Training: in Box 1, sofort wiederholbar. */
export function alsFalschMerken(f: Fortschritt, schluessel: string, tag: string): void {
  f.leitner[schluessel] = { box: 1, faellig: tag };
}

export type LeitnerAusgang = 'befoerdert' | 'zurueck' | 'gemeistert';

/** Antwort in einer Wiederholung verbuchen. */
export function wiederholungVerbuchen(
  f: Fortschritt,
  schluessel: string,
  korrekt: boolean,
  tag: string,
): LeitnerAusgang {
  const karte = f.leitner[schluessel] ?? { box: 1, faellig: tag };
  if (!korrekt) {
    f.leitner[schluessel] = { box: 1, faellig: plusTage(tag, INTERVALLE[1]) };
    return 'zurueck';
  }
  if (karte.box >= BOXEN) {
    delete f.leitner[schluessel];
    f.gemeistert++;
    return 'gemeistert';
  }
  const box = karte.box + 1;
  f.leitner[schluessel] = { box, faellig: plusTage(tag, INTERVALLE[box]) };
  return 'befoerdert';
}

export function faelligeKarten(f: Fortschritt, tag: string): string[] {
  return Object.entries(f.leitner)
    .filter(([, k]) => k.faellig <= tag)
    .sort((a, b) => a[1].box - b[1].box || a[1].faellig.localeCompare(b[1].faellig))
    .map(([s]) => s);
}

export function kartenProBox(f: Fortschritt): number[] {
  const zaehler = Array<number>(BOXEN).fill(0);
  for (const k of Object.values(f.leitner)) zaehler[k.box - 1]++;
  return zaehler;
}

export function naechsteFaelligkeit(f: Fortschritt, tag: string): string | undefined {
  const kuenftig = Object.values(f.leitner)
    .map((k) => k.faellig)
    .filter((d) => d > tag)
    .sort();
  return kuenftig[0];
}
