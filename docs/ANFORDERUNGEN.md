# Anforderungsdokument – Keyboard-Sound- und Bühnen-App

Version 0.2 – Entwurf zur Prüfung durch Christian Würr (ergänzt um Songdatei, Bedienfeld-Landkarten, Import/Export und Setlisten) Stand: 08.11.2026

## 1. Ziel der App

Die App unterstützt einen Keyboarder einer Rock/Pop-Coverband dabei, für jeden Song passende Sounds auf dem Nord Electro 7 zu finden, einzustellen, zu speichern und im Proberaum sowie live schnell abzurufen. Langfristig soll sie zur zentralen Bühnen-App werden, mit Leadsheets, Setlisten und MIDI-Steuerung.

Kernproblem heute: Das Einstellen der Sounds im Proberaum dauert zu lange, und die Band wartet. Die Vorbereitung soll deshalb zu Hause stattfinden, und im Proberaum oder auf der Bühne soll nur noch der Song angewählt werden.

## 2. Kontext

### 2.1 Nutzer

- Christian, Keyboarder (Hauptnutzer), mittlere Soundkenntnisse. Begriffe wie Rhodes, Wurlitzer, Clavinet oder Drawbars müssen erklärt werden.
- Spielt nach Akkordsymbolen (z. B. Am, C), deutsche Schreibweise mit H.
- Singt gelegentlich Begleitstimmen.
- Hat Grundkenntnisse in der Programmierung (Informatiktechniker) und einen GitHub-Account. Er braucht Unterstützung bei der Weiterentwicklung.

### 2.2 Band

- Schlagzeug, E-Bass, Lead-Gitarre, Rhythmusgitarre (Andrea)
- Gesang: Este (Deutsch/Englisch, spanische Wurzeln) und Bianca
- Andrea wechselt bei komplexen Keyboard-Parts ans Keyboard, und Christian und Andrea tauschen die Instrumente flexibel.
- Eigener Tontechniker. Mischpult Behringer Wing, In-Ear-Monitoring für alle.
- Repertoire: Rock und Pop von den 80ern bis heute, gelegentlich Funk.

### 2.3 Instrumente

- **Nord Electro 7, 73 Tasten, Waterfall-Tastatur.** Hauptinstrument für vielseitige Sounds (E-Piano, Orgel, Samples/Synth). Stereo-Ausgang L/R ans Wing.
- **Kawai, 88 Tasten.** Wird überwiegend als klassisches Klavier genutzt und bleibt bewusst einfach.
- Nord Sound Manager ist auf dem Windows-PC installiert.
- Programme auf dem Nord werden bereits nach Songtiteln benannt (z. B. „Zombie“).

## 3. Rahmenbedingungen

- **Plattform:** Web-App (Progressive Web App), läuft im Browser auf dem iPad (iOS) und auf dem Windows-PC und ist auf dem iPad wie eine App installierbar.
- **Hosting:** Code auf GitHub, Veröffentlichung über GitHub Pages (kostenlos).
- **Bühnenstabilität (Muss-Anforderung):**
  - vollständig offline lauffähig, ohne Internet oder WLAN
  - keine Pop-ups, Dialoge, Ladezeiten oder Update-Hinweise im Bühnenbetrieb
  - Bildschirm bleibt dauerhaft an
  - große Schrift, dunkles, kontrastreiches Design
  - Empfehlung an den Nutzer: iPad im Fokus-Modus „Nicht stören“ betreiben

## 4. Betriebsmodi

### 4.1 Vorbereitungsmodus (zu Hause, PC)

- Songs anlegen und bearbeiten
- KI-gestützte Soundvorschläge abrufen
- Vorschläge am Instrument ausprobieren, anpassen und speichern
- Leadsheets importieren und bearbeiten

### 4.2 Proberaum- und Bühnenmodus (iPad)

- Song mit einem Fingertipp auswählen
- Anzeige: Programmname auf dem Nord, Soundübersicht, Leadsheet
- keine Bearbeitungsfunktionen im Vordergrund, um Fehlbedienung zu vermeiden
- KI ist standardmäßig aus und nur optional zuschaltbar

## 5. Funktionen – Stufe 1 (erster Prototyp)

### 5.1 Songverwaltung

- Song anlegen mit Titel, Interpret, Tonart und Notizen
- Verknüpfung mit dem Programmnamen auf dem Nord Electro 7
- Pro Song beliebig viele **Song-Teile mit eigenem Sound** (z. B. Strophe, Refrain, Solo). Zum Start reicht meist ein Sound pro Song.
- Pro Song bzw. Song-Teil optional die Zuordnung von Instrument (Nord oder Kawai) und Spieler (Christian oder Andrea), ohne feste Vorgabe

### 5.2 Soundvorschläge

Jeder Sound hat zwei Ebenen:

1. **Kurzbeschreibung**, z. B. „Warmes Rhodes mit leichtem Phaser und etwas Hall“
2. **Schritt-für-Schritt-Anleitung für das Electro 7** (aufklappbar):
   - aktive Sektionen (Piano, Organ, Sample-Synth)
   - Instrumententyp und Modell
   - Effekte mit ungefähren Einstellwerten (Effekt 1, Effekt 2, Delay, Amp/EQ, Reverb)
   - Split oder Layer, falls nötig
   - Lautstärkeverhältnisse
   - Hinweis, unter welchem Programmnamen gespeichert werden soll

Weitere Anforderungen:

- Die Vorschläge berücksichtigen die volle Bandbesetzung (zwei Gitarren, zwei Sänger): Die Sounds sollen sich einfügen und nicht mit Gitarren und Gesang kollidieren.
- Stereoeffekte (z. B. Leslie, breite Flächen) können genutzt werden, da der Nord in Stereo läuft und alle In-Ears tragen.

### 5.3 Sound-Lexikon

- Kurze Erklärung der wichtigsten Klänge: Grand, Upright, Electric Grand, Rhodes, Wurlitzer, Clavinet, B3/Hammond mit Drawbars und Leslie, Farfisa/Vox, Pads, Streicher, Bläser, Synths
- Typische Songbeispiele pro Klang
- Später optional: Links zu Hörbeispielen

### 5.4 KI-Unterstützung (Vorbereitungsmodus)

- Eingabe eines Songtitels, Ausgabe eines Soundvorschlags im Format aus 5.2
- Speichern, Anpassen oder Verwerfen des Vorschlags
- Erfordert einen API-Schlüssel mit geringen laufenden Kosten, der nur lokal gespeichert wird
- Ohne Schlüssel bleibt die App voll nutzbar mit gespeicherten Songs.

### 5.5 Datenhaltung

- Lokale Speicherung auf dem jeweiligen Gerät
- Export und Import aller Daten als Datei, als Backup und zur Übertragung PC → iPad

### 5.6 Bedienfeld-Landkarten

- Vereinfachte Skizzen des Nord Electro 7, erstellt nach Fotos von Christians Gerät
- Fünf Landkarten, eine pro Bereich: Orgel, Piano, Synth, Effekte (Effekt 1, Effekt 2, Delay, Amp, Reverb) und Programmbereich mit Display
- In jedem Schritt der Anleitung wird nur die passende Sektion gezeigt, und der gemeinte Regler oder Knopf leuchtet farbig auf.
- Beschriftungen genau wie auf dem Gerät

### 5.7 Alte Kawai-Codes

- Die alten Soundcodes aus der Songdatei (z. B. „11A EFF“, „33C EFF Orgel 70 %“) bleiben erhalten.
- Eigenes Feld „Kawai-Sound“ pro Song, klar getrennt vom neuen Nord-Programm
- Dient als Hinweis, welcher Klang bisher pro Song genutzt wurde.

## 6. Funktionen – Stufe 2: Leadsheets

- Pro Song ein Leadsheet mit Text und Akkordsymbolen
- **Format: ChordPro** (offener Standard, kompatibel mit anderen Musik-Apps)
- Akkorde stehen über den passenden Silben.
- Abschnitte wie Intro, Strophe, Chorus, Bridge und Outro werden farbig hervorgehoben.
- **KI-Import:** Unformatierter Text mit Akkorden wird eingefügt und automatisch in sauberes ChordPro umgewandelt.
- **Transponieren** in Halbtonschritten, die gewählte Tonart wird pro Song gespeichert (z. B. passend für Este oder Bianca).
- **Akkordschreibweise:** standardmäßig deutsch mit H, umschaltbar auf englisch mit B
- Bühnenansicht nach dem Vorbild von OnSong: dunkler Hintergrund, Akkorde und Abschnitte farbig, Schriftgröße einstellbar
- Songtexte werden vom Nutzer selbst eingepflegt.

### 6.1 Scrollen auf der Bühne

- Problem heute: Freies Wischen rutscht leicht zu weit.
- Ein Tipp auf die rechte Hälfte scrollt sanft animiert um etwa zwei Drittel weiter, ein Tipp links zurück. Die letzten Zeilen bleiben sichtbar.
- Wischen bleibt möglich, aber gebremst und ohne Nachlaufen.
- Wird im Prototyp getestet und danach angepasst. Später auch per Fußschalter.

### 6.2 Trigger-Hinweise

- Eigene Spielhinweise wie „Lauf“, „nur Git“, „alle“, „Synth“ oder „bis Este schreit“ werden als Trigger erkannt.
- Sie erscheinen in einer eigenen, auffälligen Farbe (z. B. orange hinterlegt), klar getrennt von Text und Akkorden.

### 6.3 Import, Umwandlung und Versionierung

