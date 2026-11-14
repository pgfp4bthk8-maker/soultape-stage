// ChordPro: Einlesen, Analysieren, Transponieren, Darstellen.
// Bewusst tolerant, weil echte Dateien aus dem Proberaum selten sauber sind.

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
// Tonarten (nach Halbton 0=C … 11=B), die üblicherweise mit b statt # geschrieben werden
const FLAT_MAJOR = new Set([1, 3, 5, 8, 10]);        // Db Eb F Ab Bb
const FLAT_MINOR = new Set([0, 2, 3, 5, 7, 10]);     // Cm Dm Ebm Fm Gm Bbm

const CHORD_RE = /^([A-H])(#|b)?([^/\s]*)(?:\/([A-H])(#|b)?)?$/;
const SUFFIX_OK = /^(m|min|maj|M|dim|aug|sus|add|no|°|ø|\+|-|\(|\)|,|#|b|\d)*$/;

// Chris' eigene Kürzel für Umkehrungen (am 08.11.2026 gemeinsam geklärt):
//   C-2 (auch „C 2“)  = 2. Umkehrung, Quinte unten  → C/G
//   D1  (auch „D-1“)  = 1. Umkehrung, Terz unten    → D/F#   (bei Moll kleine Terz: Am1 → Am/C)
//   G 0 (auch „G0“)   = Grundstellung               → G
// Achtung: D2, A2 OHNE Strich bedeuten „add2“ (D-Dur mit e) – keine Umkehrung.
const INV_RE = /^([A-H])(#|b)?(m?)(?:(?:-|\s+)([012])|([01]))$/;
const semiOf = (root, acc) => (BASE[root] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;

// Deutsche Notennamen: Cis/Fis/Gis = C#/F#/G#, Es/As/Des/Ges = Eb/Ab/Db/Gb (aber Asus4 bleibt Asus4)
const GER_ACC_RE = /^([A-H])(is|es|s)(?=$|[m\d/(]|maj|dim|aug|sus|add)/;
function germanNote(s) {
  const g = GER_ACC_RE.exec(s);
  if (!g || (g[2] === 's' && !/[AE]/.test(g[1]))) return s;
  return g[1] + (g[2] === 'is' ? '#' : 'b') + s.slice(g[0].length);
}

/**
 * Bringt Akkorde in die übliche englische Form, bevor sie gelesen werden:
 *  - Kleinbuchstabe = Moll (deutsche Liederbuch-Schreibweise): a → Am, em → Em, bm7 → Bm7
 *  - deutsche Namen: Cism → C#m, Gis → G#, D/Fis → D/F#
 */
export function normalizeChord(raw) {
  let s = raw.trim();
  const minor = /^[a-h]/.test(s);
  if (minor) s = s[0].toUpperCase() + s.slice(1);
  s = germanNote(s);
  s = s.replace(/\/([A-Ha-h])(is|es|s)?$/, (all, n, a) => {
    const N = n.toUpperCase();
    if (!a || (a === 's' && !/[AE]/.test(N))) return '/' + N + (a || '');
    return '/' + N + (a === 'is' ? '#' : 'b');
  });
  if (minor) {
    const m = /^([A-H][#b]?)(.*)$/.exec(s);
    if (m && !/^m(?!aj)/.test(m[2])) s = m[1] + 'm' + m[2];
  }
  return s;
}

/** Zerlegt einen Akkord. Gibt null zurück, wenn es kein Akkord ist. */
export function parseChord(raw) {
  const s = normalizeChord(raw);
  const inv = INV_RE.exec(s);
  if (inv) {
    const [, root, acc = '', minor, withSep, noSep] = inv;
    const semi = semiOf(root, acc);
    const n = Number(withSep !== undefined ? withSep : noSep);
    const bassSemi = n === 0 ? null : (semi + (n === 1 ? (minor ? 3 : 4) : 7)) % 12;
    return { semi, suffix: minor, bassSemi, review: false, inversion: n };
  }
  const m = CHORD_RE.exec(s);
  if (!m) return null;
  const [, root, acc = '', suffix, bass, bassAcc = ''] = m;
  if (!SUFFIX_OK.test(suffix)) return null;
  const semi = semiOf(root, acc);
  const bassSemi = bass ? semiOf(bass, bassAcc) : null;
  // Unbekannte eigene Kürzel mit Strich (z. B. C-5) lieber gemeinsam prüfen
  const review = /^-\d/.test(suffix);
  return { semi, suffix, bassSemi, review };
}

/** Prüft, ob ein Token ein (gültiger oder prüfbedürftiger) Akkord ist. */
export const isChord = (tok) => parseChord(tok) !== null;

/**
 * Ordnet den Inhalt einer eckigen Klammer ein (Internet-Vorlagen schreiben dort nicht nur Akkorde hinein):
 *  chord   – [Am], [C-2]
 *  multi   – mehrere Akkorde: [Eb-Bb-Eb]
 *  paren   – Akkord in runden Klammern: [(E5)]
 *  repeat  – Akkord mit Wiederholung: [C#m(x3)]
 *  filler  – Füllzeichen/Wiederholung ohne Akkord: [-], [~], [#], [(x2)]
 *  note    – Text-Hinweis: [guitar stops], [Chorus]
 *  odd     – unbekannt → blau „bitte prüfen“
 */
export function bracketKind(raw) {
  const s = raw.trim();
  if (parseChord(s)) return { kind: 'chord' };
  let m = /^\((.+)\)$/.exec(s);
  if (m && parseChord(m[1])) return { kind: 'paren', chord: m[1] };
  m = /^(.+?)\s*\(\s*(x\s*\d+|\d+\s*x)\s*\)$/i.exec(s);
  if (m && parseChord(m[1])) return { kind: 'repeat', chord: m[1], times: m[2] };
  const parts = s.split('-');
  if (parts.length > 1 && parts.every((p) => p && parseChord(p))) return { kind: 'multi', parts };
  if (/^[-~/%|#*.\s]*$/.test(s) || /^\(?\s*(x\s*\d+|\d+\s*x)\s*\)?$/i.test(s)) return { kind: 'filler' };
  if (/\s/.test(s) || /^[A-Za-zÄÖÜäöüß]{4,}$/.test(s)) return { kind: 'note' };
  return { kind: 'odd' };
}

function noteName(semi, useFlats, notation) {
  let n = (useFlats ? FLAT : SHARP)[((semi % 12) + 12) % 12];
  if (notation === 'de') {
    if (n === 'B') n = 'H';
    else if (n === 'Bb' || n === 'A#') n = 'B';
  }
  return n;
}

/** Bestimmt, ob die Zieltonart eher mit b geschrieben wird. */
export function prefersFlats(key, steps) {
  if (!key) return false;
  const k = parseChord(key);
  if (!k) return false;
  const minor = /^m(?!aj)/.test(k.suffix);
  const t = (k.semi + steps + 120) % 12;
  return minor ? FLAT_MINOR.has(t) : FLAT_MAJOR.has(t);
}

/** Transponiert einen Akkord und schreibt ihn in deutscher (H) oder englischer (B) Schreibweise. */
export function formatChord(raw, steps = 0, notation = 'de', useFlats = false) {
  const c = parseChord(raw);
  if (!c) return raw;
  // Ohne Transposition die Schreibweise der Vorlage beibehalten (Bb bleibt Bb, F# bleibt F#)
  if (steps === 0) {
    const n = normalizeChord(raw);
    if (/^[A-H]b/.test(n)) useFlats = true;
    else if (/^[A-H]#/.test(n)) useFlats = false;
  }
  let out = noteName(c.semi + steps, useFlats, notation) + c.suffix;
  if (c.bassSemi !== null) out += '/' + noteName(c.bassSemi + steps, useFlats, notation);
  return out;
}

export function transposeKey(key, steps, notation) {
  if (!key) return '';
  return formatChord(key, steps, notation, prefersFlats(key, steps));
}

// ---------- Einlesen ----------

const SECTION_RE = /^\(?\s*((?:pre-?|post-?)?chorus|verse|strophe|str\.?|\d\.\s*str\.?|refrain|ref\.?\d*|bridge|intro|outro|solo|guitar solo|instrumental|interlude|zwischenspiel|coda|ending|ende|break)\b[^()]*\)?\s*:?\s*$/i;
const KAWAI_RE = /^\(?\s*\d{2}[A-C](?:[\s+]|$|\)|EFF)/;
const MEDLEY_RE = /^[-—–_]{3,}\s*([^-—–_].*?)\s*[-—–_]{3,}\s*$/;
// Abschnittsname, der einen Refrain meint (Pre-Chorus zählt nicht dazu)
const isChorusName = (t) => /chorus|refrain|^ref(\.|\d|\b)/i.test(t) && !/^\(?\s*pre/i.test(t);
// Besetzungs-Hinweise ohne Klammern, z. B. „Bass & Drums In“, „Guitar Only“, „nur Git“
const INSTR = '(?:guitars?|gitarren?|git|bass|drums|schlagzeug|keys|keyboards?|piano|klavier|orgel|organ|synth|vocals?|gesang|band|alle|all)';
const INSTR_LIST = `${INSTR}(?:\\s*(?:&|\\+|/|,|und|and)\\s*${INSTR})*`;
const HINT_RE = new RegExp(`^(?:(?:nur|only)\\s+${INSTR_LIST}|${INSTR_LIST}\\s+(?:in|out|only|solo|raus|rein|allein|dazu|ab|weg|einsatz|stop|tacet))\\s*!*$`, 'i');
const normText = (s) => (s || '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
// Klammer-Inhalt bis 4 Wörter = Spielhinweis wie „(Lauf)“ oder „(bis Este schreit)“;
// länger = Backing-Vocals oder gesprochener Einwurf
const isHint = (t) => t.trim().split(/\s+/).length <= 4;

// Eigene Direktive für Soundwechsel am Nord (andere Programme ignorieren unbekannte Direktiven)
const SWITCH_NAMES = ['wechsel', 'soundwechsel', 'x_wechsel'];
const SLOT_RE = /^([A-T])\s?(\d{2})(?=$|[\s,;:·–-])/;

/** Baut die Rohtext-Zeile für einen Soundwechsel. */
export const switchLine = (text) => `{wechsel: ${String(text).replace(/[{}\n\r]/g, ' ').trim()}}`;
/** Liest den Text eines Soundwechsels aus einer Rohtext-Zeile (oder null). */
export function switchText(line) {
  const d = directive(line || '');
  return d && SWITCH_NAMES.includes(d.name) ? d.value : null;
}

function directive(line) {
  const m = /^\{\s*([a-z_]+)\s*(?::\s*(.*?))?\s*\}\s*$/i.exec(line.trim());
  return m ? { name: m[1].toLowerCase(), value: (m[2] || '').trim() } : null;
}

/** Teilt eine ChordPro-Datei mit {new_song} in einzelne Songtexte. */
export function splitSongs(text) {
  const t = text.replace(/\r\n?/g, '\n');
  const chunks = t.split(/^\s*\{\s*(?:new_song|ns)\s*\}\s*$/im).map((c) => c.trim()).filter(Boolean);
  return chunks.map((raw) => ({ raw, meta: readMeta(raw) }));
}

/** Liest Titel, Interpret, Tonart und alte Kawai-Codes aus einem Songtext. */
export function readMeta(raw) {
  const meta = { title: '', artist: '', key: '', kawai: [] };
  for (const line of raw.split('\n')) {
    const d = directive(line);
    if (d) {
      if (['title', 't'].includes(d.name)) meta.title = d.value;
      else if (['subtitle', 'st', 'artist'].includes(d.name)) meta.artist = meta.artist || d.value;
      else if (d.name === 'key') meta.key = d.value;
      continue;
    }
    const s = line.trim();
    if (KAWAI_RE.test(s)) meta.kawai.push(s.replace(/^\(|\)$/g, ''));
  }
  // Interpret ohne Direktive direkt unter dem Titel (z. B. „Bryan Adams“)
  if (!meta.artist) {
    const lines = raw.split('\n').map((l) => l.trim());
    const ti = lines.findIndex((l) => /^\{\s*(title|t)\s*:/i.test(l));
    const next = ti >= 0 ? lines[ti + 1] : '';
    if (isArtistLine(next)) meta.artist = next;
  }
  return meta;
}

/** Kurze Textzeile direkt unter dem Titel, die wie ein Interpret aussieht (z. B. „Bryan Adams“). */
function isArtistLine(s) {
  return !!s && !s.startsWith('{') && !s.startsWith('#') && !/[[\]]/.test(s) && s.split(/\s+/).length <= 4
    && !KAWAI_RE.test(s) && !SECTION_RE.test(s) && !isChordLine(s) && !/^\(/.test(s);
}

/** Schlägt eine Tonart aus den Akkorden vor (erster Akkord, gegengeprüft mit dem letzten). */
export function guessKey(raw) {
  const chords = [];
  for (const r of parseSheet(raw)) {
    if (r.type === 'chords') chords.push(...r.tokens.map((t) => t.replace(/^\[|\]$/g, '')).filter(isChord));
    if (r.type === 'lyric') chords.push(...r.segs.map((x) => (x.chord || '').trim()).filter(isChord));
    if (chords.length) break;
  }
  if (!chords.length) return '';
  const first = parseChord(chords[0]);
  const minor = /^m(?!aj)/.test(first.suffix);
  return FLAT[first.semi].replace('Db', 'C#').replace('Gb', 'F#') + (minor ? 'm' : '');
}

function isChordLine(s) {
  const toks = s.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
  if (!toks.length) return false;
  let chords = 0;
  for (const t of toks) {
    // ohne eckige Klammern nur Großbuchstaben als Akkord werten („a“ oder „am“ sind hier eher Text)
    if (/^[A-H]/.test(t) && isChord(t)) { chords++; continue; }
    if (/^(x\s*\d+|\d+\s*x|x|\d+x?)$/i.test(t)) continue;
    if (/^[-~/%*.]+$/.test(t)) continue;   // Füllzeichen wie in „G   F -   D ~ ~“
    if (/^\[[^\]]+\]$/.test(t) && isChord(t.slice(1, -1))) { chords++; continue; }
    return false;
  }
  return chords > 0;
}

/**
 * Wandelt einen Songtext in eine Liste von Zeilen-Objekten um:
 *  { type: 'section'|'medley'|'trigger'|'comment'|'kawai'|'chords'|'lyric'|'empty', ... }
 * Kopfdaten (title, subtitle, key) werden übersprungen – die zeigt die App selbst.
 */
export function parseSheet(raw) {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  // Refrain-Balken: beginnt mit {soc} oder einer Überschrift wie „Chorus“/„(Ref)“.
  // Ein per Überschrift begonnener Refrain endet an der nächsten Leerzeile,
  // ein {soc}-Refrain an {eoc} oder spätestens nach zwei Leerzeilen
  // (in echten Dateien fehlt {eoc} manchmal, oder es steht ohne passendes {soc}).
  let chorus = null;          // null | 'soc' | 'head'
  let chorusFilled = false;   // hat der Refrain schon Inhalt?
  let blanks = 0;
  const push = (row) => {
    if (row.type === 'empty') {
      blanks++;
      if (chorus && chorusFilled && (chorus === 'head' || blanks >= 2)) chorus = null;
    } else if (row.type !== 'kawai') {
      blanks = 0;
      if (chorus) { chorusFilled = true; row.chorus = true; }
    }
    out.push(row);
  };
  const section = (text) => {
    const isCh = isChorusName(text);
    chorus = isCh ? 'head' : null;
    chorusFilled = false;
    out.push({ type: 'section', text, chorus: isCh });
  };
  let title = '', artist = '', titleLine = -2, inTab = false;
  // Jede Zeile merkt sich ihre Zeilennummer im Rohtext (src) – damit lässt sich in der
  // Song-Ansicht genau vor einer angetippten Zeile ein Soundwechsel einfügen.
  const srcOf = lines.map((_, k) => k);
  let tagged = 0, prevSrc = 0;
  const tag = () => { for (; tagged < out.length; tagged++) out[tagged].src = prevSrc; };
  for (let i = 0; i < lines.length; i++) {
    tag(); prevSrc = srcOf[i];
    const line = lines[i];
    const s = line.trim();
    const d = directive(s);
    // Soundwechsel: {wechsel: M 24 – Orgel} oder {wechsel: Synth AN} → auffälliger Balken
    if (d && SWITCH_NAMES.includes(d.name)) {
      if (d.value) out.push({ type: 'switch', text: d.value });
      continue;
    }
    // Tabulatur-Block {sot} … {eot}: Zeilen unverändert in Festbreiten-Schrift
    if (inTab) {
      if (d && ['eot', 'end_of_tab'].includes(d.name)) { inTab = false; continue; }
      if (s) out.push({ type: 'tab', text: line.replace(/\t/g, '    ').replace(/\s+$/, '') });
      continue;
    }
    if (d) {
      const n = d.name;
      if (['sot', 'start_of_tab'].includes(n)) { inTab = true; continue; }
      // {inline: [F#] [E] [D]} → Inhalt wie eine normale Zeile behandeln
      if (n === 'inline') { if (d.value) { lines.splice(i + 1, 0, d.value); srcOf.splice(i + 1, 0, srcOf[i]); } continue; }
      if (['title', 't'].includes(n)) { title = d.value; titleLine = i; continue; }
      if (['subtitle', 'st', 'artist'].includes(n)) { artist = artist || d.value; continue; }
      if (['key', 'tempo', 'time', 'capo', 'duration', 'album', 'year'].includes(n)) continue;
      if (['soc', 'start_of_chorus'].includes(n)) {
        out.push({ type: 'section', text: d.value || 'Refrain', chorus: true });
        chorus = 'soc'; chorusFilled = false; blanks = 0;
        continue;
      }
      if (['eoc', 'end_of_chorus', 'end_of_part', 'eov', 'end_of_verse', 'eob', 'end_of_bridge'].includes(n)) { chorus = null; continue; }
      if (['start_of_part', 'sov', 'start_of_verse', 'sob', 'start_of_bridge'].includes(n)) {
        section(d.value || (n.includes('bridge') || n === 'sob' ? 'Bridge' : 'Strophe'));
        continue;
      }
      if (['comment', 'c', 'ci', 'comment_italic', 'cb'].includes(n)) {
        const v = d.value;
        if (/https?:|tabbed by|source:/i.test(v)) continue;
        // Kommentar, der nur Titel (und Interpret) wiederholt, z. B. „Use Somebody - Kings of Leon“
        const nv = normText(v);
        if (nv && title && (nv === normText(title) || nv === normText(title + artist))) continue;
        if (SECTION_RE.test(v)) section(v.replace(/[()]/g, '').trim());
        else push({ type: 'trigger', text: v });
        continue;
      }
      continue; // unbekannte Direktive ignorieren
    }
    if (s.startsWith('#')) continue;
    if (!s) { push({ type: 'empty' }); continue; }
    // Interpret ohne Direktive direkt unter dem Titel (z. B. „Bryan Adams“) überspringen
    if (i === titleLine + 1 && !artist && isArtistLine(s)) { artist = s; continue; }
    if (KAWAI_RE.test(s)) { push({ type: 'kawai', text: s.replace(/^\(|\)$/g, '') }); continue; }
    const md = MEDLEY_RE.exec(s);
    if (md) { chorus = null; push({ type: 'medley', text: md[1] }); continue; }
    // „INTRO | C | C/E | F |“ → Abschnitt + Akkordzeile
    const bar = /^([A-Za-z][A-Za-z\s.\d-]{1,20}?)\s*\|(.*)$/.exec(s);
    if (bar && SECTION_RE.test(bar[1].trim())) {
      section(bar[1].trim());
      const rest = ('|' + bar[2]).replace(/\}\s*$/, '');
      push({ type: 'chords', tokens: rest.split(/(\s+)/).filter((x) => x !== '') });
      continue;
    }
    if (!/\[/.test(s) && s.length <= 40 && SECTION_RE.test(s)) {
      section(s.replace(/^\(|\)\s*:?$|:$/g, '').trim());
      continue;
    }
    // „... Chorus ...“ = hier den Refrain wiederholen (eigener Hinweis, öffnet keinen Refrain-Block)
    const bare = s.replace(/^[.…\s]+|[.…\s]+$/g, '');
    if (bare !== s && bare && !/\[/.test(s) && SECTION_RE.test(bare)) {
      chorus = null;
      out.push({ type: 'section', text: bare, chorus: isChorusName(bare), repeat: true });
      continue;
    }
    if (/^\(.*\)$/.test(s) && !/\[/.test(s)) {
      // Kurz = Spielhinweis (orange), lang = gesungene/gesprochene Zeile (grau-kursiv)
      const inner = s.slice(1, -1).trim();
      push({ type: isHint(inner) ? 'trigger' : 'vocal', text: inner });
      continue;
    }
    if (!/\[/.test(s) && HINT_RE.test(s)) { push({ type: 'trigger', text: s }); continue; }
    // Ganze Zeile in eckigen Klammern, aber kein Akkord: [Intro], [Chorus 2x], [guitar stops]
    const whole = /^\[([^\]]+)\]$/.exec(s);
    if (whole && bracketKind(whole[1]).kind === 'note') {
      const t = whole[1].trim();
      if (SECTION_RE.test(t)) section(t);
      else push({ type: isHint(t) ? 'trigger' : 'vocal', text: t });
      continue;
    }
    if (!/\[/.test(s) && isChordLine(s)) {
      // Akkordzeile über einer Textzeile → in Inline-Akkorde umwandeln
      const nxt = lines[i + 1];
      const ns = (nxt || '').trim();
      if (ns && !/\|/.test(s) && !/[[\]{}]/.test(ns) && !isChordLine(ns) && !SECTION_RE.test(ns) && !KAWAI_RE.test(ns) && !/^\(.*\)$/.test(ns) && !MEDLEY_RE.test(ns)) {
        const pos = [];
        const cre = /\S+/g; let cm;
        while ((cm = cre.exec(line)) !== null) pos.push({ col: cm.index, chord: cm[0] });
        const lyr = nxt.replace(/\t/g, '    ');
        const segs = [];
        if (pos[0].col > 0) segs.push({ chord: null, text: lyr.slice(0, pos[0].col) });
        pos.forEach((p, k) => segs.push({ chord: p.chord, text: lyr.slice(p.col, k + 1 < pos.length ? pos[k + 1].col : undefined) }));
        push({ type: 'lyric', segs });
        i++;
        continue;
      }
      push({ type: 'chords', tokens: s.split(/(\s+)/).filter((x) => x !== '') });
      continue;
    }
    // Zeile mit Inline-Akkorden: [C]Text [G]mehr Text
    const segs = [];
    const re = /\[([^\]]*)\]/g;
    let last = 0, m, pending = null;
    while ((m = re.exec(line)) !== null) {
      const before = line.slice(last, m.index);
      if (pending !== null || before) segs.push({ chord: pending, text: before });
      pending = m[1];
      last = re.lastIndex;
    }
    const rest = line.slice(last);
    if (pending !== null || rest) segs.push({ chord: pending, text: rest });
    // Hinweise in Klammern innerhalb der Zeile hervorheben, z. B. „(Lauf)“ oder „(2T)“
    push({ type: 'lyric', segs });
  }
  tag();
  // Leerzeilen zwischen zwei Tabulatur-Zeilen entfernen (manche Vorlagen setzen jede Saite in einen eigenen Block)
  const noTabGaps = out.filter((l, i, a) => !(l.type === 'empty' && a[i - 1] && a[i - 1].type === 'tab'
    && (a.slice(i + 1).find((x) => x.type !== 'empty') || {}).type === 'tab'));
  // Mehrfache Leerzeilen zusammenfassen
  return noTabGaps.filter((l, i, a) => !(l.type === 'empty' && (i === 0 || a[i - 1].type === 'empty')));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function oneChordHtml(raw, opt) {
  const c = parseChord(raw);
  const txt = formatChord(raw, opt.steps, opt.notation, opt.flats);
  return `<span class="ch${c.review ? ' review' : ''}"${c.review ? ' title="Eigenes Kürzel – gemeinsam prüfen"' : ''}>${esc(txt)}</span>`;
}

function chordHtml(raw, opt) {
  const b = bracketKind(raw);
  switch (b.kind) {
    case 'chord': return oneChordHtml(raw, opt);
    case 'paren': return `<span class="bar">(</span>${oneChordHtml(b.chord, opt)}<span class="bar">)</span>`;
    case 'repeat': return `${oneChordHtml(b.chord, opt)}<span class="bar"> (${esc(b.times)})</span>`;
    case 'multi': return b.parts.map((p) => oneChordHtml(p, opt)).join('<span class="bar">-</span>');
    case 'filler': return `<span class="bar">${esc(raw)}</span>`;
    case 'note': return isHint(raw) ? `<span class="trig-in">${esc(raw)}</span>` : `<span class="vocal">${esc(raw)}</span>`;
    default: return `<span class="ch odd" title="Kein bekannter Akkord – bitte prüfen">${esc(raw)}</span>`;
  }
}

// Ein Wort samt umgebenden Leerzeichen; Klammer-Hinweise wie „(bis Este schreit)“ bleiben zusammen
const WORD_RE = /\s*(?:\([^)]{0,40}\)|[^\s(]|\()+\s*/g;

function textHtml(t) {
  // (Hinweise) in Lyrik-Zeilen als Trigger markieren, lange Klammern grau-kursiv
  return esc(t).replace(/\(([^)]{1,40})\)/g, (all, inner) =>
    isHint(inner) ? `<span class="trig-in">${inner}</span>` : `<span class="vocal">${all}</span>`);
}

/** Rendert einen Songtext als HTML für die Bühnenansicht. */
export function renderSheet(raw, { steps = 0, notation = 'de', key = '' } = {}) {
  const opt = { steps, notation, flats: prefersFlats(key, steps) };
  const rows = parseSheet(raw);
  const html = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const ch = r.chorus ? ' chorus' : '';
    const before = html.length;
    switch (r.type) {
      case 'switch': {
        // Programmplatz am Anfang („M 24 …“) groß hervorheben, Rest als Text
        const m = SLOT_RE.exec(r.text);
        const rest = m ? r.text.slice(m[0].length).replace(/^[\s,;:·–-]+/, '') : r.text;
        html.push(`<div class="ln switch"><span class="sw-ico">⇄</span><span class="sw-lbl">Wechsel</span>${m ? `<span class="sw-slot">${m[1]} ${m[2]}</span>` : ''}${rest ? `<span class="sw-txt">${esc(rest)}</span>` : ''}</div>`);
        break;
      }
      case 'tab': {
        // aufeinanderfolgende Tab-Zeilen in einen Block; zu breite Tabs nur im Block seitlich verschiebbar
        const block = [];
        while (i < rows.length && rows[i].type === 'tab') block.push(esc(rows[i++].text));
        i--;
        html.push(`<pre class="ln tab">${block.join('\n')}</pre>`);
        break;
      }
      case 'empty': html.push('<div class="ln empty"></div>'); break;
      case 'section': html.push(`<div class="ln sec${r.chorus ? ' sec-chorus' : ''}">${r.repeat ? '↻ ' : ''}${esc(r.text)}</div>`); break;
      case 'medley': html.push(`<div class="ln medley">${esc(r.text)}</div>`); break;
      case 'trigger': html.push(`<div class="ln trig${ch}"><span>${esc(r.text)}</span></div>`); break;
      case 'vocal': html.push(`<div class="ln vocal${ch}">(${esc(r.text)})</div>`); break;
      case 'kawai': html.push(`<div class="ln kawai">Kawai: ${esc(r.text)}</div>`); break;
      case 'chords':
        html.push(`<div class="ln chords${ch}">` + r.tokens.map((t) => {
          if (/^\s+$/.test(t)) return ' ';
          if (/^\[.+\]$/.test(t)) return chordHtml(t.slice(1, -1), opt);
          return isChord(t) ? chordHtml(t, opt) : `<span class="bar">${esc(t)}</span>`;
        }).join('') + '</div>');
        break;
      case 'lyric': {
        const hasChord = r.segs.some((s) => s.chord !== null);
        if (!hasChord) { html.push(`<div class="ln lyr${ch}">${esc(r.segs.map((s) => s.text).join('')) || '&nbsp;'}</div>`); break; }
        // Jedes Wort wird ein eigener Baustein, damit lange Zeilen auf dem iPad umbrechen
        // statt rechts aus dem Bild zu laufen. Der Akkord sitzt über dem ersten Wort seines Abschnitts.
        // Steht ein Akkord mitten im Wort („trou[D5]ble“), bleiben beide Teile zusammen (.glue).
        const units = [];
        for (const s of r.segs) {
          const c = s.chord === null ? '' : (s.chord.trim() ? chordHtml(s.chord.trim(), opt) : '');
          (s.text.match(WORD_RE) || [s.text]).forEach((w, k) => units.push({ c: k === 0 ? c : '', t: w }));
        }
        const seg = (u) => `<span class="seg"><span class="sc">${u.c || '&nbsp;'}</span><span class="st">${u.t ? textHtml(u.t) : '&nbsp;'}</span></span>`;
        const out = [];
        let group = [];
        const flush = () => {
          if (group.length > 1) out.push(`<span class="glue">${group.map(seg).join('')}</span>`);
          else if (group.length) out.push(seg(group[0]));
          group = [];
        };
        units.forEach((u, k) => {
          const prev = units[k - 1];
          const glued = prev && ((/\S$/.test(prev.t) && /^\S/.test(u.t)) || u.t === '');
          if (!glued) flush();
          group.push(u);
        });
        flush();
        html.push(`<div class="ln pair${ch}">${out.join('')}</div>`);
        break;
      }
    }
    if (html.length > before && r.src !== undefined) html[before] = html[before].replace(/^<(div|pre) /, `<$1 data-src="${r.src}" `);
  }
  return html.join('');
}

/** Zählt Dinge, die beim Import auffallen (für die Vorschau). */
export function analyze(raw) {
  const rows = parseSheet(raw);
  const chords = [...raw.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].trim());
  const review = [...new Set(chords.filter((c) => {
    const k = bracketKind(c).kind;
    return k === 'odd' || (k === 'chord' && parseChord(c).review);
  }))];
  return {
    sections: rows.filter((r) => r.type === 'section').length,
    triggers: rows.filter((r) => r.type === 'trigger').length,
    review,
    usesH: /\[H/.test(raw) || /(^|\s)H(m|7|\s|$)/m.test(raw),
    // nur Titel, kein Inhalt – z. B. „Pause 😃“ oder „Zugabe“ in einer Setliste
    empty: rows.every((r) => r.type === 'empty'),
  };
}
