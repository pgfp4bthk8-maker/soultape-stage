# CLAUDE.md – Übergabe für Claude Code

Dieses Dokument fasst alles zusammen, was beim Weiterentwickeln von **SoulTape Stage** wichtig ist.
Es entstand am 08.11.2026 aus dem Planungs- und Bau-Chat auf claude.ai.
Die fachlichen Anforderungen stehen in **`docs/ANFORDERUNGEN.md`** (Version 0.2), Fakten zum Instrument in **`docs/NORD-ELECTRO-7.md`**.
**Persönliches** (Name des Nutzers, Band, Pfade, private Dateien, Links) steht in **`CLAUDE.local.md`** – git-ignoriert, nur auf dem PC des Nutzers.

## Nutzer (kurz)

- Keyboarder einer Rock/Pop-Coverband. Kommuniziert auf **Deutsch**, oft per Sprache.
- **Git-Einsteiger:** Befehle Schritt für Schritt erklären, einen Befehl pro Zeile, auf Leerzeichen hinweisen (z. B. `cd ~`, `git push --tags`).
- Windows-PC (Git Bash), die App läuft auf dem **iPad** als Web-App vom Home-Bildschirm; die Bandkollegen nutzen iPhone und Android.
- Mag den Interview-Stil: lieber eine Frage nach der anderen als lange Fragelisten.
- Sound-Begriffe (Rhodes, Wurli, Drawbars …) immer kurz erklären.

## Projekt-Infrastruktur

- GitHub: `https://github.com/pgfp4bthk8-maker/soultape-stage` (**öffentlich**, nötig für kostenloses GitHub Pages).
- Live-App: `https://pgfp4bthk8-maker.github.io/soultape-stage/` (GitHub Pages, Branch `main`, Ordner `/`).
- Anmeldung bei GitHub läuft über den Git Credential Manager (bereits eingerichtet).
- Commits laufen über die GitHub-noreply-Adresse (lokale Git-Einstellung dieses Projekts).
- Versionen werden mit Git-Tags markiert (`v0.1.0` … ).

## Harte Regeln

1. **Keine Songtexte im Repository.** Das Repo ist öffentlich. Texte/Akkorde importiert der Nutzer in der App, sie bleiben im Browser-Speicher seines Geräts. `.gitignore` schließt `*.chopro`, `*.cho` und Backups aus. Auch keine Songtexte in Testdaten committen – Tests mit selbst ausgedachten Zeilen.
2. **Bühnenstabilität vor allem anderen:** komplett offline, keine Pop-ups/Dialoge/`alert`/`confirm` in der Song- bzw. Bühnenansicht, keine Update-Hinweise, Bildschirm bleibt an (Wake Lock). `confirm()` ist nur in Bearbeiten/Einstellungen erlaubt.
3. **Original-Leadsheets nie überschreiben.** Jede Änderung oder Umwandlung wird als neue Version gespeichert; der Nutzer wählt die aktive Version.
4. **Kein Build-Schritt.** Reines HTML/CSS/JavaScript mit ES-Modulen, damit GitHub Pages es direkt ausliefert und der Nutzer es ohne Toolchain versteht. Keine Frameworks, keine CDN-Abhängigkeiten (offline!).
5. **Bei jeder neuen Version:** `APP_VERSION` in `js/app.js` und `CACHE` in `sw.js` hochzählen, neue Dateien in die `FILES`-Liste von `sw.js` eintragen, `CHANGELOG.md` ergänzen, Git-Tag setzen.
6. **Alte Sicherungen müssen immer einspielbar bleiben.** Neue Felder nur ergänzen und so auslesen, dass sie fehlen dürfen. Wird der Aufbau der Daten grundlegend geändert: `SCHEMA` in `js/store.js` hochzählen und in `importBackup()`/`load()` einen Umwandlungsschritt für ältere Stände einbauen (dem Nutzer am 15.11.2026 zugesagt).
7. **Keine privaten Daten im Repository** (seit 20.11.2026 vereinbart): keine Personennamen (auch nicht der Bandmitglieder), Mail-Adressen, Konten, lokale Pfade, private Dateinamen oder Doc-Links in Code, Kommentaren, `CLAUDE.md`, `CHANGELOG.md`, `docs/` oder Commit-Nachrichten. Solches gehört in `CLAUDE.local.md`. Vor jedem Commit den Diff darauf prüfen.

