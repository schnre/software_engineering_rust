// Export und Import des Fortschritts als JSON-Datei.
import { heute } from './datum';
import { normalisieren, type Fortschritt } from './zustand';

const APP = 'rust-academy';

export function exportText(f: Fortschritt): string {
  return JSON.stringify({ app: APP, exportiertAm: new Date().toISOString(), fortschritt: f }, null, 2);
}

export function exportDateiname(): string {
  return `rust-academy-fortschritt-${heute()}.json`;
}

export function importText(text: string): Fortschritt {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  if (typeof daten === 'object' && daten !== null && 'app' in daten) {
    const d = daten as { app: unknown; fortschritt?: unknown };
    if (d.app !== APP) throw new Error('Die Datei stammt nicht von der Rust Engineering Academy.');
    return normalisieren(d.fortschritt);
  }
  return normalisieren(daten);
}
