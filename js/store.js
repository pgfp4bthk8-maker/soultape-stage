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
    state.noMax = state.songs.reduce((m, s) => Math.max(m, s.no || 0), state.noMax || 0);
    localStorage.setItem(KEY, JSON.stringify(state));
    saveOk = true;
    trackBackup();
  } catch (e) {
    saveOk = false;
  }
  return saveOk;
}
export const lastSaveOk = () => saveOk;

export const getSong = (id) => state.songs.find((s) => s.id === id);

// ---------- Songnummern ----------
// Kurze, feste Nummer pro Song zum Zurufen im Proberaum („die 12“). Eine Stelle in der Band vergibt sie
// (settings.numbering = true), die anderen bekommen sie über Pakete. Einmal vergebene Nummern werden
// nicht neu vergeben, auch wenn der Song gelöscht wird (state.noMax = höchste je vergebene Nummer).
export const songByNo = (no) => state.songs.find((s) => s.no === +no);
const highestNo = () => state.songs.reduce((m, s) => Math.max(m, s.no || 0), state.noMax || 0);
export const nextNo = () => highestNo() + 1;

/** Setzt die Nummer eines Songs. false, wenn sie ungültig oder schon vergeben ist. Leer = Nummer entfernen. */
export function setSongNo(song, value) {
  if (value === '' || value === null) { song.no = null; save(); return true; }
  const n = +value;
  if (!Number.isInteger(n) || n < 1 || n > 9999) return false;
  const other = songByNo(n);
  if (other && other !== song) return false;
  song.no = n;
  save();
  return true;
}

/** Gibt allen Songs ohne Nummer eine – in alphabetischer Reihenfolge, ab der nächsten freien Nummer. */
export function numberAllSongs() {
  let n = 0;
  for (const s of sortedSongs()) if (!s.no) { s.no = nextNo(); n++; }
  state.settings.numbering = true;
  save();
  return n;
}

// ---------- Kennung für den Austausch ----------
// Jeder Song hat eine eindeutige Kennung (uid). Sie reist in Paketen mit; der Empfänger merkt sich,
// zu welchem seiner Songs sie gehört (links). So klappt die Zuordnung ab dem zweiten Paket ohne Titelvergleich.
export const songUid = (s) => s.bandId || s.id;
export const songByUid = (uid) => (uid ? state.songs.find((s) => s.id === uid || s.bandId === uid || (s.links || []).includes(uid)) : null) || null;
function linkSong(s, uid) {
  if (!uid || s.id === uid) return;
  if (!s.bandId) s.bandId = uid;
  if (s.bandId !== uid && !(s.links || []).includes(uid)) s.links = [...(s.links || []), uid];
}

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
  // Songnummer: nur auf dem Gerät, das die Nummern für die Band vergibt, automatisch die nächste freie
  if (s.no && songByNo(s.no)) s.no = null;
  if (!s.no && state.settings.numbering) s.no = nextNo();
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

// ---------- Stand der Sicherung ----------
// Die App merkt sich, wann zuletzt gesichert wurde und einen Fingerabdruck der gesicherten Daten
// (Songs + Listen; Einstellungen wie die Schriftgröße zählen nicht). So erkennt sie, ob es seitdem
// ungesicherte Änderungen gibt. Liegt in einem eigenen Schlüssel, nicht im Backup selbst.
const META = 'soultape-stage-sicherung';
export const BACKUP_DUE_DAYS = 7;

