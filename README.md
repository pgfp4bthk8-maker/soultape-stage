# SoulTape Stage

Bühnen- und Vorbereitungs-App für die Band **SoulTape** – zuerst für das Keyboard (Nord Electro 7 73 HP), später auch für die anderen Bandmitglieder.

**Version:** 0.1.2

## Was die App kann

- **Songs mit Soundvorschlägen** für das Nord Electro 7: kurze Beschreibung plus Schritt-für-Schritt-Anleitung
- **Bedienfeld-Landkarten**: Skizzen von Orgel/Rotary, Piano, Synth, Effekten und Programmbereich, in denen der gemeinte Regler orange aufleuchtet
- **Mehrere Sounds pro Song** (z. B. Strophe / Refrain, Medley-Teile)
- **Nord-Programmname** und **alter Kawai-Sound** pro Song
- **Leadsheets im ChordPro-Format**: Import (auch mehrere Songs pro Datei), Akkorde über dem Text, Abschnitte farbig, Spielhinweise wie „(Lauf)“ orange hervorgehoben
- **Versionen**: Das importierte Original bleibt immer erhalten, Änderungen werden als neue Version gespeichert
- **Transponieren** und deutsche (H) oder englische (B) Akkord-Schreibweise
- **Bühnenmodus**: große Schrift, Tippen rechts/links blättert sanft weiter/zurück, Bildschirm bleibt an
- **Offline-fähig** (Progressive Web App), auf dem iPad installierbar
- **Backup** als Datei zum Übertragen zwischen PC und iPad, Export als ChordPro
- **Sound-Lexikon** mit Erklärungen der wichtigsten Keyboard-Klänge

## Datenschutz

Songtexte und eigene Daten werden **nur lokal im Browser** gespeichert. Im Repository liegen keine Songtexte.

## Lokal starten (Windows)

Die App muss über einen kleinen Webserver laufen (ein Doppelklick auf `index.html` reicht nicht). Im Ordner in Git Bash:

```
node tools/server.js
```

Dann im Browser `http://localhost:8000` öffnen. Beenden mit Strg+C. (Alternativ, falls Python installiert ist: `python -m http.server 8000`.)

## Veröffentlichen (GitHub Pages)

Repository → **Settings** → **Pages** → Branch `main`, Ordner `/ (root)` → **Save**.
Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/soultape-stage/` erreichbar.

## Neue Version veröffentlichen

1. In `js/app.js` `APP_VERSION` und in `sw.js` `CACHE` hochzählen.
2. `CHANGELOG.md` ergänzen.
3. Commit, Tag (z. B. `v0.1.1`) und Push.

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `css/app.css` | Gestaltung (dunkles Bühnen-Design) |
| `js/app.js` | Oberfläche und Navigation |
| `js/store.js` | Speichern, Versionen, Backup |
| `js/data.js` | Start-Songs mit Soundvorschlägen, Sound-Lexikon |
| `js/panel.js` | Bedienfeld-Landkarten des Nord Electro 7 |
| `js/chordpro.js` | ChordPro einlesen, darstellen, transponieren |
| `sw.js` | Offline-Betrieb |
| `CLAUDE.md` | Übergabe-Infos für Claude Code |
| `docs/ANFORDERUNGEN.md` | Anforderungsdokument (Version 0.2) |
| `docs/NORD-ELECTRO-7.md` | Fakten zum Instrument aus dem Handbuch |
