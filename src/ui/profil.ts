// Profil: Level, Statistik, Abzeichen, Aktivität, Einstellungen, Export/Import.
import { lernpfad } from '../engine/content';
import { ALLE_ABZEICHEN } from '../progress/abzeichen';
import { heute, plusTage } from '../progress/datum';
import { exportDateiname, exportText, importText } from '../progress/export';
import { speicherVerfuegbar } from '../progress/speicher';
import { streakHeute } from '../progress/streak';
import { LEVELS, levelFuer } from '../progress/xp';
import { TAGESZIELE, leererFortschritt, type Thema } from '../progress/zustand';
import { aendern, aktuelleAbzeichen, ersetzen, themaAnwenden, zustand } from './app';
import { h } from './dom';
import { icon } from './icons';
import { ring } from './ring';

const WOCHEN = 16;

function aktivitaetsRaster(akt: Record<string, number>): HTMLElement {
  const tag = heute();
  const tage: string[] = [];
  for (let i = WOCHEN * 7 - 1; i >= 0; i--) tage.push(plusTage(tag, -i));
  const aktiv = tage.filter((t) => (akt[t] ?? 0) > 0).length;
  return h('figure', { class: 'aktivitaet' },
    h('div', { class: 'aktivitaet-raster', role: 'img', 'aria-label': `An ${aktiv} der letzten ${WOCHEN * 7} Tage gelernt` },
      tage.map((t) => {
        const xp = akt[t] ?? 0;
        const stufe = xp === 0 ? 0 : xp < 10 ? 1 : xp < 25 ? 2 : 3;
        return h('span', { class: `tag stufe-${stufe}`, title: `${new Date(t).toLocaleDateString('de-CH')}: ${xp} XP` });
      })),
    h('figcaption', {}, `${aktiv} aktive Tage in den letzten ${WOCHEN} Wochen`));
}

function segment<T extends string | number>(label: string, werte: T[], aktuell: T, text: (w: T) => string, setzen: (w: T) => void): HTMLElement {
  const gruppe = h('div', { class: 'segment', role: 'radiogroup', 'aria-label': label });
  for (const w of werte) {
    gruppe.append(h('button', {
      type: 'button', role: 'radio', class: 'segment-knopf', 'aria-checked': String(w === aktuell),
      onClick: (e: Event) => {
        setzen(w);
        gruppe.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
      },
    }, text(w)));
  }
  return gruppe;
}

