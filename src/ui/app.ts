// Zentraler App-Zustand: Fortschritt im Speicher halten und nach Änderungen speichern.
import { curriculum, lernpfad } from '../engine/content';
import { erreichteAbzeichen, type AbzeichenKontext } from '../progress/abzeichen';
import { statusListe, type LektionsStatus } from '../engine/freischaltung';
import { laden, speichern } from '../progress/speicher';
import type { Fortschritt } from '../progress/zustand';

let fortschritt: Fortschritt = laden();
const beobachter = new Set<() => void>();

export function zustand(): Fortschritt {
  return fortschritt;
}

/** Fortschritt ändern, speichern und Beobachter (Kopfzeile, Navigation) informieren. */
export function aendern(fn: (f: Fortschritt) => void): void {
  fn(fortschritt);
  speichern(fortschritt);
  beobachter.forEach((b) => b());
}

export function ersetzen(neu: Fortschritt): void {
  fortschritt = neu;
  speichern(fortschritt);
  beobachter.forEach((b) => b());
}

export function beobachten(fn: () => void): void {
  beobachter.add(fn);
}

export const lernpfadIds = lernpfad.map((e) => e.lektion.id);

export function aktuelleStatus(): Map<string, LektionsStatus> {
  const f = fortschritt;
  const liste = statusListe(lernpfadIds, new Set(Object.keys(f.lektionen)), f.einstellungen.erkunden);
  return new Map(lernpfadIds.map((id, i) => [id, liste[i]]));
}

/** Kontext für die Abzeichen: welche Phasen vollständig abgeschlossen sind. */
export function abzeichenKontext(): AbzeichenKontext {
  const fertig = new Set(Object.keys(fortschritt.lektionen));
  const fertigePhasen = new Set<number>();
  for (const phase of curriculum.phasen) {
    const ids = phase.module.flatMap((m) => m.lektionen);
    if (ids.length && ids.every((id) => fertig.has(id))) fertigePhasen.add(phase.nummer);
  }
  return { fertigePhasen, lektionenGesamt: lernpfadIds.length };
}

export function aktuelleAbzeichen(): Set<string> {
  return erreichteAbzeichen(fortschritt, abzeichenKontext());
}

export function themaAnwenden(): void {
  const t = fortschritt.einstellungen.thema;
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t === 'hell' ? 'light' : 'dark');
}
