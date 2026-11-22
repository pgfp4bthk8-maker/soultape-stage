# Änderungen

## 0.1.32 – 22.11.2026
- **Gitarre in der Setliste** (mit „Mein Sound“): Jeder Song zeigt die eigene Gitarre mit Farbe und Kürzel.
- **Wechsel-Hinweis**: Vor einem Song mit einer anderen Gitarre steht „⇄ Wechsel auf …“, auch über Pausen hinweg. Songs ohne Angabe zählen dabei nicht. Beim Umstellen der Liste rechnet die App neu.
- **Im Song**, wenn er aus einer Setliste geöffnet ist: Muss für den nächsten Song gewechselt werden, steht das oben unter der Box und als ⇄ am Knopf zum nächsten Song.

## 0.1.31 – 22.11.2026
- **Mein Sound** für Gitarre, Bass und andere Instrumente: eigene Einstellungen pro Song und pro Part. Bei den Rollen Gitarre und Bass ist es an, sonst lässt es sich unter „Einstellungen“ → „Anzeigen“ einschalten.
  - **Einmal einrichten** (Einstellungen → Mein Sound): Gitarren mit Kürzel, Farbe und Pickup-Stellungen (Vorlagen mit 3 oder 5), Name des Effektgeräts, eigene Effektliste.
  - **Pro Song** (Bearbeiten → Mein Sound): Standard mit Gitarre, Pickup, Preset, Scene, Effekten und Notiz. Zur Auswahl stehen nur die Pickup-Stellungen der gewählten Gitarre.
  - **Pro Part** nur die Abweichungen. Die Parts kommen aus den Abschnitten des eigenen Blatts, auch Medley-Teile. „Chorus“ gilt für alle, „Chorus 3“ nur für den dritten und startet mit den Angaben von „Chorus“. Alles Leere gilt wie der Standard.
  - **Effekte** je Part als komplette Auswahl, der Standard ist vorangehakt. So lässt sich auch „keine Effekte“ eintragen.
  - **Im Song**: oben eine Box mit dem Standard, im Blatt Schilder nur dort, wo sich etwas ändert, auch zurück zum Standard. Bei einem Wechsel von Preset oder Scene nennen sie alle Effekte, die an sein sollen. Parts ohne Abschnitt im Blatt stehen als Leiste darüber.
- **Persönlich**: „Mein Sound“ reist in keinem Paket mit, steht aber in der eigenen Sicherung. Beim Einspielen einer fremden oder älteren Sicherung bleiben die eigenen Angaben erhalten.
- Beim Einspielen einer fremden Sicherung bleiben jetzt auch die **eigenen Anzeige-Schalter**.

## 0.1.30 – 22.11.2026
- **Speicherschutz bei unlesbaren Daten**: Kann die App die Daten beim Start nicht lesen, überschreibt sie sie nicht mehr. Oben erscheint ein Hinweis. Unter „Einstellungen“ lässt sich eine Rettungsdatei speichern, eine Sicherung einspielen oder mit den Startdaten neu beginnen. Der unlesbare Stand wird dabei aufgehoben.
- **Speicherschutz bei zwei offenen Fenstern** (z. B. Browser-Tab und installierte App auf Android oder am PC): Ein Fenster mit altem Stand schreibt nicht mehr über den neueren. Übersichten aktualisieren sich selbst, in einem offenen Song oder Formular erscheint „Aktualisieren“. Was in diesem Fenster danach eingegeben wurde, muss man wiederholen.
- **Fehler beim Speichern** werden jetzt immer gemeldet, auch beim Anlegen von Songs, Listen und Blättern. Erfolgsmeldungen überdecken die Warnung nicht mehr.
- Auf der **Bühne** erscheinen diese Hinweise nicht. Die App bleibt dort benutzbar, und der Hinweis kommt beim Wechsel in die Vorbereitung.
- Beschädigte Sicherungsdateien werden vor dem Einspielen abgelehnt. Ältere Sicherungen bleiben einspielbar.
- Der Schutz wirkt erst, wenn alle offenen Fenster mindestens 0.1.30 haben.

## 0.1.29 – 20.11.2026
- **„Zeilen ordnen“ auch in der Song-Ansicht**: In der Leiste über dem Blatt gibt es neben „✎ Im Blatt ändern“ den Knopf „↵ Zeilen ordnen“ (auf dem Handy nur „↵“). Ein Tipp darauf wechselt zu „Bearbeiten“ und öffnet dort direkt die Vorschau Vorher/Nachher. Nach „Speichern“ oder „Abbrechen“ bist du wieder im Song.
- Ist das Blatt schon geordnet, erscheint nur ein kurzer Hinweis und die Ansicht bleibt, wo sie ist.
- Den Knopf gibt es nur im Vorbereitungsmodus. Auf der Bühne ist er ausgeblendet.

