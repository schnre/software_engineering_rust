// Abzeichen werden aus dem Fortschritt berechnet und nicht gespeichert.
// So bleiben sie nach Import und auf jedem Gerät konsistent.
import type { Fortschritt } from './zustand';
import { LEVELS } from './xp';

export interface Abzeichen {
  id: string;
  symbol: string;
  titel: string;
  beschreibung: string;
}

export interface AbzeichenKontext {
  /** Nummern der Phasen, deren Lektionen alle abgeschlossen sind. */
  fertigePhasen: Set<number>;
  /** Anzahl verfügbarer Lektionen insgesamt. */
  lektionenGesamt: number;
}

interface Regel extends Abzeichen {
  erreicht: (f: Fortschritt, k: AbzeichenKontext) => boolean;
}

const anzahl = (f: Fortschritt) => Object.keys(f.lektionen).length;

const REGELN: Regel[] = [
  { id: 'erste', symbol: '🌱', titel: 'Erster Schritt', beschreibung: 'Die erste Lektion abgeschlossen', erreicht: (f) => anzahl(f) >= 1 },
  { id: 'zehn', symbol: '📚', titel: 'Dranbleiben', beschreibung: '10 Lektionen abgeschlossen', erreicht: (f) => anzahl(f) >= 10 },
  { id: 'fuenfzig', symbol: '🏔️', titel: 'Halbe Strecke', beschreibung: '50 Lektionen abgeschlossen', erreicht: (f) => anzahl(f) >= 50 },
  { id: 'alle', symbol: '👑', titel: 'Alles gelernt', beschreibung: 'Jede Lektion abgeschlossen', erreicht: (f, k) => k.lektionenGesamt > 0 && anzahl(f) >= k.lektionenGesamt },
  { id: 'streak3', symbol: '🔥', titel: 'Warmgelaufen', beschreibung: '3 Tage in Folge gelernt', erreicht: (f) => f.streak.laengste >= 3 },
  { id: 'streak7', symbol: '⚡', titel: 'Eine Woche am Stück', beschreibung: '7 Tage in Folge gelernt', erreicht: (f) => f.streak.laengste >= 7 },
  { id: 'streak30', symbol: '🌋', titel: 'Gewohnheit', beschreibung: '30 Tage in Folge gelernt', erreicht: (f) => f.streak.laengste >= 30 },
  { id: 'perfekt1', symbol: '🎯', titel: 'Volltreffer', beschreibung: 'Eine Lektion ohne Fehler', erreicht: (f) => f.perfekt >= 1 },
  { id: 'perfekt20', symbol: '💎', titel: 'Präzisionsarbeit', beschreibung: '20 Lektionen ohne Fehler', erreicht: (f) => f.perfekt >= 20 },
  { id: 'gemeistert', symbol: '🧠', titel: 'Langzeitgedächtnis', beschreibung: '25 Übungen durch alle Wiederholungs-Boxen gebracht', erreicht: (f) => f.gemeistert >= 25 },
  { id: 'phase1', symbol: '🔧', titel: 'Cargo-Kenner', beschreibung: 'Phase 1 „Unter der Haube“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(1) },
  { id: 'phase3', symbol: '🦀', titel: 'Trait-Magier', beschreibung: 'Phase 3 „Fortgeschrittenes Rust“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(3) },
  { id: 'phase2', symbol: '🧱', titel: 'Borrow-Checker-Freund', beschreibung: 'Phase 2 „Rust-Fundamente“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(2) },
  { id: 'phase6', symbol: '🔌', titel: 'Hardware-Flüsterer', beschreibung: 'Phase 6 „Embedded: Hardware verstehen“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(6) },
  { id: 'phase7', symbol: '⏱️', titel: 'Echtzeit-Profi', beschreibung: 'Phase 7 „Embedded-Software und RTOS“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(7) },
  { id: 'phase11', symbol: '🗺️', titel: 'Architekt', beschreibung: 'Phase 11 „Architekturstile“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(11) },
  { id: 'phase12', symbol: '🛡️', titel: 'Sicherheitsbewusst', beschreibung: 'Phase 12 „Funktionale Sicherheit und Security“ abgeschlossen', erreicht: (_, k) => k.fertigePhasen.has(12) },
  { id: 'senior', symbol: '🎓', titel: 'Senior', beschreibung: 'Das Level Senior erreicht', erreicht: (f) => f.xp >= (LEVELS.find((l) => l.name === 'Senior')?.ab ?? 0) },
];

export const ALLE_ABZEICHEN: Abzeichen[] = REGELN.map(({ erreicht: _, ...a }) => a);

export function erreichteAbzeichen(f: Fortschritt, k: AbzeichenKontext): Set<string> {
  return new Set(REGELN.filter((r) => r.erreicht(f, k)).map((r) => r.id));
}

export function neueAbzeichen(vorher: Set<string>, nachher: Set<string>): Abzeichen[] {
  return ALLE_ABZEICHEN.filter((a) => nachher.has(a.id) && !vorher.has(a.id));
}