- Import von Textdateien und ChordPro-Dateien, auch mehrere Songs in einer Datei
- Optionale automatische Umwandlung:
  - Abschnitte (Intro, Verse, Chorus, Bridge …) sauber als ChordPro markieren
  - Titel und Interpreten korrigieren (z. B. „Twisted Sister“ statt „twisted sisters“)
  - Schreibweise vereinheitlichen (B → H, Gb → Fis)
  - fehlende Tonarten aus den Akkorden ableiten und vorschlagen (z. B. Smooth: Am, Summer of 69: D, Use Somebody: C)
  - Fremdkommentare entfernen (z. B. GuitarTapp-Werbung)
- Vorschau mit Original und Ergebnis nebeneinander, Bestätigung durch den Nutzer
- **Versionierung:** Das Original bleibt immer unverändert erhalten. Jede Umwandlung oder Bearbeitung wird als neue Version gespeichert. Der Nutzer wählt pro Song die aktive Version, die auf der Bühne angezeigt wird, und kann jederzeit zurückspringen.
- Eigene Akkordkürzel: „2“ steht für die hinzugefügte Sekunde (z. B. D2 = Dadd2) und wird als Akkord erkannt und mittransponiert. Kürzel für Umkehrungen (z. B. D1, C-2) werden nicht automatisch umgewandelt, sondern als „bitte prüfen“ markiert und Song für Song geklärt. Übliche Zielschreibweise: Slash-Akkorde (z. B. D/Fis).
- **Medleys** bleiben ein einziger Eintrag. Jeder Teil kann einen eigenen Sound haben.

### 6.4 Export

- Export als ChordPro, einzeln oder mehrere Songs, z. B. zum Austausch mit Musikerkollegen oder für OnSong
- PDF-Export im hellen Druckformat

## 7. Funktionen – Stufe 3: Setlisten

- Beliebig viele Setlisten, z. B. eine pro Auftritt
- Reihenfolge per Ziehen ändern. Ein Song kann in mehreren Setlisten vorkommen.
- Bis zu vier Sets pro Auftritt mit Pausen dazwischen. Auf der Bühne wird das aktuelle Set angezeigt.
- Spieldauer pro Song hinterlegen. Die App berechnet die Dauer pro Set und für den ganzen Auftritt.
- **Merkmale pro Song:** Sänger (Este, Bianca, Christian), Tempo und Stimmung, Besetzung (wer an welchem Instrument), Gitarrenwechsel, Pianowechsel, Sängerwechsel
- **Schlagworte pro Song**, mehrere gleichzeitig möglich. Feste Liste: Opener, Abschluss, Zugabe, Mitsingen, Tanzflächenfüller, Ballade, Langsam, Schnell, Party, Hintergrund, Deutsch. Eigene Schlagworte können ergänzt werden.
- **KI-Vorschlag für Setlisten** (Vorbereitungsmodus): Eingabe des Kontexts (z. B. „Hochzeit, drei Sets à 45 Minuten, erst ruhig, dann Party“). Die App schlägt eine Reihenfolge vor und bildet dabei Blöcke nach Stimmung und nach Wechseln, damit möglichst wenig umgebaut werden muss. Nötige Wechsel werden im Ablauf angezeigt.
- Der Vorschlag kann danach frei angepasst werden.

## 8. Spätere Ausbaustufen

- **Setlisten:** jetzt fest eingeplant in Stufe 3 (siehe Abschnitt 7)
- **Bluetooth-Fußschalter:** Songwechsel und Scrollen ohne Hände
- **MIDI-Steuerung:** Bei Songauswahl sendet die App einen Programmwechsel an das Nord Electro 7.
  - Am PC direkt im Browser möglich (Web MIDI)
  - Auf dem iPad unterstützt Safari kein Web MIDI. Dafür ist eine Zusatzlösung nötig, z. B. eine Brücken-App oder eine native iPad-App.
- **Bandsynchronisation:** Setlisten und Leadsheets auf mehreren Tablets
- **Referenzaufnahmen** pro Song zum Üben
- **Hörbeispiele** im Sound-Lexikon
- Optional: Vorschläge für das Kawai bzw. für Andreas Parts

## 9. Offene Punkte

- Erste Songs liegen vor (Datei „01 Stücke Proben“). „Zombie“ fehlt noch. Konkrete Setlist folgt von Christian.
- Modell der In-Ear-Empfänger (für die Funktion nicht kritisch)
- Auswahl des KI-Anbieters und Einrichtung des API-Schlüssels
- Modell des Bluetooth-Fußschalters (spätere Stufe)
- Prüfung der MIDI-Lösung für das iPad (spätere Stufe)

## 10. Nächste Schritte

1. Christian prüft dieses Dokument und ergänzt oder korrigiert es.
2. Christian liefert die Setlist.
3. Bau des ersten Prototyps (Stufe 1) mit 3–5 Songs
4. Test am PC und auf dem iPad, danach Veröffentlichung über GitHub Pages
5. Schrittweiser Ausbau nach Stufe 2 und den späteren Stufen
