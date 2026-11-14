# CLAUDE.md – Übergabe für Claude Code

Dieses Dokument fasst alles zusammen, was beim Weiterentwickeln von **SoulTape Stage** wichtig ist.
Es entstand am 08.11.2026 aus dem Planungs- und Bau-Chat auf claude.ai.
Die fachlichen Anforderungen stehen in **`docs/ANFORDERUNGEN.md`** (Version 0.2), Fakten zum Instrument in **`docs/NORD-ELECTRO-7.md`**.

## Wer ist der Nutzer

- Keyboarder der Rock/Pop-Coverband **SoulTape**. Kommuniziert auf **Deutsch**, oft per Sprache.
- **Git-Einsteiger.** Befehle in Git Bash Schritt für Schritt erklären, einen Befehl pro Zeile, auf Leerzeichen hinweisen (z. B. `cd ~`, `git push --tags`).
- Arbeitet am **Windows-PC** (Git Bash, Git 2.56) und nutzt die App auf dem **iPad** (als Web-App auf dem Home-Bildschirm installiert).
- Mag den Interview-Stil: lieber eine Frage nach der anderen als lange Fragelisten.
- Sound-Begriffe (Rhodes, Wurli, Drawbars …) immer kurz erklären.

## Projekt-Infrastruktur

- Lokaler Ordner: nur auf dem PC des Nutzers (bewusst nicht in einem Cloud-Ordner).
- GitHub: `https://github.com/pgfp4bthk8-maker/soultape-stage` (**öffentlich**, nötig für kostenloses GitHub Pages).
- Live-App: `https://pgfp4bthk8-maker.github.io/soultape-stage/` (GitHub Pages, Branch `main`, Ordner `/`).
- Anmeldung bei GitHub läuft über den Git Credential Manager (bereits eingerichtet).
- Commits laufen über die GitHub-noreply-Adresse.
- Versionen werden mit Git-Tags markiert: `v0.1.0` existiert.

## Harte Regeln

1. **Keine Songtexte im Repository.** Das Repo ist öffentlich. Texte/Akkorde importiert der Nutzer in der App, sie bleiben im Browser-Speicher seines Geräts. `.gitignore` schließt `*.chopro`, `*.cho` und Backups aus. Auch keine Songtexte in Testdaten committen – Tests mit selbst ausgedachten Zeilen.
2. **Bühnenstabilität vor allem anderen:** komplett offline, keine Pop-ups/Dialoge/`alert`/`confirm` in der Song- bzw. Bühnenansicht, keine Update-Hinweise, Bildschirm bleibt an (Wake Lock). `confirm()` ist nur in Bearbeiten/Einstellungen erlaubt.
3. **Original-Leadsheets nie überschreiben.** Jede Änderung oder Umwandlung wird als neue Version gespeichert; der Nutzer wählt die aktive Version.
4. **Kein Build-Schritt.** Reines HTML/CSS/JavaScript mit ES-Modulen, damit GitHub Pages es direkt ausliefert und der Nutzer es ohne Toolchain versteht. Keine Frameworks, keine CDN-Abhängigkeiten (offline!).
5. **Bei jeder neuen Version:** `APP_VERSION` in `js/app.js` und `CACHE` in `sw.js` hochzählen, neue Dateien in die `FILES`-Liste von `sw.js` eintragen, `CHANGELOG.md` ergänzen, Git-Tag setzen.

## Architektur (Version 0.1.0)

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg, lädt `js/app.js` als Modul |
| `css/app.css` | Dunkles Bühnen-Design; Farben als CSS-Variablen; Schriftgröße Leadsheet über `--font` |
| `js/app.js` | Hash-Router (`#/`, `#/song/:id`, `#/bearbeiten/:id`, `#/import`, `#/lexikon[/id]`, `#/einstellungen`), alle Ansichten, Wake Lock, Tipp-Blättern |
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

### ChordPro-Besonderheiten (aus der echten Datei des Nutzers)

