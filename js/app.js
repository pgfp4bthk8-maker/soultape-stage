// SoulTape Stage – Hauptlogik der Oberfläche
import { state, save, getSong, sortedSongs, newSong, deleteSong, addSheet, activeSheet, deleteSheet,
  matchSong, exportBackup, importBackup, refreshSeeds, lastSaveOk,
  getList, newList, deleteList, snapshotList, restoreSnapshot,
  backupStatus, markBackupDone, BACKUP_DUE_DAYS, previousInfo, restorePrevious,
  exportPackage, readPackage, packagePlan, applyPackage, listPlan, SHARED_FIELDS,
  songByNo, nextNo, setSongNo, numberAllSongs } from './store.js';
import { LEXICON } from './data.js';
import { SECTIONS, renderPanel, controlsOf } from './panel.js';
import { splitSongs, renderSheet, analyze, guessKey, transposeKey, switchLine, switchText, readBpm, readBeats } from './chordpro.js';
import { metroHtml, startMetro, stopMetro } from './metronome.js';

export const APP_VERSION = '0.1.23';

const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TAGS = ['Opener', 'Abschluss', 'Zugabe', 'Mitsingen', 'Tanzflächenfüller', 'Ballade', 'Langsam', 'Schnell', 'Party', 'Hintergrund', 'Deutsch'];

let ui = { part: 0, step: 0, guide: false, importItems: null };

// ---------- Hilfen ----------
function toast(msg, ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
function persist() { if (!save()) toast('Speichern fehlgeschlagen – bitte Backup exportieren.'); }
const fmtDate = (iso) => new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDur = (sec) => sec ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : '';
function parseDur(s) {
  const m = /^(\d+):(\d{1,2})$/.exec((s || '').trim());
  return m ? +m[1] * 60 + +m[2] : null;
}
function download(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const notation = () => state.settings.notation || 'de';
const isStage = () => state.settings.mode === 'stage';

// ---------- Profil: wer nutzt die App auf diesem Gerät, und was wird angezeigt ----------
// Die Rolle ist nur eine Voreinstellung für die Anzeige-Schalter; jeder Schalter bleibt einzeln änderbar.
const ROLES = {
  keyboard: { name: 'Keyboard', show: { chords: true, nord: true, metro: false } },
  vocals: { name: 'Gesang', show: { chords: false, nord: false, metro: false } },
  guitar: { name: 'Gitarre', show: { chords: true, nord: false, metro: false } },
  bass: { name: 'Bass', show: { chords: true, nord: false, metro: false } },
  drums: { name: 'Schlagzeug', show: { chords: false, nord: false, metro: true } },
  mixer: { name: 'Mischpult', show: { chords: false, nord: false, metro: false } },
};
const SHOW = { chords: 'Akkorde im Blatt', nord: 'Nord-Sounds und Anleitungen', metro: 'Metronom (Tempo-Leiste)' };
// Schalter, die ohne ausdrückliche Wahl aus sind (alle anderen sind an)
const SHOW_OFF = ['metro'];
const profile = () => state.settings.profile || { name: '', role: 'keyboard' };
/** Songnummer als kleines Schild (leer, wenn der Song keine hat). */
const noTag = (s) => (s.no ? `<span class="sno">${s.no}</span>` : '');
/** Suchtext eines Songs: Titel, Interpret und Nummer. */
const hay = (s) => `${s.title} ${s.artist} ${s.no || ''}`.toLowerCase();
const shows = (k) => {
  const v = (state.settings.show || {})[k];
  return v === undefined ? !SHOW_OFF.includes(k) : v !== false;
};
// Metronom-Einstellungen dieses Geräts: off = in der Song-Ansicht ausgeschaltet, accent = Eins hervorheben,
// click = hörbarer Klick, bottom = Leiste unten am Bildschirm statt oben im Notenbalken
const metroCfg = () => state.settings.metro || {};
const metroOn = (s) => shows('metro') && !!s.bpm && !metroCfg().off;

// ---------- Bildschirm anlassen (Wake Lock) ----------
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { /* nicht unterstützt → iPad: Automatische Sperre auf „Nie“ */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && location.hash.startsWith('#/song/')) keepAwake(true);
});

// ---------- Stand der Sicherung (Ampel) ----------
const dayText = (n) => n <= 0 ? 'heute' : n === 1 ? 'seit gestern' : `seit ${n} Tagen`;
function backupText(b) {
  if (b.level === 'ok') return `Alles gesichert – letzte Sicherung ${fmtDate(b.at)}`;
  if (!b.at) return 'Auf diesem Gerät wurde noch keine Sicherung erstellt';
  return `Ungesicherte Änderungen ${b.days <= 0 ? 'von heute' : dayText(b.days)} – letzte Sicherung ${fmtDate(b.at)}`;
}

// ---------- Handy-Ansicht ----------
// settings.layout: 'auto' (Standard) = schmaler Bildschirm hochkant → Handy-Ansicht; 'phone' / 'tablet' = von Hand gewählt.
const LAYOUTS = { auto: 'Automatisch', phone: 'Handy', tablet: 'Tablet' };
const PHONE_MAX = 600;   // bis zu dieser Breite (CSS-Pixel) gilt ein Bildschirm als Handy
const isPhone = () => {
  const l = state.settings.layout || 'auto';
  if (l !== 'auto') return l === 'phone';
  // Kürzere Bildschirmseite: Handys ca. 360–430, Tablets ab ca. 740 – unabhängig davon, ob gerade quer gehalten.
  // Dazu ein schmales Fenster (z. B. am PC). innerWidth allein reicht nicht: Ist eine Seite zu breit, wächst sie mit.
  const s = window.screen ? Math.min(screen.width || 9999, screen.height || 9999) : 9999;
  return s < PHONE_MAX || window.innerWidth < PHONE_MAX;
};
function applyLayout() {
  document.body.classList.toggle('phone', isPhone());
  // Höhe der Kopfleiste merken, damit die mitlaufende Notenleiste genau darunter stehen bleibt
  const h = document.querySelector('header.top');
  if (h) document.documentElement.style.setProperty('--headh', h.offsetHeight + 'px');
}
/**
 * Bricht eine Akkordzeile um, steht über jedem Teil eine Akkordzeile – auch wenn dort gar kein Akkord ist.
 * Diese leeren Akkordzeilen werden ausgeblendet (Klasse nc), damit der Text auf schmalen Bildschirmen dicht bleibt.
 * Erst alle Positionen lesen, dann schreiben: ein einziger Layout-Durchgang.
 */
function tidyChordRows() {
  const sh = document.getElementById('sheet');
  if (!sh) return;
  const pairs = [...sh.querySelectorAll('.ln.pair')];
  sh.querySelectorAll('.nc').forEach((e) => e.classList.remove('nc'));
  const plan = pairs.map((p) => {
    const rows = new Map();
    for (const k of p.children) { const t = k.offsetTop; if (!rows.has(t)) rows.set(t, []); rows.get(t).push(k); }
    return [...rows.values()].filter((r) => !r.some((k) => k.querySelector('.ch')));
  });
  plan.forEach((rows) => rows.forEach((r) => r.forEach((k) => k.classList.add('nc'))));
}
// Drehen oder Fenstergröße ändern: nur die Ansicht umschalten, nichts neu zeichnen (Bühne: Scroll-Position bleibt)
let tidyT = 0;
window.addEventListener('resize', () => { applyLayout(); clearTimeout(tidyT); tidyT = setTimeout(tidyChordRows, 150); });

// ---------- Rahmen ----------
function shell(active, body) {
  const bk = backupStatus();
  document.body.classList.toggle('stage', isStage());
  document.body.classList.toggle('nonord', !shows('nord'));
  document.documentElement.style.setProperty('--font', (state.settings.fontSize || 22) + 'px');
  app.innerHTML = `
    <header class="top">
      <a class="brand" href="#/"><i></i><span class="lbl-long">SoulTape Stage</span></a>
      <nav>
        <a href="#/" class="${active === 'songs' ? 'on' : ''}">Songs</a>
        <a href="#/listen" class="${active === 'lists' ? 'on' : ''}">Setlisten</a>
        <a href="#/lexikon" class="${active === 'lex' ? 'on' : ''} prep-only nord-only">Lexikon</a>
        <a href="#/einstellungen" class="${active === 'set' ? 'on' : ''} prep-only" title="Einstellungen"><span class="lbl-long">Einstellungen</span><span class="lbl-short">⚙</span><i class="bk bk-${bk.level}" title="${esc(backupText(bk))}"></i></a>
      </nav>
      <span class="spacer"></span>
      <span class="ver" title="Version der App">v${APP_VERSION}</span>
      <button class="mode ${isStage() ? 'stage' : ''}" id="modeBtn">${isStage() ? 'Bühne' : '<span class="lbl-long">Vorbereitung</span><span class="lbl-short">Vorb.</span>'}</button>
    </header>
    <main>${body}</main>`;
  applyLayout();
  $('#modeBtn').onclick = () => {
    state.settings.mode = isStage() ? 'prep' : 'stage';
    persist(); route();
  };
}