## 0.1.28 – 20.11.2026
- **Zeilen ordnen**: Ein neuer Knopf „↵ Zeilen ordnen“ unter „Bearbeiten“ → „Leadsheet-Versionen“ ordnet die Zeilen des aktiven Blatts automatisch:
  - Wiederholt sich eine Akkordfolge in einer Zeile, steht jede Runde in einer eigenen Zeile, z. B. `E H C#m A E H C#m A` → zweimal `E H C#m A` untereinander. Eine Zeile behält mindestens 4 Akkorde bzw. Takte.
  - Akkordzeilen ohne Wiederholung werden nur an einer großen Lücke geteilt, die der Schreiber selbst gelassen hat.
  - Vor jedem Abschnitt (Strophe, Refrain, Bridge …) kommt eine Leerzeile. Ein Soundwechsel direkt davor rutscht mit.
  - Sehr lange Textzeilen werden an einem Satzzeichen nahe der Mitte geteilt, bevorzugt dort, wo die Akkordfolge von vorn beginnt.
- Vor dem Speichern zeigt eine **Vorschau** Vorher und Nachher nebeneinander (auf dem Handy untereinander). Geänderte Stellen sind grün markiert.
- Gespeichert wird eine **neue Fassung „Zeilen geordnet“**, die dann aktiv ist. Das Original bleibt unverändert, und du kannst jederzeit zurückschalten.
- Inhalt, Akkorde, Abschnitte, Hinweise und Soundwechsel bleiben gleich, nur die Zeilen werden anders verteilt.

## 0.1.27 – 20.11.2026
- **Größere Ampel für die Datensicherung** (Wunsch aus der Band): Der Punkt neben „Einstellungen“ bzw. ⚙ ist jetzt deutlich größer (auf dem Handy 18 statt 10 Pixel) und hat einen dunklen Rand, damit er auf jedem Hintergrund auffällt. Auch die Ampel in den Einstellungen und im Hinweis „Sicherung fällig“ ist größer.

## 0.1.26 – 20.11.2026
- **Wing-Snapshot pro Song** für den Mischer: neues Feld unter „Bearbeiten“ (z. B. „12“ oder ein Name). So weiß der Mischer bei jedem Song, welche gespeicherte Pult-Einstellung er laden soll – ähnlich wie der Nord-Speicherplatz für das Keyboard. Umschalten muss er am Pult weiterhin selbst.
- In der Song-Ansicht steht oben ein grüner Kasten mit dem Snapshot **dieses Songs und des nächsten Songs** der Setliste („Danach: 13 · Titel“, vor einer Pause „Nach der Pause“). Der Mischer kann den nächsten Snapshot also schon vorbereiten.
- Der Snapshot erscheint als kleines grünes Schild 🎚 auch in der Songliste, in der Setliste und auf dem Handy im Knopf für den nächsten Song.
- Sichtbar nur bei der Rolle **Mischpult** (auch wenn die Rolle schon vor diesem Update gewählt wurde); alle anderen können ihn unter Einstellungen → Mein Profil → Anzeigen einschalten.
- Der Snapshot **reist im Band-Paket mit** und wird wie Tonart und Dauer abgeglichen. Am einfachsten trägt der Mischer die Snapshots auf seinem Gerät ein und schickt dir ein Band-Paket zurück.

## 0.1.25 – 20.11.2026
- **Ablauf pro Song** (Wunsch des Mischers): Wer singt wo, wo sind die Solos und welche Effekte braucht das Pult. Eingegeben wird er als kleine Tabelle unter „Bearbeiten“ → „Ablauf“ (Spalten Teil, Gesang, Solo, Effekt/Hinweis). Beim Tippen schlägt die App Instrumente, deinen Profilnamen und alle Namen vor, die du schon in anderen Songs eingetragen hast.
- Knopf **„Abschnitte aus dem Blatt übernehmen“** füllt die Spalte „Teil“ mit den Abschnitten des aktiven Blatts – dann nur noch Sänger und Solos dazuschreiben.
- **In der Song-Ansicht** steht der Ablauf als kleine Schilder direkt an den Abschnitten: 🎤 Sänger (lila), ★ Solo (gold), ◎ Effekt (grün). Die App erkennt gleiche Abschnitte auch bei anderer Schreibweise: „Strophe 2“ passt zu „Verse 2“ und „(2.Str.)“, „Refrain“ zu „Chorus“. Steht im Ablauf „Refrain 3“, gilt das nur für den dritten Refrain im Blatt.
- Passt eine Zeile zu keinem Abschnitt (oder hat das Blatt gar keine Abschnitte), erscheint sie als **Leiste über dem Blatt**.
- Der Ablauf gilt für alle Blätter des Songs und **reist im Band-Paket mit**. Beim Einspielen wird er wie Tonart und Dauer abgeglichen: fehlt er, wird er ergänzt; weicht er ab, zeigt die Vorschau das an und du kannst deinen behalten.
- Anzeigen lässt er sich unter Einstellungen → Mein Profil → Anzeigen („Ablauf“), standardmäßig für alle an.