## Architektur

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg, lädt `js/app.js` als Modul |
| `css/app.css` | Dunkles Bühnen-Design; Farben als CSS-Variablen; Schriftgröße Leadsheet über `--font` |
| `js/app.js` | Hash-Router (`#/`, `#/listen`, `#/liste/:id`, `#/song/:id`, `#/bearbeiten/:id`, `#/import`, `#/teilen`, `#/lexikon[/id]`, `#/einstellungen`), alle Ansichten, Wake Lock, Tipp-Blättern |
| `js/store.js` | Zustand in `localStorage` (Schlüssel `soultape-stage`), Song-CRUD, Leadsheet-Versionen, Titel-Abgleich beim Import (Levenshtein + Aliase), Backup-Export/-Import, Pakete, Startdaten auffrischen |
| `js/data.js` | `LEXICON` (Sound-Lexikon), `SEED_SONGS`/`REST_SONGS` (Soundvorschläge), Bausteine für Anleitungsschritte |
| `js/panel.js` | SVG-Landkarten der 5 Nord-Sektionen (`organ`, `piano`, `synth`, `effects`, `program`), Hervorhebung von Reglern |
| `js/chordpro.js` | ChordPro einlesen (tolerant), Akkorde erkennen/transponieren, H/B-Schreibweise, Darstellung als HTML |
| `js/metronome.js` | Visuelles Metronom (seit 0.1.22): `metroAt()` (reine Rechnung), `metroHtml()`, `startMetro()`/`stopMetro()`, optionaler Klick über Web Audio |
| `js/flow.js` | Song-Ablauf (seit 0.1.25): `cleanFlow()`, `sectionKey()` (Abschnittsart + Nummer aus Namen wie „Verse 2“, „(2.Str.)“, „Ref.2“), `matchFlow()` (Ablauf-Zeilen → Abschnitte des Blatts), `flowBadges()`, `flowBarHtml()`, `flowText()` |
| `sw.js` | Service Worker: Cache-first, Aktualisierung still im Hintergrund |

### Datenmodell (Song)

```js
{
  id, title, artist, key, transpose,        // transpose: Halbtöne, pro Song gespeichert
  nordProgram, nordStored, nordSlot,        // Programmname auf dem Nord, "schon gespeichert?", Speicherplatz (z. B. "M 23")
  kawai,                                    // alter Sound-Code vom Kawai, nur als Referenz
  durationSec, bpm, beats,                  // bpm: Tempo 30–300; beats: Schläge pro Takt, null = 4 (seit 0.1.22)
  flow: [{ part, voc, solo, fx }],          // Ablauf: wer singt, Solos, Effekte – gehört zum Song, nicht zum Blatt (seit 0.1.25)
  tags: [], notes, aliases: [], no,         // no: Songnummer zum Zurufen
  parts: [{ name, lex, summary, tips, steps: [Step] }],   // mehrere Sounds pro Song (Strophe/Refrain/Medley-Teil)
  sheets: [{ id, name, created, text }], activeSheet       // Leadsheet-Versionen (ChordPro-Rohtext)
}
// Step: { s: Sektion, c: Regler-ID (oder Gruppen-ID), t: Text, sel?: LED-Auswahl, val?: Knopfwert 0–10, drawbars?: '888000000' }
```

Regler-IDs stehen in `CONTROLS` in `js/panel.js` (z. B. `org-model`, `rot-fast`, `pno-library`, `fx-rev-mix`). Gruppen (`grp`) heben mehrere Elemente gemeinsam hervor (z. B. `rot-speed`, `org-perc`).

### ChordPro-Besonderheiten (aus den echten Dateien des Nutzers)

