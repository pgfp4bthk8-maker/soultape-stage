// Startdaten: Sound-Lexikon und erste Songs mit Soundvorschlägen.
// WICHTIG: Hier stehen bewusst KEINE Songtexte. Texte und Akkorde importierst
// du selbst; sie bleiben lokal auf deinem Gerät und landen nicht auf GitHub.
//
// Alle Einstellwerte sind Startpunkte (Skala 0–10 wie auf den Reglern).
// Im Proberaum mit der Band prüfen und nach Gehör anpassen.

export const SEED_VERSION = 7;

// ---------- Sound-Lexikon ----------
export const LEXICON = [
  { id: 'grand', name: 'Grand (Flügel)', section: 'piano', cat: 'Grand',
    text: 'Der volle, klassische Klaviersound. Viel Bass, viel Glanz. Ideal für Balladen und alles, wo „Klavier“ gefragt ist.',
    examples: ['Someone Like You – Adele', 'Let It Be – The Beatles'],
    tip: 'In einer lauten Band wirkt ein Flügel schnell dumpf: TIMBRE auf MID oder BRIGHT hilft beim Durchsetzen.' },
  { id: 'upright', name: 'Upright (Klavier)', section: 'piano', cat: 'Upright',
    text: 'Das Wohnzimmer-Klavier: enger, mittiger und etwas „ehrlicher“ als der Flügel. Setzt sich in Rock-Bands gut durch.',
    examples: ['Bennie and the Jets – Elton John', 'Rock’n’Roll-Klassiker'],
    tip: 'Für Boogie und Rock’n’Roll ein Upright mit hellem Timbre und wenig Hall wählen.' },
  { id: 'egrand', name: 'Electric Grand (CP80)', section: 'piano', cat: 'Electric Grand',
    text: 'Elektrisch verstärkter Flügel, hell und leicht metallisch. Der typische 80er-Klang.',
    examples: ['In the Air Tonight – Phil Collins', 'a-ha, Genesis'],
    tip: 'Mit etwas Chorus (MOD 2 → CHOR) klingt er sofort nach 80ern.' },
  { id: 'rhodes', name: 'Rhodes', section: 'piano', cat: 'Electric',
    text: 'Weich, glockig und warm. Bei hartem Anschlag knurrt es leicht. Oft mit Tremolo/Pan oder Phaser.',
    examples: ['Just the Way You Are – Billy Joel', 'Riders on the Storm – The Doors'],
    tip: 'MOD 1 → PAN 1 mit langsamer Rate lässt den Klang zwischen links und rechts wandern – mit Stereo-In-Ears ein Genuss.' },
  { id: 'wurli', name: 'Wurlitzer', section: 'piano', cat: 'Electric',
    text: 'Rauer und frecher als ein Rhodes, mit leicht schnarrendem Ton. Toll für Soul, Pop und Funk.',
    examples: ['What’d I Say – Ray Charles', 'Dreamer – Supertramp'],
    tip: 'Tremolo (MOD 1 → TREM) gehört beim Wurli fast immer dazu.' },
  { id: 'clav', name: 'Clavinet', section: 'piano', cat: 'Clavinet',
    text: 'Perkussiv, funky, zupfend – funktioniert eher wie eine Rhythmusgitarre.',
    examples: ['Superstition – Stevie Wonder'],
    tip: 'Kurz und rhythmisch spielen. Ein Wah (MOD 1 → WAH) macht es noch funkiger.' },
  { id: 'b3', name: 'B3 / Hammond-Orgel', section: 'organ', cat: 'B3',
    text: 'Die Rockorgel schlechthin. Den Grundklang mischst du mit den Zugriegeln, den typischen Schwirr-Effekt liefert der Rotary (Leslie).',
    examples: ['A Whiter Shade of Pale – Procol Harum', 'Smoke on the Water – Deep Purple'],
    tip: 'Zugriegel-Zahlen lesen sich von links nach rechts: „888000000“ heißt die ersten drei ganz herausgezogen, der Rest drin. Mit SLOW/FAST am Rotary wechselst du live die Leslie-Geschwindigkeit – ohne neues Programm.' },
  { id: 'farfvox', name: 'Farfisa / Vox', section: 'organ', cat: 'Farf / Vox',
    text: 'Dünnere, quäkige 60er-Orgeln mit Garage-Charme.',
    examples: ['96 Tears – ? & the Mysterians', 'Light My Fire – The Doors'],
    tip: 'Ohne Rotary spielen, eher mit etwas Hall.' },
  { id: 'pad', name: 'Pad / Fläche', section: 'synth', cat: 'Pad',
    text: 'Weicher, lang klingender Teppich im Hintergrund. Füllt den Klang, ohne Gitarren und Gesang zu stören.',
    examples: ['Pride – U2 (Intro)', 'Use Somebody – Kings of Leon'],
    tip: 'ATTACK etwas aufdrehen, damit der Klang einschwebt, und RELEASE länger, damit er sanft ausklingt.' },
  { id: 'strings', name: 'Streicher', section: 'synth', cat: 'Strings',
    text: 'Gesampelte Streicher aus der Synth-Sektion. Ersetzen Orchester-Parts aus dem Original.',
    examples: ['Bitter Sweet Symphony – The Verve'],
    tip: 'Gut als zweite Ebene zum Klavier: Synth-Sektion zuschalten und LEVEL leise halten.' },
  { id: 'brass', name: 'Synth-Brass / Bläser', section: 'synth', cat: 'Brass',
    text: 'Kräftige Bläser- oder 80er-Synth-Bläser-Klänge für Riffs und Akzente.',
    examples: ['Jump – Van Halen (Synth)', 'Final Countdown – Europe'],
    tip: 'Kurze, akzentuierte Akkorde wirken am besten.' },
  { id: 'lead', name: 'Synth-Lead', section: 'synth', cat: 'Lead',
    text: 'Einstimmiger Solo-Synth für Melodien und Licks.',
    examples: ['80er-Pop-Hooks'],
    tip: 'VOICE MODE auf MONO oder LEGATO, eventuell etwas GLIDE.' },
];

// ---------- „Mein Nord“: was auf Chris' Nord Electro 7 installiert ist ----------
// Quelle: Nord Sound Manager → File → Export Sound Lists (Stand 14.11.2026).
// Bei neuen Klängen auf dem Instrument die Liste neu exportieren und hier anpassen.
const NORD_HAS = {
  grand: ['Kategorie Grand: White Grand, Astoria Grand, Royal Grand 3D, Studio Grand 2'],
  upright: ['Kategorie Upright: Amber Upright, Felt Upright, Pearl Upright, Bambino Upright'],
  egrand: ['Kategorie Grand: EGrand 3'],
  rhodes: ['Kategorie Electric: EP1 Deep Timbre, EP2 Ideal Timbre, EP3 Shallow Close, EP5 BrightTines, EP6 Sparkletop, EP8 Nefertiti, EP9 Stockholm'],
  wurli: ['Kategorie Electric: Wurlitzer 1, Wurlitzer 2'],
  clav: ['Kategorie Clavinet: Clavinet D6'],
  pad: ['ANALOG: Soft Pad 1, Cotton Pad, Sweet Pad, Silk Pad', 'SAMPLES, Kategorie Synth Pad: Sweet Saw Pad 1, Sweet Saw Pad 2, Super M Pad'],
  strings: ['SAMPLES, Kategorie Strings Ensemble: OrchStrings Legato, Cinematic Strings Leg, Spitfire String Quintet, SymphStr XSoft Amb, Pop Strings'],
  brass: ['ANALOG: 1984 Brass, Rich Brass, Brilliant Brass', 'SAMPLES, Kategorie Brass Ensemble: Supreme Soul, Brass Section Pop 3', 'SAMPLES, Kategorie Brass Solo: Trumpet'],
  lead: ['ANALOG: Uni Saw Lead, Detune Saw Lead, Super Lead, Big Supersaw', 'SAMPLES, Kategorie Synth Lead: Triple Saw Lead 1, Massive Lead'],
};
LEXICON.forEach((l) => { l.nord = NORD_HAS[l.id] || []; });

// Standard-Klang je Piano-Kategorie und weitere Möglichkeiten zum Ausprobieren
const NORD_PIANO = {
  Grand: { name: 'White Grand', alt: 'Astoria Grand, Royal Grand 3D' },
  Upright: { name: 'Amber Upright', alt: 'Pearl Upright, Felt Upright' },
  Electric: { name: 'EP1 Deep Timbre', alt: 'EP2 Ideal Timbre, EP9 Stockholm' },
  Clavinet: { name: 'Clavinet D6', alt: '' },
};

// Standard-Klang der Synth-Sektion je Bereich (SAMPLES/ANALOG) und Klangart
const NORD_SYNTH = {
  'SAMPLES/Strings': { bank: 'Strings Ensemble', name: 'OrchStrings Legato', alt: 'Cinematic Strings Leg, Spitfire String Quintet' },
  'SAMPLES/Pad': { bank: 'Synth Pad', name: 'Sweet Saw Pad 2', alt: 'Sweet Saw Pad 1, Super M Pad' },
  'SAMPLES/Brass': { bank: 'Brass Solo', name: 'Trumpet', alt: 'Kategorie Brass Ensemble: Supreme Soul' },
  'SAMPLES/Choir': { bank: 'Choir', name: 'Men+Women Ah', alt: 'Men+Boys Oo' },
  'ANALOG/Pad': { name: 'Soft Pad 1', alt: 'Cotton Pad, Sweet Pad, Silk Pad' },
  'ANALOG/Brass': { name: '1984 Brass', alt: 'Rich Brass, Brilliant Brass' },
  'ANALOG/Lead': { name: 'Uni Saw Lead', alt: 'Detune Saw Lead, Super Lead, Big Supersaw' },
  'SAMPLES/BrassEns': { bank: 'Brass Ensemble', name: 'Brass Section Pop 3', alt: 'Supreme Soul' },
  'ANALOG/Bass': { name: 'Funk Saw Bass', alt: 'Oh1 Bass, Statement Bass' },
};

const synthPick = (type, cat, name) => {
  const n = NORD_SYNTH[`${type}/${cat}`] || {};
  const pick = name || n.name;
  const alt = !name && n.alt ? ` Zum Ausprobieren auch: ${n.alt}.` : '';
  if (!pick) return `Kategorie „${cat}“ wählen und mit dem Rad einen Klang aussuchen. Rad drücken = bestätigen.`;
  return n.bank
    ? `Kategorie „${n.bank}“ wählen und mit dem Rad den Klang „${pick}“ aussuchen. Rad drücken = bestätigen.${alt}`
    : `Mit dem Rad den Klang „${pick}“ aussuchen. Rad drücken = bestätigen.${alt}`;
};

// ---------- Bausteine für Anleitungen ----------
const S = (s, c, t, extra = {}) => ({ s, c, t, ...extra });

const store = (name) => [
  S('program', 'prg-store', `Zum Speichern: SHIFT gedrückt halten und STORE drücken (= STORE AS…). So kannst du den Namen „${name}“ eingeben.`),
  S('program', 'prg-dial', 'Mit dem PROGRAM-Rad einen freien Speicherplatz wählen und mit STORE bestätigen.'),
];

const sectionsOnly = (on) => {
  const all = { organ: 'Orgel', piano: 'Piano', synth: 'Synth' };
  const off = Object.keys(all).filter((k) => !on.includes(k)).map((k) => all[k]);
  const ids = { organ: 'org-on', piano: 'pno-on', synth: 'syn-on' };
  const steps = on.map((k) => S(k, ids[k], `${all[k]}-Sektion einschalten: ON drücken, bis die LED leuchtet.`));
  if (off.length) steps.unshift(S('program', 'prg-display', `Mit einem freien oder unwichtigen Programm starten. Schalte ${off.join(' und ')} aus (jeweils ON-Taste, LED aus).`));
  return steps;
};

const focus = (sel) => S('effects', 'fx-focus', `FX FOCUS drücken, bis ${sel} leuchtet – jetzt bearbeitest du die Effekte dieser Sektion.`, { sel });

const reverb = (type, mix, tone = 'DARK') => [
  S('effects', 'fx-rev-on', 'Reverb einschalten (ON).'),
  S('effects', 'fx-rev-type', `Hall-Typ ${type} wählen.`, { sel: type }),
  S('effects', 'fx-rev-tone', `Klangfarbe ${tone === 'DARK' ? 'DARK – wärmer, stört den Gesang weniger' : 'BRIGHT – heller, luftiger'}.`, { sel: tone }),
  S('effects', 'fx-rev-mix', `DRY/WET auf ca. ${mix}. Lieber zu wenig als zu viel – mit In-Ears hörst du Hall sehr deutlich.`, { val: mix }),
];

const organB3 = ({ drawbars, drive = 3, perc = false, level = 7 }) => [
  S('organ', 'org-model', 'Orgelmodell B3 wählen.', { sel: 'B3' }),
  S('organ', 'org-p1', 'PRESET 1 wählen. (Mit LIVE gelten immer die echten Zugriegel-Stellungen.)'),
  S('organ', 'org-drawbars', `Zugriegel auf ${drawbars} ziehen (von links nach rechts, 0 = ganz drin, 8 = ganz raus).`, { drawbars }),
  S('organ', 'org-vib-on', 'Vibrato/Chorus aus lassen (LED aus).'),
  S('organ', 'org-perc-on', perc ? `Percussion einschalten (ON). ${perc}` : 'Percussion aus lassen.'),
  S('organ', 'org-level', `LEVEL auf ca. ${level}.`, { val: level }),
  S('organ', 'rot-on', 'Rotary einschalten (ON).'),
  S('organ', 'rot-target', 'SHIFT + ON am Rotary, bis ORG leuchtet: Der Leslie wirkt auf die Orgel.', { sel: 'ORG' }),
  S('organ', 'rot-drive', `DRIVE auf ca. ${drive} – das ist der Zerr-Anteil.`, { val: drive }),
  S('organ', 'rot-slow', 'Geschwindigkeit auf SLOW. Live schaltest du mit SLOW/FAST um.'),
];

const piano = ({ cat, model, timbre = 'MID', level = 7, extra = '' }) => [
  S('piano', 'pno-library', `PIANO LIBRARY-Rad drücken und Kategorie „${cat}“ wählen, dann mit dem Rad „${model || NORD_PIANO[cat].name}“ aussuchen.${!model && NORD_PIANO[cat].alt ? ` Zum Ausprobieren auch: ${NORD_PIANO[cat].alt}.` : ''}`),
  S('piano', 'pno-timbre', `TIMBRE auf ${timbre}.${extra ? ' ' + extra : ''}`, { sel: timbre }),
  S('piano', 'pno-level', `LEVEL auf ca. ${level}.`, { val: level }),
];

