# CLAUDE.md – Übergabe für Claude Code

Dieses Dokument fasst alles zusammen, was beim Weiterentwickeln von **SoulTape Stage** wichtig ist.
Es entstand am 08.11.2026 aus dem Planungs- und Bau-Chat auf claude.ai.
Die fachlichen Anforderungen stehen in **`docs/ANFORDERUNGEN.md`** (Version 0.2), Fakten zum Instrument in **`docs/NORD-ELECTRO-7.md`**.

## Wer ist der Nutzer

- **Chris (Christian Würr)**, Keyboarder der Rock/Pop-Coverband **SoulTape**. Kommuniziert auf **Deutsch**, oft per Sprache.
- Informatiktechniker mit Grundkenntnissen, aber lange nicht programmiert. **Git-Einsteiger.** Befehle in Git Bash Schritt für Schritt erklären, einen Befehl pro Zeile, auf Leerzeichen hinweisen (z. B. `cd ~`, `git push --tags`).
- Arbeitet am **Windows-PC** (Git Bash, Git 2.56) und nutzt die App auf dem **iPad** (als Web-App auf dem Home-Bildschirm installiert).
- Mag den Interview-Stil: lieber eine Frage nach der anderen als lange Fragelisten.
- Sound-Begriffe (Rhodes, Wurli, Drawbars …) immer kurz erklären.

## Projekt-Infrastruktur

- Lokaler Ordner: `C:\Users\chris\Projekte\soultape-stage` (bewusst **nicht** in OneDrive, weil OneDrive und Git sich stören).
- GitHub: `https://github.com/pgfp4bthk8-maker/soultape-stage` (**öffentlich**, nötig für kostenloses GitHub Pages).
- Live-App: `https://pgfp4bthk8-maker.github.io/soultape-stage/` (GitHub Pages, Branch `main`, Ordner `/`).
- Anmeldung bei GitHub läuft über den Git Credential Manager (bereits eingerichtet).
- Git-Identität: `Chris Würr` / `christian.wuerr@gmx.de`. Diese Mail hängt noch an einem alten GitHub-Konto (`AndiMacht33`), deshalb erscheinen Commits unter diesem Namen. Kosmetisch; kann später aufgeräumt werden (Mail im alten Konto entfernen, im neuen hinterlegen).
- Versionen werden mit Git-Tags markiert: `v0.1.0` existiert.

## Harte Regeln

1. **Keine Songtexte im Repository.** Das Repo ist öffentlich. Texte/Akkorde importiert Chris in der App, sie bleiben im Browser-Speicher seines Geräts. `.gitignore` schließt `*.chopro`, `*.cho` und Backups aus. Auch keine Songtexte in Testdaten committen – Tests mit selbst ausgedachten Zeilen.
2. **Bühnenstabilität vor allem anderen:** komplett offline, keine Pop-ups/Dialoge/`alert`/`confirm` in der Song- bzw. Bühnenansicht, keine Update-Hinweise, Bildschirm bleibt an (Wake Lock). `confirm()` ist nur in Bearbeiten/Einstellungen erlaubt.
3. **Original-Leadsheets nie überschreiben.** Jede Änderung oder Umwandlung wird als neue Version gespeichert; der Nutzer wählt die aktive Version.
4. **Kein Build-Schritt.** Reines HTML/CSS/JavaScript mit ES-Modulen, damit GitHub Pages es direkt ausliefert und Chris es ohne Toolchain versteht. Keine Frameworks, keine CDN-Abhängigkeiten (offline!).
5. **Bei jeder neuen Version:** `APP_VERSION` in `js/app.js` und `CACHE` in `sw.js` hochzählen, neue Dateien in die `FILES`-Liste von `sw.js` eintragen, `CHANGELOG.md` ergänzen, Git-Tag setzen.