Die erste Probedatei des Nutzers (10 Einträge, Dateiname in `CLAUDE.local.md`, **nicht** im Repo) ist uneinheitlich. Der Parser behandelt:
- `{new_song}`-Trennung, `{title}`/`{t}`, `{subtitle}`/`{st}`, `{key}`, `{soc}`/`{eoc}`, `{start_of_part}`, `{comment}` (Werbe-/Quellen-Kommentare werden ausgeblendet)
- Abschnitte als normaler Text: `Verse 1`, `(Chorus)`, `CHORUS:`, `(Intro 4x)`, `(2.Str.)`, `Bridge:` usw.
- Spielhinweise in Klammern → orange „Trigger“: `(Lauf)`, `(nur Git)`, `(Synth)`, `(bis Gesang einsetzt)`, `(1.Umk)`; in Akkordzeilen auch inline `(2T)`, `(Bass)`. Regel: **bis 4 Wörter** = Trigger, **länger** = Backing-Vocals/Einwurf → grau-kursiv (Zeilentyp `vocal`, CSS `.vocal`)
- Alte Kawai-Codes wie `11A EFF`, `33C EFFOrgel 70%`, `(33C+11A+11B)` → werden erkannt und ins Feld `kawai` übernommen
- Medley-Trenner `----Rockin all over----` → Zwischenüberschrift
- Akkordzeilen über Textzeilen (altes Format) → werden in Inline-Akkorde umgewandelt
- Taktstriche `| E | A | x2`, auch `INTRO | C | C/E |`
- Eigene Kürzel (mit dem Nutzer am 08.11.2026 geklärt, umgesetzt in `parseChord`/`INV_RE`): **Zahl = Umkehrung.** `C-2` (auch `C 2`) = 2. Umkehrung → Anzeige **C/G**; `D1` (auch `D-1`) = 1. Umkehrung → **D/F#** (Moll: kleine Terz, `Am1` → Am/C); `G 0`/`G0` = Grundstellung → **G**. **Ausnahme:** `D2`/`A2` **ohne Strich** = add2 (D-Dur mit e), keine Umkehrung. Die Original-Version behält die Schreibweise des Nutzers, nur die Anzeige ist Slash-Akkord. Andere unbekannte Kürzel mit Strich (z. B. `C-5`) werden weiter blau als „bitte prüfen“ markiert – neue Kürzel mit dem Nutzer klären, nicht raten.
- Schreibweise der Datei ist gemischt (meist englisch B, bei Westerland H). Eingabe wird als englisch gelesen, `H` als B erkannt; Anzeige standardmäßig deutsch (H, B = Bb).

### Weitere Besonderheiten (aus einer OnSong-Auftritts-Setliste des Nutzers)
- Die Datei ist eine **Auftritts-Setliste** (40 Einträge in Spielreihenfolge) mit leeren Trenner-Einträgen „Pause 😃“, „Pause 2 😃“, „Zugabe 😂😂😂“ → beim Import abgewählt. Reihenfolge + Pausen ergeben direkt Sets.
- Viele Songs stammen aus Internet-Vorlagen: Kleinbuchstaben = Moll (`[a]`, `[em]`), deutsche Namen (`Cism`, `Gis`), Tabulatur `{sot}`/`{eot}` (oft jede Saite einzeln), `[Intro]`/`[Chorus 2x]` als Abschnitt, Text in eckigen Klammern (`[guitar stops]`), `[Eb-Bb-Eb]`, `[C#m(x3)]`, `[(x2)]`, `[-]`, `{inline: …}`, `#`-Kommentarzeilen. Die Einordnung macht `bracketKind()` in `js/chordpro.js`.
- Eigene Notizen des Nutzers in dieser Datei: Kawai-Codes (`22B EFF/ 11A EFF`, `71A EFX`), Hinweise wie „(Key Str+Fargo -1Okt)“, „(Strings linke Hand, leise)“.
- Bekannter Fehler in der Vorlage: *Uninvited* hat `[D[C#]]` (bleibt blau markiert). *Enter Sandman* hat `{subtitle:Intro}` statt des Interpreten.

## Stand gegenüber den Anforderungen

**Erledigt (0.1.0):** Songverwaltung mit mehreren Sound-Teilen, Soundvorschläge mit Kurzbeschreibung + Schritt-Anleitung, 5 Bedienfeld-Landkarten mit Hervorhebung (inkl. Zugriegel-Stellungen und Knopfwerten), Sound-Lexikon, Kawai-Feld, Nord-Programmname + „gespeichert“-Haken, ChordPro-Import (Mehrfach-Datei, Zuordnung zu vorhandenen Songs, Tonart-Vorschlag), Leadsheet-Versionen, Transponieren, H/B, Trigger-Hervorhebung, Tipp-Blättern (rechts/links, ca. 2/3 Bildschirm, sanft), Wake Lock, Bühnen-/Vorbereitungsmodus, Schlagworte (feste Liste + eigene) und Dauer-Feld, Backup-Export/-Import, ChordPro-Export, PWA/offline.

