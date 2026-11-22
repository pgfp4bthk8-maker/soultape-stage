// Formulare für „Mein Sound“: einrichten (Einstellungen) und pro Song eintragen (Bearbeiten).
// Beide zeichnen nur ihren eigenen Kasten neu, damit Eingaben im Rest der Seite stehen bleiben.

import { state, save, uid } from './store.js';
import { cleanRig, cleanMine, hasMine, resolvePart, partOptions, sameSet, sortFx, COLORS, PICKUP_SETS, SCENES } from './mine.js';
import { sectionKey, matchRows } from './flow.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const option = (value, label, cur) => `<option value="${esc(value)}" ${String(value) === String(cur) ? 'selected' : ''}>${esc(label)}</option>`;
const splitList = (t) => [...new Set(t.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean))];
// Immer frisch aus state lesen: Ein anderes Fenster kann die Einstellungen inzwischen geändert haben
const rig = () => cleanRig(state.settings.rig);

function changeRig(fn) {
  const r = rig();
  fn(r);
  state.settings.rig = r;
  return save();
}

// ---------- Einrichten (Einstellungen) ----------
function rigHtml() {
  const r = rig();
  const named = !!(state.settings.profile && state.settings.profile.name);
  return `
    <p class="small muted" style="margin:0">Einmal einrichten, dann pro Song nur noch auswählen. Diese Angaben bleiben bei dir: Sie stehen in deiner Sicherung, aber in keinem Paket für die Band.</p>
    ${named ? '' : '<div class="notice small">Trage oben deinen Namen ein. Dann erkennt die App die Sicherung von jemand anderem und lässt deine Angaben stehen.</div>'}
    <label class="f"><span>Name deines Effektgeräts oder Amps</span><input type="text" id="rigDevice" value="${esc(r.device)}" placeholder="so, wie du es nennst"></label>
    <div><b>Gitarren / Instrumente</b>
      ${r.insts.map((x) => `
        <div class="rigitem" data-inst="${esc(x.id)}">
          <div class="rigrow">
            <label class="f"><span>Name</span><input type="text" data-if="name" value="${esc(x.name)}" placeholder="z. B. rote E-Gitarre"></label>
            <label class="f"><span>Kürzel</span><input type="text" data-if="short" value="${esc(x.short)}" maxlength="6"></label>
            <button class="btn ghost danger" data-idel title="Instrument entfernen">✕</button>
          </div>
          <div class="row swatches">${COLORS.map((c, i) => `<button class="swatch ${c === x.color ? 'on' : ''}" data-color="${c}" style="background:${c}" aria-label="Farbe ${i + 1}" aria-pressed="${c === x.color}"></button>`).join('')}</div>
          <label class="f"><span>Pickup-Stellungen, mit Komma getrennt (leer = kein Schalter)</span><input type="text" data-if="pickups" value="${esc(x.pickups.join(', '))}"></label>
          <div class="row"><span class="small muted">Vorlage:</span>${Object.keys(PICKUP_SETS).map((k) => `<button class="chip" data-pset="${esc(k)}">${esc(k)}</button>`).join('')}</div>
        </div>`).join('') || '<p class="small muted">Noch keine angelegt.</p>'}
      <div class="row" style="margin-top:10px"><button class="btn" id="instAdd">+ Gitarre / Instrument</button></div></div>
    <div><b>Meine Effekte</b> <span class="small muted">(zum Antippen im Song)</span>
      <div class="row" style="margin-top:6px">${r.fx.map((x) => `<button class="chip" data-fxdel="${esc(x)}" title="Aus der Liste nehmen">${esc(x)}&nbsp;<span class="muted">✕</span></button>`).join('')}</div>
      <div class="row" style="margin-top:8px"><input type="text" id="fxNew" placeholder="eigener Effekt" style="flex:1;min-width:0"><button class="btn" id="fxAdd">+ Effekt</button></div></div>`;
}

