// Code lesen und Ergebnis vorhersagen (kompiliert das? linkt das? was wird ausgegeben?).
import type { CodeLesen } from '../types';
import { auswahl } from './auswahl';
import type { Renderer } from './typen';

export const codeLesen: Renderer<CodeLesen> = auswahl;