## Architektur (Version 0.1.0)

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg, lädt `js/app.js` als Modul |
| `css/app.css` | Dunkles Bühnen-Design; Farben als CSS-Variablen; Schriftgröße Leadsheet über `--font` |
| `js/app.js` | Hash-Router (`#/`, `#/listen`, `#/liste/:id`, `#/song/:id`, `#/bearbeiten/:id`, `#/import`, `#/lexikon[/id]`, `#/einstellungen`), alle Ansichten, Wake Lock, Tipp-Blättern |
| `js/store.js` | Zustand in `localStorage` (Schlüssel `soultape-stage`), Song-CRUD, Leadsheet-Versionen, Titel-Abgleich beim Import (Levenshtein + Aliase), Backup-Export/-Import, Startdaten auffrischen |
| `js/data.js` | `LEXICON` (Sound-Lexikon) und `SEED_SONGS` (10 Start-Songs mit Soundvorschlägen), Bausteine für Anleitungsschritte |
| `js/panel.js` | SVG-Landkarten der 5 Nord-Sektionen (`organ`, `piano`, `synth`, `effects`, `program`), Hervorhebung von Reglern |
| `js/chordpro.js` | ChordPro einlesen (tolerant), Akkorde erkennen/transponieren, H/B-Schreibweise, Darstellung als HTML |
| `sw.js` | Service Worker: Cache-first, Aktualisierung still im Hintergrund |

### Datenmodell (Song)

```js
{
  id, title, artist, key, transpose,        // transpose: Halbtöne, pro Song gespeichert
  nordProgram, nordStored,                  // Programmname auf dem Nord + "schon gespeichert?"
  kawai,                                    // alter Sound-Code vom Kawai, nur als Referenz
  durationSec, tags: [], notes, aliases: [],
  parts: [{ name, lex, summary, tips, steps: [Step] }],   // mehrere Sounds pro Song (Strophe/Refrain/Medley-Teil)
  sheets: [{ id, name, created, text }], activeSheet       // Leadsheet-Versionen (ChordPro-Rohtext)
}
// Step: { s: Sektion, c: Regler-ID (oder Gruppen-ID), t: Text, sel?: LED-Auswahl, val?: Knopfwert 0–10, drawbars?: '888000000' }
```

Regler-IDs stehen in `CONTROLS` in `js/panel.js` (z. B. `org-model`, `rot-fast`, `pno-library`, `fx-rev-mix`). Gruppen (`grp`) heben mehrere Elemente gemeinsam hervor (z. B. `rot-speed`, `org-perc`).

### ChordPro-Besonderheiten (aus Chris' echter Datei)

Chris' Datei „01 Stücke Proben.chopro“ (liegt im claude.ai-Projekt „PIANO-APP“, **nicht** im Repo) enthält 10 Einträge und ist uneinheitlich. Der Parser behandelt:
- `{new_song}`-Trennung, `{title}`/`{t}`, `{subtitle}`/`{st}`, `{key}`, `{soc}`/`{eoc}`, `{start_of_part}`, `{comment}` (Werbe-/Quellen-Kommentare werden ausgeblendet)
- Abschnitte als normaler Text: `Verse 1`, `(Chorus)`, `CHORUS:`, `(Intro 4x)`, `(2.Str.)`, `Bridge:` usw.
- Spielhinweise in Klammern → orange „Trigger“: `(Lauf)`, `(nur Git)`, `(Synth)`, `(bis Este schreit)`, `(1.Umk)`; in Akkordzeilen auch inline `(2T)`, `(Bass)`. Regel: **bis 4 Wörter** = Trigger, **länger** = Backing-Vocals/Einwurf → grau-kursiv (Zeilentyp `vocal`, CSS `.vocal`)
- Alte Kawai-Codes wie `11A EFF`, `33C EFFOrgel 70%`, `(33C+11A+11B)` → werden erkannt und ins Feld `kawai` übernommen
- Medley-Trenner `----Rockin all over----` → Zwischenüberschrift
- Akkordzeilen über Textzeilen (altes Format) → werden in Inline-Akkorde umgewandelt
- Taktstriche `| E | A | x2`, auch `INTRO | C | C/E |`
- Eigene Kürzel (mit Chris am 08.11.2026 geklärt, umgesetzt in `parseChord`/`INV_RE`): **Zahl = Umkehrung.** `C-2` (auch `C 2`) = 2. Umkehrung → Anzeige **C/G**; `D1` (auch `D-1`) = 1. Umkehrung → **D/F#** (Moll: kleine Terz, `Am1` → Am/C); `G 0`/`G0` = Grundstellung → **G**. **Ausnahme:** `D2`/`A2` **ohne Strich** = add2 (D-Dur mit e), keine Umkehrung. Die Original-Version behält Chris' Schreibweise, nur die Anzeige ist Slash-Akkord. Andere unbekannte Kürzel mit Strich (z. B. `C-5`) werden weiter blau als „bitte prüfen“ markiert – neue Kürzel mit Chris klären, nicht raten.
- Schreibweise der Datei ist gemischt (meist englisch B, bei Westerland H). Eingabe wird als englisch gelesen, `H` als B erkannt; Anzeige standardmäßig deutsch (H, B = Bb).

