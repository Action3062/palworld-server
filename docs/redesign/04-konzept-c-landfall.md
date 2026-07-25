# Konzept C — LANDFALL

> ### „Vierzehneinhalb Kilometer Insel – und einer der 32 Plätze ist deiner."

*Die Insel ist die Seite. Scrollen heißt anfliegen und landen.*

| | |
|---|---|
| **Register** | Entdeckung · Ort · Weite |
| **Signature-Moment** | DIE GLUT. Jedes warme Goldlicht auf der dunklen Insel ist eine echte Gildenbasis aus /api/map – kein Deko-Partikel, kein zufälliger Punkt, sondern ein Ort, an dem jemand tatsächlich gebaut hat. Beim Laden zünden sie einzeln, von innen nach außen, 40 Millisekunden auseinander, jedes mit einem weichen Bloom. Man sieht der Insel beim Bewohntwerden zu. |
| **Sektionen** | 12 |

---

## 1 · Designphilosophie

LANDFALL ist der seemännische Moment, in dem nach langer Fahrt Land in Sicht kommt. Genau das ist die Aufgabe dieser Seite: nicht erklären, dass es einen Server gibt, sondern einen Ort sichtbar machen, auf den man zufliegt.

Die Grundentscheidung: Die Karte ist nicht ein Feature der Seite, die Karte IST die Seite. PalHeim betreibt bereits eine Live-Karte mit echten Spielerpositionen und Gildenbasen – dieses Asset wird vom Unterpunkt zum Rückgrat. Sektionen sind keine Abschnitte, sondern Höhenmarken auf einem Sinkflug von 2.000 m auf 0 m. Man scrollt nicht durch Inhalte, man legt Strecke zurück: rund 20,5 km, die Diagonale des kalibrierten Weltrahmens (xTop 349400 / xBottom -1099400 / yLeft -724400 / yRight 724400 = 14,488 km im Quadrat).

Daraus folgt die zweite, härtere Regel: Jedes gestalterische Element muss an eine echte Zahl gebunden sein. Kein dekoratives Koordinatengeflimmer, keine erfundene Telemetrie. Wenn ein Wert keine Datenquelle hat, existiert er nicht. Das ist gleichzeitig die Antikörper-Strategie gegen KI-Optik: Ein Modell erfindet eine Landschaft, LANDFALL trägt eine ein.

Die dritte Regel ist eine Farbregel mit Bedeutung: Die Welt ist kalt (Tiefsee, Fels, Dunst, Peilung). Warm ist ausschließlich, wo Menschen sind – Gildenbasen, Leuchtfeuer, Discord, der Kaffee für den Admin. Gold heißt auf dieser Seite immer: hier wohnt jemand. Damit erzählt schon die Palette die Kernbotschaft eines privaten Community-Servers, bevor ein einziges Wort gelesen wird.

## 2 · Zielwirkung

SEKUNDE 1 – Reflex, vorsprachlich: „Das ist keine Website, das ist ein Ort." Ein dunkler, breiter Landkörper mit Höhenlinien, darüber Dunst, darauf verstreut warme Goldlichter. Kein Kasten, kein Menüband, keine Karte-über-Bild-Optik. Die Augen suchen automatisch die Lichter – und finden Menschen.

SEKUNDE 5 – Erkenntnis, die den Wert umdreht: „Die Lichter sind echt." Der Höhenmesser rechts zählt beim Scrollen von 2.000 m herunter, die Distanz zählt hoch, ein Cyanpunkt trägt plötzlich einen Namen und eine Peilung („Nordost · 3,2 km vom Zentrum"). Der Besucher begreift: Was da leuchtet, ist keine Illustration, das sind Gildenbasen und Spieler, die genau jetzt online sind. Gleichzeitig liegt die Serveradresse als volle Landeplatte am unteren Bildrand – die Kernhandlung ist nie mehr als einen Klick entfernt.

SEKUNDE 30 – Entscheidung, drei Fragen beantwortet: „Da ist gerade jemand unterwegs, es kostet wirklich nichts, und ich weiß, wie ich hinkomme." Der Besucher hat die Live-Zahl gesehen, die Weltgesetze als Höhenprofil gelesen (3× EP, kein PvP, keine Wipes), und – falls er weit genug gescrollt hat – die Lotung erlebt: die Suche nach dem Haken, die bei 0 € auf Grund läuft. Die Adresse ist kopiert oder Discord ist offen. Was bleibt, ist ein Bild: eine dunkle Insel mit warmen Lichtern, von denen eines fehlt.

## 3 · Farbwelt

Die Palette hat eine Grammatik, keine Stimmung: KALT = Welt, WARM = Mensch. Cyan (--peilung) markiert alles, was gemessen und navigiert wird – Spieler, Kurs, Zahlen, Fokus. Gold (--feuer) markiert ausnahmslos alles, wo jemand wohnt oder auf einen wartet. Rot (--brandung) existiert nur für Ausfälle. Drei Bedeutungen, drei Farben – deshalb braucht die Seite kein viertes Grün und keinen einzigen Verlauf als Dekoration.

Alle Werte sind gegen die tatsächlichen Flächen nachgerechnet, nicht geschätzt: --firn 17,3:1, --peilung 11,7:1, --feuer 10,7:1, --dunst 7,7:1 auf --schelf und 6,4:1 auf --terrain, --peilung-tief 6,8:1, --glut 6,6:1, --brandung 6,1:1. Damit ist die Trennung von Flächenfarbe und Textfarbe, die im Bestand schon methodisch richtig gemacht wurde (--accent vs --accent-text), in die dunkle Welt übernommen: --peilung-tief und --glut sind ausdrücklich als Flächen- und Großtextfarben deklariert und dürfen nie unter 18px stehen.

Farbfehlsichtigkeit: Cyan gegen Gold trennt sowohl im Ton als auch in der Helligkeit (L 0,564 gegen 0,514 – zusätzlich unterscheiden sich Form und Verhalten: Punkt mit Halo gegen Glut mit Bloom). Kritisch wäre Gold gegen Rot bei Protanopie – deshalb wird ein Ausfall nie über Farbe allein erzählt, sondern als buchstäbliche Lücke in der Küstenlinie plus Klartext-Label in Minuten.

Eine Regel ohne Ausnahme: reines Schwarz und reines Weiß kommen im gesamten Stylesheet nicht vor. Große weiche Verläufe auf Nahschwarz bandieren auf 6-Bit-Panels sichtbar; deshalb liegt über allen atmosphärischen Flächen eine 128×128-Kornkachel bei 2 % – ohne sie sieht der Hero billig aus, mit ihr wie gedruckt.

| Token | Hex | Rolle |
|---|---|---|
| `--tiefsee` | `#03060A` | Tiefste Ebene: Meer, Seitengrund unter dem Hero, Vollbild-Kartenflächen. Fast-Schwarz mit Blaustich, nie reines #000 (bandet auf OLED und wirkt tot). |
| `--schelf` | `#070D13` | Standard-Seitenhintergrund aller Textsektionen. Firn darauf misst 17,3:1, Dunst 7,7:1. |
| `--kuestenband` | `#0C161E` | Zweite Ebene: Sektionsböden, Fußzeilenfläche, Rechtsseiten-Prosa. Erzeugt Tiefe ohne Rahmen. |
| `--terrain` | `#12202B` | Erhabene Flächen: Wegpunkt-Panels, Landeplatte, Funkspruch-Log, Kompassschiene. |
| `--grat` | `#1B2F3D` | Oberste Fläche und Hover-Zustand. Einziger Flächenwechsel bei Interaktion – ersetzt jeden Schattenwurf. |
| `--kontur` | `rgba(63,220,200,0.16)` | Höhenlinien, Haarlinien, Panelkanten, Koordinatenticks. Ein einziger Linienton für die gesamte Seite. |
| `--peilung` | `#3FDCC8` | Primärakzent: Live-Spieler, aktive Wegpunkte, Zahlen-Ereignis, Chartserie, Fokusring. Gemessen 11,7:1 auf --tiefsee, 9,5:1 auf --terrain – auch als Fließtext AAA-tauglich. |
| `--peilung-tief` | `#12A8A0` | Flächen- und Füllvariante: Chartflächen, Verlaufsenden, gedämpfte Linien. 6,8:1 auf --tiefsee – reicht für Grafikobjekte und Großtext, NICHT für Kleintext. |
| `--feuer` | `#E8B65A` | Gold als Bedeutungsträger: alles, wo Menschen sind – Gildenbasen, Leuchtfeuer, Discord, Kaffee-Support. 10,7:1 auf --tiefsee. |
| `--glut` | `#C8863A` | Warme Flächen- und Bloom-Variante: Basenkerne, Leuchtfeuer-Strahl, Glut-Halos. 6,6:1 – nur Flächen und Großtext. |
| `--firn` | `#E8F2F6` | Primärtext, Überschriften, große Zahlen. Leicht kühles Weiß statt #FFF, damit Gold daneben nicht schmutzig wirkt. 17,3:1. |
| `--dunst` | `#8FA6B2` | Sekundärtext, Meta-Angaben, Koordinaten, Achsenbeschriftung. 7,7:1 auf --schelf, 6,4:1 auf --terrain – auch für 11px-Ticks sicher. |
| `--brandung` | `#E8654F` | Ausschließlich Ausfälle und echte Fehlerzustände. 6,1:1. Nie dekorativ, nie für Fehleingaben (die bekommen --feuer + Text). |
| `--nebel` | `rgba(18,168,160,0.07)` | Volumetrischer Dunst, Tiefenschleier, Nebelbänder. Drei gestapelte Ebenen dieses Werts ersetzen jeden Box-Shadow. |

## 4 · Typografie

**Display —** "Archivo" Variable (Google Fonts, wght 100–900, wdth 62–125), selbst gehostet als woff2, Subset latin + latin-ext, ~38 KB. Headlines laufen auf wdth 112–125 und wght 700–800. Fallback-Stack: "Archivo", "Archivo Expanded", "Arial Black", system-ui, sans-serif.

Warum diese: Archivo ist im Expanded-Schnitt horizontal – sie hat eine Landmasse-Breite, keine Turm-Höhe. Genau das braucht ein Konzept über eine Insel und einen Horizont, während jede kondensierte Displayschrift sofort nach Tarkov-Militär klingen würde. Sie besitzt einen echten Umfang von 100 bis 900 (der Bestand hatte drei Stärken, alle zwischen 600 und 800), eine Breitenachse, die ohne zweiten Font Kontrast erzeugt, saubere deutsche Umlaute und tabellarische Ziffern. Bei 260px Schriftgrad bleibt sie ruhig statt dekorativ – Baloo 2 löst sich in dieser Größe in Kinderbuch auf.

**Fließtext —** "Instrument Sans" Variable (Google Fonts, wght 400–700, opsz), selbst gehostet als woff2, ~29 KB. Fließtext steht auf 400 – im Bestand existierte kein einziges font-weight: 400, weshalb 800 dort nichts mehr signalisierte. Fallback: "Instrument Sans", "Inter", system-ui, sans-serif.

Warum diese: leicht schmaler Setzbreite als Inter, dadurch dichtere Zeilen bei gleicher Punktgröße, und eine minimal humanistische Wärme, die auf Nahschwarz nicht klinisch wird. Zusammen mit Archivo entsteht ein Breitenkontrast (weit vs. normal) statt eines Stilkontrasts – ein System, kein Font-Paar aus dem Katalog.

**Monospace —** "Martian Mono" Variable (Google Fonts, wght 300–800, wdth 75–112,5), selbst gehostet, ~26 KB, font-display: optional (Mikrotypo darf nachladen). Ausschließlich für die Telemetrie-Ebene: Koordinaten, Höhenmeter, Distanz, Peilung, Zeitstempel, Ausfalldauern, Funkspruch-Log, Kartenrand-Ticks. Eingestellt auf wdth 87,5 / wght 500 / letter-spacing 0,04em bei 11–13px.

Ausdrückliche Grenze: Martian Mono läuft NIE in Zahlenkolonnen (Bestenliste, Statistikwerte). Dort steht Archivo mit font-variant-numeric: tabular-nums – die Praxis aus dem Bestand (.leaderboard__table .num, .stat-card__value) wird eins zu eins übernommen, nur umgefärbt.

**Skala —** Modulare Skala, Faktor 1,26, neun Stufen. Alles andere ist verboten – im Bestand existierten 33 verschiedene rem-Größen, zwölf davon in einem 0,2rem-Band.

