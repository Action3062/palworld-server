# Konzept D — KALTDRUCK

> ### „Kein Prospekt, ein Logbuch: PalHeim führt Buch über eine Welt, die nicht zurückgesetzt wird."

*Kein Prospekt, ein Protokoll. Die Seite ist die veröffentlichte Chronik des Servers.*

| | |
|---|---|
| **Register** | Handwerk · Akte · Zeit |
| **Signature-Moment** | DER ABDRUCK. |
| **Sektionen** | 13 |

---

## 1 · Designphilosophie

Jede Serverseite behauptet. KALTDRUCK belegt. Die Leitidee ist ein Rollentausch: Die Website ist nicht die Werbung für den Server, sie ist sein veroeffentlichtes Protokoll. Sie sieht aus wie ein gedrucktes Dokument, weil ein gedrucktes Dokument etwas verspricht, das eine Landingpage nie verspricht: Es wurde vorher geprueft, es traegt ein Datum, es ist nachlesbar, und man kann es nicht heimlich aendern.

Daraus folgt alles Weitere. Es gibt keine Sektionen, es gibt Kapitel. Es gibt keine Ueberschriften-Kicker, es gibt einen Kolumnentitel, der dir sagt, wo du bist. Es gibt keine Feature-Karten, es gibt Paragraphen, Register, Protokollzeilen und Fussnoten. Und es gibt keine Preisliste, sondern eine Rechnung, die auf null endet.

Das Material ist bewusst kalt: schwarzes Papier unter einem einzigen 6500-Kelvin-Streiflicht, Cyan als Tinte, Gold nur dort, wo etwas gepraegt ist. Kein Sepia, kein Braun, keine Nostalgie. Handwerk heißt hier Praezision, nicht Gemuetlichkeit - Letterpress und Kaltfolie, nicht Bastelbogen.

Der eigentliche Mut liegt im Verzicht: keine Behauptung ohne Beleg, keine Zahl ohne Quelle, keine Verkuerzung ohne Fussnote. Wo andere Seiten ihre Schwaechen verstecken, druckt diese sie ab - die Störungsakte, das Steam-only-Problem, die Frage nach dem Haken. Genau das ist die Konversion. Wer einem privaten Server beitritt, kauft kein Produkt, sondern schenkt Vertrauen. Vertrauen entsteht durch Aktenlage, nicht durch Adjektive.

## 2 · Zielwirkung

SEKUNDE 1 - Irritation im besten Sinn: "Das ist gedruckt, nicht generiert." Kein Badge, kein Verlaufswort, kein Buttonpaar. Stattdessen ein dunkler Bogen mit sichtbarer Kante, ein blindgepraegter Titel, eine Ausgabennummer und ein Datum. Das Gehirn liest "Dokument", nicht "Angebot" - und Dokumente werden anders gelesen als Werbung: langsamer, glaeubiger, aufmerksamer.

SEKUNDE 5 - Beweislage: "Hier laufen echte Zahlen." Der Blick fällt auf den Einlauf rechts, wo gerade eine Zeile mit Uhrzeit nachrutscht, und auf die Ausgabennummer, die verraet, dass es das hier seit Hunderten von Tagen gibt. Nicht "seit 2024 für euch da", sondern eine Zahl, die morgen um eins höher steht. Der Besucher versteht: Diese Seite wird gefuehrt, nicht gepflegt.

SEKUNDE 30 - Entscheidung: "Die sind ehrlich, und ich will dazugehoeren." Er hat die Störungsakte gesehen (inklusive der Ausfälle), die Rechnung über 0,00 Euro gelesen, den roten Quervermerk UNBEZAHLT bemerkt und in Fussnote 2 erfahren, dass es über den Game Pass nicht geht - eine Wahrheit, die ihm sonst niemand vor dem Download sagt. Der Gedanke ist nicht "günstig", sondern "hier luegt mich keiner an". Dann drückt er den Stempel, und sein eigener Abdruck bleibt auf der Seite stehen.

## 3 · Farbwelt

