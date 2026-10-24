// Prüft alle Lektionen gegen schema/lesson.schema.json und führt inhaltliche Prüfungen durch,
// die ein JSON-Schema nicht ausdrücken kann. Beendet sich mit Code 1 bei Fehlern (CI schlägt fehl).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');
const schema = JSON.parse(readFileSync(join(ROOT, 'schema', 'lesson.schema.json'), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const fehler = [];
const warnungen = [];
const melde = (datei, text) => fehler.push(`${datei}: ${text}`);
const warne = (datei, text) => warnungen.push(`${datei}: ${text}`);

function lesen(pfad) {
  try {
    return JSON.parse(readFileSync(pfad, 'utf8'));
  } catch (e) {
    melde(relative(ROOT, pfad), `kein gültiges JSON (${e.message})`);
    return undefined;
  }
}

/** Alle Texte eines Objekts rekursiv einsammeln (für Rechtschreib-Prüfungen). */
function texte(x, out = []) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => texte(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => texte(y, out));
  return out;
}

const MARKE = '{{?}}';
const zaehle = (s, t) => s.split(t).length - 1;

function pruefeSchritt(datei, s, i) {
  const ort = `Schritt ${i + 1} (${s.typ})`;
  const auswahl = ['multiple-choice', 'code-lesen', 'terminal-deuten'];
  if (auswahl.includes(s.typ)) {
    const k = Array.isArray(s.korrekt) ? s.korrekt : [s.korrekt];
    for (const idx of k) if (idx >= s.optionen.length) melde(datei, `${ort}: korrekt=${idx} liegt ausserhalb der ${s.optionen.length} Optionen`);
    if (s.begruendungen && s.begruendungen.length !== s.optionen.length) {
      melde(datei, `${ort}: begruendungen (${s.begruendungen.length}) muss gleich viele Einträge haben wie optionen (${s.optionen.length})`);
    }
    if (k.length === s.optionen.length) melde(datei, `${ort}: alle Optionen sind korrekt – das ist keine Übung`);
  }
  if (s.code?.anmerkungen) {
    for (const a of s.code.anmerkungen) if (a.zeile > s.code.zeilen.length) melde(datei, `${ort}: Anmerkung für Zeile ${a.zeile}, der Code hat nur ${s.code.zeilen.length} Zeilen`);
  }
  if (s.typ === 'fehler-finden' && s.fehlerZeile > s.code.zeilen.length) {
    melde(datei, `${ort}: fehlerZeile ${s.fehlerZeile} existiert nicht (Code hat ${s.code.zeilen.length} Zeilen)`);
  }
  if (s.typ === 'lueckentext') {
    const quelle = s.code ? s.code.zeilen.join('\n') : s.text ?? '';
    const n = zaehle(quelle, MARKE);
    if (n !== s.luecken.length) melde(datei, `${ort}: ${n} Lücken (${MARKE}) im Text, aber ${s.luecken.length} Einträge in luecken`);
    if (s.auswahl) {
      for (const [j, l] of s.luecken.entries()) {
        if (!l.loesungen.some((x) => s.auswahl.includes(x))) melde(datei, `${ort}: Lösung für Lücke ${j + 1} fehlt in auswahl`);
      }
      const benoetigt = s.luecken.map((l) => l.loesungen.find((x) => s.auswahl.includes(x)));
      for (const w of new Set(benoetigt)) {
        if (benoetigt.filter((x) => x === w).length > s.auswahl.filter((x) => x === w).length) {
          melde(datei, `${ort}: Baustein "${w}" wird mehrfach gebraucht, kommt in auswahl aber zu selten vor`);
        }
      }
    }
  }
  if (s.typ === 'zuordnen') {
    const rechts = s.paare.map((p) => p.rechts);
    const links = s.paare.map((p) => p.links);
    if (new Set(rechts).size !== rechts.length || new Set(links).size !== links.length) melde(datei, `${ort}: Paare müssen eindeutig sein`);
  }
}

function pruefeLektion(pfad) {
  const datei = relative(ROOT, pfad);
  const l = lesen(pfad);
  if (!l) return undefined;
  if (!validate(l)) {
    for (const e of validate.errors ?? []) {
      if (e.keyword === 'if') continue; // Folgefehler der Typ-Unterscheidung
      melde(datei, `Schema: ${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`);
    }
    return l;
  }
  if (basename(pfad, '.json') !== l.id) melde(datei, `Dateiname muss der id entsprechen (${l.id}.json)`);
  const ordner = basename(join(pfad, '..'));
  if (ordner !== `phase-${l.phase}`) melde(datei, `liegt in ${ordner}, gehört aber zu phase-${l.phase}`);
  if (!l.id.startsWith(`p${l.phase}-`)) melde(datei, `id ${l.id} passt nicht zu phase ${l.phase}`);

  const interaktiv = l.schritte.filter((s) => s.typ !== 'erklaerung').length;
  if (interaktiv * 2 < l.schritte.length) melde(datei, `nur ${interaktiv} von ${l.schritte.length} Schritten sind Übungen (mindestens die Hälfte nötig)`);
  l.schritte.forEach((s, i) => pruefeSchritt(datei, s, i));

  const ids = l.schritte.map((s) => s.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) melde(datei, 'Schritt-ids müssen innerhalb der Lektion eindeutig sein');

  // Schweizer Rechtschreibung: kein ß.
  for (const t of texte(l)) if (t.includes('ß')) melde(datei, `enthält "ß" (Schweizer Rechtschreibung verwendet "ss"): "${t.slice(0, 60)}…"`);

  const lang = l.schritte.filter((s) => s.typ === 'erklaerung' && s.text.split(/\s+/).length > 140);
  if (lang.length) warne(datei, `${lang.length} Erklärung(en) mit mehr als 140 Wörtern – kürzer fassen?`);
  return l;
}

function alleDateien(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? alleDateien(p) : [p];
  });
}

