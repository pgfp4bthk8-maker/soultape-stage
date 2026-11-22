// „Mein Sound“: die eigenen Einstellungen eines Musikers (Gitarre, Pickup, Effektgerät) pro Song und Part.
// Seit 0.1.31, darf überall fehlen. Persönlich: reist nie in Paketen mit, nur in der eigenen Sicherung.
//
// settings.rig = { device: 'Name des Geräts', insts: [{ id, name, short, color, pickups: ['Hals', …] }], fx: ['Boost', …] }
// song.mine    = { inst, pickup, preset, scene, fx: [], note,
//                  parts: [{ part: 'Chorus', pickup?, preset?, scene?, fx?, note? }] }
//   Standard = die Felder oben. In einem Part gilt jedes fehlende Feld wie im Standard.
//   fx in einem Part ist immer die komplette Auswahl: [] = keine Effekte, fehlt = wie Standard.
//   Pickups und Effekte stehen mit ihrem Namen im Song, das Instrument mit seiner id.

import { sectionKey, matchRows, KIND_NAMES } from './flow.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const str = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');
const list = (a) => (Array.isArray(a) ? [...new Set(a.map(str).filter(Boolean))] : []);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export const COLORS = ['#e5484d', '#f28c28', '#f5d547', '#57c785', '#4aa3ff', '#a78bfa', '#f1efe9', '#8b8d94'];
export const PICKUP_SETS = {
  '5 Stellungen': ['Hals', 'Hals+Mitte', 'Mitte', 'Mitte+Steg', 'Steg'],
  '3 Stellungen': ['Hals', 'Hals+Steg', 'Steg'],
};
export const DEFAULT_FX = ['Boost', 'Drive', 'Chorus', 'Flanger', 'Phaser', 'Delay', 'Reverb', 'Wah'];
export const SCENES = [1, 2, 3, 4, 5, 6, 7, 8];

/** Einrichtung, bereinigt. Fehlt die Effektliste, gilt die Vorgabe (eine geleerte Liste bleibt leer). */
export function cleanRig(rig) {
  const r = obj(rig);
  return {
    device: str(r.device),
    insts: (Array.isArray(r.insts) ? r.insts : []).map(obj).filter((x) => str(x.id)).map((x) => ({
      id: str(x.id), name: str(x.name), short: str(x.short),
      color: COLORS.includes(x.color) ? x.color : COLORS[0],   // nur die Palette, landet in einem style-Attribut
      pickups: list(x.pickups),
    })),
    fx: Array.isArray(r.fx) ? list(r.fx) : [...DEFAULT_FX],
  };
}

function cleanScene(v) {
  return SCENES.includes(+v) ? +v : null;
}

/** Angaben eines Songs, bereinigt. Part-Felder ohne eigenen Wert fehlen (= wie Standard). */
export function cleanMine(mine) {
  const m = obj(mine);
  return {
    inst: str(m.inst), pickup: str(m.pickup), preset: str(m.preset), scene: cleanScene(m.scene), fx: list(m.fx), note: str(m.note),
    parts: (Array.isArray(m.parts) ? m.parts : []).map(obj).filter((p) => str(p.part)).map((p) => {
      const o = { part: str(p.part) };
      for (const f of ['pickup', 'preset', 'note']) if (str(p[f])) o[f] = str(p[f]);
      if (cleanScene(p.scene)) o.scene = cleanScene(p.scene);
      if (Array.isArray(p.fx)) o.fx = list(p.fx);
      return o;
    }),
  };
}

export function hasMine(mine) {
  const m = cleanMine(mine);
  return !!(m.inst || m.pickup || m.preset || m.scene || m.fx.length || m.note || m.parts.length);
}
export function hasRig(rig) {
  const r = obj(rig);
  return !!(str(r.device) || (Array.isArray(r.insts) && r.insts.length) || Array.isArray(r.fx));
}

export const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
/** Effekte in der Reihenfolge der eigenen Liste. */
export function sortFx(fx, order) {
  const pos = (x) => (order.indexOf(x) < 0 ? order.length : order.indexOf(x));
  return [...fx].sort((a, b) => pos(a) - pos(b));
}

/** Was in einem Part gilt: seine Felder, sonst der Standard. Ohne Part = Standard. */
export function resolvePart(m, p) {
  const x = p || {};
  return { pickup: x.pickup || m.pickup, preset: x.preset || m.preset, scene: x.scene || m.scene, fx: x.fx || m.fx };
}

/**
 * Handgriffe von einem Zustand zum nächsten: [{ kind, text }].
 * Nur was sich ändert. Bei Scene- oder Preset-Wechsel stehen alle Effekte da, die an sein sollen,
 * weil das Gerät dabei selbst Effekte umschalten kann.
 */
export function changes(from, to, { order = [], usesFx = true } = {}) {
  const out = [];
  const add = (kind, text) => out.push({ kind, text });
  if (from.pickup !== to.pickup) add('pickup', to.pickup || 'Pickup Standard');
  const newPreset = from.preset !== to.preset;
  if (newPreset) add('prog', to.preset ? `▸ ${to.preset}` : '▸ Preset Standard');
  if (from.scene !== to.scene || (newPreset && to.scene)) add('prog', to.scene ? `Sc ${to.scene}` : 'Scene Standard');
  if (newPreset || from.scene !== to.scene) {
    if (usesFx) add('fx', to.fx.length ? sortFx(to.fx, order).join(' + ') : 'ohne Effekte');
  } else {
    sortFx(to.fx.filter((x) => !from.fx.includes(x)), order).forEach((x) => add('fx', `+ ${x}`));
    sortFx(from.fx.filter((x) => !to.fx.includes(x)), order).forEach((x) => add('off', `${x} aus`));
  }
  return out;
}

