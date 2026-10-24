// localStorage-Zugriff. Jeder Zugriff ist abgesichert: Ist der Speicher nicht verfügbar
// (privates Fenster, blockierte Website-Daten), läuft die App mit dem Fortschritt im Arbeitsspeicher weiter.
import { leererFortschritt, normalisieren, type Fortschritt } from './zustand';

const SCHLUESSEL = 'rust-academy:fortschritt:v1';

let verfuegbar = true;

export function speicherVerfuegbar(): boolean {
  return verfuegbar;
}

export function laden(): Fortschritt {
  let roh: string | null;
  try {
    roh = localStorage.getItem(SCHLUESSEL);
  } catch {
    verfuegbar = false;
    return leererFortschritt();
  }
  if (!roh) return leererFortschritt();
  try {
    return normalisieren(JSON.parse(roh));
  } catch {
    return leererFortschritt(); // beschädigte Daten: neu beginnen, Speicher bleibt nutzbar
  }
}

export function speichern(f: Fortschritt): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(f));
    verfuegbar = true;
  } catch {
    verfuegbar = false;
  }
}

export function loeschen(): void {
  try {
    localStorage.removeItem(SCHLUESSEL);
  } catch {
    verfuegbar = false;
  }
}
