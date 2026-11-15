# Änderungen

## 0.1.13 – 15.11.2026
- **Sicherheitsnetz beim Einspielen:** Bevor eine Sicherung eingespielt wird, legt die App den bisherigen Stand des Geräts (Songs, Leadsheets, Setlisten) automatisch beiseite. Unter Einstellungen → „Sicherung & Übertragung“ lässt er sich mit „Diesen Stand zurückholen“ wiederherstellen – etwa, wenn versehentlich eine zu alte Datei eingespielt wurde.
- Es wird immer nur ein Stand aufbewahrt. Beim Zurückholen wird getauscht: Der gerade aktive Stand wird seinerseits beiseitegelegt, es geht also nichts verloren.
- Die Ampel nennt nach dem Einspielen das Datum der eingespielten Sicherungsdatei, nicht den Zeitpunkt des Einspielens.

## 0.1.12 – 15.11.2026
- **Ampel für die Sicherung:** Die App merkt sich, wann zuletzt ein Backup exportiert wurde und ob es seitdem Änderungen an Songs, Leadsheets oder Setlisten gab. Ein Punkt neben „Einstellungen“ zeigt den Stand: grün = alles gesichert, gelb = es gibt neue Änderungen, rot = seit 7 Tagen ungesichert (oder noch nie gesichert).
- Bei Rot steht zusätzlich ein Hinweis über der Songliste – nur im Vorbereitungsmodus. Auf der Bühne erscheint davon nichts.
- Unter Einstellungen → „Sicherung & Übertragung“ stehen Datum und Uhrzeit der letzten Sicherung.
- Beim Exportieren bittet die App den Browser, die Daten auf dem Gerät dauerhaft zu behalten.

## 0.1.11 – 14.11.2026
- Fehler behoben: Nach einem Update konnte das iPad weiter die alte Version anzeigen (so bei 0.1.10 passiert, wenn zwei Versionen kurz nacheinander erschienen). Ursache: Der Browser durfte Dateien von GitHub 10 Minuten zwischenspeichern, und beim Update landete so die alte Datei im neuen Speicher. Die App holt die Dateien bei einem Update jetzt immer frisch vom Server.

## 0.1.10 – 14.11.2026
- **Zeilen direkt im Blatt ändern:** Im Vorbereitungsmodus über dem Leadsheet „✎ Im Blatt ändern“ antippen, dann auf die Zeile tippen. Genau dort klappt ein Feld mit dem Text dieser Zeile auf – zum Beispiel, um in der Probe einen falschen Akkord zu korrigieren, ohne die Stelle im Editor suchen zu müssen. Feld leeren = Zeile löschen, zusätzliche Zeile im Feld = neue Zeile.
- Der Soundwechsel sitzt jetzt im selben Feld (aufklappbar „⇄ Soundwechsel vor dieser Zeile setzen“); der bisherige Knopf „⇄ Soundwechsel setzen“ heißt deshalb „✎ Im Blatt ändern“.
- Das Original bleibt wie immer erhalten: Die erste Änderung legt eine Kopie „Arbeitsfassung“ an, alle weiteren Änderungen landen in dieser Kopie. Speichern ohne Änderung legt nichts an.

## 0.1.9 – 14.11.2026
- **NDW-Medley** hat jetzt echte Soundvorschläge statt des Platzhalters – für alle vier Songs: Irgendwie, irgendwo, irgendwann (Nena), Alles nur geklaut (Die Prinzen), Major Tom (Peter Schilling), Sternenhimmel (Hubert Kah).
- Aufbau für wenig Umbau im Medley: ein Programm für die ersten drei Songs (80er-Synth „1984 Brass“ und heller Flügel – du schaltest nur Piano und Synth an und aus), ein zweites Programm mit Synth-Lead für Sternenhimmel.
- Der neue Vorschlag ersetzt den Platzhalter beim ersten Start still – außer du hast den Sound des Medleys selbst geändert.

## 0.1.8 – 14.11.2026
Erster Schritt der Setlisten.
- Neuer Bereich **Setlisten**: beliebig viele Listen, jede mit eigenem Namen und optionalem Datum. Zwei Arten: **Auftritt** (Pausen teilen die Liste in Sets, ein Block nach „Zugabe“ heißt auch so) und **Probe** (einfache Liste der Stücke für die nächste Probe).
- Reihenfolge ändern: Zeile am Griff ≡ mit dem Finger ziehen oder mit ▲/▼ verschieben; Songs unten antippen zum Hinzufügen, ✕ zum Entfernen. Jede Änderung wird sofort gespeichert.
- Pro Set und für die ganze Liste stehen Anzahl und Spieldauer; fehlt bei Songs die Dauer, steht das dabei.
- **Stand festhalten:** speichert die Reihenfolge als Kopie – mit eigenem Namen oder, wenn das Feld leer bleibt, mit Datum und Uhrzeit. Stände lassen sich ansehen und zurückholen; vor dem Zurückholen wird der jetzige Stand automatisch festgehalten.
- **Bühne folgt der Liste:** Wird ein Song aus einer Liste geöffnet, blättern ◀/▶ in deren Reihenfolge. Oben steht „Liste · Set 2 · Song 14 von 37“, vor einer Pause steht im Weiter-Knopf „⏸ Pause – danach: …“. Aus der Songliste geöffnet, bleibt es alphabetisch.
- **Aus Setlisten-Datei übernehmen:** liest aus einer ChordPro-/OnSong-Datei nur Titel und Reihenfolge und baut daraus eine Liste; leere Einträge wie „Pause“ oder „Zugabe“ werden zu Pausen. Titel, die nicht in der App sind, werden ausgelassen und genannt.
- Listen sind im Backup enthalten.