--t-100  clamp(0.6875rem, 0.66rem + 0.14vw, 0.8125rem)   Koordinaten, Ticks (Mono)
--t-200  clamp(0.8125rem, 0.79rem + 0.12vw, 0.875rem)     Meta, Bildunterschriften
--t-300  clamp(1rem, 0.96rem + 0.20vw, 1.125rem)          Fließtext, wght 400
--t-400  clamp(1.125rem, 1.05rem + 0.38vw, 1.375rem)      Lead, Ortsbeschreibung
--t-500  clamp(1.5rem, 1.32rem + 0.90vw, 2rem)            Untertitel, Werte klein
--t-600  clamp(2rem, 1.60rem + 2.00vw, 3.25rem)           Ortsname zweiter Ordnung
--t-700  clamp(2.75rem, 1.90rem + 4.20vw, 5.50rem)        Sektions-Ortsname
--t-800  clamp(3.50rem, 1.10rem + 11.0vw, 10.5rem)        Hero-Display (Claim)
--t-900  clamp(5.00rem, 1.00rem + 18.0vw, 17.0rem)        Zahlen-Ereignis

--t-900 kommt exakt zweimal auf der Startseite vor: die Live-Spielerzahl und die 0 der Lotung. Mehr wäre Lärm.

Abstände: 4px-Basis, elf Stufen (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 144 / 216). Sektionsabstände sind NICHT uniform – sie folgen der Flughöhe: oben 216px, in der Mitte 144px, am Boden 96px. Der Rhythmus verdichtet sich beim Sinken.

Drei Probleme werden gleichzeitig gelöst.

Erstens Hierarchie: Im Bestand lag das größte Element unter dem Hero bei 43px, und die drei wichtigsten Ebenen lagen innerhalb von 0,6rem. LANDFALL spreizt von 11px (Koordinate) auf 272px (Zahlen-Ereignis) – Faktor 24. Damit kann eine Zahl endlich der Held sein, ohne dass sie eine Kachel braucht.

Zweitens Stärkedynamik: Fließtext auf 400, Auszeichnung auf 500, Ortsnamen auf 700, Display auf 800. Weil unten wieder 400 steht, bedeutet 800 oben wieder etwas. Zusätzlich trägt Archivo eine Breitenachse: Sektions-Ortsnamen laufen auf wdth 118, Fließtext-Einleitungen auf wdth 100 – dieselbe Familie erzeugt zwei sichtbar verschiedene Register ohne dritten Font.

Drittens Recht und Ladezeit in einem Schritt: Alle drei Familien werden selbst gehostet. Das beseitigt die acht render-blockenden Google-Fonts-Links, den Fremd-Roundtrip vor dem ersten Pixel und die im eigenen Datenschutztext unter Punkt 5 selbst eingeräumte Einbindung. Preload nur für die zwei Variable-Dateien über der Falz (Archivo, Instrument Sans), Martian Mono lädt nach. Gesamtbudget Schrift: ~93 KB gegen heute zwei Fremdverbindungen plus unkontrollierte Menge.

Deutsche Besonderheiten sind geprüft: Alle drei Familien tragen Ä/Ö/Ü/ß in allen Achsenpositionen, und die Displaystufen laufen mit hyphens: manual plus gesetzten &shy; in den langen Komposita („Gilden&shy;basis", „Verfüg&shy;barkeit"), damit --t-700 auf 360px nicht bricht.

## 5 · Der Hero

Man kommt in der Höhe an. Vollflächig, 100svh, kein Hero-links-Bild-rechts, kein Kasten: der gesamte Bildschirm ist die Insel, gesehen aus rund 2.000 m in der blauen Stunde, schräg von Süden mit 14° Neigung – nie senkrecht von oben, das wäre Google-Maps-Optik.

Aufbau in sechs Ebenen von hinten nach vorn: Meer in --tiefsee mit einem sehr langsam driftenden Kaustik-Schimmer; die Landmasse als dunkler Fels mit 100-m-Höhenlinien in --kontur, an den Graten dichter; ein Nebelband, das in den Tälern liegt; wandernde Wolkenschatten; die Live-Ebene aus /api/map – jede Gildenbasis eine Goldglut mit weichem Bloom, jeder Spieler ein Cyanpunkt mit Halo und kurzer verblassender Spur; ganz vorn eine feine Vignette und die eine Haarlinie, an der Meer auf Himmel trifft.

Reihenfolge beim Laden, 2,4 s gesamt: 0,00 s Schwarz, oben links eine Zeile Martian Mono bei 30 % – „PALPAGOS · 14,488 km × 14,488 km · N ↑". 0,25 s zeichnen sich die Höhenlinien vom Zentrum nach außen (stroke-dashoffset, 900 ms, gestaffelt nach Abstand). 0,55 s Nebel und Meer blenden auf. 0,90 s entzünden sich die Goldlichter einzeln, eines pro echter Gildenbasis, sortiert nach Abstand vom Inselzentrum, 40 ms Abstand, je 260 ms Scale 0→1. 1,30 s fallen die Cyanpunkte mit 12 px Setzweg ein. 1,50 s fährt die Headline zeilenweise per clip-path aus dem Boden (620 ms, 90 ms Versatz), tief links an der Küstenlinie, unter einem deterministischen Scrim (radial 62 % im Textband plus linear von unten) – Kontrast garantiert, nicht gehofft. 1,90 s schiebt sich die Landeplatte vom unteren Rand herein: volle Breite, eine Zeile, pve.palheim.de:8211 plus „Adresse kopieren" als primärer Knopf. 2,20 s erscheint rechts der Kompass.

Ton: standardmäßig keiner. Im Kompass sitzt ein „Ton an"-Schalter für eine 18-s-Windschleife bei −24 LUFS, ausschließlich nach Klick, Wahl bleibt gespeichert.

## 6 · Seitenstruktur

| Sektion | Zweck | Form |
|---|---|---|
| **KOPF – Peilstreifen (48 px, kein Menüband)** | Marke und Kernhandlung dauerhaft verfügbar halten, ohne den ersten Bildschirm mit zwölf Klickzielen zu belasten. | Nur zwei Elemente auf einer Haarlinie: links die Rautenmarke plus Wortmarke, rechts – erst ab Hero-Austritt, eingeblendet per View Transition statt Sprung – die Serveradresse als dauerhaft kopierbarer Chip. Keine Navigationslinks; die Navigation ist die Kompassschiene rechts. |
| **1 ANFLUG · 2.000 m (Hero, 100svh, full-bleed)** | In Sekunde 1 einen Ort statt einer Seite zeigen; die Live-Daten sofort als Landschaft lesbar machen; die Kernhandlung (Adresse kopieren) über der Falz platzieren. | Sechs geschichtete Ebenen einer schrägen Reliefansicht der Insel mit echten Basen als Goldglut und echten Spielern als Cyanpunkte. Headline tief links an der Küste unter deterministischem Scrim. Am unteren Rand eine volle Landeplatte mit Adresse und Primärknopf. |
| **2 WER GERADE UNTEN IST · 1.400 m (Live-Status)** | Die wertvollste Information der Seite – die aktuelle Belegung – zum größten visuellen Ereignis machen und ihr sofort historischen Kontext geben. | Kein Kachelraster. EINE riesige Ziffernfolge in --t-900 als konturierte SVG-Schrift; innerhalb der Ziffernform ist die echte 24-h-Zeitreihe als Fläche geclippt und bewegt sich langsam – die Zahl enthält ihre eigene Geschichte. Darunter eine einzige Haarlinie mit vier Telemetriewerten in Martian Mono. Darunter die Online-Spieler als Peilliste: Name, Level, echte Peilung und Distanz vom Inselzentrum aus x/y. |
| **3 DAS HÖHENPROFIL DIESER WELT · 1.000 m (Raten + Regeln vereint)** | Weltgesetze an einem Ort beantworten statt in drei Sektionen plus FAQ; und dabei zeigen, dass Raten und Regeln dasselbe sind – Einstellungen dieser Welt. | Eine einzige durchgehende Profillinie über die volle Viewportbreite, die sich beim Scrollen zeichnet. Oberes Register: die Raten als Gipfel (3× EP ist der höchste). Unteres Register: die Regeln als ruhige Grundlinie mit kleinen Markierungspfosten – „kein PvP" liegt als flache Ebene da, „Admin-Entscheidungen sind final" als Fels. Labels erscheinen, wenn der Zeichenkopf sie passiert. |
| **4 DIE BEWOHNTEN ORTE · 700 m (Live-Karte, full-bleed)** | Der Beweis-Moment: das einzige Bild, das kein anderer Server kopieren kann. Gleichzeitig Einstieg in /karte und in die Spielerprofile. | Randlos, 100svh, Karte auf Arbeitsmaßstab – keine Karte in einer Karte. Basen als Goldglut mit Gildennamen an Haarlinien-Fahnen wie Kartenauszeichnungen, Spieler als Cyanpunkte, beide klickbar. Filter als drei dünne Schalter auf einer Haarlinie statt als Knopfleiste. Unten rechts ein Maßstabsbalken über 1 km. |
| **5 LOTUNG · 520 m (Was kostet das? Wo ist der Haken?)** | Die Vertrauensfrage beantworten, bevor die Beitrittsaufforderung kommt – als Erlebnis, nicht als Behauptung. | Der einzige Moment, in dem der Flug anhält und etwas fällt. Eine senkrechte Haarlinie mit einem Senkblei sinkt scrollgebunden nach unten; links ziehen die gesuchten Haken vorbei: Preise – keine. Accounts – keiner. Downloads – keiner. Werbung – keine. Tracking – keins. Das Lot schlägt auf einer Platte auf: „Grund erreicht: 0 €." Versetzt daneben, bewusst kleiner, der ehrliche Teil in Goldkontur: Die Kosten trägt der Admin, ein Kaffee ist freiwillig und bringt keine Vorteile. |
| **6 DIE KÜSTENLINIE DER LETZTEN SIEBEN TAGE · 300 m (Verfügbarkeit, Ausfälle, Weltalter)** | Vertrauen aus echten Betriebsdaten statt aus Adjektiven; die Frage „läuft der Server, oder stirbt der nach vier Wochen?" beantworten. | Die 7-Tage-Messreihe als durchgehende Küstenlinie über die volle Breite. Jeder Ausfall ist buchstäblich eine Lücke im Land – ein schwarzer Kanal, der die Küste durchschneidet, mit Minutenangabe in Martian Mono am Ufer. Der Verfügbarkeitswert schwebt als Wasserstandslinie darüber. Ohne Ausfälle: eine ungebrochene Küste und ein Satz. Rechts als zweite Zahl die vergangenen In-Game-Tage. |
| **7 WER HIER LEBT · 200 m (Bestenliste, Retention)** | Sozialer Beweis und Einstieg in die Wiederkehr-Schleife der Spielerprofile. | Keine Tabelle, kein Raster. Zehn horizontale Wegstrecken untereinander: Die LÄNGE jeder Linie ist die Spielzeit, ein Peilkreis auf der Linie markiert das Level, am Ende sitzt ein kleiner Terminus mit Name und „zuletzt gesehen". Zehn verschieden weite Flüge, sofort vergleichbar, ohne Spaltenlogik. Rechts die Werte in Archivo mit tabellarischen Ziffern. Jede Linie führt auf /spieler/<name>. |
| **8 LANDEN · 120 → 0 m (Mitspielen)** | Die Handlungsanleitung genau dort, wo der Flug aufsetzt – und die zwei ehrlichen Antworten geben, die heute fehlen (Crossplay, Passwort). | Keine nummerierten Verlaufskreise. Die Kursline der Kompassschiene verlässt hier den Bildrand und berührt den Boden. Drei Höhenmarken – 120 m, 60 m, 0 m – tragen je einen Schritt. Die mittlere Marke trägt die Adresse ein zweites Mal mit eigenem Kopierknopf. Am Boden zwei Klartextnotizen: Steam-only (Xbox und Game Pass können nicht auf einen Dedicated Server) und eine eindeutige Passwortaussage – kein „falls aktiv". |
| **9 FUNKSPRUCH · 0 m (FAQ, radikal gekürzt)** | Nur echte Support-Fragen sichtbar beantworten; die vollständigen neun Antworten bleiben maschinenlesbar im JSON-LD. | Ein Funkprotokoll, kein Akkordeon mit rotierendem Plus. Vier Einträge, jeweils zweizeilig: Frage in --peilung / Martian Mono mit Zeitstempel-Optik, Antwort darunter in Instrument Sans 400. Alle offen, nichts zugeklappt. Nur: Verbindung klappt nicht, Xbox/Game Pass, Passwort, Kontakt. |
| **10 LEUCHTFEUER · Bodenhöhe (Discord + wer das betreibt)** | Emotionaler Zielpunkt der Reise und der zweite, klar sekundäre Ausgang – plus die bislang völlig fehlende Autorschaft. | Die einzige warm dominierte Fläche der ganzen Seite: Die Palette dreht ihre Logik um, Gold wird zur Lichtquelle, alles andere fällt in Schatten. Ein Leuchtfeuer an der Küste schwenkt seinen Strahl langsam durch die Sektion; im Strahl steht der Discord-Knopf. Daneben, ruhig und namentlich, drei bis vier Sätze der Person aus dem Impressum: wer das betreibt, seit wann, warum es nichts kostet. |
| **11 SEEKARTENRAND (Fußzeile)** | Rechtssicherheit, Orientierung und die Marken-Klarstellung lesbar abschließen – nicht in 10px-Grau versenken. | Der Rand einer Seekarte: eine Haarlinienrahmung mit Koordinatenticks an allen vier Kanten, ein Maßstabsbalken, eine echte Legende (Goldglut = Gildenbasis, Cyanpunkt = Spieler, Lücke = Ausfall), die Links als Kartenanmerkungen, der Besucherzähler als „Besucher an dieser Küste". Der Pocketpair-Hinweis steht als Kartennotiz in --t-200 auf --firn – vollständig lesbar. |

