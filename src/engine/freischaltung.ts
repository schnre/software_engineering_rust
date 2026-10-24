// Freischaltung im Lernpfad: eine Lektion ist offen, sobald alle vorherigen abgeschlossen sind.
// Im Erkundungsmodus ist alles offen.

export type LektionsStatus = 'abgeschlossen' | 'aktuell' | 'offen' | 'gesperrt';

export function statusListe(ids: string[], abgeschlossen: Set<string>, erkunden: boolean): LektionsStatus[] {
  let aktuellVergeben = false;
  let allesDavorFertig = true;
  return ids.map((id) => {
    if (abgeschlossen.has(id)) return 'abgeschlossen';
    const zugaenglich = erkunden || allesDavorFertig;
    allesDavorFertig = false;
    if (!zugaenglich) return 'gesperrt';
    if (!aktuellVergeben) {
      aktuellVergeben = true;
      return 'aktuell';
    }
    return 'offen';
  });
}

/** Nächste empfohlene Lektion nach der gegebenen. */
export function naechsteLektion(ids: string[], status: LektionsStatus[], nach: string): string | undefined {
  const start = ids.indexOf(nach);
  for (let i = start + 1; i < ids.length; i++) if (status[i] !== 'abgeschlossen' && status[i] !== 'gesperrt') return ids[i];
  const aktuell = status.indexOf('aktuell');
  return aktuell >= 0 ? ids[aktuell] : undefined;
}