### Weitere Besonderheiten (aus „Krimikeller 2026.chopro“, OnSong-Setliste)
- Die Datei ist eine **Auftritts-Setliste** (40 Einträge in Spielreihenfolge) mit leeren Trenner-Einträgen „Pause 😃“, „Pause 2 😃“, „Zugabe 😂😂😂“ → beim Import abgewählt. **Für Stufe 3 (Setlisten) interessant:** Reihenfolge + Pausen ergeben direkt Sets.
- Viele Songs stammen aus Internet-Vorlagen: Kleinbuchstaben = Moll (`[a]`, `[em]`), deutsche Namen (`Cism`, `Gis`), Tabulatur `{sot}`/`{eot}` (oft jede Saite einzeln), `[Intro]`/`[Chorus 2x]` als Abschnitt, Text in eckigen Klammern (`[guitar stops]`), `[Eb-Bb-Eb]`, `[C#m(x3)]`, `[(x2)]`, `[-]`, `{inline: …}`, `#`-Kommentarzeilen. Die Einordnung macht `bracketKind()` in `js/chordpro.js`.
- Chris' eigene Notizen in dieser Datei: Kawai-Codes (`22B EFF/ 11A EFF`, `71A EFX`), Hinweise wie „(Key Str+Fargo -1Okt)“, „(Strings linke Hand, leise)“.
- Bekannter Fehler in der Vorlage: *Uninvited* hat `[D[C#]]` (bleibt blau markiert). *Enter Sandman* hat `{subtitle:Intro}` statt des Interpreten.

## Stand gegenüber den Anforderungen

**Erledigt (0.1.0):** Songverwaltung mit mehreren Sound-Teilen, Soundvorschläge mit Kurzbeschreibung + Schritt-Anleitung, 5 Bedienfeld-Landkarten mit Hervorhebung (inkl. Zugriegel-Stellungen und Knopfwerten), Sound-Lexikon, Kawai-Feld, Nord-Programmname + „gespeichert“-Haken, ChordPro-Import (Mehrfach-Datei, Zuordnung zu vorhandenen Songs, Tonart-Vorschlag), Leadsheet-Versionen, Transponieren, H/B, Trigger-Hervorhebung, Tipp-Blättern (rechts/links, ca. 2/3 Bildschirm, sanft), Wake Lock, Bühnen-/Vorbereitungsmodus, Schlagworte (feste Liste + eigene) und Dauer-Feld, Backup-Export/-Import, ChordPro-Export, PWA/offline.

