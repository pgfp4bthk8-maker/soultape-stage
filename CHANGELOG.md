# Änderungen

## 0.1.4 – 14.11.2026
- Die Anleitungen nennen jetzt die genauen Klangnamen vom eigenen Nord (z. B. „EP1 Deep Timbre“ statt „ein Rhodes“, „OrchStrings Legato“ statt „Strings“), dazu jeweils zwei, drei Alternativen zum Ausprobieren. Grundlage ist die Liste aus dem Nord Sound Manager (File → Export Sound Lists, Stand 14.11.2026).
- Sound-Lexikon: Bei jedem Klang steht „Auf deinem Nord installiert“ mit den passenden Namen.
- Bereits eingetragene Soundvorschläge werden beim ersten Start still aktualisiert – aber nur, wenn du sie nicht selbst geändert hast.

## 0.1.3 – 14.11.2026
- Soundvorschläge für alle 37 Songs der Setliste „Krimikeller 2026“ (z. B. Californication, Narcotic, The Final Countdown) – mit Kurzbeschreibung, Schritt-Anleitung und Spieltipp. Grundlage sind das Original und die eigenen Notizen aus der Setliste. Wo das Original keine Tasten hat, steht das dabei.
- Die Vorschläge kommen auch bei importierten Songs an: Die App erkennt sie am Titel. Beim ersten Start nach dem Update werden sie still nachgetragen – nur bei Songs, die noch keinen Soundvorschlag haben. Eigene Eintragungen und Leadsheets bleiben unberührt.
- Einstellungen → Startdaten: „Fehlende Start-Songs ergänzen“ trägt jetzt auch fehlende Soundvorschläge nach.
- Offen: Das NDW-Medley hat nur einen Platzhalter, bis die enthaltenen Songs feststehen.

## 0.1.2 – 08.11.2026
- Fehler behoben: Auf dem iPad waren `.chopro`-Dateien beim Import aus iCloud ausgegraut. iOS kennt diese Endung nicht als Dateityp; das Auswahlfeld filtert deshalb nicht mehr nach Endungen. Wird versehentlich eine Nicht-Textdatei (z. B. PDF) gewählt, kommt ein Hinweis.

## 0.1.1 – 08.11.2026
Erster Test mit der echten Probe-Datei („01 Stücke Proben.chopro“, 10 Songs).
- Lange Textzeilen brechen jetzt um, statt rechts aus dem Bildschirm zu laufen; Wörter mit Akkord in der Mitte („trou[D5]ble“) bleiben zusammen
- Refrain-Balken auch bei Überschriften wie „Chorus“, „CHORUS:“, „(Ref)“ – nicht nur bei `{soc}`; fehlendes oder überzähliges `{eoc}` wird toleriert; „Pre-Chorus“ zählt nicht als Refrain
- „... Chorus ...“ wird als Wiederholungs-Hinweis (↻ Chorus) angezeigt
- Besetzungs-Hinweise ohne Klammern wie „Bass & Drums In“ oder „Guitar Only“ werden orange markiert
- Klammern mit mehr als 4 Wörtern (Backing-Vocals, gesprochene Einwürfe) erscheinen grau-kursiv statt orange; kurze Klammern wie „(Lauf)“ oder „(bis Este schreit)“ bleiben orange Spielhinweise
- Kommentare, die nur Titel und Interpret wiederholen, werden ausgeblendet
- Eigene Umkehrungs-Kürzel werden verstanden und als Slash-Akkord angezeigt (auch transponiert): `C-2` = 2. Umkehrung → C/G, `D1` = 1. Umkehrung → D/F#, `G 0` = Grundstellung → G. `D2`/`A2` ohne Strich bleiben add2.
- Fehler behoben: Gab es schon `{subtitle}`, wurde die erste Textzeile fälschlich als Interpret verschluckt
- Getestet auch mit „Krimikeller 2026.chopro“ (OnSong-Setliste, 40 Einträge, viele Internet-Vorlagen):
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