// ---------- Display-Werte ----------
// Der Nord speichert den Wert, der im Display steht – nicht die Stellung des Knopfs.
// Messwerte von Chris' Gerät (links / Mitte / rechts) stehen in docs/NORD-ELECTRO-7.md.
// disp = Zielwert im Display; val = ungefähre Knopfstellung 0–10, nur für den Zeiger in der Landkarte.
const round1 = (x) => Math.round(Math.max(0, Math.min(10, x)) * 10) / 10;
// Zeit-Regler: links min, Mitte 1,2 s, rechts 45 s (ungleichmäßige Skala)
const knobTime = (t, min) => round1(t <= 1.2 ? 5 * Math.log(t / min) / Math.log(1.2 / min) : 5 + 5 * Math.log(t / 1.2) / Math.log(45 / 1.2));
const fmtTime = (t) => (t < 1 ? `${Math.round(t * 1000)} ms` : `${String(t).replace('.', ',')} s`);
const timeStep = (c, label, t, min, why) =>
  S('synth', c, `${label} drehen, bis im Display ca. ${fmtTime(t)} steht – ${why}`, { val: knobTime(t, min), disp: fmtTime(t) });
// Die Bausteine nehmen weiter Stufen entgegen; hier steht, welche Zeit jede Stufe bedeutet.
const ATTACK_S = { 2: 0.2, 3: 0.3, 4: 0.5 };
const RELEASE_S = { 2: 0.2, 3: 0.4, 4: 0.8, 5: 1.2, 6: 1.8 };
// LEVEL-Regler: links Off, Mitte −12 dB, rechts 0 dB
const LEVEL_DB = { 3: -15, 4: -12, 5: -9, 6: -6, 7: -4 };
const fmtDb = (n) => `${LEVEL_DB[n]} dB`.replace('-', '−');
const knobDb = (db) => round1(db >= -12 ? 10 + db * 5 / 12 : 5 + (db + 12) * 5 / 30);

const synthPad = ({ type = 'SAMPLES', cat = 'Pad', name, level = 4, attack = 3, release = 5 }) => [
  S('synth', 'syn-libtype', `SOUND LIBRARY-Rad drücken und ${type} wählen (Soft-Taste unter dem Display).`, { sel: type }),
  S('synth', 'syn-library', synthPick(type, cat, name)),
  timeStep('syn-attack', 'ATTACK', ATTACK_S[attack], 0.0005, 'damit der Klang weich einschwebt.'),
  timeStep('syn-release', 'RELEASE', RELEASE_S[release], 0.003, 'damit er sanft ausklingt.'),
  S('synth', 'syn-level', `LEVEL auf ca. ${level} – die Fläche bleibt im Hintergrund.`, { val: level }),
];

// Kurze, sofort hörbare Synth-Klänge (Bläser-Akzente, Riffs). mono = einstimmig für Melodien.
const synthHit = ({ type = 'ANALOG', cat = 'Brass', name, level = 6, release = 2, mono = false }) => [
  S('synth', 'syn-libtype', `SOUND LIBRARY-Rad drücken und ${type} wählen (Soft-Taste unter dem Display).`, { sel: type }),
  S('synth', 'syn-library', synthPick(type, cat, name)),
  ...(mono ? [S('synth', 'syn-voice', 'VOICE MODE auf MONO – einstimmig, so klingen Melodien sauber.', { sel: 'MONO' })] : []),
  S('synth', 'syn-attack', 'ATTACK ganz nach links drehen, bis im Display 0,5 ms steht – der Klang ist sofort da.', { val: 0, disp: '0,5 ms' }),
  timeStep('syn-release', 'RELEASE', RELEASE_S[release], 0.003, 'kurz, damit Akzente knackig bleiben.'),
  S('synth', 'syn-level', `LEVEL auf ca. ${level}.`, { val: level }),
];

const ON_ID = { organ: 'org-on', piano: 'pno-on', synth: 'syn-on' };
const SEC_NAME = { organ: 'Orgel', piano: 'Piano', synth: 'Synth' };
const on = (sec, why = '') => S(sec, ON_ID[sec], `${SEC_NAME[sec]}-Sektion einschalten (ON)${why ? ' – ' + why : '.'}`);
const off = (sec, why = '') => S(sec, ON_ID[sec], `${SEC_NAME[sec]}-Sektion wieder AUS schalten (ON, LED aus)${why ? ' – ' + why : '.'}`);

const comp = (amount = 3) => [
  S('effects', 'fx-comp-on', 'Kompressor einschalten (COMP ON) – gleicht laute und leise Anschläge an.'),
  S('effects', 'fx-comp-amount', `AMOUNT auf ca. ${amount}.`, { val: amount }),
];

const amp = (type, drive) => [
  S('effects', 'fx-eq-on', 'EQUALIZER / AMP SIM einschalten (ON).'),
  S('effects', 'fx-eq-amp', `Amp-Typ ${type} wählen.`, { sel: type }),
  S('effects', 'fx-eq-drive', `DRIVE auf ca. ${drive} – etwas Verstärker-Crunch.`, { val: drive }),
];

const pan = () => [
  S('effects', 'fx-mod1-on', 'MOD 1 einschalten (ON).'),
  S('effects', 'fx-mod1-type', 'PAN1 wählen – der Klang wandert sanft zwischen links und rechts.', { sel: 'PAN1' }),
  S('effects', 'fx-mod1-rate', 'RATE auf ca. 3 – langsam.', { val: 3 }),
  S('effects', 'fx-mod1-amount', 'AMOUNT auf ca. 4.', { val: 4 }),
];

// Komplettes Orgel-Programm für Rock-Songs
const rockOrgan = (name, { drawbars = '888000000', drive = 4, level = 6, rev = 2, perc = false } = {}) => [
  ...sectionsOnly(['organ']), ...organB3({ drawbars, drive, level, perc }),
  focus('ORG'), ...reverb('ROOM', rev), ...store(name),
];

const whole = (lex, summary, steps, tips = '') => [{ name: 'Ganzer Song', lex, summary, steps, tips }];

// ---------- Songs ----------
const song = (o) => ({
  key: '', durationSec: null, tags: [], notes: '', kawai: '', nordStored: false,
  sheets: [], activeSheet: null, aliases: [], ...o,
  nordProgram: o.nordProgram || o.title,
  nordSlot: o.nordSlot || NORD_SLOTS[o.id] || '',
});

// Speicherplätze auf Chris' Nord (Bank + Platz), Stand 14.11.2026 laut Programmliste aus dem
// Nord Sound Manager. Nur Vorbelegung – die Plätze ändern sich, wenn vor einem Auftritt umsortiert wird.
// Sobald es Setlisten gibt, soll die App den Platz aus der Reihenfolge ausrechnen.
const NORD_SLOTS = {
  denkmal: 'M 11', 'sweet-child-o-mine': 'M 12', 'castle-of-glass': 'M 22', californication: 'M 23',
  'under-the-bridge': 'M 24', uninvited: 'M 25', 'my-immortal': 'M 31', 'dear-mr-president': 'M 32',
  'another-brick-in-the-wall': 'M 33', 'here-i-go-again': 'M 34', 'word-up': 'M 35', 'long-train-runnin': 'M 41',
  'born-to-be-wild': 'M 42', 'whiskey-in-the-jar': 'M 43', 'enter-sandman': 'M 44', 'when-i-come-around': 'M 45',
  tubthumping: 'M 51', 'dont-stop-believin': 'M 52', 'if-everyone-cared': 'M 53', 'with-or-without-you': 'M 54',
  try: 'N 14', smooth: 'N 15', medley: 'N 25',
  'let-me-entertain-you': 'O 11', 'basket-case': 'O 12', 'all-the-small-things': 'O 13', narcotic: 'O 14',
  westerland: 'O 15', 'schrei-nach-liebe': 'O 21', 'sex-on-fire': 'O 22', paranoid: 'O 23', runaway: 'O 24',
  'ndw-medley': 'O 25', 'the-final-countdown': 'O 31', 'dont-look-back-in-anger': 'O 32', centerfold: 'O 33',
  zombie: 'O 34', 'nothing-else-matters': 'O 35', 'not-gonna-take-it': 'O 41',
  'summer-of-69': 'P 24', pride: 'P 25', 'hit-the-road-jack': 'P 31', trouble: 'P 32', 'so-what': 'P 33',
  'use-somebody': 'P 34',
};

