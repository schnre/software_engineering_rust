// Startseite: Dashboard (Weiterlernen, Tagesziel, Streak, Level) und Lernpfad im Zickzack.
import { curriculum, eintrag, lernpfad } from '../engine/content';
import type { LektionsStatus } from '../engine/freischaltung';
import { heute } from '../progress/datum';
import { faelligeKarten } from '../progress/leitner';
import { streakHeute } from '../progress/streak';
import { levelFuer } from '../progress/xp';
import type { Phase } from '../types';
import { aktuelleStatus, zustand } from './app';
import { h } from './dom';
import { icon, type IconName } from './icons';
import { ring } from './ring';

const STATUS_TEXT: Record<LektionsStatus, string> = {
  abgeschlossen: 'Abgeschlossen',
  aktuell: 'Als Nächstes',
  offen: 'Offen',
  gesperrt: 'Gesperrt',
};

const STATUS_ICON: Record<LektionsStatus, IconName> = {
  abgeschlossen: 'haken',
  aktuell: 'start',
  offen: 'start',
  gesperrt: 'schloss',
};

/** Zickzack-Muster für die horizontale Lage der Knoten. */
const MUSTER = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

const phasenStil = (p: Phase) => `--hue:${p.farbe ?? 245}`;

function gruss(): string {
  const stunde = new Date().getHours();
  if (stunde < 11) return 'Guten Morgen';
  if (stunde < 18) return 'Schön, dass du da bist';
  return 'Guten Abend';
}

function hero(status: Map<string, LektionsStatus>): HTMLElement {
  const naechste = lernpfad.find((e) => status.get(e.lektion.id) === 'aktuell') ?? lernpfad.find((e) => status.get(e.lektion.id) === 'offen');
  if (!naechste) {
    return h('section', { class: 'hero', 'aria-label': 'Fortschritt' },
      h('p', { class: 'hero-gruss' }, gruss()),
      h('h1', {}, 'Alle Lektionen geschafft!'),
      h('p', {}, 'Halte dein Wissen frisch: Wiederhole fällige Übungen und mach Mischtraining.'),
      h('a', { class: 'knopf knopf-weiss', href: '#/wiederholen' }, icon('wiederholen'), 'Zum Wiederholen'));
  }
  const l = naechste.lektion;
  const begonnen = Object.keys(zustand().lektionen).length > 0;
  return h('section', { class: 'hero', style: phasenStil(naechste.phase), 'aria-label': 'Weiterlernen' },
    h('span', { class: 'hero-symbol', 'aria-hidden': 'true' }, naechste.phase.icon ?? '📘'),
    h('p', { class: 'hero-gruss' }, gruss()),
    h('p', { class: 'phase-nr' }, `${begonnen ? 'Weiter mit' : 'Los geht’s mit'} · Phase ${naechste.phase.nummer}`),
    h('h1', {}, l.titel),
    h('div', { class: 'hero-meta' },
      h('span', { class: 'etikett' }, `${naechste.modul.id} ${naechste.modul.titel}`),
      h('span', { class: 'etikett' }, icon('uhr'), `${l.dauerMinuten} Min.`)),
    h('a', { class: 'knopf knopf-weiss knopf-gross', href: `#/lektion/${l.id}` },
      begonnen ? 'Weiterlernen' : 'Erste Lektion starten', icon('pfeilRechts')));
}

function statistik(): HTMLElement {
  const f = zustand();
  const tag = heute();
  const xpHeute = f.aktivitaet[tag] ?? 0;
  const ziel = f.einstellungen.tagesziel;
  const streak = streakHeute(f.streak, tag);
  const lvl = levelFuer(f.xp);
  return h('section', { class: 'statistik', 'aria-label': 'Statistik' },
    h('div', { class: 'stat stat-ziel' },
      ring(xpHeute / ziel, xpHeute >= ziel ? icon('haken') : `${Math.round((xpHeute / ziel) * 100)}%`, `Tagesziel: ${xpHeute} von ${ziel} XP`, 52),
      h('div', { class: 'stat-text' },
        h('div', { class: 'stat-wert' }, `${xpHeute}/${ziel}`),
        h('div', { class: 'stat-label' }, 'XP heute'))),
    h('div', { class: 'stat stat-streak' },
      h('span', { class: 'stat-symbol' }, icon('flamme')),
      h('div', { class: 'stat-text' },
        h('div', { class: 'stat-wert' }, String(streak)),
        h('div', { class: 'stat-label' }, streak === 1 ? 'Tag Streak' : 'Tage Streak'))),
    h('div', { class: 'stat stat-level' },
      h('span', { class: 'stat-symbol' }, icon('abzeichen')),
      h('div', { class: 'stat-text', style: 'flex:1' },
        h('div', { class: 'stat-wert' }, lvl.level.name),
        h('div', { class: 'stat-label' }, lvl.naechstes ? `${lvl.naechstes.ab - f.xp} XP bis ${lvl.naechstes.name}` : 'Höchstes Level'),
        h('div', { class: 'balken', 'aria-hidden': 'true' }, h('span', { style: `width:${lvl.anteil * 100}%` })))),
  );
}