function hash(t) {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
const fingerprint = () => hash(JSON.stringify([state.songs, state.lists]));

let meta = {};
try { meta = JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { meta = {}; }
const saveMeta = () => { try { localStorage.setItem(META, JSON.stringify(meta)); } catch (e) { /* egal */ } };

/** Nach jedem Speichern: gibt es Änderungen, die noch in keiner Sicherung stecken – und seit wann? */
function trackBackup() {
  const dirty = fingerprint() !== meta.mark;
  if (!dirty && meta.dirtySince) { meta.dirtySince = null; saveMeta(); }
  else if (dirty && !meta.dirtySince) { meta.dirtySince = new Date().toISOString(); saveMeta(); }
}

/** Sicherung wurde gerade exportiert (oder eingespielt): Stand merken. */
export function markBackupDone(at) {
  meta = { at: at || new Date().toISOString(), mark: fingerprint(), dirtySince: null };
  saveMeta();
}

/**
 * Ampel für die Sicherung.
 * level: 'ok' (alles gesichert) | 'warn' (neue Änderungen) | 'alert' (seit BACKUP_DUE_DAYS Tagen ungesichert oder noch nie gesichert)
 */
export function backupStatus() {
  const at = meta.at || null;
  if (at && fingerprint() === meta.mark) return { level: 'ok', at, days: 0 };
  const days = meta.dirtySince ? Math.floor((Date.now() - new Date(meta.dirtySince).getTime()) / 86400000) : 0;
  const own = state.lists.length > 0 || state.songs.some((s) => s.sheets && s.sheets.length);
  if (!at) return { level: own ? 'alert' : 'warn', at, days };
  return { level: days >= BACKUP_DUE_DAYS ? 'alert' : 'warn', at, days };
}

// ---------- Backup ----------
export function exportBackup() {
  return JSON.stringify({ app: 'soultape-stage', exported: new Date().toISOString(), ...state }, null, 2);
}

// Sicherheitsnetz: Vor dem Einspielen wird der Stand des Geräts beiseitegelegt (immer nur einer).
const PREV = 'soultape-stage-vorher';
const snapshotNow = () => JSON.stringify({ saved: new Date().toISOString(), songs: state.songs, lists: state.lists, seedVersion: state.seedVersion });
function readPrevious() {
  try { const d = JSON.parse(localStorage.getItem(PREV)); return d && Array.isArray(d.songs) ? d : null; } catch (e) { return null; }
}

/** Gibt es einen beiseitegelegten Stand? → { saved, songs, lists } (Anzahlen) oder null */
export function previousInfo() {
  const d = readPrevious();
  return d ? { saved: d.saved, songs: d.songs.length, lists: (d.lists || []).length } : null;
}

/** Tauscht den aktuellen Stand gegen den beiseitegelegten – der aktuelle wird dabei selbst beiseitegelegt. */
export function restorePrevious() {
  const d = readPrevious();
  if (!d) return false;
  const cur = snapshotNow();
  state.songs = d.songs;
  state.lists = Array.isArray(d.lists) ? d.lists : [];
  state.seedVersion = d.seedVersion || state.seedVersion;
  state.settings.navList = null;
  try { localStorage.setItem(PREV, cur); } catch (e) { /* dann eben ohne Rückweg */ }
  return save();
}

/** Spielt eine Sicherung ein. Rückgabe: { kept } – konnte der bisherige Stand beiseitegelegt werden? */
export function importBackup(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.songs)) throw new Error('Das ist keine gültige Sicherungsdatei.');
  // Ein Song-Paket enthält nur einzelne Songs – als Sicherung eingespielt würde es alles andere löschen
  if (d.type === 'paket') throw new Error('Das ist ein Song-Paket, keine Sicherung. Pakete spielst du unter „Songs teilen“ ein.');
  let kept = true;
  try { localStorage.setItem(PREV, snapshotNow()); } catch (e) { kept = false; }
  state.songs = d.songs;
  if (Array.isArray(d.lists)) state.lists = d.lists;   // alte Sicherungen ohne Listen lassen die Listen unberührt
  // Sicherung einer anderen Person (z. B. die Sicherung des Keyboarders beim Kollegen): eigenes Profil und Nummernvergabe behalten
  const mine = state.settings.profile, theirs = d.settings && d.settings.profile;
  const ownProfile = !!(mine && mine.name && theirs && theirs.name && !sameName(mine.name, theirs.name));
  const numbering = state.settings.numbering;
  state.settings = { ...state.settings, ...(d.settings || {}) };
  if (ownProfile) { state.settings.profile = mine; state.settings.numbering = numbering; }
  state.seedVersion = d.seedVersion || state.seedVersion;
  state.noMax = Math.max(state.noMax || 0, d.noMax || 0);
  state.settings.navList = null;
  save();
  markBackupDone(d.exported);   // die Daten entsprechen jetzt genau der eingespielten Sicherung
  return { kept, ownProfile };
}

