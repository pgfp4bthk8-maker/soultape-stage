# Nord Electro 7 73 HP – Fakten für die App

Quelle: Nord Electro 7 73/HP User Manual (OS v1.2x, Edition C) und Fotos von Chris' Gerät. Das Handbuch liegt im claude.ai-Projekt „PIANO-APP“.

## Chris' Setup

- Nord Electro 7, 73 Tasten, Waterfall-Tastatur (semi-weighted)
- Stereo-Ausgang L/R → Behringer Wing, alle Musiker mit In-Ear
- Nord Sound Manager auf dem Windows-PC
- Programme werden nach Songtiteln benannt (z. B. „So What“)

## Sektionen

- **Organ:** Modelle B3, Soft B3, B3 Bass, Vox, Farf, Pipe. Drei Zugriegel-Sätze: PRESET 1, PRESET 2, LIVE (LIVE = echte Stellung der physischen Zugriegel). Vibrato/Chorus V1–V3, C1–C3. Percussion (Volume Soft, Decay Fast, Harmonic Third).
- **Rotary (Leslie):** ON, Zuordnung ORG/PNO/SYN über SHIFT+ON, DRIVE, MIC POS, BASS WIDE, STOP, SLOW/FAST.
- **Piano:** Kategorien Grand, Upright, Electric, Clavinet, Harpsichord, Digital (Layer), Misc (Mallets). Auswahl über das PIANO LIBRARY-Rad (drücken = Kategorie). KB TOUCH, UNISON, STRING RES, DYN COMP, TIMBRE (Soft/Mid/Bright/Dyno1/Dyno2).
- **Synth:** SOUND LIBRARY mit SAMPLES, ANALOG (Virtual Analog), FM; Kategorien wie Pad, Strings, Brass. Dual Envelope (Attack, Decay/Sustain, Release), Filter (Freq, Res, Env Amt), Voice Mode, Unison, Glide, Dynamics, Velocity. Beim Laden eines Presets werden Hüllkurve und Dynamics mitgeladen.
- **Effekte (pro Sektion!):** Mit **FX FOCUS** wählt man, ob man die Effekte von Orgel, Piano oder Synth bearbeitet. FX BYPASS = Shift+FX Focus.
  - MOD 1: Tremolo, Pan 1, Pan 2, Ring Mod, Wah
  - MOD 2: Chorus, Flanger, Phaser, Vibe, Ensemble
  - Delay (Tempo/Tap, HP/LP/BP, Ping Pong, Feedback, Dry/Wet, Analog, Global)
  - EQ / Amp Sim (Bass, Mid, Treble, Mid-Freq, Drive; Amps Suitcase, JC, Small, Brit, Twin)
  - Compressor (Amount, Global)
  - Global Reverb (Stage, Room, Spring, Hall, Cathedral, Chorale; Bright/Dark; Dry/Wet; **LAYER SEND** = Shift+On für unterschiedliche Hallanteile pro Sektion)
- **KB Split** mit Split-Punkt und X-Fade; jede Sektion per KB ZONE (LO/UP) zuordenbar.

## Display-Werte der Drehregler (von Chris am Gerät abgelesen, 14.11.2026)

**Wichtig:** Gespeichert wird der Wert im Display, nicht die Knopfstellung. Nach einem Programmwechsel stimmt die Stellung des Knopfs nicht mehr mit dem gespeicherten Wert überein; erst beim Anfassen springt der Wert auf die Knopfstellung. Anleitungen müssen deshalb den **Display-Wert mit Einheit** nennen („drehen, bis im Display … steht“), nicht eine Reglerstellung 0–10.

| Regler | ganz links | Mitte | ganz rechts |
|---|---|---|---|
| Synth ATTACK | 0,5 ms | 1,2 s | 45 s |
| Synth RELEASE | 3 ms | 1,2 s | 45 s |
| Synth FREQ (Filter) | 14 Hz | 490 Hz | 32 kHz |
| Synth LEVEL | Off | −12 dB | 0 dB |
| Piano LEVEL | Off | −12 dB | 0 dB |
| Orgel LEVEL | Off | −12 dB | 0 dB |
| Rotary DRIVE | 0 | 5 | 10 |
| MOD 1 RATE / AMOUNT | 0 | 5 | 10 |
| Delay DRY/WET | 0 | 5 | 10 |
| Compressor AMOUNT | 0 | 5 | 10 |
| Amp Sim DRIVE | 0 | 5 | 10 |
| Reverb DRY/WET | 0 | 5 | 10 |

In der App: Schritte mit Zeit-, Frequenz- oder dB-Wert tragen das Feld `disp` (Display-Text, z. B. `'300 ms'`, `'−12 dB'`); `val` ist dort nur noch die ungefähre Knopfstellung für die Landkarte. Bei den 0–10-Reglern ist `val` selbst der Display-Wert.

## Lautstärke (mit Chris am 14.11.2026 besprochen)

- **MASTER LEVEL** wird nicht im Programm gespeichert; es gilt immer die Knopfstellung (global für alle Sounds). Chris lässt ihn auf einer festen, markierten Stellung; der Mischer am Wing pegelt einmal auf einen Referenz-Sound ein.
- Die Lautstärke pro Song wird über die **LEVEL-Regler der Sektionen** (Piano, Orgel, Synth) eingestellt – die werden gespeichert. Gleiche dB-Werte klingen je nach Klang unterschiedlich laut, deshalb jedes Programm vor dem Speichern mit dem Referenz-Sound vergleichen.
- In der App: `settings.nordMaster`, `settings.nordRef` (Freitext) und pro Song `levelOk` (Haken „abgeglichen“).

## Programme

- 500 Programmplätze in **20 Bänken A–T**, Auswahl mit PROGRAM-Rad oder PROGRAM-Tasten 1–5, PAGE blättert.
- **Live Mode:** 5 besondere Plätze, Änderungen werden automatisch gespeichert – interessant für die Bühne.
- **Speichern:** STORE, Platz wählen, STORE bestätigen. **STORE AS…** (Shift+Store) zum Benennen.
- Programmliste lässt sich nach Name (Abc) oder Kategorie sortieren; ORGANIZE (Shift+Program 5) zum Verschieben/Tauschen.

## MIDI (für die spätere Programmwechsel-Funktion)

Das Electro 7 sendet und empfängt Program Change auf dem globalen MIDI-Kanal (im System-Menü einstellbar).

| | Program | Live | Sample | Analog | FM |
|---|---|---|---|---|---|
| Bank MSB (CC 0) | 0 | 1 | 2 | 3 | 4 |
| Bank LSB (CC 32) | 0–5 | 0 | 0–x | 0–x | 0–x |
| Program Change | 1–125 | 1–5 | 1–99 | 1–99 | 1–99 |

Eine MIDI-Programmbank umfasst fünf Nord-Bänke à 25 Programme (Nummern 1–125). Ein Program Change ohne Bank Select wirkt in der aktuell gewählten Bank.