function phasenLeiste(status: Map<string, LektionsStatus>): HTMLElement {
  return h('nav', { class: 'phasen-leiste', 'aria-label': 'Zu einer Phase springen' },
    curriculum.phasen.map((p) => {
      const ids = p.module.flatMap((m) => m.lektionen).filter((id) => status.has(id));
      const fertig = ids.filter((id) => status.get(id) === 'abgeschlossen').length;
      return h('button', {
        type: 'button',
        class: `phasen-chip${ids.length && fertig === ids.length ? ' fertig' : ''}`,
        style: phasenStil(p),
        onClick: () => document.getElementById(`phase-${p.nummer}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        'aria-label': `Phase ${p.nummer}: ${p.titel}, ${fertig} von ${ids.length} Lektionen`,
      },
        h('span', { class: 'phasen-chip-symbol', 'aria-hidden': 'true' }, p.icon ?? String(p.nummer)),
        h('span', {}, String(p.nummer)),
        h('span', { class: 'phasen-chip-stand' }, ids.length ? `${fertig}/${ids.length}` : '…'));
    }));
}

export function pfadAnsicht(): HTMLElement {
  const status = aktuelleStatus();
  const f = zustand();
  const faellig = faelligeKarten(f, heute()).length;

  const phasen = curriculum.phasen.map((phase) => {
    const ids = phase.module.flatMap((m) => m.lektionen).filter((id) => status.has(id));
    const fertig = ids.filter((id) => status.get(id) === 'abgeschlossen').length;
    const anteil = ids.length ? fertig / ids.length : 0;

    const module = phase.module.map((modul) => {
      const vorhanden = modul.lektionen.filter((id) => status.has(id));
      const modulFertig = vorhanden.filter((id) => status.get(id) === 'abgeschlossen').length;
      const knoten = vorhanden.map((id, i) => {
        const e = eintrag(id)!;
        const st = status.get(id)!;
        const lf = f.lektionen[id];
        const perfekt = st === 'abgeschlossen' && lf?.besteGenauigkeit === 1;
        const offen = st !== 'gesperrt';
        const inhalt = [
          st === 'aktuell' ? h('span', { class: 'knoten-blase', 'aria-hidden': 'true' }, Object.keys(f.lektionen).length ? 'Weiter' : 'Start') : null,
          h('span', { class: 'knoten-kreis', 'aria-hidden': 'true' }, icon(perfekt ? 'stern' : STATUS_ICON[st])),
          h('span', { class: 'knoten-titel' }, e.lektion.titel),
          h('span', { class: 'knoten-meta' },
            `${STATUS_TEXT[st]} · ${e.lektion.dauerMinuten} Min.${lf ? ` · ${Math.round(lf.besteGenauigkeit * 100)} %` : ''}`),
        ];
        const klasse = `knoten status-${st}${perfekt ? ' perfekt' : ''}`;
        const el = offen
          ? h('a', { class: klasse, href: `#/lektion/${id}` }, inhalt)
          : h('div', { class: klasse, 'aria-disabled': 'true' }, inhalt);
        if (st === 'aktuell') el.setAttribute('aria-current', 'step');
        return h('li', { style: `--schritt:${MUSTER[i % MUSTER.length]}` }, el);
      });
      const geplant = (modul.geplant ?? []).map((t, j) =>
        h('li', { style: `--schritt:${MUSTER[(vorhanden.length + j) % MUSTER.length]}` },
          h('div', { class: 'knoten status-geplant', 'aria-disabled': 'true' },
            h('span', { class: 'knoten-kreis', 'aria-hidden': 'true' }, '…'),
            h('span', { class: 'knoten-titel' }, t),
            h('span', { class: 'knoten-meta' }, 'In Vorbereitung'))));
      if (!knoten.length && !geplant.length) return null;
      return h('section', { class: 'modul', 'aria-labelledby': `modul-${modul.id}` },
        h('div', { class: 'modul-kopf' },
          h('h3', { class: 'modul-titel', id: `modul-${modul.id}` },
            h('span', { class: 'modul-nr' }, modul.id), h('span', {}, modul.titel),
            vorhanden.length ? h('span', { class: 'modul-stand' }, `${modulFertig}/${vorhanden.length}`) : null)),
        h('ol', { class: 'pfad' }, knoten, geplant),
      );
    });

    return h('section', { class: 'phase', id: `phase-${phase.nummer}`, style: phasenStil(phase) },
      h('header', { class: 'phase-kopf', 'data-symbol': phase.icon ?? '' },
        h('p', { class: 'phase-nr' }, `Phase ${phase.nummer}`),
        h('h2', {}, phase.titel),
        h('p', { class: 'phase-beschreibung' }, phase.beschreibung),
        ids.length
          ? h('div', { class: 'balken', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': ids.length, 'aria-valuenow': fertig, 'aria-label': `Phase ${phase.nummer}: ${fertig} von ${ids.length} Lektionen` },
              h('span', { style: `width:${anteil * 100}%` }))
          : null,
        h('p', { class: 'phase-stand' }, ids.length ? `${fertig} von ${ids.length} Lektionen` : 'Inhalte in Vorbereitung'),
      ),
      module,
    );
  });

  const ansicht = h('div', { class: 'ansicht pfad-ansicht' },
    hero(status),
    statistik(),
    faellig > 0
      ? h('a', { class: 'banner banner-wiederholen', href: '#/wiederholen' },
          h('span', { class: 'banner-symbol' }, icon('wiederholen')),
          h('span', {}, `${faellig} ${faellig === 1 ? 'Übung ist' : 'Übungen sind'} zur Wiederholung fällig`),
          h('span', { class: 'banner-pfeil' }, icon('pfeilRechts')))
      : null,
    phasenLeiste(status),
    phasen,
  );
  return ansicht;
}