Die erste Probedatei des Nutzers (liegt im claude.ai-Projekt des Nutzers, **nicht** im Repo) enthält 10 Einträge und ist uneinheitlich. Der Parser behandelt:
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
- Die Datei ist eine **Auftritts-Setliste** (40 Einträge in Spielreihenfolge) mit leeren Trenner-Einträgen „Pause 😃“, „Pause 2 😃“, „Zugabe 😂😂😂“ → beim Import abgewählt. **Für Stufe 3 (Setlisten) interessant:** Reihenfolge + Pausen ergeben direkt Sets.
- Viele Songs stammen aus Internet-Vorlagen: Kleinbuchstaben = Moll (`[a]`, `[em]`), deutsche Namen (`Cism`, `Gis`), Tabulatur `{sot}`/`{eot}` (oft jede Saite einzeln), `[Intro]`/`[Chorus 2x]` als Abschnitt, Text in eckigen Klammern (`[guitar stops]`), `[Eb-Bb-Eb]`, `[C#m(x3)]`, `[(x2)]`, `[-]`, `{inline: …}`, `#`-Kommentarzeilen. Die Einordnung macht `bracketKind()` in `js/chordpro.js`.
- Eigene Notizen des Nutzers in dieser Datei: Kawai-Codes (`22B EFF/ 11A EFF`, `71A EFX`), Hinweise wie „(Key Str+Fargo -1Okt)“, „(Strings linke Hand, leise)“.
- Bekannter Fehler in der Vorlage: *Uninvited* hat `[D[C#]]` (bleibt blau markiert). *Enter Sandman* hat `{subtitle:Intro}` statt des Interpreten.

## Stand gegenüber den Anforderungen

**Erledigt (0.1.0):** Songverwaltung mit mehreren Sound-Teilen, Soundvorschläge mit Kurzbeschreibung + Schritt-Anleitung, 5 Bedienfeld-Landkarten mit Hervorhebung (inkl. Zugriegel-Stellungen und Knopfwerten), Sound-Lexikon, Kawai-Feld, Nord-Programmname + „gespeichert“-Haken, ChordPro-Import (Mehrfach-Datei, Zuordnung zu vorhandenen Songs, Tonart-Vorschlag), Leadsheet-Versionen, Transponieren, H/B, Trigger-Hervorhebung, Tipp-Blättern (rechts/links, ca. 2/3 Bildschirm, sanft), Wake Lock, Bühnen-/Vorbereitungsmodus, Schlagworte (feste Liste + eigene) und Dauer-Feld, Backup-Export/-Import, ChordPro-Export, PWA/offline.

**Offen (nach Priorität, mit dem Nutzer abstimmen):**
1. **Echten Import testen** – *in Arbeit (0.1.1):* alle 10 Songs der echten Datei werden erkannt und richtig zugeordnet, Darstellungsfehler behoben (siehe CHANGELOG). Entschieden: Klammern bis 4 Wörter = orange Spielhinweis, länger = grau-kursiv (Backing-Vocals). Eigene Kürzel `D1`, `C-2`, `G 0` geklärt und umgesetzt. Auch die Auftritts-Setliste (40 Einträge) getestet: alle Songs lesbar, keiner läuft seitlich aus dem Bild. **Erledigt:** 0.1.1 ist veröffentlicht (Tag `v0.1.1`), der Nutzer hat die Darstellung auf dem iPad bestätigt („sieht recht gut aus“). Feinschliff nach Bedarf, wenn ihm beim Proben etwas auffällt.
2. **Soundvorschläge am Instrument prüfen** – Werte sind Startpunkte; Piano-/Synth-Modellnamen hängen von der installierten Nord-Library ab.
3. **Stufe 3 – Setlisten:** beliebig viele, bis zu 4 Sets mit Pausen, Drag & Drop, Spieldauer pro Set/Auftritt, Bühnenansicht folgt der Setlist (bisher blättert ◀/▶ alphabetisch). Merkmale pro Song: Sänger (Sängerin A/Sängerin B/Keyboarder), Tempo/Stimmung, Besetzung, Gitarren-/Piano-/Sängerwechsel.
4. **KI-Unterstützung** (nur Vorbereitungsmodus, API-Schlüssel nur lokal speichern): Soundvorschlag für neuen Song im `parts`/`steps`-Format, Leadsheet-Aufräumen (Abschnitte, Titel/Interpret korrigieren, Schreibweise vereinheitlichen, Werbung entfernen) mit **Vorschau Original ↔ Ergebnis** und Speichern als neue Version, Setlist-Vorschläge in Blöcken.
5. **Pro Sound-Teil: Instrument (Nord/Kawai) und Spieler (Keyboarder/Rhythmusgitarre)** – flexibel, ohne feste Zuordnung.
6. **PDF-Export** im hellen Druckformat.
7. Gebremstes Wischen auf der Bühne (aktuell normales Scrollen + Tipp-Blättern).
8. Später: Bluetooth-Fußschalter (sendet meist Pfeil-/Bild-Tasten → Tastatur-Events), MIDI-Programmwechsel (Web MIDI am PC; Safari/iPad hat kein Web MIDI → Brücken-App oder native App), Band-Synchronisation, Referenzaufnahmen, Hörbeispiele.

