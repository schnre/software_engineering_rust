// Datumswerte als lokale Kalendertage im Format YYYY-MM-DD.

export function tagVon(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${t}`;
}

export function heute(): string {
  return tagVon(new Date());
}

function parse(tag: string): Date {
  const [y, m, d] = tag.split('-').map(Number);
  return new Date(y, m - 1, d, 12); // Mittag: robust gegen Sommerzeit-Wechsel
}

export function plusTage(tag: string, n: number): string {
  const d = parse(tag);
  d.setDate(d.getDate() + n);
  return tagVon(d);
}

export function tageZwischen(von: string, bis: string): number {
  return Math.round((parse(bis).getTime() - parse(von).getTime()) / 86_400_000);
}