Die Palette löst drei Probleme des Bestands gleichzeitig. Erstens: Der Bestand hatte nur EINE Flaechenfarbe (#ffffff) und einen einzigen Schatten als komplette Z-Achse. Hier tragen vier fast gleiche Dunkeltoene (Nacht, Bogen, Falz, Raster) die gesamte Tiefe - Ebenen entstehen durch Licht und Kante, nicht durch Farbe. Zweitens: Der Bestand hatte drei Grüns für denselben Zustand und zwei verschiedene Farben für Basen in Legende und Karte. Hier existiert pro semantischer Rolle genau ein Token, und die Faltkarte benutzt für Legende und Datenpunkt dieselbe Variable. Drittens: Die Trennung von Flaechen- und Textfarbe, die der Bestand mit --accent gegen --accent-text bereits richtig geloest hatte, wird konsequent fortgesetzt - Cyan gibt es als helle Tinte und als tiefe Flaeche, Gold gibt es als Praegung mit eigener Licht- und Schattenkante. Jeder Wert ist gegen --papier-bogen, --papier-nacht und --papier-falz nachgerechnet; der schwächste Textwert liegt bei 4,86:1. Gold und Cyan sind bewusst so weit auseinander (Gelbgruen gegen Cyanblau), dass sie bei Deuteranopie und Protanopie unterscheidbar bleiben; Rot und Grün treten nie als einziges Unterscheidungsmerkmal auf - die Störungsakte trennt zusätzlich über Wortmarke (BEHOBEN gegen Zeitspanne) und Position.

| Token | Hex | Rolle |
|---|---|---|
| `--papier-nacht` | `#0B0E12` | Pressbett / Seitengrund ausserhalb des Bogens. Tiefstes Schwarz mit minimalem Blaustich, damit der Bogen darauf wie aufgelegt wirkt und nicht wie ausgeschnitten. |
| `--papier-bogen` | `#12171D` | Die Papierflaeche selbst - Traeger von 90 Prozent allen Textes. Kontrast zum Pressbett nur 1,07:1, sichtbar allein über Kante, Schlagschatten und Faserstruktur. |
| `--papier-falz` | `#191F27` | Erhoehte oder eingelegte Flaechen: Einladungskarte, Faltkartenplatte, Registerreiter im aktiven Zustand, Overlay des Inhaltsverzeichnisses. |
| `--raster` | `#232B35` | Rasterpapier: 4-mm-Gitter unter allen Datenflaechen und Chartachsen, 1,26:1 auf dem Bogen - spuerbar, nie lesbar, nie störend. |
| `--tinte-hell` | `#E8EEF4` | Fliesstext, Ueberschriften, alle Primaerinformation. 15,41:1 auf dem Bogen. Leicht blaustichiges Weiß, kein Reinweiss - Reinweiss auf Schwarz halationiert. |
| `--tinte-matt` | `#A2B0BE` | Marginalien, Bildunterschriften, Hint-Zeilen unter Kennzahlen, Kolumnentitel. 8,14:1 - klar AA, aber sichtbar zweite Ordnung. |
| `--tinte-blass` | `#7C8D9E` | Kleinste Ebene: Seitenzahlen, Achsenbeschriftung, Fussnotenmarker, Registerreiter inaktiv. 5,28:1 auf dem Bogen - der bewusst gewaehlte Boden, unter den nichts fällt. |
| `--cyan-tinte` | `#2FD3E1` | Die Tinte: Links, Datenlinien im Chart, Spielerpunkte auf der Karte, aktiver Registerreiter, Auszeichnung im Text. 9,88:1 - als Flaeche und als Text zulaessig. |
| `--cyan-tief` | `#0B5A66` | Cyan als FLAECHE unter hellem Text (Fussnoten-Highlight, Auswahlfarbe, Chart-Flaeche bei 24 Prozent). Traegt --tinte-hell mit 6,73:1. |
| `--gold-praegung` | `#C8A44E` | Kaltfolie: Kapitelziffern, Rangnummern im Namensregister, erreichte Erfolge, die Summe der Rechnung, das Siegel. 7,61:1. Niemals als Fliesstext, immer als Auszeichnung. |
| `--gold-licht` | `#D9BC74` | Obere Lichtkante jeder Goldpraegung (1px). Erzeugt zusammen mit --gold-kante das Relief - der einzige Ort, an dem zwei Goldtoene aufeinandertreffen dürfen. |
| `--gold-kante` | `#6E5624` | Untere Schattenkante der Goldpraegung (1px, unten rechts). Definiert die 15-Grad-Lichtrichtung, die ausnahmslos jedes gepraegte Element teilt. |
| `--stempel-rot` | `#E0574B` | Stempelfarbe: Quervermerk UNBEZAHLT, Ausfallmarkierung in der Störungsakte, Haken der Hausordnung. 4,83:1 auf dem Bogen - Regel: nur auf --papier-bogen oder ab 24px, nie auf --papier-falz (4,45:1). |
| `--vermerk-gruen` | `#52C98A` | Positivvermerk: BEHOBEN in der Akte, Verfügbarkeitswerte, erreichter Fortschritt im Setzkasten. 8,65:1. Ersetzt die drei widerspruechlichen Grüntoene des Bestands durch genau einen. |
| `--fokus` | `#7FE7F2` | Fokusring, ausschließlich. 2px solid plus 2px offset plus 0 0 0 5px rgba(11,90,102,.55) als dunkler Halo. 12,53:1 - auf Papier, auf Praegung und auf der Faltkarte gleichermassen sichtbar. |

## 4 · Typografie

**Display —** Bodoni Moda (Google Fonts, Variable, Achsen wght 400-900 und opsz 6-96), selbst gehostet als woff2. Begründung: Eine Didone ist die typografische Form des Kupferstichs und der Praegung - extremer Strichkontrast, waagerechte Haarserifen, senkrechte Schattenachse. Genau diese Haarlinien fangen auf dunklem Grund das Streiflicht und erzeugen die Reliefwirkung, die das gesamte Konzept traegt. Bodoni Moda ist ausserdem kalt und aristokratisch statt gemuetlich - damit erfuellt sie die Abgrenzung gegen Serifen-Nostalgie: Sie ist keine Buchschrift von früher, sie ist eine Praezisionsschrift. Die opsz-Achse wird echt genutzt: opsz 96 für Zahlenmomente ab 120px (duennste Haarlinien), opsz 24 für Kapitelkoepfe. HARTE REGEL: Bodoni erst ab 40px, darunter verschwinden die Haarlinien auf Schwarz. Fallback: 'Bodoni Moda', 'Didot', 'Playfair Display', Georgia, serif. Lizenzalternative für den Ausbau: Financier Display (Commercial Type) oder GT Sectra Display (Grilli Type).

**Fließtext —** Archivo (Google Fonts, Variable, wght 100-900, Schwesterfamilie Archivo Narrow und Archivo Expanded). Begründung: Ein Grotesk aus der Zeitungsproduktion - für kleine Groessen und schlechte Druckbedingungen gezeichnet, also auch für 14px auf Schwarz robust. Die Paarung Didone plus Grotesk ist die klassische Editorial-Kombination und die exakte Gegenposition zu Baloo 2 plus Nunito, die beide in derselben runden, freundlichen Ecke sassen. Archivo Narrow uebernimmt Kolumnentitel und Marginalien, weil schmale Grotesken im Rand nicht mit dem Satzspiegel konkurrieren. Fliesstext steht bei 400 - im Bestand gab es kein einziges font-weight 400, weshalb 800 dort nichts mehr bedeuten konnte. Fallback: Archivo, 'Helvetica Neue', system-ui, sans-serif. Lizenzalternative: Soehne (Klim Type Foundry).

**Monospace —** IBM Plex Mono (Google Fonts, wght 400/500/600, Regular und Italic), selbst gehostet. Begründung: Die einzige verbreitete Mono mit echtem redaktionellem Charakter statt Terminal-Anmutung - leicht humanistische Formen, offene Punzen, sehr gute Ziffern. Sie traegt in diesem Konzept die halbe Informationslast: Kolumnentitel, Serveradresse, Zeitstempel im Einlauf, die Störungsakte, die Rechnungspositionen, Fussnotenmarker, Bildunterschriften und alle Achsenbeschriftungen. font-variant-numeric: tabular-nums ist global gesetzt, nicht komponentenweise. Ausdruecklich NICHT Space Mono (zu verspielt) und nicht Courier (Retro-Schreibmaschine, verbotene Nostalgie-Assoziation).

**Skala —** Modulare Skala, Faktor 1,25, neun Stufen, alle Werte als clamp() im :root - dazu ein 4/8-px-Abstandsraster mit acht Stufen. Ersetzt 33 improvisierte rem-Groessen und 35 px-Abstände. --fs-mikro: clamp(0.6875rem, 0.66rem + 0.14vw, 0.75rem) | --fs-klein: clamp(0.8125rem, 0.78rem + 0.17vw, 0.875rem) | --fs-basis: clamp(1rem, 0.96rem + 0.2vw, 1.125rem) | --fs-lead: clamp(1.25rem, 1.14rem + 0.55vw, 1.5rem) | --fs-h3: clamp(1.5rem, 1.28rem + 1.1vw, 2rem) | --fs-h2: clamp(2.25rem, 1.68rem + 2.85vw, 4rem) | --fs-h1: clamp(3.25rem, 1.9rem + 6.75vw, 7.5rem) | --fs-zahl: clamp(4.5rem, 1.6rem + 14.5vw, 15rem) | --fs-kapitel: clamp(7rem, 2rem + 25vw, 22rem). Abstände: --r1 4px, --r2 8px, --r3 12px, --r4 20px, --r5 32px, --r6 52px, --r7 84px, --r8 136px (Fibonacci-nah, jede Sektion nutzt EINE Stufe für ihr Innenmass). Zeilenhoehen: 1.62 für Fliesstext bei einer Satzbreite von maximal 68 Zeichen, 1.06 für alles über 4rem, 1.35 für Marginalien.

Die Typografie ist hier nicht Dekoration, sondern der eigentliche Bildtraeger - es gibt in diesem Konzept fast keine Illustration, also muss die Schrift die gesamte Dramaturgie leisten. Drei Familien, drei klar getrennte Aufgaben: Bodoni ist das Ereignis (Titel, Rekorde, die Summe der Rechnung), Archivo ist die Stimme (alles, was gelesen wird), IBM Plex Mono ist der Beleg (alles, was aus einer API kommt oder ein Datum traegt). Diese Zuordnung ist so streng, dass man an der Schrift ablesen kann, woher eine Information stammt: Was in Mono steht, ist gemessen. Was in Bodoni steht, ist bemerkenswert. Was in Archivo steht, ist erklärt. Die Dynamik reicht damit von 11px Mono 400 bis 240px Bodoni 900 - eine Spanne, die der Bestand mit seinen drei Schnitten zwischen 600 und 800 und einer Maximalgroesse von 43px unterhalb des Heros nicht ansatzweise hatte. Alle drei Familien werden als woff2 selbst gehostet unter /assets/fonts/, mit preload für die zwei kritischen Schnitte und font-display: swap. Das löst gleichzeitig den render-blockenden Fremd-Roundtrip, das Google-Fonts-Rechtsrisiko und den entsprechenden Absatz 5 der eigenen Datenschutzerklaerung.

## 5 · Der Hero

Du siehst kein Bild. Du siehst ein Blatt.

Der Viewport ist das Pressbett in --papier-nacht. Darauf liegt, mit sichtbarer Kante und einem sehr weichen, sehr großen Schlagschatten (0 40px 120px rgba(0,0,0,.7)), EIN Bogen in --papier-bogen - 92 Prozent Breite, oben und unten beschnitten, sodass klar ist: Das hier ist ein Ausschnitt aus etwas Längerem. In den vier Ecken der Bogenflaeche sitzen Passkreuze, wie sie Drucker zum Ausrichten der Farbausz&uuml;ge verwenden: vier gezeichnete Kreise mit Fadenkreuz, 12px, in --tinte-blass. Über die gesamte Bogenflaeche liegt eine 4-mm-Rasterung in --raster und eine gekachelte Papierfaser-Textur (128x128 WebP, unter 6 KB, 8 Prozent Deckkraft, mix-blend-mode: overlay).

Oben läuft der Kolumnentitel in IBM Plex Mono, 11px, gesperrt: PALHEIM / CHRONIK - AUSGABE 412 - 25.07.2026 - SEITE 1. Die Ausgabennummer ist echt: Tage seit dem ersten Sample. Darunter eine Haarlinie über die volle Bogenbreite.

Dann, links im Satzspiegel, die Wortmarke PALHEIM in Bodoni Moda 900, bis 120px, gesperrt auf 0.02em - blindgepraegt. Sie hat keine eigene Farbe: Sie IST die Papierfarbe, sichtbar nur durch eine 1px-Lichtkante oben links und eine Schattenkante unten rechts. Kein Verlauf, kein Glow.

Der Satzspiegel darunter teilt sich 7:5. Links die H1 in Archivo 500, dreizeilig: "Wir führen Buch über eine Welt, die nicht zurückgesetzt wird." Darunter drei kurze Zeilen: deutscher PvE-Server, eigene Hardware, seit Ausgabe 1.

Rechts der EINLAUF - eine schmale Mono-Spalte mit hängenden Zeitstempeln, gespeist aus /api/status und /api/stats: aktuelle Spielerzahl, FPS, letzter Neustart, letzter Ausfall, Rekord mit Datum. Sie ruckt live nach.

Unten links liegt der STEMPEL: die Serveradresse in einem leicht gedrehten Stempelrahmen (-1,5 Grad), Randabnutzung, ungleichmaessige Tintendichte. Er ist der primaere CTA. Discord steht daneben als reiner Textlink mit Pfeil - sekundaer, kleiner, ohne Flaeche.

REIHENFOLGE (2,3 s gesamt): Streiflicht faehrt einmal von links oben über den Bogen (1400 ms). Kolumnentitel tickert zeichenweise ein. Haarlinie zeichnet sich von links. Wortmarke wird gepraegt - Tiefe 0 auf 100 Prozent, 620 ms, cubic-bezier(0.16,1,0.3,1). H1 maskiert zeilenweise von unten, 60 ms Versatz. Einlauf-Zeilen fallen einzeln ein, sobald die API antwortet. Zuletzt setzt sich der Stempel mit einem 3-Grad-Überschwinger.

TON (optional, Standard AUS, Schalter im Kolumnentitel, in localStorage gemerkt): ein einziger tiefer Presse-Schlag beim Praegen der Wortmarke, minus 22 dB, 340 ms, 14 KB, erst nach Aktivierung nachgeladen.

Es gibt keinen Scrollpfeil. Stattdessen schaut die Kante des nächsten Bogens 24px unter dem Hero hervor - eine physische Aufforderung statt eines Glyphs.

Alle genannten Zahlen sind Platzhalter und an reale API-Felder gebunden.

## 6 · Seitenstruktur

| Sektion | Zweck | Form |
|---|---|---|
| **Kolumnentitel (persistente Navigation)** | Orientierung auf einer langen Seite, Reduktion der Navigation von neun Punkten auf vier Ziele, permanenter Zugriff auf den primaeren CTA ab dem ersten Scroll. | Keine Navigationsleiste, kein Kasten, kein Logo-Lockup - eine 44px hohe Zeile mit 1px-Haarlinie darunter, in Archivo Narrow und IBM Plex Mono, 11px. Links Marke plus Ausgabennummer, in der Mitte der aktuelle Kapitelname (echter Scrollspy, Crossfade 110 ms), rechts der Inhalt-Trigger und der Tonschalter. Ab Scrollposition größer Hero schiebt sich der Adress-Stempel von rechts in die Zeile ein und bleibt bis zum Seitenende. Der Inhalt-Trigger oeffnet per View Transition eine ganzseitige Inhaltsuebersicht: alle zehn Kapitel als Register mit Bodoni-Ziffern und Führungspunkten zu ihrer Seitenzahl. |
| **Titelseite (Hero)** | In einer Sekunde klarmachen: Dokument, nicht Angebot. Adresse und Live-Zustand ohne Umweg erreichbar machen. | Ein einzelner dunkler Bogen auf dem Pressbett mit Passkreuzen, Rasterpapier und Faserstruktur. Blindgepraegte Wortmarke, 7:5-Satzspiegel aus H1 und Live-Einlaufspalte, Adress-Stempel als primaerer CTA. Ausfuehrlich unter heroIdee. |
| **Kapitel I - Der Stand der Dinge** | Live-Status. Die wertvollste Information des Servers wird zum größten Element der Seite statt zur vierten Kachel von links. | Full-bleed Aufmacher ohne Kasten. Die aktuelle Spielerzahl steht als einzelne Bodoni-Ziffer bis 240px im Satzspiegel, darunter klein in Mono die Slotzahl. Dahinter, über die gesamte Sektionsbreite, läuft die 24-Stunden-Zeitreihe als Cyan-Haarlinie direkt im Rasterpapier - kein Chartrahmen, keine Achsenbox, der Hintergrund IST das Diagramm. Vier Randvermerke hängen in der aeusseren Spalte (FPS, Peak heute, Verfügbarkeit 24h, Version als Fussnotenzeile). Ganz hinten steht die gepraegte Kapitelziffer I in 22rem, aria-hidden, mit 0,15-Parallax. NULLFALL: Bei null Spielern weicht die Riesenzahl einem Satz - 'Gerade niemand unterwegs' - und die Kurve wechselt auf 7 Tage, wobei das typische Primetime-Band in Cyan hinterlegt und der Rekord mit Datum daneben gesetzt wird. Aus einer Null wird eine Verabredung. |
| **Kapitel II - Die Hausordnung dieser Welt** | Raten und Regeln zusammenfuehren (heute drei Stellen: Ratenkacheln, Regelliste, FAQ). Beides sind Weltgesetze und gehören auf eine Doppelseite. | Echter zweispaltiger Buchsatz, keine einzige Karte. Links die WELTGESETZE als nummerierte Paragraphen mit hängenden Gold-Ziffern im Rand: Paragraph 1 dreifache Erfahrung, Paragraph 2 zweifache Fangrate, Paragraph 3 zweifache Drop-Rate, Paragraph 4 vier Basen pro Gilde, Paragraph 5 kein PvP, Paragraph 6 keine Todesstrafe, Paragraph 7 keine Wipes. Der erste Paragraph beginnt mit einer drei Zeilen tiefen Gold-Initiale. Rechts die HAUSORDNUNG als kurze, imperativische Zeilen, jede mit einem gezeichneten roten Stempelhaken - kein CSS-Haken, kein Emoji, und ausdruecklich kein grüner Feature-Haken, denn Regeln sind keine Vorteile. Unter beiden Spalten läuft eine Fussleiste in Mono mit Standort, 32 Slots, Backups, Neustart 03:00. Den Abschluss bildet der einzige große Satz der Sektion, in Bodoni: 'Admin-Entscheidungen sind final.' - daneben eine gezeichnete Signatur als SVG. |
| **Kapitel III - Wie du hier reinkommst** | Die eigentliche Handlungsanleitung, deutlich weiter oben als heute, mit dem Stempel direkt im Schritt und einer ehrlichen Antwort auf Passwort und Plattform. | Eine Anleitungstafel im Stil einer technischen Beilage: ein Bogen mit Haarlinienrahmen, drei horizontale Baender, getrennt durch Haarlinien, die Schrittnummern 01/02/03 hängen in Mono im linken Rand ausserhalb des Satzspiegels. Jede Anweisung ist EIN großer Satz in Archivo 500, kein Erklärabsatz. In Band 02 sitzt der Adress-Stempel selbst - das Interface ist die Anleitung. Rechts, als eingelegtes Feld, das QR-FELD: ein clientseitig erzeugter QR-Code der Adresse unter der Zeile 'an den PC schicken'. Zwei Fussnotenmarker: Passwort und Steam-only. |
| **Kapitel IV - Das Archiv** | Statistiktiefe zeigen, ohne den Funnel zu blockieren. Rekorde als Ereignisse erzählen statt als Kacheln. | Eine Registerseite. Oben eine Reihe echter Registerreiter (Spieler / FPS / Verfügbarkeit) und rechts davon der Zeitraumschalter (24 Std / 7 Tage) - beim Wechsel schiebt sich die Platte wie ein Blatt aus dem Karteikasten. Darunter EINE große Datenplatte auf Rasterpapier mit Cyan-Haarlinie; Lücken bleiben Lücken, Crosshair, Serienschluessel im Tooltip, Pfeiltastenbedienung und aria-live werden unveraendert aus dem Bestand uebernommen. Darunter der Rekord als typografisches Ereignis: die Zahl in Bodoni bis 200px in Gold, das Datum in Mono darunter - gesetzt wie eine Schlagzeile. Am Aussenrand hängen drei Kennzahlen mit ihren erklärenden Halbsaetzen (Gesamtspielzeit, eindeutige Namen, In-Game-Tage - 'sind in unserer Welt vergangen'). Abschluss: ein Verweis auf die vollständige Aufstellung unter /statistiken. |
| **Kapitel V - Die Störungsakte** | Der stärkste Vertrauensbeweis eines Community-Servers, heute per Default versteckt und ganz unten. Hier eine eigene Doppelseite - und zwar VOR der Beitrittsentscheidung. | Ein Protokollbogen, vollständig in IBM Plex Mono, ohne jede Karte oder Flaeche. Eine Zeile je Ereignis, Spalten durch Führungspunkte getrennt: Datum, Zeitspanne, Dauer in Minuten, Ursache, rechts der Vermerk BEHOBEN in --vermerk-grün mit gezeichnetem Stempelrahmen. Über der Liste die Verfügbarkeit für 24 Stunden und 7 Tage als zwei Gold-Zahlen. LEERZUSTAND als Hauptzustand gedacht: Gab es keine Ausfälle, zeigt die gesamte Seite nur eine einzige blindgepraegte Zeile - 'Keine Ausfälle in den letzten sieben Tagen.' - und darunter die Prozentzahl in Bodoni 160px, Gold. Leere als Argument. |
| **Kapitel VI - Die Faltkarte** | Das visuell stärkste und unkopierbarste Asset des Servers auf die Startseite holen; Spielernamen zu Einstiegspunkten machen. | Full-bleed, aber als eingelegtes Objekt: die Weltkarte als dunkle Platte, die sichtbar in den Bogen eingelegt ist - zwei diagonale Faltkanten als feine Lichtlinien, an allen vier Ecken gezeichnete Fotoecken statt eines Rahmens. Live-Spielerpositionen sind Cyan-Nadelstiche mit langsamem 4-Sekunden-Pulsieren, Gildenbasen sind kleine Gold-Quadrate - beide beziehen Legende UND Datenpunkt aus demselben Token, was die heutige Farbabweichung zwischen Legende und Karte behebt. Hover oder Fokus auf einem Nadelstich blendet den Namen als Marginalie am Plattenrand ein und verlinkt auf das Profil. Unten ein einziger Aufruf: 'Faltkarte oeffnen' - führt per View Transition nach /karte, wobei die Platte sich sichtbar entfaltet. |
| **Kapitel VII - Das Namensregister** | Social Proof und Retention. Der heutige horizontal scrollende Tabellenblock auf 360px wird ersetzt. | Ein Register mit Führungspunkten, wie ein Inhaltsverzeichnis oder ein Personenregister im Buchanhang. Pro Zeile: Rangziffer in Gold hängend im Rand, Name in Bodoni auf H3-Groesse, dann eine Reihe echter Führungspunkte (leader dots) bis zur rechten Kante, dort die Spielzeit in tabularem Mono. Hover oder Fokus hebt die Zeile 2px an und blendet die Marginalie 'Level xx, zuletzt online ...' ein. Jeder Name ist ein Link auf /spieler/<name> und traegt einen view-transition-name, sodass er beim Klick zur Ueberschrift der Profilseite wird. Mobil entfallen die Punkte, der Wert rutscht rechtsbuendig unter den Namen - kein horizontales Scrollen mehr. |
| **Kapitel VIII - Der Setzkasten** | Die 26 Erfolge als Sammlung zeigen - der stärkste Wiederkehrmechanismus im Bestand, heute versteckt hinter einem Formular. | Hier ist ein Raster die einzig richtige Form, und zwar aus einem konkreten Grund: Eine Sammlung gleichrangiger Objekte IST ein Setzkasten, und jede Hierarchisierung wäre gelogen. Der Unterschied zum Kartenraster ist material: Es gibt keine Karten. Die 26 Erfolge sind Vertiefungen im Bogen - keine Flaeche, kein Rahmen, kein Schatten nach unten, sondern Praegung nach innen. Nicht erreichte sind blindgepraegt (nur Licht und Schatten, keine Farbe), erreichte sind in Goldfolie geschlagen und fangen das Streiflicht. Der Fortschritt läuft als 1px-Cyan-Linie am unteren Rand der Praegung entlang, nicht als Balken in einer Box. Die Glyphen sind 26 selbst gezeichnete Zeichen auf einem 24px-Raster mit einer einzigen Strichstaerke - sie ersetzen die heutigen System-Emoji, die auf Windows und Mac vollkommen verschieden rendern. Darunter ein einziges Namensfeld, das direkt auf das Profil führt (das zweite, doppelte Formular des Bestands entfaellt). |
| **Kapitel IX - Die Rechnung** | Die Frage 'Was kostet das, wo ist der Haken?' ehrlich und ueberraschend beantworten - ohne Preisbox, ohne Tarifvergleich, ohne Spendendruck. | Eine echte Rechnung. Kopfzeile in Mono: RECHNUNG NR. 412, an: dich, Zeitraum: solange du magst. Dann Positionen mit Führungspunkten - Zugang 0,00 EUR, Slots und Raten 0,00 EUR, Vorteile gegen Geld: nicht vorgesehen, Werbung: keine, Tracking und Cookies: keine, Zusatz-Account: keiner. Doppelte Haarlinie, dann SUMME 0,00 in Bodoni 160px, Gold. Quer über die gesamte Rechnung, in Konturschrift, --stempel-rot, minus 8 Grad gedreht: UNBEZAHLT. Darunter, in normalem Fliesstext und in der ersten Person, die einzige Stelle der Seite, an der ein Mensch spricht: wer das bezahlt, warum es ein privates Hobby ist, und die freiwillige Kaffee-Einladung als gezeichnetes Gold-Siegel - ohne Extras, ohne Gegenleistung, ohne Rangliste. Abschluss: die gezeichnete Signatur. |
| **Kolophon und Einladungskarte** | Autorschaft herstellen (heute steht kein Mensch auf der oeffentlichen Seite) und den Discord-Beitritt als Einladung statt als Werbebanner formulieren. | Ein schmaler, zentrierter Satzspiegel von maximal 46 Zeichen Breite - der Kolophon am Ende eines Buches: in welchen Schriften gesetzt, von wem betrieben, auf welcher Hardware, seit welcher Ausgabe, ohne Mods, ohne Wipes, ohne Werbung. Darauf liegt, um 0,8 Grad gedreht und mit eigenem Schlagschatten, eine kleinere Karte in --papier-falz: die EINLADUNG, mit goldgepraegter Randlinie, dem Discord-Link in Mono und einer einzigen konkreten Zeile darunter. Die heutigen weißen Wolken-Ellipsen entfallen ersatzlos. |
| **Fussnotenapparat und Fuss** | Alle unbequemen Wahrheiten einsammeln, rechtliche Pflichtangaben lesbar halten, den Besucherzaehler in die Welt uebersetzen. | Der Apparat: durchnummerierte Fussnoten in Mono 11px, jede mit dem Rückverweis auf ihre Textstelle. Fussnote 1 klaert das Passwort, Fussnote 2 die Steam-only-Beschraenkung, weitere klaeren Datenquellen und Aktualisierungsintervalle. Darunter eine Haarlinie und die AUFLAGE - der cookiefreie Besucherzaehler, umbenannt in 'Auflage dieser Ausgabe: n Abrufe', ohne Emoji. Rechtliche Links als reine Textzeile, der Pocketpair-Disclaimer in --tinte-matt bei 8,14:1 statt in 10px-Grau. Ganz rechts, ein letztes Mal, der Adress-Stempel. |

## 7 · Scroll-Journey

1. 0 vh - RUHE. Der Bogen liegt still. Das Streiflicht ist einmal gelaufen und bleibt als statischer Gradient stehen. Einzige Bewegung: der Einlauf rechts, in dem alle 30 Sekunden eine Zeile nachrutscht, und die Papierstaub-Partikel im Pressbett. Dramaturgisch: Ankunft, kein Druck, keine Aufforderung.
2. 0-0,6 vh - DAS BLATT WIRD SCHWERER. Beim ersten Scrollen wandert die Wortmarke mit Faktor 0,25 nach oben und ihre Praegungstiefe nimmt ab (die Lichtkante wird schwächer) - das Papier legt sich flach. Gleichzeitig faehrt der Adress-Stempel aus dem Hero heraus und rastet in den Kolumnentitel ein: eine 300-ms-FLIP-Bewegung, kein Ein- und Ausblenden. Der CTA geht nie verloren.
3. 0,9 vh - DER SCHNITT. Die Kante des nächsten Bogens erreicht die Oberkante des Viewports. Fuer 120 ms verdunkelt sich der Zwischenraum auf --papier-nacht, die Kapitelziffer I schiebt sich als Blindpraegung von unten ins Bild, und der Kolumnentitel wechselt seinen Mittelteil auf 'KAP. I - DER STAND DER DINGE'. Dramaturgisch: Seitenwechsel, nicht Sektionswechsel.
4. 1,2 vh - DER SCHLAG. Die Riesenzahl der aktuellen Spielerzahl zaehlt in 900 ms einmal hoch, während hinter ihr die 24-Stunden-Rasterkurve scrub-gebunden von links nach rechts gezeichnet wird. Die vier Randvermerke laufen mit je 90 ms Versatz von aussen ein. Höhepunkt eins: 'Hier laufen echte Zahlen.'
5. 1,9 vh - DAS LESEN BEGINNT. Kapitel II legt den zweispaltigen Satzspiegel an. Das Tempo fällt bewusst ab: keine großen Bewegungen mehr, nur die Gold-Initiale, die sich einmal praegt, und die Paragraphenziffern, die zeilenweise nachziehen. Der Besucher wechselt vom Schauen ins Lesen - das ist der Moment, in dem die Seite ihre Glaubwuerdigkeit aufbaut.
6. 2,7 vh - DIE HAND WIRD GEFUEHRT. Kapitel III. Die drei Baender der Anleitungstafel klappen nacheinander auf (Haarlinie zeichnet sich, dann fällt der Satz ein). In Band 02 pulsiert der Stempel EINMAL sehr dezent (scale 1 auf 1,015 und zurück, 600 ms) - die einzige Stelle der Seite, an der ein CTA sich selbst meldet. Rechts erscheint das QR-Feld.
7. 3,4 vh - DIE PRUEFUNG. Kapitel IV, das Archiv. Registerreiter fahren ein, die Datenplatte schiebt sich von rechts unter sie. Beim Erreichen von 60 Prozent Sektionshoehe setzt sich der Rekord in Bodoni 200px - er wird nicht eingeblendet, sondern maskiert von unten aufgedeckt, wie eine Schlagzeile, die aus der Presse kommt.
8. 4,1 vh - DIE BEWEISLAST. Kapitel V, die Störungsakte. Hier passiert absichtlich fast nichts: Die Zeilen erscheinen ohne Versatz, ohne Stagger, ohne Bewegung - nur Text auf Papier. Die Ruhe ist die Aussage. Einzige Ausnahme: Die Verfügbarkeitszahl praegt sich in Gold. Höhepunkt zwei, und der leiseste der Seite.
9. 4,8 vh - DIE WELT. Kapitel VI geht full-bleed. Die Faltkarte faehrt aus dem Satzspiegel heraus auf volle Breite, während die beiden Faltkanten als Lichtlinien über sie hinweglaufen. Die Cyan-Nadelstiche zünden nacheinander in zufaelliger Reihenfolge über 700 ms. Der Besucher sieht zum ersten Mal andere Menschen. Höhepunkt drei.
10. 5,6 vh - DIE NAMEN. Kapitel VII. Die Führungspunkte des Registers zeichnen sich zeilenweise von links nach rechts, 40 ms Versatz. Anschliessend Kapitel VIII, der Setzkasten: Die 26 Praegungen erscheinen nicht, sie werden belichtet - die Lichtkante wandert diagonal über das Feld, 900 ms, sodass Gold und Blindpraegung nacheinander sichtbar werden.
11. 6,5 vh - DIE FRAGE. Kapitel IX, die Rechnung. Die Positionen tickern zeilenweise ein wie auf einem Kassendrucker (je 55 ms). Dann die doppelte Haarlinie, dann die Summe in Gold. Erst zwei Sekunden später, mit einer eigenen 240-ms-Bewegung und einem 2-Grad-Überschwinger, schlaegt der rote Quervermerk UNBEZAHLT auf. Das ist die Pointe der Seite.
12. 7,2 vh - DER ABSCHIED. Kolophon: Das Tempo fällt auf null, der Satzspiegel wird schmal, das Streiflicht dreht sich langsam zurück in die Ausgangsstellung wie zu Beginn - die Seite schließt den Kreis. Die Einladungskarte legt sich mit einem sehr weichen Schatten auf den Kolophon. Ganz unten der Apparat, die Auflage, der Disclaimer, der Stempel.

## 8 · Animationen

- DER ANDRUCK (Wortmarke wird gepraegt, einmalig beim Laden). Technik: WAAPI auf einer per @property registrierten Custom Property --praege-tiefe (syntax '<number>'), die gleichzeitig text-shadow-Offset und -Blur der Licht- und Schattenkante steuert; parallel scale 1.015 auf 1. 620 ms, cubic-bezier(0.16, 1, 0.3, 1). Kein GSAP nötig. RUHIGE VARIANTE: Praegung sofort auf Endtiefe, nur opacity 0 auf 1 in 200 ms.
- DER STREIFLICHT-ZUG (kaltes Licht faehrt einmal über den Bogen). Technik: ein absolut positioniertes Pseudoelement mit linear-gradient(105deg, transparent 35%, rgba(232,238,244,.09) 50%, transparent 65%), animiert über background-position via WAAPI, 1400 ms, cubic-bezier(0.25,0.46,0.45,0.94); danach bleibt ein statischer Restgradient stehen. Im Kolophon läuft dieselbe Animation rückwaerts. RUHIGE VARIANTE: nur der statische Restgradient, keine Fahrt.
- DER STEMPEL (Adresse kopieren - die Kernkonversion). Technik: WAAPI-Keyframes in zwei Phasen. Ab: rotate(-1.5deg) scale(1) - Down: rotate(-0.9deg) scale(0.94) translateY(2px) in 90 ms cubic-bezier(0.4,0,1,1) - Up: zurück in 260 ms cubic-bezier(0.34,1.4,0.64,1). Zeitgleich wird ein Abdruck-Element eingeblendet: opacity 0 auf 0.26, filter blur(2px) auf blur(0), 320 ms; Rotation und Tintendichte werden aus einem Seed (Date.now() modulo) gezogen, sodass jeder Abdruck leicht anders ist. Der Abdruck bleibt für die Sitzung stehen. RUHIGE VARIANTE: kein Druck, kein Blur - Abdruck erscheint in 150 ms per opacity, Label wechselt auf 'kopiert'.
- DIE RASTERKURVE (Zeitreihe zeichnet sich). Technik: SVG-Pfad mit stroke-dasharray gleich Pfadlaenge und stroke-dashoffset scrub-gebunden; im GSAP-Ausbau ScrollTrigger mit scrub: 0.6, in der abhaengigkeitsfreien Basis CSS scroll-driven animation mit animation-timeline: view() und animation-range: entry 20% cover 55%. Die Flaeche darunter oeffnet parallel per clip-path: inset(0 100% 0 0) auf inset(0 0 0 0). Lücken (null gleich offline) bleiben Lücken - der Pfad wird bewusst nicht interpoliert. RUHIGE VARIANTE: dashoffset 0, clip-path offen, Kurve steht sofort vollständig.
- DER ZAEHLSCHLAG (Riesenzahl zaehlt hoch). Technik: WAAPI über eine @property-Number, deren Wert per CSS counter-reset und content ausgegeben wird - alternativ GSAP to() auf einem Proxy mit snap: 1. 900 ms, cubic-bezier(0.22,1,0.36,1), nur beim ersten Sichtbarwerden (IntersectionObserver, once). font-variant-numeric: tabular-nums verhindert Breitensprung. Zwingend: aria-live ist AUS, der Endwert steht bereits im DOM, damit Screenreader nicht mitzaehlen. RUHIGE VARIANTE: Endwert wird direkt gesetzt.
- MARGINALIEN-EINLAUF (Randnotizen erscheinen beim Lesen). Technik: reine CSS scroll-driven animations, animation-timeline: view(), animation-range: entry 15% cover 35%, translateX(14px) auf 0 plus opacity 0 auf 1, 420 ms aequivalent, cubic-bezier(0.22,1,0.36,1). Kein JavaScript, kein IntersectionObserver, kein Layout-Thrashing. RUHIGE VARIANTE: animation-timeline wird im Media-Block auf none gesetzt, Notizen stehen statisch.
- DER PAPIERSTAUB (Partikel). Technik: ein einziges Canvas 2D im Pressbett hinter dem Bogen, maximal 40 Partikel a 1px in rgba(232,238,244,.28), Drift auf einem vorberechneten Sinus-Rauschfeld, requestAnimationFrame mit auf 30 fps gedrosseltem Delta. Start erst nach dem Load-Event, Pause per IntersectionObserver sobald ausserhalb des Viewports und per visibilitychange. Nur im Hero und im Kolophon. RUHIGE VARIANTE: Canvas wird gar nicht initialisiert - die Datei wird bei prefers-reduced-motion: reduce nicht einmal geladen.
- DIE FALTKARTE (Kartenplatte entfaltet sich nach /karte). Technik: Cross-Document View Transitions - @view-transition { navigation: auto } plus view-transition-name: faltkarte auf der Platte hier und auf der Kartenflaeche dort; zusätzlich zwei Haelften mit rotateY(-14deg) beziehungsweise rotateY(14deg) auf 0 und einem synchron ausblendenden linear-gradient als Falzschatten. 720 ms, cubic-bezier(0.65,0,0.35,1). Fallback ohne View-Transition-Unterstuetzung: normale Navigation, keine Funktionseinbusse. RUHIGE VARIANTE: @media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none } } - harter Schnitt.
- PRAEGUNGS-PARALLAX (Kapitelziffer im Hintergrund). Technik: CSS scroll-driven, animation-timeline: scroll(root block), translateY von -40px auf 40px über die Sektionshoehe (effektiver Faktor circa 0.15). Die Ziffer ist ein aria-hidden span, damit Screenreader nicht 'VIII' vorgelesen bekommen. Maximaler Versatz bewusst auf 80px begrenzt (Motion-Sickness). RUHIGE VARIANTE: timeline none, Ziffer steht mittig fest.
- DER FUSSNOTENSPRUNG. Technik: html { scroll-padding-top: calc(var(--kolumnentitel-h) + 12px) } behebt zugleich den heutigen Ankersprung-Fehler aller acht Sektionslinks. Beim Klick auf einen Marker springt der Fokus per JS auf die Fussnote (tabindex=-1) und diese erhaelt eine WAAPI-Animation: background-color von --cyan-tief bei 24 Prozent auf transparent, 1200 ms ease-out. RUHIGE VARIANTE: kein Fade - die Fussnote behaelt für 2,5 s eine statische 2px-Cyan-Randlinie links.
- DER SIEGELBRUCH (Kaffee-Support). Technik: SVG-Medaillon, dessen Kontur per stroke-dashoffset in 400 ms cubic-bezier(0.33,1,0.68,1) bei Hover oder Fokus gezeichnet wird; beim Aktivieren teilen sich zwei path-Haelften um je 6px in entgegengesetzter Richtung und geben den Link frei. Das Ziel ist immer per Tastatur erreichbar, die Animation ist reine Zugabe. RUHIGE VARIANTE: Kontur ist dauerhaft gezeichnet, kein Bruch, Link direkt sichtbar.
- REGISTERWECHSEL IM ARCHIV. Technik: Same-Document View Transition (document.startViewTransition) beim Umschalten von Metrik oder Zeitraum; die Datenplatte erhaelt view-transition-name: platte und gleitet mit 220 ms um 18px seitlich, während der Reiter seine Goldkante uebernimmt. Ohne API-Unterstuetzung wird schlicht neu gerendert. Wichtig: Die bestehende aria-live-Ansage des Charts feuert unabhaengig von der Transition. RUHIGE VARIANTE: startViewTransition wird uebersprungen, direkter Austausch.