**Bekannte Kleinigkeiten:**
- Seit 0.1.3 haben alle 37 Songs der Auftritts-Setliste Soundvorschläge in `SEED_SONGS` (47 Einträge). `refreshSeeds()` in `js/store.js` ordnet sie importierten Songs über den Titel zu und füllt nur Songs ohne Sound; bei höherer `SEED_VERSION` passiert das still beim Start. **NDW-Medley ist nur ein Platzhalter** – den Nutzer fragen, welche Songs darin stecken. Die Kawai-Codes (`11A`, `33C` …) sind nicht entschlüsselt.
- Seit 0.1.4 nennen die Anleitungen die genauen Klangnamen des Nord des Nutzers (`NORD_HAS`, `NORD_PIANO`, `NORD_SYNTH` in `js/data.js`). Quelle: Nord Sound Manager → File → **Export Sound Lists** → vier HTML-Dateien (Piano, Samp Lib, Synth Preset, Program) (Ablageort nicht im Repo). Bei neuen Klängen neu exportieren lassen. Die Program-Liste zeigt: der Nutzer hat für fast alle Songs schon Programmplätze (Bank M, N, O, P; „M11“ in seinen Notizen = Bank M, Programm 11) – viele in Bank O sehen aber nach leeren Platzhaltern aus. Noch nicht in der App abgebildet.
- Geänderte Startvorschläge erreichen vorhandene Songs nur, wenn der Nutzer sie nicht selbst geändert hat (`seedMark`/`untouched()` in `js/store.js`); dazu `SEED_VERSION` hochzählen.
- Daten liegen pro Gerät im Browser; PC → iPad nur über Backup-Datei. Den Nutzer regelmäßig an Backups erinnern.
- **iOS-Dateiauswahl:** Kein `accept=".chopro,…"` an `<input type="file">` setzen – iOS kennt die Endung nicht und graut die Dateien aus (in 0.1.2 behoben). `.json` für Backups funktioniert.
- Die Landkarten sind vereinfacht; einzelne Beschriftungen (z. B. EQ „MID“) sind angenähert. Fotos des echten Panels liegen im claude.ai-Projekt des Nutzers.

## Testen

- Lokal: im Projektordner `node tools/server.js` und `http://localhost:8000` öffnen – ein Doppelklick auf `index.html` funktioniert wegen ES-Modulen nicht. **Python ist auf dem PC des Nutzers nicht installiert.** Für Claude Code gibt es `.claude/launch.json` (Name `soultape-stage`).
- **Node auf dem PC des Nutzers ist Version 6** (kann keine ES-Module). Parser deshalb im Browser testen: auf der lokalen Seite `await import('/js/chordpro.js?' + Date.now())` ausführen.
- Achtung Service Worker: Er liefert auch lokal zuerst aus dem Cache. Nach Code-Änderungen im Test-Browser Registrierung und Caches löschen (`navigator.serviceWorker.getRegistrations()` → `unregister()`, `caches.keys()` → `caches.delete()`).
- Echte Dateien des Nutzers liegen nur auf seinem PC. Inhalte nie committen.
- Oberfläche in iPad-Größe (820 × 1180) prüfen; Bühnenmodus über den Knopf oben rechts.

## Veröffentlichen (Ablauf für den Nutzer)

```
cd ~/Projekte/soultape-stage
git add .
git commit -m "Kurze Beschreibung"
git tag v0.x.y
git push
git push --tags
```

GitHub Pages aktualisiert sich danach automatisch nach 1–2 Minuten. Auf dem iPad lädt die App die neue Version still im Hintergrund; beim nächsten Start ist sie aktiv.
