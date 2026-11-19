// SoulTape Stage – visuelles Metronom
// Ein Ball wandert im Songtempo von links nach rechts und zurück; jede Umkehr ist ein Schlag.
// Genauigkeit: Die Position wird in jedem Bild aus der Uhrzeit berechnet (performance.now), nicht Bild für
// Bild weitergezählt. Ein langsames Gerät zeigt also weniger Zwischenbilder, aber nie ein falsches Tempo.
// Der hörbare Klick wird über die Audio-Uhr des Browsers im Voraus eingeplant (nicht per setTimeout).

let m = null;          // laufendes Metronom: { key, bpm, beats, t0, accent, click, el, ... }
let audio = null;      // AudioContext, erst nach einem Tippen (iPad verlangt das)

const now = () => performance.now();
const period = (bpm) => 60000 / bpm;

/**
 * Wo steht der Ball zum Zeitpunkt t? Reine Rechnung, ohne Bildschirm – dadurch testbar.
 * → { n: Schlag-Nummer seit Start, x: 0 (links) … 1 (rechts), since: ms seit dem letzten Schlag, beat: 0 = Eins }
 */
export function metroAt(t, t0, bpm, beats = 4) {
  const p = period(bpm);
  const b = (t - t0) / p;
  const n = Math.floor(b);
  const f = b - n;
  const x = ((n % 2) + 2) % 2 === 0 ? f : 1 - f;   // gerade Schläge: links → rechts, ungerade: zurück
  const beat = ((n % beats) + beats) % beats;
  return { n, x, since: f * p, beat };
}

/** HTML der Leiste (Position oben im Notenbalken oder fest unten am Bildschirm). */
export function metroHtml(bpm, beats, { accent = false, bottom = false } = {}) {
  const dots = accent ? `<span class="mt-dots">${Array.from({ length: beats }, (_, i) => `<i data-b="${i}">${i + 1}</i>`).join('')}</span>` : '';
  return `<div class="metro${bottom ? ' bottom' : ''}" id="metro" role="button" aria-label="Metronom ${bpm} BPM – tippen setzt den Schlag neu">
    <span class="mt-bpm">${bpm}</span>${dots}
    <span class="mt-track"><span class="mt-end l"></span><span class="mt-end r"></span><span class="mt-ball"></span></span>
  </div>`;
}

/**
 * Startet das Metronom in der Leiste el. key = Song: Wird dieselbe Ansicht neu gezeichnet
 * (z. B. nach dem Transponieren), läuft der Takt ohne Sprung weiter.
 */
export function startMetro(el, { key, bpm, beats = 4, accent = false, click = false }) {
  const keep = m && m.key === key && m.bpm === bpm;
  const t0 = keep ? m.t0 : now();
  const lastN = keep ? m.lastN : null;
  stopMetro(true);
  m = { key, bpm, beats, accent, click, t0, lastN, el, raf: 0, timer: 0, nextN: null,
    ball: el.querySelector('.mt-ball'), track: el.querySelector('.mt-track'),
    endL: el.querySelector('.mt-end.l'), endR: el.querySelector('.mt-end.r'),
    dots: [...el.querySelectorAll('.mt-dots i')], range: 0 };
  measure();
  // Tippen auf die Leiste: Dieser Moment ist ein Schlag (mit hervorgehobener Eins: die Eins)
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    unlockAudio();
    if (!m) return;
    // Zeitstempel des Tippens selbst (genauer als „jetzt“, falls der Browser kurz beschäftigt war)
    const ts = e.timeStamp > 0 && Math.abs(now() - e.timeStamp) < 200 ? e.timeStamp : now();
    m.t0 = ts; m.lastN = null; m.nextN = null;
    el.classList.remove('tapped'); void el.offsetWidth; el.classList.add('tapped');
  });
  m.raf = requestAnimationFrame(frame);
  if (click) { unlockAudio(); m.timer = setInterval(schedule, 25); }
}

/** Hält das Metronom an (beim Verlassen des Songs). keepPhase: intern beim Neuzeichnen. */
export function stopMetro(keepPhase = false) {
  if (!m) return;
  cancelAnimationFrame(m.raf);
  clearInterval(m.timer);
  if (!keepPhase) m = null;
}

/** Läuft gerade ein Metronom für diesen Song? (für den Ein/Aus-Knopf) */
export const metroRunning = () => !!m;

function measure() {
  if (!m) return;
  const tw = m.track.clientWidth, bw = m.ball.offsetWidth;
  m.range = Math.max(0, tw - bw);
}
window.addEventListener('resize', measure);
window.addEventListener('orientationchange', () => setTimeout(measure, 300));

function frame(t) {
  if (!m) return;
  // rAF liefert den Zeitpunkt des Bildes; zur Sicherheit mit performance.now abgleichen
  const tt = typeof t === 'number' && Math.abs(t - now()) < 100 ? t : now();
  const { n, x, since, beat } = metroAt(tt, m.t0, m.bpm, m.beats);
  if (!m.range) measure();
  m.ball.style.transform = `translateX(${(x * m.range).toFixed(1)}px)`;
  // Aufleuchten auf dem Schlag: hell im Moment des Schlags, klingt in 180 ms ab – zeitbasiert, nicht pro Bild
  const glow = Math.max(0, 1 - since / 180);
  const one = m.accent && beat === 0;
  const atRight = ((n % 2) + 2) % 2 === 1;   // Schlag n endet links (gerade) bzw. rechts (ungerade)
  m.endL.style.opacity = atRight ? 0.25 : 0.25 + 0.75 * glow;
  m.endR.style.opacity = atRight ? 0.25 + 0.75 * glow : 0.25;
  m.ball.classList.toggle('hit', glow > 0.3);
  m.ball.classList.toggle('one', one && glow > 0.3);
  m.el.classList.toggle('one', one && glow > 0.3);
  if (n !== m.lastN) {
    m.lastN = n;
    m.dots.forEach((d, i) => d.classList.toggle('on', i === beat));
  }
  m.raf = requestAnimationFrame(frame);
}

// ---------- hörbarer Klick ----------
function unlockAudio() {
  if (!m || !m.click) return;
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch (e) { audio = null; }
}

/** Plant die Klicks der nächsten 120 ms auf der Audio-Uhr ein. */
function schedule() {
  if (!m || !audio || audio.state !== 'running' || document.hidden) return;
  const p = period(m.bpm);
  const pn = now();
  // Audio-Uhr ↔ performance.now: getOutputTimestamp berücksichtigt auch die Ausgabeverzögerung
  let ctxT = audio.currentTime, perfT = pn;
  try { const ts = audio.getOutputTimestamp?.(); if (ts && ts.performanceTime > 0) { ctxT = ts.contextTime; perfT = ts.performanceTime; } } catch (e) { /* egal */ }
  if (m.nextN === null) m.nextN = Math.ceil((pn - m.t0) / p);
  for (;;) {
    const T = m.t0 + m.nextN * p;
    if (T > pn + 120) break;
    const at = ctxT + (T - perfT) / 1000;
    if (at >= audio.currentTime) {
      const beat = ((m.nextN % m.beats) + m.beats) % m.beats;
      tick(at, m.accent && beat === 0);
    }
    m.nextN++;
  }
}

function tick(at, one) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.frequency.value = one ? 1760 : 1180;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(one ? 0.9 : 0.6, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
  o.connect(g).connect(audio.destination);
  o.start(at); o.stop(at + 0.05);
}