export function mountRig(box) {
  const draw = () => {
    box.innerHTML = rigHtml();
    const on = (sel, ev, fn) => box.querySelectorAll(sel).forEach((el) => { el[ev] = () => fn(el); });
    const instId = (el) => el.closest('[data-inst]').dataset.inst;
    const changeInst = (id, fn) => changeRig((r) => { const x = r.insts.find((y) => y.id === id); if (x) fn(x); });
    on('#rigDevice', 'onchange', (el) => changeRig((r) => { r.device = el.value.trim(); }));
    // Textfelder zeichnen nicht neu, sonst ginge der nächste Tipp (z. B. auf „+ Gitarre“) verloren
    on('[data-if]', 'onchange', (el) => changeInst(instId(el), (x) => {
      const f = el.dataset.if;
      x[f] = f === 'pickups' ? splitList(el.value) : el.value.trim();
    }));
    on('[data-color]', 'onclick', (el) => { changeInst(instId(el), (x) => { x.color = el.dataset.color; }); draw(); });
    on('[data-pset]', 'onclick', (el) => {
      const set = PICKUP_SETS[el.dataset.pset], id = instId(el);
      const x = rig().insts.find((y) => y.id === id);
      if (!x) return;
      if (x.pickups.length && !sameSet(x.pickups, set) && !confirm('Die Pickup-Stellungen dieses Instruments durch die Vorlage ersetzen?')) return;
      changeInst(id, (y) => { y.pickups = [...set]; });
      draw();
    });
    on('#instAdd', 'onclick', () => {
      const id = uid();
      changeRig((r) => r.insts.push({ id, name: '', short: '', color: COLORS[r.insts.length % COLORS.length], pickups: [] }));
      draw();
      const el = box.querySelector(`[data-inst="${id}"] [data-if="name"]`);
      if (el) el.focus();
    });
    on('[data-idel]', 'onclick', (el) => {
      const id = instId(el), used = state.songs.filter((s) => s.mine && s.mine.inst === id);
      const x = rig().insts.find((y) => y.id === id);
      if (!confirm(`„${(x && x.name) || 'Instrument'}“ entfernen?${used.length ? ` Es ist in ${used.length} Song(s) eingetragen und wird dort auch entfernt.` : ''}`)) return;
      used.forEach((s) => { s.mine.inst = ''; });
      changeRig((r) => { r.insts = r.insts.filter((y) => y.id !== id); });
      draw();
    });
    // Aus der Liste genommen heißt nicht aus den Songs gelöscht: Dort bleibt der Effekt stehen
    on('[data-fxdel]', 'onclick', (el) => {
      if (!confirm(`„${el.dataset.fxdel}“ aus deiner Effektliste nehmen? In Songs, die ihn benutzen, bleibt er stehen.`)) return;
      changeRig((r) => { r.fx = r.fx.filter((x) => x !== el.dataset.fxdel); });
      draw();
    });
    on('#fxAdd', 'onclick', () => {
      const v = box.querySelector('#fxNew').value.trim();
      if (!v) return;
      changeRig((r) => { if (!r.fx.some((x) => x.toLowerCase() === v.toLowerCase())) r.fx.push(v); });
      draw();
    });
  };
  draw();
}

