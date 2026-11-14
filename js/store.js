// Datenspeicherung lokal im Browser (pro Gerät).
// Übertragung PC → iPad über „Backup exportieren/importieren“.

import { SEED_SONGS, SEED_VERSION } from './data.js';

const KEY = 'soultape-stage';
const SCHEMA = 1;

const clone = (o) => JSON.parse(JSON.stringify(o));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function fresh() {
  return {
    schema: SCHEMA,
    seedVersion: SEED_VERSION,
    songs: clone(SEED_SONGS),
    lists: [],
    settings: { notation: 'de', fontSize: 22, mode: 'prep' },
  };
}

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.songs)) {
        if (!Array.isArray(d.lists)) d.lists = [];
        d.settings = { notation: 'de', fontSize: 22, mode: 'prep', ...(d.settings || {}) };
        return d;
      }
    }
  } catch (e) { /* Speicher nicht verfügbar → mit Startdaten weiter */ }
  return fresh();
}

let saveOk = true;
export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    saveOk = true;
  } catch (e) {
    saveOk = false;
  }
  return saveOk;
}
export const lastSaveOk = () => saveOk;

export const getSong = (id) => state.songs.find((s) => s.id === id);

export function sortedSongs() {
  return [...state.songs].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

export function newSong(partial = {}) {
  const s = {
    id: uid(), title: 'Neuer Song', artist: '', key: '', nordProgram: '', nordStored: false,
    kawai: '', durationSec: null, tags: [], notes: '', aliases: [], transpose: 0,
    parts: [{ name: 'Ganzer Song', lex: '', summary: '', steps: [], tips: '' }],
    sheets: [], activeSheet: null, ...partial,
  };
  if (!s.nordProgram) s.nordProgram = s.title;
  state.songs.push(s);
  save();
  return s;
}

export function deleteSong(id) {
  const i = state.songs.findIndex((s) => s.id === id);
  if (i >= 0) state.songs.splice(i, 1);
  for (const l of state.lists) l.items = l.items.filter((it) => it.type !== 'song' || it.id !== id);
  save();
}

// ---------- Leadsheet-Versionen ----------
// Das Original bleibt immer erhalten; jede Änderung ist eine neue Version.

export function addSheet(song, name, text, makeActive = false) {
  const v = { id: uid(), name, created: new Date().toISOString(), text };
  song.sheets = song.sheets || [];
  song.sheets.push(v);
  if (makeActive || !song.activeSheet) song.activeSheet = v.id;
  save();
  return v;
}

export function activeSheet(song) {
  if (!song.sheets || !song.sheets.length) return null;
  return song.sheets.find((v) => v.id === song.activeSheet) || song.sheets[0];
}

export function deleteSheet(song, id) {
  if (song.sheets.length <= 1) return false;
  song.sheets = song.sheets.filter((v) => v.id !== id);
  if (song.activeSheet === id) song.activeSheet = song.sheets[song.sheets.length - 1].id;
  save();
  return true;
}

// ---------- Setlisten und Probenlisten ----------
// Eine Liste = benannte Reihenfolge von Songs. kind 'gig' (Auftritt, mit Pausen → Sets) oder 'probe'.
// items: { type: 'song', id } | { type: 'break', name }
// snapshots: festgehaltene Stände { id, name, created, items }

export const getList = (id) => state.lists.find((l) => l.id === id);

export function newList(kind, name, items = []) {
  const l = { id: uid(), kind, name, date: '', created: new Date().toISOString(), items, snapshots: [] };
  state.lists.push(l);
  save();
  return l;
}

export function deleteList(id) {
  const i = state.lists.findIndex((l) => l.id === id);
  if (i >= 0) state.lists.splice(i, 1);
  save();
}

/** Hält den aktuellen Stand der Liste als Kopie fest. */
export function snapshotList(list, name) {
  const snap = { id: uid(), name, created: new Date().toISOString(), items: clone(list.items) };
  list.snapshots = list.snapshots || [];
  list.snapshots.unshift(snap);
  save();
  return snap;
}

/** Holt einen festgehaltenen Stand zurück. Der Stand selbst bleibt erhalten. */
export function restoreSnapshot(list, snapId) {
  const snap = (list.snapshots || []).find((x) => x.id === snapId);
  if (!snap) return false;
  list.items = clone(snap.items);
  save();
  return true;
}

// ---------- Titel-Abgleich beim Import ----------
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/’|'/g, '').replace(/[^a-z0-9]/g, '');

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** Findet den passenden vorhandenen Song zu einem importierten Titel. */
export function matchSong(title) {
  const t = norm(title);
  if (!t) return null;
  let best = null, bestScore = 0;
  for (const s of state.songs) {
    for (const cand of [s.title, ...(s.aliases || [])]) {
      const c = norm(cand);
      if (!c) continue;
      let score = 1 - lev(t, c) / Math.max(t.length, c.length);
      if (c.startsWith(t) || t.startsWith(c)) score = Math.max(score, 0.85);
      if (score > bestScore) { bestScore = score; best = s; }
    }
  }
  return bestScore >= 0.7 ? best : null;
}

// ---------- Backup ----------
export function exportBackup() {
  return JSON.stringify({ app: 'soultape-stage', exported: new Date().toISOString(), ...state }, null, 2);
}

export function importBackup(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.songs)) throw new Error('Das ist keine gültige Sicherungsdatei.');
  state.songs = d.songs;
  if (Array.isArray(d.lists)) state.lists = d.lists;   // alte Sicherungen ohne Listen lassen die Listen unberührt
  state.settings = { ...state.settings, ...(d.settings || {}) };
  state.seedVersion = d.seedVersion || state.seedVersion;
  save();
}