**Offen (nach Priorität, mit dem Nutzer abstimmen):**
1. **Echten Import testen** – erledigt in 0.1.1: alle Songs der echten Dateien werden erkannt, keiner läuft seitlich aus dem Bild; Darstellung vom Nutzer auf dem iPad bestätigt. Feinschliff nach Bedarf, wenn beim Proben etwas auffällt.
2. **Soundvorschläge am Instrument prüfen** – Werte sind Startpunkte; Piano-/Synth-Modellnamen hängen von der installierten Nord-Library ab.
3. **Stufe 3 – Setlisten:** beliebig viele, bis zu 4 Sets mit Pausen, Drag & Drop, Spieldauer pro Set/Auftritt, Bühnenansicht folgt der Setlist. Merkmale pro Song: Sänger, Tempo/Stimmung, Besetzung, Gitarren-/Piano-/Sängerwechsel. *Erster Schritt erledigt (0.1.8):* Bereich „Setlisten“ (`#/listen`, `#/liste/:id`), `state.lists` = `{ id, kind: gig|probe, name, date, items: [{type:song,id}|{type:break,name}], snapshots: [{id,name,created,items}], missing }`; „Stand festhalten“ (manuell, Name optional, sonst Datum+Uhrzeit – so vom Nutzer gewünscht), Ziehen am Griff ≡ plus ▲/▼, Übernahme der Reihenfolge aus einer ChordPro-Datei. Bühne folgt der Liste über `settings.navList = { id, pos }` und `listContext()`. Die Setlist entsteht in der Band gemeinsam in der Probe und wird dort umgestellt. **Noch offen:** Merkmale pro Song (Tempo, Besetzung, Wechsel – Sänger stehen seit 0.1.25 im Ablauf), Speicherplatz am Nord aus der Liste berechnen (auch in den Wechsel-Balken), Dauer bei den meisten Songs fehlt noch, Setlist-Vorschläge.
4. **KI-Unterstützung** (nur Vorbereitungsmodus, API-Schlüssel nur lokal speichern): Soundvorschlag für neuen Song im `parts`/`steps`-Format, Leadsheet-Aufräumen (Abschnitte, Titel/Interpret korrigieren, Schreibweise vereinheitlichen, Werbung entfernen) mit **Vorschau Original ↔ Ergebnis** und Speichern als neue Version, Setlist-Vorschläge in Blöcken.
4a. **App für die ganze Band** (am 15.11.2026 besprochen): Kollegen (Gitarre, Bass, Schlagzeug, Gesang, Mischer am Wing) nutzen die App auch; sie arbeiten sonst meist mit OnSong (ChordPro-Export → vorhandener Import). Entschieden: **Jeder Musiker hat pro Song sein eigenes, vollständiges Blatt** – Akkorde unterscheiden sich pro Instrument, bei Backing-Sängern auch der Text. Gemeinsam sind nur Songliste (Titel, Tonart, Dauer, Ablauf) und Setlisten. Langfristig eine gemeinsame Fassung anstreben, ohne jemanden zu zwingen. Kein Server; Austausch über Dateien. Keine festen Geräte anderer Musiker einbinden. Reihenfolge: (1) *erledigt in 0.1.14:* Profil `settings.profile = { name, role }` und Anzeige-Schalter `settings.show = { chords, nord, metro, flow }` (`ROLES`, `shows()` in `js/app.js`; CSS `body.nonord .nord-only`, `.sheet.nochords`); (2) Blätter einer Person zuordnen, Blick in die Blätter der anderen; (2a) *erledigt in 0.1.15:* „Songs teilen“ (`#/teilen`, `viewShare()`/`viewPackage()` in `js/app.js`; `exportPackage()`, `readPackage()`, `packagePlan()`, `applyPackage()` in `js/store.js`) – Paket-Datei `soultape-paket-<Datum>.json` mit `type: 'paket'`, enthält gewählte Songs mit aktivem Blatt, optional `parts`. Einspielen legt neue Songs an bzw. hängt das Blatt als Fassung „Von <Name>, <Datum>“ an (`sheet.from`), nie aktiv, nie überschreibend. `importBackup()` weist Pakete ab. Seit 0.1.17 auch Setlisten im Paket (`lists: [{ name, kind, date, items: [{type:'song', title, artist, key, durationSec} | {type:'break', name}] }]`, Songs über den Titel statt ID): gleichnamige Liste beim Empfänger wird aktualisiert, vorher `snapshotList()` „Vor Paket von …“; fehlende Songs werden leer angelegt (`listPlan()`, `resolveTitle()`). **Kennung:** Paket-Einträge tragen `uid` (`songUid()` = `bandId || id`); der Empfänger merkt sie sich in `song.bandId`/`song.links` (`linkSong()`), Zuordnung über `songByUid()` vor dem Titelvergleich. **Songnummern** (Wunsch des Nutzers, zum Zurufen im Proberaum): `song.no`, `state.noMax` (höchste je vergebene, wird nicht neu vergeben), `settings.numbering` = dieses Gerät vergibt Nummern (nur das Gerät des Nutzers), `numberAllSongs()`/`setSongNo()`/`nextNo()`; Nummern reisen im Paket und werden nur übernommen, wenn der Song noch keine hat und die Nummer frei ist. Idee für später: Medley aus nummerierten Songs zusammensetzen („7, 8 und 15“); (3) *erledigt in 0.1.20:* „Band-Paket“ (Knopf in `viewShare()`, `exportPackage(ids, { bare, band: true })` – `bare` = Songs nur mit Eckdaten, Paket trägt `band: true`): ganze Songliste + alle Setlisten, Blätter nur angehakte. Beim Einspielen (jedes Paket) vergleicht `fieldPlan()` die gemeinsamen Eckdaten `SHARED_FIELDS` (Titel, Interpret, Tonart, Dauer, Tempo, Taktart, Ablauf): leere Felder werden ergänzt (`fill`), abweichende standardmäßig übernommen (`diffs`), pro Feld abwählbar über `item.keep[f]` (am 17.11.2026 so entschieden). Alter Titel wird Alias. Vorschau fasst sicher erkannte Songs ohne Änderung zusammen. `importBackup()` behält das eigene Profil, wenn der Profilname der Sicherung abweicht (`ownProfile`); Geräte-Einstellungen `DEVICE_SETTINGS` in `js/store.js` (layout, numbering, mode, fontSize, pageMs, metro) bleiben seit 0.1.24 immer auf dem Gerät, auch bei der eigenen Sicherung (Handy → iPad); (4) geräteneutrales „Mein Sound“ pro Person (Name, Speicherplatz, Notiz).
5. **Pro Sound-Teil: Instrument (Nord/Kawai) und Spieler (Keyboarder oder der zweite Spieler, der zwischen Gitarre und Keyboard wechselt)** – flexibel, ohne feste Zuordnung.
6. **PDF-Export** im hellen Druckformat.
7. Gebremstes Wischen auf der Bühne (aktuell normales Scrollen + Tipp-Blättern).
8. Später: Bluetooth-Fußschalter (sendet meist Pfeil-/Bild-Tasten → Tastatur-Events), MIDI-Programmwechsel (Web MIDI am PC; Safari/iPad hat kein Web MIDI → Brücken-App oder native App), Band-Synchronisation, Referenzaufnahmen, Hörbeispiele.