// ---------- Songliste ----------
function viewSongs() {
  const q = (ui.search || '').toLowerCase();
  const list = sortedSongs().filter((s) => !q || hay(s).includes(q));
  // Nach einer Nummer gesucht → der Song mit genau dieser Nummer steht oben
  if (/^\d+$/.test(q)) list.sort((a, b) => (b.no === +q) - (a.no === +q));
  const bk = backupStatus();
  shell('songs', `
    ${bk.level === 'alert' ? `<a class="notice bknote prep-only" href="#/einstellungen"><i class="bk bk-alert"></i><span><b>Sicherung fällig.</b> ${esc(backupText(bk))}. Tippen, um jetzt zu sichern.</span></a>` : ''}
    <div class="row" style="margin-bottom:12px">
      <input type="search" id="q" placeholder="Song oder Nummer suchen …" value="${esc(ui.search || '')}" style="flex:1;min-width:200px">
      <a class="btn prep-only" href="#/teilen">Songs teilen</a>
      <a class="btn prep-only" href="#/import">Leadsheets importieren</a>
      <button class="btn primary prep-only" id="add">+ Song</button>
    </div>
    <ul class="songs">${list.map((s) => `
      <li><a href="#/song/${s.id}">
        ${s.no ? `<div class="sno big">${s.no}</div>` : ''}<div style="flex:1"><div class="t">${esc(s.title)}</div>
          <div class="a">${esc(s.artist)}${s.parts?.length > 1 ? `<span class="nord-only"> · ${s.parts.length} Sounds</span>` : ''}${activeSheet(s) ? ' · Leadsheet' : ''}</div></div>
        <div class="k"><b>${esc(transposeKey(s.key, s.transpose || 0, notation()))}</b>${s.nordSlot ? `<span class="badge slot nord-only">${esc(s.nordSlot)}</span>` : ''}${s.nordStored ? '<span class="badge ok nord-only">auf dem Nord</span>' : '<span class="badge nord-only">noch nicht gespeichert</span>'}</div>
      </a></li>`).join('')}
    </ul>
    ${list.length ? '' : '<p class="muted">Kein Song gefunden.</p>'}`);
  const qi = $('#q');
  qi.oninput = () => { ui.search = qi.value; const pos = qi.selectionStart; viewSongs(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
  const add = $('#add');
  if (add) add.onclick = () => { const s = newSong(); location.hash = `#/bearbeiten/${s.id}`; };
  // Aus der Songliste geöffnet → ◀/▶ blättert alphabetisch, nicht in einer Setlist
  app.querySelectorAll('.songs a').forEach((a) => a.addEventListener('click', () => { state.settings.navList = null; persist(); }));
}

// ---------- Song-Ansicht (Bühne & Vorbereitung) ----------
function viewSong(id) {
  const s = getSong(id);
  if (!s) { location.hash = '#/'; return; }
  // Reihenfolge für ◀/▶: die gewählte Setlist, sonst alphabetisch
  const ctx = listContext(id);
  const order = sortedSongs();
  const idx = order.findIndex((x) => x.id === id);
  const prev = ctx ? ctx.prev : order[idx - 1], next = ctx ? ctx.next : order[idx + 1];
  const navPos = (x) => (ctx && x ? ` data-pos="${x === ctx.prev ? ctx.prevPos : ctx.nextPos}"` : '');
  if (ui.songId !== id) { ui = { ...ui, songId: id, part: 0, step: 0, guide: false, mark: false }; }
  if (isStage()) ui.mark = false;
  const part = s.parts?.[ui.part];
  const sheet = activeSheet(s);
  const tr = s.transpose || 0;

  shell('songs', `
    <div class="songhead">
      <div class="titles">
        <h1>${noTag(s)}${esc(s.title)}</h1>
        <div class="muted">${esc(s.artist)}${s.durationSec ? ' · ' + fmtDur(s.durationSec) : ''}${s.bpm ? ` · ${s.bpm} BPM${s.beats && s.beats !== 4 ? ` · ${s.beats}er-Takt` : ''}` : ''}</div>
        ${ctx ? `<a class="listctx" href="#/liste/${ctx.list.id}">${esc(ctx.list.name)}${ctx.setCount > 1 ? ` · Set ${ctx.setNo}` : ''} · Song ${ctx.songNo} von ${ctx.songCount}</a>` : ''}
      </div>
      <a class="btn prep-only" href="#/bearbeiten/${s.id}">Bearbeiten</a>
    </div>
    <div class="nord-only">
    <div class="nordbox">
      <div><div class="lbl">Nord-Programm</div><div class="prog">${s.nordSlot ? `<span class="slot">${esc(s.nordSlot)}</span>` : ''}${esc(s.nordProgram || s.title)}</div>
        ${s.nordStored ? '' : '<div class="small" style="color:#ffb3b3">Noch nicht auf dem Nord gespeichert</div>'}
        ${s.levelOk ? '' : '<div class="small muted prep-only">Lautstärke noch nicht abgeglichen</div>'}</div>
      ${s.kawai ? `<div class="kawai">Alter Kawai-Sound<br><b>${esc(s.kawai)}</b></div>` : ''}
    </div>
    ${s.parts?.length ? `
      ${s.parts.length > 1 ? `<div class="parts">${s.parts.map((p, i) => `<button data-part="${i}" class="${i === ui.part ? 'on' : ''}">${esc(p.name)}</button>`).join('')}</div>` : ''}
      <div class="summary">${esc(part?.summary || '')}</div>
      ${part?.tips ? `<div class="tips">${esc(part.tips)}</div>` : ''}
      ${part?.steps?.length ? `<div class="row prep-only" style="margin-top:10px">
        <button class="btn" id="guideBtn">${ui.guide ? 'Anleitung schließen' : `Anleitung am Nord (${part.steps.length} Schritte)`}</button>
        ${part.lex ? `<a class="btn ghost" href="#/lexikon/${part.lex}">Was ist das für ein Klang?</a>` : ''}</div>` : ''}
      ${ui.guide && part?.steps?.length ? guideHtml(part) : ''}` : ''}
    </div>

    <div class="sheetbar${shows('chords') ? '' : ' nochords'}">
      <div class="grp trgrp" title="Transponieren"><button id="trDown">−</button><span>${tr === 0 ? 'Original' : (tr > 0 ? '+' : '') + tr}<br><b style="color:var(--chord)">${esc(transposeKey(s.key, tr, notation()) || '–')}</b></span><button id="trUp">+</button></div>
      <div class="grp" title="Schriftgröße"><button id="fsDown">A−</button><button id="fsUp">A+</button></div>
      ${sheet ? `<button class="btn prep-only ${ui.mark ? 'primary' : ''}" id="markBtn" title="Im Blatt ändern">${ui.mark ? 'Fertig' : '✎<span class="lbl-long"> Im Blatt ändern</span>'}</button>` : ''}
      ${shows('metro') ? (s.bpm ? `<button class="btn metrobtn ${metroOn(s) ? 'primary' : ''}" id="metroBtn" title="Metronom ein/aus">♩ ${s.bpm}</button>`
        : `<a class="btn ghost prep-only" href="#/bearbeiten/${s.id}" title="Für das Metronom fehlt das Tempo">♩ Tempo fehlt</a>`) : ''}
      <span class="spacer" style="flex:1"></span>
      ${sheet ? `<span class="badge prep-only sheetname">${esc(sheet.name)}</span>` : ''}
      ${next ? `<a class="btn nextbtn phone-only" href="#/song/${next.id}"${navPos(next)} title="Nächster Song">${ctx && ctx.breakBefore ? '⏸ ' : ''}<span class="nt">${esc(next.title)}</span> ▶</a>` : ''}
      ${metroOn(s) && !metroCfg().bottom ? metroHtml(s.bpm, s.beats || 4, { accent: !!metroCfg().accent }) : ''}
    </div>
    ${ui.mark ? '<div class="notice small prep-only" style="margin-top:8px">Tippe auf eine Zeile: Du kannst sie direkt ändern (z. B. einen falschen Akkord) oder davor einen Soundwechsel setzen. Ein Tipp auf einen Wechsel-Balken ändert oder entfernt ihn. Dein Original bleibt erhalten – die Änderungen landen in einer eigenen Version „Arbeitsfassung“.</div>' : ''}
    <div class="sheet${ui.mark ? ' marking' : (shows('chords') ? '' : ' nochords')}" id="sheet">${sheet ? renderSheet(sheet.text, { steps: tr, notation: notation(), key: s.key }) :
      `<p class="muted" style="font-size:17px">Noch kein Leadsheet. <span class="prep-only">Unter <a href="#/import">Leadsheets importieren</a> kannst du deine ChordPro-Datei einlesen.</span></p>`}</div>
    <div class="songnav">
      ${prev ? `<a class="btn" href="#/song/${prev.id}"${navPos(prev)}>◀ ${esc(prev.title)}</a>` : '<span style="flex:1"></span>'}
      ${next ? `<a class="btn" href="#/song/${next.id}"${navPos(next)}>${ctx && ctx.breakBefore ? `<span class="pausehint">⏸ ${esc(ctx.breakBefore)} – danach:</span> ` : ''}${esc(next.title)} ▶</a>`
        : (ctx ? '<span class="btn" style="flex:1;opacity:.6">Ende der Liste</span>' : '<span style="flex:1"></span>')}
    </div>
    ${metroOn(s) && metroCfg().bottom ? metroHtml(s.bpm, s.beats || 4, { accent: !!metroCfg().accent, bottom: true }) : ''}`);
  document.body.classList.toggle('metro-bottom', metroOn(s) && !!metroCfg().bottom);
  const mel = $('#metro');
  if (mel) startMetro(mel, { key: s.id, bpm: s.bpm, beats: s.beats || 4, accent: !!metroCfg().accent, click: !!metroCfg().click });
  else stopMetro();
  const mtb = $('#metroBtn');
  if (mtb) mtb.onclick = () => { state.settings.metro = { ...metroCfg(), off: !metroCfg().off }; persist(); viewSongKeepScroll(id); };
  app.querySelectorAll('.songnav a[data-pos], .nextbtn[data-pos]').forEach((a) => a.addEventListener('click', () => { state.settings.navList = { id: ctx.list.id, pos: +a.dataset.pos }; persist(); }));

  keepAwake(true);
  window.scrollTo(0, 0);

  app.querySelectorAll('[data-part]').forEach((b) => b.onclick = () => { ui.part = +b.dataset.part; ui.step = 0; viewSongKeepScroll(id); });
  const gb = $('#guideBtn'); if (gb) gb.onclick = () => { ui.guide = !ui.guide; ui.step = 0; viewSongKeepScroll(id); };
  app.querySelectorAll('[data-step]').forEach((li) => li.onclick = () => { ui.step = +li.dataset.step; updateGuide(part); });
  const sp = $('#stPrev'), sn = $('#stNext');
  if (sp) sp.onclick = () => { ui.step = Math.max(0, ui.step - 1); updateGuide(part); };
  if (sn) sn.onclick = () => { ui.step = Math.min(part.steps.length - 1, ui.step + 1); updateGuide(part); };

  $('#trDown').onclick = () => { s.transpose = tr - 1; persist(); viewSongKeepScroll(id); };
  $('#trUp').onclick = () => { s.transpose = tr + 1; persist(); viewSongKeepScroll(id); };
  $('#fsDown').onclick = () => { state.settings.fontSize = Math.max(14, (state.settings.fontSize || 22) - 2); persist(); document.documentElement.style.setProperty('--font', state.settings.fontSize + 'px'); tidyChordRows(); };
  $('#fsUp').onclick = () => { state.settings.fontSize = Math.min(48, (state.settings.fontSize || 22) + 2); persist(); document.documentElement.style.setProperty('--font', state.settings.fontSize + 'px'); tidyChordRows(); };
  tidyChordRows();

  // Tippen rechts = weiter, links = zurück (sanft, um ca. zwei Drittel des Bildschirms)
  const sh = $('#sheet');
  const mb = $('#markBtn'); if (mb) mb.onclick = () => { ui.mark = !ui.mark; viewSongKeepScroll(id); };
  let downX = 0, downY = 0, downT = 0;
  sh.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; downT = Date.now(); });
  sh.addEventListener('pointerup', (e) => {
    if (Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10 || Date.now() - downT > 500) return;
    if (e.target.closest('a,button,input,.markbox')) return;
    if (ui.mark) { const ln = e.target.closest('.ln[data-src]'); if (ln) openMarkBox(s, ln); return; }
    const w = window.innerWidth;
    const dy = Math.round(window.innerHeight * 0.66);
    if (e.clientX > w * 0.6) glide(dy);
    else if (e.clientX < w * 0.4) glide(-dy);
  });
}

// ---------- Sanftes Blättern ----------
// Eigene Bewegung statt der des Browsers: gleichmäßig langsam, damit das Auge der Zeile folgen kann.
// Tempo in den Einstellungen (pageMs = Dauer einer Blätter-Bewegung in Millisekunden).
const PAGE_SPEEDS = { 700: 'Zügig', 1400: 'Ruhig', 2200: 'Langsam' };
let glideRaf = 0, glideTarget = null, glideGuard = 0;
function stopGlide() { if (glideRaf) cancelAnimationFrame(glideRaf); clearTimeout(glideGuard); glideRaf = 0; glideTarget = null; }
// Wischt man selbst (Finger oder Mausrad), stoppt die Bewegung sofort
window.addEventListener('touchmove', stopGlide, { passive: true });
window.addEventListener('wheel', stopGlide, { passive: true });
window.addEventListener('hashchange', stopGlide);
function glide(dy) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  // Zweites Tippen während der Bewegung: vom bisherigen Ziel aus weiterrechnen
  const from = window.scrollY;
  const to = Math.max(0, Math.min(max, (glideTarget ?? from) + dy));
  stopGlide();
  if (Math.abs(to - from) < 2) return;
  glideTarget = to;
  const ms = state.settings.pageMs || 1400;
  const t0 = performance.now();
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);   // weich anfahren und abbremsen
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / ms);
    window.scrollTo(0, from + (to - from) * ease(p));
    if (p < 1) glideRaf = requestAnimationFrame(tick); else stopGlide();
  };
  glideRaf = requestAnimationFrame(tick);
  // Sicherheitsnetz: Liefert der Browser keine Bild-Takte, landet die Seite trotzdem am Ziel
  glideGuard = setTimeout(() => { if (glideTarget === to) { window.scrollTo(0, to); stopGlide(); } }, ms + 300);
}

// ---------- Soundwechsel im Leadsheet setzen (nur Vorbereitung) ----------
/**
 * Ändert den Rohtext der aktiven Version. Das Original wird nie überschrieben:
 * Bei der ersten Änderung entsteht eine Kopie „Arbeitsfassung“ (sheet.marks), weitere Änderungen landen in dieser Kopie.
 */
function editMarks(s, change) {
  let v = activeSheet(s);
  if (!v) return;
  if (!v.marks) {
    v = addSheet(s, `Arbeitsfassung ${fmtDate(new Date().toISOString())}`, v.text, true);
    v.marks = true;
  }
  const lines = v.text.replace(/\r\n?/g, '\n').split('\n');
  change(lines);
  v.text = lines.join('\n');
  persist();
}

/**
 * Blendet über der angetippten Zeile ein Feld ein: Zeile direkt ändern (z. B. falscher Akkord),
 * davor einen Soundwechsel setzen oder einen vorhandenen Wechsel ändern/entfernen.
 */
function openMarkBox(s, ln) {
  const old = $('#sheet .markbox'); if (old) old.remove();
  const src = +ln.dataset.src, n = +ln.dataset.n || 1;
  const isSwitch = ln.classList.contains('switch');
  const lines = activeSheet(s).text.replace(/\r\n?/g, '\n').split('\n');
  const cur = isSwitch ? (switchText(lines[src]) || '') : '';
  const raw = lines.slice(src, src + n).join('\n');
  const partChips = (s.parts || []).length > 1 ? s.parts.map((p) => p.name).filter(Boolean) : [];
  const chips = [...partChips, 'Piano AN', 'Piano AUS', 'Orgel AN', 'Orgel AUS', 'Synth AN', 'Synth AUS', 'Rotary schnell', 'Rotary langsam'];
  const switchForm = `
    <div class="small muted">Was musst du tun? Für einen Programmwechsel den Speicherplatz zuerst schreiben, z. B. „M 24 Orgel“. Sonst antippen oder frei eintragen, z. B. „Synth AN“.</div>
    <div class="row">${chips.map((c) => `<span class="chip" data-chip="${esc(c)}">${esc(c)}</span>`).join('')}</div>
    <input type="text" id="markText" value="${esc(cur)}" placeholder="z. B. M 24 Orgel  oder  Synth AN">
    <div class="row"><button class="btn ${isSwitch ? 'primary' : ''}" id="markSet">${isSwitch ? 'Ändern' : 'Wechsel setzen'}</button>
      ${isSwitch ? '<button class="btn danger" id="markDel">Entfernen</button>' : ''}</div>`;
  const box = document.createElement('div');
  box.className = 'markbox card stack';
  box.innerHTML = isSwitch ? `<b>Soundwechsel ändern</b>${switchForm}
    <div class="row"><button class="btn ghost" id="markCancel">Abbrechen</button></div>` : `
    <b>Zeile ändern</b>
    <div class="small muted">Akkorde stehen in eckigen Klammern vor der Silbe, z. B. <code>[Am]Text [F]weiter</code>. Feld leeren und speichern = Zeile löschen. Eine zusätzliche Zeile im Feld fügt eine neue Zeile ein.</div>
    <textarea id="lineText" rows="${Math.max(2, n + 1)}" spellcheck="false" autocapitalize="off" autocorrect="off">${esc(raw)}</textarea>
    <div class="row"><button class="btn primary" id="lineSave">Speichern</button><button class="btn ghost" id="markCancel">Abbrechen</button></div>
    <details><summary>⇄ Soundwechsel vor dieser Zeile setzen</summary><div class="stack" style="margin-top:10px">${switchForm}</div></details>`;
  ln.before(box);
  const done = (change) => { editMarks(s, change); viewSongKeepScroll(s.id); };
  const inp = $('#markText', box);
  box.querySelectorAll('[data-chip]').forEach((c) => c.onclick = () => {
    inp.value = inp.value.trim() ? `${inp.value.trim()}, ${c.dataset.chip}` : c.dataset.chip;
  });
  $('#markCancel', box).onclick = () => box.remove();
  $('#markSet', box).onclick = () => {
    const t = inp.value.trim();
    if (!t) { inp.focus(); return; }
    done((l) => { if (isSwitch) l[src] = switchLine(t); else l.splice(src, 0, switchLine(t)); });
  };
  const del = $('#markDel', box);
  if (del) del.onclick = () => done((l) => l.splice(src, 1));
  const save = $('#lineSave', box);
  if (save) save.onclick = () => {
    const t = $('#lineText', box).value.replace(/\r\n?/g, '\n').replace(/\s+$/, '');
    if (t === raw.replace(/\s+$/, '')) { box.remove(); return; }   // nichts geändert → keine neue Version
    done((l) => l.splice(src, n, ...(t ? t.split('\n') : [])));
  };
}

