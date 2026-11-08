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

### ChordPro-Besonderheiten (aus Chris' echter Datei)

Chris' Datei „01 Stücke Proben.chopro“ (liegt im claude.ai-Projekt „PIANO-APP“, **nicht** im Repo) enthält 10 Einträge und ist uneinheitlich. Der Parser behandelt:
- `{new_song}`-Trennung, `{title}`/`{t}`, `{subtitle}`/`{st}`, `{key}`, `{soc}`/`{eoc}`, `{start_of_part}`, `{comment}` (Werbe-/Quellen-Kommentare werden ausgeblendet)
- Abschnitte als normaler Text: `Verse 1`, `(Chorus)`, `CHORUS:`, `(Intro 4x)`, `(2.Str.)`, `Bridge:` usw.
- Spielhinweise in Klammern → orange „Trigger“: `(Lauf)`, `(nur Git)`, `(Synth)`, `(bis Este schreit)`, `(1.Umk)`; in Akkordzeilen auch inline `(2T)`, `(Bass)`
- Alte Kawai-Codes wie `11A EFF`, `33C EFFOrgel 70%`, `(33C+11A+11B)` → werden erkannt und ins Feld `kawai` übernommen
- Medley-Trenner `----Rockin all over----` → Zwischenüberschrift
- Akkordzeilen über Textzeilen (altes Format) → werden in Inline-Akkorde umgewandelt
- Taktstriche `| E | A | x2`, auch `INTRO | C | C/E |`
- Eigene Kürzel: `D2`/`A2` = add2 (gültig, wird transponiert). `D1`, `C-2` (Umkehrungen?) und `G 0` werden **blau als „bitte prüfen“** markiert – Chris will diese **Song für Song gemeinsam klären**, nicht automatisch umwandeln. Übliche Zielschreibweise: Slash-Akkorde (D/F#).
- Schreibweise der Datei ist gemischt (meist englisch B, bei Westerland H). Eingabe wird als englisch gelesen, `H` als B erkannt; Anzeige standardmäßig deutsch (H, B = Bb).

## Stand gegenüber den Anforderungen

**Erledigt (0.1.0):** Songverwaltung mit mehreren Sound-Teilen, Soundvorschläge mit Kurzbeschreibung + Schritt-Anleitung, 5 Bedienfeld-Landkarten mit Hervorhebung (inkl. Zugriegel-Stellungen und Knopfwerten), Sound-Lexikon, Kawai-Feld, Nord-Programmname + „gespeichert“-Haken, ChordPro-Import (Mehrfach-Datei, Zuordnung zu vorhandenen Songs, Tonart-Vorschlag), Leadsheet-Versionen, Transponieren, H/B, Trigger-Hervorhebung, Tipp-Blättern (rechts/links, ca. 2/3 Bildschirm, sanft), Wake Lock, Bühnen-/Vorbereitungsmodus, Schlagworte (feste Liste + eigene) und Dauer-Feld, Backup-Export/-Import, ChordPro-Export, PWA/offline.

**Offen (nach Priorität, mit Chris abstimmen):**
1. **Echten Import testen** mit Chris' Datei und Feedback einarbeiten (bisher nur mit nachgebauten Beispielzeilen getestet).
2. **Soundvorschläge am Instrument prüfen** – Werte sind Startpunkte; Piano-/Synth-Modellnamen hängen von der installierten Nord-Library ab.
3. **Stufe 3 – Setlisten:** beliebig viele, bis zu 4 Sets mit Pausen, Drag & Drop, Spieldauer pro Set/Auftritt, Bühnenansicht folgt der Setlist (bisher blättert ◀/▶ alphabetisch). Merkmale pro Song: Sänger (Este/Bianca/Christian), Tempo/Stimmung, Besetzung, Gitarren-/Piano-/Sängerwechsel.
4. **KI-Unterstützung** (nur Vorbereitungsmodus, API-Schlüssel nur lokal speichern): Soundvorschlag für neuen Song im `parts`/`steps`-Format, Leadsheet-Aufräumen (Abschnitte, Titel/Interpret korrigieren, Schreibweise vereinheitlichen, Werbung entfernen) mit **Vorschau Original ↔ Ergebnis** und Speichern als neue Version, Setlist-Vorschläge in Blöcken.
5. **Pro Sound-Teil: Instrument (Nord/Kawai) und Spieler (Christian/Andrea)** – flexibel, ohne feste Zuordnung.
6. **PDF-Export** im hellen Druckformat.
7. Gebremstes Wischen auf der Bühne (aktuell normales Scrollen + Tipp-Blättern).
8. Später: Bluetooth-Fußschalter (sendet meist Pfeil-/Bild-Tasten → Tastatur-Events), MIDI-Programmwechsel (Web MIDI am PC; Safari/iPad hat kein Web MIDI → Brücken-App oder native App), Band-Synchronisation, Referenzaufnahmen, Hörbeispiele.

**Bekannte Kleinigkeiten:**
- Song „Zombie“ fehlt noch; Chris liefert weitere Songs/Setlist nach.
- Daten liegen pro Gerät im Browser; PC → iPad nur über Backup-Datei. Chris regelmäßig an Backups erinnern.
- Die Landkarten sind vereinfacht; einzelne Beschriftungen (z. B. EQ „MID“) sind angenähert. Fotos des echten Panels liegen im claude.ai-Projekt (IMG_0469/0470).

## Testen

- Lokal: im Projektordner `python -m http.server 8000` (falls Python vorhanden) und `http://localhost:8000` öffnen – ein Doppelklick auf `index.html` funktioniert wegen ES-Modulen nicht.
- Parser-Logik ist reines JS ohne DOM und lässt sich mit Node direkt importieren (`node --input-type=module -e "import('./js/chordpro.js')…"`).
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
