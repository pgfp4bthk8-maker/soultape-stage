// Bedienfeld-Landkarten des Nord Electro 7 (vereinfachte Skizzen).
// Jede Sektion ist eine SVG-Skizze. Ein Anleitungsschritt kann einen Regler
// hervorheben (c), eine Auswahl-LED anzeigen (sel), einen Knopfwert (val)
// oder Zugriegel-Stellungen (drawbars) mitbringen.

export const SECTIONS = {
  organ: { name: 'Orgel & Rotary', w: 600, h: 330 },
  piano: { name: 'Piano', w: 600, h: 220 },
  synth: { name: 'Synth', w: 600, h: 275 },
  effects: { name: 'Effekte', w: 705, h: 330 },
  program: { name: 'Programm', w: 600, h: 230 },
};

const CONTROLS = {
  organ: [
    { t: 'block', x: 10, y: 10, w: 140, h: 310, label: 'ROTARY' },
    { t: 'btn', id: 'rot-on', x: 80, y: 48, label: 'ON' },
    { t: 'leds', id: 'rot-target', x: 30, y: 80, items: ['ORG', 'PNO', 'SYN'], cols: 3, label: 'Shift+ON' },
    { t: 'knob', id: 'rot-drive', x: 80, y: 135, label: 'DRIVE' },
    { t: 'leds', id: 'rot-mic', x: 30, y: 178, items: ['WIDE', 'CLOSE', 'XY'], cols: 3, cw: 40, label: 'MIC POS' },
    { t: 'btn', id: 'rot-stop', x: 80, y: 225, label: 'STOP' },
    { t: 'btn', id: 'rot-slow', grp: 'rot-speed', x: 52, y: 285, label: 'SLOW' },
    { t: 'btn', id: 'rot-fast', grp: 'rot-speed', x: 108, y: 285, label: 'FAST' },

    { t: 'block', x: 160, y: 10, w: 430, h: 310, label: 'ORGAN' },
    { t: 'knob', id: 'org-level', x: 197, y: 55, label: 'LEVEL' },
    { t: 'btn', id: 'org-on', x: 252, y: 45, label: 'ON' },
    { t: 'leds', id: 'org-kbzone', x: 238, y: 70, items: ['LO', 'UP'], cols: 2, cw: 30, label: '' },
    { t: 'leds', id: 'org-model', x: 310, y: 50, items: ['FARF', 'PIPE', 'VOX', 'SOFT B3', 'B3', 'B3 BASS'], cols: 2, label: 'ORGAN MODEL' },
    { t: 'leds', id: 'org-vib', x: 435, y: 50, items: ['V1', 'V2', 'V3', 'C1', 'C2', 'C3'], cols: 3, label: 'VIB/CHORUS' },
    { t: 'btn', id: 'org-vib-on', x: 560, y: 56, label: 'ON' },
    { t: 'btn', id: 'org-perc-vol', grp: 'org-perc', x: 335, y: 112, label: 'SOFT' },
    { t: 'btn', id: 'org-perc-decay', grp: 'org-perc', x: 395, y: 112, label: 'FAST' },
    { t: 'btn', id: 'org-perc-harm', grp: 'org-perc', x: 455, y: 112, label: 'THIRD' },
    { t: 'btn', id: 'org-perc-on', grp: 'org-perc', x: 555, y: 112, label: 'ON' },
    { t: 'text', x: 395, y: 97, label: 'PERCUSSION' },
    { t: 'btn', id: 'org-oct', x: 197, y: 112, label: 'OCT ◀▶', w: 52 },
    { t: 'btn', id: 'org-p1', grp: 'org-preset', x: 200, y: 175, label: 'PRESET 1', w: 62 },
    { t: 'btn', id: 'org-p2', grp: 'org-preset', x: 200, y: 215, label: 'PRESET 2', w: 62 },
    { t: 'btn', id: 'org-live', grp: 'org-preset', x: 200, y: 255, label: 'LIVE', w: 62 },
    { t: 'bars', id: 'org-drawbars', x: 255, y: 145, w: 325, h: 165 },
  ],

  piano: [
    { t: 'block', x: 10, y: 10, w: 580, h: 200, label: 'PIANO' },
    { t: 'knob', id: 'pno-level', x: 55, y: 60, label: 'LEVEL' },
    { t: 'btn', id: 'pno-on', x: 120, y: 50, label: 'ON' },
    { t: 'leds', id: 'pno-kbzone', x: 106, y: 74, items: ['LO', 'UP'], cols: 2, cw: 30, label: '' },
    { t: 'btn', id: 'pno-oct', x: 80, y: 140, label: 'OCT ◀▶', w: 52 },
    { t: 'leds', id: 'pno-touch', x: 180, y: 45, items: ['LIGHT', 'MED', 'HEAVY'], cols: 1, label: 'KB TOUCH' },
    { t: 'leds', id: 'pno-unison', x: 265, y: 45, items: ['1', '2', '3'], cols: 3, label: 'UNISON' },
    { t: 'btn', id: 'pno-stringres', x: 205, y: 160, label: 'STRING RES', w: 66 },
    { t: 'leds', id: 'pno-dyncomp', x: 270, y: 125, items: ['1', '2'], cols: 2, cw: 30, label: 'DYN COMP' },
    { t: 'leds', id: 'pno-timbre', x: 365, y: 45, items: ['SOFT', 'MID', 'BRIGHT', 'DYNO1', 'DYNO2'], cols: 1, label: 'TIMBRE' },
    { t: 'knob', id: 'pno-library', x: 515, y: 105, r: 26, label: 'PIANO LIBRARY' },
    { t: 'text', x: 515, y: 158, label: 'drücken = CATEGORY' },
  ],

  synth: [
    { t: 'block', x: 10, y: 10, w: 580, h: 255, label: 'SYNTH' },
    { t: 'knob', id: 'syn-level', x: 50, y: 60, label: 'LEVEL' },
    { t: 'btn', id: 'syn-on', x: 112, y: 50, label: 'ON' },
    { t: 'leds', id: 'syn-kbzone', x: 98, y: 74, items: ['LO', 'UP'], cols: 2, cw: 30, label: '' },
    { t: 'btn', id: 'syn-oct', x: 60, y: 118, label: 'OCT ◀▶', w: 52 },
    { t: 'leds', id: 'syn-voice', x: 30, y: 160, items: ['MONO', 'LEGATO'], cols: 1, label: 'VOICE MODE' },
    { t: 'leds', id: 'syn-unison', x: 110, y: 160, items: ['1', '2', '3'], cols: 3, label: 'UNISON' },
    { t: 'leds', id: 'syn-glide', x: 30, y: 230, items: ['1', '2'], cols: 2, cw: 30, label: 'GLIDE' },
    { t: 'leds', id: 'syn-dynamics', x: 110, y: 230, items: ['1', '2'], cols: 2, cw: 30, label: 'DYNAMICS' },
    { t: 'knob', id: 'syn-library', x: 245, y: 85, r: 26, label: 'SOUND LIBRARY' },
    { t: 'leds', id: 'syn-libtype', x: 205, y: 150, items: ['SAMPLES', 'ANALOG', 'FM'], cols: 1, label: '' },
    { t: 'knob', id: 'syn-attack', x: 340, y: 60, label: 'ATTACK' },
    { t: 'knob', id: 'syn-decay', x: 340, y: 132, label: 'DECAY/SUS' },
    { t: 'knob', id: 'syn-release', x: 340, y: 204, label: 'RELEASE' },
    { t: 'btn', id: 'syn-vibrato', x: 430, y: 48, label: 'VIBRATO', w: 56 },
    { t: 'btn', id: 'syn-filteron', x: 530, y: 48, label: 'FILTER ON', w: 60 },
    { t: 'knob', id: 'syn-envamt', x: 530, y: 112, label: 'ENV AMT' },
    { t: 'knob', id: 'syn-res', x: 440, y: 140, label: 'RES' },
    { t: 'knob', id: 'syn-freq', x: 530, y: 200, label: 'FREQ' },
    { t: 'leds', id: 'syn-velocity', x: 420, y: 205, items: ['1', '2'], cols: 2, label: 'VELOCITY' },
  ],

  effects: [
    { t: 'block', x: 10, y: 10, w: 250, h: 100, label: 'MOD 1' },
    { t: 'knob', id: 'fx-mod1-rate', x: 45, y: 62, label: 'RATE' },
    { t: 'knob', id: 'fx-mod1-amount', x: 100, y: 62, label: 'AMOUNT' },
    { t: 'leds', id: 'fx-mod1-type', x: 135, y: 34, items: ['TREM', 'RM', 'PAN2', 'WAH', 'PAN1'], cols: 2, label: '' },
    { t: 'btn', id: 'fx-mod1-on', x: 230, y: 62, label: 'ON' },
    { t: 'block', x: 10, y: 115, w: 250, h: 100, label: 'MOD 2' },
    { t: 'knob', id: 'fx-mod2-rate', x: 45, y: 167, label: 'RATE' },
    { t: 'knob', id: 'fx-mod2-amount', x: 100, y: 167, label: 'AMOUNT' },
    { t: 'leds', id: 'fx-mod2-type', x: 135, y: 139, items: ['CHOR', 'VIBE', 'FLANG', 'ENS', 'PHAS'], cols: 2, label: '' },
    { t: 'btn', id: 'fx-mod2-on', x: 230, y: 167, label: 'ON' },
    { t: 'block', x: 10, y: 220, w: 90, h: 100, label: 'FX FOCUS' },
    { t: 'leds', id: 'fx-focus', x: 25, y: 250, items: ['ORG', 'PNO', 'SYN'], cols: 1, label: '' },

    { t: 'block', x: 270, y: 10, w: 240, h: 205, label: 'DELAY' },
    { t: 'knob', id: 'fx-dly-tempo', x: 305, y: 60, label: 'TEMPO' },
    { t: 'leds', id: 'fx-dly-filter', x: 345, y: 38, items: ['HP', 'LP', 'BP'], cols: 3, label: '' },
    { t: 'knob', id: 'fx-dly-feedback', x: 470, y: 60, label: 'FEEDBACK' },
    { t: 'btn', id: 'fx-dly-tap', x: 310, y: 125, label: 'TAP/SET', w: 54 },
    { t: 'knob', id: 'fx-dly-mix', x: 400, y: 160, label: 'DRY/WET' },
    { t: 'btn', id: 'fx-dly-on', x: 475, y: 150, label: 'ON' },

    { t: 'block', x: 110, y: 220, w: 420, h: 100, label: 'EQUALIZER / AMP SIM' },
    { t: 'knob', id: 'fx-eq-bass', x: 145, y: 272, label: 'BASS' },
    { t: 'knob', id: 'fx-eq-mid', x: 195, y: 272, label: 'MID' },
    { t: 'knob', id: 'fx-eq-treble', x: 245, y: 272, label: 'TREBLE' },
    { t: 'leds', id: 'fx-eq-amp', x: 278, y: 244, items: ['SUITCASE', 'JC', 'SMALL', 'BRIT', 'TWIN'], cols: 2, label: '' },
    { t: 'knob', id: 'fx-eq-freq', x: 415, y: 272, label: 'FREQ' },
    { t: 'knob', id: 'fx-eq-drive', x: 462, y: 272, label: 'DRIVE' },
    { t: 'btn', id: 'fx-eq-on', x: 505, y: 245, label: 'ON', w: 30 },

    { t: 'block', x: 520, y: 10, w: 80, h: 205, label: 'COMP' },
    { t: 'knob', id: 'fx-comp-amount', x: 560, y: 75, label: 'AMOUNT' },
    { t: 'btn', id: 'fx-comp-on', x: 560, y: 150, label: 'ON' },

    { t: 'block', x: 610, y: 10, w: 88, h: 310, label: 'REVERB' },
    { t: 'leds', id: 'fx-rev-tone', x: 622, y: 38, items: ['BRIGHT', 'DARK'], cols: 1, label: '' },
    { t: 'leds', id: 'fx-rev-type', x: 622, y: 88, items: ['STAGE', 'ROOM', 'SPRING', 'HALL', 'CATH', 'CHORALE'], cols: 1, label: '' },
    { t: 'knob', id: 'fx-rev-mix', x: 654, y: 238, label: 'DRY/WET' },
    { t: 'btn', id: 'fx-rev-on', x: 654, y: 292, label: 'ON' },
  ],

  program: [
    { t: 'block', x: 10, y: 10, w: 580, h: 210, label: 'PROGRAM' },
    { t: 'btn', id: 'prg-store', x: 55, y: 45, label: 'STORE', red: true },
    { t: 'text', x: 55, y: 64, label: 'Shift = STORE AS…' },
    { t: 'btn', id: 'prg-transpose', x: 160, y: 45, label: 'TRANSPOSE', w: 66 },
    { t: 'btn', id: 'prg-split', x: 250, y: 45, label: 'KB SPLIT', w: 56 },
    { t: 'disp', id: 'prg-display', x: 50, y: 78, w: 210, h: 82, label: 'DISPLAY' },
    { t: 'knob', id: 'prg-dial', x: 330, y: 115, r: 28, label: 'PROGRAM' },
    { t: 'btn', id: 'prg-b1', grp: 'prg-buttons', x: 70, y: 190, label: '1' },
    { t: 'btn', id: 'prg-b2', grp: 'prg-buttons', x: 115, y: 190, label: '2' },
    { t: 'btn', id: 'prg-b3', grp: 'prg-buttons', x: 160, y: 190, label: '3' },
    { t: 'btn', id: 'prg-b4', grp: 'prg-buttons', x: 205, y: 190, label: '4' },
    { t: 'btn', id: 'prg-b5', grp: 'prg-buttons', x: 250, y: 190, label: '5' },
    { t: 'btn', id: 'prg-live', x: 450, y: 60, label: 'LIVE MODE', w: 66 },
    { t: 'btn', id: 'prg-page', x: 450, y: 110, label: 'PAGE ◀▶', w: 66 },
    { t: 'btn', id: 'prg-shift', x: 450, y: 160, label: 'SHIFT', w: 66 },
  ],
};

