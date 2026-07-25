# Konzept B — FUNKFEUER

> ### „Kein Prospekt. Ein Messschrieb."

*Die Seite ist ein laufendes Instrument. Der Messschrieb ist das Layout.*

| | |
|---|---|
| **Register** | Kompetenz · Messung · Beweis |
| **Signature-Moment** | DIE RANDSPUR. Am linken Rand jeder Seite läuft eine 72px breite Spur mit einer einzigen, durchgehenden Linie: dem echten Sieben-Tage-Schrieb des Servers aus /api/stats. Oben ist jetzt, unten ist vor sieben Tagen. Scrollen bedeutet, das Papier durch den Schreiber zu ziehen. Wo der Server tatsaechlich ausgefallen war, hat die Linie ein Loch - kein Effekt, sondern ein fehlender Messpunkt. Sektionsmarken sitzen als Ticks auf der Kurve und sind gleichzeitig die Navigation der Seite. Ganz unten, im Frequenzwechsel, biegt die Linie aus dem Rand heraus in die Flaeche und endet. |
| **Sektionen** | 13 |

---

## 1 · Designphilosophie

Ein privater Server hat genau ein Problem: Warum sollte jemand Zeit in eine Welt investieren, die nächste Woche abgeschaltet sein könnte? Kein Adjektiv der Welt löst das. Nur eine Messung.

FUNKFEUER dreht die Beweislast um. Die Seite wirbt nicht für Stabilitaet, sie führt sie vor. Ein Funkfeuer ist ein Navigationssender, der nichts verkauft und nichts erklärt - er sendet einfach ununterbrochen seine Kennung, damit andere sich orientieren können. Genau das ist PalHeim: kein Produkt, sondern eine Station, die läuft. Und die Website ist nicht die Broschuere der Station, sie ist ihr Ausgabegeraet.

Daraus folgt die Grundregel: Nichts auf dieser Seite bewegt sich, blinkt oder leuchtet, ohne dass ein echter Messwert dahintersteht. Der Zeiger steht auf der echten Uhrzeit. Die Lücken in der Kurve sind echte Ausfälle mit Minutenangabe. Wird die Luft koerniger, ist die Verfügbarkeit gesunken. Wo andere Seiten Partikel streuen, weil Partikel gut aussehen, zeigt diese Seite Rauschen, weil Rauschen etwas bedeutet.

Der zweite Grundsatz ist Ehrlichkeit als Gestaltungsmittel. Die Sektion, die anderswo Preise zeigt, zeigt hier eine Kostenaufstellung mit dem Posten "Gegenleistung: keine". Die Ausfallliste wird nicht versteckt, sondern vergroessert. Die Antwort auf Xbox lautet Nein und steht weit oben.

Warm wird das durch das Licht, nicht durch runde Ecken: eine einzige goldene Lampe in einem dunklen Raum. Praezision ohne Kälte - Leitstand mit Nachtschicht, nicht Analytics-Dashboard.

## 2 · Zielwirkung

SEKUNDE 1 - "Das läuft gerade." Der Bildschirm ist fast schwarz, in der Mitte schlaegt eine Linie aus und wird zur echten Spielerkurve, rechts wandert ein Zeiger auf einer 24-Stunden-Skala. Noch bevor ein Wort gelesen ist, entsteht der Eindruck eines eingeschalteten Geraets, nicht einer Werbeseite. Gefühl: Respekt und leichte Neugier - hier wurde etwas gebaut, nicht bestellt.

SEKUNDE 5 - "Die verstecken nichts." Die Ueberschrift nennt einen Messwert statt einer Begruessung, darunter stehen die harten Fakten in einem Atemzug: 3x EP, kein PvP, keine Wipes, kostenlos. Die Serveradresse ist das größte Bedienelement im Bild und liegt einen Klick entfernt. Gedanke: Ich weiß schon, was das ist, was es kostet und wie ich reinkomme - und niemand hat mich dafuer durch eine Story gescrollt.

SEKUNDE 30 - "Denen kann ich meine Zeit anvertrauen." Der Besucher hat die Verfügbarkeit gesehen, die Ausfälle mit Uhrzeit und Minutenzahl, die Zahl der Menschen, die hier schon gespielt haben, und eine Karte mit echten Basen anderer Spieler. Er hat gelesen, dass es nichts kostet, weil jemand privat den Strom zahlt, und dass es dafuer keine Gegenleistung gibt. Gefühl: Ruhe. Das ist die Entscheidungsgrundlage, die kein Adjektiv liefern kann - und der Grund, die Adresse tatsaechlich zu kopieren statt die Seite zu schließen.

## 3 · Farbwelt

Die Palette ist als Instrumentenbeleuchtung gedacht, nicht als Farbschema: ein fast unbeleuchtetes Gehaeuse, in dem ausschließlich Daten leuchten. Deshalb gibt es nur vier Signalfarben - uebernommen aus der Konvention der Luftfahrt-Cockpits: Cyan = lebt/jetzt, Gold = Bestwert/Auszeichnung, Bernstein = Achtung, Rot = Störung. Alles andere ist Papier oder Metall. Farbe wird damit zur Information, und die Seite kann in genau einem Moment aufleuchten, statt permanent bunt zu sein.

Nachgerechnete Kontraste auf --gehaeuse #05070A (relative Luminanz 0,00207): --papier 13,3:1, --signal 12,5:1, --gold 7,7:1, --bernstein 7,4:1, --störung 5,5:1, --papier-stumpf 6,1:1. Damit erfuellt jede Textfarbe AA für Fliesstext, nicht nur für Großtext - die im Bestand belegte Kontrast-Disziplin (--accent-text, --chart-series) wird als Methode uebernommen und verschaerft.

Bewusst getrennt sind Flaechen- und Textfarbe: --signal ist als große Flaeche zu grell (Halation auf dunklem Grund, besonders bei Astigmatismus), deshalb existiert --signal-tief für Fuellungen und Balken; --signal bleibt Linien, Ziffern und Fokus vorbehalten. Reines Weiß kommt nirgends vor - der hellste Ton ist Papierweiss #EDF3F4, was das Nachbild-Flimmern auf Schwarz spuerbar reduziert. Es gibt keine Verlaeufe als Deko; die einzigen Verlaeufe sind Lichtkegel und Nebel und liegen unter 6 % Deckkraft.

| Token | Hex | Rolle |
|---|---|---|
| `--gehaeuse` | `#05070A` | Grundflaeche der ganzen Seite. Nahezu Schwarz mit minimalem Blaustich, damit Cyan nicht kippt. Nie aufgehellt - Sektionswechsel werden über Licht und Linien erzählt, nicht über Flaechenfarbe. |
| `--panel` | `#0B1014` | Kopfschiene, Randspur-Traeger, Fussschild. Ein Ton, den man kaum als Kante sieht, sondern als Materialwechsel. |
| `--instrument` | `#121A20` | Instrumentenfeld: Flaeche unter Skalen, Kalender, Registerzeilen. Ersetzt die weißen Karten des Bestands vollständig. |
| `--kante-hoch` | `#1B252C` | 1px-Oberkante erhabener Elemente. Erzeugt Materialrelief ohne Schlagschatten - die Z-Achse besteht aus Kanten, nicht aus Blur. |
| `--raster` | `#1F2C33` | Rasterlinien 1px im 96px-Takt. Immer vorhanden, nur unter dem Scanner-Cursor auf volle Deckkraft gehoben. |
| `--skala` | `#2E4048` | Messstriche, Achsenbeschriftungs-Ticks, Trennlinien, Führungspunkte in Registern. |
| `--papier-hell` | `#EDF3F4` | Ueberschriften und große Messwerte. Papierweiss statt #FFF - reduziert Halation und Nachbilder auf schwarzem Grund. 13,9:1. |
| `--papier` | `#C7D4D8` | Fliesstext in 400. Kontrast 13,3:1 auf --gehaeuse, damit auch bei 16px komfortabel. |
| `--papier-stumpf` | `#7E9199` | Sekundaertext, Einheiten, Zeitstempel, Legenden. 6,1:1 - erfuellt AA für Fliesstext, nicht nur für Großtext. |
| `--signal` | `#2FE3D0` | Die Live-Farbe: Spielerkurve, aktuelle Werte, Zeiger, aktiver Zustand, Fokusring. 12,5:1. Nur Linien und Ziffern, nie großflaechig. |
| `--signal-tief` | `#0E7F79` | Gedaempftes Cyan für Fuellflaechen, Balken des Lücken-Kalenders, Kurvenverlauf unterhalb der Linie. Verhindert das Ueberstrahlen großer Cyan-Flaechen. |
| `--gold` | `#C79A3F` | Bestwerte, Rekorde, Erfolgsplaketten, die 03:00-Marke, Prüflaketten-Ring. 7,7:1. Streng rationiert: höchstens drei Goldereignisse pro Bildschirm. |
| `--gold-glut` | `#E7C46A` | Nur für den Moment eines neuen Rekords und für den warmen Lichtkegel des Funkfeuers (dort unter 6 % Deckkraft). |
| `--bernstein` | `#E0873A` | Achtung: Wartungsbanner, Neustart-Countdown unter 15 Minuten, Kalenderbalken ohne Messwerte. 7,4:1. |
| `--stoerung` | `#E2564E` | Ausfall, Serverstatus offline, Lücken im Schrieb. 5,5:1 - AA für Fliesstext. Wird nie für Fehler der Website selbst verwendet, dafuer gibt es --bernstein (getrennte Fehlerzustaende). |

## 4 · Typografie

**Display —** Archivo Expanded (Google Fonts, variabel: Gewicht 100-900, Breite 62-125). Eingesetzt bei Breite 112-125 und Gewicht 700-900, Versalien, letter-spacing -0.01em bis -0.03em, Zeilenabstand 0.86-0.94. Grund: eine breitlaufende industrielle Grotesk aus der Beschilderungstradition mit sehr großer x-Höhe und kurzen Oberlaengen - sie traegt Plakatgroessen, ohne Sci-Fi-Kitsch zu werden, und hat als variable Schrift echten Umfang statt drei Schnitten. Kommerzielle Aufwertung mit gleicher Wirkung: GT America Expanded (Grilli Type) oder Soehne Breit (Klim Type Foundry).

**Fließtext —** IBM Plex Sans (Google Fonts, Schnitte 400/450/600, dazu 400 kursiv für Zitate in der Durchsage). Zeilenabstand 1.6 bei --t-1, Zeilenlaenge maximal 62 Zeichen, Fliesstext in --papier auf --gehaeuse. Grund: eine technische Dokumentationsschrift mit ingenieurhafter Herkunft, ruhig genug, um neben Archivo Expanded nicht zu konkurrieren, und mit einem echten 400er-Regular - im Bestand existiert kein einziges font-weight: 400. Kommerzielle Alternative: Aeonik Pro oder Simplon Norm.

**Monospace —** IBM Plex Mono (Google Fonts, 400/500/600) für alle Messwerte, Zeitstempel, Koordinaten, Adresse, Registerspalten und Achsenbeschriftungen - font-variant-numeric: tabular-nums durchgehend, letter-spacing 0 bei Zahlen, 0.08em bei Versalien-Kürzeln. Zusätzlich Martian Mono 700 (Google Fonts) ausschließlich für die Stationskennungen und Sektions-Kürzel in 11-12px Versalien mit 0.18em Laufweite - eine bewusst technische, kantige Zweitstimme, die die Kennungen von normalem Datentext trennt. Kommerzielle Alternative für beides zusammen: ABC Monument Grotesk Mono oder Suisse Int'l Mono.

**Skala —** Modulare Skala, Faktor 1.25 (große Terz), zehn Stufen, alle fluid:
--t-00: clamp(0.6875rem, 0.66rem + 0.14vw, 0.75rem)   /* Kennungen, Achsen */
--t-0:  clamp(0.8125rem, 0.79rem + 0.12vw, 0.875rem)  /* Legenden, Einheiten */
--t-1:  clamp(1rem, 0.96rem + 0.20vw, 1.125rem)       /* Fliesstext, 400 */
--t-2:  clamp(1.25rem, 1.15rem + 0.50vw, 1.5rem)      /* Lead, Registerzeile */
--t-3:  clamp(1.5625rem, 1.35rem + 1.05vw, 2rem)      /* Zwischentitel */
--t-4:  clamp(1.95rem, 1.55rem + 2.00vw, 2.75rem)     /* kleine Messwerte */
--t-5:  clamp(2.44rem, 1.70rem + 3.70vw, 4rem)        /* Sektionstitel klein */
--t-6:  clamp(3.05rem, 1.80rem + 6.20vw, 6rem)        /* Sektionstitel, H1 */
--t-7:  clamp(4.50rem, 1.00rem + 17.0vw, 14rem)       /* Der Messwert */
--t-8:  clamp(6.00rem, -1.0rem + 30.0vw, 22rem)       /* Rekordmoment, 404 */
Abstände auf 4px-Basis: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192. Sektionshoehen werden über Inhalt und vh gesteuert, nicht über ein uniformes Padding - der 96px-Rhythmus des Bestands entfaellt bewusst.

Der Bestand hat drei Schriftstaerken, alle zwischen 600 und 800, und kein einziges font-weight: 400 - deshalb bedeutet 800 dort nichts mehr. FUNKFEUER baut die Dynamik neu auf: Fliesstext steht wieder bei 400, Ueberschriften dürfen dafuer bis 900 gehen und über einen Breitenachsen-Sprung zusätzlich Wucht gewinnen. Der Abstand zwischen dem kleinsten und dem größten Element betraegt Faktor 20 statt wie bisher Faktor 2,3.

Archivo Expanded ist die richtige Displayschrift, weil sie aus der Beschilderungstradition kommt: hohe x-Höhe, sehr kurze Ober- und Unterlaengen, dadurch traegt sie enge Zeilenabstaende (0,86) ohne zu kollidieren - genau das, was Wortmarken-Blocksatz im Hero braucht. Sie ist über eine Breitenachse variabel, also kann derselbe Text auf schmalen Viewports schmaler werden, ohne die Schrift zu wechseln. Und sie ist im deutschen Webumfeld deutlich weniger verbraucht als Bebas, Oswald oder Space Grotesk.

IBM Plex Sans traegt die Fliesstexte, weil sie aus einem Technikkonzern stammt und genau den unaufgeregten Dokumentationston hat, den ein Leitstand braucht - mit vollständigen deutschen Diakritika und sehr guter Lesbarkeit bei 16px auf dunklem Grund.