function viewSongKeepScroll(id) {
  const y = window.scrollY;
  viewSong(id);
  window.scrollTo(0, y);
}

/** Eindeutige Angabe zu einem Schritt: Reglerstellung mit Skala, LED-Auswahl oder Zugriegel. */
function stepHint(x) {
  if (x.drawbars) {
    return `Zugriegel von links nach rechts: ${String(x.drawbars).split('').join(' ')} · Skala 0–8 (0 = ganz hineingeschoben, 8 = ganz herausgezogen)`;
  }
  // Maßgeblich ist der Wert im Display des Nord – der wird gespeichert, nicht die Knopfstellung.
  if (x.disp) return `Im Display: ${x.disp}`;
  // Zeit, Frequenz und Lautstärke zeigt das Display in ms/s, Hz und dB – ohne gemessenen Wert lieber nichts behaupten.
  if (typeof x.val === 'number' && !/^(syn-attack|syn-decay|syn-release|syn-freq)$|-level$/.test(x.c)) {
    return `Im Display: ${String(x.val).replace('.', ',')} (Skala 0–10)`;
  }
  if (x.sel) return `Auswahl: Die LED bei „${x.sel}“ muss leuchten`;
  return '';
}

function guideHtml(part) {
  const st = part.steps[ui.step] || part.steps[0];
  const hint = (x) => { const h = stepHint(x); return h ? `<div class="hint">${esc(h)}</div>` : ''; };
  return `<div class="guide card">
    <div class="small muted" style="margin-bottom:8px">Bei Drehreglern zählt immer der <b>Wert im Display</b> des Nord – er wird gespeichert, nicht die Stellung des Knopfs. Dreh den Regler, bis der gelb angegebene Wert im Display steht. Der Zeiger in der Skizze zeigt nur die ungefähre Richtung.</div>
    <div class="small muted" style="margin-bottom:8px"><b>Lautstärke:</b> MASTER LEVEL bleibt immer auf der festen Stellung${state.settings.nordMaster ? ` (${esc(state.settings.nordMaster)})` : ''}. Die dB-Werte bei LEVEL sind Startwerte – vor dem Speichern mit dem Referenz-Sound${state.settings.nordRef ? ` (${esc(state.settings.nordRef)})` : ''} vergleichen und am LEVEL der Sektion nachregeln, bis es gleich laut wirkt.</div>
    <div class="mapwrap">
      <div id="map">${renderPanel(st.s, st)}</div>
      <div class="mapnav"><button class="btn" id="stPrev">◀</button><span class="pos" id="stPos">Schritt ${ui.step + 1} von ${part.steps.length} · ${esc(SECTIONS[st.s]?.name || '')}</span><button class="btn" id="stNext">▶</button></div>
    </div>
    <ol class="steps">${part.steps.map((x, i) => `<li data-step="${i}" class="${i === ui.step ? 'on' : ''}"><div><div class="sec">${esc(SECTIONS[x.s]?.name || '')}</div>${esc(x.t)}${hint(x)}</div></li>`).join('')}</ol>
  </div>`;
}

function updateGuide(part) {
  const st = part.steps[ui.step];
  $('#map').innerHTML = renderPanel(st.s, st);
  $('#stPos').textContent = `Schritt ${ui.step + 1} von ${part.steps.length} · ${SECTIONS[st.s]?.name || ''}`;
  app.querySelectorAll('[data-step]').forEach((li) => li.classList.toggle('on', +li.dataset.step === ui.step));
}

