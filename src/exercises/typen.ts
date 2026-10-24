// Gemeinsame Schnittstelle aller Übungstypen.
import type { Schritt } from '../types';

export interface Pruefung {
  korrekt: boolean;
  /** HTML: die richtige Lösung, falls die Antwort falsch war. */
  loesung?: string;
  /** HTML-Zeilen mit Begründungen zu einzelnen Optionen. */
  details?: string[];
}

export interface UebungsInstanz {
  element: HTMLElement;
  interaktiv: boolean;
  /** Kann geprüft werden (alles ausgefüllt)? */
  bereit(): boolean;
  pruefen(): Pruefung;
  /** Tastenkürzel verarbeiten (z. B. 1–9). true, wenn verarbeitet. */
  taste?(key: string): boolean;
}

export type Renderer<S extends Schritt> = (schritt: S, aenderung: () => void) => UebungsInstanz;