## 7 · Scroll-Journey

1. 0 % · 2.000 m · 0,0 km — Anflug. Die ganze Insel steht still im Bild, nur Nebel und Wolkenschatten wandern. Die Goldlichter sind bereits gezündet. Der Kompass rechts zeigt Kurs 348°, Höhe 2.000 m, Distanz 0,0 km. Absicht: Staunen vor Information.
2. 8 % · 1.850 m · 1,6 km — Erster Kursschritt. Die Headline löst sich per clip-path nach unten auf, der Höhenmesser beginnt zu laufen, der Wanderring auf der Kompassschiene verlässt Wegpunkt 1. Die Landeplatte mit der Adresse löst sich vom Hero-Boden und wandert per View Transition in den Kopf – die Kernhandlung geht nie verloren.
3. 15 % · 1.400 m · 3,1 km — Das Zahlen-Ereignis steigt auf. Die Live-Spielerzahl wächst von unten ins Bild, während das Terrain hinter ihr um Faktor 0,12 langsamer mitzieht. In der Ziffernform arbeitet die 24-h-Kurve. Absicht: Der Beweis kommt vor jedem Argument.
4. 24 % · 1.150 m · 4,9 km — Die Peilliste. Für jeden Online-Spieler wandert eine Haarlinie vom Namen zurück in die Landschaft zu seinem echten Punkt. Bei null Spielern kippt die Sektion in den Nullzustand: Rekord mit Datum plus Prime-Time-Silhouette aus der 7-Tage-Kurve. Absicht: Auch ein leerer Server erzählt etwas.
5. 28 % · 1.000 m · 5,7 km — Das Höhenprofil setzt an. Die Profillinie beginnt links am Bildrand zu zeichnen; Gipfel und Ebenen bauen sich scrollsynchron auf. Absicht: Regeln lesen sich als Gelände, nicht als Haken-Liste.
6. 42 % · 700 m · 8,6 km — Wolkendurchbruch. Die drei Nebelbänder ziehen nach oben aus dem Bild, die Terrainebenen beschleunigen kurz auseinander (Parallaxe-Spreizung von 0,12 auf 0,42), Höhenlinien werden dichter, Basen bekommen Namen. Der Maßstab kippt hörbar-sichtbar von Übersicht auf Arbeit. Absicht: körperlich spürbarer Sinkflug.
7. 52 % · 520 m · 10,6 km — Der Flug hält an. Der Höhenmesser friert ein, die Parallaxe stoppt, die Distanzanzeige pausiert. Als einzige Bewegung fällt ein Senkblei. Absicht: Der Vertrauensmoment bekommt Stille, weil alles andere sich sonst bewegt.
8. 58 % · 520 m · 10,6 km — Grund erreicht: 0 €. Ein einzelner cyanfarbener Stoßring, dann läuft der Höhenmesser weiter. Absicht: Die Antwort auf „wo ist der Haken" ist ein Ereignis, kein Absatz.
9. 62 % · 300 m · 12,7 km — Küstenlinie der letzten sieben Tage. Die Zeitreihe schiebt sich als Land von rechts herein; wo Ausfälle waren, öffnen sich schwarze Kanäle. Absicht: Verfügbarkeit als Landschaft statt als Prozentkachel.
10. 72 % · 200 m · 14,7 km — Zehn Wegstrecken. Die Bestenlisten-Linien wachsen nacheinander von links, jede genau so weit wie ihre Spielzeit. Absicht: Der Server hat Bewohner, keine Nutzer.
11. 82 % · 120 m · 16,8 km — Landeanflug. Die Kursline der Kompassschiene verlässt den rechten Rand und legt sich flach über die Sektion; der Boden kommt spürbar hoch, die vorderste Terrainebene bewegt sich schneller als der Scroll. Absicht: Dringlichkeit ohne Ausrufezeichen.
12. 90 % · 0 m · 20,5 km — Aufsetzen. Alle Parallaxe endet exakt hier, die Bewegung der ganzen Seite kommt zum Stillstand. Der Kompass zeigt „0 m · 20,5 km zurückgelegt" und wird zu einer ruhigen Marke. Erst danach beginnt der Leuchtfeuer-Schwenk – die einzige Bewegung, die nach der Landung übrig bleibt. Absicht: Ankommen, nicht weiterscrollen.

## 8 · Animationen

- ANFLUG-AUFBAU (Hero-Intro, 2,4 s). SVG-Höhenlinien zeichnen sich per stroke-dashoffset vom Zentrum nach außen, 900 ms, cubic-bezier(.16,1,.30,1), Verzögerung je Pfad = Abstand vom Inselmittelpunkt × 1,8 ms. Anschließend zünden die Basen per WAAPI element.animate() mit 40 ms Stagger, je 260 ms scale(0)→scale(1) plus Bloom-Opacity 0→1. Ruhige Variante: alle Ebenen erscheinen gemeinsam in einer 200-ms-Blende, Höhenlinien und Glut sofort vollständig.
- HÖHENPARALLAXE (sechs Terrainebenen). CSS scroll-driven: animation-timeline: scroll(root block) je Ebene mit eigener translate3d-Range (Faktoren 1,00 / 0,82 / 0,64 / 0,46 / 0,28 / 0,12), linear, komplett auf dem Compositor. Fallback für Browser ohne animation-timeline über eine einzige rAF-Schleife, die nur zwei Custom Properties schreibt (--scrollY, --heroP) – kein Layout-Read pro Ebene. Ruhige Variante: alle Faktoren auf 1,00, das Bild steht.
- WOLKENSCHATTEN (Canvas). Eine 2048×2048 nahtlose Noise-Kachel wird auf ein <canvas> mit globalCompositeOperation 'multiply' gezeichnet, Translation 6 px/s plus scrollabhängiger Versatz, hart auf 30 fps gedrosselt, per IntersectionObserver pausiert, auf coarse pointer / Viewport < 900 px gar nicht instanziiert. Ruhige Variante: ein einziger statischer Schattenwurf als Hintergrundbild, keine Schleife, kein Canvas.
- HÖHENMESSER-ZÄHLWERK. Höhe (2.000 → 0 m) und Distanz (0,0 → 20,5 km) hängen an einem einzigen ScrollTrigger mit scrub: 0.4, geschrieben über gsap.quickSetter bzw. im dependenzfreien Pfad über eine gedrosselte rAF-Zuweisung. Werte snappen auf 10 m bzw. 0,1 km, gesetzt in Martian Mono mit tabular-nums, damit die Breite nicht zittert. Ruhige Variante: Werte aktualisieren nur beim Passieren eines Wegpunkts, in Schritten, ohne Zwischenwerte.
- WEGPUNKT-PASSAGE. Erreicht der Wanderring einen Rautenwegpunkt, skaliert die Raute 1→1,6→1 in 380 ms auf cubic-bezier(.34,1.40,.64,1), gleichzeitig tippt sich der Ortsname in Martian Mono mit 22 ms/Zeichen. WAAPI, ausgelöst von IntersectionObserver auf den Zielsektionen (nicht von Scrollrechnung). Ruhige Variante: Raute wechselt schlicht die Füllung, Name steht sofort vollständig.
- DIE LEBENDE ZIFFER (Zahlen-Ereignis). Die Live-Spielerzahl ist ein <svg><text> mit clipPath; darin liegt die echte 24-h-Reihe als gefüllter Pfad, der per stroke-dashoffset einzeichnet und danach mit 40 s Periode um 6 px vertikal driftet. Wertwechsel laufen über document.startViewTransition(): alte Ziffer 320 ms Crossfade plus 6 px Aufstieg; ohne API-Unterstützung ein schlichter Austausch. Ruhige Variante: kein Drift, kein Einzeichnen – die Fläche steht, Wertwechsel ohne Transition.
- HÖHENPROFIL-ZEICHNUNG. Ein einziger <path> über die volle Sektionsbreite; stroke-dashoffset an animation-timeline: view() gebunden, animation-range: entry 10% cover 60%. Jeder Marker trägt --i und leitet daraus animation-delay ab – reines CSS, null JavaScript. Ruhige Variante: Pfad und alle Marker sind ab dem ersten Frame vollständig sichtbar.
- BASEN-GLUT / VOLUMETRISCHES LICHT. Jede Basis ist ein <circle> auf einem gemeinsamen <filter> mit feGaussianBlur (ein Filter für alle, nicht einer pro Basis – sonst bricht die GPU ein). Helligkeit schwingt ±12 % auf einer 4,2-s-Sinus über WAAPI mit composite: 'add', Phasenversatz je Basis aus --seed, damit nichts im Gleichtakt pulst. Hover legt eine zweite additive Animation darüber, ohne die erste zu unterbrechen. Ruhige Variante: konstante Helligkeit, Bloom bleibt, Schwingung entfällt.
- NEBELBÄNDER. Drei vollbreite Ebenen aus radial-gradient-Masken in --nebel, je eigene translate3d- und scale-Schleife über 60 s / 90 s / 140 s, mix-blend-mode: screen, Deckung 6–10 %, ease cubic-bezier(.45,0,.55,1). Reines CSS, keine Bilder. Ruhige Variante: eine statische Ebene bei 8 %.
- MAUS-PEILUNG. Zeigerposition schreibt --mx/--my, geglättet mit Lerp-Faktor 0,08 in einer rAF-Schleife. Das Hero-Terrain verschiebt sich bis 14 px gegenläufig, und ein großes weiches Radial in --peilung bei 5 % läuft als Sucherlicht über das Relief und legt in einer maskierten Ebene zusätzliche Höhenliniendichte frei. Nur bei (pointer: fine) aktiv. Ruhige Variante: vollständig deaktiviert, Sucherlicht entfällt.
- LOT-FALL (Lotung). Die Y-Position des Senkbleis hängt an ScrollTrigger mit scrub 0.6; die vorbeiziehenden Haken-Labels blenden über animation-timeline: view() ein und aus. Der Aufschlag auf der Platte hat 90 ms Überschwingen, danach genau ein Stoßring per WAAPI: scale(.2)→scale(1), opacity .5→0, 260 ms, cubic-bezier(.16,1,.30,1). Ruhige Variante: Das Lot springt beim Sektionseintritt direkt auf Grund, kein Stoßring, Labels stehen untereinander.
- LEUCHTFEUER-SCHWENK. Ein conic-gradient auf einem Pseudoelement rotiert per WAAPI in 9 s linear, maskiert von einem weichen Radial. Über CSS.registerProperty('--strahl') hängt der box-shadow-Spread des Discord-Knopfs an derselben Animation, sodass Strahl und Knopf exakt synchron atmen. Ruhige Variante: Der Strahl steht fest auf dem Knopf gerichtet, kein Schwenk, Knopf mit statischem Glimmen.

## 9 · Bildsprache

MOTIV: Genau ein Hauptmotiv für die ganze Seite – die Insel als dunkles Relief, gezeichnet im kalibrierten Rahmen (14,488 × 14,488 km, Norden oben). Kein zweites Landschafts-Artwork, keine Stimmungsbilder, keine Pals als Maskottchen. Das Bild ist eine Karte, die aussieht wie ein Ort, nicht ein Ort, der eine Karte imitiert.

PERSPEKTIVE: 12–18° schräg von Süden, leichte Kippachse. Niemals senkrecht von oben (Google-Maps-Optik, ausdrücklich verboten) und niemals eine schwebende Karte über einem Foto. Der Horizont liegt bei ca. 18 % Bildhöhe, damit unten Platz für Text und Landeplatte bleibt.

LICHT: Blaue Stunde, etwa 22 Minuten nach Sonnenuntergang. Eine tiefe Restlichtquelle aus Nordnordwest bei 8° über dem Horizont – lange Gratschatten, ein warmer Saum von 4 % Deckung nur auf westexponierten Hängen. Alles Übrige ist kalt. Warmes Licht existiert ausschließlich dort, wo Menschen sind: Gildenbasen (Glut), Leuchtfeuer, Kaffee-Support.

BEHANDLUNG: Hypsometrische Tönung in nur drei Stufen (Tiefsee / Schelf / Küstenband) plus 100-m-Höhenlinien in --kontur. Isobathen im Wasser, feiner als an Land. Alle Auszeichnungen an Haarlinien-Fahnen wie in einer Seekarte, nie in Sprechblasen. Über allem eine 128×128-Kornkachel bei 2 %, monochrom – ohne sie bandieren die weichen Verläufe auf Nahschwarz sichtbar.