## 9 · Bildsprache

Es gibt genau drei zugelassene Bildquellen - und generiertes Fantasy-Artwork ist keine davon.

ERSTENS: DATENBILDER. Die Rasterkurve, die Faltkarte, die Störungsakte und der Setzkasten sind die eigentlichen Bilder der Seite. Sie entstehen zur Laufzeit aus /api/stats und /api/map. Ein Bild, das aus den eigenen Daten gezeichnet wird, kann kein anderer Server kopieren - genau das ist heute das größte ungenutzte Asset.

ZWEITENS: GEZEICHNETE LINIENGRAFIK, im Duktus eines Kupferstichs oder einer Radierung: reine Konturen in --cyan-tinte oder --gold-praegung auf Papier, EINE Strichstaerke (1,25px auf 24px-Raster), keine Flaechen, keine Schatten, keine Fuellungen. Dazu gehören die 26 Erfolgsglyphen, die Stempelrahmen, die Passkreuze, das Siegel, die Signatur und der ratlose Spaeher der 404-Seite.

DRITTENS: ECHTE SCREENSHOTS AUS DER EIGENEN WELT - und nur diese. Behandlung verbindlich: Saettigung auf 35 Prozent, Schwarzpunkt auf --papier-bogen angehoben (nie auf 0), Kaltverschiebung von plus 8 in den Schatten, 1px-Innenkante in --tinte-blass, Fotoecken statt Rahmen. PFLICHT: Jeder Screenshot traegt eine Mono-Bildunterschrift mit Quelle und Datum ('Basis von <Gilde>, 12.07.2026'). Ein Bild ohne Beleg hat in dieser Welt keinen Platz.