/**
 * Wechsel-Plan für ein Blatt.
 * anchors: Abschnitte und Medley-Trenner in Blatt-Reihenfolge (markerNames() in chordpro.js).
 * → { at: Map(Marken-Index → Handgriffe), bar: [{ part, steps }] für Parts ohne Platz im Blatt }
 */
export function soundPlan(mine, rig, anchors) {
  const m = cleanMine(mine);
  const opt = { order: cleanRig(rig).fx, usesFx: !!(m.fx.length || m.parts.some((p) => p.fx)) };
  const std = resolvePart(m);
  const hits = matchRows(m.parts.map((p) => p.part), anchors);
  const at = new Map();
  let now = std;
  (anchors || []).forEach((a, i) => {
    const p = hits.has(i) ? m.parts[hits.get(i)] : null;
    const next = resolvePart(m, p);
    const steps = changes(now, next, opt);
    if (p && p.note) steps.push({ kind: 'note', text: p.note });
    if (steps.length) at.set(i, steps);
    now = next;
  });
  const placed = new Set(hits.values());
  const bar = [];
  m.parts.forEach((p, i) => {
    if (placed.has(i)) return;
    const steps = changes(std, resolvePart(m, p), opt);
    if (p.note) steps.push({ kind: 'note', text: p.note });
    if (steps.length) bar.push({ part: p.part, steps });
  });
  return { at, bar };
}

/**
 * Parts zum Antippen aus den Abschnitten des Blatts: [{ value, label }].
 * „Chorus“ gilt für jeden Chorus, „Chorus 3“ nur für den dritten.
 */
export function partOptions(anchors) {
  const seen = {}, secs = [];
  for (const a of anchors || []) {
    const k = sectionKey(a.text);
    if (a.medley || !k.kind) {
      if (k.plain) secs.push({ plain: k.plain, value: a.text });
      continue;
    }
    seen[k.kind] = (seen[k.kind] || 0) + 1;
    secs.push({ kind: k.kind, n: k.n || seen[k.kind], text: a.text });
  }
  const out = [], have = new Set();
  const add = (value, label) => {
    if (have.has(value)) return;
    have.add(value);
    out.push({ value, label: label || value });
  };
  for (const x of secs) {
    if (!x.kind) { add(x.value); continue; }
    const name = KIND_NAMES[x.kind];
    const several = new Set(secs.filter((y) => y.kind === x.kind).map((y) => y.n)).size > 1;
    if (several) add(name, `${name} (alle)`);
    // Ein einziger Chorus heißt einfach „Chorus“, eine einzelne „Strophe 2“ behält ihre Nummer
    const value = several || x.n > 1 ? `${name} ${x.n}` : name;
    const sk = sectionKey(x.text);
    // Originalnamen dazuschreiben, wenn er mehr sagt als die Art (z. B. „Piano Solo“)
    const extra = x.kind === 'solo' && sk.plain !== 'solo' ? ` („${x.text}“)` : '';
    add(value, value + extra);
  }
  return out;
}

const pill = (s) => `<span class="my my-${s.kind}">${esc(s.text)}</span>`;
/** Schilder für eine Marke im Blatt. */
export const soundBadges = (steps) => (steps && steps.length ? `<span class="mybad">${steps.map(pill).join('')}</span>` : '');

/** Leiste über dem Blatt für Parts, die dort keinen Abschnitt haben. */
export function soundBarHtml(rows) {
  if (!rows.length) return '';
  return `<div class="mybar">${rows.map((r) => `<span class="myitem"><b>${esc(r.part)}</b>${r.steps.map(pill).join('')}</span>`).join('')}</div>`;
}

/** Box oben im Song: der Standard. Ohne Angaben nur ein Hinweis zum Eintragen (Vorbereitung). */
export function soundBoxHtml(mine, rig, songId) {
  const m = cleanMine(mine), r = cleanRig(rig);
  const edit = (text) => `<a class="btn ghost prep-only" href="#/bearbeiten/${esc(songId)}" id="myEdit">${text}</a>`;
  if (!hasMine(m)) return `<div class="mybox empty prep-only"><span class="muted">Mein Sound: noch nichts eingetragen</span>${edit('Eintragen')}</div>`;
  const inst = r.insts.find((x) => x.id === m.inst);
  const gtr = inst || m.pickup ? `<div class="myinst">${inst ? `<i class="mydot" style="background:${inst.color}"></i><b>${esc(inst.name || inst.short || 'Instrument')}</b>` : ''}${m.pickup ? `<span class="my my-pickup">${esc(m.pickup)}</span>` : ''}</div>` : '';
  const prog = m.preset || m.scene || m.fx.length ? `<div class="myprog">${r.device ? `<span class="lbl">${esc(r.device)}</span>` : ''}${m.preset ? `<b>${esc(m.preset)}</b>` : ''}${m.scene ? pill({ kind: 'prog', text: `Sc ${m.scene}` }) : ''}${sortFx(m.fx, r.fx).map((x) => pill({ kind: 'fx', text: x })).join('')}</div>` : '';
  return `<div class="mybox" id="myBox">${gtr}${prog}${m.note ? `<div class="mynote">${esc(m.note)}</div>` : ''}${edit('Ändern')}</div>`;
}
