// Glossar: wird automatisch aus den "begriffe" aller Lektionen aufgebaut.
import { lernpfad } from '../engine/content';
import { h, leeren } from './dom';
import { icon } from './icons';
import { inline } from './markdown';

interface Eintrag {
  begriff: string;
  englisch?: string;
  erklaerung: string;
  lektionId: string;
  lektionTitel: string;
}

function eintraege(): Eintrag[] {
  const liste: Eintrag[] = [];
  const gesehen = new Set<string>();
  for (const { lektion } of lernpfad) {
    for (const b of lektion.begriffe ?? []) {
      const key = b.begriff.toLowerCase();
      if (gesehen.has(key)) continue; // erstes Auftreten gewinnt
      gesehen.add(key);
      liste.push({ ...b, lektionId: lektion.id, lektionTitel: lektion.titel });
    }
  }
  return liste.sort((a, b) => a.begriff.localeCompare(b.begriff, 'de-CH'));
}

const buchstabe = (s: string) => {
  const c = s.normalize('NFD').replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
};

export function glossarAnsicht(): HTMLElement {
  const alle = eintraege();
  const suche = h('input', { type: 'search', id: 'glossar-suche', class: 'suchfeld', placeholder: `${alle.length} Begriffe durchsuchen …`, autocomplete: 'off', 'aria-label': 'Glossar durchsuchen' });
  const liste = h('div', { class: 'glossar-liste' });
  const zaehler = h('p', { class: 'hinweis-klein', role: 'status' });

  function zeichnen() {
    const q = suche.value.trim().toLowerCase();
    const treffer = alle.filter((e) => !q || `${e.begriff} ${e.englisch ?? ''} ${e.erklaerung}`.toLowerCase().includes(q));
    leeren(liste);
    zaehler.textContent = `${treffer.length} ${treffer.length === 1 ? 'Begriff' : 'Begriffe'}`;
    const gruppen = new Map<string, Eintrag[]>();
    for (const e of treffer) {
      const b = buchstabe(e.begriff);
      gruppen.set(b, [...(gruppen.get(b) ?? []), e]);
    }
    for (const [b, eintr] of gruppen) {
      liste.append(h('section', { class: 'glossar-gruppe karte' },
        h('div', { class: 'glossar-buchstabe', 'aria-hidden': 'true' }, b),
        h('dl', { class: 'glossar' }, eintr.flatMap((e) => [
          h('dt', {}, e.begriff, e.englisch ? h('span', { class: 'englisch' }, ` (${e.englisch})`) : null),
          h('dd', {}, h('span', { html: inline(e.erklaerung) }), ' ',
            h('a', { class: 'quelle', href: `#/lektion/${e.lektionId}` }, `→ ${e.lektionTitel}`)),
        ]))));
    }
  }
  suche.addEventListener('input', zeichnen);
  zeichnen();

  return h('div', { class: 'ansicht' },
    h('p', { class: 'ueberzeile' }, 'Nachschlagen'),
    h('h1', {}, 'Glossar'),
    h('p', { class: 'einleitung' }, 'Alle Fachbegriffe aus den Lektionen, jeweils mit englischem Originalbegriff und Link zur Lektion.'),
    h('div', { class: 'such-rahmen' }, icon('suche'), suche), zaehler, liste);
}