export const SEED_SONGS = [
  song({
    id: 'so-what', title: 'So What', artist: 'P!nk', key: 'F#m', tags: ['Party', 'Schnell', 'Mitsingen'],
    parts: [
      { name: 'Ganzer Song', lex: 'b3',
        summary: 'Rock-Orgel (B3) mit leichtem Crunch, im Refrain Leslie schnell.',
        steps: [...sectionsOnly(['organ']), ...organB3({ drawbars: '888000000', drive: 3 }),
          focus('ORG'), ...reverb('ROOM', 2), ...store('So What')],
        tips: 'Ein Programm reicht: Im Refrain einfach am Rotary auf FAST schalten, danach wieder SLOW.' },
    ],
  }),
  song({
    id: 'not-gonna-take-it', title: "We're Not Gonna Take It", artist: 'Twisted Sister', key: 'E',
    aliases: ['We are goona take it', 'We are gonna take it'], tags: ['Mitsingen', 'Party', 'Schnell'],
    parts: [
      { name: 'Ganzer Song', lex: 'b3',
        summary: 'Dreckige Hard-Rock-Orgel, viel Drive, Leslie schnell.',
        steps: [...sectionsOnly(['organ']), ...organB3({ drawbars: '888800000', drive: 6, level: 7 }),
          S('organ', 'rot-fast', 'Für den ganzen Song FAST – das gibt den typischen Rock-Schub.'),
          focus('ORG'), ...reverb('ROOM', 1), ...store("Not Gonna Take It")],
        tips: 'Die Gitarren sind laut: lieber Akkorde in der Mittellage halten und nicht zu tief spielen, sonst matscht es mit Bass und Gitarre.' },
    ],
  }),
  song({
    id: 'trouble', title: 'Trouble', artist: 'P!nk', key: 'G', tags: ['Schnell'],
    parts: [
      { name: 'Ganzer Song', lex: 'upright',
        summary: 'Helles, bissiges Upright-Klavier mit etwas Amp-Crunch.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Upright', timbre: 'BRIGHT', level: 7 }),
          focus('PNO'),
          S('effects', 'fx-eq-on', 'EQUALIZER / AMP SIM einschalten (ON).'),
          S('effects', 'fx-eq-amp', 'Amp-Typ TWIN wählen.', { sel: 'TWIN' }),
          S('effects', 'fx-eq-drive', 'DRIVE auf ca. 2 – nur ein Hauch Crunch.', { val: 2 }),
          ...reverb('ROOM', 2), ...store('Trouble')],
        tips: 'Viele Powerchords (G5, C5, D5): Auf dem Klavier reichen Grundton + Quinte, gern mit Oktave in der linken Hand.' },
    ],
  }),
  song({
    id: 'try', title: 'Try', artist: 'P!nk', key: 'Bm', tags: ['Langsam'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Warmer Flügel, zurückhaltend, mit etwas Hall.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4 }),
          S('synth', 'syn-on', 'Synth wieder AUS schalten – die Streicher kommen erst im Refrain dazu.'),
          focus('PNO'), ...reverb('HALL', 3), ...store('Try')],
        tips: 'Ein Programm für beide Teile: Strophe nur Piano, im Refrain die Synth-Sektion per ON-Taste dazuschalten.' },
      { name: 'Refrain', lex: 'strings',
        summary: 'Flügel + leise Streicherfläche darunter.',
        steps: [S('synth', 'syn-on', 'Im Refrain Synth-Sektion einschalten (ON) – die Streicher kommen dazu.'),
          S('synth', 'syn-level', 'Lautstärke der Streicher mit LEVEL nach Gehör, ca. 4.', { val: 4 })],
        tips: 'Nach dem Refrain Synth wieder ausschalten.' },
    ],
  }),
  song({
    id: 'smooth', title: 'Smooth', artist: 'Santana feat. Rob Thomas', key: 'Am', kawai: '11A EFF',
    tags: ['Party', 'Tanzflächenfüller'],
    parts: [
      { name: 'Ganzer Song', lex: 'grand',
        summary: 'Heller, perkussiver Flügel für Latin-Montunos, kompakt komprimiert.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 7 }),
          focus('PNO'),
          S('effects', 'fx-comp-on', 'Kompressor einschalten (COMP ON) – macht die Montuno-Figuren gleichmäßiger.'),
          S('effects', 'fx-comp-amount', 'AMOUNT auf ca. 3.', { val: 3 }),
          ...reverb('ROOM', 2), ...store('Smooth')],
        tips: 'Montuno = sich wiederholende, rhythmische Latin-Figur. Kurz und knackig spielen, wenig Pedal.' },
    ],
  }),
  song({
    id: 'pride', title: 'Pride (In the Name of Love)', artist: 'U2', key: 'B', tags: ['Mitsingen'],
    parts: [
      { name: 'Ganzer Song', lex: 'pad',
        summary: 'Breite, schwebende Synth-Fläche mit großem Hall.',
        steps: [...sectionsOnly(['synth']), ...synthPad({ type: 'ANALOG', cat: 'Pad', level: 6, attack: 4, release: 6 }),
          focus('SYN'),
          S('effects', 'fx-mod2-on', 'MOD 2 einschalten (ON).'),
          S('effects', 'fx-mod2-type', 'ENS (Ensemble) wählen – macht die Fläche breit.', { sel: 'ENS' }),
          S('effects', 'fx-mod2-amount', 'AMOUNT auf ca. 4.', { val: 4 }),
          ...reverb('HALL', 5, 'BRIGHT'), ...store('Pride')],
        tips: 'Für Steigerungen im Refrain live am Filter (FREQ) etwas aufdrehen – der Klang wird heller.' },
    ],
  }),
  song({
    id: 'hit-the-road-jack', title: 'Hit the Road Jack', artist: 'Ray Charles', key: 'Am', tags: ['Mitsingen', 'Party'],
    parts: [
      { name: 'Ganzer Song', lex: 'upright',
        summary: 'Trockenes Soul-Klavier (Upright), direkt und rhythmisch.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Upright', timbre: 'MID', level: 7 }),
          focus('PNO'), ...reverb('ROOM', 1), ...store('Hit the Road Jack')],
        tips: 'Alternative zum Ausprobieren: Wurlitzer (Kategorie Electric, „Wurlitzer 1“) mit leichtem Tremolo – das ist der Ray-Charles-Sound von „What’d I Say“.' },
    ],
  }),
  song({
    id: 'medley', title: 'Medley: Johnny B. Goode / Rockin’ All Over the World / Proud Mary / Westerland',
    artist: 'Chuck Berry / Status Quo / CCR & Ike & Tina Turner / Die Ärzte', key: 'G',
    nordProgram: 'Medley Johnny', kawai: '33C+11A+11B', aliases: ['Johnny B Good Medley', 'Johnny B Goode Medley'],
    tags: ['Party', 'Abschluss', 'Tanzflächenfüller'],
    parts: [
      { name: 'Johnny B. Goode', lex: 'upright',
        summary: 'Rock’n’Roll-Upright, hell und trocken.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Upright', timbre: 'BRIGHT', level: 7 }),
          focus('PNO'), ...reverb('ROOM', 2),
          S('organ', 'org-model', 'Für später schon vorbereiten: Orgel auf B3 stellen, Zugriegel 888000000, LEVEL ca. 5 – Orgel-Sektion danach wieder AUS.', { sel: 'B3' }),
          S('synth', 'syn-library', 'Ebenso vorbereiten: Synth-Sektion mit einer Fläche (SAMPLES → Kategorie „Synth Pad“ → „Sweet Saw Pad 2“), LEVEL ca. 4 – danach wieder AUS.'),
          ...store('Medley Johnny')],
        tips: 'Ein Programm für das ganze Medley: Das Klavier bleibt immer an, Orgel und Synth schaltest du per ON-Taste zu.' },
      { name: 'Rockin’ All Over the World', lex: 'b3',
        summary: 'Klavier + Rock-Orgel dazu.',
        steps: [S('organ', 'org-on', 'Orgel-Sektion einschalten (ON) – sie liegt jetzt über dem Klavier.'),
          S('organ', 'rot-fast', 'Rotary auf FAST für mehr Schub.')],
        tips: 'Danach Orgel wieder aus.' },
      { name: 'Proud Mary', lex: 'upright',
        summary: 'Nur Klavier, gospelig.',
        steps: [S('organ', 'org-on', 'Orgel-Sektion ausschalten (ON, LED aus).')],
        tips: '' },
      { name: 'Westerland', lex: 'pad',
        summary: 'Klavier (viel Bass in der linken Hand) + Synth-Fläche.',
        steps: [S('synth', 'syn-on', 'Synth-Sektion einschalten (ON).'),
          S('synth', 'syn-level', 'LEVEL der Fläche nach Gehör, ca. 4.', { val: 4 })],
        tips: 'Laut deiner Notiz: hauptsächlich Bass-Piano + Synth.' },
    ],
  }),
  song({
    id: 'summer-of-69', title: 'Summer of ’69', artist: 'Bryan Adams', key: 'D',
    kawai: '11A EFF · 33C EFF Orgel 70 % · 21B EFF', aliases: ['Summer Of 69', 'Summer of 69'],
    tags: ['Mitsingen', 'Party', 'Abschluss'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Kräftiger, heller Flügel.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 7 }),
          ...organB3({ drawbars: '888000000', drive: 2, level: 5 }),
          S('organ', 'org-on', 'Orgel danach wieder AUS – sie kommt erst im Refrain.'),
          focus('PNO'), ...reverb('ROOM', 2), ...store('Summer of 69')],
        tips: 'Der Anfang ist laut deiner Notiz nur Gitarre.' },
      { name: 'Refrain', lex: 'b3',
        summary: 'Flügel + Orgel bei ca. 70 % (wie früher am Kawai).',
        steps: [S('organ', 'org-on', 'Orgel-Sektion einschalten (ON).'),
          S('organ', 'org-level', 'Orgel-LEVEL ca. 5 – entspricht deinen alten 70 %.', { val: 5 })],
        tips: '' },
      { name: 'Synth-Riff', lex: 'brass',
        summary: 'Kurzer Synth-Akzent nach dem Refrain (D2–A2).',
        steps: [S('synth', 'syn-libtype', 'Vorbereitung: Synth-Sektion mit ANALOG → „1984 Brass“ belegen, LEVEL ca. 5.', { sel: 'ANALOG' }),
          S('synth', 'syn-on', 'Für das Riff Synth einschalten (ON), danach wieder aus.')],
        tips: 'Wenn dir das Umschalten zu viel wird: Riff einfach mit Klavier + Orgel spielen.' },
    ],
  }),
  song({
    id: 'use-somebody', title: 'Use Somebody', artist: 'Kings of Leon', key: 'C', kawai: '11A 51A',
    tags: ['Mitsingen', 'Langsam'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Weicher Flügel mit dezentem Delay.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Grand', timbre: 'SOFT', level: 6 }),
          focus('PNO'),
          S('effects', 'fx-dly-on', 'Delay einschalten (ON).'),
          S('effects', 'fx-dly-tap', 'TAP/SET im Songtempo antippen (ca. 69 BPM).'),
          S('effects', 'fx-dly-mix', 'DRY/WET niedrig, ca. 2.', { val: 2 }),
          ...reverb('HALL', 3),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }),
          S('synth', 'syn-on', 'Synth danach wieder AUS – die Fläche kommt im Refrain.'),
          ...store('Use Somebody')],
        tips: '' },
      { name: 'Refrain / „Ooh“-Teil', lex: 'pad',
        summary: 'Flügel + Fläche für die großen „Ooh“-Stellen.',
        steps: [S('synth', 'syn-on', 'Synth-Sektion einschalten (ON).')],
        tips: 'Die Gitarren sind hier sehr breit – die Fläche eher hoch spielen, nicht in der Lage der Gitarren.' },
    ],
  }),

  // ---------- Songs der Setliste „Krimikeller 2026“ (ab Version 0.1.3) ----------
  // Grundlage: das Original des Songs + Chris' eigene Notizen aus der Setliste.
  song({
    id: 'we-will-rock-you', title: 'We Will Rock You', artist: 'Queen', tags: ['Mitsingen'],
    parts: whole('b3', 'Im Original keine Tasten. Für das Gitarrensolo am Schluss: Rock-Orgel als Unterlage.',
      rockOrgan('We Will Rock You', { drive: 4, level: 6 }),
      'Bis zum Solo Pause (Stampfen und Klatschen tragen den Song). Im Solo lange Akkorde halten und den Rotary auf FAST schalten.'),
  }),
  song({
    id: 'i-love-rock-n-roll', title: 'I Love Rock ’n’ Roll', artist: 'Joan Jett', key: 'E', aliases: ['I Love Rock N Roll'],
    tags: ['Mitsingen', 'Party'],
    parts: whole('b3', 'Dreckige Rock-Orgel, die das Gitarrenriff verstärkt.',
      rockOrgan('I Love Rock n Roll', { drawbars: '888800000', drive: 5, level: 6 }),
      'Kurze Akkorde genau auf die Akzente des Riffs, dazwischen Luft lassen. Im Refrain Rotary auf FAST.'),
  }),
  song({
    id: 'denkmal', title: 'Denkmal', artist: 'Wir sind Helden', tags: ['Schnell'],
    parts: whole('b3', 'Orgel (B3) mit Percussion, darunter leise ein Upright-Klavier – nach deiner eigenen Notiz.',
      [...sectionsOnly(['organ', 'piano']),
        ...organB3({ drawbars: '888000000', drive: 4, level: 7, perc: 'Das ist der kurze „Klick“ am Tonanfang.' }),
        ...piano({ cat: 'Upright', timbre: 'MID', level: 3 }),
        focus('ORG'), ...reverb('ROOM', 2), ...store('Denkmal')],
      'Deine Notiz lautet „888000000 + 4/10 + Percussion + Leslie umschalten, Piano Upright 30 %“. Die „4/10“ habe ich als DRIVE 4 eingetragen – bitte am Nord prüfen.'),
  }),
  song({
    id: 'sweet-child-o-mine', title: 'Sweet Child O’ Mine', artist: 'Guns N’ Roses', aliases: ['Sweet Child O Mine'],
    tags: ['Mitsingen'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Im Original keine Tasten. Flügel als Unterstützung der Akkorde.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 6 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }),
          off('synth', 'die Fläche kommt erst im Refrain.'),
          focus('PNO'), ...reverb('ROOM', 2), ...store('Sweet Child')],
        tips: 'Das Intro gehört der Gitarre – erst mit der Band einsteigen.' },
      { name: 'Refrain / Solo', lex: 'pad',
        summary: 'Flügel + Fläche, damit es unter dem Solo voll klingt.',
        steps: [on('synth')],
        tips: 'Danach Synth wieder aus.' },
    ],
  }),
  song({
    id: 'castle-of-glass', title: 'Castle of Glass', artist: 'Linkin Park', key: 'C#m', aliases: ['Castle of Glas'],
    parts: [
      { name: 'Fläche', lex: 'strings',
        summary: 'Breite Streicherfläche als Teppich (deine Notiz: OrchStrings).',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 6, attack: 3, release: 5 }),
          ...piano({ cat: 'Electric', model: 'EP6 Sparkletop', timbre: 'DYNO1', level: 6, extra: 'DYNO macht das Rhodes hell und glockig.' }),
          off('piano', 'das Glocken-Rhodes kommt nur für die Melodie dazu.'),
          focus('SYN'), ...reverb('HALL', 4), ...store('Castle of Glass')],
        tips: 'Laut deiner Notiz erst ab der Mitte mitspielen und eine Oktave tiefer.' },
      { name: 'Melodie', lex: 'rhodes',
        summary: 'Glockiges Rhodes für die Melodie-Töne (deine Notiz: SunBell).',
        steps: [on('piano', 'das Glocken-Rhodes liegt jetzt über den Streichern.')],
        tips: 'Der Nord hat nur eine Synth-Sektion. Deshalb kommt der Glockenklang hier aus der Piano-Sektion.' },
    ],
  }),
  song({
    id: 'californication', title: 'Californication', artist: 'Red Hot Chili Peppers', key: 'Am', tags: ['Mitsingen'],
    parts: [
      { name: 'Strophe', lex: 'rhodes',
        summary: 'Weiches Rhodes, ganz sparsam: einzelne Töne und liegende Akkorde.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Electric', timbre: 'SOFT', level: 6 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }),
          off('synth', 'die Fläche kommt erst im Refrain.'),
          focus('PNO'), ...pan(), ...reverb('HALL', 3), ...store('Californication')],
        tips: 'Die Gitarre spielt eine feine Zupf-Figur – nicht zudecken. Weniger ist hier mehr.' },
      { name: 'Refrain', lex: 'pad',
        summary: 'Rhodes + warme Fläche, die den Refrain öffnet.',
        steps: [on('synth')],
        tips: 'Nach dem Refrain Synth wieder aus.' },
      { name: 'Orgel-Stelle', lex: 'b3',
        summary: 'Weiche Orgel an der Stelle, die du mit „(Orgel)“ markiert hast.',
        steps: [S('organ', 'org-model', 'Vorbereitung: Orgelmodell B3, Zugriegel 808000000, LEVEL ca. 5, Rotary SLOW – Orgel danach wieder AUS.', { sel: 'B3' }),
          on('organ', 'an der markierten Stelle dazuschalten.')],
        tips: 'Ohne Verzerrung spielen, die Orgel soll nur füllen.' },
    ],
  }),
  song({
    id: 'under-the-bridge', title: 'Under the Bridge', artist: 'Red Hot Chili Peppers', key: 'E', tags: ['Langsam'],
    parts: [
      { name: 'Strophe', lex: 'rhodes',
        summary: 'Sehr leises, weiches Rhodes unter der Gitarre.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Electric', timbre: 'SOFT', level: 5 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 5, attack: 4, release: 6 }),
          off('synth', 'die Fläche kommt erst im Schlussteil.'),
          focus('PNO'), ...reverb('HALL', 3), ...store('Under the Bridge')],
        tips: 'Das Intro ist nur Gitarre.' },
      { name: 'Schlussteil', lex: 'pad',
        summary: 'Breite Fläche für den Chor-Teil am Ende.',
        steps: [on('synth')],
        tips: 'Alternative zum Ausprobieren: ein Chor (SAMPLES → Kategorie „Choir“ → „Men+Women Ah“).' },
    ],
  }),
  song({
    id: 'uninvited', title: 'Uninvited', artist: 'Alanis Morissette', key: 'D', tags: ['Langsam'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Dunkler Flügel für die Klavierfigur, ganz leise Streicher darunter.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'SOFT', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Strings', name: 'Cinematic Strings Leg', level: 3, attack: 4, release: 6 }),
          S('synth', 'syn-oct', 'OCT ◀ einmal drücken: Streicher eine Oktave tiefer (deine Notiz „−1 Okt“).'),
          focus('PNO'), ...reverb('HALL', 4), ...store('Uninvited')],
        tips: 'Deine Notiz: Streicher in der linken Hand, leise.' },
      { name: 'Steigerung', lex: 'strings',
        summary: 'Streicher werden groß und tragen den Schluss.',
        steps: [S('synth', 'syn-level', 'Streicher-LEVEL langsam aufdrehen, bis ca. 6.', { val: 6 })],
        tips: 'Danach wieder auf ca. −15 dB zurück.' },
    ],
  }),
  song({
    id: 'my-immortal', title: 'My Immortal', artist: 'Evanescence', key: 'A', tags: ['Langsam'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Weicher Flügel mit viel Hall – das Klavier trägt den ganzen Song.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'SOFT', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Strings', name: 'Cinematic Strings Leg', level: 4, attack: 4, release: 6 }),
          off('synth', 'die Streicher kommen erst, wenn die Band einsetzt.'),
          focus('PNO'), ...reverb('HALL', 4), ...store('My Immortal')],
        tips: '' },
      { name: 'Band-Teil', lex: 'strings',
        summary: 'Flügel + Streicher.',
        steps: [on('synth')],
        tips: '' },
    ],
  }),
  song({
    id: 'with-or-without-you', title: 'With or Without You', artist: 'U2', key: 'D', tags: ['Mitsingen', 'Langsam'],
    parts: whole('pad', 'Streicherfläche + weicher Flügel (deine Notiz: Grand Piano + Live Strings).',
      [...sectionsOnly(['synth', 'piano']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', name: 'SymphStr XSoft Amb', level: 5, attack: 4, release: 6 }),
        ...piano({ cat: 'Grand', timbre: 'SOFT', level: 5 }),
        focus('SYN'), ...reverb('HALL', 4), ...store('With or Without You')],
      'Lange liegende Akkorde. Der Song steigert sich über vier Minuten: leise anfangen und das Synth-LEVEL nach und nach aufdrehen.'),
  }),
  song({
    id: 'dear-mr-president', title: 'Dear Mr. President', artist: 'P!nk', aliases: ['Dear mr president'], tags: ['Langsam'],
    parts: whole('strings', 'Leise, warme Streicher unter der Akustikgitarre.',
      [...sectionsOnly(['synth']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4, attack: 4, release: 6 }),
        focus('SYN'), ...reverb('HALL', 3), ...store('Dear Mr President')],
      'Nur an den Stellen spielen, die du mit „Str:“ markiert hast.'),
  }),
  song({
    id: 'another-brick-in-the-wall', title: 'Another Brick in the Wall', artist: 'Pink Floyd', key: 'Dm', tags: ['Mitsingen'],
    parts: whole('b3', 'Weiche Orgel im Hintergrund, fast ohne Verzerrung.',
      rockOrgan('Another Brick', { drawbars: '808000000', drive: 1, level: 6, rev: 3 }),
      'Liegende Akkorde, viel Platz für Bass und Gitarre. Im Gitarrensolo Rotary auf FAST.'),
  }),
  song({
    id: 'here-i-go-again', title: 'Here I Go Again', artist: 'Whitesnake', key: 'G', tags: ['Mitsingen'],
    parts: [
      { name: 'Intro', lex: 'b3',
        summary: 'Getragene, saubere Orgel, eine Oktave höher (deine Notiz).',
        steps: [...sectionsOnly(['organ', 'piano']), ...organB3({ drawbars: '888000000', drive: 1, level: 7 }),
          S('organ', 'org-oct', 'OCT ▶ einmal drücken: Orgel eine Oktave höher (deine Notiz „+1 Okt“).'),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }),
          off('piano', 'der Flügel kommt erst mit der Band.'),
          focus('ORG'), ...reverb('HALL', 3), ...store('Here I Go Again')],
        tips: '' },
      { name: 'Ab Band-Einsatz', lex: 'grand',
        summary: 'Orgel + heller Flügel.',
        steps: [on('piano')],
        tips: 'Im Refrain Rotary auf FAST.' },
    ],
  }),
  song({
    id: 'word-up', title: 'Word Up', artist: 'Korn', tags: ['Party'],
    parts: whole('brass', 'Fetter Synth-Brass für die Riff-Akzente.',
      [...sectionsOnly(['synth']), ...synthHit({ type: 'ANALOG', cat: 'Brass', level: 6 }),
        focus('SYN'), ...reverb('ROOM', 2), ...store('Word Up')],
      'Kurze, harte Akkorde zusammen mit den Gitarren. Nicht durchspielen.'),
  }),
  song({
    id: 'long-train-runnin', title: 'Long Train Runnin’', artist: 'The Doobie Brothers', key: 'Gm',
    aliases: ['Long Train Running'], tags: ['Party', 'Tanzflächenfüller'],
    parts: [
      { name: 'Strophe', lex: 'clav',
        summary: 'Funky Clavinet, das wie eine zweite Rhythmusgitarre arbeitet.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Clavinet', timbre: 'BRIGHT', level: 6 }),
          S('organ', 'org-model', 'Für den Refrain vorbereiten: Orgel B3, Zugriegel 888000000, LEVEL ca. 5 – Orgel danach wieder AUS.', { sel: 'B3' }),
          focus('PNO'), ...comp(3), ...reverb('ROOM', 1), ...store('Long Train')],
        tips: 'Kurz und rhythmisch spielen, eher wenige Töne.' },
      { name: 'Refrain / Solo', lex: 'b3',
        summary: 'Orgel dazu für mehr Fülle.',
        steps: [on('organ')],
        tips: 'Danach Orgel wieder aus.' },
    ],
  }),
  song({
    id: 'born-to-be-wild', title: 'Born to Be Wild', artist: 'Steppenwolf', key: 'E', tags: ['Party', 'Schnell'],
    parts: whole('b3', 'Die klassische verzerrte Hammond – hier ist die Orgel ein Hauptinstrument.',
      rockOrgan('Born to Be Wild', { drawbars: '888800000', drive: 6, level: 7 }),
      'Im Orgel-Solo Rotary auf FAST. Lange Akkorde mit der flachen Hand hochwischen (Glissando) gehört zum Stil.'),
  }),
  song({
    id: 'whiskey-in-the-jar', title: 'Whiskey in the Jar', artist: 'Metallica', key: 'G', aliases: ['Whisky in the jar'],
    tags: ['Mitsingen', 'Party'],
    parts: whole('b3', 'Im Original keine Tasten. Rock-Orgel als Unterlage unter den Gitarren.',
      rockOrgan('Whiskey in the Jar', { drive: 4, level: 5 }),
      'Akkorde in der Mittellage halten, im Refrain Rotary auf FAST.'),
  }),
  song({
    id: 'enter-sandman', title: 'Enter Sandman', artist: 'Metallica', key: 'E', tags: ['Party'],
    parts: whole('pad', 'Im Original keine Tasten. Dunkle Fläche für Intro und Mittelteil.',
      [...sectionsOnly(['synth']), ...synthPad({ type: 'ANALOG', cat: 'Pad', level: 5, attack: 4, release: 6 }),
        S('synth', 'syn-freq', 'FREQ drehen, bis im Display ca. 1,5 kHz steht – der Klang wird dunkler und bedrohlicher.', { val: 6.3, disp: '1,5 kHz' }),
        focus('SYN'), ...reverb('HALL', 4), ...store('Enter Sandman')],
      'Tiefe, liegende Töne im Intro und im gesprochenen Mittelteil. Im Rest des Songs pausieren oder nur den Grundton halten.'),
  }),
  song({
    id: 'when-i-come-around', title: 'When I Come Around', artist: 'Green Day', key: 'G', tags: ['Mitsingen'],
    parts: whole('upright', 'Im Original keine Tasten. Helles Upright mit etwas Crunch verdoppelt die Gitarrenakkorde.',
      [...sectionsOnly(['piano']), ...piano({ cat: 'Upright', timbre: 'BRIGHT', level: 6 }),
        focus('PNO'), ...amp('TWIN', 2), ...reverb('ROOM', 1), ...store('When I Come Around')],
      'Den Rhythmus der Gitarre mitspielen, nicht dagegen.'),
  }),
  song({
    id: 'tubthumping', title: 'Tubthumping', artist: 'Chumbawamba', key: 'D', aliases: ['Tubthumpin'],
    tags: ['Mitsingen', 'Party', 'Tanzflächenfüller'],
    parts: [
      { name: 'Strophe / Refrain', lex: 'grand',
        summary: 'Heller Flügel für die Akkorde.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 7 }),
          ...synthHit({ type: 'SAMPLES', cat: 'Brass', level: 6, release: 3, mono: true }),
          off('synth', 'die Trompete kommt nur für die Melodie.'),
          focus('PNO'), ...reverb('ROOM', 2), ...store('Tubthumping')],
        tips: '' },
      { name: 'Trompeten-Melodie', lex: 'brass',
        summary: 'Bläserklang für die Trompeten-Melodie.',
        steps: [on('synth'), off('piano', 'damit nur die Trompete klingt.')],
        tips: 'Danach wieder zurück: Piano an, Synth aus.' },
    ],
  }),
  song({
    id: 'dont-stop-believin', title: 'Don’t Stop Believin’', artist: 'Journey', aliases: ['Dont Stop Believin'],
    tags: ['Mitsingen'],
    parts: [
      { name: 'Klavier-Riff', lex: 'grand',
        summary: 'Heller, klarer Flügel – das Riff ist das Erkennungszeichen des Songs.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4 }),
          S('synth', 'syn-oct', 'OCT ◀ einmal drücken: Streicher eine Oktave tiefer (deine Notiz „Strings −1 Okt“).'),
          off('synth', 'die Streicher kommen später dazu.'),
          focus('PNO'), ...comp(3), ...reverb('ROOM', 2), ...store('Dont Stop Believin')],
        tips: 'Gleichmäßig und nicht zu laut spielen, der Kompressor hilft dabei.' },
      { name: 'Ab Refrain', lex: 'strings',
        summary: 'Flügel + Streicher.',
        steps: [on('synth')],
        tips: '' },
    ],
  }),
  song({
    id: 'if-everyone-cared', title: 'If Everyone Cared', artist: 'Nickelback', tags: ['Langsam'],
    parts: [
      { name: 'Intro / Strophe', lex: 'grand',
        summary: 'Flügel für die Klavierfigur.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }),
          off('synth', 'die Fläche kommt erst im Refrain.'),
          focus('PNO'), ...reverb('HALL', 3), ...store('If Everyone Cared')],
        tips: '' },
      { name: 'Refrain', lex: 'pad',
        summary: 'Flügel + Fläche.',
        steps: [on('synth')],
        tips: '' },
    ],
  }),
  song({
    id: 'let-me-entertain-you', title: 'Let Me Entertain You', artist: 'Robbie Williams', tags: ['Party', 'Schnell'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Hart gehämmerter, heller Flügel – das Klavier treibt den Song.',
        steps: [...sectionsOnly(['piano']), ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 7 }),
          S('organ', 'org-model', 'Für den Refrain vorbereiten: Orgel B3, Zugriegel 888800000, LEVEL ca. 5, Rotary FAST – Orgel danach wieder AUS.', { sel: 'B3' }),
          focus('PNO'), ...comp(4), ...reverb('ROOM', 1), ...store('Let Me Entertain You')],
        tips: 'Durchgehende Achtel-Akkorde in der rechten Hand.' },
      { name: 'Refrain', lex: 'b3',
        summary: 'Flügel + Rock-Orgel für mehr Druck.',
        steps: [on('organ')],
        tips: 'Danach Orgel wieder aus.' },
    ],
  }),
  song({
    id: 'basket-case', title: 'Basket Case', artist: 'Green Day', key: 'E', tags: ['Schnell', 'Party'],
    parts: whole('b3', 'Im Original keine Tasten. Leichte Rock-Orgel als Füllung.',
      rockOrgan('Basket Case', { drive: 3, level: 5 }),
      'Die erste Strophe ist nur Gitarre und Gesang – erst mit der Band einsteigen.'),
  }),
  song({
    id: 'all-the-small-things', title: 'All the Small Things', artist: 'Blink-182', tags: ['Mitsingen', 'Party', 'Schnell'],
    parts: whole('strings', 'Im Original keine Tasten. Streicher als breite Unterlage (deine Notiz: OrchesterStrings).',
      [...sectionsOnly(['synth']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 5, attack: 2, release: 4 }),
        focus('SYN'), ...reverb('ROOM', 2), ...store('All the Small Things')],
      'Vor allem im „Na na na“-Refrain spielen. Alternative zum Ausprobieren: Rock-Orgel mit Zugriegeln 888000000.'),
  }),
  song({
    id: 'narcotic', title: 'Narcotic', artist: 'Liquido', tags: ['Mitsingen', 'Party', 'Tanzflächenfüller'],
    parts: [
      { name: 'Intro', lex: 'grand',
        summary: 'Flügel für den Einstieg (deine Notiz: Piano Eingang).',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
          ...synthHit({ type: 'ANALOG', cat: 'Lead', level: 7, release: 3, mono: true }),
          off('synth', 'der Lead kommt erst mit der bekannten Melodie.'),
          focus('PNO'), ...reverb('ROOM', 2), ...store('Narcotic')],
        tips: '' },
      { name: 'Synth-Melodie', lex: 'lead',
        summary: 'Heller, durchdringender Synth-Lead – die Melodie, die jeder mitsingt.',
        steps: [on('synth'), off('piano', 'damit nur der Lead klingt.')],
        tips: 'Die Melodie muss laut und klar über der Band liegen.' },
    ],
  }),
  song({
    id: 'westerland', title: 'Westerland', artist: 'Die Ärzte', key: 'G', tags: ['Mitsingen', 'Party'],
    parts: whole('pad', 'Klavier mit kräftigem Bass in der linken Hand + Synth-Fläche.',
      [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
        ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }),
        focus('PNO'), ...reverb('ROOM', 2), ...store('Westerland')],
      'Laut deiner Notiz: hauptsächlich Bass-Piano + Synth.'),
  }),
  song({
    id: 'schrei-nach-liebe', title: 'Schrei nach Liebe', artist: 'Die Ärzte', key: 'C', tags: ['Mitsingen', 'Party'],
    parts: [
      { name: 'Streicher', lex: 'strings',
        summary: 'Streicher für Intro und Begleitung (deine Notiz: KEY STR).',
        steps: [...sectionsOnly(['synth']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 6, attack: 2, release: 4 }),
          focus('SYN'), ...reverb('HALL', 3), ...store('Schrei nach Liebe')],
        tips: '' },
      { name: 'Lead (zweites Programm)', lex: 'lead',
        summary: 'Scharfer Sägezahn-Lead (deine Notiz: SAW.LEAD).',
        steps: [...sectionsOnly(['synth']), ...synthHit({ type: 'ANALOG', cat: 'Lead', level: 7, release: 3, mono: true }),
          focus('SYN'), ...reverb('ROOM', 2), ...store('Schrei Lead')],
        tips: 'Der Nord hat nur eine Synth-Sektion, Streicher und Lead gehen nicht gleichzeitig. Speichere den Lead auf dem Nachbarplatz und wechsle mit den Programmtasten 1–5.' },
    ],
  }),
  song({
    id: 'sex-on-fire', title: 'Sex on Fire', artist: 'Kings of Leon', key: 'E', tags: ['Mitsingen', 'Party'],
    parts: whole('pad', 'Im Original keine Tasten. Helle Fläche, die die Gitarren nach oben ergänzt.',
      [...sectionsOnly(['synth']), ...synthPad({ type: 'ANALOG', cat: 'Pad', level: 5, attack: 3, release: 5 }),
        focus('SYN'), ...reverb('HALL', 4), ...store('Sex on Fire')],
      'Nur an deinen „(KEY)“-Stellen spielen und eher hoch, über der Lage der Gitarren.'),
  }),
  song({
    id: 'paranoid', title: 'Paranoid', artist: 'Black Sabbath', tags: ['Schnell', 'Party'],
    parts: whole('b3', 'Im Original keine Tasten. Stark verzerrte Orgel, die das Riff andickt.',
      rockOrgan('Paranoid', { drawbars: '888800000', drive: 7, level: 6, rev: 1 }),
      'Das Riff in Quinten mitspielen (Grundton + Quinte), nicht zu tief.'),
  }),
  song({
    id: 'runaway', title: 'Runaway', artist: 'Bon Jovi', key: 'Am', tags: ['Mitsingen'],
    parts: [
      { name: 'Intro-Riff', lex: 'lead',
        summary: 'Heller 80er-Synth für das berühmte Achtel-Riff (deine Notiz: BigLead).',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthHit({ type: 'ANALOG', cat: 'Lead', level: 7, release: 2 }),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }),
          off('piano', 'der Flügel kommt erst in der Strophe.'),
          focus('SYN'), ...reverb('ROOM', 2), ...store('Runaway')],
        tips: 'Das Riff besteht aus schnellen, gleichmäßigen Achteln – kurz anschlagen.' },
      { name: 'Strophe / Refrain', lex: 'grand',
        summary: 'Heller Flügel, Synth leiser dazu.',
        steps: [on('piano'), S('synth', 'syn-level', 'Synth-LEVEL auf ca. 4 zurücknehmen.', { val: 4 })],
        tips: 'Für das Riff nach dem Refrain Synth-LEVEL wieder auf ca. −4 dB.' },
    ],
  }),
  song({
    // Reihenfolge von Chris (14.11.2026): Nena → Die Prinzen → Peter Schilling → Hubert Kah.
    // Ziel: im Medley möglichst wenig umbauen – ein Programm für Teil 1–3 (nur Sektionen an/aus),
    // ein zweites Programm für den Lead in Teil 4.
    id: 'ndw-medley', title: 'NDW-Medley', artist: 'Nena / Die Prinzen / Peter Schilling / Hubert Kah', key: 'Bm',
    tags: ['Party', 'Mitsingen', 'Tanzflächenfüller', 'Deutsch'],
    parts: [
      { name: '1 Irgendwie, irgendwo, irgendwann', lex: 'brass',
        summary: 'Nena: breiter 80er-Synth für die Akkorde. Das Klavier ist schon geladen, aber noch aus.',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthHit({ type: 'ANALOG', cat: 'Brass', level: 6, release: 3 }),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }),
          off('piano', 'das Klavier kommt erst bei „Alles nur geklaut“.'),
          focus('SYN'), ...reverb('ROOM', 2), ...store('NDW-Medley')],
        tips: 'Akkorde in gleichmäßigen Achteln oder lang gehalten, nicht zu tief – unten spielt der Bass. Dieses eine Programm reicht für die ersten drei Songs: Du schaltest nur Piano und Synth an und aus.' },
      { name: '2 Alles nur geklaut', lex: 'grand',
        summary: 'Die Prinzen: heller Flügel, kurz und rhythmisch. Der Synth ist aus.',
        steps: [on('piano', 'jetzt trägt das Klavier.'), off('synth', 'bis „Major Tom“.')],
        tips: 'Akkorde kurz anschlagen, eher wie eine Rhythmusgitarre. Im Leadsheet an dieser Stelle einen Wechsel-Balken setzen: „Piano AN, Synth AUS“.' },
      { name: '3 Major Tom', lex: 'brass',
        summary: 'Peter Schilling: wieder der 80er-Synth. Strophe in pulsierenden Achteln, Refrain mit lang gehaltenen Akkorden.',
        steps: [on('synth', 'derselbe Klang wie bei Nena.'), off('piano', 'das Klavier pausiert.')],
        tips: 'In der Strophe einen Ton oder eine Quinte in gleichmäßigen Achteln wiederholen, im Refrain („Völlig losgelöst“) volle Akkorde halten. Wechsel-Balken: „Synth AN, Piano AUS“.' },
      { name: '4 Sternenhimmel (zweites Programm)', lex: 'lead',
        summary: 'Hubert Kah: heller Sägezahn-Synth für die Melodie-Hook, mehrstimmig spielbar.',
        steps: [...sectionsOnly(['synth']), ...synthHit({ type: 'ANALOG', cat: 'Lead', level: 7, release: 3 }),
          focus('SYN'), ...reverb('ROOM', 2), ...store('NDW Stern')],
        tips: 'Der Nord hat nur eine Synth-Sektion, deshalb liegt dieser Klang auf einem eigenen Programm. Speichere ihn möglichst auf derselben Seite wie das Medley-Programm, dann wechselst du mit einer Programmtaste 1–5 (dein Platz O 25 ist der letzte seiner Seite – eventuell beide Programme umziehen). Wechsel-Balken im Leadsheet: zuerst den Speicherplatz schreiben, dann „Lead“. Die Hook rechts spielen, links die Akkorde dazu.' },
    ],
  }),
  song({
    id: 'the-final-countdown', title: 'The Final Countdown', artist: 'Europe', key: 'F#m', tags: ['Mitsingen', 'Party'],
    parts: [
      { name: 'Fanfare', lex: 'brass',
        summary: 'Breiter Synth-Brass – die Fanfare ist das Markenzeichen des Songs.',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthHit({ type: 'ANALOG', cat: 'Brass', level: 7, release: 3 }),
          S('synth', 'syn-unison', 'UNISON auf 2 – der Klang wird breiter und fetter.', { sel: '2' }),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }),
          off('piano', 'der Flügel kommt erst in der Strophe.'),
          focus('SYN'), ...reverb('HALL', 4, 'BRIGHT'), ...store('Final Countdown')],
        tips: 'Die Fanfare muss laut sein – sie ersetzt hier die Leadgitarre.' },
      { name: 'Strophe', lex: 'grand',
        summary: 'Flügel für die Akkorde, Synth aus.',
        steps: [on('piano'), off('synth')],
        tips: 'Zur Fanfare wieder zurück: Synth an, Piano aus.' },
    ],
  }),
  song({
    id: 'dont-look-back-in-anger', title: 'Don’t Look Back in Anger', artist: 'Oasis', key: 'C', tags: ['Mitsingen'],
    parts: [
      { name: 'Intro / Strophe', lex: 'grand',
        summary: 'Warmer Flügel – das Klavier-Intro eröffnet den Song.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4 }),
          off('synth', 'die Streicher kommen erst im Refrain.'),
          focus('PNO'), ...reverb('ROOM', 3), ...store('Dont Look Back')],
        tips: '' },
      { name: 'Refrain', lex: 'strings',
        summary: 'Flügel + Streicher.',
        steps: [on('synth')],
        tips: '' },
    ],
  }),
  song({
    id: 'centerfold', title: 'Centerfold', artist: 'The J. Geils Band', key: 'G', tags: ['Mitsingen', 'Party'],
    parts: [
      { name: 'Riff', lex: 'lead',
        summary: 'Heller Synth für das Pfeif-Riff (deine Notiz: Synth Analogon).',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthHit({ type: 'ANALOG', cat: 'Lead', level: 7, release: 2, mono: true }),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }),
          off('piano', 'der Flügel kommt in der Strophe.'),
          focus('SYN'), ...reverb('ROOM', 2), ...store('Centerfold')],
        tips: 'Laut deiner Notiz ist der erste Ton das H4.' },
      { name: 'Strophe', lex: 'grand',
        summary: 'Heller Flügel für die Akkorde.',
        steps: [on('piano'), off('synth')],
        tips: 'Zum Riff wieder zurück: Synth an, Piano aus.' },
    ],
  }),
  song({
    id: 'zombie', title: 'Zombie', artist: 'The Cranberries', key: 'Em', tags: ['Mitsingen'],
    parts: [
      { name: 'Strophe', lex: 'grand',
        summary: 'Weicher Flügel, zurückhaltend.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'SOFT', level: 6 }),
          ...synthPad({ type: 'SAMPLES', cat: 'Pad', level: 5 }),
          off('synth', 'die Fläche kommt erst im Refrain.'),
          focus('PNO'), ...reverb('HALL', 3), ...store('Zombie')],
        tips: 'Laut deiner Notiz ist das lange Intro nur Gitarre.' },
      { name: 'Refrain', lex: 'pad',
        summary: 'Flügel + Fläche gegen die verzerrten Gitarren.',
        steps: [on('synth')],
        tips: '' },
    ],
  }),
  song({
    id: 'nothing-else-matters', title: 'Nothing Else Matters', artist: 'Metallica', key: 'Em', tags: ['Mitsingen', 'Langsam'],
    parts: whole('strings', 'Leise Streicher + weicher Flügel (deine Notiz: Live Strings + Grand Piano).',
      [...sectionsOnly(['synth', 'piano']), ...synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4, attack: 4, release: 6 }),
        S('synth', 'syn-oct', 'OCT ◀ einmal drücken: eine Oktave tiefer (deine Notiz „−1 Okt“).'),
        ...piano({ cat: 'Grand', timbre: 'SOFT', level: 5 }),
        focus('SYN'), ...reverb('HALL', 4), ...store('Nothing Else Matters')],
      'Laut deiner Notiz: Das lange Intro ist nur Gitarre, die Streicher kommen nach etwa 15 Takten und bleiben leicht.'),
  }),
];