## 0.1.7 – 14.11.2026
- **Soundwechsel im Leadsheet:** Ein breiter, magentafarbener Balken „⇄ WECHSEL“ zeigt auf der Bühne genau an der Stelle, was am Nord zu tun ist – entweder ein Programmwechsel („M 24 Orgel“, der Speicherplatz steht groß in einem weißen Feld) oder ein Handgriff im selben Programm („Synth AN“, „Piano AUS“).
- Setzen im Vorbereitungsmodus: in der Song-Ansicht „⇄ Soundwechsel setzen“ antippen, dann auf die Zeile tippen, vor der gewechselt wird. Ein Tipp auf einen vorhandenen Balken ändert oder entfernt ihn. Das Original bleibt erhalten; die Wechsel stehen in einer eigenen Version „Mit Soundwechseln“.
- Im Text ist ein Wechsel die Zeile `{wechsel: M 24 Orgel}` – sie bleibt bei Backup und ChordPro-Export erhalten und kann auch von Hand geschrieben werden.
- **Ruhigeres Blättern:** Tippen rechts/links lässt das Leadsheet jetzt langsam und gleichmäßig weiterlaufen (weich anfahren, weich abbremsen), damit das Auge der Zeile folgen kann. Tempo in den Einstellungen wählbar: Zügig, Ruhig (Standard) oder Langsam. Zweimal tippen blättert zwei Schritte; selbst wischen stoppt die Bewegung.
- Lautstärke: Der MASTER LEVEL-Regler des Nord wird nicht pro Programm gespeichert. In den Einstellungen gibt es deshalb den Abschnitt „Mein Nord – Lautstärke“ mit der festen Master-Stellung und dem Referenz-Sound, auf den der Mischer einpegelt.
- Pro Song ein neuer Haken „Lautstärke mit dem Referenz-Sound abgeglichen“ (unter „Bearbeiten“). In der Song-Ansicht steht im Vorbereitungsmodus ein Hinweis, solange der Haken fehlt; die Einstellungen zeigen, wie viele Songs schon abgeglichen sind.
- Die Anleitung erinnert daran: Master nicht anfassen, die dB-Werte bei LEVEL sind Startwerte und werden gegen den Referenz-Sound nachgeregelt.

## 0.1.6 – 14.11.2026
- Anleitungen nennen jetzt den **Wert im Display** des Nord statt einer Reglerstellung: Der Nord speichert den Display-Wert, die Stellung des Knopfs stimmt nach einem Programmwechsel nicht mehr. Unter jedem Schritt steht gelb „Im Display: 300 ms“, „Im Display: −12 dB“ oder „Im Display: 3 (Skala 0–10)“.
- Attack und Release stehen als Zeit (ms/s), Lautstärken (LEVEL) in dB, der Filter in Hz/kHz. Grundlage sind die am Gerät abgelesenen Werte (siehe docs/NORD-ELECTRO-7.md). Rotary-Drive und alle Effekt-Regler zeigen 0–10 und bleiben unverändert.
- Bei Auswahl-LEDs steht „Die LED bei HALL muss leuchten“, bei Zugriegeln jede Stellung einzeln mit Skala 0–8.

## 0.1.5 – 14.11.2026
- Neues Feld „Speicherplatz auf dem Nord“ pro Song (z. B. M 23 = Bank M, Seite 2, Platz 3). Der Platz steht groß in der Song-Ansicht vor dem Programmnamen und in der Songliste.
- Vorbelegt mit den Plätzen vom 14.11.2026 aus der Programmliste des Nord Sound Managers. Nach dem Umsortieren auf dem Nord unter „Bearbeiten“ von Hand anpassen – das ist eine Zwischenlösung, bis die Setlisten den Platz ausrechnen.

## 0.1.4 – 14.11.2026
- Die Anleitungen nennen jetzt die genauen Klangnamen vom eigenen Nord (z. B. „EP1 Deep Timbre“ statt „ein Rhodes“, „OrchStrings Legato“ statt „Strings“), dazu jeweils zwei, drei Alternativen zum Ausprobieren. Grundlage ist die Liste aus dem Nord Sound Manager (File → Export Sound Lists, Stand 14.11.2026).
- Sound-Lexikon: Bei jedem Klang steht „Auf deinem Nord installiert“ mit den passenden Namen.
- Bereits eingetragene Soundvorschläge werden beim ersten Start still aktualisiert – aber nur, wenn du sie nicht selbst geändert hast.