PRODUKTION: Ein Master 4096×4096 als AVIF plus WebP, Varianten 2048 / 1024 / 512 über <picture> mit srcset (mobil ≤ 90 KB). Höhenlinien und Landmaske liegen als separate SVG-Ebenen darüber, damit sie scharf skalieren und animierbar bleiben. Der bereits vorhandene Bildslot der Karte (/assets/map.*) und dieselben vier Kalibrierungswerte speisen das Relief – Artwork und Datenrahmen sind zwingend gekoppelt.

IKONOGRAFIE: 25 gezeichnete Kartensymbole auf 24-px-Raster, 1,5 px Strichstärke, alle aus drei Grundformen gebaut (Kreis, Raute, Höhenlinienbogen) – Gipfel, Bucht, Steg, Turm, Feuer, Nachtmond. Sie ersetzen die 25 System-Emoji der Erfolge vollständig.

DO: Höhenlinien, Isobathen, Talnebel, Koordinatenticks, Haarlinien-Fahnen, ein warmes Licht pro bewohntem Ort, Maßstabsbalken.
DON'T: Lens Flares, Godrays ohne Quelle, Magenta- oder Lila-Verläufe, Glassmorphism-Panels, schwebende 3D-Karten, weichgeschattete Rundrechtecke, Emoji, Lucide-Standardglyphen, fotografische Wolken, jede Form von Pokéball-Silhouette.

## 10 · Interaktionen

- ADRESSE KOPIEREN (die eine Kernhandlung). Klick auf die Landeplatte: Der Text wird von einer 1-px-Cyanlinie in 220 ms von links nach rechts überstrichen, danach steht „Kopiert" in Martian Mono, 1,8 s lang, gleichzeitig setzt der Kompass eine Markierung. Zweck: Bestätigung ohne Toast, ohne Layoutsprung. Pflicht-Fallback, der heute fehlt: Schlägt navigator.clipboard fehl, wird die Adresse per Range automatisch markiert und das Label wechselt auf „Markiert – mit Strg+C kopieren". Nie mehr passiert sichtbar nichts.
- SPIELERPUNKT ANPEILEN. Hover oder Fokus auf einem Cyanpunkt rollt in 260 ms eine Haarlinie zu einem kleinen Ausleser aus: Name, Level, echte Peilung und Distanz vom Inselzentrum, berechnet aus x/y. Zweck: aus einem Datenpunkt einen Menschen an einem Ort machen. Tastatur: alle Punkte sind fokussierbar, Pfeiltasten wandern in Peilreihenfolge.
- GLUT ANSEHEN. Hover auf einer Basis lässt den Gildennamen an einer Haarlinie aufsteigen und den Bloom-Radius auf 1,35× wachsen. Zweck: Die zentrale Botschaft „hier wohnt jemand" wird körperlich – man leuchtet ein Zuhause an.
- KOMPASS-STEUERN. Klick auf einen Wegpunkt scrollt sanft zum Ort; der Wanderring läuft dem Scroll 120 ms voraus, sodass es sich nach Steuern anfühlt, nicht nach Springen. Technisch zwingend dahinter: scroll-padding-top in Header-Höhe am :root – der Fehler, der heute jeden der acht Ankersprünge unter die Navigation legt.
- FOKUS ALS SYSTEM. Ein einziger Token für ALLE interaktiven Elemente: 2 px --peilung Outline, 3 px Offset, dazu 0 0 0 6px rgba(63,220,200,.18) als Halo für dunkle Flächen. Zweck: Heute haben rund 80 % der Bedienelemente keinen sichtbaren Fokus; auf Nahschwarz mit kontrastarmen Kanten ist das eine echte Navigationsstörung, kein Häkchen.
- TON AN. Ein Schalter im Kompass startet eine 18-s-Windschleife bei −24 LUFS – niemals automatisch, Wahl bleibt in localStorage, bei prefers-reduced-motion startet nichts von selbst. Zweck: Atmosphäre anbieten, nie aufzwingen.
- HÖHENPROFIL ABGEHEN. Hover auf einem Marker verdickt die Profillinie darunter von 1 auf 2 px und blendet die Höhenmarke ein. Alle Marker sind echte <button> in einer role="list"; Pfeiltasten laufen das Profil ab wie eine Route. Zweck: Regeln und Raten sind mit der Tastatur genauso begehbar wie mit der Maus.
- WEGSTRECKE VERFOLGEN. Hover auf einer Bestenlisten-Linie verlängert sie um 8 px und lässt einen feinen Lichtpunkt in 500 ms ihre ganze Länge ablaufen. Klick führt auf /spieler/<name>. Zweck: die Retention-Schleife sichtbar machen – die Linie führt buchstäblich irgendwohin.
- KÜSTENLINIE LESEN. Die bestehende Tastaturbedienung des Charts (Pfeiltasten plus dynamische aria-live-Region) wird eins zu eins übernommen, nur umgefärbt: Der Serienschlüssel im Tooltip und das Fadenkreuz bleiben. Zweck: Vorhandene, überdurchschnittliche Barrierefreiheit darf beim Redesign nicht verloren gehen.
- PEILSTREIFEN-ÜBERGABE. Beim Verlassen des Hero wandert die Adresse per View Transition aus der Landeplatte in den Kopf – kein Einblenden, kein Sprung, ein sichtbarer Ortswechsel desselben Objekts. Zweck: Der Nutzer versteht, dass die Adresse ihn ab jetzt begleitet, statt sie neu suchen zu müssen.

## 11 · Wireframe

```
LANDFALL · Startseite · Sinkflug 2.000 m -> 0 m · Strecke 20,5 km
Zeichen: [] Flaeche  <> Wegpunkt  o Gildenbasis (Gold)  * Spieler (Cyan)
==============================================================================

--- KOPF (48px, klebt, KEIN Menueband) ---------------------------------------
 <>PALHEIM                        [ pve.palheim.de:8211 ]  ( kopieren )
                                   ^ erscheint erst ab Hero-Austritt,
                                     per View Transition aus der Landeplatte
==============================================================================

--- 1 ANFLUG · 2.000 m · 100svh · randlos ------------------------------------
 PALPAGOS  14,488 km x 14,488 km  N oben        <- Mono, 30% Deckung
                                                     .----------------.
          _.-~~-._        *        _.-~-._           |    KOMPASS     |
       .-~   .--.  ~-.        _.-~~      ~-._        |    N  348      |
      (    _(  o )_    )_.-~~     o          )       |   ---(o)---    |
       ~-._  ~----~           *        _.-~~         |   <> Anflug    |
           ~~-._____.-~~-.__.-~~~-.__.-~             |   <> Live      |
              o             o                        |   <> Profil    |
        ( Relief, Höhenlinien, Talnebel )           |   <> Karte     |
                                                     |   <> Lotung    |
 Vierzehneinhalb Kilometer Insel -                   |   <> Kueste    |
 und einer der 32 Plätze ist deiner.                |   <> Landen    |
                                                     |----------------|
 32 Plätze · 3x EP · kein PvP · kostenlos           | 2.000 m 0,0 km |
                                                     | [ Ton an ]     |
 ....... Scrim: radial 62% im Textband .......       '----------------'
+----------------------------------------------------------------------------+
| LANDEPLATTE   pve.palheim.de:8211      [ ADRESSE KOPIEREN ]   Discord >     |
+----------------------------------------------------------------------------+
==============================================================================

--- 2 WER GERADE UNTEN IST · 1.400 m -----------------------------------------

        _____   __
       |___  | /  \        <- --t-900, bis 272px, konturierte SVG-Schrift
        ___| |/ /\ \          IN der Ziffernform läuft die echte 24h-Kurve
       |___  |\ \/ /          als gefuellte Flaeche und driftet langsam
           |_| \__/        von 32 Plätzen

 --------------------------------------------------------------------------
  PEAK HEUTE 14 | REKORD 19 (12.03.) | FPS 58 | VERFUEGBAR 24h 99,8 %
 --------------------------------------------------------------------------
  * Kaida     Lv 47   Nordost  · 3,2 km vom Zentrum        -> /spieler/...
  * Torben    Lv 31   Sued     · 5,8 km vom Zentrum        -> /spieler/...
  * Mio       Lv 12   West     · 1,1 km vom Zentrum        -> /spieler/...
  ( 0 online -> Rekord + Prime-Time-Silhouette aus der 7-Tage-Kurve )
==============================================================================

--- 3 DAS HOEHENPROFIL DIESER WELT · 1.000 m ---------------------------------
 Was schneller geht (Gipfel)                     zeichnet sich beim Scrollen
        /\3x EP
       /  \      /\2x Fang   /\2x Drop
______/    \____/  \________/  \____/\4 Basen/Gilde___/\32 Slots____
 ...................... Grundlinie: was hier gilt ......................
  |kein PvP   |keine Todesstrafe  |keine Wipes  |ohne Mods  |Backups
  |Neustart 03:00   |inaktive Basen nach 30 Tagen   |Admin final
==============================================================================

--- 4 DIE BEWOHNTEN ORTE · 700 m · 100svh · randlos --------------------------
  Spieler [x]   Basen [x]   Namen [x]        <- drei Schalter auf Haarlinie
 ______________________________________________________________________
        o---- Nordwacht            *----Kaida (47)
              _.-~~-._      o---- Talgrund
           .-~        ~-.        *----Torben (31)
          (   o---- Seehof   )
           ~-._        _.-~     o---- Aschenhang
               ~~----~~
 |---1 km---|                          voll: /karte  ->
==============================================================================

--- 5 LOTUNG · 520 m · der Flug hält an -------------------------------------
                        |
   Preise ............. |  keine
   Accounts ........... |  keiner
   Downloads .......... |  keiner
   Werbung ............ |  keine
   Tracking ........... |  keins
                       (O)   <- Senkblei, scrollgebunden
                    ========
                    GRUND ERREICHT: 0 EURO
                                        .---------------------------.
                                        | Die Kosten traegt der     |
                                        | Admin. Ein Kaffee ist     |
                                        | freiwillig - ohne Extras. |
                                        | [ Kaffee ]  (Gold, klein) |
                                        '---------------------------'
==============================================================================

--- 6 DIE KUESTENLINIE DER LETZTEN SIEBEN TAGE · 300 m -----------------------
  Wasserstand: 99,4 % verfügbar (7 Tage)
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ####/^\###/^^^\####/^\#####|  |####/^^\###/^\####/^^^^\####/^\#####
 ###################################|  |###########################
   Mo    Di    Mi    Do    Fr       ^6 min    Sa            So
                                    Ausfall = Lücke im Land + Label
  In dieser Welt sind 412 Tage vergangen.
==============================================================================

--- 7 WER HIER LEBT · 200 m --------------------------------------------------
  Länge der Linie = Spielzeit · Ring = Level · Ende = zuletzt gesehen
  1 ==========================(47)=========o Kaida        214 h   heute
  2 =====================(52)=============o Nero          198 h   heute
  3 ==================(38)=====o Torben                   131 h   gestern
  4 ==============(41)===o Sina                            96 h   2 Tage
  5 ==========(29)==o Mio                                  71 h   heute
  ... jede Linie führt auf /spieler/<name>
==============================================================================

--- 8 LANDEN · 120 -> 0 m ----------------------------------------------------
 \
  \___ 120 m   Palworld auf Steam starten -> Mehrspieler -> Beitreten
      \
       \___ 60 m   [ pve.palheim.de:8211 ]  ( kopieren )  eintragen
           \
            \___ 0 m   Welt laedt. Kein Account, kein Download, kein Preis.
 ______________________________________________________________________
  Steam-only: Xbox und Game Pass können auf keinen Dedicated Server.
  Passwort: aktuell keins nötig - Änderungen stehen im Discord.
==============================================================================

--- 9 FUNKSPRUCH · 0 m (nur echte Fragen) ------------------------------------
  >> Verbindung klappt nicht
     Antwort in einer Zeile, offen, kein Akkordeon.
  >> Xbox / Game Pass
     Antwort ...
  >> Passwort
     Antwort ...
  >> Kontakt
     Antwort ...
==============================================================================

--- 10 LEUCHTFEUER · Bodenhoehe · warm dominiert -----------------------------
              \        |        /
               \       |       /        <- Strahl schwenkt 9 s
                \      A      /            (conic-gradient, WAAPI)
        ---------- [ DISCORD BEITRETEN ] ----------
      Wer das betreibt und warum es nichts kostet:
      3-4 Sätze, namentlich, Person aus dem Impressum.
==============================================================================

--- 11 SEEKARTENRAND (Fusszeile) ---------------------------------------------
 +--|----|----|----|----|----|----|----|----|----|----|----|----|----|--+
 |  LEGENDE  o Gildenbasis   * Spieler   | | Ausfall                    |
 |  |--1 km--|                                                          |
 |  Karte · Statistiken · Mitspielen · Regeln · Discord                 |
 |  Impressum · Datenschutz          Besucher an dieser Kueste: 12.481  |
 |  PalHeim ist ein inoffizieller Community-Server.                     |
 |  Palworld ist eine Marke von Pocketpair, Inc.                        |
 +--|----|----|----|----|----|----|----|----|----|----|----|----|----|--+
```

