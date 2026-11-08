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

/** Zerlegt einen Akkord. Gibt null zurück, wenn es kein Akkord ist. */
export function parseChord(raw) {
  const s = raw.trim();
  const m = CHORD_RE.exec(s);
  if (!m) return null;
  const [, root, acc = '', suffix, bass, bassAcc = ''] = m;
  if (!SUFFIX_OK.test(suffix)) return null;
  const semi = (BASE[root] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
  const bassSemi = bass ? (BASE[bass] + (bassAcc === '#' ? 1 : bassAcc === 'b' ? -1 : 0) + 12) % 12 : null;
  // Eigene Kürzel, die wir lieber gemeinsam prüfen (z. B. D1, C-2)
  const review = /^1$/.test(suffix) || /^-\d/.test(suffix);
  return { semi, suffix, bassSemi, review };
}

/** Prüft, ob ein Token ein (gültiger oder prüfbedürftiger) Akkord ist. */
export const isChord = (tok) => parseChord(tok) !== null;

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
    if (/^[A-H]b/.test(raw.trim())) useFlats = true;
    else if (/^[A-H]#/.test(raw.trim())) useFlats = false;
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
    if (next && !next.startsWith('{') && !/[[\]]/.test(next) && next.split(/\s+/).length <= 4 && !KAWAI_RE.test(next)) meta.artist = next;
  }
  return meta;
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
    if (isChord(t)) { chords++; continue; }
    if (/^(x\s*\d+|\d+\s*x|x|\d+x?)$/i.test(t)) continue;
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
  let inChorus = false;
  let titleSeen = false, artistLineSkipped = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const s = line.trim();
    const d = directive(s);
    if (d) {
      const n = d.name;
      if (['title', 't'].includes(n)) { titleSeen = true; continue; }
      if (['subtitle', 'st', 'artist', 'key', 'tempo', 'time', 'capo', 'duration', 'album', 'year'].includes(n)) continue;
      if (['soc', 'start_of_chorus'].includes(n)) { inChorus = true; out.push({ type: 'section', text: d.value || 'Refrain', chorus: true }); continue; }
      if (['eoc', 'end_of_chorus', 'end_of_part', 'eov', 'end_of_verse', 'eob', 'end_of_bridge'].includes(n)) { inChorus = false; continue; }
      if (['start_of_part', 'sov', 'start_of_verse', 'sob', 'start_of_bridge'].includes(n)) {
        out.push({ type: 'section', text: d.value || (n.includes('bridge') || n === 'sob' ? 'Bridge' : 'Strophe') }); continue;
      }
      if (['comment', 'c', 'ci', 'comment_italic', 'cb'].includes(n)) {
        if (/https?:|tabbed by|source:/i.test(d.value)) continue;
        const v = d.value;
        if (SECTION_RE.test(v)) out.push({ type: 'section', text: v.replace(/[()]/g, '').trim() });
        else out.push({ type: 'trigger', text: v });
        continue;
      }
      continue; // unbekannte Direktive ignorieren
    }
    if (s.startsWith('#')) continue;
    if (!s) { out.push({ type: 'empty' }); continue; }
    // Interpret-Zeile ohne Direktive direkt nach dem Titel überspringen
    if (titleSeen && !artistLineSkipped) {
      artistLineSkipped = true;
      if (!/[[\]]/.test(s) && s.split(/\s+/).length <= 4 && !KAWAI_RE.test(s) && !SECTION_RE.test(s) && !isChordLine(s) && !/^\(/.test(s)) continue;
    }
    if (KAWAI_RE.test(s)) { out.push({ type: 'kawai', text: s.replace(/^\(|\)$/g, '') }); continue; }
    const md = MEDLEY_RE.exec(s);
    if (md) { inChorus = false; out.push({ type: 'medley', text: md[1] }); continue; }
    // „INTRO | C | C/E | F |“ → Abschnitt + Akkordzeile
    const bar = /^([A-Za-z][A-Za-z\s.\d-]{1,20}?)\s*\|(.*)$/.exec(s);
    if (bar && SECTION_RE.test(bar[1].trim())) {
      out.push({ type: 'section', text: bar[1].trim(), chorus: /chorus|refrain/i.test(bar[1]) });
      const rest = ('|' + bar[2]).replace(/\}\s*$/, '');
      out.push({ type: 'chords', tokens: rest.split(/(\s+)/).filter((x) => x !== ''), chorus: inChorus });
      continue;
    }
    if (!/\[/.test(s) && s.length <= 40 && SECTION_RE.test(s)) {
      const text = s.replace(/^\(|\)\s*:?$|:$/g, '').trim();
      const chorus = /chorus|refrain|^ref/i.test(text);
      out.push({ type: 'section', text, chorus });
      continue;
    }
    if (/^\(.*\)$/.test(s) && !/\[/.test(s)) { out.push({ type: 'trigger', text: s.slice(1, -1).trim() }); continue; }
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
        out.push({ type: 'lyric', segs, chorus: inChorus });
        i++;
        continue;
      }
      out.push({ type: 'chords', tokens: s.split(/(\s+)/).filter((x) => x !== ''), chorus: inChorus });
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
    out.push({ type: 'lyric', segs, chorus: inChorus });
  }
  // Mehrfache Leerzeilen zusammenfassen
  return out.filter((l, i, a) => !(l.type === 'empty' && (i === 0 || a[i - 1].type === 'empty')));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function chordHtml(raw, opt) {
  const c = parseChord(raw);
  if (!c) return `<span class="ch odd" title="Kein bekannter Akkord – bitte prüfen">${esc(raw)}</span>`;
  const txt = formatChord(raw, opt.steps, opt.notation, opt.flats);
  return `<span class="ch${c.review ? ' review' : ''}"${c.review ? ' title="Eigenes Kürzel – gemeinsam prüfen"' : ''}>${esc(txt)}</span>`;
}

function textHtml(t) {
  // (Hinweise) in Lyrik-Zeilen als Trigger markieren
  return esc(t).replace(/\(([^)]{1,40})\)/g, '<span class="trig-in">$1</span>');
}