## 0.1.3 – 14.11.2026
- Soundvorschläge für alle 37 Songs der Auftritts-Setliste (z. B. Californication, Narcotic, The Final Countdown) – mit Kurzbeschreibung, Schritt-Anleitung und Spieltipp. Grundlage sind das Original und die eigenen Notizen aus der Setliste. Wo das Original keine Tasten hat, steht das dabei.
- Die Vorschläge kommen auch bei importierten Songs an: Die App erkennt sie am Titel. Beim ersten Start nach dem Update werden sie still nachgetragen – nur bei Songs, die noch keinen Soundvorschlag haben. Eigene Eintragungen und Leadsheets bleiben unberührt.
- Einstellungen → Startdaten: „Fehlende Start-Songs ergänzen“ trägt jetzt auch fehlende Soundvorschläge nach.
- Offen: Das NDW-Medley hat nur einen Platzhalter, bis die enthaltenen Songs feststehen.

## 0.1.2 – 08.11.2026
- Fehler behoben: Auf dem iPad waren `.chopro`-Dateien beim Import aus iCloud ausgegraut. iOS kennt diese Endung nicht als Dateityp; das Auswahlfeld filtert deshalb nicht mehr nach Endungen. Wird versehentlich eine Nicht-Textdatei (z. B. PDF) gewählt, kommt ein Hinweis.

## 0.1.1 – 08.11.2026
Erster Test mit der echten Probe-Datei (10 Songs).
- Lange Textzeilen brechen jetzt um, statt rechts aus dem Bildschirm zu laufen; Wörter mit Akkord in der Mitte („trou[D5]ble“) bleiben zusammen
- Refrain-Balken auch bei Überschriften wie „Chorus“, „CHORUS:“, „(Ref)“ – nicht nur bei `{soc}`; fehlendes oder überzähliges `{eoc}` wird toleriert; „Pre-Chorus“ zählt nicht als Refrain
- „... Chorus ...“ wird als Wiederholungs-Hinweis (↻ Chorus) angezeigt
- Besetzungs-Hinweise ohne Klammern wie „Bass & Drums In“ oder „Guitar Only“ werden orange markiert
- Klammern mit mehr als 4 Wörtern (Backing-Vocals, gesprochene Einwürfe) erscheinen grau-kursiv statt orange; kurze Klammern wie „(Lauf)“ oder „(bis Gesang einsetzt)“ bleiben orange Spielhinweise
- Kommentare, die nur Titel und Interpret wiederholen, werden ausgeblendet
- Eigene Umkehrungs-Kürzel werden verstanden und als Slash-Akkord angezeigt (auch transponiert): `C-2` = 2. Umkehrung → C/G, `D1` = 1. Umkehrung → D/F#, `G 0` = Grundstellung → G. `D2`/`A2` ohne Strich bleiben add2.
- Fehler behoben: Gab es schon `{subtitle}`, wurde die erste Textzeile fälschlich als Interpret verschluckt
- Getestet auch mit einer Auftritts-Setliste (OnSong, 40 Einträge, viele Internet-Vorlagen):
  - Kleinbuchstaben = Moll (`[a]` → Am, `[bm7]` → Hm7) und deutsche Namen (`Cism`, `Gis`, `Es`, `D/Fis`)
  - Gitarren-Tabulatur `{sot}`…`{eot}` in Festbreiten-Schrift, bei Bedarf nur im Block seitlich verschiebbar
  - Abschnitte in eckigen Klammern (`[Intro]`, `[Chorus 2x]`), Text-Hinweise (`[guitar stops]`)
  - mehrere Akkorde in einer Klammer (`[Eb-Bb-Eb]`), Wiederholungen (`[C#m(x3)]`, `[(x2)]`), Füllzeichen (`[-]`, `~`)
  - `{inline: …}` wird angezeigt; leere Einträge wie „Pause 😃“ oder „Zugabe“ sind beim Import abgewählt
- Lokaler Testserver ohne Python: `node tools/server.js`

## 0.1.0 – 08.11.2026
Erster Prototyp.
- 10 Start-Songs mit Soundvorschlägen für das Nord Electro 7
- Bedienfeld-Landkarten (Orgel/Rotary, Piano, Synth, Effekte, Programm)
- Sound-Lexikon
- ChordPro-Import mit Versionen, Transponieren, H/B-Schreibweise
- Bühnenmodus, offline-fähig, Backup und ChordPro-Export

### Noch offen (nächste Versionen)
- KI-Unterstützung (Soundvorschläge, Leadsheets aufräumen)
- Setlisten mit Sets, Dauer und Schlagworten
- PDF-Export, Fußschalter, MIDI-Programmwechsel