// ---------- Pro Song eintragen (Bearbeiten) ----------
function songHtml(m, r, anchors) {
  const inst = r.insts.find((x) => x.id === m.inst);
  const allFx = [...new Set([...r.fx, ...m.fx, ...m.parts.flatMap((p) => p.fx || [])])];
  const std = resolvePart(m);
  const like = (v) => `wie Standard${v ? ` (${v})` : ''}`;
  const pickup = (i, cur, empty) => {
    const opts = inst ? [...inst.pickups] : [];
    const old = cur && !opts.includes(cur);
    if (!opts.length && !cur) return '';
    return `<label class="f"><span>Pickup</span><select data-mf="pickup" data-i="${i}">${option('', empty, cur)}${opts.map((v) => option(v, v, cur)).join('')}${old ? option(cur, `${cur} (nicht in der Liste)`, cur) : ''}</select></label>`;
  };
  const fields = (i, v) => {
    const part = i >= 0;
    return `<div class="myfields">
      ${pickup(i, v.pickup || '', part ? like(std.pickup) : '–')}
      <label class="f"><span>Preset (Nummer oder Name)</span><input type="text" data-mf="preset" data-i="${i}" value="${esc(v.preset || '')}" placeholder="${esc(part ? like(std.preset) : '')}"></label>
      <label class="f"><span>Scene</span><select data-mf="scene" data-i="${i}">${option('', part ? like(std.scene) : '–', v.scene || '')}${SCENES.map((n) => option(n, n, v.scene || '')).join('')}</select></label>
    </div>`;
  };
  const chips = (i, fx) => allFx.map((x) => `<button class="chip ${fx.includes(x) ? 'on' : ''}" data-mfx="${esc(x)}" data-i="${i}" aria-pressed="${fx.includes(x)}">${fx.includes(x) ? '✓ ' : ''}${esc(x)}</button>`).join('');
  const note = (i, v) => `<label class="f"><span>Notiz</span><input type="text" data-mf="note" data-i="${i}" value="${esc(v || '')}" placeholder="${i < 0 ? '' : 'z. B. erst ab Takt 5'}"></label>`;
  const options = partOptions(anchors).filter((o) => !m.parts.some((p) => p.part === o.value));
  const placed = new Set(matchRows(m.parts.map((p) => p.part), anchors).values());

  return `
    <p class="small muted" style="margin:0">Erst der Standard für den ganzen Song, dann nur die Parts, die abweichen. Alles Leere gilt wie der Standard.</p>
    <div class="card stack mycard"><b>Standard</b>
      ${r.insts.length
        ? `<label class="f"><span>Gitarre / Instrument</span><select id="myInst">${option('', '–', m.inst)}${r.insts.map((x) => option(x.id, x.name || x.short || 'ohne Namen', m.inst)).join('')}</select></label>`
        : '<p class="small muted" style="margin:0">Gitarren mit ihren Pickup-Stellungen legst du einmal unter <a href="#/einstellungen">Einstellungen → Mein Sound</a> an.</p>'}
      ${fields(-1, m)}
      <div><div class="small muted myfxhead">Effekte, die an sind</div><div class="row">${chips(-1, m.fx)}</div></div>
      ${note(-1, m.note)}
    </div>
    ${m.parts.map((p, i) => `
      <div class="card stack mycard part">
        <div class="row"><b class="mypart">${esc(p.part)}</b>${anchors.length && !placed.has(i) ? '<span class="badge warn">steht als Leiste über dem Blatt</span>' : ''}<span style="flex:1"></span>
          <button class="btn ghost danger" data-mdel="${i}" title="Part entfernen">✕</button></div>
        ${fields(i, p)}
        <div><div class="row myfxhead"><span class="small muted">${p.fx ? (p.fx.length ? 'Effekte: eigene Auswahl' : 'Effekte: keine') : 'Effekte: wie Standard'}</span>
          ${p.fx ? `<button class="chip" data-mreset="${i}">↺ wie Standard</button>` : ''}</div>
          <div class="row">${chips(i, p.fx || m.fx)}</div></div>
        ${note(i, p.note)}
      </div>`).join('')}
    <div><b>Part mit Abweichung hinzufügen</b>
      <div class="small muted">${options.length ? 'Aus den Abschnitten deines Blatts:' : (anchors.length ? 'Alle Abschnitte deines Blatts sind schon angelegt.' : 'Dein Blatt hat keine Abschnitte. Gib den Part selbst ein, er steht dann als Leiste über dem Blatt.')}</div>
      <div class="row" style="margin-top:6px">${options.map((o) => `<button class="chip" data-madd="${esc(o.value)}">+ ${esc(o.label)}</button>`).join('')}</div>
      <div class="row" style="margin-top:8px"><input type="text" id="myPartNew" placeholder="eigener Part-Name" style="flex:1;min-width:0"><button class="btn" id="myPartAdd">+ Part</button></div></div>`;
}

