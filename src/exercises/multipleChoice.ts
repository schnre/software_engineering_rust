import type { MultipleChoice } from '../types';
import { auswahl } from './auswahl';
import type { Renderer } from './typen';

export const multipleChoice: Renderer<MultipleChoice> = auswahl;