// ---------- Song bearbeiten ----------
function viewEdit(id) {
  const s = getSong(id);
  if (!s) { location.hash = '#/'; return; }
  const sheet = activeSheet(s);
  const lexOpts = (cur) => `<option value="">–</option>` + LEXICON.map((l) => `<option value="${l.id}" ${l.id === cur ? 'selected' : ''}>${esc(l.name)}</option>`).join('');
  const secOpts = (cur) => Object.entries(SECTIONS).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
  const ctlOpts = (sec, cur) => controlsOf(sec).map((c) => `<option value="${c.id}" ${c.id === cur ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  const stepVal = (x) => x.drawbars ?? x.val ?? x.sel ?? '';
  const custom = (s.tags || []).filter((t) => !TAGS.includes(t));

  shell('songs', `
    <div class="row"><a class="btn ghost" href="#/song/${s.id}">◀ Zurück</a><span style="flex:1"></span>
      <button class="btn danger" id="del">Song löschen</button></div>
    <h1>Song bearbeiten</h1>
    <div class="card stack">
      <div class="grid2">
        <label class="f"><span>Titel</span><input type="text" id="f-title" value="${esc(s.title)}"></label>
        <label class="f"><span>Interpret</span><input type="text" id="f-artist" value="${esc(s.artist)}"></label>
        <label class="f"><span>Tonart (z. B. Am, F#, H)</span><input type="text" id="f-key" value="${esc(s.key)}"></label>
        <label class="f"><span>Songnummer (zum Zurufen in der Band)</span><input type="number" inputmode="numeric" min="1" max="9999" id="f-no" value="${s.no || ''}" placeholder="${state.settings.numbering ? 'z. B. ' + nextNo() : 'kommt über ein Paket'}"></label>
        <label class="f"><span>Dauer (mm:ss)</span><input type="text" id="f-dur" value="${esc(fmtDur(s.durationSec))}" placeholder="3:45"></label>
        <label class="f"><span>Tempo (BPM = Schläge pro Minute)</span><input type="number" inputmode="numeric" min="30" max="300" id="f-bpm" value="${s.bpm || ''}" placeholder="z. B. 120"></label>
        <label class="f"><span>Taktart (Schläge pro Takt)</span><select id="f-beats">${[2, 3, 4, 5, 6, 7, 9, 12].map((n) => `<option value="${n}" ${(s.beats || 4) === n ? 'selected' : ''}>${n}${n === 4 ? ' (Standard)' : ''}</option>`).join('')}</select></label>
        <label class="f"><span>Programmname auf dem Nord</span><input type="text" id="f-nord" value="${esc(s.nordProgram)}"></label>
        <label class="f"><span>Speicherplatz auf dem Nord (z. B. M 23)</span><input type="text" id="f-slot" value="${esc(s.nordSlot || '')}" placeholder="M 23"></label>
        <label class="f"><span>Alter Kawai-Sound</span><input type="text" id="f-kawai" value="${esc(s.kawai)}"></label>
      </div>
      <label class="row"><input type="checkbox" id="f-stored" ${s.nordStored ? 'checked' : ''} style="width:22px;height:22px"> Programm ist auf dem Nord gespeichert</label>
      <label class="row"><input type="checkbox" id="f-level" ${s.levelOk ? 'checked' : ''} style="width:22px;height:22px"> Lautstärke mit dem Referenz-Sound abgeglichen</label>
      <div><div class="small muted" style="margin-bottom:6px">Schlagworte</div>
        <div class="row">${[...TAGS, ...custom].map((t) => `<span class="chip ${s.tags?.includes(t) ? 'on' : ''}" data-tag="${esc(t)}">${esc(t)}</span>`).join('')}
        <input type="text" id="f-newtag" placeholder="+ eigenes Schlagwort" style="width:200px"></div></div>
      <label class="f"><span>Notizen</span><input type="text" id="f-notes" value="${esc(s.notes)}"></label>
    </div>

    <h2>Sounds</h2>
    ${(s.parts || []).map((p, pi) => `
      <div class="card stack" style="margin-bottom:12px">
        <div class="grid2">
          <label class="f"><span>Teil</span><input type="text" data-p="${pi}" data-f="name" value="${esc(p.name)}"></label>
          <label class="f"><span>Klang (Lexikon)</span><select data-p="${pi}" data-f="lex">${lexOpts(p.lex)}</select></label>
        </div>
        <label class="f"><span>Kurzbeschreibung</span><input type="text" data-p="${pi}" data-f="summary" value="${esc(p.summary)}"></label>
        <label class="f"><span>Tipp</span><input type="text" data-p="${pi}" data-f="tips" value="${esc(p.tips)}"></label>
        <details><summary class="small muted">Anleitungsschritte (${p.steps?.length || 0})</summary>
          <div style="margin-top:10px">${(p.steps || []).map((x, si) => `
            <div class="steped">
              <select data-p="${pi}" data-s="${si}" data-sf="s">${secOpts(x.s)}</select>
              <select data-p="${pi}" data-s="${si}" data-sf="c">${ctlOpts(x.s, Array.isArray(x.c) ? x.c[0] : x.c)}</select>
              <input type="text" data-p="${pi}" data-s="${si}" data-sf="v" value="${esc(stepVal(x))}" placeholder="Wert (z. B. 3, B3, 888000000)">
              <button class="btn ghost" data-delstep="${pi}:${si}">✕</button>
              <input class="w" type="text" data-p="${pi}" data-s="${si}" data-sf="t" value="${esc(x.t)}">
            </div>`).join('')}
            <button class="btn" data-addstep="${pi}">+ Schritt</button>
          </div></details>
        <div class="row"><button class="btn danger ghost" data-delpart="${pi}">Teil entfernen</button></div>
      </div>`).join('')}
    <button class="btn" id="addPart">+ Sound-Teil (z. B. Refrain)</button>

    <h2>Leadsheet-Versionen</h2>
    <p class="small muted">Das Original bleibt immer erhalten. Jede Änderung wird als neue Version gespeichert; du wählst, welche auf der Bühne erscheint.</p>
    <div class="card tablelike">${(s.sheets || []).map((v) => `
      <div><input type="radio" name="act" value="${v.id}" ${sheet && v.id === sheet.id ? 'checked' : ''} style="width:22px;height:22px;margin-top:10px">
        <div style="flex:1"><b>${esc(v.name)}</b><div class="small muted">${fmtDate(v.created)}</div></div>
        <button class="btn" data-editsheet="${v.id}">Als neue Version bearbeiten</button>
        <button class="btn ghost danger" data-delsheet="${v.id}">✕</button></div>`).join('') || '<div class="muted">Noch keine Version.</div>'}
    </div>
    <div id="sheetEditor"></div>
    <div class="row" style="margin-top:10px">
      <button class="btn" id="pasteSheet">Leadsheet einfügen</button>
      ${sheet ? '<button class="btn" id="exportSheet">Als ChordPro exportieren</button>' : ''}
    </div>
    <div class="row" style="margin:24px 0"><a class="btn primary" href="#/song/${s.id}">Fertig</a></div>`);

  const bind = (sel, fn) => { const el = $(sel); if (el) el.onchange = fn; };
  bind('#f-title', (e) => { s.title = e.target.value.trim() || s.title; persist(); });
  bind('#f-artist', (e) => { s.artist = e.target.value.trim(); persist(); });
  bind('#f-key', (e) => { s.key = e.target.value.trim(); persist(); });
  bind('#f-dur', (e) => { s.durationSec = parseDur(e.target.value); persist(); });
  bind('#f-bpm', (e) => {
    const v = e.target.value.trim();
    const n = readBpm(v);
    if (v && !n) { toast('Bitte ein Tempo von 30 bis 300 BPM eingeben'); e.target.value = s.bpm || ''; return; }
    s.bpm = n; persist();
  });
  bind('#f-beats', (e) => { const n = +e.target.value; s.beats = n === 4 ? null : n; persist(); });
  bind('#f-nord', (e) => { s.nordProgram = e.target.value.trim(); persist(); });
  bind('#f-no', (e) => {
    const v = e.target.value.trim();
    if (setSongNo(s, v)) { if (!lastSaveOk()) toast('Speichern fehlgeschlagen – bitte Backup exportieren.'); return; }
    const other = songByNo(v);
    toast(other ? `Nummer ${v} gehört schon zu „${other.title}“` : 'Bitte eine Zahl von 1 bis 9999 eingeben');
    e.target.value = s.no || '';
  });
  bind('#f-slot', (e) => { s.nordSlot = e.target.value.trim().toUpperCase(); persist(); });
  bind('#f-kawai', (e) => { s.kawai = e.target.value.trim(); persist(); });
  bind('#f-notes', (e) => { s.notes = e.target.value; persist(); });
  bind('#f-stored', (e) => { s.nordStored = e.target.checked; persist(); });
  bind('#f-level', (e) => { s.levelOk = e.target.checked; persist(); });
  bind('#f-newtag', (e) => { const t = e.target.value.trim(); if (t) { s.tags = [...new Set([...(s.tags || []), t])]; persist(); viewEdit(id); } });
  app.querySelectorAll('[data-tag]').forEach((c) => c.onclick = () => {
    const t = c.dataset.tag; s.tags = s.tags || [];
    s.tags = s.tags.includes(t) ? s.tags.filter((x) => x !== t) : [...s.tags, t];
    c.classList.toggle('on'); persist();
  });
  app.querySelectorAll('[data-f]').forEach((el) => el.onchange = () => { s.parts[+el.dataset.p][el.dataset.f] = el.value; persist(); });
  app.querySelectorAll('[data-sf]').forEach((el) => el.onchange = () => {
    const x = s.parts[+el.dataset.p].steps[+el.dataset.s];
    const f = el.dataset.sf;
    if (f === 's') { x.s = el.value; x.c = controlsOf(el.value)[0]?.id; persist(); keepY(() => viewEdit(id)); return; }
    if (f === 'c') x.c = el.value;
    if (f === 't') x.t = el.value;
    if (f === 'v') {
      delete x.val; delete x.sel; delete x.drawbars; delete x.disp;
      const v = el.value.trim();
      if (/^\d{9}$/.test(v)) x.drawbars = v;
      else if (/^\d+(\.\d+)?$/.test(v)) x.val = +v;
      else if (v) x.sel = v;
    }
    persist();
  });
  app.querySelectorAll('[data-addstep]').forEach((b) => b.onclick = () => {
    const p = s.parts[+b.dataset.addstep]; p.steps = p.steps || [];
    p.steps.push({ s: 'program', c: 'prg-display', t: 'Neuer Schritt' }); persist(); keepY(() => viewEdit(id), true);
  });
  app.querySelectorAll('[data-delstep]').forEach((b) => b.onclick = () => {
    const [pi, si] = b.dataset.delstep.split(':').map(Number);
    s.parts[pi].steps.splice(si, 1); persist(); keepY(() => viewEdit(id), true);
  });
  app.querySelectorAll('[data-delpart]').forEach((b) => b.onclick = () => {
    if (!confirm('Diesen Sound-Teil entfernen?')) return;
    s.parts.splice(+b.dataset.delpart, 1); persist(); keepY(() => viewEdit(id));
  });
  $('#addPart').onclick = () => { s.parts = s.parts || []; s.parts.push({ name: 'Refrain', lex: '', summary: '', steps: [], tips: '' }); persist(); keepY(() => viewEdit(id)); };
  $('#del').onclick = () => { if (confirm(`„${s.title}“ wirklich löschen?`)) { deleteSong(id); location.hash = '#/'; } };
  app.querySelectorAll('input[name=act]').forEach((r) => r.onchange = () => { s.activeSheet = r.value; persist(); toast('Aktive Version geändert'); });
  app.querySelectorAll('[data-delsheet]').forEach((b) => b.onclick = () => {
    if (!confirm('Diese Version löschen?')) return;
    if (!deleteSheet(s, b.dataset.delsheet)) toast('Die letzte Version kann nicht gelöscht werden.');
    keepY(() => viewEdit(id));
  });
  const openEditor = (text, title) => {
    $('#sheetEditor').innerHTML = `<div class="card stack" style="margin-top:12px"><b>${esc(title)}</b>
      <textarea id="sheetText" spellcheck="false">${esc(text)}</textarea>
      <div class="row"><button class="btn primary" id="saveSheet">Als neue Version speichern</button><button class="btn ghost" id="cancelSheet">Abbrechen</button></div></div>`;
    $('#cancelSheet').onclick = () => { $('#sheetEditor').innerHTML = ''; };
    $('#saveSheet').onclick = () => {
      const t = $('#sheetText').value;
      if (!t.trim()) return;
      addSheet(s, `Bearbeitet ${fmtDate(new Date().toISOString())}`, t, true);
      toast('Neue Version gespeichert und aktiviert'); viewEdit(id);
    };
    $('#sheetText').focus();
  };
  app.querySelectorAll('[data-editsheet]').forEach((b) => b.onclick = () => {
    const v = s.sheets.find((x) => x.id === b.dataset.editsheet);
    openEditor(v.text, `Neue Version auf Basis von „${v.name}“`);
  });
  $('#pasteSheet').onclick = () => openEditor('', 'Leadsheet einfügen (ChordPro oder Text mit Akkorden)');
  const ex = $('#exportSheet');
  if (ex) ex.onclick = () => download(`${fileName(s.title)}.chopro`, toChordPro(s, sheet), 'text/plain');
}

function keepY(fn, keep = true) { const y = window.scrollY; fn(); if (keep) window.scrollTo(0, y); }
const fileName = (t) => t.replace(/[^\wäöüÄÖÜß\- ]/g, '').trim().replace(/\s+/g, '_') || 'song';

/** Baut eine saubere ChordPro-Datei: Kopfdaten aus der App, danach der Inhalt ohne alte Kopfzeilen. */
function toChordPro(s, sheet) {
  const body = sheet.text.replace(/\r\n?/g, '\n').split('\n')
    .filter((l) => !/^\s*\{\s*(title|t|subtitle|st|artist|key|tempo|time)\s*:/i.test(l)).join('\n').trim();
  return [`{title: ${s.title}}`, s.artist ? `{subtitle: ${s.artist}}` : '', s.key ? `{key: ${s.key}}` : '',
    s.bpm ? `{tempo: ${s.bpm}}` : '', s.beats ? `{time: ${s.beats}/4}` : '', '', body, ''].filter((l, i) => l !== '' || i > 4).join('\n');
}

// ---------- Import ----------
function viewImport() {
  const items = ui.importItems;
  shell('songs', `
    <div class="row"><a class="btn ghost" href="#/">◀ Songs</a></div>
    <h1>Leadsheets importieren</h1>
    <p class="muted">ChordPro-Datei (.chopro, .cho, .txt) wählen oder Text einfügen. Mehrere Songs in einer Datei (mit <code>{new_song}</code>) werden erkannt.
      Beim Import wird nichts überschrieben: Jeder Song bekommt eine neue Version „Original-Import“.</p>
    ${items ? importPreview(items) : `
    <div class="card stack">
      <!-- Bewusst ohne accept-Filter: iPad/iOS kennt .chopro nicht als Dateityp und graut solche Dateien sonst aus -->
      <input type="file" id="file">
      <div class="muted small">oder einfügen:</div>
      <textarea id="paste" spellcheck="false" placeholder="{title: …}\n[Am]Text mit [F]Akkorden"></textarea>
      <button class="btn primary" id="analyze">Analysieren</button>
    </div>`}`);
  if (!items) {
    const run = (text) => {
      const songs = splitSongs(text);
      if (!songs.length) { toast('Keine Songs gefunden'); return; }
      ui.importItems = songs.map((x) => {
        const m = matchSong(x.meta.title);
        const a = analyze(x.raw);
        // Leere Einträge (Pause, Zugabe …) standardmäßig nicht als Song anlegen
        return { ...x, target: m ? m.id : 'new', include: !a.empty, a, guessed: x.meta.key ? '' : guessKey(x.raw) };
      });
      viewImport();
    };
    $('#file').onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      f.text().then((t) => {
        // Ohne Dateifilter kann man auch PDFs o. Ä. wählen – die erkennt man an Steuerzeichen
        if (/\u0000|�{3,}/.test(t.slice(0, 4000)) || /^%PDF/.test(t)) {
          toast('Das ist keine Textdatei. Bitte eine ChordPro-Datei (.chopro, .cho, .txt) wählen.');
          e.target.value = '';
          return;
        }
        // Paket oder Sicherung aus dieser App statt ChordPro gewählt → an die richtige Stelle leiten
        if (/^\s*\{\s*"app"\s*:\s*"soultape-stage"/.test(t)) { e.target.value = ''; openPackage(t); return; }
        run(t);
      });
    };
    $('#analyze').onclick = () => { const t = $('#paste').value; if (t.trim()) run(t); };
    return;
  }
  app.querySelectorAll('[data-inc]').forEach((c) => c.onchange = () => { items[+c.dataset.inc].include = c.checked; });
  app.querySelectorAll('[data-target]').forEach((c) => c.onchange = () => { items[+c.dataset.target].target = c.value; });
  $('#cancelImp').onclick = () => { ui.importItems = null; viewImport(); };
  $('#doImp').onclick = () => {
    const stamp = new Date().toLocaleDateString('de-DE');
    let n = 0;
    for (const it of items) {
      if (!it.include) continue;
      let s = it.target === 'new' ? null : getSong(it.target);
      if (!s) {
        s = newSong({ title: it.meta.title || 'Unbenannt', artist: it.meta.artist, key: it.meta.key || it.guessed,
          bpm: it.meta.bpm || null, beats: it.meta.beats && it.meta.beats !== 4 ? it.meta.beats : null,
          kawai: it.meta.kawai.join(' · '), parts: [{ name: 'Ganzer Song', lex: '', summary: '', steps: [], tips: '' }] });
      } else {
        if (!s.key) s.key = it.meta.key || it.guessed;
        if (!s.bpm && it.meta.bpm) s.bpm = it.meta.bpm;
        if (!s.beats && it.meta.beats && it.meta.beats !== 4) s.beats = it.meta.beats;
        if (!s.kawai && it.meta.kawai.length) s.kawai = it.meta.kawai.join(' · ');
        if (!s.artist) s.artist = it.meta.artist;
      }
      addSheet(s, `Original-Import ${stamp}`, it.raw, !activeSheet(s));
      n++;
    }
    persist();
    ui.importItems = null;
    toast(`${n} Leadsheet(s) importiert`);
    location.hash = '#/';
  };
}

function importPreview(items) {
  const opts = (sel) => `<option value="new" ${sel === 'new' ? 'selected' : ''}>➕ Als neuen Song anlegen</option>` +
    sortedSongs().map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.title)}</option>`).join('');
  return `<div class="stack">${items.map((it, i) => `
    <div class="card stack">
      <label class="row"><input type="checkbox" data-inc="${i}" ${it.include ? 'checked' : ''} style="width:22px;height:22px">
        <b style="font-size:18px">${esc(it.meta.title || 'Ohne Titel')}</b> <span class="muted">${esc(it.meta.artist)}</span></label>
      <div class="row small">
        ${it.a.empty ? '<span class="badge">Kein Inhalt – vermutlich Pause/Zugabe einer Setliste (abgewählt)</span>' : ''}
        <span class="badge">Tonart: ${esc(it.meta.key || (it.guessed ? it.guessed + ' (Vorschlag)' : '–'))}</span>
        ${it.meta.bpm ? `<span class="badge">Tempo: ${it.meta.bpm} BPM${it.meta.beats && it.meta.beats !== 4 ? ` · ${it.meta.beats}er-Takt` : ''}</span>` : ''}
        <span class="badge">${it.a.sections} Abschnitte</span>
        <span class="badge">${it.a.triggers} Hinweise</span>
        ${it.meta.kawai.length ? `<span class="badge">Kawai: ${esc(it.meta.kawai.join(' · '))}</span>` : ''}
        ${it.a.review.length ? `<span class="badge warn">Bitte prüfen: ${esc(it.a.review.join(', '))}</span>` : ''}
        ${it.a.usesH ? '<span class="badge warn">enthält H-Akkorde</span>' : ''}
      </div>
      <label class="f"><span>Zuordnen zu</span><select data-target="${i}">${opts(it.target)}</select></label>
    </div>`).join('')}
    <div class="row"><button class="btn primary" id="doImp">Importieren</button><button class="btn ghost" id="cancelImp">Abbrechen</button></div>
  </div>`;
}

// ---------- Songs teilen: kleines Paket für Kollegen ----------
/** Vergleicht zwei Versionsnummern wie '0.1.18' → negativ, 0 oder positiv. */
function cmpVer(a, b) {
  const x = String(a).split('.').map((n) => parseInt(n, 10) || 0), y = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}
const FIELD_LABEL = Object.fromEntries(SHARED_FIELDS);
const noSwitches = (text) => text.replace(/\r\n?/g, '\n').split('\n').filter((l) => switchText(l) === null).join('\n');

/** Öffnet eine Paket-Datei (Text) in der Vorschau. Falsche Dateien → Hinweis. */
function openPackage(text) {
  // Stammt das Paket aus einer neueren App-Version? Dann kann diese Version es evtl. nicht richtig lesen.
  let made = '';
  try { made = String(JSON.parse(text).made || ''); } catch (e) { /* wird unten gemeldet */ }
  const newer = made && cmpVer(made, APP_VERSION) > 0 ? made : '';
  try { ui.pkg = readPackage(text); ui.pkg.newer = newer; ui.pkgSounds = false; } catch (err) {
    if (newer) toast(`Dieses Paket wurde mit Version ${newer} erstellt, auf diesem Gerät läuft ${APP_VERSION}. Bitte die App mit WLAN öffnen, schließen, wieder öffnen – und es dann noch einmal versuchen.`, 9000);
    else toast(err.message || 'Das ist keine Paket-Datei.', 4000);
    return;
  }
  if (location.hash === '#/teilen') viewShare(); else location.hash = '#/teilen';
}

function viewShare() {
  if (ui.pkg) return viewPackage();
  const sh = ui.share || (ui.share = { sel: new Set(), sounds: false, lists: new Set() });
  for (const id of [...sh.sel]) if (!getSong(id)) sh.sel.delete(id);
  for (const id of [...sh.lists]) if (!getList(id)) sh.lists.delete(id);
  const songs = sortedSongs();
  shell('songs', `
    <div class="row"><a class="btn ghost" href="#/">◀ Songs</a></div>
    <h1>Songs teilen</h1>
    <p class="muted">Einzelne Songs und Setlisten als kleines Paket an einen Kollegen schicken – oder ein Paket von einem Kollegen einspielen.
      Beim Einspielen wird nichts überschrieben: Hat der Empfänger den Song schon, kommt das Blatt als zusätzliche Fassung dazu.</p>

    <h2>Band-Paket</h2>
    <div class="card stack">
      <p style="margin:0">Die ganze Songliste (${songs.length} Songs mit Titel, Interpret, Tonart, Dauer${songs.some((s) => s.no) ? ' und Nummer' : ''})
        und alle ${state.lists.length} Setlisten in einer Datei – für die ganze Band.</p>
      <p class="small muted" style="margin:0">Die Kollegen sehen beim Einspielen, was sich bei ihnen ändert, und können einzelne Werte behalten.
        Blätter gehen nur mit, wenn du sie unten anhakst: <b id="shBandSheets"></b>.</p>
      <div class="row"><button class="btn primary" id="shBand">Band-Paket erstellen</button></div>
    </div>

    <h2>Paket erstellen</h2>
    <div class="card stack">
      ${state.lists.length ? `<div><b>Setlisten mitgeben</b> <span class="muted small">(nur die Reihenfolge mit Pausen – jeder behält seine eigenen Blätter)</span>
        <div class="picklist" style="margin-top:8px;max-height:none">${state.lists.map((l) => `
          <label><input type="checkbox" data-picklist="${l.id}" ${sh.lists.has(l.id) ? 'checked' : ''}>
            <span class="t">${esc(l.name)}</span><span class="muted small">${KIND[l.kind] || ''} · ${songItems(l).length} Songs</span>
            <span style="flex:1"></span><button class="btn" data-listsongs="${l.id}" style="padding:6px 10px;font-size:14px">Blätter dieser Liste anhaken</button></label>`).join('')}
        </div></div>` : ''}
      <div><b>Blätter mitgeben</b> <span class="muted small">(für Kollegen, die dein Blatt zu einem Song haben möchten)</span></div>
      <div class="row">
        <button class="btn" id="shAll">Alle</button><button class="btn" id="shNone">Keine</button>
      </div>
      <div class="picklist">${songs.map((s) => `
        <label><input type="checkbox" data-pick="${s.id}" ${sh.sel.has(s.id) ? 'checked' : ''}>
          <span class="t">${esc(s.title)}</span>${noTag(s)}<span class="muted small">${esc(s.artist)}</span>${activeSheet(s) ? '' : '<span class="badge">ohne Blatt</span>'}</label>`).join('')}
      </div>
      <label class="row nord-only" style="flex-wrap:nowrap"><input type="checkbox" id="shSounds" ${sh.sounds ? 'checked' : ''} style="width:22px;height:22px;flex:none">
        <span>Meine Nord-Sounds und Soundwechsel-Balken mitgeben <span class="muted small">(für Kollegen am Keyboard; sonst geht nur das Blatt mit)</span></span></label>
      <div class="row"><b id="shCount"></b></div>
      <div class="row"><button class="btn primary" id="shPack">Paket erstellen</button>
        <button class="btn" id="shCho">Als ChordPro-Datei (für OnSong)</button></div>
      <p class="small muted" style="margin:0">Das Paket ist eine Datei – verschicke sie per AirDrop, Mail oder iCloud. Mitgegeben wird jeweils die aktive Fassung des Blatts.</p>
    </div>

    <h2>Paket einspielen</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Paket-Datei eines Kollegen wählen. Du siehst zuerst eine Vorschau und entscheidest, was übernommen wird.</p>
      <input type="file" id="pkgFile" accept=".json,application/json">
    </div>`);
  const count = () => {
    const n = sh.sel.size, k = sh.lists.size;
    $('#shCount').textContent = `${n} ${n === 1 ? 'Blatt' : 'Blätter'}${k ? ` und ${k} ${k === 1 ? 'Setlist' : 'Setlisten'}` : ''} ausgewählt`;
    $('#shBandSheets').textContent = n ? `${n} ${n === 1 ? 'Blatt' : 'Blätter'} angehakt` : 'keine angehakt';
  };
  count();
  app.querySelectorAll('[data-pick]').forEach((c) => c.onchange = () => { if (c.checked) sh.sel.add(c.dataset.pick); else sh.sel.delete(c.dataset.pick); count(); });
  app.querySelectorAll('[data-picklist]').forEach((c) => c.onchange = () => { if (c.checked) sh.lists.add(c.dataset.picklist); else sh.lists.delete(c.dataset.picklist); count(); });
  app.querySelectorAll('[data-listsongs]').forEach((b) => b.onclick = (e) => {
    e.preventDefault();
    const l = getList(b.dataset.listsongs);
    if (l) { for (const it of songItems(l)) sh.sel.add(it.id); keepY(viewShare); }
  });
  $('#shAll').onclick = () => { sh.sel = new Set(songs.map((s) => s.id)); keepY(viewShare); };
  $('#shNone').onclick = () => { sh.sel = new Set(); keepY(viewShare); };
  $('#shSounds').onchange = (e) => { sh.sounds = e.target.checked; };
  const picked = () => songs.filter((s) => sh.sel.has(s.id));
  const day = new Date().toISOString().slice(0, 10);
  $('#shPack').onclick = () => {
    const list = picked();
    if (!list.length && !sh.lists.size) { toast('Bitte zuerst eine Setlist oder Songs anhaken'); return; }
    const sounds = sh.sounds && shows('nord');
    download(`soultape-paket-${day}.json`, exportPackage(list.map((s) => s.id),
      { sounds, from: profile().name, role: profile().role, textOf: sounds ? (t) => t : noSwitches, lists: [...sh.lists], made: APP_VERSION }), 'application/json');
    toast('Paket erstellt');
  };
  $('#shBand').onclick = () => {
    if (!songs.length) { toast('Noch keine Songs vorhanden'); return; }
    const sounds = sh.sounds && shows('nord');
    download(`soultape-bandpaket-${day}.json`, exportPackage(picked().map((s) => s.id),
      { sounds, from: profile().name, role: profile().role, textOf: sounds ? (t) => t : noSwitches, lists: state.lists.map((l) => l.id),
        bare: songs.map((s) => s.id), band: true, made: APP_VERSION }), 'application/json');
    toast('Band-Paket erstellt');
  };
  $('#shCho').onclick = () => {
    const list = picked().filter(activeSheet);
    if (!list.length) { toast('Keiner der gewählten Songs hat ein Blatt'); return; }
    const parts = list.map((s) => toChordPro(s, { text: noSwitches(activeSheet(s).text) }));
    download(`soultape-songs-${day}.chopro`, parts.join('\n{new_song}\n'));
    toast(`${list.length} ${list.length === 1 ? 'Blatt' : 'Blätter'} als ChordPro gespeichert`);
  };
  $('#pkgFile').onchange = async (e) => { const f = e.target.files[0]; if (f) openPackage(await f.text()); };
}

/** Vorschau eines Pakets: was ist drin, was passiert beim Einspielen. */
function viewPackage() {
  const pkg = ui.pkg;
  const opts = (sel) => `<option value="new" ${sel === 'new' ? 'selected' : ''}>➕ Als neuen Song anlegen</option>` +
    sortedSongs().map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.title)}</option>`).join('');
  const planText = (it) => {
    const p = packagePlan(it, ui.pkgSounds);
    const out = [];
    if (p.isNew) out.push('<span class="badge ok">Neuer Song</span>');
    else if (it.by === 'uid' && it.target === it.target0) out.push('<span class="badge">Sicher erkannt</span>');
    else if (it.by === 'title' && it.target === it.target0) out.push('<span class="badge warn">Über den Titel zugeordnet – bitte prüfen</span>');
    if (p.no === 'set') out.push(`<span class="badge ok">bekommt Nr. ${+it.song.no}</span>`);
    if (p.no === 'taken') out.push(`<span class="badge warn">Nr. ${+it.song.no} gehört bei dir schon zu „${esc(songByNo(it.song.no)?.title || '')}“ – wird nicht übernommen</span>`);
    if (p.no === 'differs') out.push(`<span class="badge warn">Hat bei dir eine andere Nummer (Paket: ${+it.song.no}) – deine bleibt</span>`);
    if (p.sheet === 'add') out.push(`<span class="badge ok">${p.isNew ? 'mit Blatt' : 'Blatt kommt als zusätzliche Fassung dazu'}</span>`);
    if (p.sheet === 'dup') out.push('<span class="badge">Dieses Blatt hast du schon</span>');
    if (p.sheet === 'none' && !pkg.band) out.push('<span class="badge">Kein Blatt im Paket</span>');
    if (p.sounds) out.push('<span class="badge ok">Sounds werden übernommen</span>');
    if (p.fill.length) out.push(`<span class="badge ok">ergänzt: ${p.fill.map((f) => FIELD_LABEL[f]).join(', ')}</span>`);
    if (p.nothing) out.push('<span class="badge warn">Nichts zu tun</span>');
    return out.join('');
  };
  const shown = (f, v) => esc(f === 'durationSec' ? fmtDur(v) : f === 'bpm' ? `${v} BPM` : f === 'beats' ? `${v} pro Takt` : v);
  const diffRows = (it, i, p) => p.diffs.map((d) => `
    <label class="row small" style="flex-wrap:nowrap"><input type="checkbox" data-diff="${i}" data-f="${d.f}" ${it.keep[d.f] ? '' : 'checked'} style="width:20px;height:20px;flex:none">
      <span><b>${d.label}</b> ändern: bei dir „${shown(d.f, d.mine)}“ → aus dem Paket „${shown(d.f, d.theirs)}“${it.keep[d.f] ? ' <span class="muted">(deiner bleibt)</span>' : ''}</span></label>`).join('');
  // Sicher erkannte Songs ohne Änderung werden zusammengefasst, damit ein Band-Paket mit vielen Songs übersichtlich bleibt
  const plans = pkg.items.map((it) => packagePlan(it, ui.pkgSounds));
  const quiet = (it, i) => it.include && plans[i].nothing && !plans[i].diffs.length && it.by === 'uid' && it.target === it.target0;
  const card = (it, i) => `
      <div class="card stack">
        <label class="row"><input type="checkbox" data-inc="${i}" ${it.include ? 'checked' : ''} style="width:22px;height:22px">
          <b style="font-size:18px">${esc(it.song.title)}</b>${+it.song.no ? `<span class="sno" style="margin-left:8px">${+it.song.no}</span>` : ''} <span class="muted">${esc(it.song.artist || '')}</span></label>
        <div class="row small">${planText(it)}</div>
        ${it.include ? diffRows(it, i, plans[i]) : ''}
        <label class="f"><span>Zuordnen zu</span><select data-target="${i}">${opts(it.target)}</select></label>
      </div>`;
  const quietOnes = pkg.items.map((it, i) => (quiet(it, i) ? it : null)).filter(Boolean);
  const nNew = plans.filter((p, i) => pkg.items[i].include && p.isNew).length;
  const nCheck = pkg.items.filter((it, i) => it.include && !plans[i].isNew && it.by === 'title' && it.target === it.target0).length;
  const nDiff = plans.filter((p, i) => pkg.items[i].include && p.diffs.length).length;
  const nSheets = pkg.items.filter((it) => it.song.sheet && it.song.sheet.text).length;
  const listPlanText = (pl) => {
    const p = listPlan(pkg, pl);
    const out = [`<span class="badge">${p.songs} Songs${p.breaks ? `, ${p.breaks} ${p.breaks === 1 ? 'Pause' : 'Pausen'}` : ''}</span>`];
    if (p.same) out.push('<span class="badge warn">Reihenfolge ist schon gleich – nichts zu tun</span>');
    else if (p.update) out.push('<span class="badge ok">Reihenfolge wird aktualisiert – dein bisheriger Stand wird festgehalten</span>');
    else out.push('<span class="badge ok">Neue Liste</span>');
    if (p.fresh) out.push(`<span class="badge">${p.fresh} ${p.fresh === 1 ? 'Song fehlt dir noch und wird' : 'Songs fehlen dir noch und werden'} angelegt</span>`);
    return out.join('');
  };
  shell('songs', `
    <div class="row"><a class="btn ghost" href="#/">◀ Songs</a></div>
    <h1>${pkg.band ? 'Band-Paket' : 'Paket'} einspielen</h1>
    <p class="muted">${pkg.band ? 'Band-Paket' : 'Paket'}${pkg.from ? ` von <b>${esc(pkg.from)}</b>` : ''}${pkg.created ? ` vom ${fmtDate(pkg.created)}` : ''} mit ${[
      pkg.items.length ? `${pkg.items.length} ${pkg.items.length === 1 ? 'Song' : 'Songs'}` : '',
      pkg.lists.length ? `${pkg.lists.length} ${pkg.lists.length === 1 ? 'Setlist' : 'Setlisten'}` : '',
      nSheets ? `${nSheets} ${nSheets === 1 ? 'Blatt' : 'Blättern'}` : ''].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' und $1')}.
      Deine eigenen Blätter bleiben und bleiben aktiv. Weichen Titel, Interpret, Tonart oder Dauer ab, siehst du das unten und kannst deinen Wert behalten.</p>
    ${pkg.newer ? `<div class="notice"><b>Das Paket wurde mit einer neueren Version erstellt</b> (${esc(pkg.newer)}, auf diesem Gerät läuft ${APP_VERSION}). Möglicherweise fehlt hier etwas. Am besten zuerst die App aktualisieren: mit WLAN öffnen, schließen, wieder öffnen – dann das Paket noch einmal einspielen.</div>` : ''}
    ${pkg.lists.length ? `<h2>Setlisten</h2><div class="stack">${pkg.lists.map((pl, i) => `
      <div class="card stack">
        <label class="row"><input type="checkbox" data-linc="${i}" ${pl.include ? 'checked' : ''} style="width:22px;height:22px">
          <b style="font-size:18px">${esc(pl.list.name)}</b> <span class="muted">${KIND[pl.list.kind] || ''}</span></label>
        <div class="row small">${listPlanText(pl)}</div>
        <label class="f"><span>Einspielen als</span><select data-ltarget="${i}">
          <option value="new" ${pl.target === 'new' ? 'selected' : ''}>➕ Neue Liste anlegen</option>
          ${state.lists.map((l) => `<option value="${l.id}" ${l.id === pl.target ? 'selected' : ''}>Vorhandene Liste aktualisieren: ${esc(l.name)}</option>`).join('')}</select></label>
      </div>`).join('')}</div>` : ''}
    ${pkg.items.length && pkg.lists.length ? '<h2>Songs</h2>' : ''}
    ${pkg.items.length > 1 ? `<div class="row small">
      ${nNew ? `<span class="badge ok">${nNew} neu</span>` : ''}
      ${nCheck ? `<span class="badge warn">${nCheck} über den Titel zugeordnet – bitte prüfen</span>` : ''}
      ${nDiff ? `<span class="badge warn">${nDiff} mit abweichenden Angaben</span>` : ''}
      ${quietOnes.length ? `<span class="badge">${quietOnes.length} unverändert</span>` : ''}</div>` : ''}
    ${pkg.sounds ? `<label class="row card" style="flex-wrap:nowrap"><input type="checkbox" id="pkSounds" ${ui.pkgSounds ? 'checked' : ''} style="width:22px;height:22px;flex:none">
      <span>Sounds aus dem Paket übernehmen <span class="muted small">(nur bei Songs, die bei dir noch keinen Sound haben)</span></span></label>` : ''}
    <div class="stack">${pkg.items.map((it, i) => (quiet(it, i) ? '' : card(it, i))).join('')}
      ${quietOnes.length ? `<details class="card"><summary>${quietOnes.length} ${quietOnes.length === 1 ? 'Song' : 'Songs'} sicher erkannt, nichts zu tun</summary>
        <p class="small muted">${quietOnes.map((it) => esc(it.song.title)).join(' · ')}</p></details>` : ''}
      <div class="row"><button class="btn primary" id="pkDo">Einspielen</button><button class="btn ghost" id="pkCancel">Abbrechen</button></div>
    </div>`);
  app.querySelectorAll('[data-inc]').forEach((c) => c.onchange = () => { pkg.items[+c.dataset.inc].include = c.checked; keepY(viewPackage); });
  app.querySelectorAll('[data-target]').forEach((c) => c.onchange = () => { pkg.items[+c.dataset.target].target = c.value; keepY(viewPackage); });
  app.querySelectorAll('[data-diff]').forEach((c) => c.onchange = () => { pkg.items[+c.dataset.diff].keep[c.dataset.f] = !c.checked; keepY(viewPackage); });
  app.querySelectorAll('[data-linc]').forEach((c) => c.onchange = () => { pkg.lists[+c.dataset.linc].include = c.checked; });
  app.querySelectorAll('[data-ltarget]').forEach((c) => c.onchange = () => { pkg.lists[+c.dataset.ltarget].target = c.value; keepY(viewPackage); });
  const ps = $('#pkSounds'); if (ps) ps.onchange = () => { ui.pkgSounds = ps.checked; keepY(viewPackage); };
  $('#pkCancel').onclick = () => { ui.pkg = null; viewShare(); };
  $('#pkDo').onclick = () => {
    const r = applyPackage(pkg, { sounds: ui.pkgSounds });
    ui.pkg = null;
    if (!lastSaveOk()) toast('Speichern fehlgeschlagen – Speicher voll?');
    else {
      const parts = [];
      if (r.listsNew) parts.push(`${r.listsNew} ${r.listsNew === 1 ? 'Liste' : 'Listen'} angelegt`);
      if (r.listsUpdated) parts.push(`${r.listsUpdated} ${r.listsUpdated === 1 ? 'Liste' : 'Listen'} aktualisiert`);
      if (r.created) parts.push(`${r.created} ${r.created === 1 ? 'Song' : 'Songs'} neu angelegt`);
      if (r.changed) parts.push(`${r.changed} ${r.changed === 1 ? 'Song' : 'Songs'} angepasst`);
      if (r.added) parts.push(`${r.added} ${r.added === 1 ? 'Blatt' : 'Blätter'} dazugekommen`);
      if (r.soundsSet) parts.push(`${r.soundsSet}× Sounds übernommen`);
      toast(parts.join(', ') || 'Nichts zu tun – alles war schon vorhanden');
    }
    location.hash = r.listsNew || r.listsUpdated ? '#/listen' : '#/';
  };
}

// ---------- Setlisten und Probenlisten ----------
const KIND ={ gig: 'Auftritt', probe: 'Probe' };
const today = () => new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const songItems = (l) => l.items.filter((it) => it.type === 'song' && getSong(it.id));

/** Teilt eine Liste an den Pausen in Sets: [{ name, songs: [Song], sec, noDur }] */
function setsOf(l) {
  const sets = [{ name: '', songs: [] }];
  for (const it of l.items) {
    if (it.type === 'break') sets.push({ name: it.name, songs: [] });
    else { const s = getSong(it.id); if (s) sets[sets.length - 1].songs.push(s); }
  }
  return sets.filter((x) => x.songs.length).map((x) => ({ ...x,
    sec: x.songs.reduce((n, s) => n + (s.durationSec || 0), 0), noDur: x.songs.filter((s) => !s.durationSec).length }));
}
const durText = (sec, noDur) => (sec ? fmtDur(sec) : '') + (noDur ? `${sec ? ' + ' : ''}${noDur} ohne Dauer` : '') || '–';

/** Wo steht der Song in der gerade gespielten Liste? Liefert Vorgänger/Nachfolger oder null. */
function listContext(songId) {
  const nav = state.settings.navList;
  const l = nav && getList(nav.id);
  if (!l) return null;
  const isSong = (it) => it && it.type === 'song' && getSong(it.id);
  let pos = isSong(l.items[nav.pos]) && l.items[nav.pos].id === songId ? nav.pos : l.items.findIndex((it) => isSong(it) && it.id === songId);
  if (pos < 0) return null;
  let prevPos = pos - 1; while (prevPos >= 0 && !isSong(l.items[prevPos])) prevPos--;
  let nextPos = pos + 1, breakBefore = '';
  while (nextPos < l.items.length && !isSong(l.items[nextPos])) { if (l.items[nextPos].type === 'break') breakBefore = l.items[nextPos].name || 'Pause'; nextPos++; }
  const before = l.items.slice(0, pos + 1);
  return {
    list: l, pos,
    prev: prevPos >= 0 ? getSong(l.items[prevPos].id) : null, prevPos,
    next: nextPos < l.items.length ? getSong(l.items[nextPos].id) : null, nextPos,
    breakBefore: nextPos < l.items.length ? breakBefore : '',
    songNo: before.filter(isSong).length, songCount: songItems(l).length,
    setNo: before.filter((it) => it.type === 'break').length + 1, setCount: l.items.filter((it) => it.type === 'break').length + 1,
  };
}

function viewLists() {
  const lists = [...state.lists].sort((a, b) => (b.date || b.created).localeCompare(a.date || a.created));
  const card = (l) => {
    const sets = setsOf(l), n = songItems(l).length;
    const sec = sets.reduce((a, x) => a + x.sec, 0), noDur = sets.reduce((a, x) => a + x.noDur, 0);
    return `<li><a href="#/liste/${l.id}">
      <div><div class="t">${esc(l.name)}</div>
        <div class="a">${KIND[l.kind] || 'Liste'}${l.date ? ' · ' + new Date(l.date).toLocaleDateString('de-DE') : ''} · ${n} Songs${l.kind === 'gig' && sets.length > 1 ? ` · ${sets.length} Sets` : ''}</div></div>
      <div class="k">${durText(sec, noDur)}${(l.snapshots || []).length ? `<br>${l.snapshots.length} Stand/Stände` : ''}</div></a></li>`;
  };
  shell('lists', `
    <div class="row" style="margin-bottom:12px">
      <h1 style="margin:0;flex:1">Setlisten</h1>
      <button class="btn primary prep-only" id="newGig">+ Auftritt</button>
      <button class="btn prep-only" id="newProbe">+ Probe</button>
      <!-- ohne accept-Filter, siehe Import: iOS graut .chopro sonst aus -->
      <label class="btn prep-only">Aus Setlisten-Datei übernehmen<input type="file" id="listFile" hidden></label>
    </div>
    <ul class="songs">${lists.map(card).join('')}</ul>
    ${lists.length ? '' : `<p class="muted">Noch keine Liste. <span class="prep-only">Lege einen Auftritt oder eine Probenliste an – oder übernimm die Reihenfolge aus einer Setlisten-Datei (z. B. aus OnSong). Dabei werden nur Titel und Reihenfolge gelesen; die Songs müssen schon in der App sein.</span></p>`}`);
  const mk = (kind, name) => { const l = newList(kind, name); location.hash = `#/liste/${l.id}`; };
  $('#newGig').onclick = () => mk('gig', `Auftritt ${today()}`);
  $('#newProbe').onclick = () => mk('probe', `Probe ${today()}`);
  $('#listFile').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const text = await f.text();
    if (/\u0000/.test(text.slice(0, 4000)) || /^%PDF/.test(text)) { toast('Das ist keine Textdatei.'); return; }
    const items = [], missing = [];
    for (const x of splitSongs(text)) {
      const title = (x.meta.title || '').trim();
      if (!title) continue;
      // Leere Einträge wie „Pause 😃“ oder „Zugabe“ trennen die Sets
      if (analyze(x.raw).empty) { items.push({ type: 'break', name: title.replace(/[^\p{L}\p{N} .-]/gu, '').trim() || 'Pause' }); continue; }
      const s = matchSong(title);
      if (s) items.push({ type: 'song', id: s.id }); else missing.push(title);
    }
    if (!items.some((it) => it.type === 'song')) { toast('Keine bekannten Songs in der Datei gefunden'); return; }
    const l = newList('gig', f.name.replace(/\.[^.]+$/, '').normalize('NFC'), items);
    l.missing = missing; persist();
    location.hash = `#/liste/${l.id}`;
  };
}

