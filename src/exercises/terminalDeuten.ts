// Simulierte Ausgabe von nm, objdump, Compiler oder Linker interpretieren.
import type { TerminalDeuten } from '../types';
import { auswahl } from './auswahl';
import type { Renderer } from './typen';

export const terminalDeuten: Renderer<TerminalDeuten> = auswahl;