**Wünsche aus der Bandprobe** (Doc des Nutzers, Link in `CLAUDE.local.md`, am 19.11.2026 durchgesehen): (1) automatische Synchronisation per Cloud – widerspricht „kein Server“, erst grundsätzlich entscheiden; (2) **Smartphone-Ansicht – erledigt in 0.1.23** (Sänger: iPhone und Android, hochkant in Halterung am Mikrofonständer, folgen der Setliste; brauchen Text, Abschnitte, Hinweise, manche Akkorde); (3) **visuelles Metronom – erledigt in 0.1.22**; (4) PDF/Bilder als Blatt – braucht IndexedDB statt localStorage (5 MB), große Backups; (5) Effekt-Marken fürs Mischpult – **erledigt in 0.1.25 als „Ablauf“** (am 20.11.2026 entschieden: gehört zum Song statt zum Blatt, damit jeder Musiker ihn in seinem eigenen Blatt sieht; Eingabe als Tabelle unter Bearbeiten, Bühne = Schilder an den Abschnitten über `renderSheet({ secExtra })`, Zeilen ohne passenden Abschnitt als Leiste `.flowbar`; Feld `flow` in `SHARED_FIELDS`, Anzeige-Schalter `settings.show.flow`; Namensvorschläge nur aus Profilname und schon eingetragenen Werten); Wing per OSC nur über ein Hilfsprogramm; (6) Technik-Assistent mit Anleitungen – KI/API, nur Vorbereitung, gehört zu Punkt 4.
- **Handy-Ansicht** (seit 0.1.23): `body.phone`, gesetzt von `applyLayout()` in `shell()` und bei `resize`; `isPhone()` = `settings.layout` ('auto' | 'phone' | 'tablet'), automatisch bei kürzerer Bildschirmseite < 600 px oder schmalem Fenster (nicht nur `innerWidth` – der wächst mit, wenn eine Seite zu breit ist). CSS-Helfer `.lbl-long`/`.lbl-short`, `.phone-only`; Regeln am Ende von `css/app.css`. `--headh` = gemessene Höhe der Kopfleiste (für `.sheetbar { top }`). Knopf `.nextbtn` in der Notenleiste (nur Handy). `tidyChordRows()` blendet leere Akkordzeilen umgebrochener Zeilen aus (Klasse `nc`), läuft nach dem Zeichnen, bei A−/A+ und bei `resize`.
- **Metronom** (seit 0.1.22): Leiste `#metro` oben als letzte Zeile der `.sheetbar` oder fest unten (`.metro.bottom`, `body.metro-bottom`). Anzeige-Schalter `settings.show.metro` (Standard aus, `SHOW_OFF`; Rolle Schlagzeug = an), Einstellungen `settings.metro = { off, accent, click, bottom }`, `metroOn()` in `js/app.js`. Ballposition aus `performance.now()` berechnet (Bildraten-unabhängig); Neuzeichnen desselben Songs behält den Takt (`key` = Song-ID). Tippen auf die Leiste (`pointerdown`) setzt Schlag 0 = Eins. Klick per Web Audio, im Voraus eingeplant (`getOutputTimestamp`), Audio erst nach einem Tippen (iOS). Leiste ist kein Pop-up und bleibt auch auf der Bühne. Im Vorschau-Browser von Claude Code kommen nur wenige Bilder pro Sekunde an – Genauigkeit über `metroAt()` prüfen.

