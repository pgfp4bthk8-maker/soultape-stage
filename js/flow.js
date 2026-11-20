// Song-Ablauf: wer singt wo, wo sind Solos, welche Effekte braucht der Mischer.
// Der Ablauf gehört zum Song (nicht zu einem Blatt) und reist im Band-Paket mit.
// Jeder Musiker sieht ihn in seinem eigenen Blatt: als kleine Schilder an den passenden
// Abschnitten. Findet eine Zeile keinen Abschnitt, zeigt die App den ganzen Ablauf als Leiste über dem Blatt.
//
// song.flow = [{ part: 'Strophe 1', voc: 'Este', solo: '', fx: '' }]   (seit 0.1.25, darf fehlen)

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FIELDS = ['part', 'voc', 'solo', 'fx'];

/** Bereinigter Ablauf: nur Zeilen mit Inhalt, nur Text-Felder. Leer → []. */
export function cleanFlow(flow) {
  if (!Array.isArray(flow)) return [];
  return flow.map((r) => {
    const o = {};
    for (const f of FIELDS) o[f] = r && typeof r[f] === 'string' ? r[f].trim() : '';
    return o;
  }).filter((r) => r.part || r.voc || r.solo || r.fx);
}

// Abschnittsarten. Reihenfolge wichtig: Pre-Chorus vor Chorus, Gitarrensolo vor Gitarre usw.
const KINDS = [
  ['pre', /^(pre-?\s*chorus|pre|vorrefrain|vor-?refrain|prechorus)/],
  ['chorus', /^(chorus|refrain|ref\b|ref\.)/],
  ['verse', /^(verse|strophe|str\b|str\.|vers\b)/],
  ['bridge', /^(bridge|br\b)/],
  ['intro', /^(intro|einleitung)/],
  ['outro', /^(outro|coda|ending|ende|schluss|end\b)/],
  ['solo', /^((guitar|gitarren|git|keys?|piano|orgel|sax|bass|drum)?\s*-?solo|instrumental|zwischenspiel|interlude)/],
  ['break', /^(break|pause|stop)/],
];

/**
 * Art und Nummer eines Abschnittsnamens: „Verse 2“ → { kind: 'verse', n: 2 },
 * „(2.Str.)“ → verse 2, „Chorus 2x“ → chorus ohne Nummer (2x = wiederholen), „Ref.2“ → chorus 2.
 */
export function sectionKey(text) {
  let t = String(text || '').toLowerCase().replace(/[()[\]:]/g, ' ').trim();
  t = t.replace(/\b\d+\s*x\b|\bx\s*\d+\b|\bx\b/g, ' ').replace(/\s+/g, ' ').trim();   // Wiederholungen
  // „2. Strophe“ / „2.Str.“ → Nummer vorne
  let n = null;
  const front = /^(\d+)\s*\.?\s*(.*)$/.exec(t);
  if (front && front[2]) { n = +front[1]; t = front[2]; }
  const kind = (KINDS.find(([, re]) => re.test(t)) || [null])[0];
  if (n === null) { const m = /(\d+)\s*\.?\s*$/.exec(t) || /\s(\d+)\b/.exec(t); if (m) n = +m[1]; }
  const plain = t.replace(/\d+/g, '').replace(/[^a-zäöüß]+/g, '');
  return { kind, n, plain };
}

/**
 * Ordnet die Ablauf-Zeilen den Abschnitten des Blatts zu.
 * sections: Abschnittsnamen in Blatt-Reihenfolge.
 * → { at: Map(Abschnitts-Index → [Zeilen]), unmatched: [Zeilen], rows: bereinigter Ablauf }
 * Regeln: gleiche Art und gleiche Nummer gewinnt; eine Zeile ohne Nummer („Refrain“) gilt für jeden
 * Abschnitt dieser Art, der keine eigene Zeile hat. Ohne Nummer im Blatt zählt das Vorkommen
 * (zweiter „Chorus“ = Refrain 2). Unbekannte Namen passen nur bei gleichem Wortlaut.
 */
export function matchFlow(flow, sections) {
  const rows = cleanFlow(flow);
  const at = new Map();
  const used = new Set();
  const keys = rows.map((r) => sectionKey(r.part));
  const count = {};
  (sections || []).forEach((text, i) => {
    const k = sectionKey(text);
    let hit = -1;
    if (k.kind) {
      count[k.kind] = (count[k.kind] || 0) + 1;
      const n = k.n || count[k.kind];
      hit = keys.findIndex((rk) => rk.kind === k.kind && rk.n === n);
      if (hit < 0) hit = keys.findIndex((rk) => rk.kind === k.kind && rk.n === null);
    } else if (k.plain) {
      hit = keys.findIndex((rk) => !rk.kind && rk.plain === k.plain);
    }
    if (hit >= 0) { at.set(i, [rows[hit]]); used.add(hit); }
  });
  const unmatched = rows.filter((r, i) => !used.has(i) && (r.voc || r.solo || r.fx));
  return { at, unmatched, rows };
}

/** Kleine Schilder für eine Ablauf-Zeile (ohne den Abschnittsnamen). */
export function flowBadges(r) {
  const out = [];
  if (r.voc) out.push(`<span class="fl fl-voc" title="Gesang">🎤 ${esc(r.voc)}</span>`);
  if (r.solo) out.push(`<span class="fl fl-solo" title="Solo">★ ${esc(r.solo)}</span>`);
  if (r.fx) out.push(`<span class="fl fl-fx" title="Effekt / Hinweis fürs Mischpult">◎ ${esc(r.fx)}</span>`);
  return out.join('');
}

/** Ganzer Ablauf als Leiste (für Blätter ohne passende Abschnitte). */
export function flowBarHtml(rows) {
  if (!rows.length) return '';
  return `<div class="flowbar">${rows.map((r) => `<span class="flitem">${r.part ? `<b>${esc(r.part)}</b>` : ''}${flowBadges(r)}</span>`).join('')}</div>`;
}

/** Kurzfassung als Text, z. B. für die Paket-Vorschau: „Str. 1: Este · Solo: ★ Git“ */
export function flowText(flow) {
  return cleanFlow(flow).map((r) => {
    const bits = [r.voc, r.solo && `Solo ${r.solo}`, r.fx].filter(Boolean).join(', ');
    return r.part ? `${r.part}${bits ? ': ' + bits : ''}` : bits;
  }).join(' · ');
}