const DRAWBAR_FEET = ["16'", "5⅓'", "8'", "4'", "2⅔'", "2'", "1⅗'", "1⅓'", "1'"];
const DRAWBAR_COLOR = ['brown', 'brown', 'white', 'white', 'black', 'white', 'black', 'black', 'white'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function matches(ctl, hl) {
  return hl.includes(ctl.id) || (ctl.grp && hl.includes(ctl.grp));
}

/**
 * Rendert die Landkarte einer Sektion als SVG-String.
 * @param {string} section  organ|piano|synth|effects|program
 * @param {object} step     optional: { c: id|[ids], sel, val, drawbars }
 */
export function renderPanel(section, step = {}) {
  const sec = SECTIONS[section];
  if (!sec) return '';
  const hl = step.c ? (Array.isArray(step.c) ? step.c : [step.c]) : [];
  const out = [];
  out.push(`<svg class="panel" viewBox="0 0 ${sec.w} ${sec.h}" role="img" aria-label="Landkarte ${esc(sec.name)}">`);
  out.push(`<rect x="0" y="0" width="${sec.w}" height="${sec.h}" rx="10" class="p-bg"/>`);

  for (const c of CONTROLS[section]) {
    const on = c.id && matches(c, hl);
    const cls = on ? ' hl' : '';
    switch (c.t) {
      case 'block':
        out.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="6" class="p-block"/>`);
        out.push(`<text x="${c.x + c.w / 2}" y="${c.y + 14}" class="p-title">${esc(c.label)}</text>`);
        break;
      case 'text':
        out.push(`<text x="${c.x}" y="${c.y}" class="p-label">${esc(c.label)}</text>`);
        break;
      case 'btn': {
        const w = c.w || 34, h = 16;
        out.push(`<g class="p-ctl${cls}"><rect x="${c.x - w / 2}" y="${c.y - h / 2}" width="${w}" height="${h}" rx="3" class="p-btn${c.red ? ' red' : ''}"/>` +
          `<text x="${c.x}" y="${c.y + 3.5}" class="p-btn-t">${esc(c.label)}</text></g>`);
        break;
      }
      case 'knob': {
        const r = c.r || 15;
        const v = on && typeof step.val === 'number' ? step.val : null;
        const ang = ((v ?? 5) / 10) * 270 - 135; // 0 => -135°, 10 => +135°
        const rad = (ang - 90) * Math.PI / 180;
        const px = c.x + Math.cos(rad) * (r - 3), py = c.y + Math.sin(rad) * (r - 3);
        out.push(`<g class="p-ctl${cls}"><circle cx="${c.x}" cy="${c.y}" r="${r}" class="p-knob"/>` +
          `<line x1="${c.x}" y1="${c.y}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" class="p-ptr"/>` +
          `<text x="${c.x}" y="${c.y + r + 12}" class="p-label">${esc(c.label)}</text>` +
          (v !== null ? `<text x="${c.x + r + 4}" y="${c.y - r + 4}" class="p-val">${v}</text>` : '') + `</g>`);
        break;
      }
      case 'leds': {
        const cols = c.cols || 1, cw = c.cw || (cols === 1 ? 64 : (cols === 2 ? 52 : 34)), rh = 13;
        const rows = Math.ceil(c.items.length / cols);
        const parts = [];
        c.items.forEach((it, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const lx = c.x + col * cw, ly = c.y + row * rh;
          const lit = on && step.sel && String(step.sel).toUpperCase() === it.toUpperCase();
          parts.push(`<circle cx="${lx}" cy="${ly}" r="3.2" class="p-led${lit ? ' lit' : ''}"/>` +
            `<text x="${lx + 6}" y="${ly + 3}" class="p-led-t${lit ? ' lit' : ''}">${esc(it)}</text>`);
        });
        const bw = cols * cw, bh = rows * rh;
        out.push(`<g class="p-ctl${cls}"><rect x="${c.x - 7}" y="${c.y - 8}" width="${bw}" height="${bh + 3}" rx="4" class="p-ledbox"/>${parts.join('')}` +
          (c.label ? `<text x="${c.x - 4}" y="${c.y - 12}" class="p-label p-label-l">${esc(c.label)}</text>` : '') + `</g>`);
        break;
      }
      case 'bars': {
        const n = 9, gap = c.w / n, top = c.y + 18, len = c.h - 40;
        const vals = on && step.drawbars ? String(step.drawbars).replace(/\D/g, '').split('').map(Number) : null;
        const parts = [`<text x="${c.x + c.w / 2}" y="${c.y + 6}" class="p-label">ZUGRIEGEL (DRAWBARS)</text>`];
        for (let i = 0; i < n; i++) {
          const bx = c.x + gap * i + gap / 2;
          const v = vals ? (vals[i] ?? 0) : 0;
          const hy = top + (len - 14) * (v / 8);
          parts.push(`<line x1="${bx}" y1="${top}" x2="${bx}" y2="${top + len}" class="p-track"/>`);
          for (let k = 1; k <= 8; k++) {
            const ty = top + (len - 14) * (k / 8) + 7;
            parts.push(`<line x1="${bx - 4}" y1="${ty}" x2="${bx + 4}" y2="${ty}" class="p-tick"/>`);
          }
          parts.push(`<rect x="${bx - 9}" y="${hy}" width="18" height="14" rx="2" class="p-bar ${DRAWBAR_COLOR[i]}"/>`);
          if (vals) parts.push(`<text x="${bx}" y="${hy + 11}" class="p-bar-v ${DRAWBAR_COLOR[i]}">${v}</text>`);
          parts.push(`<text x="${bx}" y="${c.y + c.h - 4}" class="p-label">${DRAWBAR_FEET[i]}</text>`);
        }
        out.push(`<g class="p-ctl${cls}">${parts.join('')}</g>`);
        break;
      }
      case 'disp':
        out.push(`<g class="p-ctl${cls}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="4" class="p-disp"/>` +
          `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + 4}" class="p-disp-t">${esc(c.label)}</text></g>`);
        break;
    }
  }
  out.push('</svg>');
  return out.join('');
}

/** Alle Regler-IDs (für Auswahllisten im Editor). */
export function controlsOf(section) {
  const seen = new Set(), list = [];
  for (const c of CONTROLS[section] || []) {
    const id = c.grp || c.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    list.push({ id, label: c.grp ? groupLabel(c.grp) : (c.label || id) });
  }
  return list;
}

function groupLabel(g) {
  return { 'rot-speed': 'SLOW / FAST', 'org-perc': 'PERCUSSION', 'org-preset': 'PRESET 1 / 2 / LIVE', 'prg-buttons': 'PROGRAM 1–5' }[g] || g;
}