Die Zahlen sind der eigentliche Inhalt dieser Seite, deshalb steht Mono nicht am Rand, sondern traegt jede Messung. font-variant-numeric: tabular-nums gilt für alle Zahlenkolonnen, wie im Bestand bereits richtig gemacht. Vier Schriftdateien insgesamt, alle selbst gehostet als woff2 mit font-display: swap - das löst gleichzeitig den render-blockierenden Fremdaufruf und das DSGVO-Thema, das die eigene Datenschutzseite heute selbst einraeumt.

## 5 · Der Hero

Beim Aufruf ist der Bildschirm schwarz. Kein Fade aus Weiß, kein Skeleton-Grau. Nach 120 ms zeichnet sich das Raster ein, 1px-Linien im 96px-Takt, aus der Mitte nach aussen freigelegt - die Station heizt vor.

Waagerecht auf halber Höhe liegt eine einzelne, vollkommen gerade Cyan-Linie: die Nulllinie des Schreibers. Sie bleibt gerade, solange keine Daten da sind. Das ist der ehrlichste Ladezustand, den diese Seite haben kann. Trifft die Antwort von /api/stats ein, schlaegt die Linie aus und zeichnet in 900 ms von links nach rechts die echte Spielerkurve der letzten 24 Stunden. Der Ladevorgang IST die Kalibrierung des Instruments.

Rechts, zu etwa einem Drittel aus dem Bild laufend, steht die Peilscheibe: ein 24-Stunden-Ring aus 96 Strichen zu je 15 Minuten. Cyan, wo der Server lief, Rot, wo er weg war, Grau ohne Messung. Eine Goldmarke bei 03:00 markiert den Neustart. Ein Haarlinien-Zeiger steht auf der echten Uhrzeit und wandert sichtbar weiter.

Links, über das linke Drittel der Scheibe geschoben, sitzt die H1 in Archivo Expanded 800, Versalien, Zeilenabstand 0,86: AUF SENDUNG SEIT TAG [inGameDays] - die Zahl kommt aus /api/status, kein Texter kann diese Ueberschrift ohne laufenden Server schreiben. Darunter eine Zeile Fliesstext in 400: privater PvE-Server aus Deutschland, 3x EP, 2x Fangrate, kein PvP, keine Wipes, kostenlos.

Darunter das Kanalfeld: ein Rechteck mit 1px-Kante, pve.palheim.de:8211 in Mono, rechts ein Kopieren-Riegel mit 3px Schaltweg. Daneben, klein und unterstrichen: Wie verbinde ich mich?

Über allem streicht ein warmer Lichtkegel von unten links langsam über das Raster. Ton ist standardmaessig aus; ein Schalter in der Kopfschiene aktiviert ein tiefes Stationsbrummen und ein Relaisklicken beim Kopieren. Kein Scrollpfeil - stattdessen pulst die oberste Marke der Randspur genau einmal.

## 6 · Seitenstruktur

| Sektion | Zweck | Form |
|---|---|---|
| **00 DAUERINSTRUMENTE (Kopfschiene + Randspur)** | Orientierung, Dauerpraesenz der Live-Daten und der Serveradresse auf jeder Seite; löst gleichzeitig das fehlende Scrollspy und die CTA-Distanz des Bestands. | Zwei Instrumente, die nie verschwinden. Oben eine 56px-Schiene in #0B1014 mit 1px-Unterkante: links die Stationskennung PALHEIM PVE-DE, mittig die Live-Telemetrie in Mono (Spieler/Slots, Server-FPS, Countdown bis 03:00), rechts Discord als reiner Textlink. Links am Fensterrand eine 72px breite Spur mit dem durchgehenden 7-Tage-Schrieb aus /api/stats: oben jetzt, unten vor sieben Tagen, echte Ausfälle als echte Lücken. Sektionsmarken sitzen als Ticks auf der Kurve und sind anklickbare Navigationsziele. Auf Mobilgeraeten schrumpft die Spur auf eine 4px-Kantenlinie plus eine untere Peilleiste. Kein Hamburger-Menue mit neun Punkten - die Kurve ist die Navigation. |
| **01 KENNUNG (Hero)** | In einer Sekunde beweisen, dass der Server jetzt läuft, und in fünf Sekunden die Adresse kopierbar machen. | 100vh, full-bleed, ohne Container, bewusst asymmetrisch: Text linksbuendig auf der optischen Drittelachse, die 24-Stunden-Peilscheibe rechts zu einem Drittel aus dem Bild laufend, beide ueberlappen. Kein Bild, kein Badge, kein Doppelbutton, kein Scrollpfeil. Das Kanalfeld mit der Serveradresse ist das größte Bedienelement des Viewports und rechteckig, nicht pillenfoermig. Hintergrund: Raster plus ein wandernder warmer Lichtkegel. |
| **02 DER SCHRIEB (Live-Telemetrie)** | Die Live-Daten vom Beiwerk zum Helden machen: die Zahl ist das größte Element der Seite, nicht die Marketing-Headline. | Etwa 140vh, full-bleed Oszilloskop-Wand. EINE große Kurve über die volle Breite; die aktuelle Spielerzahl steht als 14rem-Ziffer daneben und ist über eine 1px-Anreisserlinie physisch mit dem letzten Messpunkt verbunden - wie eine Bemaßung in einer technischen Zeichnung. Rekord, Gesamtspielzeit, eindeutige Rufzeichen und In-Game-Tage hängen an weiteren Anreisserlinien an genau der Kurvenstelle, auf die sie sich beziehen. Darunter eine zweite Kurve in Gold für die Server-FPS auf derselben Zeitachse. Umschalter 24h/7d und Spieler/FPS als flache Mono-Reiter. Ein optionales Mitschrift-Band ganz oben zeigt Wiederkehrern, was seit ihrem letzten Besuch passiert ist. Ausdruecklich KEINE Stat-Kacheln - die zehn identischen Kacheln des Bestands entfallen ersatzlos. |
| **03 LUECKENPROTOKOLL (Verfügbarkeit & Ausfälle)** | Das stärkste Vertrauensargument eines privaten Servers früh und ungeschoent zeigen - inklusive der eigenen Fehler. | 70vh, full-bleed Streifenkalender: 168 vertikale Balken (7 Tage x 24 Stunden), je 3px breit, 4px Abstand, Farbe direkt aus den Messpunkten - cyan gelaufen, rot Ausfall, grau ohne Messung. Links die Wochentage in Mono, oben die beiden Verfügbarkeitswerte groß gesetzt. Darunter, auf einem gravierten Metallband, die Ausfallliste im Klartext mit Datum, Uhrzeit und Minuten. Leerfall wird zur Aussage: KEINE LUECKE IN SIEBEN TAGEN in Großform statt eines versteckten Blocks. |
| **04 WELTGESETZE (Raten + Regeln)** | Die Einstellungen als nachvollziehbare Konfiguration zeigen statt als Verkaufsargument - und Regeln mit echter Konsequenz statt als Feature-Liste. | Eine Schalttafel, kein Raster: fünf unterschiedlich große, gezeichnete Instrumente auf einer Flaeche, verbunden durch 1px-Schaltplanlinien. Drehskalen für 3x EP, 2x Fangrate, 2x Drop-Rate; zwei Kippschalter mit Schutzbuegel für PvP und Todesstrafe, beide sichtbar in OFF; zwei gravierte Zahlenfelder für 4 Basen je Gilde und 32 Plätze. Darunter, auf demselben Schaltschrank, ein graviertes Schild mit der Hausordnung - Regeln in zwei Klassen (Bannbar / Hausordnung), rechtsbuendig die Konsequenz, keine grünen Haken. Raten und Regeln sind hier bewusst EINE Sektion: beides sind Weltgesetze und wurden im Bestand dreifach erzählt. |
| **05 DIE PEILUNG (Live-Karte)** | Das einzige unkopierbare Bild der Seite: echte Basen, echte Positionen - Community als Ort statt als Behauptung. | 100vh, full-bleed dunkler Radarschirm ohne jeden Rahmen. Vektor-Terrain der Insel als Höhenlinien, Peilringe im 100-km-Raster, Achsenbeschriftung mit den echten Kalibrierungswerten. Gildenbasen glimmen als goldene Punkte, Live-Spieler als cyanfarbene, driftende Marker mit Rufzeichen. Marker sind fokussierbare Links auf das Profil. Ein flacher Textlink führt zur Vollbildkarte. Die Karte ist damit erstmals Beweismittel auf der Startseite und nicht nur ein Nav-Punkt zweiter Ordnung. |
| **06 RUFZEICHEN (Leaderboard & Erfolge)** | Aus Punkten auf der Karte werden Menschen; gleichzeitig der Einstieg in die Profile als stärkster Wiederkehr-Mechanismus. | Ein typografisches Register wie ein Rufzeichenverzeichnis: Laufnummer, Name, Führungspunkte, dann rechtsbuendige Zahlenspalten mit tabellarischen Ziffern und 1px-Haarlinien - keine Tabelle in einer Karte, keine Zebrastreifen. Aendern sich Werte im 30-Sekunden-Takt, klappt die betroffene Zeile wie eine Fallblattanzeige um. Darunter, in derselben Register-Logik, die 26 Erfolge als gravierte Plaketten mit eigenen Glyphen (kein Emoji) und ein einzelnes Eingabefeld, das direkt auf /spieler/<name> führt. Das zweite, fast identische Formular des Bestands entfaellt. |
| **07 DIE PLAKETTE (Was kostet das? Wo ist der Haken?)** | Den größten unausgesprochenen Zweifel in einem einzigen ruhigen Moment auflösen - Vertrauensmoment, kein Verkaufsmoment. | 80vh, fast leer, das Raster verschwindet. In der Mitte ein einziges Objekt in einem warmen Lichtkegel: eine gepraegte Plakette mit Goldring, Jahreszahl und der Gravur KEIN HAKEN - formal an die deutsche Prüfplakette angelehnt, ein Objekt, das jeder in dieser Zielgruppe sofort liest. Rechts daneben drei Zeilen als Positionsliste eines Prüfprotokolls: POSTEN - Hardware, Strom, Anschluss privat getragen. GEGENLEISTUNG - keine, kein Rang, kein Item, kein Vorteil. FREIWILLIG - Kaffee ausgeben, klein und sekundaer. Explizit keine Preistafel, keine Spalten, kein Vergleich. |
| **08 DURCHSAGE (Wer sendet hier)** | Autorschaft herstellen - auf der gesamten oeffentlichen Seite kommt heute kein Mensch vor, obwohl bei einem privaten Server die Person das Produkt ist. | Eine schmale, linksbuendige Spalte von maximal 62 Zeichen in Mono, aufgebaut wie ein Fernschreiber-Protokoll: Kopfzeile mit Nummer und Datum, Absender, Trennlinie, dann ein kurzer Text in der Ich-Form vom Betreiber - warum es das gibt, warum es nichts kostet, wo man ihn erreicht. Unterschrift mit dem Namen aus dem Impressum. Kein Portraitfoto, kein Zitatkasten, kein Stockbild. Der Text erscheint beim Eintritt zeichenweise, aber nur einmal und mit Ueberspringen-Möglichkeit. |
| **09 ANSCHLUSS (Beitreten)** | Die eigentliche Handlung technisch führen statt sie zu bewerben - und das mobile Beitrittsproblem ehrlich lösen. | Ein Anschlussplan statt nummerierter Schrittkarten: eine waagerechte Leitung von DEIN PC bis zur Station, mit drei Klemmpunkten (Steam starten, Community-Server, Adresse einfuegen und verbinden). Die Leitung fuellt sich beim Scrollen von links nach rechts; erreicht sie die Station, leuchtet dort ein kleines Signal auf. Am mittleren Klemmpunkt sitzt das zweite Kanalfeld mit Kopieren-Riegel. Direkt darunter zwei fett gesetzte Klartextsaetze: KEIN PASSWORT NOETIG und der ehrliche Hinweis auf Steam-only. Rechts ein statischer QR-Code (vorgerendertes SVG, null JavaScript) für den Wechsel vom Handy an den PC. |
| **10 FUNKVERKEHR (FAQ, reduziert)** | Restzweifel raeumen, ohne die Seite mit fünf Wiederholungen zu verlaengern; SEO-Substanz bleibt strukturiert erhalten. | Ein Funkverkehrs-Protokoll aus genau fünf echten Fragen, alle offen sichtbar - kein Akkordeon, kein rotierendes Plus. Frage in Mono mit vorangestelltem Fragezeichen, Antwort im Fliesstext 400 mit maximal 62 Zeichen Zeilenlaenge, dazwischen eine 1px-Linie. Nur Fragen, die die Seite nicht schon beantwortet hat: Verbindungsproblem, Xbox/Game Pass, Passwort, was um 03:00 passiert, Kontakt. Die restlichen Antworten bleiben vollständig im FAQPage-JSON-LD erhalten - maschinenlesbare Redundanz kostet nichts, sichtbare kostet Glaubwuerdigkeit. |
| **11 FREQUENZWECHSEL (Discord)** | Discord als zweiten Kanal anbieten, ohne ihn über die eigentliche Konversion zu stellen. | Full-bleed, ein einziges Element im Bild. Die Randspur, die 500vh lang links lief, biegt hier sichtbar nach rechts in die Flaeche ab und endet an einem zweiten Kanal - der Discord-Aufforderung. Ein Satz, was dort wirklich passiert (Support, Ankündigungen, Neustart-Infos), ohne unbelegte Event-Versprechen. Optisch klar sekundaer zur Adresse: kein gefuellter Großknopf, sondern ein gerahmtes Feld in Papierfarbe. |
| **12 TYPENSCHILD (Footer)** | Rechtliche Pflichtangaben und Stationsdaten als Teil der Marke behandeln statt als Restflaeche - und den Disclaimer ernst nehmen. | Der Footer ist ein graviertes Geraeteschild: eine matte Metallflaeche mit vertiefter Typografie, Stationsdaten in Mono - Adresse, Slots, Standort, Backup-Rhythmus, Neustartzeit, ohne Mods, ohne Wipes. Der Besucherzaehler läuft als mechanisches Zaehlwerk mit einzelnen Ziffernrollen (cookiefrei, wie bisher). Rechtslinks als gleichwertige Zeile, nicht als Kleingedrucktes. Der Pocketpair-Disclaimer steht in voller Lesegroesse in --papier-stumpf mit 6,1:1 - lesbar statt versteckt. |