## 12 · Moodboard

Kein einziges Gaming-Moodboard-Bild. Die Referenzen kommen aus der Kartografie und der Navigation, weil dort das Problem „viel Information, wenig Licht, trotzdem schön" seit zweihundert Jahren gelöst ist.

Erste Reihe: Eduard Imhofs Reliefdarstellungen aus „Kartographische Geländedarstellung" – Gelände als Licht und Schatten statt als Textur. Marie Tharps Tiefseekarten des Atlantiks: eine Welt, die man nie gesehen hat, gezeichnet allein aus Messwerten. Die Seekarten des BSH und der britischen Admiralty: Isobathen, Leuchtfeuerkennungen, Kartenrand mit Koordinatenticks, Legende als eigene Fläche. IFR-Anflugkarten für die Disziplin der Höhenmarken – aber ausdrücklich ohne Cockpit-Kulisse, sonst wird daraus ein Kontrollpult.

Zweite Reihe, für Ton und Kante: Erik Nitsches technische Illustrationen für General Dynamics (dunkler Grund, wenige Farben, große Ruhe), Vignellis Verkehrsplan-Strenge als Gegengewicht gegen jede Verspieltheit, und die Instrumentenbeleuchtung alter Braun-Geräte – warmes Licht nur dort, wo es etwas bedeutet.

Texturen und Materialien: mattes Anthrazit, nasser Schiefer, gebürstetes Aluminium mit maximal 4 % Glanz, gefrostetes Acetat als Nebelschicht, gravierte Messinghaarlinien, Tusche auf dunklem Papier. Kein Glas, kein Kunststoff, keine Spiegelung.

Lichtstimmung: blaue Stunde, 22 Minuten nach Sonnenuntergang. Ein einzelnes Leuchtfeuer an der Küste. Lagerfeuer aus 500 Metern Höhe gesehen – man erkennt keine Flamme mehr, nur einen warmen Punkt, der beweist, dass dort jemand ist. Genau dieser Punkt ist die ganze Marke.

## 13 · Unterseiten

