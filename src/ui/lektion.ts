// Lektionsansicht: Einstieg (Lernziele), Durchführung, Praxis-Karte, Labor und Ergebnis.
import { eintrag, schrittSchluessel } from '../engine/content';
import { naechsteLektion } from '../engine/freischaltung';
import { terminalAnzeige } from '../exercises/bausteine';
import { neueAbzeichen } from '../progress/abzeichen';
import { lektionAbschliessen } from '../progress/aktionen';
import { heute } from '../progress/datum';
import type { Lektion } from '../types';
import { istInteraktiv } from '../types';
import { aendern, aktuelleAbzeichen, aktuelleStatus, lernpfadIds } from './app';
import { h, leeren } from './dom';
import { ergebnisAnsicht } from './ergebnis';
import { icon } from './icons';
import { inline, md } from './markdown';
import { sitzungAnsicht } from './sitzung';

export function lektionAnsicht(id: string, ziel: HTMLElement): void {
  const e = eintrag(id);
  if (!e) {
    ziel.append(h('div', { class: 'ansicht' }, h('h1', {}, 'Lektion nicht gefunden'), h('a', { class: 'knopf knopf-primaer', href: '#/' }, 'Zum Lernpfad')));
    return;
  }
  const status = aktuelleStatus().get(id);
  if (status === 'gesperrt') {
    ziel.append(h('div', { class: 'ansicht' },
      h('a', { class: 'zurueck', href: '#/' }, icon('pfeilLinks'), 'Lernpfad'),
      h('section', { class: 'karte' },
        h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('schloss')), h('h1', { style: 'margin:0' }, 'Noch gesperrt')),
        h('p', {}, 'Schliesse zuerst die vorherigen Lektionen ab. Im Profil kannst du den Erkundungsmodus aktivieren, um alle Lektionen freizuschalten.'),
        h('a', { class: 'knopf knopf-primaer', href: '#/' }, 'Zum Lernpfad'))));
    return;
  }
  const l = e.lektion;
  const anzahlUebungen = l.schritte.filter(istInteraktiv).length;
  const stil = `--hue:${e.phase.farbe ?? 245}`;

  const start = h('button', { type: 'button', class: 'knopf knopf-primaer knopf-gross', onClick: () => starten() },
    status === 'abgeschlossen' ? 'Nochmals durcharbeiten' : 'Lektion starten', icon('pfeilRechts'));
  ziel.append(h('div', { class: 'ansicht lektion-start', style: stil },
    h('a', { class: 'zurueck', href: '#/' }, icon('pfeilLinks'), 'Lernpfad'),
    h('section', { class: 'lektion-hero', 'data-symbol': e.phase.icon ?? '' },
      h('p', { class: 'phase-nr' }, `Phase ${e.phase.nummer} · ${e.modul.id} ${e.modul.titel}`),
      h('h1', {}, l.titel),
      h('div', { class: 'chips' },
        h('span', { class: 'etikett' }, icon('uhr'), `ca. ${l.dauerMinuten} Min.`),
        h('span', { class: 'etikett' }, icon('liste'), `${l.schritte.length} Schritte`),
        h('span', { class: 'etikett' }, icon('ziel'), `${anzahlUebungen} Übungen`),
        l.labor ? h('span', { class: 'etikett' }, icon('labor'), 'mit Labor') : null)),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('ziel')), h('h2', {}, 'Das kannst du danach')),
      h('ul', { class: 'lernziele' }, l.lernziele.map((z) => h('li', { html: inline(z) })))),
    h('div', { class: 'start-leiste' }, start),
  ));
  start.focus();

  function starten() {
    leeren(ziel);
    const elemente = l.schritte.map((schritt, i) => ({ schritt, schluessel: schrittSchluessel(l.id, schritt, i) }));
    ziel.append(sitzungAnsicht({
      titel: l.titel,
      elemente,
      maxWiederholungen: 1,
      farbe: e!.phase.farbe,
      abbrechen: () => { location.hash = '#/'; },
      abschluss: (antworten, buehne) => {
        const vorher = aktuelleAbzeichen();
        let ergebnis!: ReturnType<typeof lektionAbschliessen>;
        aendern((f) => { ergebnis = lektionAbschliessen(f, l.id, antworten, heute()); });
        const neu = neueAbzeichen(vorher, aktuelleAbzeichen());
        abschlussKarten(l, buehne, () => {
          leeren(buehne);
          const st = aktuelleStatus();
          const naechste = naechsteLektion(lernpfadIds, lernpfadIds.map((x) => st.get(x)!), l.id);
          buehne.append(ergebnisAnsicht('Lektion abgeschlossen!', ergebnis,
            [
              naechste ? { text: 'Nächste Lektion', href: `#/lektion/${naechste}`, primaer: true } : null,
              { text: 'Zum Lernpfad', href: '#/', primaer: !naechste },
            ].filter((a): a is NonNullable<typeof a> => a !== null),
            [begriffeKarte(l), weiterlesenKarte(l)], neu));
          (buehne.querySelector('.knopf-primaer') as HTMLElement | null)?.focus();
        });
      },
    }));
  }
}