## 0.1.24 – 19.11.2026
- **Sicherung zwischen eigenen Geräten** (z. B. vom Handy aufs iPad): Einstellungen, die zum Gerät gehören, bleiben jetzt beim Einspielen erhalten: Ansicht (Handy/Tablet), Schriftgröße, Blätter-Tempo, Metronom und „Songnummern vergeben“. Bisher hat eine Sicherung vom Handy diese Werte aufs iPad übertragen – im schlimmsten Fall vergab das iPad danach keine Songnummern mehr.
- Songs, Setlisten und die übrigen Einstellungen (Profil, Anzeigen, H/B-Schreibweise, Nord-Lautstärke) kommen wie bisher aus der Sicherung.
- Auf einem neuen Gerät „Songnummern vergeben“ bei Bedarf selbst einschalten – das kommt nicht mehr aus der Sicherung mit.

## 0.1.23 – 19.11.2026
- **Handy-Ansicht** (Wunsch aus der Bandprobe, vor allem für die Sänger mit dem Handy hochkant am Mikrofonständer): Auf iPhone und Android erscheint automatisch eine angepasste Ansicht. Die Kopfleiste ist schmal („⚙“ statt „Einstellungen“, „Vorb.“ statt „Vorbereitung“), nichts läuft mehr seitlich aus dem Bild – bisher war der Knopf Bühne/Vorbereitung auf dem Handy abgeschnitten.
- **Nächster Song immer oben:** In der mitlaufenden Leiste steht auf dem Handy ein großer Knopf mit dem nächsten Song der Setliste (mit ⏸, wenn davor eine Pause kommt). Man muss nicht mehr bis ans Ende des Blatts scrollen.
- Ohne Akkorde (Rolle Gesang) fällt das Transponieren in der Leiste weg; es bleiben Schriftgröße A−/A+ und der nächste Song. „Im Blatt ändern“ ist auf dem Handy nur noch ✎.
- **Dichterer Text mit Akkorden:** Bricht eine Zeile um, bleibt über dem umgebrochenen Teil keine leere Akkordzeile mehr stehen (gilt auf allen Geräten).
- Setlisten auf dem Handy: lange Titel brechen um statt „A…“, sortiert wird über den Griff ≡ (▲/▼ fallen dort weg).
- **Umschalten von Hand:** Einstellungen → Darstellung → Ansicht: Automatisch / Handy / Tablet. Automatisch heißt: Gerät mit kleinem Bildschirm (kürzere Seite unter 600 Pixel) oder schmales Fenster.

## 0.1.22 – 19.11.2026
- **Visuelles Metronom** (Wunsch des Schlagzeugers aus der Bandprobe): Ein Ball pendelt im Songtempo von links nach rechts und zurück, jede Umkehr ist ein Schlag. Auf dem Schlag leuchten der Ball und das Ende der Leiste auf.
- Die Leiste ist schmal und verdeckt keinen Text: entweder **oben** als letzte Zeile unter den Knöpfen (läuft beim Scrollen mit nach oben und bleibt dort stehen) oder **fest unten** am Bildschirm. Einstellbar unter Einstellungen → Metronom.
- **Tippen auf die Leiste setzt den Schlag neu:** Tippe auf einen Schlag der Band, und der Ball läuft ab da mit ihr. Mit „Eins hervorheben“ (abschaltbar, Standard aus) zeigt die Leiste 1-2-3-4, die Eins leuchtet orange – getippt wird dann auf die Eins.
- Läuft genau, auch auf langsamen Geräten: Die Position wird in jedem Bild aus der Uhrzeit berechnet. Optional **hörbarer Klick** (Standard aus), über die Audio-Uhr des Geräts eingeplant.
- Knopf **♩ 120** in der Song-Ansicht schaltet das Metronom ein und aus, auch auf der Bühne. Fehlt das Tempo, steht dort im Vorbereitungsmodus „♩ Tempo fehlt“.
- Anzeigen lässt es sich unter Einstellungen → Mein Profil → Anzeigen; bei der Rolle „Schlagzeug“ ist es automatisch an, bei allen anderen aus.
- **Neue Song-Felder Tempo (BPM) und Taktart** unter „Bearbeiten“. Beim ChordPro-Import werden `{tempo: …}` und `{time: …}` übernommen, beim ChordPro-Export wieder geschrieben. Tempo und Taktart reisen im Paket und Band-Paket mit und werden beim Einspielen wie Tonart und Dauer abgeglichen.