LICHTFUEHRUNG: EIN einziges Streiflicht, von oben links, Einfallswinkel 15 Grad, 6500 Kelvin. Jede Praegung, jede Kante, jeder Schlagschatten auf der gesamten Seite gehorcht exakt dieser Richtung - Highlight oben links, Schatten unten rechts. Kein zweites Licht, keine farbige Gegenlichtquelle, kein Glow.

PERSPEKTIVE: strikt frontal und orthogonal auf die Papierflaeche. Einzige Ausnahme: die Faltkarte darf bis 6 Grad kippen.

DO: Rasterpapier durchscheinen lassen. Haarlinien statt Rahmen. Perforationsloecher. Passkreuze in den Bogenecken. Echte Bildunterschriften. Blindpraegung, wo Information redundant ist.

DONT - ausnahmslos: kein Sepia, kein Braun, kein Beige. Keine Kaffeeflecken, keine gerissenen Kanten, keine Vintage-Vignette, kein Klebeband auf mehr als einem einzigen Element. Keine Handschrift-Schriftarten (die einzige handschriftliche Form der Seite ist die gezeichnete Signatur des Betreibers). Kein Bokeh, keine Lens Flares, kein Glassmorphism. Keine generierten Landschaften - hero.webp und hero-alt.webp entfallen ersatzlos. Und rechtlich zwingend: KEINE nachgezeichneten Pals oder Palworld-Figuren, da das geschuetztes Material von Pocketpair ist und der eigene Footer die Distanz ausdruecklich erklärt.

## 10 · Interaktionen

- STEMPELN STATT KOPIEREN. Klick oder Enter auf dem Adress-Stempel kopiert die Serveradresse und hinterlaesst einen bleibenden Abdruck auf dem Bogen. Fallback zwingend: schlaegt navigator.clipboard fehl, wird der Adresstext per Selection API markiert und die Marginalie wechselt auf 'markiert - jetzt Strg+C'. Zweck: Die wichtigste Handlung der Seite darf niemals stumm scheitern, wie sie es heute tut.
- KOLUMNENTITEL ALS ORTSANZEIGE. Beim Scrollen wechselt der Mittelteil der Kopfzeile auf den aktuellen Kapitelnamen (Crossfade 110 ms, IntersectionObserver mit rootMargin -45% 0px -50%). Zweck: Ersetzt den fehlenden Scrollspy und macht eine Neun-Punkte-Navigation ueberfluessig - auf einer sieben Bildschirmhoehen langen Seite weiß man sonst nie, wo man ist.
- MARGINALIE AUF ANFRAGE. Hover oder Tastaturfokus auf einer Registerzeile zieht die Führungspunkte um 8px zusammen und schiebt die Zusatzinformation (Level, zuletzt online) von rechts in den Aussenrand. Zweck: Fünf Datenspalten in einer Zeile unterbringen, ohne eine Tabelle zu bauen, die mobil seitwaerts scrollt.
- FUSSNOTE OHNE SPRUNG. Hover oder Fokus auf einem Fussnotenmarker zeigt den Fussnotentext als schwebende Marginalie am nächstgelegenen Rand; ein Klick springt zusätzlich in den Apparat. Zweck: Ehrlichkeit ohne Leseunterbrechung - der Besucher erfaehrt die Steam-only-Einschraenkung genau dort, wo sie ihn betrifft, nicht 3000 Pixel weiter unten.
- NADELSTICH-NAVIGATION AUF DER KARTE. Spielerpunkte wachsen bei Hover oder Fokus von 3 auf 5px, ihr Name erscheint als Randnotiz, Enter führt auf das Profil. Erreichbar per Tastatur über Roving-Tabindex mit Pfeiltasten. Zweck: Die Kartenmarker sind heute totes SVG-Text - hier werden sie zum Einstieg in die Profile und schließen die Retention-Schleife.
- REGISTER ZIEHEN. Metrik und Zeitraum im Archiv werden als echte Karteireiter umgeschaltet; die Datenplatte gleitet dabei wie ein herausgezogenes Blatt. Zweck: Vier Datenreihen in EINER Form zeigen statt in vier untereinanderliegenden Rastern.
- QR-FELD VERGROESSERN. Tap oder Hover auf dem QR-Feld oeffnet es auf 260px als Overlay mit der Adresse als Klartext darunter. Zweck: Palworld wird am PC gespielt, die Seite oft am Handy gelesen - ohne diese Bruecke kopiert der Besucher die Adresse in die falsche Zwischenablage.
- TONSCHALTER IM KOLUMNENTITEL. Ein einzelnes Mono-Zeichen schaltet den Presse-Ton (ein Schlag beim Kapitelwechsel, minus 22 dB). Standard AUS, Zustand in localStorage, Audiodatei wird erst nach Aktivierung geladen. Zweck: Atmosphaere anbieten, ohne sie jemandem aufzudraengen - und ohne 14 KB für die 95 Prozent zu laden, die nie einschalten.
- BELICHTUNG FOLGT DEM ZEIGER. Auf Geraeten mit pointer: fine wandert ein sehr weiches, 1px-scharfes Lichtfeld mit 40 Prozent Verzoegerung hinter dem Cursor über den Bogen und veraendert dabei minimal den Winkel der Praegungshighlights. Zweck: Das Papier soll belichtet wirken, nicht bedruckt - das ist der einzige Effekt, der Tiefe erzeugt, ohne dass irgendetwas schwebt.
- PRAEGUNG FAENGT LICHT. Hover oder Fokus auf einem Erfolgsmedaillon dreht dessen Lichtkante um bis zu 20 Grad in Richtung des Zeigers und hebt den Fortschrittsstrich auf volle Deckkraft. Zweck: Eine Sammlung muss sich anfassbar anfuehlen - das ist der Unterschied zwischen einem Abzeichen und einer Praegung.

## 11 · Wireframe