function viewList(id) {
  const l = getList(id);
  if (!l) { location.hash = '#/listen'; return; }
  const gig = l.kind === 'gig';
  const sets = setsOf(l);
  const total = sets.reduce((a, x) => a + x.sec, 0), totalNo = sets.reduce((a, x) => a + x.noDur, 0);
  const inList = new Set(songItems(l).map((it) => it.id));
  const q = (ui.listSearch || '').toLowerCase();
  const pick = sortedSongs().filter((s) => !inList.has(s.id) && (!q || hay(s).includes(q)));
  const edit = `<span class="ed prep-only"><button class="btn ghost" data-up>▲</button><button class="btn ghost" data-down>▼</button><button class="btn ghost danger" data-rm>✕</button></span>`;
  let setNo = 0, songNo = 0;
  const setHead = (name) => {
    const st = sets[setNo++];
    // Nach einer „Zugabe“ heißt der Block so, sonst wird durchgezählt
    return gig && st ? `<div class="sethead">${name ? esc(name) : `Set ${setNo}`} <span class="muted">· ${st.songs.length} ${st.songs.length === 1 ? 'Song' : 'Songs'} · ${durText(st.sec, st.noDur)}</span></div>` : '';
  };
  // Eine Set-Überschrift steht nur vor einem Song (zwei Pausen hintereinander ergeben kein leeres Set)
  const isSongAt = (i) => { const it = l.items[i]; return !!(it && it.type === 'song' && getSong(it.id)); };
  const head0 = isSongAt(0) ? setHead('') : '';
  const rows = l.items.map((it, i) => {
    if (it.type === 'break') {
      return `<div class="lrow brk" data-i="${i}"><span class="drag prep-only">≡</span><span class="pz">⏸</span>
        <input type="text" class="prep-only" data-brk="${i}" value="${esc(it.name)}" placeholder="Pause"><b class="stage-only">${esc(it.name || 'Pause')}</b>${edit}</div>${isSongAt(i + 1) ? setHead(!it.name || /pause/i.test(it.name) ? '' : it.name) : ''}`;
    }
    const s = getSong(it.id);
    if (!s) return '';
    songNo++;
    return `<div class="lrow" data-i="${i}"><span class="drag prep-only">≡</span><span class="no">${songNo}</span>
      <a class="lt" href="#/song/${s.id}" data-open="${i}"><span class="t">${esc(s.title)}${noTag(s)}</span><span class="a">${esc(s.artist)}</span></a>
      <span class="meta"><b>${esc(transposeKey(s.key, s.transpose || 0, notation()))}</b>${s.nordSlot ? `<span class="badge slot">${esc(s.nordSlot)}</span>` : ''}${s.durationSec ? fmtDur(s.durationSec) : ''}</span>${edit}</div>`;
  }).join('');

  shell('lists', `
    <div class="row"><a class="btn ghost" href="#/listen">◀ Setlisten</a><span style="flex:1"></span>
      <button class="btn danger prep-only" id="delList">Liste löschen</button></div>
    <div class="prep-only card stack" style="margin-top:12px">
      <div class="grid2">
        <label class="f"><span>Name</span><input type="text" id="l-name" value="${esc(l.name)}"></label>
        <label class="f"><span>Datum (optional)</span><input type="date" id="l-date" value="${esc(l.date || '')}"></label>
      </div>
      <div class="row"><span class="chip ${gig ? 'on' : ''}" data-kind="gig">Auftritt (mit Sets und Pausen)</span><span class="chip ${gig ? '' : 'on'}" data-kind="probe">Probe</span></div>
    </div>
    <h1 class="stage-only">${esc(l.name)}</h1>
    <div class="row" style="margin:14px 0 6px">
      <b>${songItems(l).length} Songs · ${durText(total, totalNo)}</b><span style="flex:1"></span>
      ${songItems(l).length ? '<button class="btn primary" id="startList">▶ Ab dem ersten Song</button>' : ''}
    </div>
    ${l.missing && l.missing.length ? `<div class="notice small prep-only">Nicht in der App gefunden und deshalb ausgelassen: ${esc(l.missing.join(', '))}. <button class="btn ghost" id="missOk">Hinweis ausblenden</button></div>` : ''}
    <div class="listrows" id="rows">${head0}${rows}</div>
    ${l.items.length ? '' : '<p class="muted">Die Liste ist noch leer. Füge unten Songs hinzu.</p>'}

    <div class="prep-only">
      <h2>Hinzufügen</h2>
      <div class="card stack">
        <div class="row"><input type="search" id="l-q" placeholder="Song suchen …" value="${esc(ui.listSearch || '')}" style="flex:1;min-width:200px">
          ${gig ? '<button class="btn" id="addBreak">+ Pause</button>' : ''}</div>
        <div class="row">${pick.map((s) => `<span class="chip" data-add="${s.id}">+ ${esc(s.title)}</span>`).join('') || '<span class="muted small">Kein weiterer Song gefunden.</span>'}</div>
      </div>

      <h2>Stand festhalten</h2>
      <div class="card stack">
        <p class="small muted" style="margin:0">Speichert die Reihenfolge von jetzt als Kopie, z. B. am Ende einer Probe. Ohne Namen wird Datum und Uhrzeit verwendet. Du arbeitest danach normal weiter und kannst jeden Stand zurückholen.</p>
        <div class="row"><input type="text" id="snapName" placeholder="Stand ${esc(fmtDate(new Date().toISOString()))}" style="flex:1;min-width:200px">
          <button class="btn primary" id="snapBtn">Stand festhalten</button></div>
        ${(l.snapshots || []).map((x) => `
          <div class="snap"><div style="flex:1"><b>${esc(x.name)}</b><div class="small muted">${fmtDate(x.created)} · ${x.items.filter((it) => it.type === 'song' && getSong(it.id)).length} Songs</div>
            ${ui.snapOpen === x.id ? `<ol class="small">${x.items.map((it) => (it.type === 'break' ? `<li class="muted" style="list-style:none">⏸ ${esc(it.name || 'Pause')}</li>` : (getSong(it.id) ? `<li>${esc(getSong(it.id).title)}</li>` : ''))).join('')}</ol>` : ''}</div>
            <button class="btn ghost" data-snapshow="${x.id}">${ui.snapOpen === x.id ? 'Zuklappen' : 'Ansehen'}</button>
            <button class="btn" data-snapback="${x.id}">Zurückholen</button>
            <button class="btn ghost danger" data-snapdel="${x.id}">✕</button></div>`).join('')}
      </div>
    </div>`);

  const redraw = () => keepY(() => viewList(id));
  const change = (fn) => { fn(); persist(); redraw(); };
  const move = (from, to) => { if (to < 0 || to >= l.items.length || from === to) return; const [x] = l.items.splice(from, 1); l.items.splice(to, 0, x); };
  // Song aus der Liste öffnen → ◀/▶ folgt ab jetzt dieser Liste
  const openAt = (pos) => { state.settings.navList = { id: l.id, pos }; persist(); };
  app.querySelectorAll('[data-open]').forEach((a) => a.addEventListener('click', () => openAt(+a.dataset.open)));
  const start = $('#startList');
  if (start) start.onclick = () => { const pos = l.items.findIndex((it) => it.type === 'song' && getSong(it.id)); openAt(pos); location.hash = `#/song/${l.items[pos].id}`; };

  app.querySelectorAll('.lrow').forEach((row) => {
    const i = +row.dataset.i;
    const b = (sel, fn) => { const el = $(sel, row); if (el) el.onclick = fn; };
    b('[data-up]', () => change(() => move(i, i - 1)));
    b('[data-down]', () => change(() => move(i, i + 1)));
    b('[data-rm]', () => change(() => l.items.splice(i, 1)));
  });
  app.querySelectorAll('[data-brk]').forEach((el) => el.onchange = () => change(() => { l.items[+el.dataset.brk].name = el.value.trim(); }));
  enableDrag($('#rows'), (from, to) => change(() => move(from, to)));

  $('#l-name').onchange = (e) => { l.name = e.target.value.trim() || l.name; persist(); };
  $('#l-date').onchange = (e) => { l.date = e.target.value; persist(); };
  app.querySelectorAll('[data-kind]').forEach((c) => c.onclick = () => change(() => { l.kind = c.dataset.kind; }));
  $('#delList').onclick = () => { if (confirm(`Liste „${l.name}“ mit allen festgehaltenen Ständen löschen? Die Songs selbst bleiben erhalten.`)) { deleteList(id); location.hash = '#/listen'; } };
  const mo = $('#missOk'); if (mo) mo.onclick = () => change(() => { l.missing = []; });

  const qi = $('#l-q');
  qi.oninput = () => { ui.listSearch = qi.value; const pos = qi.selectionStart; redraw(); const n = $('#l-q'); n.focus(); n.setSelectionRange(pos, pos); };
  app.querySelectorAll('[data-add]').forEach((c) => c.onclick = () => change(() => l.items.push({ type: 'song', id: c.dataset.add })));
  const ab = $('#addBreak'); if (ab) ab.onclick = () => change(() => l.items.push({ type: 'break', name: 'Pause' }));

  $('#snapBtn').onclick = () => {
    const name = $('#snapName').value.trim() || `Stand ${fmtDate(new Date().toISOString())}`;
    snapshotList(l, name); toast(`Festgehalten: ${name}`); redraw();
  };
  app.querySelectorAll('[data-snapshow]').forEach((b) => b.onclick = () => { ui.snapOpen = ui.snapOpen === b.dataset.snapshow ? null : b.dataset.snapshow; redraw(); });
  app.querySelectorAll('[data-snapback]').forEach((b) => b.onclick = () => {
    // Ohne Rückfrage, aber ohne Verlust: der jetzige Stand wird vorher automatisch festgehalten
    snapshotList(l, `Vor dem Zurückholen ${fmtDate(new Date().toISOString())}`);
    restoreSnapshot(l, b.dataset.snapback); toast('Stand zurückgeholt – der vorherige wurde festgehalten'); redraw();
  });
  app.querySelectorAll('[data-snapdel]').forEach((b) => b.onclick = () => {
    if (!confirm('Diesen festgehaltenen Stand löschen?')) return;
    change(() => { l.snapshots = l.snapshots.filter((x) => x.id !== b.dataset.snapdel); });
  });
}