// ---------- Song-Paket: einzelne Songs mit Kollegen austauschen ----------
// Anders als die Sicherung enthält ein Paket nur ausgewählte Songs, und beim Einspielen wird
// nichts ersetzt: Neue Songs werden angelegt, bei vorhandenen kommt das Blatt als zusätzliche
// Fassung dazu. Die aktive Fassung des Empfängers bleibt, wie sie ist.

/**
 * Packt die gewählten Songs (jeweils mit dem aktiven Blatt).
 * sounds: Soundvorschläge mitgeben · textOf: Umformung des Blatt-Texts (z. B. Soundwechsel entfernen)
 */
export function exportPackage(ids, { sounds = false, from = '', role = '', textOf = (t) => t, lists = [], made = '', bare = [], band = false } = {}) {
  // Setlisten: nur die Reihenfolge. Songs stehen mit Titel und Eckdaten drin (IDs gelten nur auf diesem Gerät),
  // damit der Empfänger sie seinen eigenen Songs zuordnen oder als leere Songs anlegen kann.
  const outLists = lists.map(getList).filter(Boolean).map((l) => ({
    name: l.name, kind: l.kind, date: l.date || '',
    items: l.items.map((it) => {
      if (it.type === 'break') return { type: 'break', name: it.name || 'Pause' };
      const s = getSong(it.id);
      return s ? { type: 'song', uid: songUid(s), no: s.no || null, title: s.title, artist: s.artist || '', key: s.key || '', durationSec: s.durationSec || null } : null;
    }).filter(Boolean),
  }));
  // bare: Songs, die nur mit ihren Eckdaten mitgehen (Band-Paket: die ganze Songliste); ids: Songs mit Blatt
  const withSheet = new Set(ids);
  const songs = [...new Set([...bare, ...ids])].map(getSong).filter(Boolean).map((s) => {
    const sh = withSheet.has(s.id) ? activeSheet(s) : null;
    const o = {
      uid: songUid(s), no: s.no || null,
      title: s.title, artist: s.artist || '', key: s.key || '', transpose: s.transpose || 0,
      durationSec: s.durationSec || null, aliases: s.aliases || [],
      sheet: sh ? { name: sh.name, text: textOf(sh.text) } : null,
    };
    if (sounds) o.parts = clone(s.parts || []);
    return o;
  });
  return JSON.stringify({ app: 'soultape-stage', type: 'paket', version: 1, made, band, from, role, created: new Date().toISOString(), sounds, songs, lists: outLists }, null, 2);
}

const sameName = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
const sameItems = (a, b) => a.length === b.length && a.every((x, i) => x.type === b[i].type && (x.type === 'song' ? x.id === b[i].id : (x.name || '') === (b[i].name || '')));

/** Liest eine Paket-Datei und schlägt für jeden Song die Zuordnung vor. Wirft bei falschen Dateien. */
export function readPackage(text) {
  let d;
  try { d = JSON.parse(text); } catch (e) { throw new Error('Das ist keine Paket-Datei.'); }
  if (!d || d.app !== 'soultape-stage' || !Array.isArray(d.songs)) throw new Error('Das ist keine Paket-Datei.');
  if (d.type !== 'paket') throw new Error('Das ist eine vollständige Sicherung, kein Song-Paket. Sicherungen spielst du unter Einstellungen ein.');
  const items = d.songs.filter((x) => x && typeof x.title === 'string' && x.title.trim()).map((x) => {
    const known = songByUid(x.uid);
    const m = known || matchSong(x.title);
    const target = m ? m.id : 'new';
    // keep: Felder, bei denen der Empfänger seinen eigenen Wert behalten möchte (Standard: Paket gewinnt)
    return { song: x, target, target0: target, include: true, by: known ? 'uid' : (m ? 'title' : ''), keep: {} };
  });
  // Setlisten: gibt es beim Empfänger schon eine Liste mit demselben Namen, wird sie als Ziel vorgeschlagen
  const lists = (Array.isArray(d.lists) ? d.lists : [])
    .filter((l) => l && typeof l.name === 'string' && l.name.trim() && Array.isArray(l.items))
    .map((l) => {
      const clean = {
        name: l.name.trim(), kind: l.kind === 'probe' ? 'probe' : 'gig', date: typeof l.date === 'string' ? l.date : '',
        items: l.items.filter((it) => it && (it.type === 'break' || (it.type === 'song' && typeof it.title === 'string' && it.title.trim()))),
      };
      const ex = state.lists.find((x) => sameName(x.name, clean.name));
      return { list: clean, target: ex ? ex.id : 'new', include: true };
    });
  if (!items.length && !lists.length) throw new Error('Das Paket ist leer.');
  return { from: String(d.from || ''), created: d.created || null, sounds: !!d.sounds, band: !!d.band, items, lists };
}