```
KOLUMNENTITEL (sticky, 44px, 1px Haarlinie unten, kein Kasten)
+------------------------------------------------------------------------+
| PALHEIM / CHRONIK   AUSGABE 412 - 25.07.26   KAP. I   [INHALT] [TON O] |
+------------------------------------------------------------------------+
  links: Marke+Ausgabe | mitte: Kapitelname (Scrollspy, Crossfade 110ms)
  rechts: Inhalt-Overlay + Tonschalter. Ab Scroll > Hero schiebt sich der
  ADRESS-STEMPEL von rechts in die Zeile und bleibt bis zum Seitenende.

TITELSEITE  (100dvh, Pressbett dunkel, darin EIN Bogen mit sichtbarer Kante)
+------------------------------------------------------------------------+
|  o   <- Passkreuze in allen vier Ecken der Bogenflaeche         o      |
|     PALHEIM / CHRONIK  -  AUSGABE 412  -  25.07.2026  -  SEITE 1       |
|     ------------------------------------------------------------       |
|                                                                        |
|        P A L H E I M            Bodoni 900, bis 120px, blindgepraegt   |
|                                 Papierfarbe, Licht von oben links 15   |
|                                                                        |
|     +----------------------------------+  +-------------------------+  |
|     | Wir führen Buch über eine      |  | E I N L A U F           |  |
|     | Welt, die nicht zurückgesetzt   |  | 21:14  17 online        |  |
|     | wird.                            |  | 20:02  FPS 58           |  |
|     |                                  |  | 03:00  Neustart, ok     |  |
|     | Deutscher PvE-Server. Eigene     |  | 24.07. keine Ausfälle  |  |
|     | Hardware. Seit Ausgabe 1.        |  | 22.07. Rekord 24        |  |
|     +----------------------------------+  +-------------------------+  |
|                                             live aus /api/status+stats |
|                                                                        |
|     [[ STEMPEL ]]  pve.palheim.de:8211            Discord beitreten ->  |
|      -1.5 Grad, Tinte, primaerer CTA              sekundaer, Textlink   |
|                                                                        |
|  o                                                                  o   |
+------------------------------------------------------------------------+
|      (Kante des nächsten Bogens schaut 24px hervor = Scroll-Signal)    |
+------------------------------------------------------------------------+

KAPITEL I - DER STAND DER DINGE          (Aufmacher, Rasterkurve full-bleed)
+------------------------------------------------------------------------+
| I                     ...Rasterkurve 24h, Cyan-Haarlinie, Flaeche 6%... |
| gepraegte                                                               |
| Kapitel-                    1 7                     Randvermerke:       |
| ziffer im            ------------------             --------------      |
| Hintergrund             / 32 Slots                  FPS       58        |
| (aria-hidden)                                       Peak heute 21       |
|                      Bodoni 900, bis 240px          Verfueg. 24h 100%   |
|                      tabular, zaehlt einmal hoch    Version    v0.6.x   |
|                                                                         |
| Nullfall: Zahl weicht dem Satz "Gerade niemand unterwegs" + Primetime-   |
| Band in der 7d-Kurve + "Rekord 24 am 22.07." -> Einladung statt Null.    |
+------------------------------------------------------------------------+

KAPITEL II - DIE HAUSORDNUNG DIESER WELT      (Satzspiegel, zwei Kolumnen)
+------------------------------------------------------------------------+
| II    WELTGESETZE                    |  HAUSORDNUNG                     |
|                                      |                                  |
|  S1  |D|reimal Erfahrung. Leveln     |  Respektvoller Umgang.      [x]  |
|      geht schneller, ohne dass der   |  Kein Griefing.             [x]  |
|      Fortschritt verschwindet.       |  Keine Cheats, kein Duping. [x]  |
|      (Initiale, 3 Zeilen tief, Gold) |  Spots + Bosse frei lassen. [x]  |
|  S2  Zweifache Fangrate.             |  Basen: 30 Tage inaktiv =        |
|  S3  Zweifache Drop-Rate.            |  können entfernt werden.   [x]  |
|  S4  Vier Basen pro Gilde.           |                                  |
|  S5  Kein PvP. Kein Griefing.        |  ------------------------------  |
|  S6  Keine Todesstrafe.              |  Admin-Entscheidungen sind       |
|  S7  Keine Wipes. Nie geplant.       |  final.        [Signatur, SVG]   |
|      ------------------------------  |                                  |
|      Standort DE / 32 Slots /        |  [x] = roter Stempelhaken,       |
|      Backups mehrmals täglich /     |      gezeichnet, kein Emoji      |
|      Neustart täglich 03:00 Uhr     |                                  |
+------------------------------------------------------------------------+

KAPITEL III - WIE DU HIER REINKOMMST                    (Anleitungstafel)
+------------------------------------------------------------------------+
| III   Drei Baender, getrennt durch Haarlinien. Nummern hängen im Rand. |
|                                                                        |
| 01 |  Palworld über Steam starten.                    | +----------+  |
|    |  Multiplayer beitreten wählen.                   | |  QR      |  |
| ---+---------------------------------------------------| |  FELD    |  |
| 02 |  Adresse eintragen:                               | |          |  |
|    |  [[ STEMPEL ]] pve.palheim.de:8211                | +----------+  |
| ---+---------------------------------------------------|  "an den PC   |
| 03 |  Beitreten. Kein Passwort nötig.[1]              |   schicken"   |
|    |  Kein Zusatz-Account.[2]                          |               |
+------------------------------------------------------------------------+
   [1][2] = Fussnotenmarker, Hover zeigt Marginalie, Klick springt unten

KAPITEL IV - DAS ARCHIV                            (Registerseite, Tabs)
+------------------------------------------------------------------------+
| IV  |SPIELER|  FPS  | VERFUEGBARKEIT |            24 STD  |  7 TAGE     |
|     +-------+-------+----------------+            ------------------    |
|     |                                                                |  |
|     |   große Platte auf Rasterpapier, Cyan-Haarlinie, Lücken       |  |
|     |   bleiben Lücken (offline), Crosshair + Serienschluessel,      |  |
|     |   Pfeiltasten-Navigation + aria-live bleiben erhalten           |  |
|     +----------------------------------------------------------------+  |
|                                                                        |
|        R E K O R D   2 4      Bodoni 200px, Gold, Datum darunter mono  |
|        am 22.07.2026, 21:40 Uhr                                        |
|                                                                        |
|  im Rand hängend:  1.284 Spielstunden / 187 Namen / 612 In-Game-Tage  |
|                     "sind in unserer Welt vergangen"                   |
|                     -> vollständiges Archiv auf /statistiken          |
+------------------------------------------------------------------------+

KAPITEL V - DIE STOERUNGSAKTE                          (Protokollbogen)
+------------------------------------------------------------------------+
| V   Wenn es Ausfälle gab - Ledger, mono, eine Zeile je Ereignis:      |
|                                                                        |
|     19.07.2026  02:58 - 03:04     6 min    Neustart       [BEHOBEN]    |
|     14.07.2026  11:20 - 11:32    12 min    Netz           [BEHOBEN]    |
|                                                                        |
|     Wenn es keine gab - eine einzige geblindpraegte Zeile:             |
|                                                                        |
|         Keine Ausfälle in den letzten sieben Tagen.                   |
|                              9 9 , 9 %      Gold, Bodoni, 160px        |
+------------------------------------------------------------------------+

KAPITEL VI - DIE FALTKARTE                    (full-bleed, eingelegt)
+------------------------------------------------------------------------+
|VI  [                                                                ]  |
|    [   Weltkarte dunkel, zwei sichtbare Faltkanten (Lichtlinien),   ]  |
|    [   Spieler = Cyan-Nadelstiche (pulsieren 4s), Basen = Gold-     ]  |
|    [   Quadrate, EIN Farbtoken für Legende UND Datenpunkt          ]  |
|    [                                                                ]  |
|    [   Fotoecken an allen vier Ecken statt Rahmen                   ]  |
|                                                                        |
|    Hover/Focus auf Nadelstich -> Name als Marginalie -> /spieler/<x>   |
|    [ Faltkarte oeffnen ]  -> /karte per View Transition (entfaltet)    |
+------------------------------------------------------------------------+

KAPITEL VII - DAS NAMENSREGISTER              (Register mit Führungspunkten)
+------------------------------------------------------------------------+
| VII                                                                    |
|  1   Sturmfeder ................................. 214 h    Lvl 52      |
|  2   Kiesel .....................................  98 h    Lvl 47      |
|  3   Brombeer ...................................  91 h    Lvl 44      |
|  ...                                                                   |
|  Rangziffern hängen im Rand in Gold. Namen = Bodoni, Links auf        |
|  /spieler/<name>. Hover: Zeile hebt sich 2px, Marginalie zeigt         |
|  "zuletzt online". Mobil: Punkte entfallen, Wert rechtsbuendig,        |
|  KEIN horizontales Scrollen.                                           |
+------------------------------------------------------------------------+

KAPITEL VIII - DER SETZKASTEN                        (26 Praegungen)
+------------------------------------------------------------------------+
|VIII  [o] [o] [o] [o] [o] [o] [o]     erreicht = Goldfolie, geprae-     |
|      [o] [o] [o] [o] [o] [o] [o]     gt, faengt das Streiflicht        |
|      [o] [o] [o] [o] [o] [o] [o]     offen  = Blindpraegung, nur       |
|      [o] [o] [o] [o] [o]             Licht und Schatten                |
|                                                                        |
|      26 gezeichnete Glyphen auf 24px-Raster, EINE Strichstaerke,       |
|      keine Emoji. Kein Rahmen, keine Flaeche, kein Schatten unten -    |
|      es sind Vertiefungen im Bogen, keine Karten.                      |
|      Namensfeld: [ dein Name ] -> /spieler/<name>                      |
+------------------------------------------------------------------------+

KAPITEL IX - DIE RECHNUNG                    (Vertrauensmoment, kein Preis)
+------------------------------------------------------------------------+
| IX   RECHNUNG NR. 412        an: dich        Zeitraum: solange du magst|
|      ----------------------------------------------------------------  |
|      Zugang zum Server ....................................... 0,00 EUR|
|      Slots, Raten, Basen ..................................... 0,00 EUR|
|      Vorteile gegen Geld ......................... nicht vorgesehen    |
|      Werbung ..................................... keine               |
|      Tracking, Cookies ........................... keine               |
|      Zusatz-Account .............................. keiner[2]           |
|      ----------------------------------------------------------------  |
|      SUMME                        0 , 0 0    Bodoni 160px, Gold        |
|                                                                        |
|      quer darueber, rot, Konturschrift:  U N B E Z A H L T             |
|                                                                        |
|      Wer das bezahlt: der Admin. Warum: privates Hobby, eigene         |
|      Hardware. Wenn du magst, [ SIEGEL ] Kaffee - freiwillig,          |
|      ohne Extras.                          [Signatur, SVG]             |
+------------------------------------------------------------------------+

KOLOPHON + EINLADUNGSKARTE                        (schmaler Satzspiegel)
+------------------------------------------------------------------------+
|      Gesetzt in Bodoni Moda und Archivo. Betrieben von <Name>, auf     |
|      eigener Hardware in Deutschland, seit Ausgabe 1. Ohne Mods,       |
|      ohne Wipes, ohne Werbung.                                         |
|                                                                        |
|            +--------------------------------------------+              |
|            |  E I N L A D U N G          -0.8 Grad      |              |
|            |  discord.gg/b8WYXN3Q3e                     |              |
|            |  Ankündigungen, Support, Leute zum Zocken |              |
|            +--------------------------------------------+              |
+------------------------------------------------------------------------+

FUSSNOTENAPPARAT + FUSS
+------------------------------------------------------------------------+
| [1] Sollte je ein Passwort aktiv sein, steht es im Discord. Stand jetzt:|
|     keins.                                                             |
| [2] Palworld-Dedicated-Server sind Steam-only. Über Xbox oder Game     |
|     Pass ist kein Beitritt möglich.                                   |
| ---------------------------------------------------------------------- |
| Auflage dieser Ausgabe: 12.480 Abrufe                                  |
| Impressum / Datenschutz / Karte / Statistiken / llms.txt               |
| PalHeim ist ein inoffizieller Community-Server. Palworld ist eine       |
| Marke von Pocketpair, Inc.                    [[ STEMPEL ]] Adresse    |
+------------------------------------------------------------------------+
```

## 12 · Moodboard

REFERENZEN, nicht als Stilkopie, sondern als Haltung: das NYCTA Graphics Standards Manual von Maßimo Vignelli - Raster, Strenge, null Dekoration. Karl Gerstners Programme entwerfen. Die Faksimile-Ausgaben der Apollo Flight Plans: Mono-Satz, hängende Zeilennummern, alles ist Protokoll. Die Rückseite der Voyager-Goldplatte als Diagramm, das erklärt, ohne zu illustrieren. Emigre- und Fuse-Editorial aus den Neunzigern für die harte Kante. Und aus dem Spielesegment: die gedruckten Feldhandbuch-Beilagen und Loredokumente, wie sie Escape from Tarkov und die Grimoire-Karten von Bungie ausgemacht haben - aber leiser, kälter und ohne Fantasy-Verzierung.

MATERIALIEN: schwarzer, ungestrichener Karton (Colorplan Ebony, Gmund Colors Matt 82) mit sichtbarer Faser unter Streiflicht. Blindpraegung, bei der die Schrift nur durch Schattenkante existiert. Kaltfolienpraegung in mattem Gold - nie glaenzend, nie mit Reflexverlauf. Zeichenfolie und Millimeterpapier. Passkreuze, Beschnittmarken, Perforation.

LICHT: eine einzige harte Quelle von oben links, 15 Grad, 6500 Kelvin, wie bei einer Reprokamera. Alle Spitzlichter sitzen auf Praegekanten, nie auf Flaechen. Ein leichter kalter Nebel im Hintergrundraum, damit das Pressbett Tiefe bekommt.

AUSDRUECKLICH NICHT IM MOODBOARD: Kerzenlicht, Pergament, Landkarten mit gerissenen Raendern, Kaffeeflecken, Lederbaende, Wachssiegel in Rot, Federkiele, Schnitzereien, Steampunk-Messing, Instagram-Vintage. Es ist eine Druckerei, keine Schatzkammer.

## 13 · Unterseiten

- /karte - DIE FALTKARTE, GANZSEITIG. Kolumnentitel liest 'KAPITEL VI - DIE FALTKARTE'. Der Zugang von der Startseite läuft als Cross-Document View Transition, bei der sich die eingelegte Platte auf Vollbild entfaltet. Die Kartenflaeche fuellt den Viewport, Legende und Filter liegen als Marginalien im linken Rand statt in einer Kartenbox. Behoben werden dabei drei reale Fehler: touch-action: none wird auf die Plattenflaeche begrenzt statt auf den ganzen Block gelegt (die Seite laesst sich mobil wieder scrollen), es kommt Pinch-Zoom per Pointer-Events dazu, und Basen benutzen in Legende UND Datenpunkt dasselbe Farbtoken. Am unteren Rand liegt eine persistente Leiste mit dem Adress-Stempel - die Seite ist heute eine Sackgasse ohne einen einzigen CTA.
- /statistiken - NEU, DAS VOLLSTAENDIGE ARCHIV. Nimmt die Tiefe auf, die heute die Startseite blockiert (rund 2.000 Pixel zwischen Status und Anleitung). Alle Registerreiter, beide Zeitraeume, Spieler- und FPS-Reihe, die vollständige Verfügbarkeitsrechnung und die komplette Störungschronik statt nur der letzten acht Eintraege. Aufgebaut als Bogenfolge mit Seitenzahlen; die Startseite behaelt nur drei Kennzahlen, eine Platte und den Rekordmoment.
- /spieler/<name> - DIE PERSONALAKTE. Eine Karteikarte auf dem Pressbett. Der Name steht als Bodoni-Kopf und traegt denselben view-transition-name wie die Zeile im Namensregister, aus der man kam - der Name morpht beim Navigieren an seinen neuen Platz. Links hängen die Kennzahlen als große Ziffern mit Mono-Beschriftung (Level, Spielzeit, Sessions, Distanz in km, besuchte Gebiete, erstmals gesehen), rechts der Setzkasten der 26 Praegungen mit der nächsten erreichbaren Freischaltung als hervorgehobene Zeile. Unten: 'Diese Akte teilen' und der Adress-Stempel. Fehlerzustand korrigiert - die heutige Seite behauptet gleichzeitig 'Spieler nicht gefunden' und 'Server nicht erreichbar'; hier gibt es drei getrennte, sauber formulierte Zustände.
- /impressum und /datenschutz - ANHANG A UND ANHANG B. Endlich eine echte .prose-Komponente statt der heute 17 beziehungsweise 6 Inline-Styles, die dort die gesamte Typo-Hierarchie tragen (und jede strenge CSP blockieren). Einspaltiger Buchsatz, maximal 68 Zeichen Satzbreite, hängende Paragraphenziffern in Gold im Rand, Kolumnentitel mit Anhang-Bezeichnung und Seitenzahl. Fuer ein deutsches Publikum sind das keine Randseiten, sondern Vertrauensseiten - entsprechend werden sie gesetzt. Der Google-Fonts-Abschnitt entfaellt inhaltlich, weil die Schriften selbst gehostet werden; dafuer kommen Rechtsgrundlagen nach Art. 6 DSGVO, Betroffenenrechte und konkrete Speicherdauern hinzu.
- /404 - DIE FEHLENDE SEITE. Die Erzählidee des vorhandenen Assets bleibt, das Motiv wird neu gezeichnet: ein Bogen, aus dem sauber ein Rechteck herausgetrennt wurde - die Perforationskante ist sichtbar, dahinter das Pressbett. Der ratlose Spaeher steht als Cyan-Linienzeichnung am Rand der Lücke. Kolumnentitel: 'SEITE FEHLT'. Die drei Auswege (Startseite, Faltkarte, Discord) sind Registerreiter am unteren Blattrand, kein Buttonpaar. Der Vierfach-Fallback-Stapel entfaellt - drei der vier Bilddateien existieren gar nicht und erzeugen heute drei 404-Requests auf der 404-Seite.
- /admin und /broadcast - DIE WERKSTATT. Gleiche Tokens, gleiche Schriften, aber ohne Praegung, ohne Textur, ohne Passkreuze: reiner Mono-Satz auf --papier-nacht, Formularfelder als Haarlinien-Unterstriche, Aktionen als Textbefehle. Werkzeug, nicht Ausgabe. Das hält die Ausgabe-Metapher glaubwuerdig, weil sie nicht ueberall aufgetragen wird.
- GEMEINSAM FUER ALLE UNTERSEITEN: identischer Kolumnentitel mit Kapitel- oder Anhangbezeichnung, identischer Fussnotenapparat, und auf jeder Seite mindestens ein Adress-Stempel. Nav und Fuss stehen heute achtmal im Repo dupliziert - vorher braucht es genau EINEN Mechanismus dafuer, sonst kostet jede Designiteration acht Dateiaenderungen.

## 14 · Der Signature-Moment

DER ABDRUCK.

Der Adress-Stempel ist der einzige primaere CTA der Seite - eine leicht gedrehte Stempelplatte mit der Serveradresse, unregelmäßiger Tintendichte und abgenutzten Raendern. Wenn man ihn drückt, kopiert er nicht einfach. Er stempelt.

Die Platte senkt sich in 90 Millisekunden, kippt um 0,6 Grad zurück und federt in 260 Millisekunden mit einem leichten Überschwinger hoch. Darunter bleibt ein Abdruck stehen: die Adresse ein zweites Mal, bei 26 Prozent Deckkraft, minimal verlaufen, mit einer Rotation und einer Tintendichte, die aus einem Seed gezogen werden - jeder Abdruck sieht ein bisschen anders aus. Daneben, in Mono, klein: 'abgedruckt 25.07.2026, 21:14'.

Und dieser Abdruck verschwindet nicht. Er bleibt für die gesamte Sitzung auf dem Bogen stehen, während man weiterliest. Wer die Adresse im Hero kopiert und drei Kapitel später in der Anleitung wieder vorbeikommt, findet dort seinen eigenen Abdruck von vorhin bereits vor.

