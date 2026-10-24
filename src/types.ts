// Datentypen der Lerninhalte. Spiegeln schema/lesson.schema.json.

export type Sprache =
  | 'rust' | 'toml' | 'cpp' | 'c' | 'bash' | 'cmake' | 'make' | 'yaml' | 'groovy' | 'json'
  | 'asm' | 'starlark' | 'python' | 'linker' | 'text';

export interface Anmerkung {
  zeile: number;
  text: string;
}

export interface CodeBlock {
  sprache: Sprache;
  datei?: string;
  zeilen: string[];
  anmerkungen?: Anmerkung[];
}

export interface Terminal {
  befehl?: string;
  ausgabe: string[];
}

export interface Tabelle {
  kopf: string[];
  zeilen: string[][];
}

export interface Diagramm {
  knoten: string[];
  beschriftung?: string;
}

interface SchrittBasis {
  id?: string;
  hinweis?: string;
}

export interface Erklaerung extends SchrittBasis {
  typ: 'erklaerung';
  titel?: string;
  text: string;
  code?: CodeBlock;
  terminal?: Terminal;
  tabelle?: Tabelle;
  diagramm?: Diagramm;
}

interface AuswahlBasis extends SchrittBasis {
  frage: string;
  optionen: string[];
  korrekt: number | number[];
  erklaerung: string;
  begruendungen?: string[];
  fest?: boolean;
}

export interface MultipleChoice extends AuswahlBasis {
  typ: 'multiple-choice';
  code?: CodeBlock;
}

export interface CodeLesen extends AuswahlBasis {
  typ: 'code-lesen';
  code: CodeBlock;
}

export interface TerminalDeuten extends AuswahlBasis {
  typ: 'terminal-deuten';
  terminal: Terminal;
  code?: CodeBlock;
}

export interface Luecke {
  loesungen: string[];
}

export interface Lueckentext extends SchrittBasis {
  typ: 'lueckentext';
  frage: string;
  text?: string;
  code?: CodeBlock;
  luecken: Luecke[];
  auswahl?: string[];
  erklaerung: string;
}

export interface Reihenfolge extends SchrittBasis {
  typ: 'reihenfolge';
  frage: string;
  elemente: string[];
  erklaerung: string;
}

export interface Paar {
  links: string;
  rechts: string;
}

export interface Zuordnen extends SchrittBasis {
  typ: 'zuordnen';
  frage: string;
  paare: Paar[];
  erklaerung: string;
}

export interface FehlerFinden extends SchrittBasis {
  typ: 'fehler-finden';
  frage: string;
  code: CodeBlock;
  fehlerZeile: number;
  erklaerung: string;
}

export type Uebung =
  | MultipleChoice | CodeLesen | TerminalDeuten | Lueckentext
  | Reihenfolge | Zuordnen | FehlerFinden;

export type Schritt = Erklaerung | Uebung;
export type SchrittTyp = Schritt['typ'];

export interface Labor {
  titel?: string;
  anleitung: string;
  befehle?: string[];
  beobachtung?: string;
}

export interface Begriff {
  begriff: string;
  englisch?: string;
  erklaerung: string;
}

export interface Link {
  titel: string;
  url: string;
}

export interface Lektion {
  id: string;
  phase: number;
  modul: string;
  titel: string;
  lernziele: string[];
  dauerMinuten: number;
  schritte: Schritt[];
  praxis: string;
  labor?: Labor;
  begriffe?: Begriff[];
  weiterlesen?: Link[];
}

export interface Modul {
  id: string;
  titel: string;
  beschreibung?: string;
  lektionen: string[];
  geplant?: string[];
}

export interface Phase {
  nummer: number;
  titel: string;
  beschreibung: string;
  module: Modul[];
  /** Symbol für die Darstellung, z. B. ein Emoji. */
  icon?: string;
  /** Farbton (0–360) für die Farbgebung der Phase. */
  farbe?: number;
}

export interface Curriculum {
  titel: string;
  phasen: Phase[];
}

export function istInteraktiv(s: Schritt): s is Uebung {
  return s.typ !== 'erklaerung';
}