/** Zeilen am Griff ≡ mit dem Finger verschieben. onDrop(from, to) bekommt die Positionen in der Liste. */
function enableDrag(box, onDrop) {
  box.querySelectorAll('.drag').forEach((h) => {
    h.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const row = h.closest('.lrow');
      const rows = [...box.querySelectorAll('.lrow')];
      const from = rows.indexOf(row);
      let ins = from;
      h.setPointerCapture(e.pointerId);
      row.classList.add('dragging');
      const clear = () => rows.forEach((r) => r.classList.remove('drop-before', 'drop-after'));
      const onMove = (ev) => {
        ins = rows.length;
        for (let k = 0; k < rows.length; k++) { const b = rows[k].getBoundingClientRect(); if (ev.clientY < b.top + b.height / 2) { ins = k; break; } }
        clear();
        if (ins < rows.length) rows[ins].classList.add('drop-before'); else rows[rows.length - 1].classList.add('drop-after');
        if (ev.clientY < 90) window.scrollBy(0, -14); else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
      };
      const onUp = () => {
        h.removeEventListener('pointermove', onMove); h.removeEventListener('pointerup', onUp); h.removeEventListener('pointercancel', onUp);
        row.classList.remove('dragging'); clear();
        const to = ins > from ? ins - 1 : ins;
        if (to !== from) onDrop(+rows[from].dataset.i, +rows[Math.min(to, rows.length - 1)].dataset.i);
      };
      h.addEventListener('pointermove', onMove); h.addEventListener('pointerup', onUp); h.addEventListener('pointercancel', onUp);
    });
  });
}