Warum das funktioniert: Es macht die wichtigste Handlung der Seite zu einer koerperlichen Handlung mit einer Spur. Ein Toast, der nach 1.800 Millisekunden verschwindet - so löst der Bestand das heute - bestaetigt eine Aktion. Ein Abdruck bezeugt sie. Die Seite ist ein Dokument, das mitschreibt; von diesem Moment an hat auch der Besucher darin etwas hinterlassen. Und es ist der eine Effekt, den man einem Freund im Discord beschreibt, ohne den Namen der Seite zu erwaehnen: 'die mit dem Stempel'.

## 15 · Warum das nicht nach KI aussieht

WARUM ES EINZIGARTIG IST: Kein anderer Palworld-Server der Welt kann diese Seite bauen, weil ihr Bildmaterial aus den eigenen Betriebsdaten entsteht. Der Hero enthaelt kein Artwork, sondern eine Ausgabennummer, die aus dem ersten Datensample errechnet wird. Der Aufmacher IST die Zeitreihe. Der schönste Moment der Seite ist eine Rechnung, die auf null endet. Und die stärkste Sektion ist eine Liste der eigenen Ausfälle. Eine Agentur kann das Layout nachbauen; die Aktenlage kann sie nicht nachbauen.

WARUM ES NICHT NACH KI AUSSIEHT - konkret gegen die Merkmale, die in der Bestandsanalyse gefunden wurden:

Kein Status-Badge mit Pulspunkt über der H1 - der Live-Status steht als Mono-Einlauf mit Zeitstempeln in der Nebenspalte. Kein Verlaufswort in der Ueberschrift - die Wortmarke ist blindgepraegt und hat gar keine Farbe. Kein Primary-Ghost-Buttonpaar - es gibt einen Stempel und einen Textlink. Kein Eyebrow-H2-Lead-Grid-Rhythmus, achtmal wiederholt - jedes Kapitel hat eine andere Bauform: Satzspiegel, Tafel, Register, Ledger, Platte, Führungspunkt-Liste, Setzkasten, Rechnung, Kolophon. Kein Kartenraster, ausser dem Setzkasten, und der besteht aus Vertiefungen ohne Rahmen, Flaeche und Schatten. Keine drei nummerierten Kreise. Kein Plus, das sich um 45 Grad dreht. Keine Emoji. Kein Lucide-Icon - 26 plus 12 Glyphen sind gezeichnet. Kein Pokeball-Logo - die Marke ist gepraegte Typografie. Kein Glassmorphism, keine Pillen, keine 3D-Hartschatten, kein einziger Farbverlauf ausser dem Streiflicht.

Und das entscheidende Nicht-KI-Merkmal ist inhaltlich: Diese Seite gibt Nachteile zu. Ein Sprachmodell schreibt keine Fussnote 2, in der steht, dass Xbox-Spieler nicht beitreten können. Es druckt keine Ausfallliste. Es setzt keinen roten Quervermerk UNBEZAHLT über die eigene Rechnung. Genau daran erkennt ein Juror - und ein Besucher - dass hier jemand entschieden hat.

## 16 · Conversion-Hebel

- DER STEMPEL IST DER EINZIGE PRIMAERE CTA - und er ist ueberall. Im Hero, ab dem ersten Scroll persistent im Kolumnentitel, im Anleitungsschritt 02 und im Fuss. Discord ist konsequent sekundaer (Textlink, kleiner, nie mit Flaeche). Behebt die heutige Schieflage von sechs Discord-Einstiegen gegen zwei Kopiermoeglichkeiten - und dass der primaere Button heute nur ein Anker auf eine Sektion 4.500 Pixel weiter unten ist.
- DAS QR-FELD ALS MOBILE BRUECKE. Palworld läuft am PC, die Seite wird am Handy gelesen. Der QR-Code der Serveradresse (clientseitig erzeugt, keine Abhaengigkeit) ist die ehrliche mobile Konversion, statt eine Adresse in die falsche Zwischenablage zu kopieren.
- VERTRAUENSBEWEIS VOR DER ENTSCHEIDUNG. Die Störungsakte (Kapitel V) steht bewusst VOR der Faltkarte und dem Register, aber NACH der Beitrittsanleitung - der Besucher liest die Ausfallliste in dem Moment, in dem er innerlich schon zusagt. Zusätzlich stehen Verfügbarkeit 24h und die Ausgabennummer bereits im ersten Bildschirm.
- DER NULLFALL WIRD ZUR VERABREDUNG. Bei null Spielern zeigt Kapitel I nicht die Null, sondern das Primetime-Band aus der Sieben-Tage-Kurve plus den Rekord mit Datum. Der größte Konversionskiller eines kleinen Servers wird zur konkretesten Information der Seite.
- DIE RECHNUNG BEANTWORTET DEN HAKEN-VERDACHT AN DER RICHTIGEN STELLE. Kapitel IX kommt genau dann, wenn die Frage entsteht: nach Regeln, Beitritt, Daten und Karte. Null Euro, keine Vorteile gegen Geld, keine Werbung, kein Tracking - als Beleg gesetzt, nicht als Versprechen behauptet.
- FUSSNOTEN ALS EHRLICHKEITSMECHANIK. Passwort und Steam-only stehen nicht in einem zugeklappten FAQ, sondern als Marker direkt an der Anweisung, die sie betreffen. Ein Besucher, der vor dem Download erfaehrt, dass es über den Game Pass nicht geht, ist kein verlorener Beitritt - er ist ein gewonnenes Vertrauen.
- DIE RETENTIONSSCHLEIFE WIRD GESCHLOSSEN. Namensregister mit Führungspunkten führt auf /spieler/<name>, dort steht der Setzkasten mit dem nächsten erreichbaren Erfolg als Teaser ('noch 3 Stunden bis Stammspieler'), und von dort zurück auf die Faltkarte. Der Besucher hat drei Gründe wiederzukommen, statt eines.
- DIE AUSGABENNUMMER ALS WIEDERKEHRGRUND. 'AUSGABE 412 - 25.07.2026' im Kolumnentitel sagt zweierlei: Diesen Server gibt es lange, und morgen ist eine neue Ausgabe da. Zusammen mit der 'Auflage dieser Ausgabe' im Fuss - dem umbenannten, cookiefreien Besucherzaehler - entsteht ein Periodizitaetsgefuehl, das keine Live-Zahl allein erzeugt.

---

# Gegenrede

*Jedes Konzept wurde nach der Ausarbeitung von einer unabhängigen, bewusst
feindseligen Instanz zerlegt — Awwwards-Juror und Frontend-Architekt in
Personalunion. Diese Kritik steht hier ungefiltert, weil ein Konzept, das seine
eigenen Schwächen nicht mitliefert, keine Entscheidungsgrundlage ist.*

## Wo es doch nach KI riecht

Drei Stellen riechen trotz der Sorgfalt nach Vorlage — und eine davon ist strukturell.

1) VOKABEL-TAUSCH STATT STRUKTUR. Legt man die Kapitelliste neben die heutige Seitenstruktur, ist es eine 1:1-Umbenennung: Sektion -> Kapitel, Kicker -> Kolumnentitel, Feature-Card -> Paragraph, Regeln -> Hausordnung, FAQ -> Fussnoten, Live-Ticker -> Einlauf, Preisliste -> Rechnung. Das ist exakt der Zug, den ein Sprachmodell macht, wenn es "neu erfinden" soll: Es benennt um. Die Reihenfolge des Lesens, die Informationsdichte pro Bildschirm und die Hierarchie bleiben die einer klassischen Ein-Spalten-Landingpage. Der Test: Nimmt man Passkreuze, Faserstruktur und Bogenschatten weg — ist die Seite dann noch etwas anderes als eine dunkle Landingpage mit Serifentiteln? Aktuell: nein.

2) DIE PRINT-SIGNIFIKANTEN SIND SELBST DAS KLISCHEE. Passkreuze in den vier Ecken, 4-mm-Rasterpapier, Papierfaser-WebP bei 8 Prozent mit mix-blend-mode: overlay, sichtbare Bogenkante mit 120px-Schlagschatten — das ist das Standard-Kit jedes "editorial"-Figma-Templates seit 2022. Passkreuze markieren Farbauszuege eines Vierfarbdrucks, den es hier nicht gibt; sie sind reine Kostuemierung. Ein Konzept, dessen Kernversprechen "keine Behauptung ohne Beleg" lautet, dekoriert sich ausgerechnet mit erfundenen Drucknachweisen — inklusive "SEITE 1" auf einer Seite, die keine Seiten hat. Diese Selbstwidersprueche wird eine Jury als Erstes finden.

3) SCHRIFT- UND FARBWAHL SIND DER AGENTUR-DEFAULT. Bodoni/Didone-Display groß + Neo-Grotesk + Mono-Captions auf Fast-Schwarz mit Cyan und Gold ist die meistkopierte Awwwards-Kombination der letzten drei Jahre. Sie ist handwerklich richtig und trotzdem nicht distinktiv. Gold+Cyan auf Anthrazit ist zusätzlich der Fintech-/Crypto-Premium-Default. Nichts an der Palette sagt "Druck" — die Druckhaftigkeit hängt zu 100 Prozent an den Textur-Overlays.

4) DIE STIMME. Die Konzeptprosa selbst ("Jede Serverseite behauptet. KALTDRUCK belegt." / "Was in Mono steht, ist gemessen. Was in Bodoni steht, ist bemerkenswert.") ist die triadische Parallelsyntax, an der man KI-Text erkennt. Wenn dieser Duktus auf die Seite wandert, ist der ganze Authentizitaetsgewinn weg. Ein echtes Logbuch klingt unrund, ungleich lang, manchmal genervt.

5) NULL PALWORLD. Im gesamten Hero kommt kein Pal, keine Landschaft, kein Screenshot vor. Der Entwurf könnte ohne eine Zeile Änderung eine Anwaltskanzlei, ein Architekturbuero oder eine Whisky-Marke sein. Austauschbarkeit ist die schwerere Form von KI-Geruch als jedes Gradient-Badge.

## Überschneidung mit den Nachbarkonzepten

HARTE KOLLISION MIT LEITSTAND — das ist die gefaehrlichste. KALTDRUCKs Beweismaschine ist die Störungsakte, die Verfügbarkeit, die Spielerkurve und der Einlauf mit nachrutschenden Zeitstempeln. Genau dieses Material ist LEITSTANDs Held-Element. Beide Konzepte verkaufen "Vertrauen durch Transparenz" mit denselben vier Endpunkten. Der Unterschied darf nicht "andere Schriftart" sein, er muss temporal und autorial sein: LEITSTAND ist Praesens, Instrument, jetzt, automatisch. KALTDRUCK muss Perfekt sein, Protokoll, gefuehrt, redigiert. Konsequenz: Der Einlauf als live nachrutzender Ticker muss weg — das ist ein Instrument, kein Dokument. Ersatz mit deutlich mehr Kraft: Die Ausgabe wird auf ein Datum GEDRUCKT, und die Live-Werte erscheinen als handschriftlich anmutende Korrektur daneben ("Stand bei Drucklegung: 7 — jetzt: 11"). Die Spannung zwischen Gedrucktem und Aktuellem ist ein Bild, das LEITSTAND nicht haben kann.

KOLLISION MIT WERKBANK — unterschaetzt. Sobald Sepia, Braun und Bastelbogen gestrichen sind, driftet KALTDRUCK in Richtung Praezision, Kälte, Mono-Beschriftung, Rasterpapier, Haarlinien, Passkreuze. Das ist Konstruktionszeichnung. Millimeterpapier ist Ingenieurspapier, nicht Verlagspapier. Trennlinie ziehen: WERKBANK besitzt die GEZEICHNETE Linie (Bemaßung, Achsen, Isometrie, Schnittkanten, Leaderlines). KALTDRUCK besitzt die GESETZTE Seite (Spalte, Kolumnentitel, Fussnote, Marginalie, Stempel, Praegung). Also: 4-mm-Gitter raus oder ersetzen durch Sieb-/Rippenstruktur eines Buettenpapiers; keine Bemaßungslinien; keine Achsen mit Ticks im Chart, sondern Tabellenlinien.

KOLLISION MIT DIE INSEL — an genau einem Punkt: der Faltkarte mit Legende. Das ist INSELs Existenzgrund. Entweder die Faltkarte fliegt ganz raus und KALTDRUCK verlinkt nur trocken auf /karte ("Kartenblatt, separat beigelegt"), oder sie bleibt bewusst als STATISCHE Druckplatte mit historischem Stand plus eingelegtem Zettel für die Live-Positionen. Interaktives Pannen/Zoomen auf der Startseite wäre Diebstahl an INSEL.

NACHTLAGER — geringste Ueberschneidung (Gefühl gegen Aktenlage), aber eine Farbfalle: Gold #C8A44E unter einem "Streiflicht" auf Schwarz sieht schnell nach Kerzenschein aus. Gold muss hier metallisch, hart und klein bleiben (Kaltfolie, 1px-Relief, nie Glow, nie Verlauf), sonst wird aus Praegung Lagerfeuer.

WAS KALTDRUCK ALLEIN GEHOERT und ausgebaut werden muss: die Fussnote als Bauteil (Ehrlichkeit mit Beleg an Ort und Stelle), die Marginalspalte, die Ausgabennummer als Zeitzeuge, der Stempel als Interaktionsprimitive, und das Bekenntnis zu Text statt Bild. Kein anderes der vier Konzepte kann Text als Hauptdarsteller spielen.

## Machbarkeit auf der realen Infrastruktur

Zuerst das Erfreuliche, weil es für die Auswahl entscheidend ist: KALTDRUCK ist von den fünf Konzepten das mit Abstand billigste im Betrieb. Es braucht kein GSAP, kein WebGL, keine Partikel, keine Videoschleife. CSS plus etwa 200 Zeilen Vanilla-JS reichen. Auf zero-dep Node + nginx mit einem Admin ist das der einzige Entwurf, der in zwei Jahren noch wartbar ist. Die Selbst-Hostung der Schriften löst ausserdem ein reales Rechtsproblem: /home/user/palworld-server/public/index.html Zeile 32-34 laedt heute Baloo 2 und Nunito direkt von fonts.googleapis.com.