**Bekannte Kleinigkeiten:**
- Seit 0.1.3 haben alle 37 Songs der Auftritts-Setliste Soundvorschläge in `SEED_SONGS` (47 Einträge). `refreshSeeds()` in `js/store.js` ordnet sie importierten Songs über den Titel zu und füllt nur Songs ohne Sound; bei höherer `SEED_VERSION` passiert das still beim Start. Das **NDW-Medley** besteht aus Irgendwie, irgendwo, irgendwann (Nena) → Alles nur geklaut (Die Prinzen) → Major Tom (Peter Schilling) → Sternenhimmel (Hubert Kah); seit 0.1.9 mit vier Sound-Teilen (ein Programm für Teil 1–3, zweites Programm für den Lead in Teil 4), ungehörte Startwerte. Die Kawai-Codes (`11A`, `33C` …) sind nicht entschlüsselt.
- Seit 0.1.21 (`SEED_VERSION` 7) gibt es zusätzlich `REST_SONGS` in `js/data.js`: 87 Vorschläge für die übrigen Songs des Nutzers (Quelldatei in `CLAUDE.local.md`). Sie tragen `fillOnly: true`: Sie füllen nur vorhandene Songs bei **exakt** passendem Titel/Alias (`findForSeed()`), werden von `fresh()` und `refreshSeeds({ addMissing })` nicht als Songs angelegt. Neue Bausteine dort: `solo()`, `synthOnly()`, `layered()` (Klavier + Ebene aus `LAYER`, die per ON dazukommt), `chorus()`, `trem()`; `NORD_SYNTH` um `SAMPLES/BrassEns` und `ANALOG/Bass` ergänzt. In der Quelldatei steht bei *Nur noch kurz die Welt retten* fälschlich „Sportfreunde Stiller“ (ist Tim Bendzko) – der Nutzer korrigiert in der App.
- Seit 0.1.4 nennen die Anleitungen die genauen Klangnamen des Nord des Nutzers (`NORD_HAS`, `NORD_PIANO`, `NORD_SYNTH` in `js/data.js`). Quelle: Nord Sound Manager → File → **Export Sound Lists** → vier HTML-Dateien (Piano, Samp Lib, Synth Preset, Program; Ablageort in `CLAUDE.local.md`). Bei neuen Klängen neu exportieren lassen. Die Program-Liste zeigt: Für fast alle Songs gibt es schon Programmplätze (Bank M, N, O, P; „M11“ in den Notizen = Bank M, Programm 11) – viele in Bank O sehen aber nach leeren Platzhaltern aus. Der Speicherplatz ist als Feld `nordSlot` pro Song in der App (Songliste, Song-Ansicht, Setlisten, Bearbeiten); nur ein Vorschlag des Platzes beim Setzen eines Wechsel-Balkens fehlt noch.
- **Regler-Angaben immer als Display-Wert mit Einheit** (seit 0.1.6): Der Nord speichert den Wert im Display, nicht die Knopfstellung. Attack/Release in ms/s, LEVEL in dB, Filter in Hz; Rotary-Drive und Effekt-Regler zeigen 0–10. Schritte tragen dafür `disp`; `val` ist dort nur die ungefähre Zeigerstellung. Messwerte in `docs/NORD-ELECTRO-7.md`. Bei neuen Reglern erst den Nutzer nach den Display-Werten (links/Mitte/rechts) fragen, nicht raten.
- **Soundwechsel im Leadsheet** (seit 0.1.7): eigene Direktive `{wechsel: Text}` (auch `soundwechsel`, `x_wechsel`) → Zeilentyp `switch`, CSS `.sheet .switch` (Magenta, `--switch-bg`). Beginnt der Text mit einem Speicherplatz („M 24 …“, `SLOT_RE`), wird er als Programmwechsel groß hervorgehoben; sonst Handgriff im selben Programm („Synth AN“). Der Nutzer braucht beides. `parseSheet` gibt jeder Zeile `src` (Zeilennummer im Rohtext), `renderSheet` schreibt sie als `data-src`; darüber setzt `openMarkBox()`/`editMarks()` in `js/app.js` die Wechsel per Tippen (nur Vorbereitung). Seit 0.1.10 heißt der Knopf „✎ Im Blatt ändern“: Im selben Feld lässt sich die angetippte Zeile auch direkt ändern (Rohtext der Zeile; `data-n` = Anzahl Rohzeilen, 2 bei Akkordzeile über Textzeile) – der Nutzer spielt in der Probe im Vorbereitungsmodus und will Fehler an Ort und Stelle korrigieren. Die erste Änderung legt eine Kopie „Arbeitsfassung“ an (`sheet.marks = true`; bis 0.1.9 hieß sie „Mit Soundwechseln“), weitere Änderungen landen in dieser Kopie – das Original bleibt unberührt.
- **Tipp-Blättern** (seit 0.1.7): eigene Bewegung `glide()` in `js/app.js` statt `scrollBy({behavior:'smooth'})` (war dem Nutzer zu schnell). Dauer `settings.pageMs` (700/1400/2200 ms, Standard 1400). Im Vorschau-Browser von Claude Code feuert `requestAnimationFrame` nicht, wenn die Seite im Hintergrund läuft – zum Testen dort durch `setTimeout` ersetzen.
- **Lautstärke** (seit 0.1.7): MASTER LEVEL wird nicht pro Programm gespeichert → feste Stellung, kein Feld pro Song. Abgleich pro Song über die Sektions-LEVEL gegen einen Referenz-Sound; `settings.nordMaster`/`nordRef` und Song-Feld `levelOk`. Die dB-Werte in den Seeds sind ungehörte Startwerte.
- Geänderte Startvorschläge erreichen vorhandene Songs nur, wenn der Nutzer sie nicht selbst geändert hat (`seedMark`/`untouched()` in `js/store.js`); dazu `SEED_VERSION` hochzählen.
- **Update-Falle (in 0.1.11 behoben):** GitHub Pages liefert mit `Cache-Control: max-age=600`. Der Service Worker muss beim Installieren mit `cache: 'reload'` und beim Hintergrund-Abgleich mit `cache: 'no-cache'` laden, sonst landet die alte `app.js` aus dem Browser-Zwischenspeicher im neuen Cache und das iPad zeigt weiter die alte Version. Nicht wieder auf einfaches `addAll(FILES)` zurückbauen. Seit 0.1.19 lädt sich die App nach einem Update einmal selbst neu (`controllerchange` am Ende von `js/app.js`) – bewusst nur im Vorbereitungsmodus, in den ersten 30 s, auf Übersichtsseiten, ohne Eingabefokus, einmal pro Start (`sessionStorage` `st-reloaded`). Diese Grenzen nicht lockern: Auf der Bühne und im geöffneten Song darf nie etwas neu laden. Prüfen, was live ist: `curl` auf `…/soultape-stage/sw.js`.
- Daten liegen pro Gerät im Browser; PC → iPad nur über Backup-Datei. Den Nutzer regelmäßig an Backups erinnern.
- **Ampel für die Sicherung** (seit 0.1.12): `backupStatus()`/`markBackupDone()` in `js/store.js`, eigener Speicher-Schlüssel `soultape-stage-sicherung` (`{ at, mark, dirtySince }`). `mark` ist ein Fingerabdruck von Songs + Listen (Einstellungen zählen nicht). Grün = gesichert, Gelb = Änderungen, Rot = seit `BACKUP_DUE_DAYS` (7) Tagen ungesichert oder nie gesichert. Punkt neben „Einstellungen“ und Hinweis über der Songliste – beides nur im Vorbereitungsmodus, nie auf der Bühne. Die App kann nicht prüfen, ob die Datei nach dem Export wirklich gespeichert wurde. Seit 0.1.13 legt `importBackup()` vorher den Gerätestand unter `soultape-stage-vorher` beiseite (nur einer); `restorePrevious()` tauscht ihn zurück. Hohe Verfügbarkeit ist dem Nutzer sehr wichtig.
- **iOS-Dateiauswahl:** Kein `accept=".chopro,…"` an `<input type="file">` setzen – iOS kennt die Endung nicht und graut die Dateien aus (in 0.1.2 behoben). `.json` für Backups funktioniert.
- Die Landkarten sind vereinfacht; einzelne Beschriftungen (z. B. EQ „MID“) sind angenähert. Fotos des echten Panels: siehe `CLAUDE.local.md`.

