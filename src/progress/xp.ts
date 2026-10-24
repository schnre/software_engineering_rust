// XP-Regeln und Level-Stufen.

export const XP_LEKTION = 10;
export const XP_FEHLERFREI = 5;
export const XP_LEKTION_WIEDERHOLT = 4;
export const XP_PRO_RICHTIGER_WIEDERHOLUNG = 1;
export const XP_WIEDERHOLUNG_ABGESCHLOSSEN = 3;

export interface Level {
  name: string;
  ab: number;
  beschreibung: string;
}

export const LEVELS: Level[] = [
  { name: 'Junior', ab: 0, beschreibung: 'Du lernst die Werkzeuge und Grundlagen kennen.' },
  { name: 'Mid', ab: 450, beschreibung: 'Du verstehst, was unter der Haube passiert, und arbeitest selbstständig.' },
  { name: 'Senior', ab: 1350, beschreibung: 'Du triffst und begründest Design-Entscheidungen und hilfst anderen dabei.' },
  { name: 'Principal', ab: 2700, beschreibung: 'Du prägst Architektur und Arbeitsweise über Teams hinweg.' },
];

export interface LevelInfo {
  level: Level;
  index: number;
  naechstes?: Level;
  anteil: number; // Fortschritt zum nächsten Level 0..1
}

export function levelFuer(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].ab) index = i;
  const level = LEVELS[index];
  const naechstes = LEVELS[index + 1];
  const anteil = naechstes ? (xp - level.ab) / (naechstes.ab - level.ab) : 1;
  return { level, index, naechstes, anteil: Math.max(0, Math.min(1, anteil)) };
}

export function xpFuerLektion(ersterAbschluss: boolean, fehlerfrei: boolean): number {
  if (!ersterAbschluss) return XP_LEKTION_WIEDERHOLT;
  return XP_LEKTION + (fehlerfrei ? XP_FEHLERFREI : 0);
}