/** song: Song aus state; anchors: () → Abschnitte des aktiven Blatts. */
export function mountSong(box, song, anchors) {
  const read = () => cleanMine(song.mine);
  const change = (fn) => {
    const m = read();
    fn(m);
    if (hasMine(m)) song.mine = m; else delete song.mine;
    save();
  };
  const target = (m, i) => (i < 0 ? m : m.parts[i]);
  const draw = () => {
    box.innerHTML = songHtml(read(), rig(), anchors());
    const on = (sel, ev, fn) => box.querySelectorAll(sel).forEach((el) => { el[ev] = () => fn(el); });

    on('#myInst', 'onchange', (el) => {
      const inst = rig().insts.find((x) => x.id === el.value);
      const m = read();
      const unfit = (v) => !!(v && inst && !inst.pickups.includes(v));
      const n = [m.pickup, ...m.parts.map((p) => p.pickup)].filter(unfit).length;
      if (n && !confirm(`${n} eingetragene Pickup-Stellung(en) gibt es an „${inst.name || 'diesem Instrument'}“ nicht. Wechseln und diese leeren?`)) { draw(); return; }
      change((x) => {
        x.inst = el.value;
        if (unfit(x.pickup)) x.pickup = '';
        x.parts.forEach((p) => { if (unfit(p.pickup)) delete p.pickup; });
      });
      draw();
    });

    on('[data-mf]', 'onchange', (el) => {
      const i = +el.dataset.i, f = el.dataset.mf;
      change((m) => {
        const t = target(m, i);
        if (!t) return;
        const v = f === 'scene' ? (+el.value || null) : el.value.trim();
        if (i >= 0 && !v) delete t[f]; else t[f] = v;
      });
      if (el.tagName === 'SELECT') { draw(); return; }
      // Textfeld: nicht neu zeichnen, nur die „wie Standard“-Hinweise nachziehen
      if (f === 'preset' && i < 0) {
        box.querySelectorAll('[data-mf="preset"]').forEach((x) => {
          if (+x.dataset.i >= 0) x.placeholder = `wie Standard${el.value.trim() ? ` (${el.value.trim()})` : ''}`;
        });
      }
    });

    on('[data-mfx]', 'onclick', (el) => {
      const i = +el.dataset.i, name = el.dataset.mfx;
      change((m) => {
        const t = target(m, i);
        if (!t) return;
        const now = i < 0 ? m.fx : (t.fx || m.fx);
        const next = sortFx(now.includes(name) ? now.filter((x) => x !== name) : [...now, name], rig().fx);
        // Im Part: wieder gleich wie der Standard → folgt ihm wieder
        if (i >= 0 && sameSet(next, m.fx)) delete t.fx; else t.fx = next;
      });
      draw();
    });
    on('[data-mreset]', 'onclick', (el) => {
      change((m) => { const p = m.parts[+el.dataset.mreset]; if (p) delete p.fx; });
      draw();
    });
    on('[data-mdel]', 'onclick', (el) => {
      const i = +el.dataset.mdel, p = read().parts[i];
      if (!p) return;
      if (Object.keys(p).length > 1 && !confirm(`„${p.part}“ mit seinen Abweichungen entfernen?`)) return;
      change((m) => { m.parts.splice(i, 1); });
      draw();
    });

    const add = (name) => {
      const part = name.trim();
      if (!part) return;
      change((m) => {
        if (m.parts.some((p) => p.part.toLowerCase() === part.toLowerCase())) return;
        const k = sectionKey(part);
        // „Chorus 3“ startet mit dem, was für alle Chorusse eingetragen ist
        const base = k.kind && k.n !== null ? m.parts.find((p) => { const b = sectionKey(p.part); return b.kind === k.kind && b.n === null; }) : null;
        m.parts.push({ ...(base || {}), part });
      });
      draw();
    };
    on('[data-madd]', 'onclick', (el) => add(el.dataset.madd));
    on('#myPartAdd', 'onclick', () => add(box.querySelector('#myPartNew').value));
  };
  draw();
}