/** Ordnet einen Listen-Eintrag aus dem Paket einem Song auf diesem Gerät zu (oder null). */
function resolveTitle(pkg, entry, byTitle) {
  const title = entry.title;
  const k = norm(title);
  if (byTitle && byTitle.has(k)) return byTitle.get(k);
  // Zuordnung, die der Nutzer in der Vorschau für die Songs des Pakets gewählt hat
  const it = pkg.items.find((x) => x.include && norm(x.song.title) === k);
  if (it) return it.target === 'new' ? null : (getSong(it.target) ? it.target : null);
  const m = songByUid(entry.uid) || matchSong(title);
  return m ? m.id : null;
}

/**
 * Was würde das Einspielen einer Setlist tun?
 * → { songs, breaks, fresh (Songs, die neu angelegt würden), update (vorhandene Liste wird geändert), same (Reihenfolge schon gleich) }
 */
export function listPlan(pkg, pl) {
  const t = pl.target === 'new' ? null : getList(pl.target);
  let songs = 0, breaks = 0, fresh = 0;
  const items = pl.list.items.map((it) => {
    if (it.type === 'break') { breaks++; return { type: 'break', name: it.name || 'Pause' }; }
    songs++;
    const id = resolveTitle(pkg, it);
    if (!id) fresh++;
    return { type: 'song', id };
  });
  return { songs, breaks, fresh, update: !!t, same: !!t && !fresh && sameItems(t.items, items) };
}

/**
 * Was passiert mit der Songnummer aus dem Paket?
 * '' nichts · 'set' wird übernommen · 'taken' Nummer gehört hier schon einem anderen Song · 'differs' Song hat hier eine andere Nummer
 */
function noPlan(target, no) {
  no = +no || 0;
  if (!no) return '';
  if (target && target.no === no) return '';
  if (target && target.no) return 'differs';
  const other = songByNo(no);
  return other && other !== target ? 'taken' : 'set';
}

/** Übernimmt Kennung und (wenn frei) Nummer aus einem Paket-Eintrag. */
function takeIdentity(s, x) {
  if (!s) return;
  linkSong(s, x.uid);
  if (noPlan(s, x.no) === 'set') s.no = +x.no;
}

// Gemeinsame Eckdaten eines Songs. Weicht ein Wert beim Empfänger ab, zeigt die Vorschau das an;
// standardmäßig wird der Wert aus dem Paket übernommen, der Empfänger kann einzelne abwählen (item.keep).
export const SHARED_FIELDS = [['title', 'Titel'], ['artist', 'Interpret'], ['key', 'Tonart'], ['durationSec', 'Dauer']];
const fieldVal = (f, v) => (f === 'durationSec' ? (+v > 0 ? Math.round(+v) : null) : (typeof v === 'string' && v.trim() ? v.trim() : null));

/** Vergleicht die Eckdaten → { fill: [Feld] (bei dir leer), diffs: [{ f, label, mine, theirs }] } */
function fieldPlan(t, x) {
  const fill = [], diffs = [];
  if (!t) return { fill, diffs };
  for (const [f, label] of SHARED_FIELDS) {
    const theirs = fieldVal(f, x[f]), mine = fieldVal(f, t[f]);
    if (theirs === null || theirs === mine) continue;
    if (mine === null) fill.push(f); else diffs.push({ f, label, mine, theirs });
  }
  return { fill, diffs };
}