- /karte – DAS INSTRUMENT. Kein Kasten in einem Container: dasselbe Relief, randlos, 100svh, mit dem Peilstreifen darüber und der Landeplatte darunter. Filter als drei Haarlinienschalter statt Knopfleiste, Maßstabsbalken über 1 km unten rechts, ein Koordinatenausleser in Martian Mono folgt dem Zeiger und zeigt In-Game-Koordinaten (die worldToIngame-Rechnung existiert bereits). Marker sind endlich klickbar und führen auf die Profile. Touch wird repariert: Pinch-Zoom und Zweifinger-Verschieben auf der Karte, Einfinger-Wischen scrollt weiterhin die Seite – der heutige touchAction:'none'-Block friert die Seite mobil ein. Der Ausricht-Modus ?align bleibt unverändert als internes Werkzeug erhalten, nur umgefärbt.
- /spieler/<name> – DAS REISEPROFIL. Der Name in --t-700 über dem Relief, darunter drei ehrliche Übersetzungen der echten Felder: Die zurückgelegten Kilometer werden maßstabsgetreu gegen die Inselbreite gezeichnet („87 km – das sind sechsmal quer über die Insel"). Die besuchten Gebiete erscheinen als Anteil am kalibrierten 1-km-Raster (rund 210 Zellen) – ausdrücklich als Anteilsfläche, NICHT als konkrete Positionen, weil die API nur die Anzahl liefert und nichts erfunden wird. Sessions und Login-Tage laufen als Rhythmusstreifen. Die 25 Erfolge stehen als 25 gezeichnete Kartensymbole in einem echten Raster – die einzige Rasterform des ganzen Konzepts, und hier ist sie die richtige Form: 25 gleichrangige Objekte derselben Art, bei denen der Vergleich untereinander der ganze Zweck ist; freigeschaltet in Gold, gesperrt als Kontur mit Fortschrittsbogen. Landeplatte und Teilen-Knopf am Fuß.
- /impressum und /datenschutz – DER KARTENRAND. Eine echte .prose-Komponente ersetzt die 17 bzw. 6 Inline-Styles, die dort heute die gesamte Typohierarchie tragen. Fläche --kuestenband mit Haarlinienrahmung wie ein Kartenrand, Satzbreite max. 68 Zeichen, Fließtext --t-300 auf Stärke 400, Überschriften Archivo 700 auf wdth 100. Statt Kompass eine linke Abschnittsschiene mit den Paragrafen als Wegpunkten. Beide Seiten werden indexierbar (das heutige noindex widerspricht der eigenen SEO-Notiz zu E-E-A-T), und der Pocketpair-Hinweis steht in --t-200 auf --firn – lesbar, nicht versenkt.
- /404 – POSITION UNBEKANNT. Das Relief ohne Höhenlinien, nur Umriss und Nebel. Die Kompassnadel dreht sich langsam und findet keinen Kurs, der Koordinatenausleser zeigt --°--' --". Die Erzählidee der bestehenden 404-Szene bleibt erhalten – das ratlose Wesen wird zu einem kleinen Marker an einem Wegpunkt mit Fragezeichen, der Wegweiser zu einer Peilraute ohne Ziel. Drei echte Ausgänge als Wegpunkte: Startseite, Karte, Discord. Kein Verlaufstext, keine Riesenziffer aus Farbverlauf.
- /admin und /broadcast – WERKZEUGE, KEINE BÜHNE. Dieselben Farb-, Schrift- und Abstands-Tokens, aber ohne Kompass, ohne Atmosphäre, ohne Parallaxe: --motion ist hier hart auf 0 gesetzt. Flächen auf --terrain, Formulare mit dem vollen Fokus-Token, Zahlenfelder in Archivo tabular-nums. Wer nachts eine Wartungsmeldung absetzt, will ein ruhiges Werkzeug, keine Insel.

## 14 · Der Signature-Moment

DIE GLUT. Jedes warme Goldlicht auf der dunklen Insel ist eine echte Gildenbasis aus /api/map – kein Deko-Partikel, kein zufälliger Punkt, sondern ein Ort, an dem jemand tatsächlich gebaut hat. Beim Laden zünden sie einzeln, von innen nach außen, 40 Millisekunden auseinander, jedes mit einem weichen Bloom. Man sieht der Insel beim Bewohntwerden zu.

Das funktioniert auf drei Ebenen gleichzeitig, und deshalb ist es das Detail, das hängen bleibt.

Semantisch: Die gesamte Farbgrammatik der Seite hängt an diesem einen Punkt – kalt ist die Welt, warm sind die Menschen. Ein Besucher muss das nie erklärt bekommen; er versteht in Sekunde zwei, dass Gold „hier wohnt jemand" heißt, weil es nirgendwo sonst vorkommt.

Emotional: Es ist die exakte Übersetzung von „PalHeim" ins Bild. Nicht ein Server mit Slots, sondern eine dunkle Insel, auf der ein paar Lichter brennen – und ein freier Platz daneben. Das ist der Unterschied zwischen „32 Slots verfügbar" und „da will ich hin".

Praktisch: Es ist der einzige Wiederkehrgrund, den man nicht fälschen kann. Baut eine neue Gilde, kommt beim nächsten Besuch ein Licht dazu. Mit dem bereits vorhandenen Besuchszeitstempel aus visits.js steht dann eine Zeile im Kompass: „Seit deinem letzten Besuch sind zwei Lichter dazugekommen." Kein Newsletter, kein Push, keine Gamification-Schleife – nur die Beobachtung, dass die Welt weitergelaufen ist, während man weg war.

Und es ist unkopierbar: Ein anderer Server kann das Layout nachbauen, aber nicht diese Lichter an diesen Koordinaten.

## 15 · Warum das nicht nach KI aussieht

LANDFALL ist einzigartig, weil es das einzige Konzept ist, das die Website aus den Daten baut, die nur dieser Server besitzt – und weil man das sofort sieht.

Die vier Kalibrierungswerte aus der config (xTop 349400, xBottom −1099400, yLeft −724400, yRight 724400) ergeben einen Weltrahmen von 14,488 × 14,488 km. Aus dieser einen Zahl folgt fast alles: der Claim, der Maßstabsbalken, die Scrollstrecke von rund 20,5 km (die Diagonale), die rund 210 Gebiete à 1 km², gegen die die Erfolge „Entdecker" (25) und „Kartograph" (75) gemessen werden. Kein Sprachmodell kann diese Seite erfinden, weil es diese Zahlen nicht kennt. Ein Konkurrent kann sie nicht kopieren, weil seine Welt anders kalibriert ist und seine Basen woanders stehen.

Warum es nicht nach KI aussieht – Punkt für Punkt gegen die Bestandsanalyse:

Kein Hero links, Bild rechts: Der Hero IST das Bild, vollflächig, Text tief an der Küste. Kein Eyebrow-H2-Lead-Grid-Rhythmus: Elf Sektionen, elf verschiedene Geometrien – eine Riesenziffer, eine gezeichnete Profillinie, ein randloses Relief, ein fallendes Senkblei, eine Küstenlinie mit Lücken, zehn gemessene Strecken, drei Höhenmarken, ein Leuchtfeuerschwenk, ein Kartenrand. Kein Kartenraster auf der gesamten Startseite. Keine Status-Pille mit Pulspunkt über der H1, kein Verlaufswort in der Headline, keine nummerierten Verlaufskreise, kein FAQ-Plus, das sich dreht, keine Wolken-Ellipsen aus dem SaaS-Baukasten.

Null Emoji – stattdessen 25 gezeichnete Kartensymbole auf einem Raster mit einer Strichstärke. Kein Lucide-Glyph. Kein umgefärbter Pokéball, sondern eine Rautenpeilung, deren untere Hälfte Land ist – lesbar als Wegpunkt, als Insel am Horizont und, gedreht, als Dach: „Heim".

Und die härteste Regel, die generierte Seiten nie einhalten: Jedes diegetische Element zeigt eine echte Zahl. Kein dekoratives Koordinatengeflimmer, keine erfundene Telemetrie. Hat ein Ausleser keine Datenquelle, existiert er nicht.

## 16 · Conversion-Hebel

- DIE LANDEPLATTE ALS PRIMÄRHANDLUNG. Die Serveradresse mit einem Kopierknopf liegt vollbreit am unteren Hero-Rand – über der Falz, Primärstil, eine Zeile. Damit wird der heutige Fehler behoben, dass die eigentliche Konversion an einem tertiär gestylten Knopf hängt, während der Primärknopf ein Anker auf eine Sektion bei rund 4.500 px ist. Discord steht daneben als Textlink, nicht als zweiter Knopf.
- PEILSTREIFEN-ÜBERGABE STATT WIEDERFINDEN. Beim Verlassen des Hero wandert die Adresse per View Transition sichtbar in den Kopf und bleibt dort auf jeder Scrollposition und auf JEDER Unterseite – auch auf /karte und /spieler/<name>, die heute komplett CTA-frei sind. Der Nutzer muss nie zurückscrollen.
- EIN PRIMÄRER CTA PRO BILDSCHIRM. Heute stehen sechs Discord-Einstiege gegen zwei Kopiermöglichkeiten, und im ersten Viewport konkurrieren zwölf Klickziele. In LANDFALL erscheint die Adresse dreimal (Hero, Kopf, Höhenmarke 60 m), Discord genau zweimal (Leuchtfeuer, Fußzeile). Der Kopf trägt zwei Elemente statt neun Navigationslinks.
- EINWANDBEHANDLUNG VOR DER AUFFORDERUNG. Die Lotung beantwortet „Was kostet das? Wo ist der Haken?" bei 52 % Scrolltiefe – deutlich VOR der Beitrittsanleitung bei 82 %. Preise, Accounts, Downloads, Werbung, Tracking fallen der Reihe nach weg, das Lot läuft bei 0 € auf Grund. Das Argument „kostenlos, kein Account, kein Download" steht heute ausschließlich in FAQ-Antwort 5 bei rund 6.000 px in einem zugeklappten Akkordeon.
- DER NULLZUSTAND ALS EINLADUNG. Bei null Online-Spielern zeigt die Live-Sektion keine nackte Null, sondern Rekord mit Datum, die Prime-Time-Silhouette aus der echten 7-Tage-Kurve und die Verfügbarkeit. Der größte Konversionskiller eines kleinen Servers wird zu einem Terminvorschlag.
- DREI GETRENNTE FEHLERZUSTÄNDE. Heute meldet jeder Netzwerk- oder 500er-Fehler der eigenen Website dem Besucher „Offline – Wartung oder Update", und /api/stats scheitert lautlos in eine leere 280-px-Fläche. LANDFALL trennt: Insel beleuchtet (online), Insel dunkel mit Klartext (Spielserver offline), Insel als Umriss ohne Live-Ebene plus „Live-Daten gerade nicht erreichbar" mit Wiederholen-Knopf (Website-Daten weg). Ein technischer Fehler darf den Server nie für tot erklären.
- DIE GLUT ALS WIEDERKEHRGRUND. Jedes Goldlicht ist eine echte Gildenbasis. Mit dem bereits vorhandenen localStorage-Zeitstempel aus visits.js steht beim zweiten Besuch eine Zeile im Kompass: „Seit deinem letzten Besuch sind zwei Lichter dazugekommen." Ein Grund wiederzukommen, der nichts kostet und nicht gefälscht werden kann.
- GESCHLOSSENE PROFILSCHLEIFE. Bestenlisten-Wegstrecken, Peilliste und Kartenpunkte führen alle auf /spieler/<name>; das Profil trägt dieselbe Landeplatte, einen Teilen-Knopf und die nächste erreichbare Freischaltung aus den 25 Erfolgen als Teaser. Aus dem Betrachter wird ein Bewohner, der seinen eigenen Punkt auf der Insel sucht.

---

# Gegenrede

*Jedes Konzept wurde nach der Ausarbeitung von einer unabhängigen, bewusst
feindseligen Instanz zerlegt — Awwwards-Juror und Frontend-Architekt in
Personalunion. Diese Kritik steht hier ungefiltert, weil ein Konzept, das seine
eigenen Schwächen nicht mitliefert, keine Entscheidungsgrundlage ist.*

## Wo es doch nach KI riecht

Das Konzept behauptet, Antikoerper gegen KI-Optik zu sein, benutzt aber deren Standardrepertoire. Sechs konkrete Stellen:

1. TELEMETRIE-HUD ALS GENRE-PRESET. Martian Mono für Koordinaten, Kartenrand-Ticks, "Peilung Nordost - 3,2 km", Höhenmesser rechts, Funkspruch-Log, Fadenkreuz-Anmutung, Vignette, Kaustik, volumetrischer Dunst: das ist exakt die Wortliste, die jedes Modell auf den Prompt "dark cinematic map hero, sci-fi HUD" ausgibt. Es ist Genre-Kompetenz, nicht Eigenart. Ein Juror hat diese Ebene auf hundert Tarkov-, Star-Citizen- und Anduril-Fanseiten gesehen.

2. SCROLL-TIEFENMESSER IST EIN BEKANNTES GERAET. "Scroll = Sinkflug von 2.000 m auf 0, Distanz zaehlt hoch" ist die Umkehrung des seit Jahren durchgenudelten Ozean-Scrolls (neal.fun Deep Sea und Dutzende Awwwards-Klone). Das Konzept verkauft ein bekanntes Muster als Grundentscheidung.

3. DIE PALETTE IST POETISCH BENANNT, NICHT EIGEN. Fast-Schwarz mit Blaustich (#03060A) + ein Cyan (#3FDCC8) + ein Gold (#E8B65A) ist die Default-Ausgabe auf "dark cyan gold dashboard". Die Bedeutungsgrammatik (kalt = Welt, warm = Mensch) ist der beste Gedanke des ganzen Konzepts, aber die Hexwerte selbst tragen ihn nicht - sie sind austauschbar. Auch "nie reines Schwarz", "2 % Kornkachel", "Vignette" sind heute Standardrezeptur und beweisen Sorgfalt, nicht Handschrift.

4. DIE MILLISEKUNDEN-CHOREOGRAFIE LIEST SICH WIE EIN STORYBOARD-TEMPLATE. 0,00 / 0,25 / 0,55 / 0,90 / 1,30 / 1,50 / 1,90 / 2,20 - das ist Konzeptprosa, die Praezision simuliert. In der Praxis ist eine 2,4-s-Inszenierung vor der ersten möglichen Handlung eine Preloader-Attrappe, und genau daran erkennt man KI-Konzepte: sie choreografieren das Warten.

5. NICHTS DARAN IST PALWORLD. Tausche Gold gegen Giftgruen und die Seite ist ein Rust-Server. Tausche Cyan gegen Bernstein und sie ist ein DayZ-Server. Kein Pal, keine Silhouette, kein einziges Motiv, das dieses Spiel meint - und Palworld ist ein buntes, humorvolles Spiel, kein Militaersimulator. Die Diskrepanz zwischen "Peilung/Lotung/Funkspruch" und dem, was auf dem Server tatsaechlich passiert (Leute fangen Kuschelmonster und bauen Kohlegruben), ist der größte Tonfehler.

6. DAS SPRACHREGISTER IST EIN THESAURUS-GRIFF. "Landfall, Peilung, Lotung, Brandung, Schelf" ist seemaennisch. "Firn, Grat, Terrain, Kontur" ist alpin-geologisch. Beides zusammen ist kein System, sondern eine Wortliste, die nach "gib mir 14 atmosphaerische deutsche Nomen" aussieht. Firn (Altschnee) auf einer tropischen Vulkaninsel ist schlicht falsch.

7. EIGENTOR IN DER BEWEISFUEHRUNG: Das Konzept behauptet "acht render-blockende Google-Fonts-Links" im Bestand. In public/index.html stehen Zeile 32-34: zwei preconnects und genau EIN Stylesheet-Link. Die Zahl ist erfunden - in einem Konzept, dessen Kernregel "keine erfundene Telemetrie" lautet. (Die anderen Bestandszahlen stimmen nachweislich: 33 verschiedene font-size-rem-Werte, null Vorkommen von font-weight: 400.)

## Überschneidung mit den Nachbarkonzepten

Vorbemerkung: LANDFALL IST das Territorium "DIE INSEL" - hier gibt es keine Ueberschneidung zu prüfen, sondern eine Ausführung zu bewerten. Und dabei fällt auf, dass LANDFALL sein eigenes Territorium teilweise verlaesst und in fremdes wandert.

GEGEN DIE EIGENE INSEL-VORGABE: Die Skizze verspricht ORTE (Startstrand, Wald, Schneegebiet, Vulkan, Turm, Gildenbasis) und die Register Entdeckung/Weite/Staunen. LANDFALL ersetzt Orte durch Höhenmarken und Zahlen. Damit verliert es genau das, was das Territorium ausmacht, und wandert in Richtung Vermessung. Das ist die wichtigste Korrektur: LANDFALL muss wieder ein Reiseziel werden, nicht ein Anflug-Instrument.

GEGEN LEITSTAND (gefaehrlichste Ueberschneidung, ca. 45 %): Höhenmesser, Peilung, Funkspruch-Log, Telemetrie-Mono-Ebene, Chartserie in --peilung, Ausfälle als "Lücke in der Kuestenlinie plus Klartext-Label in Minuten", Verfügbarkeit als Höhenprofil - das ist durchgaengig Command-Center-Vokabular. Der behauptete Unterschied ("LANDFALL benutzt Instrumente, um eine Landschaft zu erklären") ist im Text nur eine Behauptung. Konkret muss weg: der Funkspruch-Log komplett, die Ausfall-Chronik, die Verfügbarkeitskurven 24h/7d, die FPS-Serie. LANDFALL darf Uptime in EINEM Satz erwaehnen, mehr nicht.

GEGEN NACHTLAGER (ca. 35 %, emotional die teuerste): Die Goldregel "warm ist ausschließlich, wo Menschen sind" mit Leuchtfeuer, Glut, Bloom-Halos, Basenkernen und Kaffee-für-den-Admin ist wortwoertlich NACHTLAGERs Markenkern (Feuer, Wärme im Dunkeln, Heimkehr). LANDFALL hat das Herzstueck des Nachbarn ausgeliehen und als Farbtoken getarnt. Sekunde-1-Reflex beider Konzepte wäre verwechselbar: dunkle Flaeche, warme Lichtpunkte. Trennung: LANDFALL-Gold muss hart, klein und ruhig sein - ein gesetztes Signal, kein loderndes Licht. Kein Flackern, kein Bloom, keine Glut-Halos. Wärme entsteht durch Bewohntsein, nicht durch Temperatur.

GEGEN WERKBANK (ca. 25 %): Höhenlinien sind Konturlinien sind technische Zeichnung. Beide leben von Haarlinien auf dunklem Grund, Ticks, Maßstaeben, einem einzigen Linienton. Sobald LANDFALL Bemaßungslinien, Maßstabsleisten oder Legenden einsetzt, ist es WERKBANK in Blau. Ausweg: LANDFALL zeichnet keine Linien, es zeigt Flaechen und Licht. Die Kuestenlinie darf die einzige Linie der Seite sein.

GEGEN FELDBUCH (ca. 15 %, geringste): Aber "Kalibrierung, Peilung, Vermessung, Kartenrand-Ticks" beruehrt FELDBUCHs Expeditions- und Chronikregister. Alte Seekarten sind naeher an FELDBUCH als an einem dunklen AAA-Auftritt.

WAS EXKLUSIV BLEIBT und maximal ausgespielt werden muss: die raeumliche Kontinuitaet. Nur LANDFALL kann eine einzige, ununterbrochene Kamerabewegung über eine reale Geografie zeigen, in der echte Menschen an echten Koordinaten stehen. Kein anderes der fünf Konzepte kann "ich sehe gerade jemanden dort druebe" leisten. Alles, was nicht diesem Satz dient, gehört einem der Nachbarn.

## Machbarkeit auf der realen Infrastruktur

HARTE BEFUNDE AUS DEM REPO - das ist der schmerzhafte Teil.

A) ES GIBT KEINE INSEL. Der gesamte Hero setzt "die Landmasse als dunkler Fels mit 100-m-Höhenlinien" voraus. Tatsaechlich:
- /home/user/palworld-server/public/assets/ enthaelt nur hero.webp, hero-alt.webp, og-image.jpg, favicon.svg, hero-scene.svg, 404-scene.svg. Kein Kartenbild.
- /home/user/palworld-server/.gitignore listet public/assets/map.jpg|webp|png explizit als "server-privat". Der README (Abschnitt "Echte Palworld-Karte als Hintergrund") nennt als Quellen: Community-/Wiki-Kartenexport oder "aus den Spieldaten extrahiert (Kartentextur aus DT_WorldMapUIData)" - und schreibt ausdruecklich "Nur für dich privat auf dem Server - nicht ins Repo committen". Das ist Pocketpair-IP. Heute liegt sie auf einer Unterseite; vollflaechig auf der Startseite eines inoffiziellen Servers ist das eine voellig andere Rechtslage.
- Standardzustand laut README ist "ein neutrales km-Raster", nicht eine Insel.
- ES GIBT NIRGENDS HOEHENDATEN. /api/map liefert pro Spieler nur name, level, x, y (server.js Z. 737-744). Kein z, keine Topografie, keine Kachelhoehen. 100-m-Höhenlinien lassen sich aus keiner Datenquelle ableiten - sie müssten von Hand gezeichnet, also erfunden werden. Damit verletzt das Konzept seine eigene Kernregel ("Wenn ein Wert keine Datenquelle hat, existiert er nicht") ausgerechnet am sichtbarsten Element der ganzen Seite. Das ist der Todesstoss für die Antikoerper-Behauptung.

B) DIE GOLDLICHTER KOENNEN LAUTLOS VERSCHWINDEN. Basen kommen nicht aus der Palworld-API, sondern aus data/bases.json, gefuettert per POST /api/map/bases von tools/upload-bases.py, das auf dem Gameserver die Level.sav parst (server.js Z. 707-722, 1089-1121). data/ ist gitignored und existiert in diesem Checkout nicht. Faellt der Cron aus oder aendert ein Palworld-Update das Save-Format, bleibt basesData = { bases: [], updatedAt: null }. Auf der heutigen Unterseite ist das ein Schönheitsfehler. Im LANDFALL-Hero ist es der Totalausfall der Kernaussage "hier wohnt jemand".

C) NULLLAST IST DER NORMALFALL, NICHT DIE AUSNAHME. 32 Slots, privater PvE-Server, DE/AT/CH. Vormittags, nachts, werktags: null bis zwei Spieler online. Dann gibt es keine Cyanpunkte, keine Spuren, keinen "die Lichter sind echt"-Moment. Schlimmer: Das Konzept vergibt --t-900 (bis 272 px) genau zweimal - Live-Spielerzahl und die 0 der Lotung. Bei leerem Server steht zweimal eine riesige 0 auf derselben Seite. Die erste sagt "hier ist niemand", die zweite "es kostet nichts". Dieser Zufallszusammenfall wird im Konzept nicht einmal erwaehnt.