// ---------- Lexikon ----------
function viewLexikon(focusId) {
  shell('lex', `
    <h1>Sound-Lexikon</h1>
    <p class="muted">Die wichtigsten Keyboard-Klänge im Rock/Pop – und wo du sie auf dem Electro 7 findest.</p>
    <div class="lex">${LEXICON.map((l) => `
      <div class="card stack" id="lex-${l.id}" ${l.id === focusId ? 'style="border-color:var(--trigger-bg)"' : ''}>
        <h3>${esc(l.name)}</h3>
        <div>${esc(l.text)}</div>
        <div class="small muted">Beispiele: ${l.examples.map(esc).join(' · ')}</div>
        <div class="small"><b>Am Nord:</b> ${esc(SECTIONS[l.section].name)}-Sektion, Kategorie „${esc(l.cat)}“</div>
        ${(l.nord || []).length ? `<div class="small"><b>Auf deinem Nord installiert:</b><br>${l.nord.map(esc).join('<br>')}</div>` : ''}
        <div class="small">💡 ${esc(l.tip)}</div>
        ${renderPanel(l.section, { c: l.section === 'organ' ? 'org-model' : l.section === 'piano' ? 'pno-library' : 'syn-library', sel: l.section === 'organ' ? (l.cat === 'B3' ? 'B3' : 'VOX') : undefined })}
      </div>`).join('')}</div>`);
  if (focusId) { const el = $('#lex-' + focusId); if (el) el.scrollIntoView({ block: 'start' }); }
}