WAS TRAEGT
- Palette: Ich habe alle Kontrastangaben nachgerechnet — sie stimmen exakt (Bogen/Nacht 1,07 | tinte-hell 15,41 | tinte-blass 5,28 bzw. 4,86 auf Falz | cyan 9,88 | gold 7,61 | stempel-rot 4,83 auf Bogen, 4,45 auf Falz — daher die Regel, Rot nie auf Falz zu setzen, ist korrekt hergeleitet). Das ist die einzige Sektion des Konzepts, die nicht blufft. Uebernehmen.
- Praegung über 1px-Licht/Schattenkante: reine text-shadow-Arithmetik, praktisch kostenlos.
- Papierfaser 128x128 WebP unter 6 KB, gekachelt: fein. ABER mix-blend-mode: overlay über die volle Bogenflaeche erzeugt auf Android-Mittelklasse eine eigene Compositing-Ebene über die ganze Seitenhoehe. Besser: Deckkraft in die Textur einbacken und ohne blend-mode kacheln.
- Fokusring-Token (2px + 2px offset + dunkler Halo): selten gut durchdacht, kostet nichts, uebernehmen.

WAS BRICHT ODER FEHLT
- AUSGABENNUMMER NICHT BERECHENBAR. server.js:421-422 hält Samples nur 7 Tage (STATS_RETENTION_BUCKETS), server.js:596 filtert zusätzlich auf weekAgo. "Tage seit erstem Sample" existiert nirgends. Ableitbar wäre nur min(firstSeen) über stats.players — bricht, sobald data/stats.json je neu angelegt wurde. Fix ist eine Zeile (persistiertes stats.epoch mit einmaligem manuellen Startdatum), aber ohne diese Zeile ist die zentrale Beglaubigungszahl des gesamten Konzepts frei erfunden.
- STOERUNGSAKTE IST HEUTE EIN SELBSTTOR. server.js:631-650 baut Ausfälle ausschließlich aus null-Buckets der letzten 7 Tage und kappt auf 8 Eintraege. Der tägliche Neustart um 03:00 erzeugt jeden Tag einen Ausfall. Die "ehrliche Akte" zeigt also sieben Eintraege, alle um 03:0x, alle wenige Minuten — ein Besucher liest: "stürzt täglich ab". Ohne serverseitige Klassifikation (geplant/ungeplant, Neustartfenster aus der Config) und ohne separates, langlebiges data/outages.json ist das Vorzeigefeature falsch UND schaedlich.
- EINLAUF HAT KEINE DATENQUELLE. Es gibt keinen Join-/Leave-Eventlog. /api/status ist 15s gecacht, der Stats-Poll läuft alle 60s, Buckets sind 300s. Ein Ticker mit "gerade nachrutschenden" Zeilen müsste neu gebaut werden: append-only data/events.jsonl mit Rotation, Zustandsdiff im Poll, /api/events?limit=50, dazu Datenschutz-Abwaegung (Name + Zeitstempel = Anwesenheitsprofil). Machbar in ~150 Zeilen server.js, aber es ist die einzige echte Backend-Arbeit im Konzept und muss explizit beauftragt sein. Und: Auf einem Server mit 3-10 gleichzeitigen Spielern rutscht da tagsueber stundenlang nichts nach. Ein toter Ticker ist schlechter als keiner.
- STEMPEL-WAND IST EINE HAFTUNGSFLAECHE. Persistente Nutzerabdruecke ohne Login bedeuten Moderation, Spam, IP-Speicherung, Datenschutzerklaerung-Nachtrag — für einen Admin ohne Team. /api/visit (server.js:1456ff) hat bereits Rate-Limit und Zaehler; entweder Stempel rein lokal (localStorage, "dein Abdruck auf DEINER Ausgabe") oder nur aggregiert ("4.812 Abdruecke"). Individuelle persistente Marken: streichen.
- SCHRIFTBUDGET. Bodoni Moda VF (wght+opsz) latin ~45-70 KB, Archivo VF ~35 KB, IBM Plex Mono liefert Google Fonts NUR statisch — 400/500/600 plus Italic sind sechs Dateien. Realistisch: auf 400 und 600 ohne Italic kürzen, alles mit pyftsubset auf latin+Umlaute subsetten, die fertigen woff2 ins Repo committen und den Befehl in tools/ dokumentieren (das Repo hat keinen Build-Step und soll auch keinen bekommen). Ziel: unter 140 KB Schrift gesamt, preload nur für zwei Schnitte.
- MOBILE, DEUTSCHE KOMPOSITA. --fs-h1 mit Minimum 3,25rem = 52px, dazu die H1 "Wir führen Buch über eine Welt, die nicht zurückgesetzt wird." Bei 360px Viewport passen ~12 Zeichen pro Zeile; "zurückgesetzt" hat 13. Ohne lang="de" plus hyphens: auto und ein Minimum um 2,25rem gibt es Ueberlauf. Klassischer Fehler bei Großformat-Typo auf Deutsch.
- SATZSPIEGEL WIDERSPRICHT SICH. "Bogen 92 Prozent Breite" und "maximal 68 Zeichen Satzbreite" schließen sich auf 1920px aus (linke Spalte des 7:5-Splits wäre ~1000px = ~95 Zeichen). Der Bogen ist breit, die Textspalte darf es nicht sein — das braucht einen echten Satzspiegel mit Raendern, sonst kippt die Lesbarkeit genau dort, wo das Konzept sie behauptet.
- BOGENKANTE AUF DEM HANDY. 92 Prozent Breite auf 360px = 14px Pressbett je Seite. Aus der Metapher "aufgelegter Bogen" wird ein Rahmen, und acht Prozent Bildschirm sind weg. Mobil: randabfallend drucken, Metapher über Kolumnentitel, Fussnoten und Marginalie tragen.
- BLINDPRAEGUNG DER WORTMARKE. Ein PALHEIM, das die Papierfarbe IST und nur über 1px-Kanten existiert, ist bei 40 Prozent Helligkeit im Tageslicht schlicht unsichtbar — und es funktioniert weder im OG-Bild noch im vorhandenen 468x60-Serverlisten-Banner (public/assets/promo/). Es braucht eine praegungssichere, monochrome Zweitfassung der Wortmarke.
- prefers-reduced-motion ist hier fast geschenkt (kaum Bewegung im Konzept) — Pflichtfaelle sind nur Ticker-Stopp und Falz-/Aufklapp-Animationen. Tastatur: Registerreiter, Faltkarte, Inhaltsverzeichnis-Overlay und Stempel brauchen echtes Fokus-Management; die Reiter am rechten Rand sind auf Touch ausserdem zu schmale Trefferflaechen und brauchen zwingend das Overlay als Primaernavigation.

## Wirkung auf die Conversion

GEMISCHT — mit einem strukturellen Defekt und einem echten Vorteil.

DER DEFEKT: Im beschriebenen Hero kommt die Serveradresse nicht vor. Kolumnentitel, blindgepraegte Wortmarke, H1, drei Zeilen, Einlauf — kein pve.palheim.de:8211, kein Kopieren, kein Discord. Das ist kein Zufall, sondern die Logik der Metapher: Dokumente haben keine Call-to-Action. Genau hier wird die Inszenierung zum Hindernis. Wer aus einer Serverliste kommt, hat unter zehn Sekunden Geduld und eine einzige Frage: "Wie komme ich rein?" Ein schwarzer Bogen mit Bodoni beantwortet die Frage nicht — er stellt sie in Frage ("bin ich hier richtig?").

DER VORTEIL: Der Kolumnentitel ist die perfekte Lösung für genau dieses Problem, sie wird nur nicht genutzt. Ein laufender Kolumnentitel wiederholt sich in einem echten Druckwerk auf JEDER Seite. Wenn dort dauerhaft und klebend "PALHEIM / PVE.PALHEIM.DE:8211 [kopieren] / AUSGABE 412" steht, ist die Adresse auf jedem Bildschirm sichtbar, ohne dass ein einziger Button die Metapher bricht. Das ist konzeptreiner und konversionsstaerker als jede Sticky-Buttonleiste — und kein anderes der fünf Konzepte kann das so begründen.

DIE RECHNUNG ARBEITET GEGEN DAS ZIEL. "UNBEZAHLT" in Rot ist im deutschen Sprachraum das Vokabular der Mahnung. Der erste Reflex ist Anspannung, nicht Erleichterung — und das bei einem Besucher, der in Sekunde 30 herausfinden soll, ob das hier kostenlos ist. Ausserdem verstoesst der Abschnitt faktisch gegen das Briefing-Verbot der Preisliste: eine Rechnung ist eine Preisliste im Kostuem. Besser und ehrlicher: eine KOSTENAUFSTELLUNG, die die realen Serverkosten benennt (Strom, Hardware, Domain) und in der letzten Zeile "Dein Anteil: 0,00 Euro" setzt. Das ist Beleg statt Gag, es erklärt die Spende, statt sie zu erbetteln, und es traegt die Kaffee-CTA an der einzigen Stelle, an der sie logisch ist.

DISCORD BRAUCHT EINE DRUCKFORM. "Discord beitreten" als Button ist Fremdkoerper. Als perforierter Abschnitt-Coupon am Fuss des Bogens mit gestrichelter Schnittlinie ist es on-concept UND klickbar — Bedingung: im Coupon stehen woertlich "Discord beitreten" und der eigentliche Link, keine Metapher-Raetsel wie "Einschreibung".

FUSSNOTE 2 IST DAS BESTE ELEMENT DES KONZEPTS — steht aber falsch. Dass Game Pass / Microsoft Store nicht auf Steam-Server kommt, ist die eine Wahrheit, die dem Spieler zwanzig Minuten spart und ihm sonst niemand vor dem Download sagt. Als Endnote am Seitenende ist sie typografisch versteckt, und versteckte Ehrlichkeit ist keine. Sie gehört als Fussnotenmarker direkt in den Beitrittsschritt, mit dem Fussnotentext am Fuss DESSELBEN Kapitels (so funktionieren echte Fussnoten: seitenweise, nicht am Buchende).

STEMPEL ALS KOPIER-FEEDBACK: Das ist die einzige Stelle, an der die Stempel-Metapher echte Arbeit leistet statt zu dekorieren. Klick auf die Adresse -> roter Stempelabdruck "KOPIERT" mit leichter Rotation über der Zeile. Kostenlos, on-concept, unmissverstaendlich.

RESTRISIKO ZIELGRUPPE: 16-24-jaehrige Palworld-Spieler lesen keine Aktenlage. Die Konversion durch Vertrauen funktioniert bei 28-40, bei Familienvaetern, bei Leuten mit Wipe-Trauma — die aber sind auf einem PvE-Server ohne Wipes exakt die Kernzielgruppe. Das Konzept optimiert bewusst auf den zweiten Blick. Wer den ersten Blick auch braucht, muss die Adresse und die drei Kennzahlen (32 Slots, 3x EP, keine Wipes) oberhalb der Faltlinie unterbringen — als Impressumszeile im Sinne des Drucks, nicht als Feature-Chips.

## Schwächen

- Die Kapitelstruktur ist eine Umbenennung der bestehenden Sektionsliste, keine neue Dramaturgie — Sektion/Kicker/Feature-Card/Regeln/FAQ heißen jetzt Kapitel/Kolumnentitel/Paragraph/Hausordnung/Fussnote, lesen sich aber in derselben Reihenfolge und Dichte.
- Ein Konzept mit dem Kernsatz 'keine Behauptung ohne Beleg' dekoriert sich mit erfundenen Belegen: Passkreuze für Farbauszüge, die es nicht gibt, 'SEITE 1' auf einer Seite ohne Seiten, eine Rechnung über eine Transaktion, die nie stattfand.
- Die Ausgabennummer — der Anker der gesamten Beglaubigung — ist aus den vorhandenen Daten nicht berechenbar: server.js:421-422 hält Samples nur 7 Tage, ein persistiertes Startdatum existiert nicht.
- Die Störungsakte zeigt mit dem heutigen Datenmodell (server.js:631-650) sieben Ausfälle in sieben Tagen, jeweils um 03:0x — der geplante Neustart wird als Absturz gedruckt. Das Ehrlichkeits-Feature diffamiert den Server.
- Der Einlauf hat keine Datenquelle: es gibt keinen Join-/Leave-Eventlog, nur 15s-Status-Cache und 300s-Buckets. Und selbst mit Eventlog rutscht bei 3-10 gleichzeitigen Spielern stundenlang nichts nach.
- Der Live-Ticker ist inhaltlich LEITSTANDs Held-Element — KALTDRUCK borgt sich damit ausgerechnet die Praesens-Geste eines Nachbarkonzepts, obwohl seine eigene Stärke das Perfekt ist.
- Rasterpapier, Passkreuze, Haarlinien und Mono-Achsenbeschriftung driften in WERKBANKs Konstruktionszeichnung; Millimeterpapier ist Ingenieurs-, nicht Verlagsmaterial.
- Die Faltkarte mit Legende nimmt DIE INSEL ihren einzigen Existenzgrund vorweg.
- Im Hero fehlt die Serveradresse vollständig — das einzige echte Conversion-Ziel kommt auf dem ersten Bildschirm nicht vor.
- 'UNBEZAHLT' in Rot liest sich im Deutschen als Mahnung und erzeugt Geldangst genau in der Sekunde, in der 'kostenlos' ankommen müsste; die Rechnung ist ausserdem eine verkleidete Preisliste, die das Briefing verbietet.
- Die blindgepraegte Wortmarke (Kontrast ~1:1) ist auf einem Handy bei Tageslicht unsichtbar und funktioniert weder im OG-Bild noch im vorhandenen 468x60-Serverlisten-Banner.
- --fs-h1 mit 52px Minimum plus deutsche Komposita ('zurückgesetzt') erzeugt auf 360px Ueberlauf; hyphens/lang sind nicht mitgedacht.
- 'Bogen 92 Prozent Breite' und 'maximal 68 Zeichen Satzbreite' widersprechen sich auf großen Displays; ohne definierten Satzspiegel wird die linke Spalte ~95 Zeichen breit.
- Die persistente Stempelwand ist für einen Ein-Mann-Betrieb ohne Login eine Moderations-, Spam- und Datenschutzflaeche ohne Gegenwert.
- Registerreiter am rechten Bogenrand sind auf Touch zu schmal und ohne Overlay-Fallback keine tragfaehige Primaernavigation.
- Es gibt kein einziges Palworld-Motiv — der Entwurf ist ohne eine Zeile Änderung auf eine Kanzlei, ein Architekturbuero oder eine Spirituosenmarke uebertragbar.

## Schärfungen — verbindlich für die Umsetzung