D) DIE LADECHOREOGRAFIE WIDERSPRICHT SICH ARITHMETISCH. public/js/map.js kommentiert im Kopf, dass "100+ Basen die Karte schnell unuebersichtlich machen" - deshalb existieren dort Filter mit localStorage. Der Hero soll "eines pro echter Gildenbasis, 40 ms Abstand" zünden. Bei 100 Basen sind das 4,0 s allein für Gold, während die Gesamtchoreografie 2,4 s behauptet und die Headline schon bei 1,50 s startet. Entweder die Staffelung wird gekappt - dann ist "eines pro echter Basis" nicht mehr wahr - oder das Timing ist Fiktion. Dazu die Renderlast: 100+ Gold-Blooms plus Spieler-Halos plus Kaustik plus drei gestapelte Nebelebenen plus Kornkachel sind auf einem Mittelklasse-Android ein Compositing-Kollaps. Der Bestand hat das erkannt und im CSS bereits .map-player__halo unter prefers-reduced-motion abgeschaltet (style.css Z. 932-934).

E) ZWEI CONFIG-SCHALTER KOENNEN DIE STARTSEITE ENTKERNEN. server.js Z. 1650: /api/map antwortet { enabled: false }, sobald map.enabled ODER showPlayerList false ist. Ein einziger Datenschutz-Toggle des Admins macht die Seite inhaltslos. Es braucht eine gestaltete, vollwertige Seitenvariante ohne Live-Ebene - keine Fehlermeldung.

F) DATENSCHUTZ-ESKALATION. Live-Spielernamen plus Positionen wandern von /karte auf die Startseite, damit in OG-Bilder, Suchmaschinen-Snapshots und jeden geteilten Link. Namen sind Pseudonyme, Aufenthaltsmuster über Zeit sind es weniger. Fuer einen Ein-Mann-Server ist das ein Betreiberrisiko, kein Designdetail.

G) DIE KOPFZAHLEN SIND RECHNERISCH RICHTIG UND SACHLICH FALSCH. 349400 minus (-1099400) = 1448800 Unreal-Einheiten = 14,488 km, Diagonale mal Wurzel 2 = 20,49 km. Rechnung korrekt. Aber: Das sind die Weltkoordinaten der BILDRAENDER aus config.json, nicht die Ausdehnung der Insel - drumherum ist Ozean. Und der README sagt zur Standardkalibrierung ausdruecklich "alle Inseln", es ist ein Archipel (Palpagos), keine Insel. Der Claim "Vierzehneinhalb Kilometer Insel" ist damit doppelt schief. Ausserdem ist die Kalibrierung admin-konfigurierbar - der README beschreibt den ?align-Workflow zum Neujustieren. Sobald der Admin einmal justiert, wird eine hartkodierte Headline stillschweigend falsch.

WAS REALISTISCH IST (fairerweise):
- Selbstgehostete woff2-Variable-Fonts: sofort machbar, klarer Gewinn, löst zugleich den im eigenen Datenschutztext eingeraeumten Google-Fonts-Punkt. ~93 KB Budget ist ehrlich gerechnet.
- Typo-Skala mit neun Stufen, 4px-Spacing-System, Token-Umbau: reines CSS, sehr gut wartbar, die beste Einzelinvestition des Konzepts. Der Bestand hat 33 font-size-Werte und nur 7 clamp()-Aufrufe - hier liegt echter Gewinn.
- Kontrastwerte: plausibel. Aber die Formulierung "auch als Fliesstext AAA-tauglich" gilt nur für --firn, --peilung, --feuer. --peilung-tief 6,8:1, --glut 6,6:1 und --brandung 6,1:1 sind AA-Großtext. Das gehört praeziser gesagt, sonst wird im Bau falsch angewendet.
- Scrollytelling ohne GSAP: mit IntersectionObserver plus CSS scroll-driven animations machbar. Aber 100svh plus scroll-gekoppelte Werte auf iOS Safari mit einfahrender Adressleiste ist notorisch zickig, und der mitlaufende Höhenmesser braucht rAF-gedrosselte Scroll-Reads. Auf schwachen Geraeten Jank.
- Wartbarkeit durch EINEN Admin ist das eigentliche Risiko: public/js/map.js hat bereits 492 Zeilen mit Zoom, Pan, Align-Modus, Filter-Persistenz. Der Hero braucht einen zweiten, andersartigen Renderer. Dann existieren zwei Kartenimplementierungen, die bei jeder Kalibrierungsaenderung synchron bleiben müssen. Das ist die Falle, an der das Konzept in sechs Monaten stirbt.

PRAESENTATIONS-FANTASIE, klar benannt: 100-m-Höhenlinien (keine Datenquelle), driftender Kaustik-Schimmer auf Vollflaeche (GPU-Dauerlast für null Information), wandernde Wolkenschatten als sechste Ebene, verblassende Spuren hinter Spielern (die API liefert alle 30 s einen Punkt - eine "Spur" wäre interpoliert, also erfunden), das exakte 2,4-s-Timing, und die Vorstellung, dass ein Datenvolumen-Budget diese sechs Ebenen plus Kuestenlinien-SVG plus Kornkachel unter dem heutigen 140-KB-Hero hält.

FEHLT KOMPLETT IM KONZEPT: Tastaturbedienung (eine Karte als Hauptnavigation ist per Tastatur nur bedienbar, wenn Spielerpunkte und Basen echte fokussierbare Elemente mit Namen sind - sonst ist der Kerninhalt für Screenreader eine leere Flaeche), und prefers-reduced-motion wird mit keinem Wort erwaehnt, obwohl der Bestand das bereits an zwei Stellen ordentlich behandelt.

## Wirkung auf die Conversion

HILFT:
- Die Landeplatte am unteren Rand, volle Breite, eine Zeile, Adresse plus "Adresse kopieren" ist die richtige Entscheidung und besser als heute. Die Clipboard-Logik existiert bereits mehrfach in public/js/main.js (Z. 213, 262, 273) und ist wiederverwendbar.
- Die Live-Zahl als Beweis schlaegt jedes Versprechen. "Da ist gerade jemand unterwegs" ist genau das Argument, das einen leeren Serverlisten-Eintrag nicht liefern kann.
- Peilung und Distanz eines echten Spielers ("Nordost - 3,2 km vom Zentrum") ist aus x/y trivial berechenbar und erzeugt echte Neugier.

SCHADET:
- DER HAUPTKNOPF ERSCHEINT ALS LETZTES. Die Landeplatte kommt laut Choreografie bei 1,90 s, nach Höhenlinien, Nebel, Goldlichtern, Cyanpunkten und Headline. Mit Mobilfunk, Font-Laden und /api/map-Roundtrip real eher 4-6 s. Das Conversion-Ziel ist 2 Sekunden lang die einzige Sache, die nicht da ist. Das ist die schwerste Fehlpriorisierung des Konzepts.
- DISCORD KOMMT IM HERO NICHT VOR. Discord ist Conversion-Ziel Nummer zwei und die eigentliche Lebensader eines Community-Servers. Im Konzept taucht es nur als Goldpunkt "wo Menschen sind" irgendwo unten auf. Es gehört neben den Kopier-Knopf.
- "KOSTENLOS" STEHT AM ENDE VON 20,5 KM SCROLLSTRECKE. Die Lotung ("die Suche nach dem Haken, die bei 0 EUR auf Grund läuft") ist ein starkes Bild, aber sie kommt laut Zielwirkung erst in Sekunde 30 und "falls er weit genug gescrollt hat". Der wichtigste Vertrauenssatz eines kostenlosen Servers gehört in Sekunde 1. Wer aus einer Serverliste kommt, rechnet mit einem Haken und geht weg, bevor er ihn nicht findet.
- WIEDERKEHRER WERDEN BESTRAFT. Das Projekt nennt "wiederkommen (Live-Karte, Statistiken, Profil)" als Ziel drei. Ein Stammspieler, der nur seinen Spielstand auf /spieler/<name> sehen will, wird durch einen Sinkflug geschickt. Raeumliche Navigation ist gut für den ersten Besuch und schlecht für den zwanzigsten.
- SEO- UND TEXTSUBSTANZVERLUST. Das Projekt nimmt Auffindbarkeit ernst (public/llms.txt, sitemap.xml, canonical-Tags). Wenn Regeln, Raten und FAQ in Kartenebenen und Höhenprofile aufgehen, verliert die Startseite genau den Text, über den Leute sie finden. Der Fliesstext muss echtes, lesbares HTML bleiben.
- INSZENIERUNG VS. EINDEUTIGKEIT: Die Zielwirkung sagt "Sekunde 1: Das ist keine Website, das ist ein Ort" - aber ein Besucher, der über palserver.de kommt, hat genau eine Frage: Wie lautet die Adresse. Fuer diesen Pfad ist LANDFALL das langsamste der fünf Konzepte. Von den drei Serverfakten, die eine Beitrittsentscheidung tragen (kostenlos, PvE ohne PvP, keine Wipes), steht keiner im Hero.

NETTO: Das Konzept optimiert brillant auf Staunen und schlecht auf Handlung. Die Reparatur ist billig - CTA nach vorn, kostenlos in den Hero, Discord daneben - und kostet die Inszenierung nichts, weil die Kamerafahrt danach beliebig lange schön sein darf.

## Schwächen

- Die Hero-Grundlage existiert nicht: kein Kartenbild im Repo (gitignored, laut README aus Wiki-Export oder extrahierter Spieltextur, also Pocketpair-IP), und vor allem keinerlei Höhendaten - /api/map liefert nur name, level, x, y. Die 100-m-Höhenlinien sind erfunden und verletzen damit die eigene Kernregel des Konzepts an der sichtbarsten Stelle.
- Nulllast ist der Regelfall, nicht der Ausnahmefall: bei 0 Spielern online bricht der gesamte Sekunde-5-Moment weg, und --t-900 zeigt zweimal eine 272px große 0 (Live-Spielerzahl und Preis-0) - ein Zusammenfall, den das Konzept nicht adressiert.
- Die Goldlichter hängen an einem externen Python-Cron (tools/upload-bases.py, Level.sav-Parsing, POST /api/map/bases). Faellt er nach einem Palworld-Update aus, ist bases[] leer und die Kernaussage 'hier wohnt jemand' verschwindet lautlos.
- Die Ladechoreografie rechnet sich nicht: 100+ Basen mal 40 ms Staffelung = 4,0 s, bei behaupteten 2,4 s Gesamtdauer und Headline-Start bei 1,50 s. map.js warnt im Kopfkommentar selbst vor '100+ Basen'.
- Der primaere CTA (Landeplatte mit Adresse) erscheint als letztes Element bei 1,90 s, real mit Mobilfunk eher 4-6 s. Discord fehlt im Hero komplett, 'kostenlos' erst nach der halben Scrollstrecke.
- Starke Ueberschneidung mit LEITSTAND (Höhenmesser, Peilung, Funkspruch-Log, Ausfallchronik, Verfügbarkeitskurven) und mit NACHTLAGER (Glut, Bloom, Leuchtfeuer, Wärme-gleich-Mensch). Beide Anleihen sind emotional teurer als sie aussehen.
- Zwei Config-Schalter (map.enabled, showPlayerList) können die Startseite entkernen - /api/map antwortet dann { enabled: false }. Es gibt keinen entworfenen Zustand dafuer.
- Kein Wort zu Tastaturbedienung, Screenreadern oder prefers-reduced-motion, obwohl der Bestand das bereits an zwei Stellen sauber löst. Eine Karte als Hauptnavigation ist ohne fokussierbare, benannte Punkte für einen Teil der Nutzer schlicht leer.
- Nichts an der Bildsprache ist palworldspezifisch. Der Ton (Peilung, Lotung, Funkspruch, Militaer-HUD) steht quer zu einem bunten, humorvollen Spiel über Kuschelmonster - und macht die Seite gegen jeden Rust-/DayZ-/Ark-Server austauschbar.
- Wartungsfalle: der Hero braucht einen zweiten Renderer neben den 492 Zeilen in public/js/map.js. Zwei Kartenimplementierungen, die bei jeder Neukalibrierung synchron bleiben müssen, bei einem Admin ohne Framework.
- Sachfehler in der Copy: 14,488 km ist die Kantenlaenge des kalibrierten Bildrahmens, nicht der Insel - und laut README umfasst der Rahmen 'alle Inseln' (Archipel). Die Zahl ist zudem in config.json aenderbar, während sie im Claim hartkodiert stuende.
- Faktenfehler in der eigenen Beweisfuehrung: 'acht render-blockende Google-Fonts-Links' - tatsaechlich sind es in index.html Z. 32-34 zwei preconnects und ein Stylesheet-Link. In einem Konzept mit der Regel 'keine erfundene Telemetrie' ist das ein Eigentor.
- Kontrast-Behauptung ungenau: 'auch als Fliesstext AAA-tauglich' gilt nur für --firn/--peilung/--feuer. --peilung-tief (6,8:1), --glut (6,6:1) und --brandung (6,1:1) sind AA-Großtext - so formuliert wird das im Bau falsch angewendet.
- Datenschutz-Eskalation ohne Diskussion: Live-Spielernamen und -positionen wandern von der Unterseite /karte auf die Startseite, in OG-Bilder und Suchmaschinen-Snapshots.
- Das Sprachregister mischt seemaennisch (Landfall, Peilung, Lotung, Brandung, Schelf) mit alpin-geologisch (Firn, Grat, Kontur). Firn auf einer tropischen Vulkaninsel ist nicht atmosphaerisch, sondern falsch.
- Verblassende Spuren hinter Spielern sind interpolierte Fiktion - die API liefert alle 30 s (cacheSeconds 15) genau einen Punkt pro Spieler, keine Bewegungshistorie.