// ---------- Einstellungen ----------
function viewSettings() {
  const st = state.settings;
  const bk = backupStatus();
  const prev = previousInfo();
  shell('set', `
    <h1>Einstellungen</h1>
    <h2 style="margin-top:0">Mein Profil</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Wer nutzt die App auf diesem Gerät? Die Rolle stellt ein, was angezeigt wird. Darunter kannst du jeden Punkt einzeln an- und ausschalten.</p>
      <label class="f"><span>Name</span><input type="text" id="set-name" value="${esc(profile().name)}" placeholder="Vorname"></label>
      <div><b>Rolle</b><div class="row" style="margin-top:6px">
        ${Object.entries(ROLES).map(([k, r]) => `<span class="chip ${profile().role === k ? 'on' : ''}" data-role="${k}">${r.name}</span>`).join('')}</div></div>
      <div><b>Anzeigen</b><div class="row" style="margin-top:6px">
        ${Object.entries(SHOW).map(([k, name]) => `<span class="chip ${shows(k) ? 'on' : ''}" data-show="${k}">${shows(k) ? '✓ ' : ''}${name}</span>`).join('')}</div></div>
    </div>

    <h2>Darstellung</h2>
    <div class="card stack">
      <div><b>Akkord-Schreibweise</b><div class="row" style="margin-top:6px">
        <span class="chip ${st.notation === 'de' ? 'on' : ''}" data-not="de">Deutsch (H, B = Bb)</span>
        <span class="chip ${st.notation === 'en' ? 'on' : ''}" data-not="en">Englisch (B, Bb)</span></div></div>
      <div><b>Ansicht</b> <span class="muted small">(Handy: schmale Leisten, großer Text, nächster Song immer oben erreichbar)</span><div class="row" style="margin-top:6px">
        ${Object.entries(LAYOUTS).map(([k, name]) => `<span class="chip ${(st.layout || 'auto') === k ? 'on' : ''}" data-layout="${k}">${name}</span>`).join('')}</div>
        <div class="small muted" style="margin-top:4px">Automatisch: Auf einem Handy hochkant erscheint die Handy-Ansicht, auf Tablet und PC die volle Ansicht. Gerade aktiv: ${isPhone() ? 'Handy' : 'Tablet'}.</div></div>
      <div><b>Blättern beim Tippen</b> <span class="muted small">(wie schnell das Leadsheet weiterläuft)</span><div class="row" style="margin-top:6px">
        ${Object.entries(PAGE_SPEEDS).map(([ms, name]) => `<span class="chip ${(st.pageMs || 1400) === +ms ? 'on' : ''}" data-page="${ms}">${name}</span>`).join('')}</div></div>
      <div><b>Schriftgröße Leadsheet:</b> ${st.fontSize}px <span class="muted small">(in der Song-Ansicht mit A−/A+ änderbar)</span></div>
    </div>

    <h2>Metronom</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Ein Ball pendelt im Songtempo hin und her, jede Umkehr ist ein Schlag. Dafür braucht der Song ein Tempo (unter „Bearbeiten“ oder aus <code>{tempo: …}</code> in der ChordPro-Datei). In der Song-Ansicht schaltet der Knopf ♩ das Metronom ein und aus. <b>Tippen auf die Leiste</b> setzt den Schlag neu: Tippe auf einen Schlag der Band, und der Ball läuft ab da mit ihr – mit hervorgehobener Eins tippst du auf die Eins.</p>
      <div class="row">
        <span class="chip ${shows('metro') ? 'on' : ''}" data-show="metro">${shows('metro') ? '✓ ' : ''}In der Song-Ansicht anzeigen</span>
        <span class="chip ${metroCfg().accent ? 'on' : ''}" data-metro="accent">${metroCfg().accent ? '✓ ' : ''}Eins hervorheben</span>
        <span class="chip ${metroCfg().click ? 'on' : ''}" data-metro="click">${metroCfg().click ? '✓ ' : ''}Klick hörbar</span>
      </div>
      <div><b>Position der Leiste</b><div class="row" style="margin-top:6px">
        <span class="chip ${!metroCfg().bottom ? 'on' : ''}" data-mpos="top">Oben (unter den Knöpfen)</span>
        <span class="chip ${metroCfg().bottom ? 'on' : ''}" data-mpos="bottom">Unten am Bildschirm</span></div></div>
      <div class="small muted">${state.songs.filter((x) => x.bpm).length} von ${state.songs.length} Songs haben ein Tempo.</div>
    </div>

    <h2>Songnummern</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Jeder Song kann eine feste Nummer bekommen, die ihr euch in der Probe zurufen könnt („die 12“). Damit keine Nummer doppelt vergeben wird, sollte <b>nur eine Person</b> in der Band Nummern vergeben – alle anderen bekommen sie über „Songs teilen“ mit dem Paket. Eine vergebene Nummer bleibt bei ihrem Song und wird nicht neu vergeben.</p>
      <div class="small muted">${state.songs.filter((x) => x.no).length} von ${state.songs.length} Songs haben eine Nummer${st.numbering ? ' · neue Songs bekommen auf diesem Gerät automatisch die nächste freie Nummer' : ''}</div>
      <div class="row"><button class="btn" id="numAll">Allen Songs ohne Nummer eine Nummer geben</button></div>
    </div>

    <h2 class="nord-only">Mein Nord – Lautstärke</h2>
    <div class="card stack nord-only">
      <p class="small muted" style="margin:0">Der MASTER LEVEL-Regler wird nicht im Programm gespeichert – es gilt immer die Stellung des Knopfs. Deshalb: einmal festlegen, markieren und nicht mehr anfassen. Der Mischer stellt seinen Eingang einmal auf den Referenz-Sound ein. Die Lautstärke pro Song regelst du über die LEVEL-Regler von Piano, Orgel und Synth (die werden gespeichert) und vergleichst jedes Programm vor dem Speichern mit dem Referenz-Sound.</p>
      <div class="grid2">
        <label class="f"><span>Feste Master-Stellung (z. B. 3 Uhr)</span><input type="text" id="set-master" value="${esc(st.nordMaster || '')}" placeholder="3 Uhr"></label>
        <label class="f"><span>Referenz-Sound (Programm zum Vergleichen)</span><input type="text" id="set-ref" value="${esc(st.nordRef || '')}" placeholder="z. B. White Grand, kräftig gespielt"></label>
      </div>
      <div class="small muted">Abgeglichen: ${state.songs.filter((x) => x.levelOk).length} von ${state.songs.length} Songs</div>
    </div>

    <h2>Sicherung & Übertragung</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Deine Daten liegen nur auf diesem Gerät. Zum Übertragen vom PC aufs iPad: hier exportieren, Datei aufs iPad bringen (z. B. per Mail oder iCloud) und dort importieren.</p>
      <div class="bkline"><i class="bk bk-${bk.level}"></i><span>${esc(backupText(bk))}</span></div>
      <p class="small muted" style="margin:0">Grün = alles gesichert · Gelb = es gibt neue Änderungen · Rot = seit ${BACKUP_DUE_DAYS} Tagen ungesichert. Die Sicherungsdatei am besten in iCloud Drive ablegen – liegt sie nur auf dem iPad, hilft sie nicht, wenn das iPad ausfällt.</p>
      <div class="small muted" id="persistInfo"></div>
      <div class="row"><button class="btn primary" id="exp">Backup exportieren</button>
        <label class="btn">Backup importieren<input type="file" id="imp" accept=".json,application/json" hidden></label>
        <button class="btn" id="expCho">Alle Leadsheets als ChordPro</button></div>
      ${prev ? `<div class="prevbox"><div><b>Beiseitegelegter Stand vom ${fmtDate(prev.saved)}</b><div class="small muted">${prev.songs} Songs, ${prev.lists} ${prev.lists === 1 ? 'Liste' : 'Listen'} – so sah dieses Gerät aus, bevor zuletzt eine Sicherung eingespielt oder ein Stand zurückgeholt wurde.</div></div><button class="btn" id="undoImp">Diesen Stand zurückholen</button></div>` : ''}
      ${lastSaveOk() ? '' : '<div class="notice">Achtung: Das letzte Speichern ist fehlgeschlagen.</div>'}
    </div>

    <h2>Startdaten</h2>
    <div class="card stack">
      <p class="small muted" style="margin:0">Fehlende Start-Songs wieder ergänzen und Soundvorschläge für Songs nachtragen, die noch keinen haben. Optional die Soundvorschläge der Start-Songs auf den Auslieferungsstand zurücksetzen (Leadsheets bleiben erhalten).</p>
      <div class="row"><button class="btn" id="seedAdd">Fehlende Start-Songs ergänzen</button><button class="btn danger" id="seedReset">Soundvorschläge zurücksetzen</button></div>
    </div>

    <h2>KI-Unterstützung</h2>
    <div class="card"><span class="muted">Kommt in Version 0.2: Soundvorschläge für neue Songs, Aufräumen von Leadsheets, Setlist-Vorschläge. Dafür wird ein API-Schlüssel benötigt.</span></div>

    <h2>Auf dem iPad installieren</h2>
    <div class="card small">In Safari diese Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“. Danach startet die App wie eine normale App und funktioniert auch ohne Internet.
      Für die Bühne zusätzlich: Fokus „Nicht stören“ einschalten.</div>

    <p class="small muted" style="margin-top:24px">SoulTape Stage · Version ${APP_VERSION}</p>`);
  $('#set-name').onchange = (e) => { st.profile = { ...profile(), name: e.target.value.trim() }; persist(); };
  app.querySelectorAll('[data-role]').forEach((c) => c.onclick = () => {
    st.profile = { ...profile(), role: c.dataset.role };
    st.show = { ...ROLES[c.dataset.role].show };
    persist(); viewSettings();
  });
  app.querySelectorAll('[data-show]').forEach((c) => c.onclick = () => {
    st.show = { ...(st.show || {}), [c.dataset.show]: !shows(c.dataset.show) };
    persist(); viewSettings();
  });
  app.querySelectorAll('[data-not]').forEach((c) => c.onclick = () => { st.notation = c.dataset.not; persist(); viewSettings(); });
  app.querySelectorAll('[data-page]').forEach((c) => c.onclick = () => { st.pageMs = +c.dataset.page; persist(); viewSettings(); });
  app.querySelectorAll('[data-layout]').forEach((c) => c.onclick = () => { st.layout = c.dataset.layout; persist(); keepY(viewSettings); });
  app.querySelectorAll('[data-metro]').forEach((c) => c.onclick = () => { const k = c.dataset.metro; st.metro = { ...metroCfg(), [k]: !metroCfg()[k] }; persist(); keepY(viewSettings); });
  app.querySelectorAll('[data-mpos]').forEach((c) => c.onclick = () => { st.metro = { ...metroCfg(), bottom: c.dataset.mpos === 'bottom' }; persist(); keepY(viewSettings); });
  $('#numAll').onclick = () => {
    const open = state.songs.filter((x) => !x.no).length;
    if (!open) { toast('Alle Songs haben schon eine Nummer'); return; }
    if (!confirm(`${open} Songs bekommen eine Nummer (alphabetisch, ab ${nextNo()}). Neue Songs werden auf diesem Gerät künftig automatisch nummeriert. Nur fortfahren, wenn du die Nummern für die Band vergibst.`)) return;
    const n = numberAllSongs();
    if (!lastSaveOk()) toast('Speichern fehlgeschlagen – bitte Backup exportieren.'); else toast(`${n} Songs nummeriert`);
    viewSettings();
  };
  $('#set-master').onchange = (e) => { st.nordMaster = e.target.value.trim(); persist(); };
  $('#set-ref').onchange = (e) => { st.nordRef = e.target.value.trim(); persist(); };
  $('#exp').onclick = () => {
    download(`soultape-backup-${new Date().toISOString().slice(0, 10)}.json`, exportBackup(), 'application/json');
    markBackupDone();
    // Bei der Gelegenheit den Browser bitten, die Daten dauerhaft zu behalten (kein Dialog in Safari)
    try { navigator.storage?.persist?.().catch(() => {}); } catch (e) { /* nicht unterstützt */ }
    setTimeout(viewSettings, 600);
  };
  try {
    navigator.storage?.persisted?.().then((ok) => {
      const el = $('#persistInfo');
      if (el && ok) el.textContent = 'Der Browser hat zugesagt, die Daten auf diesem Gerät dauerhaft zu behalten.';
    }).catch(() => {});
  } catch (e) { /* nicht unterstützt */ }
  $('#imp').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (!confirm('Backup importieren? Die Daten auf diesem Gerät werden durch die Sicherung ersetzt. Der jetzige Stand wird beiseitegelegt und lässt sich hier zurückholen.')) return;
    try {
      const r = importBackup(await f.text());
      toast(!lastSaveOk() ? 'Speichern fehlgeschlagen – Speicher voll?'
        : (r.kept ? 'Backup importiert – bisheriger Stand beiseitegelegt' : 'Backup importiert (bisheriger Stand konnte nicht beiseitegelegt werden)')
          + (r.ownProfile ? '. Die Sicherung stammt von jemand anderem – dein Profil bleibt.' : ''), r.ownProfile ? 6000 : 2200);
      route();
    } catch (err) { toast(err.message || 'Import fehlgeschlagen'); }
  };
  const undo = $('#undoImp');
  if (undo) undo.onclick = () => {
    if (!confirm(`Stand vom ${fmtDate(prev.saved)} zurückholen? Der jetzige Stand wird dafür beiseitegelegt – du kannst also wieder zurück.`)) return;
    toast(restorePrevious() ? 'Stand zurückgeholt' : 'Zurückholen fehlgeschlagen');
    route();
  };
  $('#expCho').onclick = () => {
    const parts = sortedSongs().filter(activeSheet).map((s) => toChordPro(s, activeSheet(s)));
    if (!parts.length) { toast('Noch keine Leadsheets vorhanden'); return; }
    download(`soultape-leadsheets-${new Date().toISOString().slice(0, 10)}.chopro`, parts.join('\n{new_song}\n'));
  };
  $('#seedAdd').onclick = () => { const r = refreshSeeds(); toast(`${r.added} Song(s) ergänzt, ${r.filled} Soundvorschlag/-vorschläge nachgetragen`); };
  $('#seedReset').onclick = () => { if (confirm('Soundvorschläge der Start-Songs zurücksetzen? Eigene Änderungen an diesen Sounds gehen verloren.')) { const r = refreshSeeds({ overwriteSounds: true }); toast(`${r.updated} Song(s) zurückgesetzt`); } };
}

// ---------- Router ----------
function route() {
  const h = location.hash || '#/';
  const [, view, arg] = h.split('/');
  if (view !== 'song') { keepAwake(false); stopMetro(); document.body.classList.remove('metro-bottom'); }
  if (view !== 'teilen') ui.pkg = null;
  if (view === 'song' && arg) return viewSong(arg);
  if (view === 'bearbeiten' && arg) return viewEdit(arg);
  if (view === 'import') return viewImport();
  if (view === 'teilen') return viewShare();
  if (view === 'listen') return viewLists();
  if (view === 'liste' && arg) return viewList(arg);
  if (view === 'lexikon') return viewLexikon(arg);
  if (view === 'einstellungen') return viewSettings();
  ui.importItems = view === 'import' ? ui.importItems : null;
  return viewSongs();
}
window.addEventListener('hashchange', route);
route();

// ---------- Offline-Betrieb ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  // Update bequemer machen: Ist kurz nach dem Start eine neue Version fertig geladen, lädt sich die App
  // einmal selbst neu – dann reicht einmal Öffnen statt zweimal. Streng begrenzt, damit auf der Bühne
  // und mitten in der Arbeit nie etwas neu lädt: nur Vorbereitungsmodus, nur in den ersten 30 Sekunden,
  // nur auf Übersichtsseiten, nicht während einer Eingabe, höchstens einmal pro Start.
  const hadWorker = !!navigator.serviceWorker.controller;   // beim allerersten Start gibt es nichts zu aktualisieren
  const startedAt = Date.now();
  let reloaded = false;
  try { reloaded = sessionStorage.getItem('st-reloaded') === '1'; sessionStorage.removeItem('st-reloaded'); } catch (e) { /* egal */ }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadWorker || reloaded || isStage()) return;
    if (Date.now() - startedAt > 30000 || document.visibilityState !== 'visible') return;
    const view = (location.hash || '#/').split('/')[1] || '';
    if (!['', 'listen', 'lexikon', 'einstellungen'].includes(view)) return;
    const el = document.activeElement;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    reloaded = true;
    try { sessionStorage.setItem('st-reloaded', '1'); } catch (e) { return; }   // ohne Merker lieber nicht neu laden
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