## 7 · Scroll-Journey

1. 0 vh - STILLSTAND: Schwarz, Raster, eine gerade Cyan-Linie. Die Peilscheibe baut ihre 96 Striche im Uhrzeigersinn auf. Dramaturgisch: Ein Geraet wird eingeschaltet. Erwartung entsteht, bevor irgendetwas behauptet wird.
2. 0-10 vh - AUSSCHLAG: Die Daten treffen ein, die Nulllinie schlaegt aus und zeichnet die 24-Stunden-Kurve. Die H1 faehrt zeilenweise maskiert ein, zuletzt das Kanalfeld. Dramaturgisch: Der Beweis kommt vor dem Versprechen.
3. 10-30 vh - UEBERGABE: Beim Verlassen des Heros wandert das Adressfeld in die Kopfschiene (View Transition), gleichzeitig setzt die Randspur links ihre erste Marke. Dramaturgisch: Die Kernaktion verlaesst den Bildschirm nicht - sie dockt an.
4. 30-60 vh - EINSCHWENKEN AUF DEN SCHRIEB: Fuer Wiederkehrer erscheint das Mitschrift-Band. Danach kippt die Kurve aus der Hero-Groesse in die Vollflaeche, die aktuelle Spielerzahl waechst auf 14rem und hängt an einer Anreisserlinie. Dramaturgisch: Maßstabssprung - die Zahl wird zur Landschaft.
5. 60-110 vh - AUSSAGE STATT KACHELN: Rekord, Spielzeit, Rufzeichen und In-Game-Tage laufen nacheinander an ihren Anreisserlinien ein (Stagger 90 ms). Beim Umschalten auf 7 Tage morpht die Kurve, statt neu zu laden. Dramaturgisch: Vier Argumente, die aus einer einzigen Linie herauswachsen - kein Dashboard.
6. 110-170 vh - DAS GESTAENDNIS: Uebergang in das Lücken-Protokoll. 168 Stundenbalken wachsen von der Grundlinie, Ausfallbalken bewusst 120 ms verzoegert. Die Luft wird um genau den Betrag koerniger, um den die Verfügbarkeit unter 100 % liegt. Dramaturgisch: Der Server zeigt seine Schwaechen - und wird dadurch glaubwuerdig.
7. 170-230 vh - HANDGRIFF: Die Schalttafel schwenkt ein, Drehzeiger fahren auf 3x/2x/2x, die Kippschalter fallen hart in OFF. Der Scanner-Cursor wird zum ersten Mal wirksam und legt echte Konfigurationsschluessel frei. Dramaturgisch: Vom Zuschauen zum Anfassen - erster echter Handlungsimpuls.
8. 230-300 vh - RAUMWECHSEL: Vollflaechiger Radarschirm. Das Raster der vorherigen Sektionen löst sich in Höhenlinien auf, Peilringe ziehen sich auf, echte Gildenbasen glimmen auf, Spielerpunkte driften. Dramaturgisch: Aus Zahlen wird ein Ort. Der erste emotionale Höhepunkt.
9. 300-350 vh - NAMEN: Die Fallblattanzeige der Rufzeichen. Aus anonymen Punkten auf der Karte werden Menschen mit Level, Stunden und letzter Sichtung; Hover verbindet Zeile und Kartenmarker. Dramaturgisch: Die Community bekommt Gesichter, nachdem der Raum etabliert ist.
10. 350-410 vh - DER HAKEN: Alles wird ruhig, das Raster verschwindet fast vollständig, ein einziger warmer Lichtkegel liegt auf der Prüflaakette. Der Goldring zieht sich zu, ein Aufsetzimpuls. Rechts drei Zeilen: Posten, Gegenleistung, freiwillig. Dramaturgisch: Der Moment maximaler Stille - hier fällt die Vertrauensentscheidung.
11. 410-460 vh - STIMME: Die Durchsage läuft in Mono ein, ein Mensch spricht in der Ich-Form und unterschreibt mit Namen. Dramaturgisch: Nach dem Beweis das Motiv. Ohne diese Sektion bleibt die Seite eine Maschine.
12. 460-540 vh - ANSCHLUSS UND ABSCHLUSS: Die Anschlussleitung fuellt sich von links nach rechts bis zur Station, daneben der QR-Code für den Wechsel ans PC. Danach nur noch fünf echte Fragen, der Frequenzwechsel zu Discord - bei dem die Randspur sichtbar abbiegt - und das gravierte Typenschild. Dramaturgisch: Handlung, Restzweifel, zweiter Kanal, Stationskennung. Ende.

## 8 · Animationen

- DER SCHRIEB / Randspur-Aufbau: Eine SVG-Polyline (viewBox 72 x 4000, vector-effect: non-scaling-stroke) wird aus den /api/stats-samples der letzten 7 Tage erzeugt und links fix positioniert. Der Zeichenfortschritt hängt an der Scrollposition: `animation-timeline: scroll(root block)` auf einer @keyframes-Regel, die stroke-dashoffset von 100% auf 0 führt; Fallback für Safari/aeltere Engines: GSAP ScrollTrigger mit scrub: 0.4 auf dasselbe Property. Ausfall-Lücken entstehen nicht per Animation, sondern weil die Polyline dort echte Path-Breaks (M statt L bei count === null) hat. REDUZIERT: Kurve sofort vollständig gezeichnet, Fortschritt nur als 2px-Cyan-Marke, die per IntersectionObserver ohne Transition auf den aktiven Abschnitt springt.
- 24-H-PEILSCHEIBE (Hero): Ring aus 96 SVG-Strichen (je 15 min) mit stroke-Farbe aus availability-Daten; Zeiger ist ein einzelner <line> mit `transform: rotate(var(--peil))`, wobei --peil ein @property <angle> ist, das ein requestAnimationFrame-Loop alle 1000 ms auf die echte Uhrzeit setzt (nicht auf einen Dauer-Loop). Einlauf beim Laden: die 96 Striche erscheinen im Uhrzeigersinn per stroke-opacity-Transition mit `transition-delay: calc(var(--i) * 7ms)`, Gesamtdauer 670 ms, easing linear. Goldmarke 03:00 blendet zuletzt ein (180 ms). REDUZIERT: alle Striche sofort sichtbar, Zeiger statisch auf der aktuellen Minute, kein Sekundenlauf, keine Glut.
- KANALLEISTE-UEBERGABE: Das Adressfeld aus dem Hero wandert beim Verlassen des ersten Viewports in die Kopfschiene. Umsetzung über die View Transitions API: beide Instanzen tragen `view-transition-name: kanal`, der Wechsel wird bei einem IntersectionObserver-Schwellwert (Hero < 30 % sichtbar) mit document.startViewTransition() ausgeloest, Dauer 320 ms, cubic-bezier(.22,.61,.36,1). Fallback ohne API: FLIP-Messung + WAAPI-Animation derselben Kurve. REDUZIERT: kein Morph, das Hero-Feld wird ausgeblendet und die Kopfschienen-Variante ohne Transition eingeblendet.
- MESSWERT-EINLAUF mit Gedaechtnis: Die großen Zahlen (aktuelle Spieler, Rekord, Verfügbarkeit) zaehlen nicht von 0, sondern vom Wert des letzten Besuchs (localStorage, gleicher Mechanismus wie visits.js) auf den aktuellen. WAAPI mit einer `linear()`-Easing-Treppe in 12 Stützstellen, Dauer 900 ms, tabellarische Ziffern verhindern Layoutzittern. Steigt der Wert, faerbt sich die Ziffer für 400 ms cyan; fällt er, bleibt sie papierfarben. REDUZIERT: Zielwert sofort, Farbmarkierung bleibt (Farbe ist Information, keine Bewegung).
- FALLBLATTANZEIGE (Rufzeichen/Leaderboard): Jede Zeile besteht aus zwei uebereinanderliegenden Haelften; bei einem Datenwechsel aus dem 30-s-Poll animiert WAAPI rotateX(0deg -> -90deg) der oberen und rotateX(90deg -> 0deg) der unteren Haelfte, 260 ms, cubic-bezier(.4,0,.2,1), Stagger 40 ms von oben nach unten, `transform-style: preserve-3d`, perspective 900px. Faellt nur an, wenn sich der Wert tatsaechlich geaendert hat - nie als Begruessungseffekt. REDUZIERT: Crossfade der beiden Textknoten, 120 ms, keine 3D-Transformation.
- SCANNER-CURSOR: Eine Overlay-Ebene über Rasterflaechen traegt `mask-image: radial-gradient(circle 240px at var(--mx) var(--my), #000 0%, transparent 70%)` und zeigt darunter das Raster in doppelter Helligkeit plus die eingravierten Konfigurationsschluessel. --mx/--my werden in einem rAF-gedrosselten pointermove gesetzt, nur unter `@media (hover: hover) and (pointer: fine)`. Bewegung des Kreises folgt dem Zeiger mit lerp-Faktor 0.18, damit er traeg wie eine Optik wirkt. REDUZIERT / Touch: Overlay entfaellt, die Gravuren sind dauerhaft auf dem zweiten Kontrastniveau sichtbar.
- VOLUMETRISCHES LICHT des Funkfeuers: Ein <canvas> hinter dem Hero zeichnet zwei rotierende Kegel als konische Gradienten (Gold 4 % / Cyan 3 %) mit `globalCompositeOperation: lighter`, 30 fps hart gedrosselt, pausiert bei document.hidden und ausserhalb des Viewports (IntersectionObserver). Darueber liegt eine 128x128-Rauschtextur als data-URI mit `mix-blend-mode: overlay` bei 4 % - Statik statt animiertes Filmkorn, das spart GPU. Rotationsdauer 24 s pro Umlauf. REDUZIERT: Canvas wird gar nicht erst instanziiert, stattdessen ein statischer CSS-conic-gradient im gleichen Winkel.
- SIGNALRAUSCHEN mit Bedeutung: Ein zweites Canvas legt feines Rauschen über die Sektion LUECKENPROTOKOLL. Die Amplitude ist an echte Daten gebunden: `amplitude = (100 - availability.week) / 100`. Bei 100 % Verfügbarkeit ist die Luft vollkommen klar, bei einer Stoerwoche sichtbar koernig. Partikelzahl fest bei 90, Bewegung 12 fps, Alpha max 0.06. REDUZIERT: Rauschen aus, dafuer ein statischer Balken, der denselben Wert numerisch nennt.
- SEKTIONSTITEL-EINLAUF: Jede Zeile eines Titels sitzt in einem Wrapper mit `overflow: hidden`; die Zeile faehrt mit translateY(0.42em) und `clip-path: inset(0 0 100% 0)` auf 0, 720 ms, cubic-bezier(.16,1,.3,1), Stagger 60 ms je Zeile, einmalig per IntersectionObserver (threshold 0.35, rootMargin -10%). Kein Sektionstitel bewegt sich zweimal. REDUZIERT: nur opacity 0 -> 1 in 200 ms, kein Versatz.
- SCHALTTAFEL-INSTRUMENTE: Beim Eintritt in WELTGESETZE fahren die Drehskalen-Zeiger von der Nullstellung auf ihren Wert (3x, 2x, 2x, 4 Basen). WAAPI-Rotation mit leichtem Überschwingen, cubic-bezier(.34,1.4,.64,1), 900 ms, Stagger 80 ms; die Kippschalter für PvP und Todesstrafe klappen mit einer harten 2-Frame-Bewegung (0 ms -> 90 ms, steps(2)) in die OFF-Lage - mechanisch, nicht weich. REDUZIERT: alle Zeiger und Schalter werden direkt im Endzustand gerendert.
- PEILUNG / Kartenbewegung: Spielerpunkte springen zwischen den 30-s-Polls nicht, sondern interpolieren ihre Position über 600 ms mit ease-out (WAAPI auf cx/cy bzw. transform). Basen-Marker pulsieren genau einmal pro tatsaechlichem Poll (Radius +2px, 260 ms) - der Takt ist der Datentakt, keine Deko-Schleife. Die Peilringe drehen nicht. REDUZIERT: Positionen werden direkt gesetzt, kein Puls, Marker bleiben statisch.
- PLAKETTE (Kosten-Sektion): Der Goldring zieht sich per stroke-dashoffset in 900 ms zu (ease-out), danach ein einziger Aufsetz-Impuls der ganzen Plakette scale(1.05 -> 1) in 180 ms mit cubic-bezier(.2,.9,.3,1) und ein gleichzeitiger, kurzer Schattenwurf. Genau ein Ereignis, keine Wiederholung. REDUZIERT: Ring vollständig gezeichnet, kein Impuls, kein Schattenwechsel.
- LUECKENPROTOKOLL-BALKEN: Die 168 Stundenbalken wachsen von der Grundlinie auf ihre Höhe per `transform: scaleY()` mit `transition-delay: calc(var(--i) * 5ms)`, Gesamtdauer 840 ms + 250 ms Einzelbalken, ease-out. Ausfallbalken (rot) wachsen bewusst 120 ms später als ihre Nachbarn - die Lücke wird als Ereignis lesbar. REDUZIERT: alle Balken sofort in Endhoehe, Farbcodierung unveraendert.

## 9 · Bildsprache

Kein Fotorealismus, kein KI-Landschafts-Artwork, keine Pals als Maskottchen. Die gesamte Bildwelt besteht aus SIGNAL: gezeichneten Instrumenten, Messgeometrie und Daten, die sich selbst abbilden.

MOTIVE: (1) Die Peilscheibe - eine 24-Stunden-Ringskala mit 96 Strichen, Zeiger, Goldmarke bei 03:00. (2) Der Schrieb - eine einzige, durchgehende Kurve, das wiederkehrende Bildzeichen der Marke. (3) Vektor-Terrain der Palworld-Insel als Höhenlinien und Peilringe, gerechnet aus der echten Kalibrierung (xTop 349400 / xBottom -1099400 / yLeft -724400 / yRight 724400) - die Insel ist exakt quadratisch, das darf man sehen. (4) Kalibrierungskreuze, Skalenleitern, Anreisserlinien aus der technischen Zeichnung. (5) Das Funkfeuer selbst: nie als Illustration eines Turms, immer nur als sein Lichtkegel, der über ein Raster streicht.