## Schärfungen — verbindlich für die Umsetzung

1. Höhenlinien ersatzlos streichen und durch etwas ersetzen, das eine echte Quelle hat: Isolinien der Aufenthaltsdichte aus den gesammelten Positionsdaten der letzten 7 Tage ('wo war zuletzt jemand'). Das ist echte, exklusive PalHeim-Topografie statt erfundener Geologie - und stellt die Kernregel des Konzepts wieder her. Die Kuestenlinie selbst als EIN stilisiertes, eingechecktes SVG-Asset anlegen (bewusst vereinfacht, nicht abgepaust), damit der Hero nicht am gitignorierten, IP-belasteten map.webp hängt.
2. Ladechoreografie umkehren: Landeplatte mit Adresse, Kopier-Knopf, Discord-Knopf und dem Wort 'kostenlos' stehen im ERSTEN gerenderten Frame, statisch, ohne Animation, ohne Wartezeit auf /api/map. Die Kamerafahrt und das Zünden der Lichter laufen danach und dürfen dann beliebig lange schön sein. Ziel: klickbarer CTA unter 0,8 s statt 1,90 s.
3. Den Nullzustand als HAUPTZUSTAND entwerfen, nicht als Fallback. Bei 0 Spielern online: keine riesige 0, sondern 'Zuletzt jemand unterwegs: vor 14 Minuten' plus die Basenlichter plus die Tagesspitze. Und --t-900 nur EINMAL auf der Seite vergeben, sonst kollidieren Live-Zahl 0 und Preis-0 zu einer unfreiwilligen Aussage.
4. Das gesamte LEITSTAND-Vokabular abgeben: Funkspruch-Log, Ausfallchronik, Verfügbarkeitskurven 24h/7d und die FPS-Serie verlassen LANDFALL. Uptime wird EIN Satz an der Landeplatte. Was bleibt, ist die einzige Frage, die LANDFALL exklusiv beantworten kann: Wo ist dieser Ort, wer ist gerade dort, wie komme ich hin.
5. Gold gegen NACHTLAGER abgrenzen: kein Bloom, keine Glut-Halos, kein Flackern, kein Leuchtfeuer-Strahl. Gold wird zu einem harten, kleinen, ruhigen Signal - ein gesetzter Punkt mit scharfer Kante. Wärme entsteht bei LANDFALL durch Bewohntsein und durch die Namen daneben, nicht durch Temperatur und Leuchten. Damit ist der Sekunde-1-Reflex der beiden Konzepte klar unterscheidbar.
6. Alle Weltmasse serverseitig aus config.map.calibration rechnen und ins HTML rendern statt sie in die Headline zu tippen - dann bleibt die Seite nach jedem ?align-Neujustieren wahr. Gleichzeitig den Claim korrigieren: es ist ein Archipel im 14,488-km-Rahmen, nicht eine 14,5 km breite Insel. Beispielrichtung: 'Ein Archipel, 32 Plätze - einer davon ist frei.'
7. Genau EINEN Kartenrenderer bauen, den der Hero und /karte teilen (Modus 'kino' vs. 'interaktiv', gemeinsame Projektionsfunktion aus map.js). Dazu drei gestaltete Zustände definieren, nicht drei Fehlermeldungen: Server offline, showPlayerList/map.enabled aus, Basen-Upload veraltet (basesUpdatedAt aelter als 24 h sichtbar machen statt Lichter zu unterschlagen).
8. Tastatur- und Screenreader-Pfad ausformulieren und prefers-reduced-motion als eigene Fassung bauen, nicht als Abschaltung: jeder Spielerpunkt und jede Basis ist ein fokussierbares Element mit Name und Peilung; parallel existiert eine textliche Liste 'wer ist gerade wo' als semantisches Aequivalent. Die ruhende Fassung zeigt dieselben Informationen als feste Bilder mit Sprungmarken statt Sinkflug - und wird zugleich die Fassung für schwache Geraete, womit das Mobile-Performanceproblem mitgeloest ist.

## Urteil

LANDFALL ist von den fünf Konzepten das intellektuell disziplinierteste und zugleich das am wenigsten gedeckte. Die Grundentscheidung ist richtig und mutig - die Live-Karte ist tatsaechlich das größte ungenutzte Asset des Projekts, und die Palette mit Bedeutungsgrammatik (kalt gleich Welt, warm gleich Mensch) ist der einzige Farbgedanke unter allen fünf Konzepten, der eine Botschaft transportiert statt einer Stimmung. Die Typo-Arbeit ist ernsthaft, nachgerechnet und in weiten Teilen sofort umsetzbar. Aber das Konzept stellt eine Regel auf, die es selbst nicht einhaelt: Es fordert, dass jedes gestalterische Element an eine echte Zahl gebunden ist, und baut dann seinen Hero auf 100-m-Höhenlinien, für die es in diesem System keine einzige Datenquelle gibt, auf ein Kartenbild, das bewusst nicht Teil des Projekts ist, auf Bewegungsspuren, die es interpolieren müsste, und auf eine Ladechoreografie, deren Arithmetik bei 100 Basen um 60 Prozent danebenliegt. Dazu kommt der Tonfehler: Peilung, Lotung und Funkspruch sind das Vokabular eines Militaersimulators, nicht eines bunten Spiels über Kuschelmonster - und genau diese Genre-Kompetenz ohne Spezifik ist das verlaesslichste Erkennungszeichen einer maschinell erzeugten Konzeptidee. Der richtige Auftraggeber-Typ wäre ein Server mit dauerhaft sichtbarem Leben auf der Karte (20 bis 30 gleichzeitige Spieler, stabile Basenversorgung, mehrere Betreuer) und einer Zielgruppe, die eine Welt entdecken statt einer Adresse beitreten will. PalHeim ist beides nicht: 32 Slots, ein Admin, ein externes Python-Skript als einzige Basenquelle, und ein Conversion-Ziel, das in drei Sekunden erledigt sein sollte. In dieser Konstellation ist LANDFALL bau- und tragbar, aber nur in der reduzierten Form: Kuestenlinie und Menschen ja, Topografie und Telemetrie nein, CTA im ersten Frame statt nach 1,9 Sekunden, und alles Instrumentenhafte an LEITSTAND abgetreten. Wählt man es unveraendert, entsteht die schönste der fünf Seiten - die an einem beliebigen Dienstagvormittag mit null Spielern und einem ausgefallenen Basen-Cron eine leere schwarze Flaeche mit einer sehr großen Null zeigt.

---

## Eigene Risikoeinschätzung

- PERFORMANCE – der ehrlichste Einwand. Heute wiegt der kritische Pfad gzip-simuliert rund 8,0 KB HTML, 9,6 KB CSS, 12,4 KB JS. LANDFALL fügt ein Reliefbild, sechs Parallaxebenen, eine Canvas-Schleife und SVG-Bloom hinzu – realistisch Faktor 30 bis 40 in der Seitenlast. Gegenmaßnahmen sind Pflicht, nicht optional: Relief als AVIF in vier Größen (mobil ≤ 90 KB, Desktop ≤ 220 KB), Canvas hart auf 30 fps und per IntersectionObserver pausiert, EIN gemeinsamer SVG-Blur-Filter statt einer pro Basis, harte Budgets (LCP ≤ 2,0 s auf Mittelklasse-Android über 4G, gesamt ≤ 380 KB mobil / ≤ 900 KB Desktop). Wird ein Budget gerissen, fliegt eine Ebene raus – nicht das Budget.
- DIE ZERO-DEPENDENCY-FRAGE. Scroll-gebundene CSS-Animationen (animation-timeline) haben keine flächendeckende Unterstützung. Der bequeme Weg ist GSAP mit ScrollTrigger – rund 40 KB gzip Fremdcode in einem Repo, dessen package.json bewusst keinen dependencies-Block hat und dessen Deploy git pull plus systemctl restart ist. Das ist ein echter Identitätsverlust. Die Alternative ist eine handgeschriebene Scroll-Engine von etwa 6 KB (ein rAF-Loop, der zwei Custom Properties schreibt, plus IntersectionObserver) – mehr Eigenarbeit, aber im Charakter des Projekts. Diese Entscheidung muss vor Baubeginn fallen, nicht währenddessen.
- BARRIEREFREIHEIT DER NAVIGATION. Wenn die gesamte Navigation ein Kompass ist und JavaScript ausfällt oder ein Screenreader läuft, darf die Seite nicht unbedienbar werden. Der Kompass muss zwingend eine progressive Verbesserung über einem echten <nav> mit Ankerlinks sein; jeder Wegpunkt ist zuerst ein <a href="#ort">, dann erst eine Raute. Wird das nicht diszipliniert gebaut, ist das Konzept eine Zugangsbarriere.
- ZWÖLF ANIMATIONEN HEISST ZWÖLF RUHIGE VARIANTEN. Die Gefahr ist Drift: In sechs Monaten haben acht davon eine reduced-motion-Regel und vier nicht. Gegenmaßnahme: ein einziger Token --motion (1 oder 0), aus dem alle Dauern abgeleitet werden, plus eine zentrale @media-Regel, die ihn kippt. Die Ruhe ist dann ein Schalter, nicht zwölf Einzelpflegefälle. Die bestehende, vollständige prefers-reduced-motion-Abdeckung darf dabei nur wachsen, nie schrumpfen.
- BANDING AUF DUNKEL. Große weiche Verläufe auf Nahschwarz brechen auf 6-Bit-Panels sichtbar in Streifen – ein realer, häufig unterschätzter Fehler dunkler Redesigns. Ohne die 2-%-Kornebene sieht der Hero auf einem durchschnittlichen Notebook billig aus. Die Kornkachel ist deshalb kein Stilmittel, sondern eine technische Notwendigkeit und darf nicht wegoptimiert werden.
- KITSCH-GEFAHR: DASHBOARD-COSPLAY. Höhenlinien, Kompass, Koordinaten und Peilungen kippen sehr schnell in „sieht aus wie ein Cockpit, bedeutet aber nichts". Die einzige wirksame Regel ist unbequem: Jedes diegetische Element zeigt eine echte Zahl aus einer echten Quelle. Kein Zierkoordinatensystem, keine erfundene Telemetrie, kein Fake-Radar. Wer diese Regel einmal bricht, hat die Glaubwürdigkeit der gesamten Seite verkauft.
- KOPPLUNG ARTWORK ↔ KALIBRIERUNG. Das Relief ist an genau vier Werte aus der config gebunden. Ändert jemand map.calibration, stimmt das Bild nicht mehr mit den Live-Punkten überein – und niemand merkt es sofort. Gegenmaßnahme: die Kopplung dokumentieren, das Relief aus denselben vier Werten ableiten und im Ausricht-Modus ?align eine Abweichungsanzeige ergänzen.
- DER DUNKLE-INSEL-BUMERANG. Das Konzept lebt davon, dass Lichter brennen. Bei null Spielern über eine Woche ist die Insel dunkel – und die Seite erzählt dann das Gegenteil ihrer Botschaft. Der Nullzustand muss mit derselben Sorgfalt gestaltet werden wie der Vollzustand: Basen leuchten weiter (sie stehen ja), die Rekordzahl mit Datum tritt an die Stelle der Live-Zahl, die Prime-Time-Silhouette gibt einen Termin. Sonst arbeitet das Konzept gegen sich selbst.
- REDAKTIONELLES RISIKO BEIM LEUCHTFEUER. Die Autorschaft-Sektion braucht eine echte Person, einen echten Satz und deren Einverständnis. Ohne das kippt sie in genau den generischen Community-Ton zurück, den das Redesign eigentlich abschaffen soll – und wäre dann die schwächste Stelle an der emotional stärksten Position.
- WARTUNGSKOSTEN DER DUPLIKATE. Nav und Fußzeile stehen heute achtmal im Repo, der Mobil-Toggle dreimal. Jede Designiteration kostet acht Dateiänderungen. Vor dem ersten Pixel braucht es genau EINEN Mechanismus dafür – ein rund 30-zeiliger Include-Schritt in serveStatic reicht und bleibt abhängigkeitsfrei. Ohne ihn stirbt das Konzept nicht am Design, sondern an der Pflege.