// ---------- Songs aus „Rest.chopro“ (ab Version 0.1.21) ----------
// Grundlage: das Original des Songs + Chris' Notizen aus der Datei (Kawai-Codes, „33C Orgel“ usw.).
// fillOnly: Diese Vorschläge füllen nur Songs, die Chris selbst importiert hat. Sie werden weder bei
// einer Neuinstallation noch über „Startdaten ergänzen“ als eigene Songs angelegt.
// Alle Werte sind ungehörte Startpunkte.

const chorus = (amount = 3) => [
  S('effects', 'fx-mod2-on', 'MOD 2 einschalten (ON).'),
  S('effects', 'fx-mod2-type', 'CHOR (Chorus) wählen – macht den Klang breiter und leicht schwebend, typisch 80er.', { sel: 'CHOR' }),
  S('effects', 'fx-mod2-amount', `AMOUNT auf ca. ${amount}.`, { val: amount }),
];
const trem = (rate = 5, amount = 4) => [
  S('effects', 'fx-mod1-on', 'MOD 1 einschalten (ON).'),
  S('effects', 'fx-mod1-type', 'TREM (Tremolo) wählen – die Lautstärke pulsiert leicht, typisch für Wurlitzer und Rhodes.', { sel: 'TREM' }),
  S('effects', 'fx-mod1-rate', `RATE auf ca. ${rate}.`, { val: rate }),
  S('effects', 'fx-mod1-amount', `AMOUNT auf ca. ${amount}.`, { val: amount }),
];