// --- Lektionen
const lektionsDateien = alleDateien(CONTENT).filter((p) => p.endsWith('.json') && basename(p) !== 'curriculum.json');
const lektionen = new Map();
for (const p of lektionsDateien) {
  const l = pruefeLektion(p);
  if (!l?.id) continue;
  if (lektionen.has(l.id)) melde(relative(ROOT, p), `doppelte id ${l.id}`);
  lektionen.set(l.id, l);
}

// --- Curriculum
const curriculum = lesen(join(CONTENT, 'curriculum.json'));
const imCurriculum = new Set();
if (curriculum) {
  if (!Array.isArray(curriculum.phasen)) melde('content/curriculum.json', 'phasen fehlt');
  for (const phase of curriculum.phasen ?? []) {
    for (const modul of phase.module ?? []) {
      if (!/^\d{1,2}\.\d{1,2}$/.test(modul.id ?? '')) melde('content/curriculum.json', `Modul-id "${modul.id}" muss die Form "1.2" haben`);
      for (const id of modul.lektionen ?? []) {
        if (imCurriculum.has(id)) melde('content/curriculum.json', `Lektion ${id} kommt mehrfach vor`);
        imCurriculum.add(id);
        const l = lektionen.get(id);
        if (!l) {
          melde('content/curriculum.json', `Lektion ${id} hat keine Datei content/phase-${phase.nummer}/${id}.json`);
          continue;
        }
        if (l.phase !== phase.nummer) melde('content/curriculum.json', `Lektion ${id} steht in Phase ${phase.nummer}, hat aber phase=${l.phase}`);
        if (!l.modul.startsWith(`${modul.id} `)) melde(`content/phase-${l.phase}/${id}.json`, `modul "${l.modul}" passt nicht zum Curriculum-Modul ${modul.id}`);
      }
    }
  }
  for (const t of texte(curriculum)) if (t.includes('ß')) melde('content/curriculum.json', `enthält "ß": "${t.slice(0, 60)}"`);
}
for (const id of lektionen.keys()) if (!imCurriculum.has(id)) melde(`${id}.json`, 'ist nicht im Curriculum eingetragen');

// --- Ausgabe
for (const w of warnungen) console.warn(`⚠ ${w}`);
if (fehler.length) {
  for (const f of fehler) console.error(`✗ ${f}`);
  console.error(`\n${fehler.length} Fehler in den Inhalten.`);
  process.exit(1);
}
console.log(`✓ ${lektionen.size} Lektionen und Curriculum sind gültig.`);
