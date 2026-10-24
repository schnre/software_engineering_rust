// Ergebnis-Screen nach einer Lektion oder Wiederholung.
import type { Abzeichen } from '../progress/abzeichen';
import type { Ergebnis } from '../progress/aktionen';
import { levelFuer } from '../progress/xp';
import { zustand } from './app';
import { h } from './dom';
import { icon } from './icons';
import { konfetti } from './konfetti';

export interface ErgebnisAktion {
  text: string;
  href: string;
  primaer?: boolean;
}

export function ergebnisAnsicht(
  titel: string,
  e: Ergebnis,
  aktionen: ErgebnisAktion[],
  zusatz: (HTMLElement | null)[] = [],
  neueAbzeichen: Abzeichen[] = [],
): HTMLElement {
  const xp = zustand().xp;
  const lvl = levelFuer(xp);
  const prozent = Math.round(e.genauigkeit * 100);
  if (e.genauigkeit >= 0.8 || neueAbzeichen.length || e.levelAufstieg) setTimeout(() => konfetti(), 150);
  return h('div', { class: 'ergebnis' },
    h('div', { class: `ergebnis-symbol${e.fehlerfrei ? ' perfekt' : ''}`, 'aria-hidden': 'true' }, icon(e.fehlerfrei ? 'stern' : 'pokal')),
    h('h1', {}, titel),
    e.fehlerfrei ? h('p', { class: 'ergebnis-lob' }, 'Fehlerfrei – stark!') : h('p', { class: 'einleitung' }, prozent >= 70 ? 'Gut gemacht. Die Fehler wiederholst du später.' : 'Dranbleiben lohnt sich – die Wiederholung festigt es.'),
    e.levelAufstieg ? h('p', { class: 'banner banner-level' }, icon('funken'), `Neues Level erreicht: ${e.levelAufstieg}`) : null,
    neueAbzeichen.length
      ? h('div', { class: 'neue-abzeichen' }, neueAbzeichen.map((a) =>
          h('div', { class: 'abzeichen-neu' },
            h('span', { class: 'abzeichen-symbol', 'aria-hidden': 'true' }, a.symbol),
            h('div', {}, h('strong', {}, `Neues Abzeichen: ${a.titel}`), h('div', { class: 'hinweis-klein', style: 'color:inherit' }, a.beschreibung)))))
      : null,
    h('dl', { class: 'kacheln' },
      h('div', { class: 'kachel kachel-xp' }, h('dt', {}, icon('blitz'), 'XP'), h('dd', {}, `+${e.xp}`)),
      h('div', { class: 'kachel kachel-genau' }, h('dt', {}, icon('ziel'), 'Genauigkeit'), h('dd', {}, `${prozent} %`)),
      h('div', { class: 'kachel kachel-streak' }, h('dt', {}, icon('flamme'), 'Streak'), h('dd', {}, `${e.streak} ${e.streak === 1 ? 'Tag' : 'Tage'}`)),
      e.gemeistert ? h('div', { class: 'kachel kachel-meister' }, h('dt', {}, icon('stern'), 'Gemeistert'), h('dd', {}, String(e.gemeistert))) : null,
    ),
    h('div', { class: 'level-fortschritt' },
      h('p', {}, h('strong', {}, lvl.level.name), h('span', { class: 'hinweis-klein' }, lvl.naechstes ? `noch ${lvl.naechstes.ab - xp} XP bis ${lvl.naechstes.name}` : 'Höchstes Level erreicht')),
      h('div', { class: 'balken', role: 'progressbar', 'aria-label': 'Fortschritt zum nächsten Level', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(lvl.anteil * 100) },
        h('span', { style: `width:${lvl.anteil * 100}%` })),
    ),
    !e.fehlerfrei ? h('p', { class: 'hinweis-klein' }, 'Falsch beantwortete Übungen liegen jetzt in deiner Wiederholungs-Box.') : null,
    zusatz,
    h('div', { class: 'knopf-reihe' },
      aktionen.map((a) => h('a', { class: `knopf ${a.primaer ? 'knopf-primaer' : 'knopf-sekundaer'} knopf-gross`, href: a.href }, a.text, a.primaer ? icon('pfeilRechts') : null))),
  );
}
