// Darstellung einer laufenden Sitzung (Lektion oder Wiederholung): Schritt, Prüfen, Feedback, Weiter.
import { Sitzung } from '../engine/session';
import { TYP_NAMEN, uebungErzeugen, type UebungsInstanz } from '../exercises';
import type { Antwort } from '../progress/aktionen';
import type { Schritt } from '../types';
import { anhaengen, h, leeren } from './dom';
import { icon } from './icons';
import { md } from './markdown';

export interface SitzungsElement {
  schritt: Schritt;
  schluessel: string;
  herkunft?: string; // z. B. Lektionstitel in der Wiederholung
}

export interface SitzungsOptionen {
  titel: string;
  elemente: SitzungsElement[];
  maxWiederholungen: number;
  /** Farbton der Phase für die Gestaltung. */
  farbe?: number;
  /** Wird aufgerufen, wenn alle Schritte erledigt sind. Füllt den Inhaltsbereich selbst. */
  abschluss: (antworten: Antwort[], buehne: HTMLElement) => void;
  abbrechen: () => void;
}

const LOB = ['Richtig!', 'Genau!', 'Stark!', 'Sehr gut!', 'Korrekt!', 'Treffer!'];
const TROST = ['Nicht ganz.', 'Knapp daneben.', 'Noch nicht.'];
const zufall = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function sitzungAnsicht(opt: SitzungsOptionen): HTMLElement {
  const sitzung = new Sitzung(opt.elemente, opt.maxWiederholungen);
  let instanz: UebungsInstanz | null = null;
  let geprueft = false;
  let serie = 0;

  const balken = h('span', {});
  const fortschritt = h('div', { class: 'balken sitzung-balken', role: 'progressbar', 'aria-label': 'Fortschritt', 'aria-valuemin': 0, 'aria-valuemax': 100 }, balken);
  const serienAnzeige = h('span', { class: 'serie', 'aria-live': 'polite' });
  const schliessen = h('button', {
    type: 'button', class: 'knopf-icon', 'aria-label': 'Sitzung beenden',
    onClick: () => {
      if (sitzung.fertig || confirm('Sitzung wirklich beenden? Der Fortschritt dieser Sitzung geht verloren.')) opt.abbrechen();
    },
  }, icon('kreuz'));
  const kopf = h('header', { class: 'sitzung-kopf' }, h('div', { class: 'sitzung-kopf-innen' }, schliessen, fortschritt, serienAnzeige));

  const buehne = h('div', { class: 'sitzung-buehne', tabindex: -1 });
  const feedback = h('section', { class: 'feedback', role: 'status', 'aria-live': 'polite', hidden: true });
  const hauptKnopf = h('button', { type: 'button', class: 'knopf knopf-primaer knopf-gross' }, 'Prüfen');
  const tippKnopf = h('button', { type: 'button', class: 'knopf knopf-text', hidden: true }, icon('lampe'), 'Tipp');
  const fuss = h('footer', { class: 'sitzung-fuss' }, h('div', { class: 'fuss-innen' }, feedback, h('div', { class: 'fuss-knoepfe' }, tippKnopf, hauptKnopf)));
  const wurzel = h('div', { class: 'sitzung', style: opt.farbe !== undefined ? `--hue:${opt.farbe}` : undefined }, kopf, buehne, fuss);

  function knopfAktualisieren() {
    if (!instanz) return;
    if (geprueft || !instanz.interaktiv) {
      hauptKnopf.textContent = 'Weiter';
      hauptKnopf.disabled = false;
    } else {
      hauptKnopf.textContent = 'Prüfen';
      hauptKnopf.disabled = !instanz.bereit();
    }
  }

  function balkenSetzen() {
    const p = Math.round(sitzung.fortschritt * 100);
    balken.style.width = `${Math.max(p, 3)}%`;
    fortschritt.setAttribute('aria-valuenow', String(p));
  }

  function serieZeigen() {
    leeren(serienAnzeige);
    if (serie >= 3) {
      serienAnzeige.append(icon('flamme'), String(serie));
      serienAnzeige.setAttribute('aria-label', `${serie} richtig in Folge`);
      serienAnzeige.classList.remove('neu');
      void serienAnzeige.offsetWidth;
      serienAnzeige.classList.add('neu');
    }
  }

  function schrittZeigen() {
    balkenSetzen();
    leeren(buehne);
    feedback.hidden = true;
    feedback.className = 'feedback';
    fuss.className = 'sitzung-fuss';
    leeren(feedback);
    geprueft = false;
    const element = sitzung.aktuell;
    if (!element) {
      instanz = null;
      fuss.hidden = true;
      kopf.hidden = true;
      const antworten: Antwort[] = [...sitzung.ersterVersuch.entries()].map(([i, korrekt]) => ({
        schluessel: opt.elemente[i].schluessel,
        korrekt,
      }));
      opt.abschluss(antworten, buehne);
      buehne.focus();
      return;
    }
    instanz = uebungErzeugen(element.schritt, knopfAktualisieren);
    const typ = element.schritt.typ;
    buehne.append(
      h('div', { class: 'schritt-typ' },
        typ === 'erklaerung' ? icon('lampe') : icon('ziel'),
        TYP_NAMEN[typ],
        sitzung.istWiederholung ? h('span', { class: 'etikett etikett-warnung' }, icon('wiederholen'), 'Nochmals') : null,
        element.herkunft ? h('span', { class: 'etikett' }, element.herkunft) : null),
      instanz.element,
    );
    buehne.classList.remove('ansicht');
    void buehne.offsetWidth;
    buehne.classList.add('ansicht');
    const hinweis = element.schritt.hinweis;
    tippKnopf.hidden = !hinweis || !instanz.interaktiv;
    tippKnopf.onclick = () => {
      if (!hinweis) return;
      tippKnopf.hidden = true;
      instanz!.element.append(h('aside', { class: 'tipp', html: `<strong>Tipp:</strong> ${md(hinweis).replace(/^<p>|<\/p>$/g, '')}` }));
    };
    knopfAktualisieren();
    buehne.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  function pruefen() {
    if (!instanz || !sitzung.aktuell) return;
    const schritt = sitzung.aktuell.schritt;
    const ergebnis = instanz.pruefen();
    const wirdWiederholt = !ergebnis.korrekt && !sitzung.istWiederholung && opt.maxWiederholungen > 0;
    sitzung.beantworten(ergebnis.korrekt);
    geprueft = true;
    tippKnopf.hidden = true;
    serie = ergebnis.korrekt ? serie + 1 : 0;
    serieZeigen();
    if (!ergebnis.korrekt) {
      instanz.element.classList.remove('wackeln');
      void instanz.element.offsetWidth;
      instanz.element.classList.add('wackeln');
    }
    const erklaerung = 'erklaerung' in schritt && typeof schritt.erklaerung === 'string' ? schritt.erklaerung : '';
    feedback.className = `feedback ${ergebnis.korrekt ? 'feedback-richtig' : 'feedback-falsch'}`;
    fuss.className = `sitzung-fuss ${ergebnis.korrekt ? 'zustand-richtig' : 'zustand-falsch'}`;
    leeren(feedback);
    anhaengen(feedback, [
      h('h2', { class: 'feedback-titel', tabindex: -1 },
        h('span', { class: 'feedback-icon', 'aria-hidden': 'true' }, icon(ergebnis.korrekt ? 'haken' : 'kreuz')),
        ergebnis.korrekt ? zufall(LOB) : zufall(TROST)),
      ergebnis.loesung ? h('div', { class: 'feedback-loesung' }, h('strong', {}, 'Richtig wäre: '), h('div', { html: ergebnis.loesung })) : null,
      erklaerung ? h('div', { class: 'feedback-text', html: md(erklaerung) }) : null,
      ergebnis.details?.length ? h('details', { class: 'feedback-details', open: !ergebnis.korrekt },
        h('summary', {}, 'Warum die einzelnen Optionen richtig oder falsch sind'),
        h('ul', {}, ergebnis.details.map((d) => h('li', { html: d })))) : null,
      wirdWiederholt ? h('p', { class: 'feedback-hinweis' }, icon('wiederholen'), 'Diese Übung kommt am Ende nochmals – lies die Erklärung in Ruhe.') : null,
    ]);
    feedback.hidden = false;
    feedback.scrollTop = 0;
    knopfAktualisieren();
    (feedback.querySelector('.feedback-titel') as HTMLElement).focus({ preventScroll: true });
  }

  function hauptAktion() {
    if (!instanz) return;
    if (instanz.interaktiv && !geprueft) {
      if (instanz.bereit()) pruefen();
      return;
    }
    sitzung.weiter();
    schrittZeigen();
  }

  hauptKnopf.addEventListener('click', hauptAktion);

  function tastatur(e: KeyboardEvent) {
    if (!wurzel.isConnected) {
      document.removeEventListener('keydown', tastatur);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || !instanz) return;
    const ziel = e.target as HTMLElement;
    const inEingabe = ziel instanceof HTMLInputElement || ziel instanceof HTMLTextAreaElement;
    if (e.key === 'Enter') {
      if (ziel instanceof HTMLButtonElement && ziel !== hauptKnopf) return; // Knopf selbst auslösen lassen
      if (ziel instanceof HTMLAnchorElement || ziel.tagName === 'SUMMARY') return;
      e.preventDefault();
      hauptAktion();
      return;
    }
    if (!inEingabe && !geprueft && instanz.taste?.(e.key)) e.preventDefault();
  }
  document.addEventListener('keydown', tastatur);

  schrittZeigen();
  return wurzel;
}