/** Was würde das Einspielen bei diesem Eintrag tun? → { isNew, sheet: 'add'|'dup'|'none', sounds, no, fill, diffs, nothing } */
export function packagePlan(item, withSounds) {
  const t = item.target === 'new' ? null : getSong(item.target);
  const text = item.song.sheet && typeof item.song.sheet.text === 'string' ? item.song.sheet.text : '';
  const sheet = !text.trim() ? 'none' : (t && (t.sheets || []).some((v) => v.text === text) ? 'dup' : 'add');
  const sounds = !!withSounds && hasSound(item.song) && (!t || !hasSound(t));
  const no = noPlan(t, item.song.no);
  const { fill, diffs } = fieldPlan(t, item.song);
  const take = diffs.filter((d) => !(item.keep || {})[d.f]);
  return { isNew: !t, sheet, sounds, no, fill, diffs, nothing: !!t && sheet !== 'add' && !sounds && no !== 'set' && !fill.length && !take.length };
}

/** Spielt die angehakten Einträge ein. Überschreibt nichts. */
export function applyPackage(pkg, { sounds = false } = {}) {
  const stamp = new Date().toLocaleDateString('de-DE');
  const name = pkg.from ? `Von ${pkg.from}, ${stamp}` : `Aus Paket, ${stamp}`;
  let created = 0, added = 0, soundsSet = 0, changed = 0;
  const byTitle = new Map();   // Titel aus dem Paket → Song auf diesem Gerät (für die Setlisten)
  for (const it of pkg.items) {
    if (!it.include) continue;
    const plan = packagePlan(it, sounds);
    const x = it.song;
    let s = plan.isNew ? null : getSong(it.target);
    if (!s) {
      s = newSong({
        title: x.title.trim(), artist: x.artist || '', key: x.key || '', transpose: +x.transpose || 0,
        durationSec: x.durationSec || null, aliases: Array.isArray(x.aliases) ? x.aliases : [], no: +x.no || null,
      });
      created++;
    } else {
      // leere Felder ergänzen, abweichende übernehmen – außer der Empfänger behält seinen Wert
      for (const f of plan.fill) s[f] = fieldVal(f, x[f]);
      let any = false;
      for (const d of plan.diffs) {
        if ((it.keep || {})[d.f]) continue;
        // alter Titel bleibt als Alias, damit ChordPro-Dateien mit dem alten Namen weiter zugeordnet werden
        if (d.f === 'title' && !(s.aliases || []).some((a) => sameName(a, d.mine))) s.aliases = [...(s.aliases || []), d.mine];
        s[d.f] = d.theirs;
        any = true;
      }
      if (any) changed++;
    }
    takeIdentity(s, x);
    if (plan.sounds) { s.parts = clone(x.parts); soundsSet++; }
    if (plan.sheet === 'add') {
      const v = addSheet(s, name, x.sheet.text, false);
      if (pkg.from) v.from = pkg.from;
      added++;
    }
    byTitle.set(norm(x.title), s.id);
  }

  // Setlisten: vorhandene Liste aktualisieren (bisheriger Stand wird festgehalten) oder neu anlegen
  let listsNew = 0, listsUpdated = 0;
  for (const pl of pkg.lists || []) {
    if (!pl.include) continue;
    const items = pl.list.items.map((it) => {
      if (it.type === 'break') return { type: 'break', name: it.name || 'Pause' };
      let id = resolveTitle(pkg, it, byTitle);
      if (!id) {
        // Song gibt es hier noch nicht → als leeren Song anlegen, damit die Liste vollständig ist
        id = newSong({ title: it.title.trim(), artist: it.artist || '', key: it.key || '', durationSec: it.durationSec || null, no: +it.no || null }).id;
        created++;
      }
      takeIdentity(getSong(id), it);
      byTitle.set(norm(it.title), id);
      return { type: 'song', id };
    });
    const t = pl.target === 'new' ? null : getList(pl.target);
    if (t) {
      if (sameItems(t.items, items)) continue;
      const when = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      snapshotList(t, `Vor Paket${pkg.from ? ` von ${pkg.from}` : ''} – ${when}`);
      t.items = items;
      if (!t.date && pl.list.date) t.date = pl.list.date;
      if (state.settings.navList && state.settings.navList.id === t.id) state.settings.navList = null;
      listsUpdated++;
    } else {
      const l = newList(pl.list.kind, pl.list.name, items);
      l.date = pl.list.date || '';
      listsNew++;
    }
  }
  save();
  return { created, added, soundsSet, changed, listsNew, listsUpdated };
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
