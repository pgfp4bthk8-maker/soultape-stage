// SoulTape Stage – Hauptlogik der Oberfläche
import { state, save, getSong, sortedSongs, newSong, deleteSong, addSheet, activeSheet, deleteSheet,
  matchSong, exportBackup, importBackup, refreshSeeds, lastSaveOk,
  getList, newList, deleteList, snapshotList, restoreSnapshot } from './store.js';
import { LEXICON } from './data.js';
import { SECTIONS, renderPanel, controlsOf } from './panel.js';
import { splitSongs, renderSheet, analyze, guessKey, transposeKey, switchLine, switchText } from './chordpro.js';

export const APP_VERSION = '0.1.8';

const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TAGS = ['Opener', 'Abschluss', 'Zugabe', 'Mitsingen', 'Tanzflächenfüller', 'Ballade', 'Langsam', 'Schnell', 'Party', 'Hintergrund', 'Deutsch'];

let ui = { part: 0, step: 0, guide: false, importItems: null };

// ---------- Hilfen ----------
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
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

// ---------- Rahmen ----------
function shell(active, body) {
  document.body.classList.toggle('stage', isStage());
  document.documentElement.style.setProperty('--font', (state.settings.fontSize || 22) + 'px');
  app.innerHTML = `
    <header class="top">
      <a class="brand" href="#/"><i></i>SoulTape Stage</a>
      <nav>
        <a href="#/" class="${active === 'songs' ? 'on' : ''}">Songs</a>
        <a href="#/listen" class="${active === 'lists' ? 'on' : ''}">Setlisten</a>
        <a href="#/lexikon" class="${active === 'lex' ? 'on' : ''} prep-only">Lexikon</a>
        <a href="#/einstellungen" class="${active === 'set' ? 'on' : ''} prep-only">Einstellungen</a>
      </nav>
      <span class="spacer"></span>
      <button class="mode ${isStage() ? 'stage' : ''}" id="modeBtn">${isStage() ? 'Bühne' : 'Vorbereitung'}</button>
    </header>
    <main>${body}</main>`;
  $('#modeBtn').onclick = () => {
    state.settings.mode = isStage() ? 'prep' : 'stage';
    persist(); route();
  };
}