## Testen

- Lokal: im Projektordner `node tools/server.js` und `http://localhost:8000` öffnen – ein Doppelklick auf `index.html` funktioniert wegen ES-Modulen nicht. **Python ist auf dem PC des Nutzers nicht installiert.** Für Claude Code gibt es `.claude/launch.json` (Name `soultape-stage`).
- **Node auf dem PC des Nutzers ist Version 6** (kann keine ES-Module). Parser deshalb im Browser testen: auf der lokalen Seite `await import('/js/chordpro.js?' + Date.now())` ausführen.
- Achtung Service Worker: Er liefert auch lokal zuerst aus dem Cache. Nach Code-Änderungen im Test-Browser Registrierung und Caches löschen (`navigator.serviceWorker.getRegistrations()` → `unregister()`, `caches.keys()` → `caches.delete()`).
- Echte ChordPro-Dateien des Nutzers: Namen und Ablageorte in `CLAUDE.local.md`. Eine davon liegt git-ignoriert im Projektordner. Inhalte nie committen.
- Oberfläche in iPad-Größe (820 × 1180) und Handy-Größe (375 × 812) prüfen; Bühnenmodus über den Knopf oben rechts.

## Veröffentlichen (Ablauf für den Nutzer)

```
cd ~/Projekte/soultape-stage
git add .
git commit -m "Kurze Beschreibung"
git tag v0.x.y
git push
git push --tags
```

Vor `git add .` sicherstellen, dass `CLAUDE.local.md` in `.gitignore` steht (seit 0.1.25). GitHub Pages aktualisiert sich danach automatisch nach 1–2 Minuten. Auf dem iPad lädt die App die neue Version still im Hintergrund; beim nächsten Start ist sie aktiv.