LICHTFUEHRUNG: Eine einzige warme Quelle (Gold, tief, von unten links) - das Lampenlicht der Station. Alles andere leuchtet selbst: Daten sind emissiv (Cyan), Metall ist matt und reflektiert nur an 1px-Kanten. Schwarz bleibt schwarz, es gibt keinen aufgehellten Hintergrund.

PERSPEKTIVE: frontal, orthografisch, kein Fluchtpunkt, keine Isometrie (das gehört WERKBANK). Tiefe entsteht ausschließlich durch Ebenen, Nebelbaender und Unschaerfe der hintersten Rasterlage.

BEHANDLUNG: 1px- und 1,5px-Linien, matte anodisierte Flaechen, feines statisches Korn bei 4 %, Halation nur an Cyan-Kanten (2px, sehr dezent).

DO: SVG und Canvas statt Bitmaps; jedes Bildelement traegt eine Zahl; Beschriftungen in Mono; Kanten hart.
DONT: Lens Flares, Bokeh, Chrom-Verlaeufe, Glasscheiben mit Blur, Sci-Fi-HUD-Klischees (hexagonale Rahmen, Zielkreuze mit Zacken), Partikel ohne Datenbezug, gerenderte 3D-Objekte, Stockfotos, Emoji.

## 10 · Interaktionen