/** Hat der Song schon einen Soundvorschlag (oder eigene Eintragungen)? */
const hasSound = (s) => (s.parts || []).some((p) => p.lex || p.summary || p.tips || (p.steps && p.steps.length));

/** Kurzer Fingerabdruck eines Soundvorschlags – damit erkennt die App, ob du ihn selbst geändert hast. */
function mark(parts) {
  const t = JSON.stringify(parts || []);
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Aufbau eines Vorschlags ohne die Texte (Teile, Regler, Werte). */
const shape = (parts) => JSON.stringify((parts || []).map((p) => [p.name, p.summary, (p.steps || []).map((x) => [x.s, x.c, x.sel, x.drawbars])]));

/**
 * Stammt der Soundvorschlag noch unverändert aus den Startdaten?
 * Mit Fingerabdruck: exakter Vergleich. Ohne (Stand vor 0.1.4): gleicher Aufbau wie der Startvorschlag.
 */
const untouched = (s, seed) => (s.seedMark ? mark(s.parts) === s.seedMark : shape(s.parts) === shape(seed.parts));

/** Sucht zu einem Startsong den vorhandenen Song – auch wenn er per Import (mit anderer ID) angelegt wurde. */
function findForSeed(seed) {
  const byId = getSong(seed.id);
  if (byId) return byId;
  const names = [seed.title, ...(seed.aliases || [])].map(norm).filter(Boolean);
  let best = null, bestScore = 0;
  for (const s of state.songs) {
    for (const cand of [s.title, ...(s.aliases || [])]) {
      const c = norm(cand);
      if (!c) continue;
      for (const t of names) {
        const score = 1 - lev(t, c) / Math.max(t.length, c.length);
        if (score > bestScore) { bestScore = score; best = s; }
      }
    }
  }
  return bestScore >= 0.8 ? best : null;
}

/**
 * Gleicht die Songs mit den Startdaten ab. Leadsheets bleiben immer unberührt.
 * - Songs ohne Soundvorschlag bekommen den Vorschlag aus den Startdaten (eigene Eintragungen bleiben).
 * - addMissing: fehlende Startsongs ergänzen.
 * - overwriteSounds: vorhandene Soundvorschläge auf den Auslieferungsstand zurücksetzen.
 */
export function refreshSeeds({ overwriteSounds = false, addMissing = true } = {}) {
  let added = 0, updated = 0, filled = 0;
  const setParts = (s, seed) => { s.parts = clone(seed.parts); s.seedMark = mark(s.parts); };
  for (const seed of SEED_SONGS) {
    const s = findForSeed(seed);
    if (!s) {
      if (addMissing) { const n = clone(seed); n.seedMark = mark(n.parts); state.songs.push(n); added++; }
      continue;
    }
    if (overwriteSounds) { setParts(s, seed); updated++; }
    else if (!hasSound(s)) { setParts(s, seed); filled++; }
    else if (untouched(s, seed) && mark(s.parts) !== mark(seed.parts)) { setParts(s, seed); filled++; }
    if (!s.nordSlot && seed.nordSlot) s.nordSlot = seed.nordSlot;
    if (!s.artist && seed.artist) s.artist = seed.artist;
    if (!s.key && seed.key) s.key = seed.key;
    if (!(s.tags && s.tags.length) && seed.tags.length) s.tags = [...seed.tags];
  }
  state.seedVersion = SEED_VERSION;
  save();
  return { added, updated, filled };
}

// Neue Startdaten nach einem App-Update: still die Soundvorschläge für Songs nachtragen,
// die noch keinen haben. Es wird nichts überschrieben und kein Song neu angelegt.
if ((state.seedVersion || 0) < SEED_VERSION) refreshSeeds({ addMissing: false });