/** Praxis-Karte und optional Labor-Karte, bevor das Ergebnis erscheint. */
function abschlussKarten(l: Lektion, buehne: HTMLElement, fertig: () => void): void {
  const karten: HTMLElement[] = [
    h('section', { class: 'karte karte-praxis' },
      h('p', { class: 'ueberzeile' }, 'Praxis'),
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('koffer')), h('h2', {}, 'Wo begegnet dir das im Alltag?')),
      h('div', { class: 'text', html: md(l.praxis) })),
  ];
  if (l.labor) {
    karten.push(h('section', { class: 'karte karte-labor' },
      h('p', { class: 'ueberzeile' }, 'Labor · am eigenen Rechner'),
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('labor')), h('h2', {}, l.labor.titel ?? 'Selbst ausprobieren')),
      h('div', { class: 'text', html: md(l.labor.anleitung) }),
      l.labor.befehle?.length ? terminalAnzeige({ ausgabe: l.labor.befehle.map((b) => `$ ${b}`) }) : null,
      l.labor.beobachtung ? h('details', { class: 'feedback-details' },
        h('summary', {}, 'Was du beobachten solltest'),
        h('div', { html: md(l.labor.beobachtung) })) : null,
      h('p', { class: 'hinweis-klein' }, 'Das Labor ist freiwillig – du kannst es auch später über die Lektion erneut aufrufen.'),
    ));
  }
  let i = 0;
  const zeigen = () => {
    leeren(buehne);
    const letzte = i === karten.length - 1;
    const knopf = h('button', { type: 'button', class: 'knopf knopf-primaer knopf-gross', onClick: () => {
      if (letzte) fertig();
      else { i++; zeigen(); }
    } }, letzte ? 'Zum Ergebnis' : 'Weiter', icon('pfeilRechts'));
    buehne.append(h('div', { class: 'abschluss ansicht' }, karten[i], h('div', { class: 'knopf-reihe' }, knopf)));
    knopf.focus();
  };
  zeigen();
}

function begriffeKarte(l: Lektion): HTMLElement | null {
  if (!l.begriffe?.length) return null;
  return h('details', { class: 'karte begriffe' },
    h('summary', {}, icon('buch'), `Begriffe dieser Lektion (${l.begriffe.length})`),
    h('dl', {}, l.begriffe.flatMap((b) => [
      h('dt', {}, b.begriff, b.englisch ? h('span', { class: 'englisch' }, ` (${b.englisch})`) : null),
      h('dd', { html: inline(b.erklaerung) }),
    ])));
}

function weiterlesenKarte(l: Lektion): HTMLElement | null {
  if (!l.weiterlesen?.length) return null;
  return h('section', { class: 'karte weiterlesen' },
    h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('link')), h('h2', {}, 'Weiterlesen')),
    h('ul', {}, l.weiterlesen.map((w) => h('li', {}, h('a', { href: w.url, target: '_blank', rel: 'noopener noreferrer' }, icon('pfeilRechts'), w.titel)))));
}
