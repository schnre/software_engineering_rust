// Registry: Übungstyp -> Renderer. Ein neuer Typ braucht ein Modul hier und im Schema.
import type { Schritt, SchrittTyp } from '../types';
import { codeLesen } from './codeLesen';
import { erklaerung } from './erklaerung';
import { fehlerFinden } from './fehlerFinden';
import { lueckentext } from './lueckentext';
import { multipleChoice } from './multipleChoice';
import { reihenfolge } from './reihenfolge';
import { terminalDeuten } from './terminalDeuten';
import type { Renderer, UebungsInstanz } from './typen';
import { zuordnen } from './zuordnen';

type Registry = { [T in SchrittTyp]: Renderer<Extract<Schritt, { typ: T }>> };

const registry: Registry = {
  'erklaerung': erklaerung,
  'multiple-choice': multipleChoice,
  'lueckentext': lueckentext,
  'reihenfolge': reihenfolge,
  'zuordnen': zuordnen,
  'code-lesen': codeLesen,
  'fehler-finden': fehlerFinden,
  'terminal-deuten': terminalDeuten,
};

export const TYP_NAMEN: Record<SchrittTyp, string> = {
  'erklaerung': 'Erklärung',
  'multiple-choice': 'Multiple Choice',
  'lueckentext': 'Lückentext',
  'reihenfolge': 'Reihenfolge',
  'zuordnen': 'Zuordnen',
  'code-lesen': 'Code lesen',
  'fehler-finden': 'Fehler finden',
  'terminal-deuten': 'Terminal deuten',
};

export function uebungErzeugen(schritt: Schritt, aenderung: () => void): UebungsInstanz {
  const renderer = registry[schritt.typ] as Renderer<Schritt>;
  return renderer(schritt, aenderung);
}

export type { Pruefung, UebungsInstanz } from './typen';