// Ein Programm nur mit Klavier (oder E-Piano)
const solo = (name, { cat = 'Grand', model, timbre = 'MID', level = 7, rev = 'ROOM', mix = 2, tone, fx = [] } = {}) =>
  [...sectionsOnly(['piano']), ...piano({ cat, model, timbre, level }), focus('PNO'), ...fx, ...reverb(rev, mix, tone), ...store(name)];

// Ein Programm nur mit der Synth-Sektion
const synthOnly = (name, steps, { rev = 'HALL', mix = 3, tone } = {}) =>
  [...sectionsOnly(['synth']), ...steps, focus('SYN'), ...reverb(rev, mix, tone), ...store(name)];

// Zweite Ebene zum Klavier, die per ON-Taste dazukommt
const LAYER = {
  strings: { sec: 'synth', lex: 'strings', steps: () => synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4, attack: 4, release: 5 }) },
  pad: { sec: 'synth', lex: 'pad', steps: () => synthPad({ type: 'SAMPLES', cat: 'Pad', level: 4 }) },
  apad: { sec: 'synth', lex: 'pad', steps: () => synthPad({ type: 'ANALOG', cat: 'Pad', level: 4 }) },
  choir: { sec: 'synth', lex: 'pad', steps: () => synthPad({ type: 'SAMPLES', cat: 'Choir', level: 4, attack: 4, release: 5 }) },
  organ: { sec: 'organ', lex: 'b3', steps: () => organB3({ drawbars: '888000000', drive: 2, level: 5 }) },
  rockorgan: { sec: 'organ', lex: 'b3', steps: () => organB3({ drawbars: '888800000', drive: 4, level: 5 }) },
};

/**
 * Zwei Teile in einem Programm: Teil A nur Klavier, in Teil B kommt die Ebene per ON dazu.
 * pno: Klavier-Einstellungen · layer: Schlüssel aus LAYER · when: „im Refrain“ o. Ä.
 */
const layered = (name, layer, { pno = {}, rev = 'HALL', mix = 3, a = 'Strophe', b = 'Refrain', when = 'im Refrain',
  lexA, sumA, sumB, tipsA = '', tipsB } = {}) => {
  const L = LAYER[layer];
  const p = { cat: 'Grand', timbre: 'MID', level: 7, ...pno };
  return [
    { name: a, lex: lexA || ({ Grand: 'grand', Upright: 'upright', Electric: 'rhodes' }[p.cat]), summary: sumA,
      steps: [...sectionsOnly(['piano', L.sec]), ...piano(p), ...L.steps(), off(L.sec, `kommt erst ${when} dazu.`),
        focus('PNO'), ...reverb(rev, mix), ...store(name)],
      tips: tipsA },
    { name: b, lex: L.lex, summary: sumB, steps: [on(L.sec)],
      tips: tipsB !== undefined ? tipsB : `Danach ${SEC_NAME[L.sec]} wieder aus.` },
  ];
};

const rest = (o) => song({ ...o, fillOnly: true });

