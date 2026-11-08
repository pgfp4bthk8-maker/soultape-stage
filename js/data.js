// Startdaten: Sound-Lexikon und erste Songs mit Soundvorschlägen.
// WICHTIG: Hier stehen bewusst KEINE Songtexte. Texte und Akkorde importierst
// du selbst; sie bleiben lokal auf deinem Gerät und landen nicht auf GitHub.
//
// Alle Einstellwerte sind Startpunkte (Skala 0–10 wie auf den Reglern).
// Im Proberaum mit der Band prüfen und nach Gehör anpassen.

export const SEED_VERSION = 1;

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
  S('piano', 'pno-library', `PIANO LIBRARY-Rad drücken und Kategorie „${cat}“ wählen, dann mit dem Rad ein Modell aussuchen${model ? ` (z. B. ${model})` : ''}. Die genauen Namen hängen davon ab, welche Pianos auf deinem Nord installiert sind.`),
  S('piano', 'pno-timbre', `TIMBRE auf ${timbre}.${extra ? ' ' + extra : ''}`, { sel: timbre }),
  S('piano', 'pno-level', `LEVEL auf ca. ${level}.`, { val: level }),
];

const synthPad = ({ type = 'SAMPLES', cat = 'Pad', level = 4, attack = 3, release = 5 }) => [
  S('synth', 'syn-libtype', `SOUND LIBRARY-Rad drücken und ${type} wählen (Soft-Taste unter dem Display).`, { sel: type }),
  S('synth', 'syn-library', `Kategorie „${cat}“ wählen und mit dem Rad einen Klang aussuchen. Rad drücken = bestätigen.`),
  S('synth', 'syn-attack', `ATTACK auf ca. ${attack}, damit der Klang weich einschwebt.`, { val: attack }),
  S('synth', 'syn-release', `RELEASE auf ca. ${release}, damit er sanft ausklingt.`, { val: release }),
  S('synth', 'syn-level', `LEVEL auf ca. ${level} – die Fläche bleibt im Hintergrund.`, { val: level }),
];

// ---------- Songs ----------
const song = (o) => ({
  key: '', durationSec: null, tags: [], notes: '', kawai: '', nordStored: false,
  sheets: [], activeSheet: null, aliases: [], ...o,
  nordProgram: o.nordProgram || o.title,
});

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
        tips: 'Alternative zum Ausprobieren: Wurlitzer (Kategorie Electric) mit leichtem Tremolo – das ist der Ray-Charles-Sound von „What’d I Say“.' },
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
          S('synth', 'syn-library', 'Ebenso vorbereiten: Synth-Sektion mit einer Fläche (SAMPLES → Pad), LEVEL ca. 4 – danach wieder AUS.'),
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
        steps: [S('synth', 'syn-libtype', 'Vorbereitung: Synth-Sektion mit ANALOG → Brass belegen, LEVEL ca. 5.', { sel: 'ANALOG' }),
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
];