export function profilAnsicht(): HTMLElement {
  const f = zustand();
  const lvl = levelFuer(f.xp);
  const fertig = lernpfad.filter((e) => f.lektionen[e.lektion.id]).length;
  const meldung = h('p', { class: 'meldung', role: 'status' });
  const erreicht = aktuelleAbzeichen();

  const erkunden = h('input', { type: 'checkbox', id: 'erkunden', checked: f.einstellungen.erkunden });
  erkunden.addEventListener('change', () => aendern((fs) => { fs.einstellungen.erkunden = erkunden.checked; }));

  const datei = h('input', { type: 'file', accept: 'application/json,.json', class: 'versteckt', id: 'import-datei' });
  datei.addEventListener('change', async () => {
    const file = datei.files?.[0];
    if (!file) return;
    try {
      const neu = importText(await file.text());
      if (!confirm('Den aktuellen Fortschritt durch die importierte Datei ersetzen?')) return;
      ersetzen(neu);
      themaAnwenden();
      meldung.textContent = 'Fortschritt importiert.';
      location.hash = '#/profil?i=' + Date.now();
    } catch (e) {
      meldung.textContent = `Import fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      datei.value = '';
    }
  });

  function exportieren() {
    const blob = new Blob([exportText(zustand())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: exportDateiname() });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    meldung.textContent = 'Export erstellt.';
  }

  function zuruecksetzen() {
    if (!confirm('Allen Fortschritt löschen? Das kann nicht rückgängig gemacht werden. Exportiere ihn vorher, wenn du ihn behalten willst.')) return;
    ersetzen(leererFortschritt());
    themaAnwenden();
    location.hash = '#/';
  }

  return h('div', { class: 'ansicht' },
    h('h1', { class: 'versteckt' }, 'Profil'),
    !speicherVerfuegbar() ? h('p', { class: 'banner banner-warnung' }, 'Der Browser-Speicher ist nicht verfügbar. Dein Fortschritt geht beim Schliessen verloren – nutze den Export.') : null,
    h('section', { class: 'profil-kopf' },
      ring(lvl.anteil, icon('abzeichen'), 'Fortschritt zum nächsten Level', 76),
      h('div', {},
        h('p', { class: 'phase-nr', style: 'margin:0' }, 'Dein Level'),
        h('h1', {}, lvl.level.name),
        h('p', {}, lvl.naechstes ? `${f.xp} XP · noch ${lvl.naechstes.ab - f.xp} XP bis ${lvl.naechstes.name}` : `${f.xp} XP · höchstes Level`))),
    h('dl', { class: 'kacheln' },
      h('div', { class: 'kachel kachel-xp' }, h('dt', {}, icon('blitz'), 'XP gesamt'), h('dd', {}, String(f.xp))),
      h('div', { class: 'kachel kachel-genau' }, h('dt', {}, icon('haken'), 'Lektionen'), h('dd', {}, `${fertig}/${lernpfad.length}`)),
      h('div', { class: 'kachel kachel-streak' }, h('dt', {}, icon('flamme'), 'Streak'), h('dd', {}, String(streakHeute(f.streak, heute())))),
      h('div', { class: 'kachel kachel-meister' }, h('dt', {}, icon('stern'), 'Fehlerfrei'), h('dd', {}, String(f.perfekt))),
    ),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('abzeichen')), h('h2', {}, `Abzeichen (${erreicht.size}/${ALLE_ABZEICHEN.length})`)),
      h('div', { class: 'abzeichen-raster' }, ALLE_ABZEICHEN.map((a) =>
        h('div', { class: `abzeichen ${erreicht.has(a.id) ? 'erreicht' : 'gesperrt'}`, title: a.beschreibung },
          h('span', { class: 'abzeichen-symbol', 'aria-hidden': 'true' }, a.symbol),
          h('span', { class: 'abzeichen-titel' }, a.titel),
          h('span', { class: 'abzeichen-text' }, erreicht.has(a.id) ? a.beschreibung : `Noch offen: ${a.beschreibung}`))))),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('uhr')), h('h2', {}, 'Aktivität')),
      aktivitaetsRaster(f.aktivitaet),
      h('ol', { class: 'level-leiter' }, LEVELS.map((l, i) =>
        h('li', { class: i <= lvl.index ? 'erreicht' : '' }, h('strong', {}, l.name), ` ab ${l.ab} XP`)))),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('einstellungen')), h('h2', {}, 'Einstellungen')),
      h('p', { class: 'label' }, 'Tagesziel'),
      segment('Tagesziel', TAGESZIELE, f.einstellungen.tagesziel, (w) => `${w} XP`, (w) => aendern((fs) => { fs.einstellungen.tagesziel = w; })),
      h('p', { class: 'label' }, 'Farbschema'),
      segment<Thema>('Farbschema', ['system', 'hell', 'dunkel'], f.einstellungen.thema,
        (t) => (t === 'system' ? 'System' : t === 'hell' ? 'Hell' : 'Dunkel'),
        (t) => { aendern((fs) => { fs.einstellungen.thema = t; }); themaAnwenden(); }),
      h('div', { class: 'schalter' }, erkunden,
        h('label', { for: 'erkunden' }, h('strong', {}, 'Erkundungsmodus'), h('br'),
          h('span', { class: 'hinweis-klein' }, 'Alle Lektionen freischalten, z. B. wenn du ein Thema schon kennst.'))),
    ),
    h('section', { class: 'karte' },
      h('div', { class: 'karten-kopf' }, h('span', { class: 'karten-symbol' }, icon('herunterladen')), h('h2', {}, 'Fortschritt sichern')),
      h('p', {}, 'Dein Fortschritt liegt nur in diesem Browser. Es gibt keine Konten und keine Tracker. Mit Export und Import überträgst du ihn auf ein anderes Gerät.'),
      h('div', { class: 'knopf-reihe' },
        h('button', { type: 'button', class: 'knopf knopf-sekundaer', onClick: exportieren }, icon('herunterladen'), 'Exportieren'),
        h('label', { for: 'import-datei', class: 'knopf knopf-sekundaer', tabindex: 0, role: 'button',
          onKeydown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); datei.click(); } } }, icon('hochladen'), 'Importieren'),
        datei),
      meldung,
      h('button', { type: 'button', class: 'knopf knopf-gefahr', onClick: zuruecksetzen }, icon('muell'), 'Fortschritt zurücksetzen'),
    ),
  );
}