- KOPIER-RIEGEL: Klick auf 'Kopieren' laesst das Element 3px physisch einfahren (transform: translateY(3px), 90 ms, steps(2) - mechanisch, nicht federnd), die Beschriftung wechselt für 1800 ms auf 'KANAL IN DER ZWISCHENABLAGE' und die Randspur setzt an der aktuellen Position eine kurze Marke, als hätte der Schreiber getickt. Zweck: die zentrale Konversionshandlung bekommt eine koerperliche Quittung. Pflicht-Fallback, der heute fehlt: schlaegt navigator.clipboard fehl, wird die Adresse per Range/Selection markiert und der Hinweis 'markiert - Strg+C' eingeblendet, statt dass sichtbar nichts passiert.
- RANDSPUR ALS NAVIGATION: Die Randspur ist ein echtes <nav> mit Links. Hover oder Fokus auf einer Marke zeigt Zeitpunkt und Spielerzahl dieses Messpunkts als Mono-Callout; Klick springt zur zugehoerigen Sektion (mit scroll-padding-top in Höhe der Kopfschiene - der im Bestand fehlende Fix). Pfeil-hoch/runter bewegt zwischen den Marken, Enter springt. Zweck: Orientierung auf einer langen Seite ohne Scrollspy-Attrappe.
- SCANNER-CURSOR AUF DER SCHALTTAFEL: Faehrt der Zeiger über ein Instrument, hebt der Scanner das Raster an und legt die eingravierte Klartext-Herkunft des Wertes frei - der tatsaechliche Konfigurationsschluessel aus der laufenden PalWorldSettings.ini (ExpRate, PalCaptureRate, DeathPenalty, BaseCampMaxNumInGuild; die exakten Schluessel und Werte werden bei der Umsetzung 1:1 aus der Serverkonfiguration uebernommen, nicht aus dem Gedaechtnis geschrieben). Zweck: Beweisfuehrung statt Marketingzahl. Auf Touch sind die Gravuren dauerhaft sichtbar.
- QUERVERWEIS RUFZEICHEN <-> PEILUNG: Hover oder Fokus auf einer Leaderboard-Zeile hebt denselben Spieler auf der Live-Karte hervor (gemeinsames data-player-Attribut, Marker bekommt einen 2px-Cyan-Ring und eine Anreisserlinie). Umgekehrt hebt Hover auf einem Kartenmarker die Registerzeile. Zweck: aus zwei getrennten Datenansichten wird ein Raum - und beides führt per Klick auf /spieler/<name>.
- KLICKBARE KARTENMARKER: Spielerpunkte auf der Karte sind fokussierbare Links auf das Profil (heute reines, nicht klickbares SVG), Gildenbasen zeigen bei Hover einen Callout mit Gildenname und Alter der Basendaten. Zweck: der stärkste Retention-Mechanismus - Profile mit 26 Erfolgen - bekommt endlich einen Einstieg von der Karte aus.
- TOUCH AUF DER KARTE: Pinch-Zoom über zwei Pointer-Events und Ein-Finger-Verschieben nur innerhalb der Karte; touch-action wird auf 'pan-y pinch-zoom' gesetzt statt auf 'none', damit die Seite unter der Karte weiter scrollbar bleibt. Doppeltipp setzt zurück. Zweck: behebt das im Bestand eingefrorene Scrollen auf Mobilgeraeten.
- DREI GETRENNTE BETRIEBSZUSTAENDE: <html data-signal="an|spielserver-aus|leitstand-aus"> steuert die gesamte Seite. Bei spielserver-aus wird Cyan durch Rot ersetzt, der Peilzeiger hält an, die Kurve läuft flach weiter und im Hero steht der Zeitpunkt des letzten Messpunkts. Bei leitstand-aus (eigene API nicht erreichbar) bleibt alles bernsteinfarben mit dem ehrlichen Satz, dass die Website gerade keine Daten bekommt - plus Erneut-versuchen-Knopf. Zweck: behebt den Bestandsfehler, bei dem jeder Netzwerkfehler dem Besucher 'Server offline' erzählt.
- NEUSTART-ANZEIGE: Klick oder langes Antippen der Peilscheibe blendet den numerischen Countdown bis 03:00 ein und markiert das Neustartfenster im Lücken-Kalender. Zweck: eine bekannte Betriebsroutine wird vom Ueberraschungsmoment zum Vertrauenssignal.
- TON-SCHALTER: Ein einziger Schalter in der Kopfschiene, standardmaessig AUS, Zustand in localStorage. Aktiviert ein tiefes Stationsbrummen (-38 dB) und Relaisklicken bei Kopiervorgaengen. Zweck: Atmosphaere für die, die sie wollen. Wichtig: prefers-reduced-motion deckt Ton nicht ab, deshalb braucht er einen eigenen, sichtbaren Schalter - nicht nur ein Mute-Icon.
- FOKUS ALS SYSTEM: Jedes interaktive Element bekommt :focus-visible mit 2px --signal, 2px Offset und einem 4px dunklen Halo darunter (box-shadow 0 0 0 6px #05070A), damit der Ring auch auf hellen Instrumentenflaechen und über der Karte steht. Zweck: der Bestand hat fünf Fokusregeln für die ganze Seite; auf dunklem Grund ist das eine echte Navigationsstoerung und in Deutschland zunehmend ein rechtliches Thema.

## 11 · Wireframe

```
LEGENDE   R = RANDSPUR: durchgehender 7-Tage-Schrieb aus /api/stats,
              fix am linken Rand, 72px, auf JEDER Seite. Oben = jetzt,
              unten = vor 7 Tagen. Lücken = echte Ausfälle.
          ~ Kurve/Live-Daten   # Vollflaeche   [ ] Bedienelement
          : Rasterlinie 1px    = Gravur/Metallkante   * Goldmarke
          Alle Zahlen unten sind Datenplaetze, keine Behauptungen.

KOPFSCHIENE  position:sticky, 56px, #0B1014, 1px Unterkante
+==========================================================================+
|   PALHEIM  PVE-DE | 17/32 . 58 FPS . NEUSTART IN 05:47 |[DISCORD]        |
+==========================================================================+

01  KENNUNG  ---  100vh, full-bleed, kein Container
+--------------------------------------------------------------------------+
|~                                                                         |
||                                       ....--------....                  |
||                                   ..--                --..              |
||     AUF SENDUNG                 .-      24-H-PEILSCHEIBE   -.           |
||     SEIT TAG 412               /   96 Striche a 15 min       \          |
||     ==========                |    cyan = lief, rot = Lücke  |         |
||     (H1, Archivo Exp 800,     |    * 03:00 Neustart in Gold   |         |
||      clamp bis 6rem,           \   Zeiger = echte Uhrzeit    /          |
||      Zahl aus /api/status)      -.                        .-            |
||                                   --..              ..--                |
||     Privater PvE-Server aus D.        ----......----                    |
||     3x EP . 2x Fang . kein PvP                                          |
||     keine Wipes . kostenlos          (blutet rechts aus dem Bild)       |
||                                                                         |
||     +---------------------------------------------+                     |
||     | KANAL   pve.palheim.de:8211      [ KOPIEREN ]|  <- PRIMAER        |
||     +---------------------------------------------+                     |
||     Wie verbinde ich mich?  (Textlink -> Overlay Anschlussplan)         |
||                                                                         |
||     Lichtkegel des Feuers streicht langsam von unten links              |
||     über das Raster.  KEIN Scrollpfeil.                                |
+--------------------------------------------------------------------------+

02  DER SCHRIEB  ---  ca. 140vh, full-bleed, Oszilloskop-Wand
+--------------------------------------------------------------------------+
|:    [ nur für Wiederkehrer: MITSCHRIFT-BAND, 88px hoch ]                |
|:    SEIT DEINER LETZTEN PEILUNG (vor 6 Tagen): neuer Rekord 21,          |
|:    3 neue Rufzeichen, 0 Ausfälle             [ ansehen ]               |
|~  .........................................................              |
||                                                                         |
||          1 7            ~~~~~~/\~~~~~~~~~~~/\~~~~~~~~~~~                |
||          ------   ~~~~~/          \~~~~~~~/    \~~~~~~                  |
||            3 2  ~/                                   \~~                |
||     (Messwert 14rem, Archivo Exp 900, tabellarisch)                     |
||          |                                                              |
||          +----- Anreisser-Linie 1px zur Kurve (techn. Zeichnung)        |
||                                                                         |
||     REKORD 24        SPIELZEIT      RUFZEICHEN     IN-GAME-TAGE         |
||     * 12.04.        1 240 h         138            412                  |
||     (Werte hängen an Anreisserlinien an der Kurve, KEINE Kacheln)      |
||                                                                         |
||     [24 H]-[7 T]   [SPIELER]-[FPS]      2. Kurve Gold = FPS             |
||     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~             |
||     00:00   04:00   08:00   12:00   16:00   20:00   jetzt               |
+--------------------------------------------------------------------------+

03  LUECKENPROTOKOLL  ---  Streifenkalender, full-bleed, 70vh
+--------------------------------------------------------------------------+
||     VERFUEGBARKEIT   99,4 % / 24 h      99,1 % / 7 Tage                 |
||                                                                         |
||     Mo ||||||||||||||||||||||||   168 Balken = 168 Stunden              |
||     Di |||||||||||||||||||| |||   1 Balken = 1 h, 3px breit             |
||     Mi ||||||||||||||||||||||||   cyan = lief                           |
||     Do ||||||||||||||||||||||||   rot  = Ausfall (echte Daten)          |
||     Fr |||||||||||||||||||||||X   grau = keine Messung                  |
||     Sa ||||||||||||||||||||||||                                         |
||     So ||||||||||||||||||||||||   * = Neustartfenster 03:00             |
||                                                                         |
|=     AUSFAELLE  Fr 21:14  6 min   (Klartext, Minuten, Datum)             |
|=                Liste aus /api/stats.outages, maximal 8 Eintraege        |
|=     Leerfall:  KEINE LUECKE IN 7 TAGEN  (als Aussage, groß)            |
+--------------------------------------------------------------------------+

04  WELTGESETZE  ---  Schalttafel, asymmetrisch, 1px Schaltplan-Linien
+--------------------------------------------------------------------------+
||     SO IST DIESE WELT EINGESTELLT                                       |
||                                                                         |
||       .-.        .-.        .-.        [ | ]      [ | ]                 |
||      ( 3 )      ( 2 )      ( 2 )        OFF        OFF                  |
||       `-`        `-`        `-`       =====      =====                  |
||       EP        FANG       DROP        PvP     TODESSTRAFE              |
||     Drehskala   Drehskala  Drehskala  Kippschalter mit Buegel           |
||        |          |          |           |          |                   |
||        +----------+----------+-----------+----------+                   |
||                              |                                          |
||                       [ 4 ] BASEN / GILDE     [ 32 ] PLAETZE            |
||                                                                         |
||     Scanner-Cursor über einem Instrument -> Gravur zeigt den           |
||     echten Konfigurationsschluessel aus der PalWorldSettings.ini        |
||                                                                         |
|=     == GRAVIERTES SCHILD: HAUSORDNUNG ============================      |
|=     == 01 Kein Griefing        Bannbar                          ==      |
|=     == 02 Fremde Basen         Bannbar                          ==      |
|=     == 03 Inaktive Basen       nach 30 Tagen entfernt           ==      |
|=     == ...    Admin-Entscheidungen sind final.                  ==      |
|=     ==============================================================      |
+--------------------------------------------------------------------------+

05  DIE PEILUNG  ---  Live-Karte, full-bleed, 100vh, dunkler Radarschirm
+--------------------------------------------------------------------------+
|#      -724400                    0                     +724400  Y        |
|#     .------------------------------------------------------.            |
|#     |        ..--''--..        o = Gildenbasis (glimmt)    |  349400    |
|#     |      .-  Höhenlinien -.      . = Spieler live       |            |
|#     |     /   o        o      \    Peilringe alle 100 km   |            |
|#     |    |      .   o      .   |                          |            |
|#     |     \   o     .        /    Marker anklickbar ->     |            |
|#     |      `-..          ..-`     /spieler/<name>          |            |
|#     `------------------------------------------------------` -1099400   |
|#     Kalibrierung aus config.map.calibration, Norden oben                 |
|#     [ VOLLBILD -> /karte ]                                              |
+--------------------------------------------------------------------------+

06  RUFZEICHEN  ---  Fallblattanzeige, Registerform, keine Karten
+--------------------------------------------------------------------------+
||     NR  RUFZEICHEN .............. LVL ... STUNDEN ... ZULETZT           |
||     01  Palmeister ..............  52 ...  184 h ... jetzt              |
||     02  Nachtfalke ..............  49 ...  161 h ... vor 2 h            |
||     ..  (Führungspunkte, tabellarische Ziffern, 1px Haarlinie)         |
||     Zeile klappt beim Datenwechsel um (Fallblatt, 40ms Stagger)         |
||     Hover -> gleicher Spieler leuchtet in 05 auf der Karte auf          |
||                                                                         |
||     ERFOLGE  26 Plaketten, eigene Glyphen (kein Emoji)                  |
||     [ Rufzeichen eingeben ] -> /spieler/<name>                          |
+--------------------------------------------------------------------------+

07  DIE PLAKETTE  ---  "Wo ist der Haken?", 80vh, ein Objekt in Licht
+--------------------------------------------------------------------------+
||                        .-''''''''''-.                                   |
||                      .`   GEPRUEFT    `.        WAS KOSTET DAS?         |
||                     /   ------------   \                                |
||                    |     K E I N        |      Nichts. Kein             |
||                    |     H A K E N      |      Account, kein            |
||                     \   ------------   /       Download, keine          |
||                      `. 2026  PVE-DE .`        Werbung, keine           |
||                        `-..........-`          Cookies.                 |
||                      (Goldring zieht sich zu)                           |
||                                                                         |
|=     POSTEN            Hardware, Strom, Anschluss: privat getragen       |
|=     GEGENLEISTUNG     keine. Kein Rang, kein Item, kein Vorteil.        |
|=     FREIWILLIG        [ Kaffee ausgeben ]  (sekundaer, klein)           |
+--------------------------------------------------------------------------+

08  DURCHSAGE  ---  Funkspruch des Betreibers, schmale Spalte, links
+--------------------------------------------------------------------------+
||     >> DURCHSAGE 001                                18.07.2025          |
||     >> VON: Stationsleitung                                             |
||     --------------------------------------------------------           |
||     Ich betreibe das hier privat. Der Rechner steht bei mir,            |
||     deshalb gibt es keine Wipes und keine Werbung. Wenn etwas           |
||     kaputt ist, schreib mir im Discord - ich lese das selbst.           |
||                                            -- Name, Betreiber           |
||     (Monospace, Zeichen für Zeichen, echte Person aus dem              |
||      Impressum - kein Stockfoto, kein Zitatkasten)                      |
+--------------------------------------------------------------------------+

09  ANSCHLUSS  ---  Anschlussplan statt Schrittkacheln
+--------------------------------------------------------------------------+
||     DEIN PC                                        PALHEIM              |
||     [1]-----------[2]-----------------[3]------------( ))               |
||      Steam        Community-Server      Verbinden                       |
||      starten      -> Adresse einfuegen                                  |
||                   pve.palheim.de:8211  [KOPIEREN]                       |
||                                                                         |
||     Leitung fuellt sich beim Scrollen von links nach rechts             |
||     Klartext: KEIN PASSWORT NOETIG.   Nur Steam (kein Xbox).            |
||                                                                         |
||     [QR]  Am Handy? Code scannen -> Adresse am PC oeffnen               |
+--------------------------------------------------------------------------+

10  FUNKVERKEHR  ---  FAQ als Protokoll, nur 5 echte Fragen
+--------------------------------------------------------------------------+
||     ?  Ich komme nicht rein.                                            |
||        > Antwort im Fliesstext, 400, max 62ch                           |
||     ?  Geht das mit Xbox / Game Pass?                                   |
||        > Nein - Steam only. Ehrlich und früh.                          |
||     ?  Brauche ich ein Passwort?   ?  Wie erreiche ich euch?            |
||     ?  Was passiert um 03:00?                                           |
||     (offen, kein Akkordeon, kein Plus-Zeichen)                          |
+--------------------------------------------------------------------------+

11  FREQUENZWECHSEL  ---  Discord-CTA, full-bleed, ein Element
+--------------------------------------------------------------------------+
|#     ~~~~~~~~~~~~~~~~~~~~~~~~~~~\                                        |
|#       Randspur biegt hier ab     \____ ZWEITER KANAL                    |
|#                                        [ DISCORD OEFFNEN ]              |
|#     Support, Ankündigungen, Neustart-Infos. Sekundaer zur              |
|#     Adresse - nie darueber.                                             |
+--------------------------------------------------------------------------+

12  TYPENSCHILD  ---  Footer als graviertes Geraeteschild
+--------------------------------------------------------------------------+
|=   == STATION PALHEIM . PVE-DE . pve.palheim.de:8211 . 32 PL. ==         |
|=   == Standort Deutschland  Betrieb privat  Backups mehrmals  ==         |
|=   == täglich  Neustart 03:00  ohne Mods  ohne Wipes         ==         |
|=   == Karte . Statistik . Rufzeichen . Impressum . Datenschutz==         |
|=   == Zaehlwerk 0 0 4 9 3 1 (mechanisch, cookiefrei)          ==         |
|=   == Inoffizieller Community-Server. Palworld ist eine Marke ==         |
|=   == von Pocketpair, Inc.  -- lesbar, nicht 10px grau        ==         |
+==========================================================================+
```

## 12 · Moodboard

Referenzen kommen aus der Messtechnik, nicht aus dem Webdesign. Radarschirme der Flugsicherung (ASR-Anzeigen mit Peilringen und Mono-Labels). Fahrtenschreiber-Diagrammscheiben mit ihrer Kreiszeitachse. Papierstreifen von Echoloten, Seismografen und EKG-Schreibern - eine Linie, die stundenlang dasselbe tut und genau deshalb ueberzeugt. Fallblattanzeigen von Solari di Udine in Bahnhofshallen. Braun-Messgeraete von Dieter Rams: matte Flaechen, gravierte Skalen, ein einziger farbiger Punkt. Die deutsche TUEV-Plakette als Objekt, das Vertrauen mit einer Jahreszahl und einem Ring behauptet. DIN-1451-Beschriftung an Schaltschraenken. Das Voyager-Golden-Record-Diagramm als Beispiel dafuer, wie technische Zeichnung poetisch wird. Aus dem Spielebereich: das Menue von Escape from Tarkov (kalt, monospace, kompromisslos), der Director aus Destiny 2 (Tiefe durch Ebenen statt durch Kartenraster), die Datenansichten von Elite Dangerous.

Materialien: anodisiertes Aluminium, matt gestrahlt; Bakelit; gebuerstetes Messing nur an Kanten; Chartpapier in Warmgrau. Texturen: 4 % statisches Korn, Haarlinien, gravierte Vertiefungen mit 1px Lichtkante oben. Lichtstimmungen: ein einzelner warmer Lampenkegel in einem sonst unbeleuchteten Raum, dazu die kalte Eigenhelligkeit der Anzeigen; Nebel nur als sehr flache Baender, nie als Wolke. Was fehlen muss: Glas, Blur, Chrom-Verlaeufe, Neonrosa, Sci-Fi-HUDs, jede Form von Hochglanz.

## 13 · Unterseiten

- /karte - PEILUNG (Vollbild): Der Radarschirm aus Sektion 05 nimmt den kompletten Viewport ein, Kopfschiene und Randspur bleiben. Filter für Spieler/Basen/Namen werden zu drei gravierten Kippschaltern am unteren Rand (localStorage-Persistenz wie bisher). Pinch-Zoom und Ein-Finger-Verschieben werden ergaenzt, touch-action wechselt von 'none' auf 'pan-y pinch-zoom', damit die Seite mobil nicht mehr einfriert. Marker sind fokussierbare Links auf Profile. Neu und zwingend: das Kanalfeld mit der Adresse liegt persistent in der Kopfschiene - diese Seite ist heute eine CTA-freie Sackgasse. Die beiden Leerzustaende (alles ausgeblendet / gerade nichts zu sehen) bleiben inhaltlich erhalten, werden aber als Anzeigen der Station formuliert: KEIN ECHO.
- /spieler/<name> - STATIONSPROTOKOLL: Ein persönlicher Messschrieb. Kopf mit Rufzeichen in Archivo Expanded und der Zeile 'Erstmals gepeilt am ... , zuletzt ...'. Statt sieben gleicher Kacheln eine Instrumentenreihe unterschiedlicher Groesse: Level als Drehskala, Spielzeit als Balken, Sessions als Strichliste, Distanz als tatsaechlich gezeichnete Linie in Kilometerlaenge, besuchte Gebiete als aufgehellte Zellen auf einer Miniaturkarte. Die 26 Erfolge werden gravierte Plaketten mit eigenen Glyphen und echtem Fortschrittsbalken; Gold nur für freigeschaltete. Darunter der Teaser 'nächste Freischaltung: noch X Stunden' und eine Teilen-Funktion. Widerspruch aus dem Bestand beheben: Bei 'Server nicht erreichbar' darf die Ueberschrift nicht weiter 'Spieler nicht gefunden' lauten - beides sind getrennte Zustände mit getrennter Sprache.
- /impressum und /datenschutz - STATIONSDATEN und AUFZEICHNUNGSPROTOKOLL: Eine echte .prose-Komponente ersetzt die 23 Inline-Styles der beiden Seiten. Layout: schmale Textspalte von 62 Zeichen, links daneben eine breite Marginalspalte, in der die Abschnittsnummern als Skalenstriche sitzen - dieselbe Sprache wie die Randspur. Ueberschriften in Archivo Expanded, Paragrafennummern in Mono. Beide Seiten kommen aus dem noindex heraus, weil ein vollständiges Impressum ein Vertrauens- und E-E-A-T-Signal ist. Inhaltlich nachzuziehen: Rechtsgrundlagen nach Art. 6 DSGVO, Betroffenenrechte, konkrete Speicherdauern, der Spendendienst als Drittanbieter - und der Google-Fonts-Abschnitt entfaellt, weil die Schriften dann selbst gehostet sind.
- /404 - KEIN ECHO: Die Erzählidee der bestehenden 404-Szene bleibt, das Motiv wird dunkel neu gezeichnet: statt eines ratlosen Wesens im Hellen ein Radarschirm, auf dem eine Peilung ausgesendet wird und kein Echo zurückkommt - die Ringe laufen aus, der Schirm bleibt leer. Die Fehlernummer steht als --t-8 in Papierweiss (kein Verlaufstext). Die vorhandene Sprache bleibt erhalten, im Stationston: 'Peilung abgesetzt. Kein Echo.' Drei Auswege als gleichwertige Textlinks: Startseite, Karte, Discord. Die vierstufige Fallback-Bildkette wird auf zwei existierende Ebenen gekuerzt - heute erzeugt ausgerechnet die 404-Seite drei weitere 404-Anfragen.
- /statistiken (neu) - GROSSER SCHRIEB: Die volle Statistiktiefe zieht aus der Startseite hierher um (im Bestand blockiert sie rund 40 Prozent der Seitenhoehe vor der Kernaktion). Hier lebt das Chart mit beiden Metriken und beiden Zeitraeumen im Vollbild, dazu die komplette Ausfallhistorie, das vollständige Leaderboard und ein automatisch gespeister Ereignisverlauf (neue Version, neuer Rekord, Ausfall mit Dauer). Die bestehende Tastaturbedienung des Charts samt aria-live-Region wird unveraendert uebernommen und nur neu eingefaerbt - sie ist über Branchenniveau und darf nicht neu erfunden werden.
- /admin und /broadcast - LEITSTAND INTERN: Dieselbe Formensprache, eine Stufe woertlicher. Kein Marketing, keine Animation, keine Lichtkegel: reine Instrumentenflaechen, Mono, harte Kanten, deutliche Bestaetigungszustaende bei destruktiven Aktionen (Kick, Bann, Durchsage). Diese Seiten sind der Ort, an dem die Metapher wahr wird - und der Beweis, dass sie keine Verkleidung ist.

## 14 · Der Signature-Moment

DIE RANDSPUR. Am linken Rand jeder Seite läuft eine 72px breite Spur mit einer einzigen, durchgehenden Linie: dem echten Sieben-Tage-Schrieb des Servers aus /api/stats. Oben ist jetzt, unten ist vor sieben Tagen. Scrollen bedeutet, das Papier durch den Schreiber zu ziehen. Wo der Server tatsaechlich ausgefallen war, hat die Linie ein Loch - kein Effekt, sondern ein fehlender Messpunkt. Sektionsmarken sitzen als Ticks auf der Kurve und sind gleichzeitig die Navigation der Seite. Ganz unten, im Frequenzwechsel, biegt die Linie aus dem Rand heraus in die Flaeche und endet.

Diese Linie ist das Logo, der Fortschrittsbalken, das Menue, das Vertrauensargument und die Erzählung in einem einzigen Element. Sie ist auf jeder Unterseite dieselbe. Und sie ist buchstaeblich nicht faelschbar: Zwei verschiedene Wochen ergeben zwei verschiedene Seiten. Wer die Seite einmal gesehen hat, erkennt sie am Rand wieder - noch bevor er ein Wort gelesen hat.

## 15 · Warum das nicht nach KI aussieht

FUNKFEUER ist deshalb nicht generierbar, weil die Komposition ohne die laufende Serverinfrastruktur gar nicht entstehen kann. Die Randspur ist kein Dekor mit Zufallskurve, sondern 7 Tage echter Messpunkte; ihre Lücken sitzen dort, wo der Server wirklich weg war. Die Peilscheibe zeigt die tatsaechliche Uhrzeit und die tatsaechliche Verfügbarkeit der letzten 24 Stunden. Die Rauschdichte einer Sektion ist an availability.week gekoppelt. Eine KI kann diese Seite nicht als Template ausgeben, weil das Layout ein Ausgabegeraet der Daten ist - nicht ihr Behaelter.

Dazu kommt eine konsequente Verweigerung aller Erkennungszeichen generierter Seiten: kein Hero mit Badge, Gradient-Wort und Doppelbutton. Kein Eyebrow-Label über acht Ueberschriften. Kein Kartenraster - jede Sektion hat eine eigene, aus ihrer Funktion abgeleitete Form (Ringskala, Oszilloskop-Wand, Streifenkalender, Schalttafel, Radarschirm, Fallblattanzeige, Plakette, Fernschreiber, Anschlussplan). Keine 999px-Pillen, kein einziger 20px-Radius, kein Glassmorphism, kein Blur. Kein Emoji und kein Lucide-Glyph, sondern 14 eigene Zeichen auf einem 24px-Raster mit 1,5px Strichstaerke. Fliesstext endlich in 400 - im Bestand existiert kein einziges font-weight: 400, weshalb dort auch 800 nichts mehr bedeutet.

Und die formale Idee selbst ist selten: Eine Website, die über ihre gesamte Höhe EIN durchgehendes Instrument ist, dessen Zeitachse die Scrollachse ist. Man erinnert sich nicht an eine Sektion, sondern an eine Linie.

## 16 · Conversion-Hebel

- ADRESSE IST DER PRIMAERE CTA, NICHT DISCORD: Das Kanalfeld mit pve.palheim.de:8211 steht im ersten Viewport als größtes Bedienelement und ist die einzige primaer gestylte Aktion der Seite. Discord ist ueberall sekundaer (Textstaerke, Groesse, Farbe). Damit kippt das im Bestand gemessene Verhaeltnis von 6 Discord-Einstiegen zu 2 Kopiermoeglichkeiten.
- KANALLEISTE ALS DAUERANGEBOT: Nach dem Hero wandert das Adressfeld per View Transition in die 56px-Kopfschiene und bleibt auf ALLEN Seiten sichtbar - auch auf /karte und /spieler/<name>, die heute CTA-freie Sackgassen sind. Die Kernaktion ist damit nie weiter als ein Klick entfernt, egal wie tief jemand eingestiegen ist.
- VERTRAUEN VOR AUFFORDERUNG: Verfügbarkeit 24h/7d, die Ausfallchronik mit Minutenangaben und der Neustart-Countdown auf 03:00 stehen in den ersten beiden Bildschirmhoehen statt bei 2.800-3.200 px. Ein Server, der seine eigenen Ausfälle mit Uhrzeit ausstellt, wirkt glaubwuerdiger als einer, der Uptime behauptet - genau das ist die Konversionsluecke jedes kleinen Community-Servers.
- GESTALTETER NULLFALL: Bei 0 Spielern zeigt DER SCHRIEB nie eine nackte Null, sondern die aus den 7-Tage-Samples errechnete Primetime, den Rekord mit Datum und den Zeitpunkt des letzten Spielers. Der häufigste Absprunggrund kleiner Server wird zu einem Argument fuers Wiederkommen.
- DIE PLAKETTE ALS HAKEN-AUFLOESUNG: Die Frage 'Was kostet das?' bekommt ein eigenes, gestaltetes Objekt mit Positionsliste - Hardware und Strom privat getragen, Gegenleistung: keine, Kaffee freiwillig ohne Extras. Das ist der Satz, der im Bestand als bester Text der Seite in einem per Default versteckten Block liegt; hier wird er zum Zentrum einer eigenen Sektion.
- QR-BRUECKE HANDY -> PC: Palworld läuft am PC, die Seite wird am Handy gelesen. Die Adresse ist konstant, also liegt der QR-Code als statisches SVG-Asset vor (null JavaScript, null Abhaengigkeit). Auf Mobilgeraeten ersetzt 'Code scannen' den nutzlosen Kopieren-Button in die falsche Zwischenablage.
- MITSCHRIFT-BAND FUER WIEDERKEHRER: Aus dem vorhandenen localStorage-Zeitstempel wird ein Band 'Seit deiner letzten Peilung' erzeugt - neuer Rekord, neue Rufzeichen, Ausfälle in der Zwischenzeit. Es erscheint nur, wenn es tatsaechlich etwas zu berichten gibt, und schließt die Retention-Schleife, die heute im Leaderboard endet.
- KLARTEXT AN DER ABBRUCHSTELLE: Direkt am Kanalfeld und im ANSCHLUSS-Plan stehen die zwei Sätze, die heute fehlen oder als Nebensatz Misstrauen saeen: 'Kein Passwort nötig.' und 'Steam-Version - Xbox und Game Pass können sich mit Dedicated Servern nicht verbinden.' Ehrlichkeit an der Stelle des größten Zweifels konvertiert besser als ein weiteres Versprechen.

---

# Gegenrede

*Jedes Konzept wurde nach der Ausarbeitung von einer unabhängigen, bewusst
feindseligen Instanz zerlegt — Awwwards-Juror und Frontend-Architekt in
Personalunion. Diese Kritik steht hier ungefiltert, weil ein Konzept, das seine
eigenen Schwächen nicht mitliefert, keine Entscheidungsgrundlage ist.*

## Wo es doch nach KI riecht

1) Die Grundfarbe des Konzepts IST der KI-Default. Wenn man ein Generativmodell auffordert "dunkel, technisch, bloss nicht generisch", kommt in ueberwaeltigender Mehrheit genau das heraus: Schwarz, Cyan, Monospace, Raster, Scanline, HUD, Terminal. FUNKFEUER ist nicht der Gegenentwurf zum KI-Klischee, es ist dessen zweite Stufe. Der Brief verbietet Linear-/Vercel-Klone - aber "Grafana-Dashboard im Abendkleid" ist derselbe Fehler mit anderem Vorzeichen. Uptime Kuma, statuspage.io, jedes Crypto-Dashboard und jede Dev-Tool-Startseite der letzten fünf Jahre sehen so aus. Ein Awwwards-Juror hat "Daten als Held, Cyan auf Schwarz" hunderte Male gesehen.