**Offen (nach Priorität, mit Chris abstimmen):**
1. **Echten Import testen** – *in Arbeit (0.1.1):* alle 10 Songs der echten Datei werden erkannt und richtig zugeordnet, Darstellungsfehler behoben (siehe CHANGELOG). Entschieden: Klammern bis 4 Wörter = orange Spielhinweis, länger = grau-kursiv (Backing-Vocals). Eigene Kürzel `D1`, `C-2`, `G 0` geklärt und umgesetzt. Auch `Krimikeller 2026.chopro` (40 Einträge) getestet: alle Songs lesbar, keiner läuft seitlich aus dem Bild. **Erledigt:** 0.1.1 ist veröffentlicht (Tag `v0.1.1`), Chris hat die Darstellung auf dem iPad bestätigt („sieht recht gut aus“). Feinschliff nach Bedarf, wenn ihm beim Proben etwas auffällt.
2. **Soundvorschläge am Instrument prüfen** – Werte sind Startpunkte; Piano-/Synth-Modellnamen hängen von der installierten Nord-Library ab.
3. **Stufe 3 – Setlisten:** beliebig viele, bis zu 4 Sets mit Pausen, Drag & Drop, Spieldauer pro Set/Auftritt, Bühnenansicht folgt der Setlist (bisher blättert ◀/▶ alphabetisch). Merkmale pro Song: Sänger (Este/Bianca/Christian), Tempo/Stimmung, Besetzung, Gitarren-/Piano-/Sängerwechsel. *Erster Schritt erledigt (0.1.8):* Bereich „Setlisten“ (`#/listen`, `#/liste/:id`), `state.lists` = `{ id, kind: gig|probe, name, date, items: [{type:song,id}|{type:break,name}], snapshots: [{id,name,created,items}], missing }`; „Stand festhalten“ (manuell, Name optional, sonst Datum+Uhrzeit – so von Chris gewünscht), Ziehen am Griff ≡ plus ▲/▼, Übernahme der Reihenfolge aus einer ChordPro-Datei. Bühne folgt der Liste über `settings.navList = { id, pos }` und `listContext()`. Die Setlist entsteht bei SoulTape gemeinsam in der Probe und wird dort umgestellt. **Noch offen:** Merkmale pro Song (Sänger, Tempo, Besetzung, Wechsel), Speicherplatz am Nord aus der Liste berechnen (auch in den Wechsel-Balken), Dauer bei den meisten Songs fehlt noch, Setlist-Vorschläge.
4. **KI-Unterstützung** (nur Vorbereitungsmodus, API-Schlüssel nur lokal speichern): Soundvorschlag für neuen Song im `parts`/`steps`-Format, Leadsheet-Aufräumen (Abschnitte, Titel/Interpret korrigieren, Schreibweise vereinheitlichen, Werbung entfernen) mit **Vorschau Original ↔ Ergebnis** und Speichern als neue Version, Setlist-Vorschläge in Blöcken.
5. **Pro Sound-Teil: Instrument (Nord/Kawai) und Spieler (Christian/Andrea)** – flexibel, ohne feste Zuordnung.
6. **PDF-Export** im hellen Druckformat.
7. Gebremstes Wischen auf der Bühne (aktuell normales Scrollen + Tipp-Blättern).
8. Später: Bluetooth-Fußschalter (sendet meist Pfeil-/Bild-Tasten → Tastatur-Events), MIDI-Programmwechsel (Web MIDI am PC; Safari/iPad hat kein Web MIDI → Brücken-App oder native App), Band-Synchronisation, Referenzaufnahmen, Hörbeispiele.