1. KOLUMNENTITEL WIRD DIE CTA. Der laufende Kolumnentitel klebt und traegt dauerhaft 'PALHEIM / PVE.PALHEIM.DE:8211 [kopieren] / AUSGABE 412 / 25.07.2026'. Klick setzt einen roten Stempelabdruck 'KOPIERT' leicht schraeg über die Zeile. Damit ist die Adresse auf jedem Bildschirm praesent, ohne dass ein einziger Fremdkoerper-Button die Metapher bricht — und die Stempelgeste leistet zum ersten Mal echte Arbeit statt Dekoration.
2. EINLAUF STREICHEN, DRUCKLEGUNG EINFUEHREN. Statt eines Live-Tickers (= LEITSTAND) bekommt jede Zahl zwei Zustände: den gedruckten Stand der Ausgabe und die aktuelle Korrektur daneben, in Cyan, wie mit der Hand nachgetragen: 'bei Drucklegung 7 — jetzt 11'. Das ist die einzige Bewegung, die die Seite braucht, sie ist prefers-reduced-motion-vertraeglich, und sie erzeugt ein Bild, das kein Nachbarkonzept haben kann.
3. STOERUNGSAKTE SERVERSEITIG REPARIEREN, BEVOR SIE GEDRUCKT WIRD. In server.js ein persistentes data/outages.json (append-only, unbegrenzte Historie) plus Klassifikation gegen das Neustartfenster aus der Config: 'PLANMAESSIGE WARTUNG 03:00' in --vermerk-grün, 'UNGEPLANT' in --stempel-rot. Dazu ein persistiertes stats.epoch mit manuell gesetztem, echtem Startdatum als Quelle der Ausgabennummer. Ohne diese zwei Backend-Änderungen darf das Konzept nicht gebaut werden — sonst luegen genau die Elemente, die Ehrlichkeit behaupten.
4. RECHNUNG WIRD KOSTENAUFSTELLUNG. Kein 'UNBEZAHLT' in Rot. Stattdessen eine echte Aufstellung der realen Serverkosten (Strom, Hardware, Domain, Backups) mit der Schlusszeile 'Dein Anteil: 0,00 Euro' in Gold. Der Kaffee-Link steht direkt darunter als freiwilliger Beitrag zu einer sichtbaren Summe. Damit wird aus einem Gag ein Beleg, aus einer verbotenen Pricing-Sektion echte Information — und die Spenden-CTA steht zum ersten Mal an einer logischen Stelle.
5. FUSSNOTEN WERDEN KAPITELWEISE GESETZT, NICHT AM ENDE. Der Game-Pass-Hinweis bekommt seinen Marker direkt im Beitrittsschritt, der Fussnotentext steht am Fuss DESSELBEN Kapitels. Gleiches Prinzip für alle neun FAQ-Eintraege: jede Frage wandert als Fussnote an die Stelle, an der sie beim Lesen entsteht. Damit verschwindet die FAQ-Sektion als Block — das ist die erste echte Strukturaenderung gegenueber dem Bestand statt einer Umbenennung.
6. PRINT-KOSTUEM ENTRUEMPELN, PAPIER PRAEZISIEREN. Passkreuze und 'SEITE 1' streichen (erfundene Belege in einem Belegkonzept). Das 4-mm-Millimetergitter durch eine Sieb-/Rippenstruktur ersetzen, damit KALTDRUCK nicht in WERKBANKs Konstruktionspapier rutscht. Faserstruktur ohne mix-blend-mode kacheln, Deckkraft eingebacken. Mobil läuft der Bogen randabfallend; die Metapher traegt dort der Kolumnentitel, nicht die sichtbare Kante.
7. WORTMARKE ZWEISTUFIG. Die Blindpraegung bleibt als Effekt, aber die Flaeche der Wortmarke sitzt auf --papier-falz statt auf --papier-bogen und bekommt eine Goldhaarlinie an der Lichtkante — Praegung bleibt lesbar, Silhouette bleibt bei Tageslicht erkennbar. Zusätzlich eine monochrome, praegungsfreie Zweitfassung für OG-Bild, Favicon und das 468x60-Serverlisten-Banner.
8. TYPO-GUARDRAILS FUER DEUTSCH. lang='de' plus hyphens: auto global, --fs-h1 Minimum auf 2,25rem senken, --fs-kapitel mobil auf 5rem deckeln. Ein expliziter Satzspiegel (max. 62ch) INNERHALB des breiten Bogens, mit echten Aussen- und Kolumnenraendern. Damit stimmt die 68-Zeichen-Regel auch auf 1920px, und 'zurückgesetzt' bricht nicht aus der Spalte.
9. STEMPELWAND ENTSCHAERFEN. Keine individuellen persistenten Marken. Entweder der Abdruck bleibt lokal auf der eigenen Ausgabe (localStorage) oder er zaehlt nur aggregiert über den bereits existierenden /api/visit-Zaehler ('4.812 Abdruecke auf dieser Ausgabe'). Emotionaler Beat bleibt, Moderations- und Datenschutzflaeche verschwindet.
10. EINE EINZIGE ABBILDUNG ZULASSEN. Genau ein Bildelement im gesamten Dokument, als gerasterte Schwarz-Cyan-Duplex-Abbildung mit Bildunterschrift in Mono und Quellenangabe — ein Pal oder eine Gildenbasis. Ein Foto in einem Textdokument ist ein Ereignis; null Fotos machen den Entwurf auf jede beliebige Branche uebertragbar. Damit bekommt die Seite ihren Palworld-Fingerabdruck zurück, ohne die Askese aufzugeben.

## Urteil

KALTDRUCK ist von den fünf Entwuerfen der intellektuell stärkste und der operativ vernuenftigste — und gleichzeitig der, der am leichtesten an seinem eigenen Anspruch scheitert. Die Grundthese (die Seite ist nicht Werbung für den Server, sondern sein veroeffentlichtes Protokoll) ist die einzige unter den fünf, die die Geschaeftsrealitaet eines privaten Gratis-Servers wirklich ernst nimmt: Wer beitritt, kauft nichts, er verschenkt Vertrauen, und Vertrauen entsteht durch Aktenlage. Die Palette hält jeder Nachpruefung stand — ich habe alle vierzehn Kontrastwerte nachgerechnet, sie stimmen bis auf die zweite Stelle, inklusive der korrekt hergeleiteten Regel, Stempelrot nie auf --papier-falz zu setzen. Und weil das Konzept ohne GSAP, WebGL, Partikel und Video auskommt, ist es das einzige, das auf zero-dep Node mit einem einzigen Admin in zwei Jahren noch wartbar sein wird. Dem stehen drei harte Defekte gegenueber: Erstens ist die Kapitelstruktur bislang eine Vokabelliste über der bestehenden IA, keine neue Dramaturgie — die Umbenennung von FAQ zu Fussnote wird erst dann Konzept, wenn die Fussnoten tatsaechlich in den Fliesstext wandern und der FAQ-Block verschwindet. Zweitens beruhen die drei Beweisstuecke, auf denen die gesamte Glaubwuerdigkeit ruht — Ausgabennummer, Störungsakte, Einlauf — auf Daten, die der Server heute nicht liefert; die Ausgabennummer ist bei 7 Tagen Retention schlicht nicht berechenbar, und die Störungsakte würde den täglichen 03:00-Neustart sieben Mal als Ausfall drucken. Ein Konzept, dessen Kernsatz "keine Behauptung ohne Beleg" lautet und dessen Belege erfunden sind, ist auf einer Awwwards-Jury nicht mutig, sondern peinlich. Drittens versteckt es die Adresse: Ein Dokument hat keine CTA, und genau deshalb muss der Kolumnentitel die CTA werden — das ist die eleganteste Lösung im ganzen Entwurf und sie fehlt bisher. Fuer die Abgrenzung gilt: Der Live-Ticker gehört LEITSTAND, die Faltkarte gehört DER INSEL, das Millimeterpapier gehört WERKBANK. KALTDRUCK muss alle drei abgeben und dafuer sein eigenes Territorium besetzen — das Perfekt statt des Praesens, die Drucklegung mit handschriftlicher Korrektur, die Fussnote als Bauteil. Richtig ist dieser Entwurf für einen Auftraggeber, der langfristig denkt, der bereit ist, zwei Nachmittage Backend-Arbeit in echte Datenqualitaet zu stecken, und der akzeptiert, dass die Seite auf den zweiten Blick optimiert ist: Sie gewinnt den Familienvater mit Wipe-Trauma, nicht den Sechzehnjaehrigen im Scrollrausch. Wer dagegen sofortigen Wow-Effekt aus der Serverliste heraus will oder keine Server-Änderungen anfassen moechte, ist mit NACHTLAGER besser bedient — KALTDRUCK ohne die reparierte Datenbasis ist nur eine dunkle Landingpage mit Bodoni und Passkreuzen.

---

## Eigene Risikoeinschätzung

- PERFORMANCE / ABHAENGIGKEITEN: GSAP plus ScrollTrigger kosten rund 70 KB brotli und brechen die Zero-Dependency-Doktrin, die heute das größte technische Asset des Projekts ist. Empfehlung, ehrlich benannt: Basis ausschließlich aus CSS scroll-driven animations, WAAPI und View Transitions bauen - das deckt 10 der 12 Animationen ab. GSAP nur als optional und lazy geladenes Modul für Rasterkurve und Faltkarte, oder gar nicht. Wer GSAP fest einbaut, verspielt den heutigen kritischen Pfad von rund 30 KB gzip.
- TEXTUR UND PRAEGUNG KOSTEN PIXEL-FILL: Papierfaser plus Rasterpapier plus Praegungsschatten plus Cursor-Lichtfeld sind vier ganzflaechige Kompositlagen. feTurbulence im Vollbild ist auf schwächeren GPUs nicht haltbar. Verbindlich: EINE gekachelte 128x128-WebP-Textur unter 6 KB, das Raster als repeating-linear-gradient, das Lichtfeld auf will-change und eine eigene Kompositionsebene begrenzt, alle Effekte per @media (pointer: coarse) und (max-width: 700px) reduziert. Budget: kein Effekt darf den Paint pro Frame über 8 ms treiben.
- BLINDPRAEGUNG STEHT IM DIREKTEN KONFLIKT MIT WCAG. Sie lebt davon, fast keinen Farbkontrast zu haben. Harte Regel, ohne Ausnahme: Blindpraegung wird ausschließlich für dekorative oder redundante Wiederholungen eingesetzt. Die Wortmarke existiert zusätzlich als sr-only-Text, die Kapitelziffern sind aria-hidden, die nicht erreichten Erfolge tragen ihren Zustand zusätzlich in Text und aria-label. Kein einziger Informationstraeger darf allein durch Licht und Schatten existieren.
- BODONI AUF SCHWARZ HALATIONIERT. Die Haarlinien einer Didone verschwinden unter etwa 40px auf dunklem Grund und flimmern auf 1x-Displays. Regel im Stylesheet festschreiben: Bodoni Moda ausschließlich ab 40px, opsz-Achse mitfuehren, darunter uebernimmt Archivo. Zusätzlich -webkit-font-smoothing NICHT auf antialiased zwingen, weil das auf Dunkel die Strichstaerke weiter reduziert - hier ist der Default besser.
- KITSCH-GEFAHR IST DAS GROESSTE RISIKO DES KONZEPTS. Rotation, Stempel, Fotoecken und Siegel kippen sehr schnell in Scrapbook. Quantifizierte Notbremse: maximal drei rotierte Elemente auf der gesamten Startseite, Rotation nie über 2 Grad (Ausnahme: der rote Quervermerk mit 8 Grad, weil er als Stempel gelesen werden muss), genau ein Siegel, kein Klebeband, keine gerissenen Kanten, keine Handschrift ausser einer einzigen gezeichneten Signatur. Wenn im Review mehr als drei taktile Metaphern gleichzeitig sichtbar sind, ist eine zu viel.
- VIEW TRANSITIONS SIND KUER, NICHT PFLICHT. Cross-Document-Transitions sind noch nicht ueberall verfügbar. Keine einzige Funktion darf davon abhaengen: ohne API-Unterstuetzung findet eine normale Navigation statt, ohne Verlust. Ebenso dürfen scroll-driven animations nie der einzige Weg sein, auf dem ein Element sichtbar wird - Ausgangszustand ist immer der sichtbare Zustand, Animationen entfernen Sichtbarkeit nicht.
- WARTUNG UND NUMMERNDRIFT: Kapitelziffern, Fussnotennummern, Ausgabennummer und Seitenzahlen müssen aus EINER Quelle erzeugt werden. Das Projekt hat dieses Problem bereits einmal: dieselben neun FAQ-Fragen stehen woertlich im JSON-LD und im HTML. Wird der Apparat von Hand gepflegt, driftet er innerhalb von zwei Releases.
- MOTION SICKNESS: Praegungs-Parallax, Streiflicht und Cursor-Lichtfeld addieren sich. Grenzen: Parallax-Versatz nie über 80px, kein Element bewegt sich gegenlaeufig zum Scroll um mehr als 0,2 der Scrollstrecke, und der komplette prefers-reduced-motion-Block muss mit jeder neuen Animation mitwachsen - das Projekt hat die Gewohnheit heute schon an drei Stellen, sie darf beim Ausbau nicht abreissen.
- MOBIL VERLIERT DIE METAPHER FLAECHE. Ein Bogen mit sichtbarem Rand kostet auf 360px zu viel Breite. Ab unter 700px wird der Bogen randlos (die Kante wird zur 1px-Haarlinie oben und unten), Marginalien wandern unter ihren Absatz statt in den Rand, zweispaltiger Satz wird einspaltig, und die Führungspunkte im Register entfallen. Der zweispaltige Buchsatz aus Kapitel II ist der riskanteste Umbruch und braucht einen eigenen Zwischenschritt bei etwa 900px.
- DER TON WIRD FAST NIEMAND EINSCHALTEN. Realistisch aktiviert unter 5 Prozent den Presse-Schlag. Deshalb: Standard aus, Datei erst nach Aktivierung nachgeladen, kein Autoplay-Versuch, kein Hinweisbanner. Wenn im Review die Frage aufkommt, ob der Ton den Aufwand rechtfertigt, lautet die ehrliche Antwort: Er ist das erste Element, das gestrichen werden kann, ohne dass das Konzept leidet.
- INHALTLICHE ABHAENGIGKEIT: Kapitel V lebt davon, dass es tatsaechlich wenige Ausfälle gibt, und Kapitel VII davon, dass es Namen im Register gibt. Fuer beide müssen die Leerzustaende genauso sorgfaeltig gestaltet werden wie die Vollzustaende - sonst hat die Seite je nach Datenlage eine andere Struktur, was genau die Wiederkehrer irritiert, für die sie gebaut ist.