/** Rendert einen Songtext als HTML für die Bühnenansicht. */
export function renderSheet(raw, { steps = 0, notation = 'de', key = '' } = {}) {
  const opt = { steps, notation, flats: prefersFlats(key, steps) };
  const rows = parseSheet(raw);
  const html = [];
  for (const r of rows) {
    const ch = r.chorus ? ' chorus' : '';
    switch (r.type) {
      case 'empty': html.push('<div class="ln empty"></div>'); break;
      case 'section': html.push(`<div class="ln sec${r.chorus ? ' sec-chorus' : ''}">${esc(r.text)}</div>`); break;
      case 'medley': html.push(`<div class="ln medley">${esc(r.text)}</div>`); break;
      case 'trigger': html.push(`<div class="ln trig"><span>${esc(r.text)}</span></div>`); break;
      case 'kawai': html.push(`<div class="ln kawai">Kawai: ${esc(r.text)}</div>`); break;
      case 'chords':
        html.push(`<div class="ln chords${ch}">` + r.tokens.map((t) => {
          if (/^\s+$/.test(t)) return ' ';
          const inner = t.replace(/^\[|\]$/g, '');
          return isChord(inner) ? chordHtml(inner, opt) : `<span class="bar">${esc(t)}</span>`;
        }).join('') + '</div>');
        break;
      case 'lyric': {
        const hasChord = r.segs.some((s) => s.chord !== null);
        if (!hasChord) { html.push(`<div class="ln lyr${ch}">${esc(r.segs.map((s) => s.text).join('')) || '&nbsp;'}</div>`); break; }
        html.push(`<div class="ln pair${ch}">` + r.segs.map((s) => {
          const c = s.chord === null ? '' : (s.chord.trim() ? chordHtml(s.chord.trim(), opt) : '');
          const t = s.text ? textHtml(s.text) : '';
          return `<span class="seg"><span class="sc">${c || '&nbsp;'}</span><span class="st">${t || '&nbsp;'}</span></span>`;
        }).join('') + '</div>');
        break;
      }
    }
  }
  return html.join('');
}

/** Zählt Dinge, die beim Import auffallen (für die Vorschau). */
export function analyze(raw) {
  const rows = parseSheet(raw);
  const chords = [...raw.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].trim());
  const review = [...new Set(chords.filter((c) => { const p = parseChord(c); return !p || p.review; }))];
  return {
    sections: rows.filter((r) => r.type === 'section').length,
    triggers: rows.filter((r) => r.type === 'trigger').length,
    review,
    usesH: /\[H/.test(raw) || /(^|\s)H(m|7|\s|$)/m.test(raw),
  };
}