// ---------- Songliste ----------
function viewSongs() {
  const q = (ui.search || '').toLowerCase();
  const list = sortedSongs().filter((s) => !q || (s.title + ' ' + s.artist).toLowerCase().includes(q));
  shell('songs', `
    <div class="row" style="margin-bottom:12px">
      <input type="search" id="q" placeholder="Song suchen …" value="${esc(ui.search || '')}" style="flex:1;min-width:200px">
      <a class="btn prep-only" href="#/import">Leadsheets importieren</a>
      <button class="btn primary prep-only" id="add">+ Song</button>
    </div>
    <ul class="songs">${list.map((s) => `
      <li><a href="#/song/${s.id}">
        <div><div class="t">${esc(s.title)}</div>
          <div class="a">${esc(s.artist)}${s.parts?.length > 1 ? ` · ${s.parts.length} Sounds` : ''}${activeSheet(s) ? ' · Leadsheet' : ''}</div></div>
        <div class="k"><b>${esc(transposeKey(s.key, s.transpose || 0, notation()))}</b>${s.nordSlot ? `<span class="badge slot">${esc(s.nordSlot)}</span>` : ''}${s.nordStored ? '<span class="badge ok">auf dem Nord</span>' : '<span class="badge">noch nicht gespeichert</span>'}</div>
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
        <h1>${esc(s.title)}</h1>
        <div class="muted">${esc(s.artist)}${s.durationSec ? ' · ' + fmtDur(s.durationSec) : ''}</div>
        ${ctx ? `<a class="listctx" href="#/liste/${ctx.list.id}">${esc(ctx.list.name)}${ctx.setCount > 1 ? ` · Set ${ctx.setNo}` : ''} · Song ${ctx.songNo} von ${ctx.songCount}</a>` : ''}
      </div>
      <a class="btn prep-only" href="#/bearbeiten/${s.id}">Bearbeiten</a>
    </div>
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

    <div class="sheetbar">
      <div class="grp" title="Transponieren"><button id="trDown">−</button><span>${tr === 0 ? 'Original' : (tr > 0 ? '+' : '') + tr}<br><b style="color:var(--chord)">${esc(transposeKey(s.key, tr, notation()) || '–')}</b></span><button id="trUp">+</button></div>
      <div class="grp" title="Schriftgröße"><button id="fsDown">A−</button><button id="fsUp">A+</button></div>
      ${sheet ? `<button class="btn prep-only ${ui.mark ? 'primary' : ''}" id="markBtn">${ui.mark ? 'Fertig' : '⇄ Soundwechsel setzen'}</button>` : ''}
      <span class="spacer" style="flex:1"></span>
      ${sheet ? `<span class="badge prep-only">${esc(sheet.name)}</span>` : ''}
    </div>
    ${ui.mark ? '<div class="notice small prep-only" style="margin-top:8px">Tippe auf die Zeile, <b>vor</b> der du den Sound wechseln musst. Tippe auf einen vorhandenen Wechsel-Balken, um ihn zu ändern oder zu entfernen. Dein Original bleibt erhalten – die Wechsel landen in einer eigenen Version „Mit Soundwechseln“.</div>' : ''}
    <div class="sheet${ui.mark ? ' marking' : ''}" id="sheet">${sheet ? renderSheet(sheet.text, { steps: tr, notation: notation(), key: s.key }) :
      `<p class="muted" style="font-size:17px">Noch kein Leadsheet. <span class="prep-only">Unter <a href="#/import">Leadsheets importieren</a> kannst du deine ChordPro-Datei einlesen.</span></p>`}</div>
    <div class="songnav">
      ${prev ? `<a class="btn" href="#/song/${prev.id}"${navPos(prev)}>◀ ${esc(prev.title)}</a>` : '<span style="flex:1"></span>'}
      ${next ? `<a class="btn" href="#/song/${next.id}"${navPos(next)}>${ctx && ctx.breakBefore ? `<span class="pausehint">⏸ ${esc(ctx.breakBefore)} – danach:</span> ` : ''}${esc(next.title)} ▶</a>`
        : (ctx ? '<span class="btn" style="flex:1;opacity:.6">Ende der Liste</span>' : '<span style="flex:1"></span>')}
    </div>`);
  app.querySelectorAll('.songnav a[data-pos]').forEach((a) => a.addEventListener('click', () => { state.settings.navList = { id: ctx.list.id, pos: +a.dataset.pos }; persist(); }));

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
  $('#fsDown').onclick = () => { state.settings.fontSize = Math.max(14, (state.settings.fontSize || 22) - 2); persist(); document.documentElement.style.setProperty('--font', state.settings.fontSize + 'px'); };
  $('#fsUp').onclick = () => { state.settings.fontSize = Math.min(48, (state.settings.fontSize || 22) + 2); persist(); document.documentElement.style.setProperty('--font', state.settings.fontSize + 'px'); };

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
 * Beim ersten Wechsel entsteht eine Kopie „Mit Soundwechseln“, weitere Wechsel landen in dieser Kopie.
 */
function editMarks(s, change) {
  let v = activeSheet(s);
  if (!v) return;
  if (!v.marks) {
    v = addSheet(s, `Mit Soundwechseln ${fmtDate(new Date().toISOString())}`, v.text, true);
    v.marks = true;
  }
  const lines = v.text.replace(/\r\n?/g, '\n').split('\n');
  change(lines);
  v.text = lines.join('\n');
  persist();
}

/** Blendet über der angetippten Zeile ein Feld ein, um einen Wechsel zu setzen, zu ändern oder zu entfernen. */
function openMarkBox(s, ln) {
  const old = $('#sheet .markbox'); if (old) old.remove();
  const src = +ln.dataset.src;
  const isSwitch = ln.classList.contains('switch');
  const lines = activeSheet(s).text.replace(/\r\n?/g, '\n').split('\n');
  const cur = isSwitch ? (switchText(lines[src]) || '') : '';
  const partChips = (s.parts || []).length > 1 ? s.parts.map((p) => p.name).filter(Boolean) : [];
  const chips = [...partChips, 'Piano AN', 'Piano AUS', 'Orgel AN', 'Orgel AUS', 'Synth AN', 'Synth AUS', 'Rotary schnell', 'Rotary langsam'];
  const box = document.createElement('div');
  box.className = 'markbox card stack';
  box.innerHTML = `
    <b>${isSwitch ? 'Soundwechsel ändern' : 'Soundwechsel vor dieser Zeile'}</b>
    <div class="small muted">Was musst du tun? Für einen Programmwechsel den Speicherplatz zuerst schreiben, z. B. „M 24 Orgel“. Sonst antippen oder frei eintragen, z. B. „Synth AN“.</div>
    <div class="row">${chips.map((c) => `<span class="chip" data-chip="${esc(c)}">${esc(c)}</span>`).join('')}</div>
    <input type="text" id="markText" value="${esc(cur)}" placeholder="z. B. M 24 Orgel  oder  Synth AN">
    <div class="row"><button class="btn primary" id="markSet">${isSwitch ? 'Ändern' : 'Setzen'}</button>
      ${isSwitch ? '<button class="btn danger" id="markDel">Entfernen</button>' : ''}
      <button class="btn ghost" id="markCancel">Abbrechen</button></div>`;
  ln.before(box);
  const inp = $('#markText', box);
  box.querySelectorAll('[data-chip]').forEach((c) => c.onclick = () => {
    inp.value = inp.value.trim() ? `${inp.value.trim()}, ${c.dataset.chip}` : c.dataset.chip;
  });
  $('#markCancel', box).onclick = () => box.remove();
  $('#markSet', box).onclick = () => {
    const t = inp.value.trim();
    if (!t) { inp.focus(); return; }
    editMarks(s, (l) => { if (isSwitch) l[src] = switchLine(t); else l.splice(src, 0, switchLine(t)); });
    viewSongKeepScroll(s.id);
  };
  const del = $('#markDel', box);
  if (del) del.onclick = () => { editMarks(s, (l) => l.splice(src, 1)); viewSongKeepScroll(s.id); };
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
        <label class="f"><span>Dauer (mm:ss)</span><input type="text" id="f-dur" value="${esc(fmtDur(s.durationSec))}" placeholder="3:45"></label>
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
  bind('#f-nord', (e) => { s.nordProgram = e.target.value.trim(); persist(); });
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
    .filter((l) => !/^\s*\{\s*(title|t|subtitle|st|artist|key)\s*:/i.test(l)).join('\n').trim();
  return [`{title: ${s.title}}`, s.artist ? `{subtitle: ${s.artist}}` : '', s.key ? `{key: ${s.key}}` : '', '', body, ''].filter((l, i) => l !== '' || i > 2).join('\n');
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
          kawai: it.meta.kawai.join(' · '), parts: [{ name: 'Ganzer Song', lex: '', summary: '', steps: [], tips: '' }] });
      } else {
        if (!s.key) s.key = it.meta.key || it.guessed;
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

// ---------- Setlisten und Probenlisten ----------
const KIND = { gig: 'Auftritt', probe: 'Probe' };
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
  const pick = sortedSongs().filter((s) => !inList.has(s.id) && (!q || (s.title + ' ' + s.artist).toLowerCase().includes(q)));
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
      <a class="lt" href="#/song/${s.id}" data-open="${i}"><span class="t">${esc(s.title)}</span><span class="a">${esc(s.artist)}</span></a>
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
  shell('set', `
    <h1>Einstellungen</h1>
    <div class="card stack">
      <div><b>Akkord-Schreibweise</b><div class="row" style="margin-top:6px">
        <span class="chip ${st.notation === 'de' ? 'on' : ''}" data-not="de">Deutsch (H, B = Bb)</span>
        <span class="chip ${st.notation === 'en' ? 'on' : ''}" data-not="en">Englisch (B, Bb)</span></div></div>
      <div><b>Blättern beim Tippen</b> <span class="muted small">(wie schnell das Leadsheet weiterläuft)</span><div class="row" style="margin-top:6px">
        ${Object.entries(PAGE_SPEEDS).map(([ms, name]) => `<span class="chip ${(st.pageMs || 1400) === +ms ? 'on' : ''}" data-page="${ms}">${name}</span>`).join('')}</div></div>
      <div><b>Schriftgröße Leadsheet:</b> ${st.fontSize}px <span class="muted small">(in der Song-Ansicht mit A−/A+ änderbar)</span></div>
    </div>

    <h2>Mein Nord – Lautstärke</h2>
    <div class="card stack">
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
      <div class="row"><button class="btn primary" id="exp">Backup exportieren</button>
        <label class="btn">Backup importieren<input type="file" id="imp" accept=".json,application/json" hidden></label>
        <button class="btn" id="expCho">Alle Leadsheets als ChordPro</button></div>
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
  app.querySelectorAll('[data-not]').forEach((c) => c.onclick = () => { st.notation = c.dataset.not; persist(); viewSettings(); });
  app.querySelectorAll('[data-page]').forEach((c) => c.onclick = () => { st.pageMs = +c.dataset.page; persist(); viewSettings(); });
  $('#set-master').onchange = (e) => { st.nordMaster = e.target.value.trim(); persist(); };
  $('#set-ref').onchange = (e) => { st.nordRef = e.target.value.trim(); persist(); };
  $('#exp').onclick = () => download(`soultape-backup-${new Date().toISOString().slice(0, 10)}.json`, exportBackup(), 'application/json');
  $('#imp').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (!confirm('Backup importieren? Die Daten auf diesem Gerät werden durch die Sicherung ersetzt.')) return;
    try { importBackup(await f.text()); toast('Backup importiert'); route(); } catch (err) { toast(err.message || 'Import fehlgeschlagen'); }
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
  if (view !== 'song') keepAwake(false);
  if (view === 'song' && arg) return viewSong(arg);
  if (view === 'bearbeiten' && arg) return viewEdit(arg);
  if (view === 'import') return viewImport();
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
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