## 0.1.21 – 17.11.2026
- **Soundvorschläge für 87 weitere Songs** (die übrigen Songs aus deiner Songdatei, z. B. Bohemian Rhapsody, Hold the Line, Piano Man, Jump, Titanium): jeweils eine Kurzbeschreibung und eine Schritt-Anleitung für den Nord. Grundlage sind das Original und deine Notizen aus der Datei (Kawai-Codes, „33C Orgel 70 %“, „Strings linke Hand“, „HiQBass −1 Okt“). Bei *Bed of Roses* (P 15) und *No Roots* (P 21) ist dein vorhandener Speicherplatz eingetragen.
- Die Vorschläge kommen beim ersten Start still zu den Songs, die noch keinen Sound haben. Eigene Eintragungen bleiben unberührt.
- Diese Vorschläge werden nur bei Songs eingetragen, die du selbst importiert hast – und nur bei genau passendem Titel. Bei einer Neuinstallation oder über „Startdaten ergänzen“ werden dafür keine eigenen Songs angelegt.
- Alle Werte sind ungehörte Startpunkte und müssen am Instrument geprüft werden.

## 0.1.20 – 17.11.2026
- **Band-Paket** (unter „Songs teilen“): ein Knopf packt die ganze Songliste (Titel, Interpret, Tonart, Dauer, Nummer) und alle Setlisten in eine Datei `soultape-bandpaket-<Datum>.json` – für die ganze Band. Blätter gehen nur mit, wenn sie unten angehakt sind.
- **Abweichungen beim Einspielen:** Hat der Empfänger bei einem Song einen anderen Titel, Interpreten, eine andere Tonart oder Dauer, zeigt die Vorschau das an („Dauer ändern: bei dir 4:10 → aus dem Paket 3:35“). Standardmäßig wird der Wert aus dem Paket übernommen; jeder Wert lässt sich einzeln abwählen. Leere Felder werden wie bisher ergänzt. Wird ein Titel geändert, bleibt der alte als zweiter Name erhalten, damit ChordPro-Dateien weiter zugeordnet werden. Gilt für alle Pakete.
- Übersichtlichere Vorschau: Oben steht, wie viele Songs neu sind, geprüft werden sollten oder abweichen. Sicher erkannte Songs ohne Änderung sind zu einer Zeile zusammengefasst.
- **Sicherung einer anderen Person:** Spielt jemand eine fremde Sicherung ein (anderer Profilname), bleiben sein eigenes Profil und seine Einstellung zur Nummernvergabe erhalten.

## 0.1.19 – 15.11.2026
- **Update mit einmal Öffnen:** Ist kurz nach dem Start eine neue Version fertig geladen, lädt sich die App einmal selbst neu – die Versionsnummer oben rechts springt dann nach wenigen Sekunden um. Bisher musste man die App dafür schließen und noch einmal öffnen.
- Das passiert nur im Vorbereitungsmodus, nur in den ersten 30 Sekunden nach dem Start, nur auf den Übersichtsseiten (Songs, Setlisten, Lexikon, Einstellungen) und nicht während einer Eingabe. Im Bühnenmodus und in einem geöffneten Song lädt nie etwas neu – dort gilt weiter: neue Version beim nächsten Start.
- Wirkt ab dem übernächsten Update, denn das Neuladen muss erst selbst auf dem Gerät angekommen sein.

## 0.1.18 – 15.11.2026
- Pakete tragen jetzt die Version der App, mit der sie erstellt wurden. Läuft beim Empfänger eine ältere Version, sagt die App das klar und bittet ums Aktualisieren – statt einer irreführenden Meldung wie „Das Paket enthält keine Songs“ (so passiert mit einem Setlist-Paket auf Version 0.1.16). Wirkt ab dieser Version; ältere Versionen kennen den Hinweis noch nicht.
- Fehlermeldungen beim Einspielen eines Pakets bleiben länger stehen.