const REST_SONGS = [
  rest({ id: 'a-thousand-years', title: 'A Thousand Years', artist: 'Christina Perri', tags: ['Langsam'],
    parts: layered('A Thousand Years', 'strings', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel – im Original trägt das Klavier den Song.', sumB: 'Flügel + leise Streicher wie im Original.',
      tipsA: 'Gleichmäßige Achtel in der rechten Hand, ruhig und gebunden.' }) }),
  rest({ id: 'air-bach', title: 'AIR', artist: 'Johann Sebastian Bach', aliases: ['Air', 'Air on the G String'], tags: ['Langsam'],
    parts: whole('strings', 'Streicher allein, weich und gebunden – die „Air“ ist ein Streicherstück.',
      synthOnly('Air Bach', synthPad({ type: 'SAMPLES', cat: 'Strings', name: 'SymphStr XSoft Amb', level: 6, attack: 3, release: 5 }),
        { rev: 'HALL', mix: 4 }),
      'Melodie rechts legato (gebunden) spielen, links die Bass-Linie in gleichmäßigen Vierteln. Zum Vergleich auch „OrchStrings Legato“. Wer mag, legt leise einen Flügel dazu.') }),
  rest({ id: 'all-of-me', title: 'All of Me', artist: 'John Legend', tags: ['Langsam'],
    parts: whole('grand', 'Flügel allein – der Song ist im Original nur Gesang und Klavier.',
      solo('All of Me', { timbre: 'MID', level: 7, rev: 'HALL', mix: 3 }),
      'Links kräftige Oktaven im Bass, rechts die Akkorde – das Klavier ersetzt hier die ganze Band.') }),
  rest({ id: 'all-summer-long', title: 'All Summer Long', artist: 'Kid Rock', aliases: ['All summer long'], tags: ['Party', 'Mitsingen'],
    parts: whole('upright', 'Helles Honky-Tonk-Klavier (Upright) für das Klavier-Riff.',
      solo('All Summer Long', { cat: 'Upright', timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 1 }),
      'Das Klavier-Riff stammt aus „Werewolves of London“ (Warren Zevon). Der Song zitiert auch „Sweet Home Alabama“ – das Programm passt für beide.') }),
  rest({ id: 'alles-aus-liebe', title: 'Alles aus Liebe', artist: 'Die Toten Hosen', tags: ['Deutsch', 'Langsam', 'Mitsingen'],
    parts: layered('Alles aus Liebe', 'strings', { pno: { timbre: 'MID' },
      sumA: 'Flügel für das Klavier-Intro und die Strophe.', sumB: 'Flügel + Streicher, wenn die Band voll einsetzt.' }) }),
  rest({ id: 'applaus-applaus', title: 'Applaus, Applaus', artist: 'Sportfreunde Stiller', tags: ['Deutsch', 'Mitsingen'],
    parts: layered('Applaus Applaus', 'pad', { pno: { timbre: 'BRIGHT', level: 6 }, rev: 'ROOM', mix: 2,
      sumA: 'Heller Flügel, locker begleitend.', sumB: 'Flügel + Fläche für den großen Refrain.',
      tipsA: 'Die Gitarren tragen den Song – Akkorde eher in der Mittellage und nicht zu dicht.' }) }),
  rest({ id: 'barfuss-am-klavier', title: 'Barfuß am Klavier', artist: 'AnnenMayKantereit', tags: ['Deutsch', 'Langsam'],
    parts: whole('upright', 'Warmes, intimes Upright – der Song heißt nicht umsonst so.',
      solo('Barfuss am Klavier', { cat: 'Upright', model: 'Felt Upright', timbre: 'MID', level: 7, rev: 'ROOM', mix: 2 }),
      '„Felt Upright“ ist ein Klavier mit Filz zwischen Hammer und Saite – weich und nah. Für mehr Durchsetzung: „Amber Upright“.') }),
  rest({ id: 'bed-of-roses', title: 'Bed of Roses', artist: 'Bon Jovi', nordSlot: 'P 15', tags: ['Langsam', 'Mitsingen'],
    parts: layered('Bed of Roses', 'strings', { pno: { timbre: 'MID' },
      sumA: 'Flügel – das Klavier-Intro ist das Markenzeichen.', sumB: 'Flügel + Streicher im Refrain.',
      tipsA: 'Du hast auf P 15 schon ein Programm „bed of roses“ (mit Amber Upright und einem Synth-Lead). Vergleiche es mit diesem Vorschlag und behalte, was besser klingt.' }) }),
  rest({ id: 'beds-are-burning', title: 'Beds Are Burning', artist: 'Midnight Oil', tags: ['Party', 'Mitsingen'],
    parts: whole('brass', 'Bläser-Satz für die kurzen Akzente – die Bläser sind das Erkennungszeichen.',
      synthOnly('Beds Are Burning', synthHit({ type: 'SAMPLES', cat: 'BrassEns', level: 6, release: 2 }), { rev: 'ROOM', mix: 2 }),
      'Kurze, scharfe Akkorde auf den Akzenten, dazwischen Pause. Deine Notiz vom Kawai: 11A EFF.') }),
  rest({ id: 'bohemian-rhapsody', title: 'Bohemian Rhapsody', artist: 'Queen', tags: ['Mitsingen', 'Abschluss'],
    parts: whole('grand', 'Heller, klarer Flügel – das Klavier führt durch Ballade, Oper und Rock-Teil.',
      solo('Bohemian Rhapsody', { timbre: 'BRIGHT', level: 7, rev: 'HALL', mix: 3 }),
      'Ein Programm reicht für den ganzen Song. Im Rock-Teil fest anschlagen, in der Ballade weich. Der Anfang („Is this the real life“) ist im Original a cappella mit Klavier-Einsatz bei „Mama“ – mit der Band absprechen.') }),
  rest({ id: 'bonnie-und-clyde', title: 'Bonnie und Clyde', artist: 'Die Toten Hosen', tags: ['Deutsch', 'Schnell', 'Party'],
    parts: whole('b3', 'Rock-Orgel mit Crunch als Teppich unter den Gitarren.',
      rockOrgan('Bonnie und Clyde', { drawbars: '888800000', drive: 4, level: 6 }),
      'Lang gehaltene Akkorde, im Refrain Rotary auf FAST.') }),
  rest({ id: 'bring-me-to-life', title: 'Bring Me to Life', artist: 'Evanescence', tags: ['Mitsingen'],
    parts: layered('Bring Me to Life', 'strings', { pno: { timbre: 'MID', level: 7 }, rev: 'HALL', mix: 4,
      a: 'Klavier-Intro / Strophe', when: 'im Refrain',
      sumA: 'Dunkler Flügel mit viel Hall für das Klavier-Intro.', sumB: 'Flügel + Streicher gegen die Gitarrenwand.',
      tipsA: 'Das Intro wechselt zwischen Em und Cadd9/E – tiefes E im Bass liegen lassen.' }) }),
  rest({ id: 'creep', title: 'Creep', artist: 'Radiohead', tags: ['Langsam', 'Mitsingen'],
    parts: layered('Creep', 'pad', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel, sehr zurückhaltend.', sumB: 'Im Refrain kräftige Klavierakkorde + leise Fläche.',
      tipsA: 'Im Original setzt das Klavier vor allem im Refrain mit lauten Akkorden ein. Deine Kawai-Notiz: 11A 21A 21B 52B.' }) }),
  rest({ id: 'cryin', title: 'Cryin’', artist: 'Aerosmith', aliases: ["Cryin'", 'Cryin'], tags: ['Langsam', 'Mitsingen'],
    parts: whole('b3', 'Warme B3-Orgel mit leichtem Crunch, Leslie langsam.',
      rockOrgan('Cryin', { drawbars: '888600000', drive: 3, level: 6, rev: 2 }),
      'Im Solo und im letzten Refrain Rotary auf FAST.') }),
  rest({ id: 'das-beste', title: 'Das Beste', artist: 'Silbermond', tags: ['Deutsch', 'Langsam', 'Mitsingen'],
    parts: layered('Das Beste', 'strings', { pno: { timbre: 'SOFT', level: 7 },
      sumA: 'Weicher Flügel – der Song beginnt mit Klavier und Gesang.', sumB: 'Flügel + Streicher, wenn die Band einsetzt.' }) }),
  rest({ id: 'dir-gehoert-mein-herz', title: 'Dir gehört mein Herz', artist: 'Phil Collins', tags: ['Deutsch', 'Langsam'],
    parts: layered('Dir gehoert mein Herz', 'strings', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + Streicher im Refrain.',
      tipsA: 'Deutsche Fassung von „You’ll Be in My Heart“ – dasselbe Programm passt für beide.' }) }),
  rest({ id: 'dont-stop-me-now', title: 'Don’t Stop Me Now', artist: 'Queen', aliases: ["Don't stop me now"], tags: ['Party', 'Mitsingen', 'Schnell'],
    parts: whole('grand', 'Heller, kräftiger Flügel – das Klavier ist der Motor des Songs.',
      solo('Dont Stop Me Now', { timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 2 }),
      'Durchgehende Achtel-Akkorde in der rechten Hand, links Oktaven. N.C. im Blatt heißt „no chord“ – dort Pause.') }),
  rest({ id: 'dont-you-forget-about-me', title: 'Don’t You Forget About Me', artist: 'Simple Minds', aliases: ["Don't You Forget About Me"], tags: ['Mitsingen', 'Party'],
    parts: layered('Dont You Forget', 'apad', { pno: { cat: 'Grand', model: 'EGrand 3', timbre: 'BRIGHT', level: 6 }, rev: 'HALL', mix: 3,
      lexA: 'egrand', sumA: '80er-E-Flügel (CP80) mit Chorus.', sumB: 'E-Flügel + analoge Fläche im Refrain.',
      tipsA: 'Den Chorus (MOD 2 → CHOR, AMOUNT ca. 3) im Effektbereich bei FX FOCUS PNO dazuschalten. Deine Kawai-Notiz: 11A EFF / 21A.' }) }),
  rest({ id: 'easy-commodores', title: 'Easy', artist: 'Lionel Richie', tags: ['Langsam'],
    parts: whole('rhodes', 'Warmes Rhodes mit langsamem Pan – der Soul-Klang der Commodores.',
      solo('Easy', { cat: 'Electric', timbre: 'MID', level: 7, rev: 'HALL', mix: 2, fx: pan() }),
      'Rhodes = E-Piano mit Stahlzungen statt Saiten, weich und glockig. Locker und leicht verzögert spielen.') }),
  rest({ id: 'ein-kompliment', title: 'Ein Kompliment', artist: 'Sportfreunde Stiller', tags: ['Deutsch', 'Langsam', 'Mitsingen'],
    parts: whole('grand', 'Weicher Flügel, sparsam.',
      solo('Ein Kompliment', { timbre: 'SOFT', level: 6, rev: 'HALL', mix: 3 }),
      'Die Akustikgitarre trägt – das Klavier nur mit einzelnen Akkorden und Tönen ergänzen.') }),
  rest({ id: 'empire-state-of-mind', title: 'Empire State of Mind', artist: 'Alicia Keys', tags: ['Mitsingen'],
    parts: whole('grand', 'Präsenter Flügel – in der Fassung von Alicia Keys trägt das Klavier den Song.',
      solo('Empire State of Mind', { timbre: 'MID', level: 7, rev: 'HALL', mix: 3 }),
      'Gleichmäßig pulsierende Akkorde in der rechten Hand, links Oktaven.') }),
  rest({ id: 'entre-dos-tierras', title: 'Entre Dos Tierras', artist: 'Héroes del Silencio', aliases: ['Entre Dos Tierras'], tags: ['Mitsingen'],
    parts: whole('pad', 'Dunkle, breite Fläche im Hintergrund.',
      synthOnly('Entre Dos Tierras', synthPad({ type: 'ANALOG', cat: 'Pad', level: 4, attack: 4, release: 6 }), { rev: 'HALL', mix: 4 }),
      'Gitarrensong – die Fläche nur in Refrain und Bridge, sonst Pause.') }),
  rest({ id: 'everybody-hurts', title: 'Everybody Hurts', artist: 'R.E.M.', aliases: ['Everybody Hurts'], tags: ['Langsam', 'Mitsingen'],
    parts: layered('Everybody Hurts', 'strings', { pno: { timbre: 'SOFT', level: 5 },
      sumA: 'Sehr leiser Flügel unter der Gitarre.', sumB: 'Streicher – im Original gibt es ein Streicher-Arrangement.',
      tipsA: 'Die Gitarre spielt die Arpeggios (gebrochene Akkorde) – nicht doppeln, sondern lang halten.' }) }),
  rest({ id: 'family-portrait', title: 'Family Portrait', artist: 'P!nk', aliases: ['Family Portrait'], tags: ['Langsam'],
    parts: layered('Family Portrait', 'pad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + Fläche im Refrain.' }) }),
  rest({ id: 'free-fallin', title: 'Free Fallin’', artist: 'Tom Petty', aliases: ['Free Fallin', 'Free Falling'], tags: ['Mitsingen', 'Langsam'],
    parts: whole('pad', 'Leichte, helle Fläche – die zwölfsaitigen Gitarren tragen den Song.',
      synthOnly('Free Fallin', synthPad({ type: 'ANALOG', cat: 'Pad', level: 3, attack: 3, release: 5 }), { rev: 'HALL', mix: 3 }),
      'Nur im Refrain dazu, und eher hoch spielen.') }),
  rest({ id: 'good-riddance', title: 'Good Riddance (Time of Your Life)', artist: 'Green Day', aliases: ['Good Riddance'], tags: ['Langsam', 'Mitsingen', 'Abschluss'],
    parts: whole('strings', 'Streicher – im Original kommen sie ab der zweiten Strophe zur Akustikgitarre.',
      synthOnly('Good Riddance', synthPad({ type: 'SAMPLES', cat: 'Strings', level: 4, attack: 3, release: 5 }), { rev: 'HALL', mix: 3 }),
      'Lang gehaltene Akkorde, eine Oberstimme kann die Melodie umspielen.') }),
  rest({ id: 'hallelujah', title: 'Hallelujah', artist: 'Leonard Cohen', tags: ['Langsam', 'Mitsingen'],
    parts: layered('Hallelujah', 'choir', { pno: { timbre: 'SOFT', level: 6 }, rev: 'HALL', mix: 4, a: 'Strophe', b: 'Hallelujah-Refrain',
      sumA: 'Weicher Flügel mit viel Hall.', sumB: 'Flügel + leiser Chor („Ah“) für die Hallelujah-Rufe.',
      tipsA: 'Wiegender 6/8-Takt – ruhig und gleichmäßig.' }) }),
  rest({ id: 'halt-mich', title: 'Halt mich', artist: 'Herbert Grönemeyer', tags: ['Deutsch', 'Langsam'],
    parts: layered('Halt mich', 'strings', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel – Grönemeyer begleitet sich hier selbst am Klavier.', sumB: 'Flügel + Streicher zur Steigerung.' }) }),
  rest({ id: 'happy-birthday', title: 'Happy Birthday', tags: [],
    parts: whole('upright', 'Einfaches, helles Klavier zum Mitsingen.',
      solo('Happy Birthday', { cat: 'Upright', timbre: 'MID', level: 7, rev: 'ROOM', mix: 1 }), 'Im 3/4-Takt: links Bass auf 1, rechts Akkord auf 2 und 3.') }),
  rest({ id: 'hedonism', title: 'Hedonism', artist: 'Skunk Anansie', tags: ['Langsam', 'Mitsingen'],
    parts: layered('Hedonism', 'organ', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel in der Strophe.', sumB: 'Flügel + Orgel im Refrain – so steht es in deiner Notiz (11A / 33C Orgel / 21B).' }) }),
  rest({ id: 'hier-kommt-alex', title: 'Hier kommt Alex', artist: 'Die Toten Hosen', tags: ['Deutsch', 'Schnell', 'Party'],
    parts: whole('b3', 'Kräftige Rock-Orgel mit viel Drive.',
      rockOrgan('Hier kommt Alex', { drawbars: '888800000', drive: 5, level: 6, rev: 1 }),
      'Punk-Tempo: lieber wenige, lang gehaltene Akkorde als viele Anschläge. Rotary im Refrain FAST.') }),
  rest({ id: 'hold-the-line', title: 'Hold the Line', artist: 'Toto', tags: ['Mitsingen', 'Party'],
    parts: layered('Hold the Line', 'rockorgan', { pno: { timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 2,
      sumA: 'Heller Flügel für das berühmte Klavier-Riff.', sumB: 'Flügel + Rock-Orgel bei ca. 70 % (deine Notiz: „33C Orgel 70 %“).',
      tipsA: 'Das Riff sind durchgehende Achtel-Triolen (drei Anschläge pro Schlag) – locker aus dem Handgelenk. Deine Kawai-Notiz: 11A EFF, 33C Orgel 70 %, 21B.' }) }),
  rest({ id: 'hymn-bjh', title: 'Hymn', artist: 'Barclay James Harvest', tags: ['Langsam', 'Abschluss'],
    parts: layered('Hymn', 'choir', { pno: { timbre: 'SOFT', level: 6 }, rev: 'HALL', mix: 4,
      sumA: 'Weicher Flügel.', sumB: 'Flügel + Chor-Fläche – im Original Mellotron-Chöre.',
      tipsA: 'Mellotron = altes Tasteninstrument, das Tonbänder mit Chor oder Streichern abspielt.' }) }),
  rest({ id: 'i-dont-believe-you', title: 'I Don’t Believe You', artist: 'P!nk', aliases: ["I Don't Believe You"], tags: ['Langsam'],
    parts: layered('I Dont Believe You', 'strings', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel für die Akustik-Fassung.', sumB: 'Flügel + leise Streicher.' }) }),
  rest({ id: 'i-dont-know-how-to-love-him', title: 'I Don’t Know How to Love Him', artist: 'Andrew Lloyd Webber', aliases: ["I Don't Know How to Love Him"], tags: ['Langsam'],
    parts: layered('How to Love Him', 'strings', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel – Musical-Ballade aus „Jesus Christ Superstar“.', sumB: 'Flügel + Streicher zur Steigerung.' }) }),
  rest({ id: 'i-dont-want-to-miss-a-thing', title: 'I Don’t Want to Miss a Thing', artist: 'Aerosmith', aliases: ["I Don't Want to Miss a Thing"], tags: ['Langsam', 'Mitsingen'],
    parts: layered('Miss a Thing', 'strings', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + große Streicher – das Orchester ist im Original prägend.' }) }),
  rest({ id: 'i-want-to-hold-your-hand', title: 'I Want to Hold Your Hand', artist: 'The Beatles', aliases: ['I Want To Hold Your Hand'], tags: ['Mitsingen', 'Schnell'],
    parts: whole('upright', 'Helles, trockenes Upright – im Original keine Tasten, das Klavier ersetzt die zweite Gitarre.',
      solo('Hold Your Hand', { cat: 'Upright', timbre: 'BRIGHT', level: 6, rev: 'ROOM', mix: 1 }), 'Kurze Akkorde auf 2 und 4, wie eine Rhythmusgitarre.') }),
  rest({ id: 'ill-be-there-for-you', title: 'I’ll Be There for You', artist: 'The Rembrandts', aliases: ["I'll Be There For You"], tags: ['Mitsingen', 'Party'],
    parts: whole('b3', 'Helle Orgel im Hintergrund, Leslie langsam.',
      rockOrgan('Be There for You', { drawbars: '888000000', drive: 2, level: 5, rev: 2 }),
      'Gitarrensong – Orgel lang halten, im Refrain FAST.') }),
  rest({ id: 'im-gonna-be-500-miles', title: 'I’m Gonna Be (500 Miles)', artist: 'The Proclaimers', aliases: ["I'm Gonna Be", '500 Miles'], tags: ['Mitsingen', 'Party', 'Schnell'],
    parts: layered('500 Miles', 'organ', { pno: { cat: 'Upright', timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 1,
      sumA: 'Helles Upright, rhythmisch.', sumB: 'Upright + Orgel im Refrain (deine Notiz: 11A / 33C Orgel / 21B).' }) }),
  rest({ id: 'ich-fuehl-wie-du', title: 'Ich fühl’ wie du', artist: 'Peter Maffay', aliases: ['Ich fühl wie Du'], tags: ['Deutsch', 'Mitsingen'],
    parts: layered('Ich fuehl wie du', 'apad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + analoge 80er-Fläche im Refrain.' }) }),
  rest({ id: 'ich-lass-fuer-dich-das-licht-an', title: 'Ich lass für dich das Licht an', artist: 'Revolverheld', tags: ['Deutsch', 'Langsam', 'Mitsingen'],
    parts: layered('Licht an', 'pad', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel, sparsam.', sumB: 'Flügel + Fläche im Refrain.',
      tipsA: 'Die Akkorde im Blatt sind schon in der klingenden Tonart – der Capo-Hinweis gilt nur für die Gitarre.' }) }),
  rest({ id: 'ich-lebe', title: 'Ich lebe', artist: 'Christina Stürmer', tags: ['Deutsch', 'Mitsingen'],
    parts: layered('Ich lebe', 'pad', { pno: { timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 2,
      sumA: 'Heller Flügel.', sumB: 'Flügel + Fläche im Refrain.' }) }),
  rest({ id: 'imagine', title: 'Imagine', artist: 'John Lennon', tags: ['Langsam', 'Mitsingen'],
    parts: layered('Imagine', 'strings', { pno: { cat: 'Upright', model: 'Amber Upright', timbre: 'SOFT', level: 7 }, rev: 'ROOM', mix: 2,
      a: 'Strophe', b: 'Ab der 2. Strophe', when: 'ab der zweiten Strophe',
      sumA: 'Weiches Klavier – Lennon spielte ein Upright.', sumB: 'Klavier + sehr leise Streicher.',
      tipsA: 'Im Blatt steht: Die C-Akkorde in den Strophen sind eigentlich Cadd9 (C mit d dazu).' }) }),
  rest({ id: 'jump-van-halen', title: 'Jump', artist: 'Van Halen', tags: ['Party', 'Mitsingen'],
    parts: whole('brass', 'Der berühmte 80er-Synth (Oberheim) – breiter, heller Synth-Brass.',
      synthOnly('Jump', [...synthHit({ type: 'ANALOG', cat: 'Brass', level: 7, release: 3 }),
        S('synth', 'syn-unison', 'UNISON auf 2 – breiter und fetter.', { sel: '2' })], { rev: 'HALL', mix: 3, tone: 'BRIGHT' }),
      'Das Riff kurz und betont auf den Off-Beats (zwischen den Schlägen). Laut Blatt ist das Keyboard-Solo größtenteils Arpeggio (gebrochene Akkorde).') }),
  rest({ id: 'knockin-on-heavens-door', title: 'Knockin’ on Heaven’s Door', aliases: ["Knocking On Heaven's Door"], tags: ['Langsam', 'Mitsingen'],
    parts: layered('Knockin on Heaven', 'organ', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + warme Orgel im Refrain.',
      tipsA: 'Deine Kawai-Notiz: 11A / 21A EFX.' }) }),
  rest({ id: 'lass-jetzt-los', title: 'Lass jetzt los', artist: 'Willemijn Verkaik', aliases: ['Lass jetzt los (Eiskönigin)'], tags: ['Deutsch', 'Mitsingen'],
    parts: layered('Lass jetzt los', 'strings', { pno: { timbre: 'BRIGHT', level: 7 }, rev: 'HALL', mix: 4,
      sumA: 'Klarer Flügel für die Klavierfigur am Anfang.', sumB: 'Flügel + Streicher, wenn es groß wird.',
      tipsA: 'Wichtig: Das Blatt ist für Gitarre mit Capo im 1. Bund geschrieben. Stelle beim Song „Transponieren +1“ ein, dann siehst du die klingenden Akkorde (Fm statt Em).' }) }),
  rest({ id: 'leb-deine-traeume', title: 'Leb deine Träume', artist: 'Luxuslärm', tags: ['Deutsch', 'Mitsingen'],
    parts: layered('Leb deine Traeume', 'pad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für Intro und Strophe.', sumB: 'Flügel + Fläche im Refrain.', tipsA: 'Deine Kawai-Notiz: 71A, 11A.' }) }),
  rest({ id: 'lemon-tree', title: 'Lemon Tree', artist: 'Fool’s Garden', aliases: ['Lemon Tree'], tags: ['Mitsingen'],
    parts: layered('Lemon Tree', 'strings', { pno: { timbre: 'MID', level: 7 }, rev: 'ROOM', mix: 2,
      sumA: 'Flügel, rhythmisch begleitend.', sumB: 'Flügel + Streicher.', tipsA: 'Deine Kawai-Notiz: 11A, 21A.' }) }),
  rest({ id: 'let-it-rain', title: 'Let It Rain', tags: [],
    parts: layered('Let It Rain', 'pad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel.', sumB: 'Flügel + Fläche.',
      tipsA: 'Allgemeiner Vorschlag, weil der Interpret nicht feststeht. Deine Kawai-Notiz: 24B, 51A, 11A bei 60 %.' }) }),
  rest({ id: 'make-you-feel-my-love', title: 'Make You Feel My Love', artist: 'Adele', tags: ['Langsam'],
    parts: whole('grand', 'Flügel allein – bei Adele nur Gesang und Klavier.',
      solo('Make You Feel My Love', { timbre: 'SOFT', level: 7, rev: 'HALL', mix: 3 }), 'Ruhig und mit viel Raum für die Stimme.') }),
  rest({ id: 'memory-cats', title: 'Memory', artist: 'Andrew Lloyd Webber', tags: ['Langsam'],
    parts: layered('Memory', 'strings', { pno: { timbre: 'SOFT', level: 6 }, rev: 'HALL', mix: 4,
      sumA: 'Weicher Flügel – Musical-Ballade aus „Cats“.', sumB: 'Flügel + Streicher zur großen Steigerung.' }) }),
  rest({ id: 'mr-brightside', title: 'Mr. Brightside', artist: 'The Killers', aliases: ['Mr Brightside'], tags: ['Party', 'Mitsingen', 'Schnell'],
    parts: whole('pad', 'Analoge Synth-Fläche mit Chorus – im Original liegt ein Synth unter den Gitarren.',
      synthOnly('Mr Brightside', [...synthPad({ type: 'ANALOG', cat: 'Pad', level: 5, attack: 2, release: 4 }), ...chorus(3)], { rev: 'HALL', mix: 3 }),
      'Lang gehaltene Akkorde, im Refrain eine Oktave höher spielen.') }),
  rest({ id: 'music-john-miles', title: 'Music', artist: 'John Miles', tags: ['Abschluss'],
    parts: layered('Music', 'strings', { pno: { timbre: 'BRIGHT', level: 7 }, rev: 'HALL', mix: 4, b: 'Orchester-Teile', when: 'in den Orchester-Teilen',
      sumA: 'Großer, klarer Flügel – der Song lebt vom Klavier.', sumB: 'Flügel + Streicher für die orchestralen Teile.' }) }),
  rest({ id: 'my-name-is-human', title: 'My Name Is Human', artist: 'Highly Suspect', tags: [],
    parts: whole('lead', 'Synth-Bass eine Oktave tiefer – so steht es in deiner Notiz („HiQBass −1 Okt“).',
      synthOnly('My Name Is Human', [...synthHit({ type: 'ANALOG', cat: 'Bass', level: 6, release: 2, mono: true }),
        S('synth', 'syn-oct', 'OCT ◀ einmal drücken: eine Oktave tiefer.')], { rev: 'ROOM', mix: 1 }),
      'Einstimmig mit der linken Hand, mit dem Bassisten absprechen, wer welche Stellen spielt.') }),
  rest({ id: 'no-roots', title: 'No Roots', artist: 'Alice Merton', nordSlot: 'P 21', tags: ['Party', 'Mitsingen'],
    parts: whole('grand', 'Heller, kurzer Flügel für die Akkord-Stöße.',
      solo('No Roots', { timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 1 }),
      'Du hast auf P 21 und P 22 schon zwei Programme „no roots“ – vergleiche sie mit diesem Vorschlag. Akkorde kurz und rhythmisch, der Bass trägt den Song.') }),
  rest({ id: 'november-rain', title: 'November Rain', artist: 'Guns N’ Roses', tags: ['Langsam', 'Mitsingen'],
    parts: layered('November Rain', 'strings', { pno: { timbre: 'MID', level: 7 }, rev: 'HALL', mix: 4,
      sumA: 'Großer Flügel – Axl Rose spielt das Klavier selbst.', sumB: 'Flügel + Streicher wie im Orchester des Originals.' }) }),
  rest({ id: 'nur-noch-kurz-die-welt-retten', title: 'Nur noch kurz die Welt retten', artist: 'Tim Bendzko', tags: ['Deutsch', 'Mitsingen'],
    parts: whole('grand', 'Heller Flügel, rhythmisch – das Klavier treibt den Song.',
      solo('Welt retten', { timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 2 }),
      'Hinweis: In deiner Datei steht als Interpret „Sportfreunde Stiller“ – der Song ist von Tim Bendzko. Unter „Bearbeiten“ korrigieren.') }),
  rest({ id: 'nur-ein-stueck', title: 'Nur ein Stück', artist: 'Christian Würr', tags: ['Deutsch'],
    parts: whole('grand', 'Neutraler Flügel als Ausgangspunkt – dein eigenes Stück.',
      solo('Nur ein Stueck', { timbre: 'MID', level: 7, rev: 'HALL', mix: 3 }), 'Nach deinem eigenen Geschmack anpassen.') }),
  rest({ id: 'one-moment-in-time', title: 'One Moment in Time', artist: 'Whitney Houston', tags: ['Langsam'],
    parts: layered('One Moment in Time', 'strings', { pno: { timbre: 'SOFT', level: 6 }, rev: 'HALL', mix: 4,
      sumA: 'Weicher Flügel.', sumB: 'Flügel + große Streicher für die Steigerung.' }) }),
  rest({ id: 'one-of-us', title: 'One of Us', artist: 'Joan Osborne', aliases: ['One Of Us'], tags: ['Mitsingen'],
    parts: layered('One of Us', 'organ', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel in der Strophe.', sumB: 'Flügel + Orgel – die Hammond ist im Original prägend (deine Notiz: 11A / 33C / 21B).',
      tipsB: 'Im Refrain kann die Orgel auch allein stehen: Piano ausschalten.' }) }),
  rest({ id: 'piano-man', title: 'Piano Man', artist: 'Billy Joel', tags: ['Mitsingen', 'Abschluss'],
    parts: whole('grand', 'Heller Flügel – der Klassiker der Klavier-Songs.',
      solo('Piano Man', { timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 2 }),
      'Walzer (3/4-Takt): links Bass auf 1, rechts Akkord auf 2 und 3. Die Mundharmonika-Stellen kann der Synth übernehmen, z. B. ein Akkordeon-Klang.') }),
  rest({ id: 'poison-alice-cooper', title: 'Poison', artist: 'Alice Cooper', tags: ['Mitsingen', 'Party'],
    parts: layered('Poison', 'apad', { pno: { timbre: 'BRIGHT', level: 6 }, rev: 'HALL', mix: 3,
      sumA: 'Heller Flügel.', sumB: 'Flügel + analoge 80er-Fläche im Refrain.' }) }),
  rest({ id: 'pretty-fly', title: 'Pretty Fly (for a White Guy)', artist: 'The Offspring', tags: ['Party', 'Schnell'],
    parts: whole('b3', 'Im Original keine Tasten. Falls du mitspielst: Orgel mit viel Drive.',
      rockOrgan('Pretty Fly', { drawbars: '888800000', drive: 5, level: 6, rev: 1 }),
      'Im Blatt steht an zwei Stellen „Em, D nur Bass“ – dort Pause.') }),
  rest({ id: 'radio-ga-ga', title: 'Radio Ga Ga', artist: 'Queen', tags: ['Mitsingen', 'Party'],
    parts: [
      { name: 'Strophe', lex: 'pad', summary: 'Analoge Synth-Fläche – der Song ist voller 80er-Synths.',
        steps: [...sectionsOnly(['synth', 'piano']), ...synthPad({ type: 'ANALOG', cat: 'Pad', level: 5, attack: 2, release: 4 }),
          ...piano({ cat: 'Grand', timbre: 'BRIGHT', level: 6 }), off('piano', 'das Klavier kommt im Refrain dazu.'),
          focus('SYN'), ...reverb('HALL', 3), ...store('Radio Ga Ga')],
        tips: 'Pulsierende Achtel auf einem Akkord, wie ein Sequenzer.' },
      { name: 'Refrain', lex: 'grand', summary: 'Fläche + Flügel für die großen Akkorde.', steps: [on('piano')],
        tips: 'Danach Piano wieder aus. Der Capo-Hinweis im Blatt gilt nur für die Gitarre.' },
    ] }),
  rest({ id: 'rockin-all-over-the-world', title: 'Rockin’ All Over the World', artist: 'Status Quo', aliases: ['Rocking All Over The World'], tags: ['Party', 'Mitsingen'],
    parts: layered('Rockin All Over', 'rockorgan', { pno: { cat: 'Upright', timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 1,
      sumA: 'Helles Rock’n’Roll-Upright.', sumB: 'Upright + Orgel (deine Notiz: 47C Orgel, 11A).',
      tipsA: 'Der Song steckt auch in deinem großen Medley – dort hat er einen eigenen Teil.' }) }),
  rest({ id: 'smells-like-teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', tags: ['Party', 'Schnell'],
    parts: whole('b3', 'Im Original keine Tasten. Falls du mitspielst: dreckige Orgel nur im Refrain.',
      rockOrgan('Teen Spirit', { drawbars: '888800000', drive: 6, level: 6, rev: 1 }),
      'Powerchords (F5, Bb5, Ab5, Db5): nur Grundton + Quinte, gern mit Oktave. In der Strophe Pause.') }),
  rest({ id: 'streets-of-london', title: 'Streets of London', artist: 'Ralph McTell', aliases: ['Streets of london'], tags: ['Langsam', 'Mitsingen'],
    parts: whole('upright', 'Weiches Upright, sparsam unter der Gitarre.',
      solo('Streets of London', { cat: 'Upright', model: 'Felt Upright', timbre: 'SOFT', level: 6, rev: 'ROOM', mix: 2 }), 'Folk-Song – das Klavier nur als zarte Ergänzung.') }),
  rest({ id: 'supergirl', title: 'Supergirl', artist: 'Reamonn', tags: ['Mitsingen'],
    parts: layered('Supergirl', 'pad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + Fläche im Refrain.' }) }),
  rest({ id: 'sweet-home-alabama', title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', tags: ['Party', 'Mitsingen'],
    parts: whole('upright', 'Helles Honky-Tonk-Upright – Billy Powells Klavier ist im Original deutlich zu hören.',
      solo('Sweet Home Alabama', { cat: 'Upright', timbre: 'BRIGHT', level: 7, rev: 'ROOM', mix: 1 }),
      'Verzierungen mit Vorschlagnoten (kurz von unten in den Ton rutschen) machen den Südstaaten-Klang. Deine Kawai-Notiz: 11A EFF / 11A.') }),
  rest({ id: 'tage-wie-diese', title: 'Tage wie diese', artist: 'Die Toten Hosen', tags: ['Deutsch', 'Mitsingen', 'Abschluss'],
    parts: layered('Tage wie diese', 'pad', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel für das Klavier-Intro und die Strophe.', sumB: 'Flügel + Fläche im Refrain (deine Notiz: 11A, 51A).' }) }),
  rest({ id: 'tears-in-heaven', title: 'Tears in Heaven', artist: 'Eric Clapton', tags: ['Langsam'],
    parts: layered('Tears in Heaven', 'pad', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel unter der Akustikgitarre.', sumB: 'Flügel + leise Fläche – im Original liegt ein Synth-Pad darunter.' }) }),
  rest({ id: 'teenage-dirtbag', title: 'Teenage Dirtbag', artist: 'Wheatus', tags: ['Mitsingen', 'Party'],
    parts: layered('Teenage Dirtbag', 'pad', { pno: { timbre: 'MID', level: 6 }, rev: 'ROOM', mix: 2,
      sumA: 'Flügel, zurückhaltend.', sumB: 'Flügel + Fläche im Refrain.', tipsA: 'Deine Kawai-Notiz: 11A, 21A.' }) }),
  rest({ id: 'the-longest-time', title: 'The Longest Time', artist: 'Billy Joel', tags: ['Mitsingen'],
    parts: whole('upright', 'Weiches Upright – das Original ist a cappella (nur Stimmen).',
      solo('The Longest Time', { cat: 'Upright', timbre: 'MID', level: 6, rev: 'ROOM', mix: 2 }),
      'Nur leise stützen: kurze Akkorde auf 2 und 4. Der Capo-Hinweis im Blatt gilt nur für die Gitarre.') }),
  rest({ id: 'the-rose', title: 'The Rose', artist: 'Bette Midler', tags: ['Langsam'],
    parts: whole('grand', 'Weicher Flügel allein.',
      solo('The Rose', { timbre: 'SOFT', level: 7, rev: 'HALL', mix: 3 }), 'Ruhige, gebrochene Akkorde.') }),
  rest({ id: 'the-scientist', title: 'The Scientist', artist: 'Coldplay', tags: ['Langsam', 'Mitsingen'],
    parts: whole('grand', 'Flügel – das Klavier-Motiv eröffnet und trägt den Song.',
      solo('The Scientist', { timbre: 'MID', level: 7, rev: 'HALL', mix: 3 }), 'Gleichmäßige Viertel-Akkorde, eher weich.') }),
  rest({ id: 'thinking-out-loud', title: 'Thinking Out Loud', artist: 'Ed Sheeran', tags: ['Langsam', 'Mitsingen'],
    parts: whole('rhodes', 'Warmes Rhodes mit langsamem Pan – passt zum Soul-Groove.',
      solo('Thinking Out Loud', { cat: 'Electric', timbre: 'MID', level: 7, rev: 'HALL', mix: 2, fx: pan() }),
      'Weicher Anschlag, Akkorde leicht verzögert („laid back“).') }),
  rest({ id: 'titanium', title: 'Titanium', artist: 'David Guetta feat. Sia', tags: ['Party', 'Mitsingen'],
    parts: [
      { name: 'Strophe', lex: 'grand', summary: 'Flügel für die ruhige Strophe.',
        steps: [...sectionsOnly(['piano', 'synth']), ...piano({ cat: 'Grand', timbre: 'MID', level: 7 }),
          ...synthHit({ type: 'ANALOG', cat: 'Lead', name: 'Big Supersaw', level: 6, release: 4 }),
          off('synth', 'der Supersaw kommt im Refrain.'), focus('PNO'), ...reverb('HALL', 3), ...store('Titanium')],
        tips: 'Deine Kawai-Notiz: 11A, 73A, 21A, 72A.' },
      { name: 'Refrain / Drop', lex: 'lead', summary: 'Breiter „Supersaw“-Synth – der typische EDM-Klang.',
        steps: [on('synth'), off('piano', 'wenn der Synth übernimmt.')],
        tips: 'Supersaw = viele leicht verstimmte Sägezahn-Klänge übereinander. Danach wieder Piano an, Synth aus.' },
    ] }),
  rest({ id: 'walking-on-sunshine', title: 'Walking on Sunshine', artist: 'Katrina & The Waves', tags: ['Party', 'Mitsingen', 'Schnell'],
    parts: [
      { name: 'Orgel', lex: 'b3', summary: 'Fröhliche Orgel – im Original liegt eine Hammond unter dem Song.',
        steps: [...sectionsOnly(['organ', 'synth']), ...organB3({ drawbars: '888000000', drive: 2, level: 6 }),
          ...synthHit({ type: 'SAMPLES', cat: 'BrassEns', level: 6, release: 2 }), off('synth', 'die Bläser kommen nur für die Riffs.'),
          focus('ORG'), ...reverb('ROOM', 2), ...store('Walking on Sunshine')],
        tips: 'Im Blatt stehen keine Akkorde – die Grundfolge ist B♭ – E♭ – F – E♭ (Original in B♭).' },
      { name: 'Bläser-Riff', lex: 'brass', summary: 'Bläser für das berühmte Riff.', steps: [on('synth')],
        tips: 'Danach Synth wieder aus.' },
    ] }),
  rest({ id: 'we-found-love', title: 'We Found Love', artist: 'Rihanna', tags: ['Party', 'Tanzflächenfüller'],
    parts: whole('lead', 'Heller „Supersaw“-Synth für das Riff.',
      synthOnly('We Found Love', [...synthHit({ type: 'ANALOG', cat: 'Lead', name: 'Big Supersaw', level: 7, release: 3 }),
        S('synth', 'syn-unison', 'UNISON auf 2 – noch breiter.', { sel: '2' })], { rev: 'HALL', mix: 3, tone: 'BRIGHT' }),
      'Das Riff in kurzen, gleichmäßigen Akkorden. In der Strophe nur leise oder Pause.') }),
  rest({ id: 'wanted-dead-or-alive', title: 'Wanted Dead or Alive', artist: 'Bon Jovi', aliases: ['Wanted Dead Or Alive'], tags: ['Mitsingen'],
    parts: whole('pad', 'Dunkle Fläche unter den Gitarren.',
      synthOnly('Wanted Dead or Alive', synthPad({ type: 'ANALOG', cat: 'Pad', level: 4, attack: 4, release: 6 }), { rev: 'HALL', mix: 4 }),
      'Gitarrensong – Fläche ab dem ersten Refrain, lang gehalten.') }),
  rest({ id: 'weusd-a-herz', title: 'Weus’d a Herz hast wia a Bergwerk', artist: 'Rainhard Fendrich', aliases: ["Weu's d a Herz hast wia Bergwerk"], tags: ['Deutsch', 'Langsam'],
    parts: layered('Herz wia Bergwerk', 'strings', { pno: { timbre: 'MID', level: 7 },
      sumA: 'Flügel – Fendrich-Ballade mit Klavier.', sumB: 'Flügel + Streicher zur Steigerung.' }) }),
  rest({ id: 'what-a-wonderful-world', title: 'What a Wonderful World', artist: 'Louis Armstrong', tags: ['Langsam'],
    parts: layered('Wonderful World', 'strings', { pno: { timbre: 'SOFT', level: 6 },
      sumA: 'Weicher Flügel.', sumB: 'Flügel + Streicher wie im Original.' }) }),
  rest({ id: 'whats-up', title: 'What’s Up?', artist: '4 Non Blondes', aliases: ["What's Up?", 'Whats Up'], tags: ['Mitsingen'],
    parts: whole('b3', 'Warme Orgel im Hintergrund, Leslie langsam.',
      rockOrgan('Whats Up', { drawbars: '888000000', drive: 2, level: 5, rev: 2 }),
      'Nur drei Akkorde (G – Am – C) – lang halten, im letzten Refrain FAST.') }),
  rest({ id: 'willenlos', title: 'Willenlos', artist: 'Marius Müller-Westernhagen', tags: ['Deutsch', 'Party', 'Mitsingen'],
    parts: layered('Willenlos', 'rockorgan', { pno: { cat: 'Upright', timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 1,
      sumA: 'Helles Rock-Upright.', sumB: 'Upright + Rock-Orgel im Refrain.' }) }),
  rest({ id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', tags: ['Mitsingen'],
    parts: layered('Wonderwall', 'strings', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel (deine Notiz: „piano“).', sumB: 'Flügel + Streicher (deine Notiz: „Strings linke Hand“).',
      tipsA: 'Deine Kawai-Notiz: 11A EFF / 53C EFF.',
      tipsB: 'Streicher und Klavier liegen hier übereinander auf der ganzen Tastatur: links die Streicher-Akkorde lang halten, rechts das Klavier. Danach Synth wieder aus.' }) }),
  rest({ id: 'zu-spaet', title: 'Zu spät', artist: 'Die Ärzte', tags: ['Deutsch', 'Party', 'Mitsingen'],
    parts: layered('Zu spaet', 'rockorgan', { pno: { cat: 'Upright', timbre: 'BRIGHT', level: 7 }, rev: 'ROOM', mix: 1,
      sumA: 'Helles Upright.', sumB: 'Upright + Orgel im Refrain (deine Notiz: 24C, 51A, 21B♭).' }) }),
  rest({ id: 'youll-be-in-my-heart', title: 'You’ll Be in My Heart', artist: 'Phil Collins', aliases: ["You'll Be in My Heart"], tags: ['Langsam'],
    parts: layered('Youll Be in My Heart', 'strings', { pno: { timbre: 'MID', level: 6 },
      sumA: 'Flügel für die Strophe.', sumB: 'Flügel + Streicher im Refrain.',
      tipsA: 'Englische Fassung von „Dir gehört mein Herz“ – dasselbe Programm passt für beide.' }) }),
];
SEED_SONGS.push(...REST_SONGS);

// LEVEL-Angaben in Display-Werte (dB) umschreiben – in den LEVEL-Schritten und in Vorbereitungs-Texten.
for (const s of SEED_SONGS) {
  for (const p of s.parts) {
    for (const st of p.steps) {
      if (/-level$/.test(st.c) && typeof st.val === 'number' && !st.disp && LEVEL_DB[st.val] !== undefined) {
        st.disp = fmtDb(st.val);
        st.t = st.t.replace(/ca\. \d+/, `ca. ${st.disp}`);
        st.val = knobDb(LEVEL_DB[st.val]);
      }
      st.t = st.t.replace(/LEVEL ca\. (\d)\b/g, (m, n) => (LEVEL_DB[n] !== undefined ? `LEVEL ca. ${fmtDb(n)}` : m));
    }
  }
}
