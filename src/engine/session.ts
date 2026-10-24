// Ablaufsteuerung einer Lektion oder Wiederholung, ohne DOM.
// Falsch beantwortete Übungen werden einmal ans Ende gestellt, damit man sie
// innerhalb derselben Sitzung nochmals aktiv abruft.

export class Sitzung<T> {
  private warteschlange: number[];
  private position = 0;
  private versuche = new Map<number, number>();
  /** Ergebnis des ersten Versuchs je Schritt-Index (nur interaktive Schritte). */
  readonly ersterVersuch = new Map<number, boolean>();

  constructor(
    readonly schritte: T[],
    private readonly maxWiederholungen = 1,
  ) {
    this.warteschlange = schritte.map((_, i) => i);
  }

  get aktuellerIndex(): number | undefined {
    return this.warteschlange[this.position];
  }

  get aktuell(): T | undefined {
    const i = this.aktuellerIndex;
    return i === undefined ? undefined : this.schritte[i];
  }

  get fertig(): boolean {
    return this.position >= this.warteschlange.length;
  }

  /** Ist der aktuelle Schritt eine Wiederholung eines zuvor falsch beantworteten? */
  get istWiederholung(): boolean {
    const i = this.aktuellerIndex;
    return i !== undefined && (this.versuche.get(i) ?? 0) > 0;
  }

  /** Antwort auf den aktuellen interaktiven Schritt verbuchen. */
  beantworten(korrekt: boolean): void {
    const i = this.aktuellerIndex;
    if (i === undefined) return;
    const bisher = this.versuche.get(i) ?? 0;
    this.versuche.set(i, bisher + 1);
    if (bisher === 0) this.ersterVersuch.set(i, korrekt);
    if (!korrekt && bisher < this.maxWiederholungen) this.warteschlange.push(i);
  }

  weiter(): void {
    if (!this.fertig) this.position++;
  }

  /** Fortschritt 0..1 für die Fortschrittsanzeige. */
  get fortschritt(): number {
    return this.warteschlange.length === 0 ? 1 : this.position / this.warteschlange.length;
  }

  /** Anteil der interaktiven Schritte, die beim ersten Versuch richtig waren. */
  get genauigkeit(): number {
    const werte = [...this.ersterVersuch.values()];
    if (werte.length === 0) return 1;
    return werte.filter(Boolean).length / werte.length;
  }

  get fehlerfrei(): boolean {
    return [...this.ersterVersuch.values()].every(Boolean);
  }
}
