// Einstiegspunkt: App-Schale, Hash-Router, Kopfzeile und Navigation.
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import { heute } from './progress/datum';
import { faelligeKarten } from './progress/leitner';
import { streakHeute } from './progress/streak';
import { levelFuer } from './progress/xp';
import { beobachten, themaAnwenden, zustand } from './ui/app';
import { h, leeren } from './ui/dom';
import { glossarAnsicht } from './ui/glossar';
import { icon, type IconName } from './ui/icons';
import { lektionAnsicht } from './ui/lektion';
import { pfadAnsicht } from './ui/pfad';
import { profilAnsicht } from './ui/profil';
import { wiederholenAnsicht } from './ui/wiederholen';

const app = document.getElementById('app')!;

function marke() {
  return h('a', { class: 'marke', href: '#/', 'aria-label': 'Rust Engineering Academy – zum Lernpfad' },
    h('span', { class: 'marke-logo', 'aria-hidden': 'true' }, 'rs'),
    h('span', { class: 'marke-text' }, 'Rust Academy', h('small', {}, 'Rust · Embedded · Architektur')));
}

// Mobile Kopfzeile
const streakChip = h('span', { class: 'statuschip chip-streak' });
const xpChip = h('span', { class: 'statuschip chip-xp' });
const kopf = h('header', { class: 'app-kopf' }, marke(), h('div', { class: 'kopf-status' }, streakChip, xpChip));

// Navigation (mobil unten, Desktop als Seitenleiste mit Marke und Kurzstatistik)
const NAV: { href: string; name: string; icon: IconName; route: string }[] = [
  { href: '#/', name: 'Lernpfad', icon: 'pfad', route: '' },
  { href: '#/wiederholen', name: 'Wiederholen', icon: 'wiederholen', route: 'wiederholen' },
  { href: '#/glossar', name: 'Glossar', icon: 'buch', route: 'glossar' },
  { href: '#/profil', name: 'Profil', icon: 'person', route: 'profil' },
];
const badge = h('span', { class: 'nav-badge', hidden: true });
const navLinks = NAV.map((n) =>
  h('a', { class: 'nav-link', href: n.href, 'data-route': n.route },
    icon(n.icon), h('span', {}, n.name), n.route === 'wiederholen' ? badge : null));
const seitenStreak = h('span', { class: 'statuschip chip-streak' });
const seitenXp = h('span', { class: 'statuschip chip-xp' });
const seitenLevel = h('span', { class: 'statuschip chip-level' });
const nav = h('nav', { class: 'app-nav', 'aria-label': 'Hauptnavigation' },
  h('div', { class: 'nav-marke' }, marke()),
  h('div', { class: 'nav-links' }, navLinks),
  h('div', { class: 'nav-stats', 'aria-hidden': 'true' }, seitenLevel, h('div', { class: 'kopf-status' }, seitenStreak, seitenXp)),
);

const inhalt = h('main', { id: 'inhalt', class: 'app-inhalt', tabindex: -1 });
const skip = h('a', { class: 'skip-link', href: '#inhalt', onClick: (e: Event) => { e.preventDefault(); inhalt.focus(); } }, 'Zum Inhalt springen');

leeren(app);
app.append(skip, h('div', { class: 'schale' }, nav, h('div', { class: 'hauptbereich' }, kopf, inhalt)));

function chip(el: HTMLElement, name: IconName, text: string, label: string) {
  leeren(el);
  el.append(icon(name), h('span', {}, text));
  el.setAttribute('aria-label', label);
}

function kopfAktualisieren() {
  const f = zustand();
  const tag = heute();
  const streak = streakHeute(f.streak, tag);
  const inaktiv = f.streak.letzterTag !== tag;
  for (const el of [streakChip, seitenStreak]) {
    chip(el, 'flamme', String(streak), `Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}`);
    el.classList.toggle('inaktiv', inaktiv);
  }
  for (const el of [xpChip, seitenXp]) chip(el, 'blitz', String(f.xp), `${f.xp} XP`);
  chip(seitenLevel, 'abzeichen', levelFuer(f.xp).level.name, 'Level');
  const faellig = faelligeKarten(f, tag).length;
  badge.hidden = faellig === 0;
  badge.textContent = String(faellig);
  badge.setAttribute('aria-label', `${faellig} fällig`);
}

function route() {
  const pfad = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [teil, param] = pfad.split('/');
  for (const l of navLinks) {
    if (l.dataset.route === (teil ?? '')) l.setAttribute('aria-current', 'page');
    else l.removeAttribute('aria-current');
  }
  leeren(inhalt);
  window.scrollTo({ top: 0 });
  switch (teil) {
    case 'lektion':
      lektionAnsicht(decodeURIComponent(param ?? ''), inhalt);
      document.title = 'Lektion · Rust Academy';
      break;
    case 'wiederholen':
      wiederholenAnsicht(inhalt);
      document.title = 'Wiederholen · Rust Academy';
      break;
    case 'glossar':
      inhalt.append(glossarAnsicht());
      document.title = 'Glossar · Rust Academy';
      break;
    case 'profil':
      inhalt.append(profilAnsicht());
      document.title = 'Profil · Rust Academy';
      break;
    default:
      inhalt.append(pfadAnsicht());
      document.title = 'Rust Engineering Academy';
  }
  if (teil !== 'lektion' && document.activeElement && document.activeElement !== document.body) inhalt.focus({ preventScroll: true });
}

themaAnwenden();
beobachten(kopfAktualisieren);
kopfAktualisieren();
window.addEventListener('hashchange', route);
route();

// Ein Tageswechsel (App bleibt offen) soll Streak und fällige Karten aktualisieren.
document.addEventListener('visibilitychange', () => { if (!document.hidden) kopfAktualisieren(); });

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* Offline-Funktion optional */ });
  });
}
