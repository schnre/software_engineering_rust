// Lädt Curriculum und Lektionen. Neue Lektionen werden über den Glob automatisch gefunden,
// es braucht dafür keine Code-Änderung – nur eine JSON-Datei und einen Eintrag im Curriculum.
import curriculumJson from '../../content/curriculum.json';
import type { Curriculum, Lektion, Modul, Phase, Schritt } from '../types';
import { istInteraktiv } from '../types';

const dateien = import.meta.glob<Lektion>('../../content/phase-*/*.json', {
  eager: true,
  import: 'default',
});

export const curriculum = curriculumJson as Curriculum;

const lektionenNachId = new Map<string, Lektion>();
for (const lektion of Object.values(dateien)) lektionenNachId.set(lektion.id, lektion);

export interface LektionsEintrag {
  lektion: Lektion;
  phase: Phase;
  modul: Modul;
  index: number; // Position im gesamten Lernpfad
}

/** Alle verfügbaren Lektionen in der Reihenfolge des Curriculums. */
export const lernpfad: LektionsEintrag[] = [];
for (const phase of curriculum.phasen) {
  for (const modul of phase.module) {
    for (const id of modul.lektionen) {
      const lektion = lektionenNachId.get(id);
      if (!lektion) {
        console.warn(`Lektion ${id} steht im Curriculum, die Datei fehlt.`);
        continue;
      }
      lernpfad.push({ lektion, phase, modul, index: lernpfad.length });
    }
  }
}

const eintragNachId = new Map(lernpfad.map((e) => [e.lektion.id, e]));

export function eintrag(id: string): LektionsEintrag | undefined {
  return eintragNachId.get(id);
}

/** Stabiler Schlüssel einer Übung für die Wiederholungs-Boxen. */
export function schrittSchluessel(lektionId: string, schritt: Schritt, index: number): string {
  return `${lektionId}#${schritt.id ?? index}`;
}

export interface UebungsReferenz {
  schluessel: string;
  lektion: Lektion;
  schritt: Schritt;
}

const uebungNachSchluessel = new Map<string, UebungsReferenz>();
for (const { lektion } of lernpfad) {
  lektion.schritte.forEach((schritt, i) => {
    if (!istInteraktiv(schritt)) return;
    const schluessel = schrittSchluessel(lektion.id, schritt, i);
    uebungNachSchluessel.set(schluessel, { schluessel, lektion, schritt });
  });
}

export function uebung(schluessel: string): UebungsReferenz | undefined {
  return uebungNachSchluessel.get(schluessel);
}

export function uebungenVon(lektionIds: Iterable<string>): UebungsReferenz[] {
  const ids = new Set(lektionIds);
  return [...uebungNachSchluessel.values()].filter((u) => ids.has(u.lektion.id));
}