2) Der Claim "Kein Prospekt. Ein Messschrieb." ist die klassische LLM-Antithese (Kein X. Ein Y.). Dasselbe Muster in "Die Seite IST das Instrument", "Man erinnert sich nicht an eine Sektion, sondern an eine Linie". Das sind Slogan-Generator-Sätze, keine Marke.

3) Die systematische Umbenennung aller Standardsektionen in ein privates Großbuchstaben-Vokabular (LUECKENPROTOKOLL, WELTGESETZE, RUFZEICHEN, ANSCHLUSS, PLAKETTE, KANALLEISTE) ist selbst ein Erkennungszeichen generierter Konzepte: das Konzept beweist seine Eigenstaendigkeit durch Wortneuschoepfung statt durch Form. Nutzer suchen "Regeln", "FAQ", "Mitspielen". Und SEO auch - die Seite rankt heute nachweislich über Klartext (FAQ-Schema, 9 details-Bloecke in index.html).

4) Die 13 Animationen mit exakten ms-Werten und cubic-bezier-Kurven lesen sich wie Kompetenz, sind aber unpruefbares Spec-Theater. 720 ms / cubic-bezier(.16,1,.3,1) für Sektionstitel ist die meistkopierte Reveal-Kurve des Internets. "Stagger 60 ms je Zeile, clip-path inset" ist woertlich das, was jedes Framer-/GSAP-Tutorial seit 2021 zeigt - also exakt das, was der Brief unter "Framer-Klon" verbietet.

5) Der stärkste Geruch: eine Palworld-Seite ohne Palworld. "Kein Fotorealismus, keine Pals, kein Landschafts-Artwork, keine gerenderten Objekte" - uebrig bleibt eine Seite, die genauso gut für einen Minecraft-Server, einen VPN-Anbieter oder eine Wetterstation stehen könnte. Austauschbarkeit ist das Kernmerkmal generischer Seiten, und FUNKFEUER erzeugt sie durch Verzicht statt durch Beliebigkeit - das Ergebnis ist dasselbe.

6) Die Cockpit-Farbkonvention (Cyan = lebt, Gold = Bestwert, Bernstein = Achtung, Rot = Störung) ist eine nachtraegliche Rationalisierungserzaehlung um eine Palette, die der Brief ohnehin vorgegeben hat. Gut erzählt, aber keine Entscheidung.

## Überschneidung mit den Nachbarkonzepten

WERKBANK - die schwerste Kollision, und das Konzept weiß es, weshalb es sich mit einem einzigen Satz abzugrenzen versucht ("frontal, orthografisch, keine Isometrie (das gehört WERKBANK)"). Das ist eine Projektionsart als Brandmauer - viel zu duenn. Beide Konzepte teilen: 1px/1,5px-Hairlines, Mono-Beschriftung, matte Metallflaechen, Bemaßung, technische Zeichnung, das Versprechen "die Seite ist eine Maschine". FUNKFEUERs eigene Bildsprache-Liste nennt woertlich "Kalibrierungskreuze, Skalenleitern, Anreisserlinien aus der technischen Zeichnung" - das ist WERKBANKs Vokabular, nicht seins. Konsequenz: FUNKFEUER muss alles Statisch-Geometrische abgeben und darf nur behalten, was ZEIT abbildet. Trennlinie, die hält: WERKBANK = Raum und Aufbau (was ist gebaut), FUNKFEUER = Zeit und Verlauf (was passiert gerade). Jedes Element ohne Zeitachse gehört nicht in FUNKFEUER.

DIE INSEL - zweitschwerste Kollision, und sie sitzt an einer prominenten Stelle. "Vektor-Terrain der Palworld-Insel als Höhenlinien und Peilringe, gerechnet aus der echten Kalibrierung" plus die Sektion Radarschirm mit Live-Spielerpositionen ist exakt das Rückgrat von DIE INSEL. Das muss ersatzlos weg: kein Terrain, keine Höhenlinien, keine Inselkontur. FUNKFEUER darf Positionen nur unraeumlich zeigen - als Peilungsliste, als Belegung pro Region, als Zahl - und verlinkt die Karte auf /karte. Sonst nimmt es dem Nachbarkonzept den einzigen Trumpf.

FELDBUCH - Registerkollision im Text, nicht im Bild. "Mitschrift-Band", "Fernschreiber", "Ausfallchronik", "Protokoll" sind Journal-Moebel und damit FELDBUCHs Kern. Das Wort "Mitschrift" gehört dorthin. FUNKFEUER muss den Unterschied hart ziehen: FELDBUCH protokolliert subjektiv und von Hand (Erinnerung), FUNKFEUER protokolliert maschinell, unkommentiert, ohne Erzählstimme (Messung). Sobald FUNKFEUERs Log einen Satz formuliert statt einen Wert auszugeben, ist es FELDBUCH.

NACHTLAGER - inhaltlich am weitesten weg (Wärme vs. Kälte), aber genau deshalb der wichtigste Hinweis: weil der Brief allen fünf Konzepten Schwarz + Cyan/Tuerkis + Gold vorschreibt, ist FUNKFEUER als woertlichste Ausführung dieser Vorgabe im ersten Blick das AM WENIGSTEN unterscheidbare der fünf. Seine Distinktheit kann nicht aus Farbe kommen, nur aus Form - also aus genau zwei Zeichen: der durchgehenden Kurve und der Ringskala. Alles andere (Schalttafel, Fallblatt, Plakette, Streifenkalender, Oszilloskop-Wand) verwaessert diese Erkennbarkeit, statt sie zu stützen. Neun eigene Sektionsformen sind acht zu viel für eine Marke, die behauptet, man erinnere sich an EINE Linie.

Strukturelles Risiko darueber hinaus: LEITSTAND ist kein Territorium, sondern eine Sektion, die jedes der fünf Konzepte ohnehin enthalten muss (Live-Status/Statistik). FUNKFEUER läuft Gefahr, nicht ein Designkonzept zu sein, sondern die auf Seitengroesse aufgeblasene Statistik-Sektion des Bestands.

## Machbarkeit auf der realen Infrastruktur

REALISTISCH (reines DOM/SVG, null Abhaengigkeiten, passt zum Stack): Polyline aus stats.samples, 168 Stundenbalken, 96-Strich-Ring, Zaehler-Einlauf, Sektionstitel-Reveal, Drehskalen, QR als statisches SVG, Icon-Sprite, selbst gehostete Fonts. Das ist alles in Vanilla machbar und von einem Admin pflegbar.

KONKRETER BUG im Kernstueck: "stroke-dashoffset von 100% auf 0" bei viewBox 72x4000 funktioniert nicht wie beschrieben. Prozentwerte lösen in SVG gegen die normalisierte Viewport-Diagonale auf, hier sqrt((72²+4000²)/2) ≈ 2829 Einheiten. Eine gezackte 7-Tage-Polyline über 4000 Einheiten Höhe ist deutlich länger als das. Die Randspur wäre also lange vor dem Seitenende fertig gezeichnet - das zentrale Markenzeichen läuft aus dem Takt. Richtig: pathLength="1" am Polyline-Element und dasharray/dashoffset einheitenlos.

ZWEITER BUG derselben Art: Ein fest kodierter viewBox von 4000 Einheiten gegen eine variable Dokumenthoehe. Die Seitenhoehe aendert sich mobil, bei geoeffneten FAQ-details und je nach Datenmenge. "Scroll = Zeitachse" ist dann nur behauptet. Die Zuordnung muss bei jedem Resize/Toggle neu normalisiert werden.

DOPPELIMPLEMENTIERUNG: animation-timeline nativ UND GSAP ScrollTrigger als Fallback heißt, ein Admin pflegt zwei Codepfade für einen Effekt. GSAP widerspricht ausserdem dem Stack (vendorierter Minified-Blob, ~35 KB gz, kein Build). Pragmatisch: beides streichen. Ein passiver scroll-Listener, der in rAF eine CSS-Variable setzt, sind ~20 Zeilen, läuft ueberall inklusive Safari, und ist genau der Detailgrad, den dieses Projekt tragen kann.

VIEW TRANSITIONS AUF SCROLL ist ein Anti-Pattern. Waehrend der Transition ist das Rendering unterdrueckt; ausgeloest mitten im Momentum-Scroll ergibt das einen sichtbaren Ruckler. Der Root-Snapshot blendet die GESAMTE Seite über, wenn man ihn nicht explizit abschaltet. Zwei Elemente dürfen denselben view-transition-name nie gleichzeitig tragen, sonst wird die Transition still verworfen. Und ein Schwellwert von 30 % ohne Hysterese feuert bei jedem Hoch-Runter-Scrollen erneut. Dazu a11y: zwei identische "Adresse kopieren"-Bedienelemente in der Tab-Reihenfolge und im Screenreader.

FALLBLATTANZEIGE ist teuer und praktisch unsichtbar. Das Leaderboard kommt aus /api/stats, und stats.js hat REFRESH_INTERVAL = 5 * 60_000 - nicht 30 s, wie das Konzept behauptet. Sortiert wird nach Level, dann Spielminuten (server.js, topPlayers); diese Reihenfolge aendert sich auf einem Server dieser Groesse etwa täglich. Dual-Half-DOM, preserve-3d, WAAPI-Diffing für einen Effekt, den im Schnitt niemand je sieht. Streichen.

PEILUNG/Karte: map.js pollt alle 30 s. 600 ms Interpolation plus 29,4 s Stillstand ist immer noch Teleportieren, nur hoeflicher. Entweder über das volle Intervall interpolieren (mit Extrapolation) - oder, konzeptgetreuer, gar nicht: ein Radar streamt nicht, es peilt diskret. Der Sprung ist hier die ehrlichere Bewegung.