**Bekannte Kleinigkeiten:**
- Seit 0.1.3 haben alle 37 Songs der Krimikeller-Setliste Soundvorschläge in `SEED_SONGS` (47 Einträge). `refreshSeeds()` in `js/store.js` ordnet sie importierten Songs über den Titel zu und füllt nur Songs ohne Sound; bei höherer `SEED_VERSION` passiert das still beim Start. **NDW-Medley ist nur ein Platzhalter** – Chris fragen, welche Songs darin stecken. Die Kawai-Codes (`11A`, `33C` …) sind nicht entschlüsselt.
- Seit 0.1.4 nennen die Anleitungen die genauen Klangnamen von Chris' Nord (`NORD_HAS`, `NORD_PIANO`, `NORD_SYNTH` in `js/data.js`). Quelle: Nord Sound Manager → File → **Export Sound Lists** → vier HTML-Dateien (Piano, Samp Lib, Synth Preset, Program) in `C:\Users\chris\OneDrive\Dokumente\Nord Electro 7 … 2026-11-14.html`. Bei neuen Klängen neu exportieren lassen. Die Program-Liste zeigt: Chris hat für fast alle Songs schon Programmplätze (Bank M, N, O, P; „M11“ in seinen Notizen = Bank M, Programm 11) – viele in Bank O sehen aber nach leeren Platzhaltern aus. Noch nicht in der App abgebildet.
- **Regler-Angaben immer als Display-Wert mit Einheit** (seit 0.1.6): Der Nord speichert den Wert im Display, nicht die Knopfstellung. Attack/Release in ms/s, LEVEL in dB, Filter in Hz; Rotary-Drive und Effekt-Regler zeigen 0–10. Schritte tragen dafür `disp`; `val` ist dort nur die ungefähre Zeigerstellung. Messwerte in `docs/NORD-ELECTRO-7.md`. Bei neuen Reglern erst Chris nach den Display-Werten (links/Mitte/rechts) fragen, nicht raten.
- **Soundwechsel im Leadsheet** (seit 0.1.7): eigene Direktive `{wechsel: Text}` (auch `soundwechsel`, `x_wechsel`) → Zeilentyp `switch`, CSS `.sheet .switch` (Magenta, `--switch-bg`). Beginnt der Text mit einem Speicherplatz („M 24 …“, `SLOT_RE`), wird er als Programmwechsel groß hervorgehoben; sonst Handgriff im selben Programm („Synth AN“). Chris braucht beides. `parseSheet` gibt jeder Zeile `src` (Zeilennummer im Rohtext), `renderSheet` schreibt sie als `data-src`; darüber setzt `openMarkBox()`/`editMarks()` in `js/app.js` die Wechsel per Tippen (nur Vorbereitung, Knopf „⇄ Soundwechsel setzen“). Der erste Wechsel legt eine Kopie „Mit Soundwechseln“ an (`sheet.marks = true`), weitere Wechsel ändern diese Kopie – das Original bleibt unberührt.
- **Tipp-Blättern** (seit 0.1.7): eigene Bewegung `glide()` in `js/app.js` statt `scrollBy({behavior:'smooth'})` (war Chris zu schnell). Dauer `settings.pageMs` (700/1400/2200 ms, Standard 1400). Im Vorschau-Browser von Claude Code feuert `requestAnimationFrame` nicht, wenn die Seite im Hintergrund läuft – zum Testen dort durch `setTimeout` ersetzen.
- **Lautstärke** (seit 0.1.7): MASTER LEVEL wird nicht pro Programm gespeichert → feste Stellung, kein Feld pro Song. Abgleich pro Song über die Sektions-LEVEL gegen einen Referenz-Sound; `settings.nordMaster`/`nordRef` und Song-Feld `levelOk`. Die dB-Werte in den Seeds sind ungehörte Startwerte.
- Geänderte Startvorschläge erreichen vorhandene Songs nur, wenn der Nutzer sie nicht selbst geändert hat (`seedMark`/`untouched()` in `js/store.js`); dazu `SEED_VERSION` hochzählen.
- Daten liegen pro Gerät im Browser; PC → iPad nur über Backup-Datei. Chris regelmäßig an Backups erinnern.
- **iOS-Dateiauswahl:** Kein `accept=".chopro,…"` an `<input type="file">` setzen – iOS kennt die Endung nicht und graut die Dateien aus (in 0.1.2 behoben). `.json` für Backups funktioniert.
- Die Landkarten sind vereinfacht; einzelne Beschriftungen (z. B. EQ „MID“) sind angenähert. Fotos des echten Panels liegen im claude.ai-Projekt (IMG_0469/0470).

## Testen

- Lokal: im Projektordner `node tools/server.js` und `http://localhost:8000` öffnen – ein Doppelklick auf `index.html` funktioniert wegen ES-Modulen nicht. **Python ist auf Chris' PC nicht installiert.** Für Claude Code gibt es `.claude/launch.json` (Name `soultape-stage`).
- **Node auf Chris' PC ist Version 6** (kann keine ES-Module). Parser deshalb im Browser testen: auf der lokalen Seite `await import('/js/chordpro.js?' + Date.now())` ausführen.
- Achtung Service Worker: Er liefert auch lokal zuerst aus dem Cache. Nach Code-Änderungen im Test-Browser Registrierung und Caches löschen (`navigator.serviceWorker.getRegistrations()` → `unregister()`, `caches.keys()` → `caches.delete()`).
- Chris' echte Datei liegt git-ignoriert im Projektordner: `01 Stücke Proben.chopro` (Dateiname in NFD-Schreibweise aus iCloud – in der Shell per `ls ./01*.chopro` ansprechen). Weitere ChordPro-/OnSong-Dateien in `C:\Users\chris\iCloudDrive\OnSong_\` (u. a. `Krimikeller 2026.chopro`). Inhalte nie committen.
- Oberfläche in iPad-Größe (820 × 1180) prüfen; Bühnenmodus über den Knopf oben rechts.

## Veröffentlichen (Ablauf für Chris)

```
cd ~/Projekte/soultape-stage
git add .
git commit -m "Kurze Beschreibung"
git tag v0.x.y
git push
git push --tags
```

GitHub Pages aktualisiert sich danach automatisch nach 1–2 Minuten. Auf dem iPad lädt die App die neue Version still im Hintergrund; beim nächsten Start ist sie aktiv.
