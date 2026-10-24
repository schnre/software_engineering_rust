// Wiederholen: fällige Leitner-Karten und freies Mischtraining (Interleaving über Module hinweg).
import { curriculum, uebung, uebungenVon } from '../engine/content';
import { neueAbzeichen } from '../progress/abzeichen';
import { wiederholungAbschliessen } from '../progress/aktionen';
import { heute } from '../progress/datum';
import { BOXEN, INTERVALLE, faelligeKarten, kartenProBox, naechsteFaelligkeit } from '../progress/leitner';
import { aendern, aktuelleAbzeichen, zustand } from './app';
import { h, leeren, mischen } from './dom';
import { ergebnisAnsicht } from './ergebnis';
import { icon } from './icons';
import { sitzungAnsicht, type SitzungsElement } from './sitzung';

const MAX_PRO_SITZUNG = 12;

export function wiederholenAnsicht(ziel: HTMLElement): void {
  const f = zustand();
  const tag = heute();
  const faellig = faelligeKarten(f, tag).filter((s) => uebung(s));
  const boxen = kartenProBox(f);
  const maxBox = Math.max(1, ...boxen);
  const naechste = naechsteFaelligkeit(f, tag);
  const abgeschlossen = Object.keys(f.lektionen);

  const phasenAuswahl = h('select', { id: 'training-phase', class: 'auswahlfeld' },
    h('option', { value: '' }, 'Alle abgeschlossenen Lektionen'),
    curriculum.phasen
      .filter((p) => p.module.some((m) => m.lektionen.some((id) => f.lektionen[id])))
      .map((p) => h('option', { value: String(p.nummer) }, `${p.icon ?? ''} Phase ${p.nummer}: ${p.titel}`)),
  );

  ziel.append(h('div', { class: 'ansicht' },
    h('p', { class: 'ueberzeile' }, 'Langzeitgedächtnis'),
    h('h1', {}, 'Wiederholen'),
    h('p', { class: 'einleitung' }, 'Abrufen festigt Wissen stärker als erneutes Lesen. Falsch beantwortete Übungen landen in Box 1 und steigen mit jeder richtigen Antwort eine Box auf, mit immer längeren Abständen.'),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('wiederholen')), h('h2', {}, 'Wiederholungs-Boxen')),
      h('ol', { class: 'boxen', 'aria-label': 'Übungen pro Box' }, boxen.map((n, i) =>
        h('li', { class: 'box' },
          h('span', { class: 'box-zahl' }, String(n)),
          h('span', { class: 'box-saeule', style: `height:${12 + (n / maxBox) * 90}px; opacity:${0.45 + i * 0.12}`, 'aria-hidden': 'true' }),
          h('span', { class: 'box-name' }, `Box ${i + 1}`),
          h('span', { class: 'box-intervall' }, `${INTERVALLE[i + 1]} ${INTERVALLE[i + 1] === 1 ? 'Tag' : 'Tage'}`)))),
      h('p', { class: 'hinweis-klein' }, `${f.gemeistert} Übungen gemeistert (nach Box ${BOXEN} richtig beantwortet).`),
      faellig.length
        ? h('button', { type: 'button', class: 'knopf knopf-primaer knopf-gross', onClick: () => starten('leitner') },
            icon('wiederholen'), `${Math.min(faellig.length, MAX_PRO_SITZUNG)} fällige Übungen wiederholen`)
        : h('p', { class: 'leer-hinweis' }, naechste
            ? `Alles erledigt. Die nächste Wiederholung ist am ${new Date(naechste).toLocaleDateString('de-CH')} fällig.`
            : 'Keine Übungen fällig. Falsch beantwortete Übungen erscheinen hier automatisch.'),
    ),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('mischen')), h('h2', {}, 'Mischtraining')),
      h('p', {}, 'Zufällige Übungen aus abgeschlossenen Lektionen, bunt gemischt. Das Wechseln zwischen Themen ist anstrengender, und genau deshalb wirksam.'),
      abgeschlossen.length
        ? [h('label', { for: 'training-phase', class: 'label' }, 'Auswahl'), phasenAuswahl,
           h('button', { type: 'button', class: 'knopf knopf-sekundaer knopf-gross', onClick: () => starten('training') }, icon('mischen'), '10 gemischte Übungen')]
        : h('p', { class: 'leer-hinweis' }, 'Schliesse zuerst eine Lektion ab.'),
    ),
  ));

  function starten(modus: 'leitner' | 'training') {
    let elemente: SitzungsElement[];
    if (modus === 'leitner') {
      elemente = mischen(faellig.slice(0, MAX_PRO_SITZUNG)).map((s) => {
        const u = uebung(s)!;
        return { schritt: u.schritt, schluessel: s, herkunft: u.lektion.titel };
      });
    } else {
      const phase = phasenAuswahl.value;
      const ids = abgeschlossen.filter((id) => !phase || id.startsWith(`p${phase}-`));
      elemente = mischen(uebungenVon(ids)).slice(0, 10)
        .map((u) => ({ schritt: u.schritt, schluessel: u.schluessel, herkunft: u.lektion.titel }));
    }
    if (!elemente.length) return;
    leeren(ziel);
    ziel.append(sitzungAnsicht({
      titel: modus === 'leitner' ? 'Wiederholung' : 'Mischtraining',
      elemente,
      maxWiederholungen: 0,
      abbrechen: () => { leeren(ziel); wiederholenAnsicht(ziel); },
      abschluss: (antworten, buehne) => {
        const vorher = aktuelleAbzeichen();
        let ergebnis!: ReturnType<typeof wiederholungAbschliessen>;
        aendern((fs) => { ergebnis = wiederholungAbschliessen(fs, antworten, heute(), modus); });
        buehne.append(ergebnisAnsicht(modus === 'leitner' ? 'Wiederholung abgeschlossen!' : 'Training abgeschlossen!', ergebnis, [
          { text: 'Zum Lernpfad', href: '#/', primaer: true },
          { text: 'Zurück zu Wiederholen', href: '#/wiederholen?neu=' + Date.now() },
        ], [], neueAbzeichen(vorher, aktuelleAbzeichen())));
      },
    }));
  }
}