SIGNALRAUSCHEN ist tot geboren. amplitude = (100 - availability.week)/100 ergibt bei realen Werten (99,5-100) 0,000 bis 0,005 - unsichtbar. Es wären ein Canvas, ein rAF-Loop und eine Datenbindung, die nur in der schlimmsten Woche des Jahres sichtbar werden und deshalb nie getestet sind. Genau die Art Code, die im Alltag verrottet. Streichen.

VOLUMETRISCHES CANVAS: 30 fps mit globalCompositeOperation 'lighter' auf Herogroesse bei DPR 2 sind ~7 Mio. Pixel pro Frame - auf Mittelklasse-Android messbarer Akku- und Thermik-Effekt. Bei 3-4 % Alpha ist das Ergebnis von einem einzelnen Element mit conic-gradient und 24s CSS-rotate nicht unterscheidbar, zu null JS-Kosten. Das Canvas ist reine Praesentationsfantasie.

DATENWAHRHEIT - der gefaehrlichste Punkt, weil das ganze Konzept auf Messehrlichkeit gebaut ist: Ausfälle werden in server.js ausschließlich aus null-Buckets von 5 Minuten abgeleitet, mit Bucket-Reparatur (last[1] = Math.max(...)) und end = runEnd + 300. Die Auflösung ist also 5 Minuten, kurze Ausfälle verschwinden ganz, lange werden aufgerundet. "Ausfallchronik mit Minutenangaben" behauptet eine Praezision, die das Instrument nicht hat. Ein Instrument, das seine eigene Genauigkeit uebertreibt, ist genau der Fehler, den dieses Konzept nicht machen darf. Lösung, die das Konzept sogar stärkt: Auflösung mitschreiben ("Auflösung 5 min").

PLANMAESSIG vs. STOERUNG: Der tägliche Neustart um 03:00 ist datenseitig nicht von einem Absturz unterscheidbar. Bei 60 s Poll-Intervall wird ein kurzer Neustart meist repariert, ein längerer (nach Palworld-Updates) taucht als roter Balken auf. Das LUECKENPROTOKOLL würde also gelegentlich die eigene Wartung als Störung anklagen. Braucht eine Klassifizierung serverseitig (Wartungsfenster in config), sonst argumentiert die Vertrauenssektion gegen den Server.

RETENTION: STATS_RETENTION_BUCKETS = 7 Tage, hart. Das Markenzeichen "eine durchgehende Linie" ist damit ein rollierendes 7-Tage-Fenster auf einem Server, der typisch 0-8 Spieler zeigt - optisch eine fast flache Linie an der Grundlinie. Das Instrument verspricht Dramatik, die in den Daten nicht steckt. Ohne automatisch skalierte Y-Achse und einen zweiten Kanal (FPS liegt in samples[2] bereit) ist der Schrieb ein Flatline.

ERSTER PAINT: alle Instrumente hängen an /api/stats mit bis zu 2016 Messpunkten (roh ~50 KB, gzip ~15-20 KB). Der Hero kann vor dem Aufloesen dieses Requests nichts zeichnen. Da server.js das HTML ohnehin selbst ausliefert, gehört die erste Nutzlast als <script type="application/json"> zur Auslieferzeit ins Dokument: spart den Roundtrip, macht das Hero-Instrument beim First Paint sichtbar und hält die Zahlen für Crawler und JS-lose Besucher im HTML. ~20 Zeilen im bestehenden zero-dep-Server, größter technischer Hebel des ganzen Konzepts.

MOBILE - die größte Lücke: Das Konzept hat für sein eigenes Markenzeichen keine mobile Antwort. 72 px fixe Randspur sind auf 375 px Viewport 19 %, dazu 56 px Kopfschiene. Was ist DER SCHRIEB auf dem Handy? Nicht spezifiziert. Ebenso Oszilloskop-Wand und Schalttafel. Da der Großteil des Traffics mobil ist (Palworld läuft am PC, die Seite wird am Handy gelesen - das sagt das Konzept selbst), ist das nicht Detail, sondern Kern.

SCANNER-CURSOR: Ein Hover-Spotlight, das Inhalt versteckt, während die Touch-Variante denselben Inhalt dauerhaft zeigt - das beweist, dass das Verstecken reine Deko ist. Schlimmer: der abgedunkelte Zustand der Gravuren auf Desktop wird 4,5:1 mit hoher Wahrscheinlichkeit reissen. Entweder der Text ist Information (immer zeigen) oder nicht (löschen).

WEITERE PRAXISPUNKTE: 1,5px-Striche auf 24px-Raster rendern bei DPR 1 unscharf (Halbpixel) - 2px nehmen oder auf Halbpixel ausrichten. @property <angle> mit "rAF-Loop alle 1000 ms" ist begrifflich ein Intervall, kein rAF; CSS-transform auf einem SVG <line> braucht explizit transform-box/transform-origin, sonst dreht der Zeiger um den falschen Punkt (klassischer Stillstandsfehler). Fonts: aktuell Google-Fonts-CDN in index.html - für eine deutsche Seite mit Impressum ein bekanntes Datenschutzrisiko, und FUNKFEUER will drei Familien (Display, Mono, Text). Selbst hosten, woff2-Subsets, höchstens zwei Familien und drei Schnitte. OG-Bild: die wichtigste Oberflaeche eines Discord-getriebenen Servers ist die Linkvorschau - ein live gerendertes OG-Bild ist zero-dep NICHT machbar (Discord rendert kein SVG als og:image, es gibt keinen Rasterizer im Stack). Statisches OG in der neuen Bildsprache einplanen; das Konzept erwaehnt es gar nicht.

FEHLENDE ZUSTAENDE: Fuer 13 Animationen ist je ein REDUZIERT-Zustand definiert - vorbildlich. Fuer 9 datengebundene Instrumente ist KEIN "keine Daten / API weg / 0 Messpunkte"-Zustand definiert, ausser dem Nullfall des Schriebs. Die Datenquelle ist Pocketpairs REST-API, die sich schon geaendert hat. Ausgerechnet ein Funkfeuer-Konzept hat den Zustand "kein Signal" thematisch geschenkt bekommen und nutzt ihn nicht.

## Wirkung auf die Conversion

HILFT, und zwar deutlich - das ist die stärkste Seite des Konzepts, und sie ist weitgehend unabhaengig von der Ästhetik:

Die Bestandsdiagnose stimmt nachpruefbar: index.html enthaelt 6 discord.gg-Anker (Zeilen 188, 219, 521, 588, 674, 687) gegen 2 Kopier-Bedienelemente (Zeile 225 #copyAddress, Zeile 505 .copy-mini). Die Adresse als einzige primaer gestylte Aktion zu setzen, korrigiert ein echtes Missverhaeltnis. Die Kanalleiste auf /karte und /spieler/<name> schließt zwei tatsaechliche Sackgassen. Der Xbox/Game-Pass-Satz fehlt heute komplett - index.html sagt nur "Starte Palworld auf Steam" (Zeile 496) und laesst Game-Pass-Spieler ins Leere laufen; das ist ein echter, billiger Gewinn. Die Plakette hebt das beste Argument des Servers (privat, kostenlos, keine Gegenleistung) aus einem versteckten Block ins Zentrum. Der gestaltete Nullfall adressiert den mit Abstand häufigsten Absprunggrund kleiner Server.

SCHADET ODER IST FALSCH:

"Kein Passwort nötig." widerspricht dem Bestand. index.html Zeile 514: "Das Server-Passwort (falls aktiv) bekommst du auf unserem Discord." Ein hart kodierter Satz wäre in dem Moment falsch, in dem der Admin ein Passwort setzt - und zwar an der sensibelsten Stelle der Seite. Der Satz muss aus dem Zustand gerendert werden, sonst bricht das Konzept sein Kernversprechen in der ersten Zeile.

Die QR-Bruecke ist logisch invertiert. Handy zu PC laesst sich nicht lösen, indem man auf dem Handy einen QR-Code zeigt - man kann den eigenen Bildschirm nicht scannen. QR funktioniert nur PC-Bildschirm zu Handy-Kamera, also genau in die nutzlose Richtung. Und "der Kopieren-Button ist mobil nutzlos" ist falsch: Leute kopieren die Adresse und schicken sie sich per Discord, WhatsApp oder Notiz auf den PC. Realistische mobile Lösungen: Kopieren behalten, Web Share API ("teilen/an mich selbst senden"), und ganz sicher KEIN Klick-zum-Beitreten-Link versprechen - Palworld-Dedicated-Server haben keinen verlaesslichen steam://-Handler.

Discord dogmatisch ueberall zu degradieren ist riskant. Bei 0 Spielern - dem häufigsten Zustand eines privaten 32-Slot-Servers - ist die Adresse die WERTLOSE Aktion und Discord die wertvolle ("ist heute Abend jemand da?"). Die Primaeraktion muss zustandsabhaengig sein: Server online mit Spielern -> Adresse; leer oder offline -> Discord plus Primetime plus "letzter Spieler vor X".

"Vertrauen vor Aufforderung" ist als Prinzip richtig, in der Dosierung falsch. Drei Zeilen "Ausfall 04:12, 38 Minuten" plus ein Countdown "Neustart in 2:14" in den ersten zwei Bildschirmhoehen lesen sich für einen 20-Jaehrigen, der gerade entscheidet, nicht als Ehrlichkeit, sondern als Instabilitaet. Eine ehrliche Zahl oben, die Chronik tiefer.

Fehlende Orientierung im ersten Viewport: Eine Ringskala und ein Kanalfeld beantworten nicht "Was ist das, für wen, kostet das was?". Wer aus Google kommt, braucht einen Klartextsatz im ersten Bild: "Deutscher PvE-Server für Palworld. Kostenlos, keine Wipes, 32 Plätze." Die Instrumentenmetapher darf diesen Satz nicht verschlucken.

Tonalitaets-Mismatch als Conversion-Risiko: Die tatsaechliche Zielgruppe eines Servers mit 3x EP, keiner Todesstrafe und ausgeschaltetem PvP ist die gemuetliche PvE-Fraktion. Kompetenzsignale können als Huerde ankommen ("muss ich hier was können? ist das was für Profis?"). Das Konzept zeigt null Wärme, null Menschen, null Spiel - für einen Server, dessen eigentliches Produkt "nette Leute" ist.

SEO-Risiko: Die heutige Auffindbarkeit hängt an Klartext (FAQ-Schema, 9 details-Bloecke, Regeln, Über-Text). Wenn Text zu Instrumenten wird, geht indexierbarer Inhalt verloren. FAQ und Regeln müssen echter, lesbarer Text bleiben - und die Zahlen serverseitig ins HTML, nicht nur per fetch.

## Schwächen

- Zentraler Bug: stroke-dashoffset in Prozent löst bei viewBox 72x4000 gegen ~2829 Einheiten auf, nicht gegen die Pfadlaenge - die Randspur ist lange vor dem Seitenende fertig gezeichnet. Braucht pathLength=1 und einheitenlose Werte.
- Fest kodierter viewBox von 4000 Einheiten gegen variable Dokumenthoehe (mobil, geoeffnete FAQ-details): 'Scroll = Zeitachse' ist nur behauptet, nicht garantiert.
- Doppelter Codepfad (natives animation-timeline + GSAP ScrollTrigger) für einen Effekt - zwei Implementierungen für einen Admin, plus ein vendorierter Blob im ansonsten abhaengigkeitsfreien Stack.
- View Transitions per IntersectionObserver mitten im Scroll: unterdruecktes Rendering, Root-Snapshot-Ueberblendung der ganzen Seite, Namenskonflikt bei zwei gleichzeitigen view-transition-name, kein Hysterese-Schutz gegen Dauerfeuer beim Hoch-Runter-Scrollen, zwei identische Kopier-Buttons in Tab-Reihenfolge und Screenreader.
- Fallblattanzeige hängt an einer Datenquelle, die alle 5 Minuten laedt (stats.js REFRESH_INTERVAL = 5*60_000, nicht 30 s) und deren Sortierung sich etwa täglich aendert: hoher Aufwand für einen praktisch unsichtbaren Effekt.
- Signalrauschen mit amplitude = (100 - availability.week)/100 ist bei realen Werten (99,5-100) rechnerisch unsichtbar - Canvas, rAF-Loop und Datenbindung für einen Effekt, der nur in der schlechtesten Woche erscheint und deshalb nie getestet wird.
- Volumetrisches Canvas mit 30 fps und 'lighter'-Compositing auf Herogroesse: bei DPR 2 rund 7 Mio. Pixel pro Frame für ein Ergebnis, das ein statischer conic-gradient mit CSS-Rotation bei 3-4 % Alpha nicht unterscheidbar liefert.
- Ausfälle stammen aus 5-Minuten-Buckets mit Reparaturregel und Aufrundung (server.js): 'Ausfallchronik mit Minutenangaben' behauptet eine Praezision, die das Instrument nicht besitzt - fatal für ein Konzept, dessen Autoritaet Messehrlichkeit ist.
- Kein Unterschied zwischen geplantem 03:00-Neustart und Absturz: das LUECKENPROTOKOLL kann die eigene Wartung als rote Störung ausstellen.
- 7-Tage-Retention (STATS_RETENTION_BUCKETS) plus typische 0-8 Spieler ergeben eine fast flache Linie: das Markenzeichen verspricht Dramatik, die in den Daten nicht existiert.
- Alle Instrumente hängen am ersten /api/stats-Response (bis 2016 Messpunkte); der Hero kann davor nichts zeichnen - kein Zustand für die ersten Millisekunden definiert.
- Keine mobile Antwort für das eigene Markenzeichen: 72 px fixe Randspur sind 19 % eines 375-px-Viewports, dazu 56 px Kopfschiene. Oszilloskop-Wand und Schalttafel ebenfalls unspezifiziert.
- Neun einmalige Sektionsformen ohne Wiederverwendung: die Anti-Raster-Doktrin garantiert, dass niemand später je eine Sektion hinzufuegt, weil es kein Muster zum Kopieren gibt. Fuer einen Ein-Personen-Betrieb ein Einfrieren der Seite.
- Fuer 13 Animationen ist je ein REDUZIERT-Zustand definiert, für 9 datengebundene Instrumente kein einziger 'keine Daten / API weg'-Zustand - obwohl die Quelle eine fremde Spiel-API ist.
- Scanner-Cursor versteckt Information hinter Hover, während die Touch-Variante dieselbe Information dauerhaft zeigt: das Verstecken ist reine Deko, und der abgedunkelte Zustand reisst voraussichtlich 4,5:1.
- 'Kein Passwort nötig.' widerspricht index.html Zeile 514 ('Das Server-Passwort (falls aktiv)') - eine hart kodierte Unwahrheit an der empfindlichsten Stelle.
- Die QR-Bruecke Handy->PC ist logisch invertiert: man kann den eigenen Bildschirm nicht scannen. Und der mobile Kopieren-Button ist nicht nutzlos, sondern der reale Weg (Discord/Notiz an sich selbst).
- 'Messwert-Einlauf mit Gedaechtnis' beruft sich auf den Mechanismus von visits.js - dort liegt aber nur der ERSTE Besuch als palheim.visitor, nie der letzte, und nie ein Messwert. Der Effekt ist für Erstbesucher (die Mehrheit und die eigentliche Zielgruppe) undefiniert, und bei täglichen Besuchern ist die Differenz unsichtbar.
- Ausfallchronik und Neustart-Countdown in den ersten zwei Bildschirmhoehen kommunizieren an der Entscheidungsstelle Instabilitaet statt Vertrauen.
- Kein Klartextsatz im ersten Viewport: eine Uhr und ein Adressfeld beantworten nicht 'Was ist das, für wen, was kostet es?'.
- Zielgruppen-Mismatch: Cockpit-Kompetenz gegen eine PvE-Zielgruppe, die wegen abgeschalteter Todesstrafe und netter Leute kommt. Null Wärme, null Menschen, null Spiel.
- Google-Fonts-CDN im Bestand plus Wunsch nach drei Schriftfamilien: Datenschutzrisiko für eine deutsche Seite mit Impressum und zusätzliches Ladegewicht.
- OG-Bild - die wichtigste Oberflaeche eines Discord-getriebenen Servers - kommt im Konzept nicht vor, und ein live generiertes ist zero-dep nicht machbar (Discord rendert kein SVG).
- 1,5px-Striche auf 24px-Raster rendern bei DPR 1 unscharf; CSS-transform auf SVG <line> ohne transform-box/transform-origin dreht um den falschen Punkt (stiller Fehler).

## Schärfungen — verbindlich für die Umsetzung

1. Auf ZWEI Zeichen reduzieren. Die durchgehende Kurve und die Ringskala sind die Marke. Streichen: Oszilloskop-Wand, Streifenkalender, Fallblattanzeige, Fernschreiber, Radarschirm mit Terrain. Drei wiederverwendbare Instrumententypen definieren (SKALA für Momentwerte, BAND für Zeitreihen, TAFEL für feste Parameter), aus denen sich jede Sektion als Konfiguration ergibt statt als Neuerfindung. Das rettet die Wartbarkeit für einen Admin und macht die Linie erst erinnerbar.
2. Alle Bewegung auf drei Effekte eindampfen und die restlichen zehn ersatzlos streichen: (1) Randspur zeichnet sich beim Scrollen, (2) Zahlen laufen einmal ein, (3) Balken wachsen einmal. Umsetzung ausschließlich in Vanilla: ein scroll-Listener setzt in rAF eine CSS-Variable, ein IntersectionObserver setzt einmalig eine Klasse. Kein GSAP, keine View Transitions, keine zwei Canvas, kein Dual-Path. Der Lichtkegel wird ein Element mit conic-gradient und 24s CSS-Rotation.
3. Den Schrieb technisch korrekt bauen: pathLength='1', dasharray/dashoffset einheitenlos, viewBox-Höhe bei Resize und beim Oeffnen der FAQ-details neu gegen die reale Dokumenthoehe normalisieren, Y-Achse automatisch auf das tatsaechliche Maximum der 7 Tage skalieren (sonst Flatline), und den zweiten bereits vorhandenen Kanal nutzen - FPS liegt in samples[2] und macht die Kurve auch bei 0 Spielern lesbar.
4. Erste Nutzlast serverseitig ins HTML inlinen. server.js liefert das Dokument ohnehin selbst aus; ein <script type='application/json'> mit dem aktuellen Stats-Auszug (aggregiert, nicht alle 2016 Punkte) kostet ~20 Zeilen, entfernt den Roundtrip vor dem ersten Hero-Paint, hält die Zahlen für Crawler und JS-lose Besucher im Markup und beseitigt den undefinierten Anfangszustand aller Instrumente.
5. Messehrlichkeit konsequent zu Ende führen, statt sie nur zu behaupten: Auflösung mitschreiben ('Messpunkt alle 5 min'), geplante Neustarts serverseitig als Wartungsfenster klassifizieren und in Gold/Grau statt Rot zeichnen, und für jedes Instrument einen 'KEIN SIGNAL'-Zustand gestalten. Ein Funkfeuer-Konzept, das den Ausfall seiner eigenen Datenquelle nicht gestaltet, verfehlt sein bestes Motiv.
6. Primaeraktion zustandsabhaengig machen statt doktrinaer: Server online mit Spielern -> Adresse als größtes Element. Server leer oder offline -> Discord plus Primetime aus den 7-Tage-Samples plus 'letzter Spieler vor X'. Und den Passwort-Satz aus dem Zustand rendern, nie hart kodieren (Widerspruch zu index.html:514).
7. Mobil zuerst spezifizieren, nicht ableiten: Auf Schmalviewport wird die Randspur zur 4px-Fortschrittskante am linken Rand oder zu einem 48px-Band unter der Kopfschiene, die Ringskala wird zum horizontalen 24-Stunden-Streifen, die Schalttafel zu einer zweispaltigen Werteliste. Die QR-Bruecke ersetzen durch Kopieren plus Web Share ('an dich selbst schicken'). Kein steam://-Versprechen.
8. Territorium schaerfen, indem alles Raeumliche und alles Erzählende abgegeben wird: kein Inselterrain, keine Höhenlinien, keine Karte (gehört DIE INSEL), keine Kalibrierungskreuze, Skalenleitern und Anreisserlinien (gehört WERKBANK), kein 'Mitschrift'-Vokabular und keine kommentierende Stimme (gehört FELDBUCH). Im Gegenzug den einen Klartextsatz und eine Spur menschliche Wärme zulassen: eine Zeile über der Skala, die sagt, was das hier ist und dass es kostenlos ist - sonst gewinnt das Instrument gegen die Konversion.

## Urteil

FUNKFEUER hat die mit Abstand beste Conversion-Analyse der fünf Konzepte - das 6:2-Verhaeltnis zwischen Discord-Ankern und Kopier-Buttons stimmt nachpruefbar, die CTA-freien Sackgassen /karte und /spieler existieren wirklich, der fehlende Xbox/Game-Pass-Hinweis ist eine echte Lücke, und der gestaltete Nullfall trifft den häufigsten Absprunggrund kleiner Server. Diese Hebel sind aber fast vollständig ästhetikunabhaengig und sollten in JEDES der fünf Konzepte uebernommen werden; sie sind kein Argument für diesen Entwurf. Als Design ist FUNKFEUER dagegen das riskanteste: Es ist eine Palworld-Seite, die Palworld verweigert, und sein Aussehen - Schwarz, Cyan, Mono, Raster, Cockpit - ist ausgerechnet der Default, den generative Werkzeuge ausgeben, wenn man ihnen 'dunkel, technisch, bloss nicht generisch' sagt. Es entkommt dem SaaS-Klischee, indem es ins Grafana-Klischee läuft. Technisch enthaelt der Kern einen echten Fehler (dashoffset in Prozent gegen eine SVG-Diagonale statt gegen die Pfadlaenge), drei teure Effekte, die in den realen Poll-Intervallen und Datenwerten praktisch unsichtbar bleiben (Fallblatt, Signalrauschen, Kartenlerp), zwei Anti-Patterns (View Transition auf Scroll, doppelter Scroll-Codepfad), keine mobile Antwort für das eigene Markenzeichen und - am schwersten für diese Infrastruktur - neun Einzelanfertigungen ohne wiederverwendbares Muster, was die Seite für einen einzelnen Admin faktisch einfriert. Dazu die konzeptionelle Ironie, dass ein Entwurf, der Messehrlichkeit zum Markenkern erklärt, minutengenaue Ausfälle behauptet, wo die Daten 5-Minuten-Auflösung mit Reparaturregel haben, und den eigenen 03:00-Neustart nicht von einem Absturz unterscheiden kann. Richtig ist FUNKFEUER für einen Auftraggeber, dessen wichtigstes Verkaufsargument nachweisbare Verlaesslichkeit ist und dessen Publikum technisch denkt - ein oeffentlich einsehbarer Statuszwang, ein Hoster, eine Infrastruktur-Marke. PalHeim ist das nicht: Es ist ein kostenloser, gemuetlicher PvE-Server mit abgeschalteter Todesstrafe, dessen eigentliches Produkt nette Leute sind, und dessen Nutzer auf einem Handy entscheiden, ob sie heute Abend dort spielen wollen. Fuer diesen Auftraggeber ist FUNKFEUER als Gesamtauftritt zu kalt und zu voraussetzungsreich - aber es liefert die praezise gebaute Vertrauens- und Live-Sektion, die jedes der anderen vier Konzepte braucht und keines von ihnen so gut durchdacht hat. Empfehlung: nicht als Auftritt gewinnen lassen, sondern als Kapitel in den Gewinner einbauen - und dabei die Kurve und die Ringskala mitnehmen, alles andere streichen.

---

## Eigene Risikoeinschätzung

- PERFORMANCE / BATTERIE: Zwei Canvas-Ebenen (Lichtkegel, Rauschen) plus scroll-gebundene SVG-Zeichnung können auf Mittelklasse-Android spuerbar Akku ziehen. Gegenmassnahme: harte 30-fps-Drossel, Pause bei document.hidden und ausserhalb des Viewports, Rauschen erst ab 1024px Breite, statisches Korn statt animiertem Filmkorn. Trotzdem muss vor dem Livegang auf echter Hardware gemessen werden - der Bestand liefert heute 30 KB kritischen Pfad, das ist ein Vorsprung, den man verspielen kann.
- BROWSER-STREUUNG: animation-timeline: scroll()/view() und die View Transitions API sind in Safari erst spät und teils unvollstaendig angekommen. Jede scroll-gebundene Animation braucht deshalb einen zweiten, ungetesteten Pfad (GSAP ScrollTrigger bzw. FLIP+WAAPI) - das ist doppelte Wartung für denselben Effekt. Alternative Haltung: die CSS-Variante als Fortschritt behandeln und im Fallback bewusst weniger zeigen, statt alles zu spiegeln.
- HALATION UND AUGENERMUEDUNG: #2FE3D0 auf #05070A hat 12,5:1 - technisch ideal, optisch aber grell. Menschen mit Astigmatismus sehen um helle Cyan-Kanten auf Schwarz einen Hof, dichter Mono-Text in Signalfarbe wird dann anstrengend. Deshalb ist --signal auf Linien und Ziffern begrenzt und --signal-tief für Flaechen zuständig; zusätzlich sollte ein 'Ruhig'-Modus (weniger Leuchtkraft) erwogen werden. Das Risiko bleibt und gehört getestet, nicht behauptet.
- DATENABHAENGIGKEIT ALS EINZELFEHLERSTELLE: Wenn die Gestaltung aus den Daten kommt, wird ein API-Ausfall zum Designproblem. Ohne saubere Gestaltung der drei Zustände (online / Spielserver aus / Leitstand aus) und ohne echte Skeletons wirkt die Seite kaputt statt ehrlich. Diese Zustände sind kein Nachgedanke, sie sind Pflichtlieferung - inklusive des Falls 'Server läuft seit einer Stunde, kaum Messpunkte, Kurve fast leer'.
- WARTUNGSKOSTEN EINER EIGENEN FORMENSPRACHE: 13 Sektionen mit 13 eigenen Formen, 14 eigene Glyphen, eine Fallblattanzeige, eine Peilscheibe, ein Streifenkalender - das ist deutlich mehr Code als 14 Komponenten mit derselben Kartenoptik. Ohne konsequente Token-Basis (Typo-Skala, 4px-Raster, Farbtokens ohne Drift) waechst das Stylesheet schnell über die heutigen 1840 Zeilen hinaus. Vor dem Redesign müssen die im Bestand gefundenen Token-Abweichungen bereinigt werden, sonst wandert der Drift mit in die dunkle Welt.
- KITSCH-GEFAHR SKEUOMORPHISMUS: Drehskalen, Kippschalter und gravierte Schilder kippen sofort ins Alberne, sobald jemand Chromverlaeufe, Schraubenkoepfe mit Schlagschatten oder Lederstrukturen ergaenzt. Die Regel muss lauten: technische Zeichnung, nicht Fotorealismus - 1px-Linien, matte Flaechen, keine Reflexe. Das ist eine Disziplinfrage, die im Design-System schriftlich festgehalten gehört, nicht dem Gefühl ueberlassen.
- BARRIEREFREIHEIT DER INSTRUMENTE: Eine Peilscheibe, ein Streifenkalender aus 168 Balken und eine Fallblattanzeige sind für Screenreader zunaechst Unsinn. Jedes Instrument braucht eine parallele Textfassung (Verfügbarkeit als Satz, Ausfälle als Liste mit Datum und Minuten, Leaderboard als echte Tabelle mit caption) sowie aria-live nur dort, wo Änderungen wirklich relevant sind - sonst redet die Seite bei jedem 30-Sekunden-Poll dazwischen. Die vorhandene Tastaturbedienung des Charts ist die Messlatte, nicht die Ausnahme.
- MOBILE REDUKTION: Die Randspur als 72px-Spur, die Peilscheibe, die Karte und der Streifenkalender funktionieren auf 360px nicht in derselben Form. Es braucht eine echte zweite Fassung (Randspur auf 4px Kantenlinie plus Peilleiste unten, Kalender auf 24h statt 168h, Karte mit reduzierter Markerdichte) - das ist ein zweiter Entwurf, kein Breakpoint. Wird das unterschaetzt, verliert genau die Haelfte der Besucher die Idee des Konzepts.
- RECHTLICH / ORGANISATORISCH: Schriften müssen selbst gehostet werden (der Bestand laedt Google Fonts remote und benennt das in der eigenen Datenschutzerklaerung), Inline-Styles und Inline-Skripte müssen raus, bevor eine strenge CSP möglich ist, und die Durchsage-Sektion nennt eine reale Person - dafuer braucht es deren ausdrueckliche Zustimmung und eine Abstimmung mit dem Impressum.