## 0.1.17 – 15.11.2026
- **Setlisten im Paket:** Unter „Songs teilen“ lassen sich jetzt auch Setlisten und Probenlisten mitgeben – nur die Reihenfolge mit Pausen. Jeder behält seine eigenen Blätter; an jeder Position öffnet sich beim Empfänger sein eigenes Blatt.
- Beim Einspielen: Gibt es beim Empfänger schon eine Liste mit demselben Namen, wird ihre Reihenfolge aktualisiert und der bisherige Stand vorher automatisch festgehalten („Vor Paket von …“) – er lässt sich in der Liste zurückholen. Sonst wird eine neue Liste angelegt. In der Vorschau lässt sich das pro Liste umstellen.
- Songs der Liste, die der Empfänger noch nicht hat, werden als leere Songs (Titel, Interpret, Tonart, Dauer) angelegt, damit die Liste vollständig ist.
- Blätter gehen weiterhin nur für die eigens angehakten Songs mit; „Blätter dieser Liste anhaken“ wählt alle Songs einer Liste auf einmal.
- **Songnummern:** Jeder Song kann eine feste Nummer bekommen, die ihr euch in der Probe zurufen könnt („die 12“). Sie steht in der Songliste, auf dem Blatt und in den Setlisten; die Suche findet Songs auch über die Nummer. Vergabe unter Einstellungen → „Songnummern“ (alphabetisch für alle Songs ohne Nummer) oder einzeln unter „Bearbeiten“. Nur eine Person in der Band sollte Nummern vergeben; die anderen bekommen sie mit dem Paket. Vergebene Nummern werden nicht neu vergeben.
- **Sichere Zuordnung im Paket:** Jeder Song reist mit einer unsichtbaren Kennung. Beim ersten Einspielen wird noch über den Titel zugeordnet (die Vorschau bittet um Prüfung), danach erkennt die App den Song sicher wieder – auch wenn er beim Kollegen anders geschrieben ist oder umbenannt wurde.

## 0.1.16 – 15.11.2026
- Die Versionsnummer steht jetzt klein oben rechts in der Kopfzeile – auf jedem Bildschirm sichtbar, ohne in die Einstellungen zu gehen.

## 0.1.15 – 15.11.2026
- **Songs teilen** (Knopf in der Songliste, Vorbereitungsmodus): einzelne Songs anhaken – oder die Songs einer Setlist übernehmen – und als kleines Paket an einen Kollegen schicken (AirDrop, Mail, iCloud).
- **Paket einspielen:** Der Empfänger sieht zuerst eine Vorschau und kann Songs abwählen oder anders zuordnen. Es wird nichts überschrieben: Neue Songs werden angelegt; hat er den Song schon, kommt das Blatt als zusätzliche Fassung „Von …“ dazu, sein eigenes Blatt bleibt aktiv.
- Standardmäßig geht nur das Blatt mit, ohne Soundwechsel-Balken. Auf Wunsch gehen die Nord-Sounds und die Balken mit (für Kollegen am Keyboard); Sounds werden beim Empfänger nur bei Songs ohne eigenen Sound übernommen.
- **Als ChordPro-Datei (für OnSong):** dieselbe Auswahl als ChordPro – für Kollegen, die die App noch nicht nutzen.
- Schutz vor Verwechslung: Ein Paket lässt sich nicht als Sicherung einspielen (das hätte alle anderen Songs gelöscht) und umgekehrt.

## 0.1.14 – 15.11.2026
- **Mein Profil** (Einstellungen, ganz oben): Name und Rolle – Keyboard, Gesang, Gitarre, Bass, Schlagzeug oder Mischpult. Erster Schritt, damit auch die Bandkollegen die App nutzen können.
- Die Rolle stellt ein, was angezeigt wird; jeder Punkt lässt sich danach einzeln schalten:
  - **Akkorde im Blatt** – ausgeschaltet zeigt das Leadsheet nur Text, Abschnitte und Spielhinweise (z. B. für Sänger).
  - **Nord-Sounds und Anleitungen** – ausgeschaltet verschwinden Nord-Programm, Soundvorschläge, Lexikon und der Lautstärke-Abschnitt.
- Für vorhandene Nutzer ändert sich nichts: Voreinstellung ist Keyboard mit allem eingeschaltet.

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
- Getestet auch mit einer echten Auftritts-Setliste (OnSong, 40 Einträge, viele Internet-Vorlagen):
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
