// Tages-Streak: mindestens eine abgeschlossene Lektion oder Wiederholung pro Tag.
import { tageZwischen } from './datum';
import type { Streak } from './zustand';

export function streakAktualisieren(s: Streak, tag: string): Streak {
  if (s.letzterTag === tag) return s;
  const fortgesetzt = s.letzterTag !== null && tageZwischen(s.letzterTag, tag) === 1;
  const aktuell = fortgesetzt ? s.aktuell + 1 : 1;
  return { aktuell, laengste: Math.max(s.laengste, aktuell), letzterTag: tag };
}

/** Streak, wie er heute angezeigt wird: verfällt, wenn gestern nichts gemacht wurde. */
export function streakHeute(s: Streak, tag: string): number {
  if (s.letzterTag === null) return 0;
  return tageZwischen(s.letzterTag, tag) <= 1 ? s.aktuell : 0;
}
