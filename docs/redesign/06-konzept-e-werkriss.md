# Konzept E — WERKRISS

> ### „Gebaut, nicht gemietet — hier ist der komplette Bauplan."

*Welt, Basis und Maschine als eine einzige Konstruktionszeichnung.*

| | |
|---|---|
| **Register** | Ingenieurskunst · Bauen · Erklärung |
| **Signature-Moment** | DIE SCHNITTFAHRT. Auf Blatt 02 wird ein isometrischer Körper — die zusammengebaute Baugruppe aus Welt, Basis und Maschine — im Viewport festgehalten, und der Scroll treibt eine Schnittebene durch ihn hindurch. Am linken und rechten Blattrand steht das echte Schnittverlaufssymbol A–A mit seinen Blickrichtungspfeilen. Wo die Ebene durch ist, hört der Körper auf, geschlossen zu sein: Die Schnittfläche füllt sich mit 45°-Schraffur, eine 2-px-Cyan-Schnittkante mit weißer Lichtkante läuft exakt auf der Ebene mit, und dahinter werden die inneren Baugruppen sichtbar — jede mit ihrer Positionsnummer, jede Beschriftung erscheint genau in dem Moment, in dem die Ebene ihr Bauteil erreicht. |
| **Sektionen** | 13 |

---

## 1 · Designphilosophie

Ein „Werkriss" ist in der deutschen Bauhütte die maßstäbliche Konstruktionszeichnung, aus der das Bauwerk tatsächlich entsteht — nicht die Werbeansicht, sondern der Riss, nach dem gearbeitet wird. Genau das ist PalHeim: kein Produkt, sondern ein gebautes Ding, das jemand aufgestellt hat und in Betrieb hält.

Daraus folgt die einzige Designentscheidung, aus der alles andere abgeleitet ist: Die Website behauptet nichts, sie zeichnet. Palworld ist ein Bau- und Crafting-Spiel — der Server, der es trägt, wird im gleichen Zeichenstil erklärt wie die Welt darauf. Weltkörper, Basis und die reale Maschine in Deutschland sind drei Baugruppen einer einzigen Explosionszeichnung. Damit wird „eigene Hardware" nicht mehr behauptet, sondern bemaßt.

Der zweite Grundsatz: Eine technische Zeichnung verkauft nicht, sie legt offen. Das ist die formale Antwort auf die eigentliche Frage jedes Besuchers — „kostenlos, wo ist der Haken?". Ein Werkriss hat keinen Haken, er hat eine Stückliste. Deshalb bekommt sogar die Kostenfrage ein eigenes Blatt mit Positionen, Trägern und einer Maßkette, die auf 0,00 € endet.

Der dritte Grundsatz ist Disziplin. Alles gehorcht denselben Regeln wie eine echte Zeichnung: eine Projektionsachse (Isometrie 30°/150°/90°), fünf Linienarten nach ISO 128, Bemaßung nach DIN 406, ein Schriftfeld nach DIN 6771. Wo andere Seiten Effekte stapeln, stapelt WERKRISS Konventionen. Präzision ist hier keine Anmutung, sondern eine überprüfbare Behauptung — und das ist der Grund, warum die Seite nicht generiert aussehen kann.

## 2 · Zielwirkung

SEKUNDE 1 — „Das ist keine Website, das ist ein Plan." Der Bildschirm ist fast schwarz, ein Raster liegt darunter, eine Linie zieht sich selbst durch das Bild und schließt einen Rahmen. Kein Foto, kein Verlauf, kein Badge. Reflex: hinsehen statt wegscrollen, weil das Format ungewohnt ist und nach Autorschaft riecht. Gefühl: Ernst, Handwerk, jemand weiß hier, was er tut.

SEKUNDE 5 — „Die zeigen mir die Maschine." Der Körper ist auseinandergefahren: oben die Welt, in der Mitte eine Basis, unten der reale Rechner im Schnitt, mit Grundplatte „STANDORT: DEUTSCHLAND". Die Zeichnung bemaßt sich selbst, Gold zieht durch. Gedanke: Das ist ein privater Server, betrieben von einer Person, und die versteckt nichts. Gleichzeitig ist die Adresse schon sichtbar — als Pos. 1, das am stärksten bemaßte Bauteil im Bild. Handlungsimpuls: kopieren, bevor überhaupt gescrollt wurde.

SEKUNDE 30 — „Ich will wissen, wie das weitergeht." Der Nutzer hat gescrollt, die Schnittebene ist durch den Körper gefahren, die Struktur hat sich geöffnet, er hat 17/32 als Maßkette über die ganze Blattbreite gelesen und die Stückliste mit 3× EP, 2× Fangrate, 4 Basen überflogen. Gefühl: Kompetenz und Ruhe — hier läuft etwas seit Längerem stabil, und ich verstehe zum ersten Mal wirklich, was ich betrete. Absicht: beitreten, und danach wiederkommen, um den Änderungsindex und das eigene Datenblatt zu prüfen. Kein Verkaufsdruck an keiner Stelle — die Überzeugung entsteht durch Offenlegung.

## 3 · Farbwelt

Die Palette ist kein Anstrich, sondern ein Regelwerk mit drei Gesetzen. ERSTENS: Cyan ist eine LINIENFARBE, keine Flächenfarbe. Es wird nie flächig gefüllt, sondern nur als Strich gesetzt — dadurch entsteht das Werkzeugkasten-Gefühl eines CAD-Bildschirms statt der Neon-Optik, in die dunkle Gaming-Seiten regelmäßig kippen. Der einzige Fall, in dem Cyan Fläche wird, ist die 45°-Schraffur einer Schnittfläche, und dort bei 24 % Deckkraft. ZWEITENS: Gold gehört ausschließlich der Bemaßung, der Annotation und der Legende — nie einem Bauteil selbst. Damit bekommt die Seite eine zweite, semantisch getrennte Ebene: Der Körper ist cyan, die Aussage über den Körper ist gold. Diese Trennung ersetzt jede Icon-Farbwillkür und macht Hierarchie ohne Größenänderung möglich. DRITTENS: Es gibt genau ein Weiß (#FFFFFF), reserviert für die Lichtkante — 1-px-Highlights auf den obersten Schnittkanten, maximal drei pro Bildschirm. Weiß ist damit das knappste Gut der Seite und lenkt den Blick zuverlässig. Die Kontraste sind, wie im Bestand vorbildlich begonnen (--accent-text, --chart-series), gerechnet und dokumentiert statt geschätzt: Alle Textfarben liegen über 8:1, alle Grafiklinien über 3:1. Kritisch bleibt --riss-tief mit 3,30:1 — es ist im Token-Kommentar hart als 'nur Linie, nie Text, nie unter 1,25 px' markiert. Umgekehrt löst die dunkle Welt zwei gemessene Altlasten von selbst: das durchgefallene --blue #2f9de4 (2,97:1) und der Verlaufstext auf hellem Himmel (2,27:1) existieren nicht mehr.

| Token | Hex | Rolle |
|---|---|---|
| `--graphit-900` | `#0B0E11` | Blattgrund, tiefste Ebene; kühl abgestimmtes Schwarz (Blaustich), nie reines #000 — sonst kippt die Tiefe |
| `--graphit-800` | `#12171C` | Zeichenfläche / Blatt; hebt sich um genau 2 % Leuchtdichte ab, sichtbar nur an der Kante |
| `--graphit-700` | `#1A2128` | Schnittfläche unbeleuchtet, Tabellenkopf, Schriftfeldfelder |
| `--graphit-600` | `#2A343D` | 8-mm-Konstruktionsraster, Tabellentrennlinien |
| `--graphit-500` | `#3C4854` | Haarlinie, Blattkante, Trennlinie zwischen Blättern |
| `--riss-cyan` | `#58D9E6` | Hauptlinie (Vollinie breit), Schnittkante, sichtbare Körperkante — gemessen 11,53:1 auf --graphit-900, damit auch als Text zulässig |
| `--riss-tief` | `#1E6E7C` | Nebenlinie, verdeckte Kante (Strichlinie), Schraffurgrund — gemessen 3,30:1, erfüllt die 3:1-Schwelle für Grafikobjekte, ausdrücklich NICHT für Text |
| `--mass-gold` | `#E3B23C` | Bemaßung, Maßzahl, Positionsnummern, Legende, Hinweislinien — gemessen 9,88:1, textfähig |
| `--gold-hell` | `#FFD447` | Fokusring (2 px + 2 px Offset), aktive Position, Rastungsblitz |
| `--kreide-100` | `#E8EEF2` | Fließtext, Blatt-Titel, Maßzahlen XXL — gemessen 16,58:1 |
| `--kreide-300` | `#9FB0BC` | Nebentext, Schriftfeld, Einheiten, Bildunterschriften — gemessen 8,69:1 |
| `--nachbarteil` | `#6B7C8A` | Strich-Zweipunktlinie für Nachbarteile / optionale Positionen (u. a. der Kaffee), deaktivierte Zustände — gemessen 4,51:1 |
| `--pruef-gruen` | `#57C98A` | im Toleranzfeld, Betrieb normal, erfüllter Erfolg — gemessen 9,36:1 |
| `--abweich-rot` | `#E2685C` | Abweichung, Ausfallbalken, Fehlerzustand — gemessen 5,88:1 |

## 4 · Typografie

**Display —** Archivo (Variable, Google Fonts, self-gehostet als woff2; Achsen wght 100–900 und wdth 62–125). Eingesetzt fast ausschließlich als Archivo Expanded, wght 800, wdth 112–125. Begründung: Archivo stammt formal aus der amerikanischen Schilder- und Grotesk-Tradition — technisch, nüchtern, mit geraden Endungen und offenen Punzen, aber ohne die Sci-Fi-Manier von Orbitron/Michroma und ohne den Startup-Geruch von Space Grotesk oder Inter. Entscheidend ist die echte Breitenachse: Blatt-Titel werden über wdth breitgezogen statt über letter-spacing auseinandergerissen — das ist der Unterschied zwischen einer gesetzten und einer gedehnten Headline und einer der wenigen Stellen, an denen ein Juror sofort Handwerk erkennt. Der aktuelle Bestand hat mit 'Baloo 2' eine Kinderbuchschrift ohne vertikale Spannung; Archivo hat 900 Gewichte, echte Kondensation und eine große x-Höhe. Lizenzierte Aufwertung, falls Budget vorhanden: FF DIN Pro (Monotype) oder Theinhardt (Optimo) — beides echte DIN-/Grotesk-Linien, die die Konstruktionszeichnungs-Herkunft historisch korrekt machen. Fallback-Stack: 'Archivo Expanded', 'Archivo', 'Helvetica Neue', Arial, sans-serif.

**Fließtext —** IBM Plex Sans (Variable, Google Fonts, self-gehostet; wght 300–700, echtes 400 für Fließtext). Begründung: Plex wurde als Hausschrift eines Technologie- und Ingenieurunternehmens entworfen und trägt genau diese Bauart — rationalistisch, leicht eigenwillig in a, g und der abgeschrägten l-Fahne, dadurch charaktervoll ohne dekorativ zu sein. Es ist auf Gaming-Seiten praktisch unbenutzt, teilt aber eine gemeinsame Skelettlogik mit IBM Plex Mono und IBM Plex Sans Condensed: Damit stehen drei Register (Fließtext, Tabellenkopf, Maßschrift) in einer einzigen Familie — genau die Ökonomie, die eine Zeichnung braucht. Fließtext läuft bei 400/1,6 — der Bestand kennt kein einziges font-weight 400, weshalb dort 800 nichts mehr signalisiert. Fallback: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif.

**Monospace —** IBM Plex Mono (self-gehostet; 300, 400, 500, 600). Trägt die gesamte Zeichnungsbeschriftung: Maßzahlen, Positionsnummern, Koordinaten, Stücklisten- und Änderungsindex-Tabellen, Serveradresse, Blattnummern, Schriftfeld. Gesetzt in 300 mit letter-spacing 0.14em und font-feature-settings 'tnum' 1, 'zero' 1 (geschlitzte Null — Pflicht in technischer Beschriftung, verhindert die Verwechslung 0/O). Damit entsteht eine glaubwürdige Annäherung an die ISO-3098-Normschrift, ohne eine Schablonenschrift zu benutzen, die schnell nach Kostüm aussieht. Fallback: 'IBM Plex Mono', 'SFMono-Regular', ui-monospace, monospace.

**Skala —** Modulare Skala, Faktor 1,333 (Quarte) für Display, 1,2 für Text, zehn Stufen, alle fluid: --fs-000: 0.6875rem (Maßzahl klein, fest 11 px); --fs-00: 0.75rem (Schriftfeld, fest); --fs-0: 0.8125rem (Legende, Tabellenkopf, fest); --fs-1: 0.9375rem (Nebentext); --fs-2: clamp(1rem, 0.95rem + 0.25vw, 1.125rem) (Fließtext); --fs-3: clamp(1.125rem, 1.04rem + 0.42vw, 1.375rem) (Lead); --fs-4: clamp(1.5rem, 1.18rem + 1.4vw, 2.25rem) (Blatt-Untertitel); --fs-5: clamp(2rem, 1.4rem + 3vw, 3.5rem) (Blatt-Titel klein); --fs-6: clamp(2.75rem, 1.55rem + 5.6vw, 6rem) (Blatt-Titel); --fs-7: clamp(4rem, 1rem + 14vw, 11rem) (Hero-Headline); --fs-8: clamp(6rem, -1rem + 32vw, 22rem) (Maßzahl XXL, z. B. die Spielerzahl auf Blatt 01). Abstände auf 4-px-Basis, feste Leiter: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 — mehr Werte sind verboten. Zeilenhöhen: 1.0 (Display), 1.25 (Blatt-Titel), 1.6 (Fließtext), 1.45 (Tabellen). Gewichtsspanne 300 bis 800 statt heute 600 bis 800.

Die Bestandsanalyse hat 33 verschiedene rem-Größen in 1840 Zeilen gefunden, davon zwölf in einem 0,2-rem-Band — das ist keine Skala, sondern Improvisation pro Komponente, und sie ist der eigentliche Grund für die flache Hierarchie (größtes Element unterhalb des Heros: 43 px). WERKRISS dreht das um: zehn erlaubte Stufen, elf erlaubte Abstände, drei Familien mit einem gemeinsamen Skelett. Der Sprung von --fs-3 (Lead) auf --fs-8 (Maßzahl XXL) ist absichtlich brutal — Faktor 16 —, weil eine technische Zeichnung genau so funktioniert: winzige, gleichförmige Beschriftung neben einer riesigen Maßzahl. Diese Spanne ist der Hebel, der aus den Live-Daten endlich einen visuellen Höhepunkt macht, statt sie in zehn identische Kacheln zu sperren. Alle Zahlenkolonnen behalten die bereits vorhandene, richtige tabular-nums-Disziplin. Beide Familien werden lokal als woff2 ausgeliefert (unicode-range latin + latin-ext, font-display: swap, preload für je einen Schnitt) — das entfernt gleichzeitig den render-blockierenden Fremd-Roundtrip, das DSGVO-Risiko und Abschnitt 5 der eigenen Datenschutzerklärung.

## 5 · Der Hero

Blatt 00 lädt schwarz. In 400 ms blendet ein 8-mm-Konstruktionsraster in --graphit-600 auf, dann zeichnet sich der Blattrahmen als eine einzige durchlaufende Linie in 620 ms selbst — oben links die Blattnummer 00/10, unten rechts ein noch leeres Schriftfeld. Erst danach kommt der Körper.

Aus der Blattmitte fahren drei Baugruppen entlang einer senkrechten Montageachse (Strichpunktlinie) auseinander und rasten in ihrer Explosionslage ein, von oben nach unten versetzt um 70 ms: [3] die Inselwelt als isometrische Platte mit Höhenschichtlinien, [2] eine Basis als Drahtmodell mit Palbox und vier markierten Bauflächen, [1] die Maschine — ein isometrischer Schnitt durch den Rechner, der wirklich hier steht, auf einer Grundplatte mit der Beschriftung STANDORT: DEUTSCHLAND. Nichts rotiert. Alles bewegt sich ausschließlich auf der Achse, wie Teile, die in eine Vorrichtung fallen.

Dann misst sich die Zeichnung selbst: Maßhilfslinien wachsen aus den Bauteilkanten, die Maßlinie zieht in Gold zwischen ihnen durch, die Pfeilspitzen schnappen ein.

Erst jetzt Text. „GEBAUT, NICHT GEMIETET" wischt per clip-path von links ein, Archivo Expanded 800, während wdth von 112 auf 125 aufgeht und letter-spacing von 0,08 em auf 0,01 em zusammenzieht (700 ms). Darunter in IBM Plex Sans 400: „Deutscher Palworld-PvE-Server auf eigener Hardware. 32 Plätze. Keine Wipes. Kostenlos."

Unten links das wichtigste Bauteil: pve.palheim.de:8211 in Plex Mono 500, in einem gezeichneten Rahmen, daran eine Hinweislinie mit der Positionsblase 1 — und diese Blase IST der Kopierknopf.

Zu hören ist nichts. Im Schriftfeld sitzt ein Schalter „Werkstatt-Ton"; eingeschaltet legt er drei Mikro-Geräusche unter Rastung, Linienzug und Kopieren, gemastert auf −28 LUFS, per localStorage gemerkt, standardmäßig aus.

Die Maus kippt die drei Baugruppen um maximal ±1,2° auf getrennten Tiefen (Faktor 0,4 / 0,8 / 1,4) und zieht eine Zirkelspitze mit laufender Koordinatenanzeige hinter sich her.

## 6 · Seitenstruktur

| Sektion | Zweck | Form |
|---|---|---|
| **Kopfleiste — Blattregister & Anschluss (sticky, 56 px)** | Orientierung im Zeichnungssatz und permanenter Zugriff auf die Kernaktion; ersetzt die heutige 9-Punkte-Ankernavigation ohne Scrollspy | Ein durchgehender 1-px-Streifen am oberen Blattrand, geteilt wie ein Schriftfeldkopf: links die Wortmarke plus Blattnummer im Format 03/10, rechts die Serveradresse als Bauteil mit Positionsblase 1 und Kopierknopf. Das Blattregister 00–10 liegt NICHT im Kopf, sondern als vertikale Leiste am linken Blattrand: elf zweistellige Zahlen in Plex Mono 300, der aktive Eintrag rastet mit einem 1-px-Goldstrich ein. Kein Menü, keine Dropdowns, kein Hamburger auf Desktop; mobil wird die Leiste zu einer waagerechten, scrollbaren Zahlenreihe unter dem Kopf. |
| **Blatt 00 — Gesamtansicht (Hero, volle Blatthöhe)** | In fünf Sekunden beweisen, dass hier etwas Gebautes steht — und die Adresse sofort entnehmbar machen | Vollflächige isometrische Explosionszeichnung über die gesamte Viewporthöhe, drei Baugruppen auf einer senkrechten Montageachse (Welt / Basis / Maschine), Bemaßung in Gold, kein Foto, kein Verlauf. Die Headline liegt NICHT neben der Zeichnung, sondern in ihr: sie sitzt auf der untersten Rasterlinie und wird von der Maßkette der Grundplatte unterschnitten. Kein Scroll-Pfeil — stattdessen läuft am unteren Blattrand das Maßband weiter, dessen Skala sichtbar über die Kante hinausgeht und damit die Fortsetzung ankündigt. |
| **Blatt 01 — Bemaßung der Welt (Live-Zahlen)** | Die echten Live-Daten endlich als visuellen Höhepunkt statt als Tabellenkalkulation zeigen | Eine einzige, blattbreite Maßkette. Die aktuelle Spielerzahl steht als 'Ist-Maß' in --fs-8 (bis 22 rem) mittig auf der Maßlinie, links und rechts laufen die Maßhilfslinien bis an die Blattkanten. Darunter eine zweite, kleinere Maßkette in Toleranzschreibweise: der Allzeitrekord als oberes Grenzmaß mit Datum, null als unteres. Peak heute, einzigartige Spieler und In-Game-Tage hängen als drei Positionsblasen an Hinweislinien in der freien Blattfläche — unterschiedlich groß, unterschiedlich hoch platziert, bewusst asymmetrisch. Ist niemand online, wird die Maßkette nicht leer, sondern zeigt das Grenzmaß 'zuletzt X um HH:MM' plus die aus der 7-Tage-Kurve gelesene Primetime. |
| **Blatt 02 — Schnitt A–A (Was diese Welt ist)** | Verstehen statt lesen: PvE, keine Todesstrafe, keine Wipes, keine Mods — als räumliche Offenlegung | Ein sticky gehaltener isometrischer Körper, durch den beim Scrollen eine Schnittebene fährt (Schnittverlaufssymbol A–A mit Blickrichtungspfeilen am Blattrand). Wo die Ebene durch ist, öffnet sich der Körper: 45°-Schraffur füllt die Schnittfläche, dahinter werden die inneren Baugruppen sichtbar. Die vier Kernaussagen erscheinen nicht als Liste, sondern als Beschriftungen an den Schnittkanten, jede an ihrer eigenen Hinweislinie, jede erst in dem Moment, in dem die Schnittebene ihr Bauteil erreicht. |
| **Blatt 03 — Stückliste (Server-Raten)** | Die harten Einstellungen 3×/2×/2×/4/PvP aus/keine Todesstrafe als überprüfbare Werte statt als Werbekacheln | Bewusst eine echte Tabelle — und das ist hier die einzig richtige Form, weil eine Stückliste im technischen Zeichnen zwingend tabellarisch ist und weil sie das exakte Gegenteil eines Kartenrasters darstellt: gleiche Zeilenhöhe, ungleiche Spaltenbreiten, harte 1-px-Linien, keine Boxen, keine Schatten, keine Hover-Anhebung. Spalten: POS · BENENNUNG · WERT · BEMERKUNG. Über der Tabelle steht der Weltkörper mit sechs Positionsblasen; Hover oder Fokus auf einer Tabellenzeile lässt die zugehörige Hinweislinie in der Zeichnung aufleuchten und umgekehrt. Tabelle und Zeichnung sind ein einziges Objekt. |
| **Blatt 04 — Werkstoffprüfung (Verfügbarkeit & Ausfälle)** | Das stärkste Vertrauensargument, das ein Community-Server hat, aus dem versteckten Block ganz nach vorn holen | Ein Messschrieb, kein Diagramm im Kartensinn. Zwei gestrichelte Grenzlinien spannen ein Toleranzfeld über die volle Blattbreite; dazwischen läuft die tatsächliche Verfügbarkeitslinie aus /api/stats maschinell-gleichmäßig durch. Ausfälle sitzen als rote Fehlerbalken senkrecht auf der Zeitachse, jeder mit Datum und Minutenangabe als Maßzahl. Der tägliche Neustart um 03:00 ist als eingeplante, gestrichelte Unterbrechung markiert und ausdrücklich nicht als Abweichung gezählt. Gab es keine Ausfälle, füllt sich die Zeile 'ABWEICHUNGEN: keine im Prüfzeitraum' — der Leerzustand ist hier das Argument. |
| **Blatt 05 — Montageanleitung (Beitreten)** | Die Hauptkonversion; in unter einer Minute vom Lesen zum Spielen | Drei isometrische Montageschritte nebeneinander, gezeichnet wie eine Explosionsanleitung: /1/ Steam-Fenster, /2/ das Adressfeld, /3/ Verbinden, verbunden durch gebogene Montagepfeile. Schritt 2 ist absichtlich das größte Element des Blattes — die Adresse steht dort in --fs-5 mit einem Kopierknopf, der die gleiche Rastung wie Pos. 1 im Hero hat. Darunter eine Klarstellungszeile, die drei reale Reibungspunkte auf einmal auflöst: Steam-Version nötig, kein Passwort, kein Konto. Derselbe Block ist zusätzlich von jeder Seite aus als Overlay über die View-Transitions-API abrufbar, ohne 4.500 px Scrollweg. |
| **Blatt 06 — Vermessungsplan (Live-Karte)** | Den einzigen Inhalt zeigen, den kein anderer Server kopieren kann: echte Basen, echte Positionen | Blattbreite Vorschau ohne Rahmen, direkt in die Zeichenfläche gesetzt. Die Weltkontur als Höhenschichtenplan, Gildenbasen als nummerierte Vermessungspunkte (kleines Dreieck mit Positionsnummer), Spieler als wanderndes Fadenkreuz mit mitlaufender Koordinatenanzeige in Plex Mono. Nordpfeil und Maßstabsleiste liegen am Blattrand. Ein einzelner Aufruf 'VOLLES BLATT ÖFFNEN' führt auf /karte — ausgeführt als Blattwechsel-Übergang, nicht als Button. |
| **Blatt 07 — Kostenstelle (Wo ist der Haken?)** | Die eigentliche Vertrauensfrage ehrlich und überraschend beantworten — und dem Server ein Gesicht geben | Links ein einziges echtes Foto der realen Maschine, graphitiert und kontrastiert, in einem gezeichneten Bildrahmen mit der Bildunterschrift 'Bild 1: Aufnahme vom TT.MM.JJJJ'. Rechts der isometrische Schnitt durch dasselbe Gerät. Darunter eine Kostenaufstellung im Stücklistenformat: POS · KOSTENTRÄGER · TRÄGT · ANMERKUNG, mit den Positionen Rechner, Strom 24/7, Anschluss und Domain, Zeit. Position 5 ist 'DEINE KOSTEN — 0,00 €'. Position 6, der Kaffee, ist als Nachbarteil gezeichnet: Strich-Zweipunktlinie, Klammernummerierung, Bemerkung 'freiwillig, ohne Extras — gehört nicht zum Lieferumfang'. Eine Maßkette über die volle Blattbreite endet auf 0,00 €. Hier steht auch der Konstrukteur namentlich: 'Gez.: <Name>' mit zwei Sätzen, warum es das gibt. |
| **Blatt 08 — Betriebsvorschrift (Regeln)** | Regeln als Weltgesetz kommunizieren, nicht als Vorteilsliste — und damit Moderation belastbar machen | Eine einspaltige, hängend gesetzte Vorschriftenliste mit Gliederungsnummern 8.1 bis 8.6 in Plex Mono am linken Satzspiegelrand, jede Regel durch eine 1-px-Goldlinie in der Marginalie angebunden. Rechts steht pro Regel ein gezeichneter Gültigkeitsvermerk in zwei Stufen: GILT IMMER (durchgezogener Rahmen) oder HINWEIS (gestrichelter Rahmen). Ausdrücklich keine Häkchen, keine grünen Kreise, keine Kacheln — Regeln sind keine Features, die man bekommt. |
| **Blatt 09 — Änderungsindex (Was zuletzt passiert ist)** | Aktualität für Suchmaschinen und ein echter Grund wiederzukommen, ohne redaktionellen Aufwand | Eine Revisionstabelle, wie sie über jedem Schriftfeld steht: IND · DATUM · ÄNDERUNG · GEZ., neueste Zeile oben, Indexbuchstabe rückwärts von der aktuellen Revision. Automatisch gespeist aus vorhandenen Daten: Versionswechsel aus /api/status, Ausfälle und behobene Abweichungen aus /api/stats, neue Spielerrekorde. Manuelle Einträge des Admins tragen sein Kürzel statt AUTO. Für Wiederkehrer markiert eine Goldlinie in der Marginalie, welche Zeilen seit dem letzten Besuch dazugekommen sind — der Zeitstempel liegt bereits in localStorage. |
| **Blatt 10 — Anschlussplan (Discord)** | Genau ein Discord-Einstieg statt sechs, klar als sekundäre Leitung erkennbar | Ein gezeichnetes Anschlussschema mit drei Knoten und zwei beschrifteten Leitungen: DU → Leitung 1 (Spielserver, durchgezogen, breit, Cyan) → PALHEIM, und DU → Leitung 2 (Sprechverbindung, dünner, Gold) → DISCORD. Die Leitungsstärke IST die Hierarchie — der Nutzer sieht ohne ein Wort, was die Hauptverbindung ist. Der Discord-Knoten trägt einen konkreten Zweck ('Ankündigungen, Hilfe bei Verbindungsproblemen, Kontakt zum Admin') statt eines Versprechens. |
| **Schriftfeld (Footer nach DIN 6771)** | Herkunft, Recht und Navigation an genau dem Ort, an dem sie in einer Zeichnung ohnehin stehen | Ein viergeteiltes Feld am unteren rechten Blattrand, exakt in der Bauform eines Zeichnungsschriftfelds: Zeichnungsträger (PalHeim, Palworld PvE, Deutschland) · GEZ./GEPR. · DAT./IND. · BLATT/MAßSTAB. Impressum, Datenschutz, Karte und Datenblätter stehen als Verweise im linken Feld — Rechtsseiten sind hier keine Fußnoten, sondern Bestandteil der Zeichnungsverwaltung. Der Marken-Disclaimer zu Pocketpair liegt im breiten Anmerkungsfeld in --kreide-300 bei --fs-00, lesbar und nicht versenkt. Der Schalter 'Werkstatt-Ton' und die Bewegungs-Vorwahl sitzen ebenfalls hier. |

## 7 · Scroll-Journey

1. 0 vh (Blatt 00, Stillstand) — Der Zeichnungssatz stellt sich vor: Raster, Rahmen, Schriftfeld, dann die dreiteilige Explosionszeichnung, dann die Bemaßung, dann die Headline, zuletzt Pos. 1 mit der Adresse. Die gesamte Eröffnung dauert 2,6 s und läuft ohne Scroll ab. Am unteren Blattrand steht das Maßband bei 0 mm.
2. 0–15 vh (Übergang) — Die drei Baugruppen fahren beim ersten Scrollimpuls NICHT weg, sondern zusammen: Die Explosionslage kollabiert entlang der Montageachse zur Baugruppe. Der Nutzer scrollt das Objekt buchstäblich zusammen. Gleichzeitig kippt das Achsenkreuz unten links um 1,5° und das Maßband beginnt zu laufen.
3. 15–30 vh (Blatt 01, Bemaßung der Welt) — Aus der zusammengebauten Baugruppe wachsen zwei Maßhilfslinien bis an die Blattkanten, die Maßlinie zieht durch, und mitten hinein zählt die aktuelle Spielerzahl in --fs-8 hoch. Erster echter Aha-Moment: Die größte Type der Seite ist eine echte, gerade gemessene Zahl — nicht die Headline.
4. 30–40 vh (Toleranz) — Unterhalb der Hauptmaßkette entsteht die Toleranzzeile: der Allzeitrekord als oberes Grenzmaß mit Datum. Die drei Positionsblasen (Peak heute, einzigartige Spieler, In-Game-Tage) klappen versetzt an ihren Hinweislinien auf. Wirkung: Der Server hat eine Geschichte, keine Momentaufnahme.
5. 40–58 vh (Blatt 02, Schnittfahrt) — Der Körper wird sticky gehalten. Die Schnittebene fährt scrollgesteuert von links durch ihn hindurch; hinter ihr füllt sich die Schnittfläche mit 45°-Schraffur, die Innenstruktur wird sichtbar. Die vier Kernaussagen (PvE, keine Todesstrafe, keine Wipes, ohne Mods) erscheinen einzeln an den Schnittkanten, exakt in dem Moment, in dem die Ebene ihr Bauteil freilegt. Dramaturgischer Höhepunkt der ersten Hälfte: Verstehen durch Aufschneiden.
6. 58–70 vh (Blatt 03, Stückliste) — Der geöffnete Körper fährt nach oben ins obere Blattdrittel und wird zur Referenzzeichnung. Darunter baut sich die Stücklistentabelle Zeile für Zeile auf, jede Zeile schiebt gleichzeitig ihre Hinweislinie in die Zeichnung. Nach der letzten Zeile leuchten alle sechs Positionsblasen 200 ms gemeinsam auf — die Baugruppe ist vollständig beschriftet.
7. 70–82 vh (Blatt 04, Werkstoffprüfung) — Tonwechsel: Die Isometrie verschwindet, das Blatt wird flach und wird zum Messschrieb. Das Toleranzfeld zeichnet sich, dann läuft die Verfügbarkeitslinie mit bewusst linearem Timing durch — maschinell, unaufgeregt, wie ein Plotter. Ausfallbalken rasten nachlaufend ein. Wirkung: Nach der Schauseite kommt der Beleg.
8. 82–92 vh (Blatt 05, Montageanleitung) — Die Konversionsstelle. Drei Montageschritte fahren von unten ein, Schritt 2 mit der Adresse ist das größte Element des Blattes. Die Kopfleiste zieht ihre Pos.-1-Blase kurz mit einer Goldkante nach — dieselbe Aktion ist an zwei Orten gleichzeitig sichtbar, ohne sie zu doppeln.
9. 92–104 vh (Blatt 06, Vermessungsplan) — Volle Blattbreite, Ränder verschwinden. Die Weltkontur zeichnet sich, Vermessungspunkte der echten Gildenbasen setzen sich nacheinander, Spielerfadenkreuze beginnen zu wandern. Erster Moment, in dem die Community sichtbar wird — nicht als Zitat, sondern als Vermessungsdaten.
10. 104–118 vh (Blatt 07, Kostenstelle) — Das einzige Foto der ganzen Seite blendet auf: die reale Maschine. Daneben ihr Schnitt. Die Kostentabelle baut sich auf, Position 5 zeigt 0,00 €. Position 6, der Kaffee, wird erkennbar anders gezeichnet — Strich-Zweipunkt, Klammernummer, 'gehört nicht zum Lieferumfang'. Zum Schluss zieht eine Maßkette über die volle Blattbreite und endet auf 0,00 €. Emotionaler Kippmoment: Die Frage nach dem Haken ist beantwortet, bevor sie gestellt wurde.
11. 118–128 vh (Blatt 08 und 09, Vorschrift und Index) — Ruhephase, fast keine Bewegung: die Betriebsvorschrift als reine Typografie, danach der Änderungsindex als Tabelle. Wer bis hierher gescrollt ist, sucht Fakten, nicht Effekte. Für Wiederkehrer markiert eine Goldlinie die Zeilen seit dem letzten Besuch.
12. 128–140 vh (Blatt 10 und Schriftfeld) — Der Anschlussplan zeichnet zwei Leitungen unterschiedlicher Stärke. Zum Abschluss wird das Schriftfeld, das seit Sekunde eins unten rechts leer stand, Feld für Feld ausgefüllt — GEZ., DAT., IND., BLATT 10/10, Maßstab 1:1. Das Maßband erreicht seinen Endwert. Die Zeichnung ist fertig gestellt, die Seite ist zu Ende, und beides ist dasselbe Ereignis.

## 8 · Animationen

- LINIENZUG (Selbstzeichnende Linien) — Jeder SVG-Pfad bekommt pathLength="1", stroke-dasharray: 1, stroke-dashoffset: 1 und wird auf 0 animiert. Steuerung primär CSS-only über animation-timeline: view(); animation-range: entry 8% cover 42%. Der Trick mit pathLength=1 macht die Animation unabhängig von der realen Pfadlänge — kein getTotalLength(), kein Layout-Zugriff, kein JS im kritischen Pfad. Dauer 620 ms, cubic-bezier(0.22, 1, 0.36, 1). Ruhige Variante: Pfad sofort vollständig, stroke-dashoffset: 0.
- MONTAGE (Hero-Zusammenbau) — WAAPI-Timeline über drei Baugruppen. Jede trägt eine CSS-Variable --fly mit ihrem Versatz entlang der Montageachse; animiert wird ausschließlich transform: translate3d() und opacity, niemals top/left. element.animate([...], { duration: 900, delay: i * 70, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }). Der Overshoot entsteht über eine dritte Keyframe-Stufe bei 82 % (Überfahren um 6 px), nicht über eine Bounce-Kurve. Ruhige Variante: Endzustand ohne Bewegung, nur 200 ms Opacity-Blende.
- MASSKETTE (Bemaßung baut sich auf) — Dreistufige WAAPI-Group: (a) Maßhilfslinien wachsen senkrecht zur Maßlinie per scaleY 0→1 mit transform-origin an der Bauteilkante, 240 ms; (b) die Maßlinie zieht per stroke-dashoffset durch, 420 ms, cubic-bezier(0.22, 1, 0.36, 1); (c) beide Pfeilspitzen schnappen mit scale(0)→scale(1) und cubic-bezier(0.34, 1.56, 0.64, 1) in 180 ms ein. Die Maßzahl blendet zuletzt auf. Ruhige Variante: alle drei Stufen als Endzustand, Maßzahl ohne Blende.
- SCHNITTFAHRT (Blatt 02, Signature-Moment) — Registrierte Custom Property @property --cut { syntax: '<length>'; inherits: true; initial-value: 0px } wird über animation-timeline: view() am sticky gehaltenen Container getrieben. Der Körper existiert zweifach: die geschlossene Außenhaut, geclippt auf x > --cut, und die Schnittansicht mit <pattern patternTransform="rotate(45)"> als Schraffur, geclippt auf x < --cut. Exakt auf --cut liegt eine 2-px-Cyan-Schnittkante mit einer 1-px-weißen Lichtkante. Zusätzlich per <input type="range"> (visuell als Schnittsymbol) manuell und mit Pfeiltasten bedienbar. Ruhige Variante: Schnittebene steht fest bei 50 %, der Körper ist zur Hälfte geöffnet — ein gültiger, fertiger Zeichnungszustand, kein halbfertiger Effekt.
- ACHSENKREUZ-DRIFT — Persistentes isometrisches Achsenkreuz (X/Y/Z, 30°/150°/90°) unten links, dessen Rotation dem Scrollfortschritt folgt: animation-timeline: scroll(root block), Bereich maximal ±6°. Reine CSS-Rotation auf einem 48-px-SVG, keine JS-Kosten, kein Layout. Ruhige Variante: Achsenkreuz steht still.
- MASSBAND (Scrollstand als Maß) — Fußleiste über die volle Blattbreite. Die Skalenstriche sind ein repeating-linear-gradient (kein DOM), der Läufer wird per animation-timeline: scroll(root) und translateX geführt. Die Maßzahl daneben zeigt die Position in Millimetern (Seitenhöhe in px × 0,2646 mm) über @property --mm plus counter() — eine Zahl ohne Prozentzeichen, weil eine Zeichnung keine Prozente kennt. Ruhige Variante: statischer Läufer, Wert wird beim Scroll-Ende einmal gesetzt.
- POSITIONSBLASE (Hotspots) — Bei Hover oder Fokus zeichnet sich zuerst die Hinweislinie (stroke-dashoffset, 260 ms), dann skaliert die Blase von 0.6 auf 1 mit cubic-bezier(0.34, 1.56, 0.64, 1) in 180 ms, dann erscheint der Text per clip-path: inset(0 100% 0 0) → inset(0). Umsetzung als natives popover mit CSS Anchor Positioning (anchor-name / position-anchor), JS-Fallback für Firefox. Ruhige Variante: Blase und Text sofort sichtbar, Hinweislinie ohne Zeichenbewegung.
- ZÄHLWERK (echte Zahlen laufen hoch) — @property --num { syntax: '<integer>' } in Kombination mit counter-reset: n var(--num) und content: counter(n) — eine CSS-only Zahlenanimation ohne einen einzigen JS-Tick. 700 ms, linear (bewusst nicht ease: ein Zählwerk beschleunigt nicht). Gesetzt in Plex Mono mit tnum, damit die Breite konstant bleibt. Ruhige Variante: Zielwert sofort, kein Zählen.
- TOLERANZBAND (Blatt 04, Messschrieb) — Die beiden gestrichelten Grenzlinien zeichnen sich in 480 ms, danach läuft die reale Verfügbarkeitslinie aus /api/stats per stroke-dashoffset in 1600 ms mit linear durch — maschinelles Timing als bewusster Bruch zum sonst dekelerierenden Motion-System. Ausfallbalken rasten 40 ms nach Durchlauf der Messlinie an ihrer Zeitposition ein, scaleY 0→1 mit transform-origin: bottom. Ruhige Variante: fertiger Messschrieb, Balken ohne Einrasten.
- RASTUNG (taktile Grundeinheit) — Jede interaktive Fläche mit Positionsnummer: 180 ms, scale(1) → scale(0.994) → scale(1), gleichzeitig stroke-width 1.25 px → 2 px und eine 1-Frame-Goldkante. Als einzelnes @keyframes-Set definiert und überall wiederverwendet — ein einziges Anfassgefühl über die ganze Seite. Ruhige Variante: nur der Strichstärkenwechsel bleibt, keine Skalierung.
- BLATTWECHSEL (Seitenübergänge) — Native Multi-Page View Transitions: @view-transition { navigation: auto } zwischen /, /karte und /spieler/*. view-transition-name auf drei Elementen: das Schriftfeld bleibt stehen (kein Übergang), die Blattnummer flippt vertikal in 260 ms, die Zeichenfläche wechselt per Wischblende entlang 30° über clip-path: polygon() in den ::view-transition-old/new-Keyframes. Kein Framework, kein Router, kein Client-Side-Routing. Ruhige Variante: die Wischblende wird zur 120-ms-Opacity-Blende.
- GRAPHITSTAUB (Tiefe im Hintergrund) — Ein Canvas hinter dem Blatt, maximal 40 Partikel, 0,5–1,5 px, Deckkraft 4–9 %, Drift ausschließlich entlang der Zeichnungsachsen 30° / 150° / 90° — nie zufällig, das ist der ganze Punkt. 6–14 s pro Durchlauf, requestAnimationFrame, Pause per IntersectionObserver, automatischer Verzicht bei prefers-reduced-motion oder navigator.hardwareConcurrency < 4. Keine Blur-Filter, nur globalAlpha — damit bleibt das Ganze unter 1 ms pro Frame. Ruhige Variante: Canvas wird gar nicht erst erzeugt.

## 9 · Bildsprache

GRUNDSATZ: Es gibt in dieser Welt kein gemaltes und kein generiertes Artwork. Das Bild IST die Zeichnung. Damit fällt der größte Austauschbarkeitstreiber der Bestandsseite (hero.webp und hero-alt.webp, zwei Würfe desselben Text-zu-Bild-Prompts ohne einen einzigen Pal, Spieler oder Basis) ersatzlos weg.

MOTIVE: Nur drei Motivfamilien sind zugelassen. (1) BAUGRUPPEN — Weltkörper als isometrische Platte mit Höhenschichtlinien, Basis als Drahtmodell mit Palbox und vier Bauflächen, die reale Maschine als Schnittkörper auf einer Grundplatte. (2) VERMESSUNG — Weltkontur, Vermessungspunkte echter Gildenbasen aus /api/map, Spielerfadenkreuze, Nordpfeil, Maßstabsleiste. (3) ANNOTATION — Maßketten, Hinweislinien, Positionsblasen, Schnittverlaufssymbole, Schraffuren, Legenden, Schriftfeld.

PERSPEKTIVE: Isometrische Axonometrie, streng. Achsen bei 30°, 150° und 90°, alle drei gleich verkürzt. Projektionsformel für alle SVG-Assets: x' = (x − y) · cos 30°, y' = (x + y) · sin 30° − z. Keine Zentralperspektive, keine Fluchtpunkte, keine freien Winkel. Wer eine Linie in 27° zeichnet, hat die Zeichnung verlassen.

LINIENARTEN nach ISO 128, fünf Stufen, keine sechste: Vollinie breit 2 px (Schnittkanten, sichtbare Hauptkanten, --riss-cyan) · Vollinie schmal 1,25 px (sichtbare Nebenkanten, --riss-cyan bei 70 %) · Strichlinie 1,25 px, dash 6/3 (verdeckte Kanten, --riss-tief) · Strichpunktlinie 0,75 px, dash 12/3/2/3 (Mittel- und Montageachsen, --riss-tief) · Strich-Zweipunktlinie 0,75 px, dash 12/3/2/3/2/3 (Nachbarteile, optionale Positionen, --nachbarteil). Maßlinien und Maßhilfslinien immer 0,75 px in --mass-gold, Pfeilspitzen geschlossen und gefüllt, Öffnungswinkel 15°. Alle Strichstärken mit vector-effect: non-scaling-stroke, damit Zoom sie nicht verfälscht.

LICHTFÜHRUNG: Eine Zeichnung hat kein Licht — Tiefe entsteht hier durch drei kontrollierte Ausnahmen. Erstens der Leuchttisch: ein sehr weicher Radialverlauf hinter dem Blatt, --riss-cyan bei 3 % Deckkraft, 140 % der Viewportbreite, unbewegt. Zweitens die Schnittflächen: die einzigen gefüllten Flächen der Seite, 45°-Schraffur in --riss-cyan bei 24 %, darunter ein kaum sichtbarer Verlauf von --mass-gold 8 % nach transparent — der Körper wirkt, als wäre er innen wärmer. Drittens die Lichtkante: 1-px-Highlights in reinem Weiß auf den obersten Schnittkanten, maximal drei pro Bildschirm. Zusammen ergibt das die geforderte Volumetrik, ohne die Zeichnungslogik zu brechen.

BEHANDLUNG DES EINEN FOTOS: Auf Blatt 07 steht genau eine echte Fotografie — die reale Maschine. Behandlung: entsättigt auf 0 %, dann Duotone von --graphit-900 nach --kreide-300, Kontrast angehoben, feines Raster (Halbton, 0,8 px) darübergelegt, gerahmt in einer 1-px-Vollinie mit Bildunterschrift „Bild 1: Aufnahme vom TT.MM.JJJJ". Ein einziges Foto in einer Welt aus Linien ist enorm stark — und es ist die einzige Bildart, die kein Modell fälschen kann.

IKONOGRAFIE: Zwölf selbst gezeichnete Glyphen auf einem 24-px-Raster mit exakt einer Strichstärke (1,5 px), abgeleitet aus Zeichnungssymbolik: Schnittpfeil, Nordpfeil, Maßpfeil, Positionsblase, Rastung, Anschluss, Prüfhaken, Abweichung, Blatt, Achsenkreuz, Werkzeug, Leitung. Sie ersetzen sowohl das eine geliehene Lucide-Clipboard als auch alle 25 System-Emoji der Erfolge — die heute auf Windows und Mac völlig verschieden aussehen und ausgerechnet die emotionalste Oberfläche der Seite in Segoe UI Emoji rendern.

DO: echte Winkel, konsistente Strichstärken, geschlitzte Null, Beschriftung immer waagerecht (nie mitgedreht), Maßzahlen immer über der Maßlinie, jede Zahl auf der Seite hat eine Quelle in der API.
DON'T: kein Cyanotypie-Blau mit weißen Linien (das ist das Blueprint-Klischee, das wir gerade nicht machen), kein Papierknitter, keine Kaffeeflecken, keine Nieten, kein Steampunk, keine Zahnräder, keine Isometrie-Illustration im flachen Vektor-Stil mit Farbflächen, kein Glassmorphism, keine weichgezeichneten Schatten, keine gerenderten 3D-Materialien, kein einziges Emoji, keine gestockte Fantasy-Landschaft.

## 10 · Interaktionen

- ZIRKELSPITZE — Der Mauszeiger zieht ein feines Fadenkreuz mit laufender Koordinatenanzeige (X/Y im Zeichnungskoordinatensystem, Plex Mono 300, --kreide-300) hinter sich her. Zweck: Der Nutzer bewegt sich sofort spürbar in einer vermessenen Fläche und nicht auf einer Webseite. Auf Touch und bei prefers-reduced-motion abgeschaltet, der native Cursor bleibt immer sichtbar.
- BAUTEIL-PARALLAX — Mausbewegung kippt die drei Hero-Baugruppen um maximal ±1,2° auf getrennten Tiefen (Faktor 0,4 / 0,8 / 1,4), interpoliert mit lerp 0,08 pro Frame. Zweck: Die Isometrie wird körperlich, ohne dass die Projektionslogik bricht — die Winkel bleiben in der zulässigen Toleranz. Bewusst so klein, dass es unterhalb der bewussten Wahrnehmung bleibt.
- ENTNAHME statt Kopier-Toast — Der Kopierknopf ist die Positionsblase von Pos. 1. Nach dem Klick rastet die Blase ein (180 ms), die Blasenkontur wird gefüllt, und im Schriftfeld erscheint für 4 s die Zeile „Pos. 1 entnommen · HH:MM". Zweck: Bestätigung im Weltmodell statt generischer Snackbar — und ein echter Fallback, den die Bestandsseite komplett vermissen lässt: Schlägt navigator.clipboard fehl, markiert die Interaktion die Adresse per Selection-API und zeigt „Pos. 1 markiert — bitte mit Strg+C entnehmen".
- ÜBERGABE AN DEN PC (Pos. 1a) — Auf Touch-Geräten heißt der zweite Knopf nicht „kopieren", sondern „Pos. 1a — an PC übergeben" und faltet einen QR-Code in einem gezeichneten Rahmen auf. Zweck: löst das real existierende Problem, dass Palworld am PC gespielt und die Seite am Handy gelesen wird — die Adresse landet heute in der falschen Zwischenablage.
- REGISTER-RASTEN — Das Blattregister 00–10 am linken Rand markiert beim Scrollen den aktiven Eintrag mit einem 1-px-Goldstrich, der in 140 ms einrastet. Klick springt mit scroll-padding-top in Kopfleistenhöhe — der Bestand hat weder Scrollspy noch scroll-padding, jede der acht Ankernavigationen landet dort heute 68 px zu hoch. Zweck: Orientierung auf einem langen Blatt und tastaturvollständige Sprungnavigation.
- GEKOPPELTE HINWEISLINIEN — Hover oder Fokus auf einer Stücklistenzeile lässt die zugehörige Hinweislinie und Positionsblase in der Zeichnung darüber aufleuchten; Hover auf einer Positionsblase hebt umgekehrt die Tabellenzeile hervor. Umgesetzt über aria-describedby und ein gemeinsames data-pos-Attribut, damit die Kopplung auch für Screenreader existiert. Zweck: Tabelle und Zeichnung sind ein Objekt, nicht zwei Darstellungen.
- SCHNITTEBENE ZIEHEN — Auf Blatt 02 lässt sich die Schnittebene zusätzlich zum Scroll manuell verschieben: ein <input type="range">, visuell als Schnittsymbol gestaltet, bedienbar mit Pointer, Pfeiltasten, Pos1/Ende. Zweck: Kontrolle über den Hauptmoment der Seite, messbar mehr Verweildauer, und ein vollwertiger Tastaturzugang zu einer Animation, die sonst nur beim Scrollen existiert.
- MASSZAHL-UMSCHALTUNG — Ein Klick auf eine Maßzahl schaltet ihre Einheit um: Gesamtspielzeit zwischen Stunden, Tagen und In-Game-Tagen; zurückgelegte Distanz zwischen Kilometern und „Runden um die Insel". Zweck: dieselbe Zahl zweimal erzählen, ohne neuen Platz zu verbrauchen — und der Erklärbär-Ton der heutigen Hint-Zeilen wird durch eine Handlung ersetzt.
- TOLERANZBAND-SCRUBBING — Die Zeitachse auf Blatt 04 ist mit Pfeiltasten begehbar; eine aria-live-Region meldet Datum, Verfügbarkeitswert und gegebenenfalls die Ausfalldauer. Zweck: übernimmt die bereits vorhandene, überdurchschnittlich gute Chart-Tastaturbedienung aus stats.js unverändert in die neue Formensprache.
- RASTUNG ÜBERALL — Jede Fläche mit einer Positionsnummer reagiert auf Hover und Fokus mit demselben 180-ms-Schnapp (Skalierung 0,994 plus Strichstärkenwechsel). Zweck: ein einziges, wiedererkennbares Anfassgefühl über alle elf Blätter und alle Unterseiten — die Seite fühlt sich mechanisch an, nicht weich.

## 11 · Wireframe

```
==============================================================================
ZEICHNUNGSSATZ PALHEIM · BLATT 00 · GESAMTANSICHT · M 1:1
==============================================================================
+----------------------------------------------------------------------------+
| PALHEIM BLATT 00/10 | Register 00 01 02 03 04 05 06 07 08 09 10            |
| Pos.1 pve.palheim.de:8211 [KOPIEREN]              Anschluss Discord >      |
+----------------------------------------------------------------------------+
|                                                                            |
|   Z                    - - - - Montageachse - - - -                        |
|   ^                                                                        |
|   |          .-'''''''''-.        [3] INSELWELT                            |
|   |        .'  Höhen-    '.      Isometrische Platte,                     |
|   |       (   schichten     )     Höhenlinien 0,5 px                      |
|   |        '.___________.'                                                 |
|   |               |  <- Montagelinie (Strichpunkt)                         |
|   |          /\/\/\/\/\           [2] BASIS                                |
|   |         /  Palbox  /|         Isometrisches Drahtmodell,               |
|   |        /__________/ |         4 Basen pro Gilde                        |
|   |        |   |   |  | /                                                  |
|   |               |                                                        |
|   |        +-------------+        [1] MASCHINE                             |
|   |       /|/////////////|        Schnitt, Schraffur 45 Grad,              |
|   |      +-|-------------|        Grundplatte: STANDORT DEUTSCHLAND        |
|   |        +-------------+                                                 |
|   +------------------------------------------------> X                     |
|                                                                            |
|   |<------------------ 12 400 -------------------->|   Maßketten Gold     |
|                                                                            |
|   GEBAUT, NICHT GEMIETET                                                   |
|   ###########################                     Archivo Expanded 800     |
|   Deutscher Palworld-PvE-Server auf eigener Hardware. 32 Plätze.          |
|   Keine Wipes. Kostenlos. Hier ist der komplette Bauplan.                  |
|                                                                            |
|   Pos.1 ---------o [ pve.palheim.de:8211 ]  [KOPIEREN]  [QR an PC]         |
|                                                                            |
|                    Schriftfeld unten rechts:  GEZ. | DAT. | IND. | 00/10   |
+----------------------------------------------------------------------------+
| 0 mm |....|....|....|....|....|....|....|....|....| Maßband / Scrollstand |
+----------------------------------------------------------------------------+

BLATT 01 · BEMASSUNG DER WELT (Live-Zahlen als Maßkette, kein Kachelraster)
+----------------------------------------------------------------------------+
|  |<--------------------------------------------------------------------->| |
|  |                                                                       | |
|  |                        1 7 / 3 2                                      | |
|  |                    ############ 22 rem                                | |
|  |                     SPIELER IM FELD                                   | |
|  |                                                                       | |
|  |<--- 24 (Rekord 14.06.) --->|<------ Toleranzfeld frei ------>|        | |
|                                                                            |
|  o Pos.11 Heute max. 9    o Pos.12 Einzigartig 148   o Pos.13 Tage 612     |
|    Hinweislinien mit Positionsblasen, keine Karten                         |
+----------------------------------------------------------------------------+

BLATT 02 · SCHNITT A-A (Schnittfahrt: Scroll treibt die Schnittebene)
+----------------------------------------------------------------------------+
|  A                                                                      A  |
|  |>--------------------- Schnittverlauf ------------------------------<|   |
|                                                                            |
|      ///////////  <- Schnittflaeche, Schraffur 45 Grad, Gold 30 %          |
|     /  offene   /     Der Koerper oeffnet sich während des Scrollens      |
|    /  Struktur /      Dahinter: PvE, keine Todesstrafe, keine Wipes        |
|   +-----------+       Text läuft in der rechten Halbspalte mit            |
|                                                                            |
+----------------------------------------------------------------------------+

BLATT 03 · STUECKLISTE (echte Tabelle mit Hinweislinien in die Zeichnung)
+----------------------------------------------------------------------------+
|     [ Isometrie oben: Weltkoerper mit 6 Positionsblasen ]                  |
|        o1     o2       o3        o4      o5      o6                       |
|  ------------------------------------------------------------------------  |
|  POS | BENENNUNG       | WERT  | BEMERKUNG                              |  |
|  ------------------------------------------------------------------------  |
|   1  | EP-Rate         |  3x   | schneller leveln                       |  |
|   2  | Fangrate        |  2x   | bessere Fangchance                     |  |
|   3  | Drop-Rate       |  2x   | mehr Material                          |  |
|   4  | Basen je Gilde  |  4    | Bauflaeche                             |  |
|   5  | PvP             | AUS   | reiner PvE-Betrieb                     |  |
|   6  | Todesstrafe     | KEINE | kein Item- oder Palverlust             |  |
|  ------------------------------------------------------------------------  |
+----------------------------------------------------------------------------+

BLATT 04 · WERKSTOFFPRUEFUNG (Verfügbarkeit als Toleranzband, Messschrieb)
+----------------------------------------------------------------------------+
|  100% -----------------------------------------------  obere Grenze        |
|        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~|_|~~~~~~~~~~~~~~~   Messlinie          |
|   99% - - - - - - - - - - - - - - - - - - - - - - - -  Toleranzfeld        |
|        24 h                                     7 d                        |
|  ABWEICHUNGEN: 21.07. 06 min | 14.07. 12 min | sonst keine                 |
|  Täglicher Neustart 03:00 ist eingeplant, keine Abweichung.               |
+----------------------------------------------------------------------------+

BLATT 05 · MONTAGEANLEITUNG (3 gezeichnete Schritte, Hauptkonversion)
+----------------------------------------------------------------------------+
|   /1/                   /2/                     /3/                        |
|  [Steam-Fenster]  -->   [ Adressfeld ]   -->    [ Verbinden ]              |
|   isometrisch           GROSS + KOPIEREN         Rastung + Haken           |
|                         pve.palheim.de:8211                                |
|   Hinweis: Steam-Version nötig. Kein Passwort. Kein Konto.                |
+----------------------------------------------------------------------------+

BLATT 06 · VERMESSUNGSPLAN (Live-Karte als Vorschau, volle Blattbreite)
+----------------------------------------------------------------------------+
|  N ^   . x  o  .      Basen = Vermessungspunkte mit Pos.-Nr.               |
|    |  o   .    x  .   Spieler = wanderndes Fadenkreuz + Koordinate         |
|    |    x    o        [ VOLLES BLATT OEFFNEN -> /karte ]                   |
+----------------------------------------------------------------------------+

BLATT 07 · KOSTENSTELLE (Wo ist der Haken? Schnitt durch die Maschine)
+----------------------------------------------------------------------------+
|   Fotobeleg (1 echtes Foto, graphitiert) | Schnitt durch das Geraet        |
|   ------------------------------------------------------------------------ |
|   POS | KOSTENTRAEGER      | TRAEGT        | ANMERKUNG                     |
|    1  | Rechner            | Admin         | einmalig, steht hier          |
|    2  | Strom 24/7         | Admin         | läuft durch                  |
|    3  | Anschluss + Domain | Admin         | monatlich                     |
|    4  | Zeit               | Admin         | unbezahlt                     |
|    5  | DEINE KOSTEN       | ---           | 0,00 EUR                      |
|  ( 6 )| Kaffee             | freiwillig    | NACHBARTEIL, nicht im         |
|       |                    |               | Lieferumfang                  |
|   ------------------------------------------------------------------------ |
|   |<---------------------- 0,00 EUR ---------------------->|  Maßkette    |
+----------------------------------------------------------------------------+

BLATT 08 · BETRIEBSVORSCHRIFT (Regeln, keine Haken, keine Features)
+----------------------------------------------------------------------------+
|  8.1  Kein Griefing, kein Diebstahl.                       [ GILT IMMER ]  |
|  8.2  Bauabstand zu fremden Basen halten.                  [ GILT IMMER ]  |
|  8.3  Inaktive Basen können nach 30 Tagen entfernt werden. [ HINWEIS   ]  |
|  8.4  Admin-Entscheidungen sind final.                     [ GILT IMMER ]  |
|       ... hangende Positionsnummern, Maßstrich links am Satzspiegel       |
+----------------------------------------------------------------------------+

BLATT 09 · AENDERUNGSINDEX (Revisionstabelle, Grund zurückzukommen)
+----------------------------------------------------------------------------+
|  IND | DATUM      | AENDERUNG                                    | GEZ.    |
|   C  | 24.07.2026 | Serverversion aktualisiert                   | AUTO    |
|   B  | 21.07.2026 | Abweichung 06 min, behoben                   | AUTO    |
|   A  | 14.06.2026 | Neuer Rekord: 24 Spieler                     | AUTO    |
+----------------------------------------------------------------------------+

BLATT 10 · ANSCHLUSSPLAN (Discord als gezeichnete Leitung, sekundaer)
+----------------------------------------------------------------------------+
|   [ DU ] ====== Leitung 1: Spielserver ======> [ PALHEIM ]                 |
|      \\                                                                    |
|       ==== Leitung 2: Sprechverbindung ====>  [ DISCORD ]                  |
+----------------------------------------------------------------------------+

SCHRIFTFELD (Footer nach DIN 6771, traegt Recht und Herkunft)
+---------------------------+--------------+---------------+----------------+
| PALHEIM                   | GEZ.  Admin  | DAT. 24.07.26 | BLATT   10/10  |
| Palworld PvE, Deutschland | GEPR. --     | IND.  C       | M     1:1      |
| Impressum · Datenschutz   | Inoffizieller Community-Server.               |
| Karte · Datenblaetter     | Palworld ist Marke von Pocketpair, Inc.       |
+---------------------------+--------------+---------------+----------------+
```

## 12 · Moodboard

REFERENZEN, die tatsächlich auf dem Tisch liegen: Fotokopierte Ersatzteilkataloge der 1970er (Porsche-Werkstatthandbuch, explodierte Getriebe auf Graupapier). Die Konstruktionszeichnungen von Ove Arup und Peter Rice — Ingenieurblätter, auf denen die Bemaßung schöner ist als das Gebäude. Otl Aichers Systematik für die ERCO-Kataloge: Licht als Diagramm erklärt, nicht inszeniert. Die Isometrien in Gerd Arntz' Isotype-Arbeiten, wegen ihrer Härte. IKEA-Montageanleitungen für die Klarheit der Pfeilsymbolik. Und, als Gegenprobe, die Interface-Grafik aus „Alien" (Ron Cobb) und die Hoerbuchcover-strenge Linienarbeit von NASA-Fahrzeugschnitten.

Aus dem Spielumfeld ausdrücklich NUR: die technischen Schnittbilder aus Kojima Productions' Artbooks und die Blaupausen-Interfaces von Kerbal Space Program — beides Konstruktion, nicht Atmosphäre. Bewusst NICHT: Tarkov-Grunge, Destiny-Sci-Fi-Ornamentik, Cyberpunk-Neon.

TEXTUREN: fast keine. Ein 8-mm-Raster bei 4 % Deckkraft, ein Halbtonraster von 0,8 px auf dem einen Foto, sonst nur Linie auf Fläche. Kein Papier, kein Rauschen über dem gesamten Viewport, kein Vignettierungsfilter.

LICHTSTIMMUNG: die eines Leuchttischs in einem dunklen Büro um 23 Uhr. Ein einziger, sehr weicher Kern hinter dem Blatt, alles andere fällt in Graphit ab. Wärme kommt ausschließlich aus dem Gold der Bemaßung und aus den Schnittflächen, die von innen minimal warm wirken.

MATERIALIEN: eloxiertes Aluminium (die Kanten), Graphitstaub, mattes Schwarz mit Blaustich, Messing für die Maßpfeile. Nichts Glänzendes, nichts Transparentes, nichts Weiches. Wenn man die Seite anfassen könnte, wäre sie kühl, leicht rau und würde beim Klicken hörbar einrasten.

## 13 · Unterseiten

- /karte — „BLATT 06 · VERMESSUNGSPLAN, MASSSTAB 1:∞". Randlos über die volle Blattfläche, ohne Container, ohne Kartenrahmen. Die Weltkontur als Höhenschichtenplan in --riss-tief, Gildenbasen als nummerierte Vermessungspunkte (Dreieck mit Positionsnummer, Basisname als waagerechte Beschriftung an einer Hinweislinie), Spieler als wandernde Fadenkreuze mit mitlaufender Koordinatenanzeige. Nordpfeil, Maßstabsleiste und Legende liegen am Blattrand wie in einer Katasterkarte. Die drei bestehenden Filter (Spieler / Basen / Namen) werden zu Zeichnungsebenen mit Sichtbarkeitsschaltern im Legendenfeld — inklusive der schon vorhandenen localStorage-Persistenz. Vier Reparaturen sind Pflicht: Marker werden klickbar und führen auf /spieler/<name>, Pinch-Zoom kommt dazu, touchAction wird auf pan-y statt none gesetzt (heute friert die Seite mobil ein, sobald man auf der Karte wischt), und die Kopfleiste mit Pos. 1 bleibt sichtbar. Der Ausricht-Modus ?align bleibt als internes Werkzeug erhalten und passt formal perfekt in diese Welt — er wird zum „Kalibrierblatt" mit eigenen Eingabefeldern.
- /spieler/<name> — „DATENBLATT". Ein echtes Prüf- und Datenblatt für ein einzelnes Bauteil: oben ein Kennwertfeld im Stücklistenformat (Level, Spielzeit, Sessions, erstes und letztes Mal gesehen, Tage online), rechts ein isometrisches Miniaturprofil. Die zurückgelegte Distanz wird als gezeichnete Weglinie über der Weltkontur dargestellt, die besuchten Gebiete als abgehakte Rasterzellen — beide Werte liegen bereits in der API und werden heute nur als Zahl ausgegeben. Die Erfolge werden zur Prüfliste: 26 Zeilen, jede mit Positionsnummer, gezeichnetem Glyph statt System-Emoji, Fortschrittsbalken als Maßstrecke mit Ist- und Sollmaß. Erfüllt = Vollinie in --prüf-grün, offen = Strichlinie. Widersprüchliche Fehlzustände werden korrigiert: „Spieler nicht gefunden" und „Server nicht erreichbar" sind zwei verschiedene Blätter mit zwei verschiedenen Überschriften. Dazu eine Teilen-Funktion, die ein eigenes OG-Datenblatt erzeugt.
- /impressum und /datenschutz — „BLATT 09 UND 10 · ANHANG ZUM SCHRIFTFELD". Rechtsseiten sind in einer Zeichnungswelt keine Randseiten, sondern Zeichnungsverwaltung — sie erben Kopfleiste, Blattnummer und Schriftfeld vollständig. Eine echte .prose-Komponente ersetzt die heute 17 beziehungsweise 6 Inline-styles, die dort die gesamte Typo-Hierarchie tragen und jede strenge CSP blockieren: hängende Gliederungsnummern in Plex Mono am linken Satzspiegelrand, Absatzmarken als 1-px-Maßhilfslinien in der Marginalie, maximal 68 Zeichen Zeilenlänge. Inhaltlich wird nachgezogen, was fehlt: Rechtsgrundlagen nach Art. 6 DSGVO, Betroffenenrechte samt Beschwerderecht, konkrete Speicherfristen statt „nach kurzer Zeit", der Spendendienst als Drittanbieter. Der Abschnitt „Externe Schriftarten" entfällt ersatzlos, weil beide Familien lokal ausgeliefert werden. Das noindex wird entfernt — ein vollständiges Impressum ist ein E-E-A-T-Signal, kein Makel.
- /404 — „BLATT NICHT IM SATZ". Die einzige erzählerische Idee des Bestands wird gerettet und übersetzt: Das ratlose Wesen, der Wegweiser mit Fragezeichen und die liegende Fang-Sphäre werden als isometrisches Linework neu gezeichnet, in --riss-cyan auf Graphit, mit derselben asymmetrischen Augenposition, die den ratlosen Blick erzeugt. Die Zeichenfläche bleibt leer, das Schriftfeld ist aber vollständig ausgefüllt — und über der leeren Fläche steht ein gezeichneter Stempel „BLATT NICHT IM SATZ", leicht schief gesetzt (2,5°, die einzige Stelle der ganzen Seite, an der ein Winkel von der Isometrie abweicht — weil ein Stempel von Hand aufgedrückt wird). Darunter das Blattregister mit drei aktiven Einträgen: Blatt 00 (Startseite), Blatt 06 (Karte), Blatt 10 (Discord). Die Kopfleiste mit Pos. 1 bleibt auch hier stehen — eine 404 ist kein Grund, die Adresse wegzunehmen.
- /admin und /broadcast — „WERKSTATTBLÄTTER, NICHT IM ÖFFENTLICHEN SATZ". Sie erben die Tokens, die Typografie und die Rastung, verzichten aber vollständig auf Isometrie, Animation und Graphitstaub: reine Tabellen, Formularfelder als bemaßte Eingabefelder, Statuszeilen im Messschrieb-Ton. Blattnummerierung im Format W-01 und W-02 statt 00–10, damit auf einen Blick klar ist, dass sie nicht Teil der veröffentlichten Zeichnung sind.

## 14 · Der Signature-Moment

DIE SCHNITTFAHRT. Auf Blatt 02 wird ein isometrischer Körper — die zusammengebaute Baugruppe aus Welt, Basis und Maschine — im Viewport festgehalten, und der Scroll treibt eine Schnittebene durch ihn hindurch. Am linken und rechten Blattrand steht das echte Schnittverlaufssymbol A–A mit seinen Blickrichtungspfeilen. Wo die Ebene durch ist, hört der Körper auf, geschlossen zu sein: Die Schnittfläche füllt sich mit 45°-Schraffur, eine 2-px-Cyan-Schnittkante mit weißer Lichtkante läuft exakt auf der Ebene mit, und dahinter werden die inneren Baugruppen sichtbar — jede mit ihrer Positionsnummer, jede Beschriftung erscheint genau in dem Moment, in dem die Ebene ihr Bauteil erreicht.

Das ist die These des ganzen Auftritts als körperliche Handlung: Um etwas zu verstehen, schneidet man es auf. Der Nutzer liest nicht, dass PalHeim offen ist — er schneidet es selbst auf und sieht hinein. Und weil dieselbe Ebene auch die Maschine öffnet, ist der Moment, in dem der Besucher „PvE, keine Wipes" versteht, derselbe Moment, in dem er in den Rechner schaut, der das trägt.

Technisch ist es eine registrierte Custom Property (@property --cut) auf einer view()-Timeline, die zwei geclippte Kopien desselben Körpers gegeneinander schiebt — plus ein Schieberegler, mit dem man die Ebene auch mit den Pfeiltasten von Hand fahren kann. Damit ist der spektakulärste Moment der Seite gleichzeitig der einzige, der vollständig tastaturbedienbar ist und bei prefers-reduced-motion in einem gültigen, halb geöffneten Zeichnungszustand stehen bleibt.

Sein stilles Gegenstück, an das man sich beim zweiten Besuch erinnert, sitzt auf Blatt 07: der freiwillige Kaffee, gezeichnet als Nachbarteil in Strich-Zweipunktlinie, Positionsnummer in Klammern, Bemerkung „gehört nicht zum Lieferumfang" — die ISO-Konvention für ein Teil, das zur Nachbarbaugruppe gehört und nicht mitgeliefert wird. Ein Fachwitz, der zugleich die präziseste Aussage über einen kostenlosen Server ist, die man treffen kann.

## 15 · Warum das nicht nach KI aussieht

WARUM ES EINZIGARTIG IST: Es gibt keinen zweiten Palworld-Server, der seine eigene Hardware zeichnet. Der zentrale Trick ist, dass Spielwelt und Maschine im GLEICHEN Zeichenstil erklärt werden — die Insel, eine Basis und der Rechner in Deutschland sind drei Baugruppen einer einzigen Explosionszeichnung. Damit wird die Kernaussage „eigene Hardware in Deutschland" aus einer Behauptung im Fließtext zu einer bemaßten Baugruppe, die man aufschneiden kann. Diese Verbindung ist nicht übertragbar: Ein gemieteter Server hat kein Blatt 07.

WARUM ES NICHT NACH KI AUSSIEHT — sieben überprüfbare Gründe:

1. FORMAT STATT LAYOUT. Ein Sprachmodell erzeugt Sektionen; hier gibt es Blätter eines nummerierten Zeichnungssatzes mit Blattregister, Maßstab, Änderungsindex und Schriftfeld. Kein Eyebrow, kein H2, kein Intro, kein Grid — das Muster, das die Bestandsanalyse achtmal in Folge auf der heutigen Seite gefunden hat, kommt kein einziges Mal vor.

2. ES GIBT KEIN HERO-BILD IM ÜBLICHEN SINN. Kein Foto rechts, kein Text links, keine Fantasy-Landschaft, kein Verlaufswort in der Headline. Das Hero ist eine technische Zeichnung, die sich selbst montiert und danach selbst bemaßt.

3. NORMEN STATT GESCHMACK. Fünf Linienarten nach ISO 128, Bemaßung nach DIN 406, Schriftfeld nach DIN 6771, Isometrie mit ausgeschriebener Projektionsformel. Das sind Regeln, die man nachrechnen kann. Generierte Designs haben Vorlieben, keine Normen — und sie kennen die Strich-Zweipunktlinie für Nachbarteile nicht.

4. DIE ZAHLEN SIND DIE HELDEN, NICHT DIE HEADLINE. Die größte Type der Seite ist mit bis zu 22 rem eine echte Live-Maßzahl aus /api/status — nicht das Wort „PalHeim". Die heutige Seite macht das exakt umgekehrt: Die Headline ist 4,8 rem, die größte Datenzahl 2,1 rem.

5. EINE ECHTE FOTOGRAFIE. Genau ein Bild auf der ganzen Seite: die reale Maschine auf Blatt 07. Ein einzelnes, dokumentarisches Foto in einer Welt aus Linien ist der stärkste Anti-KI-Beleg, den es gibt — und der einzige Bildtyp, den kein Modell erfinden kann.

6. EIGENE IKONOGRAFIE. Zwölf gezeichnete Glyphen auf einem 24-px-Raster mit einer Strichstärke ersetzen das geliehene Lucide-Clipboard und alle 25 System-Emoji. Emoji sind die deutlichste Signatur generierter Oberflächen; hier existiert nicht ein einziges.

7. DIE POINTE IST FACHLICH. Der freiwillige Kaffee ist auf Blatt 07 als Nachbarteil gezeichnet — Strich-Zweipunktlinie, Klammernummerierung, Vermerk „gehört nicht zum Lieferumfang". Das ist die ISO-Konvention für ein Teil, das zur Nachbarbaugruppe gehört und nicht mitgeliefert wird. Ein Modell kommt auf diesen Witz nicht, weil er Fachwissen und Haltung gleichzeitig braucht.

ABGRENZUNG ZU DEN VIER SCHWESTERKONZEPTEN: WERKRISS ist gezeichnet, nicht gefilmt (nicht NACHTLAGER). Es ist erklärend und statisch präzise, nicht echtzeitlich und blinkend (nicht LEITSTAND). Es projiziert die Welt in eine Zeichnung, statt in ihr zu navigieren (nicht DIE INSEL). Und es ist normiert und maschinell, nicht handgemacht und taktil (nicht FELDBUCH).

## 16 · Conversion-Hebel

- POS. 1 IST DER PRIMÄRKNOPF. Die Serveradresse ist im Hero das am stärksten bemaßte Bauteil des Blattes, und „kopieren" ist die Primärhandlung — nicht ein Sprunganker auf eine Sektion, die auf dem Desktop bei etwa 4.500 px und mobil erst nach acht bis neun Bildschirmhöhen beginnt. Damit rückt die eigentliche Konversion aus der Tertiärrolle in die erste Sekunde.
- DIE KOPFLEISTE TRÄGT DEN ANSCHLUSS DAUERHAFT. Adresse plus Kopierknopf bleiben ab Blatt 01 permanent in der 56-px-Kopfleiste sichtbar, und zwar auf allen Seiten — auch auf /karte und /spieler/<name>, die heute komplett CTA-frei sind und damit genau die Seiten, die Rückkehrer ansteuern, nicht konvertieren.
- ÜBERGABE AN DEN PC (POS. 1A). Auf Touch-Geräten ersetzt ein QR-Code den zweiten Kopierknopf. Das löst die reale Bruchstelle: Palworld wird am PC gespielt, die Seite wird am Handy gelesen — heute kopiert der Besucher die Adresse in die falsche Zwischenablage.
- BLATT 07 BEANTWORTET DEN HAKEN VOR DEM CTA. Die Kostenaufstellung mit Foto, Positionen, Trägern und der Maßkette auf 0,00 € steht bewusst VOR dem Anschlussplan. Der stärkste Satz der heutigen Seite („Serverkosten? Deckt zum Glück die Community") liegt aktuell in einem per Default versteckten Block — er wird hier zum eigenen Blatt.
- BLATT 04 HOLT DEN BEWEIS NACH VORN. Verfügbarkeit 24 h/7 d und die Ausfall-Chronik sind der stärkste Vertrauensbeweis, den ein privater Server hat, und stehen heute versteckt (uptimeWrap ist per Default hidden) bei etwa 2.800 bis 3.200 px. Als Messschrieb auf Blatt 04 kommen sie vor die Beitrittsanleitung.
- MONTAGEANLEITUNG ALS OVERLAY. Der Drei-Schritte-Block ist von jeder Seite über die View-Transitions-API als Overlay abrufbar, statt eine Scrollstrecke zu erzwingen. Die kritische Reibung wird zusätzlich ausgeräumt: eine klare Aussage zu Passwort (statt „falls aktiv" als Nebensatz) und ein ehrlicher Hinweis, dass der Dedicated Server die Steam-Version voraussetzt — die häufigste Enttäuschung und die häufigste Support-Frage.
- ÄNDERUNGSINDEX ALS WIEDERKEHRGRUND. Blatt 09 wird automatisch aus vorhandenen Daten gespeist (Versionswechsel, behobene Abweichungen, neue Rekorde) und markiert für Rückkehrer per Goldlinie, was seit dem letzten Besuch dazugekommen ist — der localStorage-Zeitstempel dafür existiert bereits in visits.js.
- DISCORD IST GENAU EIN ANSCHLUSS. Statt sechs Discord-Einstiegen gegenüber zwei Kopiermöglichkeiten gibt es einen einzigen, sichtbar sekundär gezeichneten Knoten auf Blatt 10 — die Leitungsstärke im Anschlussplan macht die Hierarchie ohne ein Wort klar. Parallel wird jeder Spielername zur Positionsnummer mit Deeplink auf sein Datenblatt, damit die Retention-Schleife innerhalb der Seite geschlossen bleibt statt nach außen zu leiten.

---

# Gegenrede

*Jedes Konzept wurde nach der Ausarbeitung von einer unabhängigen, bewusst
feindseligen Instanz zerlegt — Awwwards-Juror und Frontend-Architekt in
Personalunion. Diese Kritik steht hier ungefiltert, weil ein Konzept, das seine
eigenen Schwächen nicht mitliefert, keine Entscheidungsgrundlage ist.*

## Wo es doch nach KI riecht

Der Blaupausen-Look ist selbst ein Genre-Template. Fast-Schwarz + Cyan-Linien + 8-mm-Raster + Mono-Beschriftung + Koordinatenanzeige ist exakt der Default-Look, den Dev-Tool- und Agentur-Seiten 2024-2026 fahren (Basement-Studio-Kohorte, Railway/Resend/Vercel-Ship-Umfeld, die halbe "technical"-Ecke auf Awwwards). Es ist zugleich das, was ein gutes Sprachmodell ausgibt, wenn man ihm sagt "bitte nicht generisch": Grid, Mono, Fadenkreuz, Zahlen. Der Verbotskatalog des Briefs listet Linear/Vercel/Framer - dieses Konzept umgeht deren Layout, landet aber in deren Farb- und Textur-Nachbarschaft.

Drei Einzelelemente sind namentlich verbrannt: (1) Die "Zirkelspitze mit laufender Koordinatenanzeige" - Custom-Cursor mit Live-X/Y ist der meistkopierte Effekt dieser ganzen Kohorte, dazu ein a11y-Problem, sobald er den echten Cursor ersetzt. (2) Maus-Parallax +/-1,2 Grad auf drei Tiefen mit Faktor 0,4/0,8/1,4 - das ist der Standard-Snippet, wortwoertlich. (3) Explosionszeichnung, die sich beim Scrollen zusammensetzt - Apple-Hardware-Seite, danach jede Hardware-Startup-Site; als Idee nicht mehr eigen, nur noch in der Ausführung.

Der subtilere KI-Geruch sitzt im Konzepttext selbst, nicht im Design: Normzitate als Autoritaetstheater. ISO 128, DIN 406, DIN 6771, ISO 3098 - kein Besucher und kein Juror kann das am Rendering prüfen. Wenn die Zeichnung die Normen dann NICHT wirklich einhaelt (uneinheitliche Linienbreiten, falsche Pfeilspitzen, sich kreuzende Hinweislinien), kippt "Praezision als ueberpruefbare Behauptung" in eine nachweisbare Luege - und das ist schlimmer als jedes generische Template. Praezision muss sichtbar sein, nicht zitiert. Gleiches gilt für die Kontrastwerte auf zwei Nachkommastellen: ich habe sie nachgerechnet, sie stimmen auf +/-0,03 (riss-cyan 11,50 statt 11,53; mass-gold 9,86 statt 9,88; kreide-100 16,54 statt 16,58) - die Disziplin ist echt, aber die Nachkommastellen im Fliesstext lesen sich wie generierte Selbstvergewisserung.

Zwei weitere Verdachtsstellen: Die "Stückliste mit Positionen und Maßketten, die auf 0,00 Euro endet" ist strukturell eine Pricing-Tabelle im Laborkittel. Sobald sie als gerahmte Tabelle mit Zeilen und Mono-Font rendert, ist sie genau die verbotene austauschbare Pricing-Card. Und die Blattnummerierung 00/10 ist für sich genommen die 00-/01-/02-Kapitelnummerierung jeder zweiten dunklen Portfolio-Seite - hier zwar motiviert, aber nur, wenn die Blattnummern etwas Echtes bezeichnen.

## Überschneidung mit den Nachbarkonzepten

Die gefaehrlichste Ueberschneidung ist LEITSTAND, nicht WERKBANK. Beide sind dunkel, technisch, mono, praezisionsverliebt und beide verkaufen "Vertrauen durch Transparenz". Und WERKRISS greift in seiner eigenen Zielwirkung direkt in LEITSTANDs Kern: "17/32 als Maßkette über die ganze Blattbreite", der Änderungsindex, das "eigene Datenblatt". Das ist Instrumentierung, nicht Konstruktion. Die Trennlinie muss hart gezogen werden: LEITSTAND = GEGENWART (Werte aendern sich, während man hinsieht: FPS, Uptime-Kurve, Neustart-Countdown, Ausfallliste, Zeiger). WERKRISS = KONSTRUKTION (Geometrie, Vergangenheit, "so ist das gebaut"). Konkret heißt das: WERKRISS bekommt KEIN Live-Diagramm, KEINE FPS-Anzeige, KEINE 24h/7d-Verfügbarkeitskurve, KEINEN Countdown. Die komplette Zeitreihe aus /api/stats gehört LEITSTAND. WERKRISS darf Live-Zahlen nur als Maßrelation am Koerper zeigen - 17/32 ist eine Bemaßung des Bauteils "32 Plätze", nicht ein Messwert. Aggregate (Spielzeit gesamt, uniquePlayers, Peak) sind Stücklisten-Positionen, keine Telemetrie.

FELDBUCH teilt die Dokument-Metapher: Änderungsindex vs. Ausgabennummer, Schriftfeld vs. Stempel, Rasterpapier vs. Konstruktionsraster. Beide sind "eine Seite, die so tut, als wäre sie ein Papier-Artefakt". Die Trennung muss materiell sein: FELDBUCH = handgemacht, analog, warm, Textur, Unregelmaessigkeit, Rotation. WERKRISS = maschinell, vektoriell, kalt, NULL Textur. Praktische Regel: WERKRISS darf kein Grain-Overlay, keine Papierfaser, keine Handschrift, keine Tintenkante und keine einzige Linie ausserhalb der Achsen 30/150/90 Grad haben. Ein einziges Rausch-Overlay macht WERKRISS zum FELDBUCH bei Nacht.

DIE INSEL wird direkt angegriffen von Baugruppe [3], "die Inselwelt als isometrische Platte mit Höhenschichtlinien". Höhenschichtlinien sind Kartografie, und die Karte ist INSELs Rückgrat. Empfehlung: WERKRISS zeichnet keine erkennbare Geografie. Baugruppe [3] wird zur abstrakten Weltplatte - oder, besser, zur "Regelplatte": die Server-Raten (3x EP, 2x Fang, 2x Drop, 4 Basen) als bemaßte Parameter-Ebene statt als Landschaft. Und /karte bleibt Unterseite, taucht auf Blatt 00 höchstens als Verweis "siehe Blatt 07" auf.

NACHTLAGER ueberschneidet sich am wenigsten - aber Achtung: alle fünf Konzepte sind laut Brief dunkel. Dunkelheit ist damit kein Unterscheidungsmerkmal, sie ist die Grundbedingung. Was WERKRISS wirklich exklusiv hält, ist zweierlei, und nur das darf die Identitaet tragen: die durchgehaltene PROJEKTIONSACHSE (nichts frontal, alles isometrisch - kein anderes der vier Konzepte kann das kopieren, ohne WERKRISS zu werden) und die Regel CYAN IST LINIENFARBE, NIE FLAECHE. Diese zwei Gesetze sind der Marken-Kern; Raster, Mono und Blattnummern sind Beiwerk, das jeder haben kann.

## Machbarkeit auf der realen Infrastruktur

AUSLIEFERUNG: unkritisch. server.js muss nicht angefasst werden, nginx liefert statisch, es gibt keinen Build-Step (package.json kennt nur "start"). Das ist aber zugleich die Entscheidung: GSAP wäre ein ~70-KB-Fremdkoerper per Hand vendored in ein Zero-Dependency-Projekt, das genau davon lebt, dass ein Admin es allein versteht. Es wird nicht gebraucht. Alles im Konzept ist mit IntersectionObserver + CSS-Transitions + einem rAF-Scroll-Handler + SVG stroke-dasharray (Selbstzeichnen der Linie) machbar. Das Repo kann das bereits: map.js erzeugt SVG per createElementNS, main.js hat IntersectionObserver, style.css hat zwei prefers-reduced-motion-Bloecke. Empfehlung: kein GSAP.

DAS ECHTE RISIKO IST NICHT CODE, SONDERN ZEICHNUNG. Ein isometrischer Schnitt durch einen realen Rechner mit korrekten Linienbreiten, Schraffuren und kollisionsfreier Bemaßung ist zwei bis fünf Tage geuebte Vektorarbeit - und es ist das Hero. Ein Admin ohne Illustrator wird eine wacklige Zeichnung produzieren, und dann schlaegt "Praezision ist eine ueberpruefbare Behauptung" haerter zurück als jedes generische Template. Zwei gangbare Wege: (a) genau eine SVG beauftragen, (b) die Zeichnung parametrisch in JS aus einer JSON-Liste von Quadern/Kanten erzeugen - ein Iso-Projektor ist ~120 Zeilen. (b) ist konzepttreuer, garantiert geometrische Konsistenz, wiegt ~4 KB statt 200-400 KB (so groß wird ein unaufgeraeumter Illustrator-Export), und ist die einzige Variante, die Mobile ueberlebt (siehe unten).

FONTS: drei Familien sind zu viel. Archivo variabel (wght+wdth, latin) ~40-60 KB, Plex Sans variabel ~35 KB, Plex Mono als vier statische Schnitte 4 x ~25 KB = ~100 KB. Zusammen ~200 KB Schrift für eine Seite, deren heutiges schwerstes Asset ein 140-KB-Hero-Bild ist. Auf zwei Familien kürzen: Archivo traegt Display UND Fliesstext, Plex Mono in EINEM Schnitt (400, nicht 300 - 300er Haarlinien auf Fast-Schwarz blooming/verschwinden bei 11 px auf Mobile, dazu 0,14em Tracking). Das self-hosting ist richtig und löst verifiziert Abschnitt 5 der eigenen Datenschutzerklaerung (public/datenschutz.html Zeile 73-77 gibt IP-Uebertragung an Google zu; index.html Zeile 34 laedt Baloo 2 + Nunito extern).

FONT-VARIATION-ANIMATION: wdth 112 -> 125 auf einer clamp(4rem, ..., 11rem)-Headline erzwingt Layout + Neurasterung pro Frame. Auf Mittelklasse-Android ruckelt das und - schlimmer - es verschiebt während LCP das Hero-Layout. Regel: einmalige 700-ms-Transition, nur ab ~900 px, nur bei pointer:fine, NIE scroll-gescrubbt, und die Box der Endbreite reservieren, damit nichts umbricht.

HERO-TIMING IST EIN CWV-PROBLEM: 400 ms Raster + 620 ms Rahmen + 3 x 70 ms Rastung + Bemaßung + 700 ms Text ergibt 2,2-2,8 s, bevor die Headline steht. Wenn H1 oder SVG bis dahin auf opacity 0 stehen, ist LCP auf Mobil-4G jenseits von 2,5 s, bevor die Schrift ueberhaupt mitzaehlt. Heute ist die Seite quasi sofort lesbar. Nicht verhandelbar: Adressblock und H1 stehen ab Frame 1 im DOM und sichtbar (Maske/clip-path animieren, niemals opacity vom LCP-Element), und die Sequenz bricht bei jeder Eingabe (Scroll, Taste, Klick) sofort in den Endzustand.

PREFERS-REDUCED-MOTION: hier ist WERKRISS strukturell besser als alle vier anderen - der Endzustand einer Explosionszeichnung ist ein vollständiges, schönes, statisches Bild. Aber nur, wenn static-first gebaut wird. Bauregel: Blatt 00 muss als PNG-Screenshot ohne jede Animation vollständig funktionieren; die Animation ist Zugabe, nicht Traeger.

MOBILE IST DAS UNBEHANDELTE LOCH. Eine 30-Grad-Explosionszeichnung mit Maßhilfslinien, Hinweislinien und Positionsblasen ueberlebt 375 px nicht: Hinweislinien kreuzen sich, Maßzahlen kollidieren, die Zeichnung wird Brei. Es braucht eine EIGENE Mobilzeichnung: eine Spalte, drei Baugruppen als drei getrennte Blätter (00.1/00.2/00.3), maximal zwei Maße pro Gruppe, keine Hinweislinien (Beschriftung direkt unter dem Teil), Positionsblasen >=44 px Trefferflaeche. Mit parametrischer Erzeugung ist das billig, mit einer statischen SVG unmöglich - das allein entscheidet die Frage (a) vs. (b) oben.

KONKRETER UEBERLAUF: --fs-8 mit clamp(6rem, -1rem + 32vw, 22rem) ergibt bei 375 px Viewport max(96 px, 104 px) = 104 px. "17/32" in Plex Mono (Vorbreite ~0,6em) plus 0,14em Tracking sind ~5 x 0,74 x 104 = ~385 px - breiter als das häufigste Handy. Auf Mobile darf die XXL-Maßzahl nur "17" zeigen, oder der clamp-Minimalwert muss auf ~3,5rem.

TOKEN-FEHLER MIT FOLGEN: alle Kontraste sind gegen --graphit-900 #0B0E11 gerechnet, aber der Inhalt liegt auf der Zeichenflaeche --graphit-800 #12171C. Dort fällt --riss-tief von 3,30:1 auf 3,07:1 - eine Rundung vom Bruch der eigenen Regel entfernt, und die 24-%-Schraffur darueber liegt weit unter 3:1. Die Zusatzregel "nie unter 1,25 px" ist auf 1x-Displays nicht durchsetzbar (rendert als gedithertes 1 px). Fix: Vertrag von --riss-tief gegen #12171C definieren und aufhellen (Richtung #2A8496, ~4,0:1), verdeckte Kanten als Strichmuster des vollen Cyans mit reduzierter Deckkraft statt als eigener dunklerer Farbton.

WARTUNG: Der Änderungsindex funktioniert nur, wenn er gepflegt wird. Ein Admin laesst ihn in sechs Wochen verrotten, und ein veraltetes "letzte Änderung 03/2026" zerstoert genau die Glaubwuerdigkeit, auf der das Konzept steht. Entweder automatisch speisen (git log -> JSON beim Deploy, oder über den bestehenden /api/site-Mechanismus) oder streichen.

WERKSTATT-TON: unkritisch und behaltenswert. Drei Opus-Dateien a ~8 KB, default aus, localStorage. Der Schalter muss ein echtes <button> mit aria-pressed und in der Tab-Reihenfolge sein.

## Wirkung auf die Conversion

HILFT: Die Adresse als Pos. 1, als am stärksten bemaßtes Bauteil, sichtbar vor dem ersten Scroll - das ist besser als heute und die stärkste Einzelentscheidung des Konzepts. Und die 0,00-Euro-Maßkette als formale Antwort auf "kostenlos, wo ist der Haken?" ist das beste Vertrauensinstrument unter allen fünf Konzepten, weil es die Frage beantwortet, statt sie zu beschweigen.

SCHADET 1 - falsche Affordanz: Die Positionsblase als Kopierknopf ist klug gedacht und wird nicht erkannt. Eine eingekreiste "1" liest sich als Fussnotenzeichen, nicht als Schalter. Ein Nutzer, der die Adresse kopieren will, klickt auf die Adresse. Fix: der gezeichnete Rahmen um die Adresse IST das Klickziel (volle Breite, >=44 px), die Blase ist Dekoration, und auf der Hinweislinie steht in Mono "KOPIEREN". Nach Erfolg kippt die Maßzahl über dem Rahmen auf "KOPIERT" - diegetisch und unmissverstaendlich.

SCHADET 2 - das System hat kein Lautstaerke-Register: Eine technische Zeichnung flacht Hierarchie systematisch ab; alles ist eine 1-px-Linie. Es gibt in dieser Formensprache keinen lauten CTA. Discord droht als "Pos. 7" in einer Legende zu enden, optisch gleichwertig mit der Backup-Frequenz. Das ist der teuerste Fehler, den WERKRISS machen kann. In-System-Lösung: weil Cyan als reine Linienfarbe deklariert ist, wird die EINZIGE cyan gefuellte Flaeche der gesamten Seite automatisch das lauteste Element - ohne neue Farbe. Diese Ausnahme wird exklusiv für den Discord-Knopf reserviert, genau einmal, an genau einer Stelle. Regelbruch mit Begründung ist genau das, was eine Jury belohnt.

SCHADET 3 - Selbstwiderspruch im Timing: Die Zielwirkung behauptet "kopieren, bevor ueberhaupt gescrollt wurde", die Hero-Sequenz braucht aber 2,2-2,8 s Selbstzeichnung. Wer nach 3 s wegklickt, hat nie eine Adresse gesehen. Adresse und H1 müssen ab der ersten Frame stehen; die Zeichnung darf sich um sie herum aufbauen, nicht vor ihnen.

SCHADET 4 - Zielgruppen-Passung: Palworld ist ein buntes, albernes Kreaturen-Sammelspiel; die Zielgruppe sucht einen gemuetlichen deutschen PvE-Server. WERKRISS ist das kälteste der fünf Konzepte und am weitesten vom Ton des Spiels entfernt - keine Farbe, keine Pals, keine Menschen. Das reale Risiko ist nicht "haesslich", sondern "der Besucher erkennt in drei Sekunden nicht, dass es hier ueberhaupt um Palworld geht". Ausserdem heißt die Marke PalHEIM; ein CAD-Bildschirm ist das Gegenteil eines Heims. Das ist lösbar (siehe Schaerfungen), aber es muss bewusst geloest werden, nicht ignoriert.

SCHADET 5 - kein Begehren, nur Vertrauen: Das Konzept ist stolz auf "kein Verkaufsdruck an keiner Stelle". Der Preis dafuer: es gibt keinen einzigen Moment, der Lust macht zu spielen. Vertrauen konvertiert einen Skeptiker, Begehren konvertiert einen Vorbeischauenden - und die Mehrheit der Besucher ist Letzteres. Es braucht genau einen warmen Moment, und der einzige, den eine Zeichnung zulaesst, sind echte Namen: die 17 Leute, die JETZT online sind, mit Namen als Positionsnummern am Weltkoerper. Die Daten liegen bereits in /api/stats (Leaderboard) und /api/map (Spielerpositionen).

NEUTRAL, aber zu beobachten: Der Zeichenstil macht das Wiederkommen (Ziel 3) plausibel - Änderungsindex und das eigene "Datenblatt" sind gute Wiederkehr-Haken. Aber nur, wenn das Datenblatt unter /spieler/<name> tatsaechlich anders aussieht als LEITSTANDs Profilseite: als bemaßtes Einzelteil mit Stückliste, nicht als Dashboard mit Kacheln.

## Schwächen

- Der Grundlook (Fast-Schwarz + Cyan-Linien + Raster + Mono + Koordinaten) ist trotz Bauhuetten-Herleitung der Default-Look der aktuellen Dev-Tool-/Agentur-Kohorte und damit genau das, was ein Modell ausgibt, wenn man 'nicht generisch' fordert.
- Custom-Cursor als Zirkelspitze mit Live-Koordinaten und Maus-Parallax +/-1,2 Grad auf drei Tiefen (0,4/0,8/1,4) sind zwei fertig kopierte Standard-Snippets - und der Cursor-Ersatz ist zusätzlich ein Bedienbarkeitsrisiko.
- Normzitate (ISO 128, DIN 406, DIN 6771, ISO 3098) sind Autoritaetstheater: unpruefbar am Rendering, aber toedlich, wenn die Zeichnung sie faktisch verletzt - Praezision muss sichtbar sein, nicht behauptet.
- Die Kostenfrage als 'Stückliste mit Positionen und Maßkette auf 0,00 Euro' ist strukturell eine Pricing-Tabelle und fällt in genau das Verbot 'austauschbare Pricing-Cards', sobald sie als gerahmte Tabelle rendert.
- Maßive Ueberschneidung mit LEITSTAND: 17/32 als Hero-Maßzahl, Änderungsindex und Datenblatt sind Instrumentierung, nicht Konstruktion - beide Konzepte verkaufen 'Vertrauen durch Transparenz' mit denselben Live-Daten.
- Baugruppe [3] 'Inselwelt mit Höhenschichtlinien' ist Kartografie und greift damit direkt in DIE INSEL; die Dokument-Metapher (Änderungsindex, Schriftfeld, Rasterpapier) greift in FELDBUCH.
- Mobile ist im Konzept vollständig unbehandelt: eine 30-Grad-Explosionszeichnung mit Hinweislinien und Bemaßung ist bei 375 px nicht lesbar, und --fs-8 läuft dort rechnerisch mit ~385 px über den 375-px-Viewport.
- Hero-Sequenz von 2,2-2,8 s widerspricht der eigenen Zielwirkung ('kopieren, bevor gescrollt wurde') und gefaehrdet LCP auf Mobil-4G, wo die Seite heute praktisch sofort lesbar ist.
- Alle Kontraste sind gegen --graphit-900 gerechnet, der Inhalt liegt aber auf --graphit-800: --riss-tief fällt dort auf 3,07:1, die 24-%-Schraffur darueber weit darunter; die Regel 'nie unter 1,25 px' ist auf 1x-Displays nicht durchsetzbar.
- Drei Schriftfamilien (Archivo variabel + Plex Sans variabel + Plex Mono in vier statischen Schnitten, zusammen ~200 KB) sind für eine Zero-Dependency-Seite ohne Build-Step zu viel, und Plex Mono 300 mit 0,14em Tracking ist bei 11 px auf Dunkel nicht robust.
- Das Herzstueck ist Illustrationsarbeit, nicht Code: ein normgerechter isometrischer Schnitt durch einen realen Rechner ist mehrtaegige Vektorarbeit, die ein Admin allein nicht liefert - und eine wacklige Zeichnung widerlegt die Kernbehauptung des Konzepts.
- Der Änderungsindex ist ein Wartungsversprechen ohne Automatik; veraltet er, zerstoert er genau die Glaubwuerdigkeit, auf der das Konzept steht.
- Null Warme, null Menschen, null Pals: das kälteste der fünf Konzepte für eine Marke, die 'Heim' heißt, und für ein buntes Kreaturen-Sammelspiel - der Besucher erkennt womoeglich nicht, dass es um Palworld geht.
- Die Formensprache hat kein Lautstaerke-Register: in einer Zeichnung ist alles eine 1-px-Linie, weshalb Discord als CTA optisch mit der Backup-Frequenz gleichzieht.

## Schärfungen — verbindlich für die Umsetzung

1. Zwei Gesetze zur Marke erklären, alles andere als austauschbar behandeln: (1) durchgehaltene Projektionsachse - kein einziges Element frontal, alles 30/150/90 Grad; (2) Cyan ist Linie, nie Flaeche. Raster, Mono und Blattnummern sind Beiwerk, das jede andere Seite auch hat, und dürfen die Identitaet nicht tragen.
2. Die eine erlaubte Regelverletzung für Discord reservieren: weil Cyan nirgends flaechig vorkommt, ist die EINZIGE gefuellte Cyan-Flaeche der ganzen Seite automatisch das lauteste Element - genau einmal, genau am Discord-Knopf. Damit bekommt das System ein Lautstaerke-Register, ohne eine Farbe hinzuzufuegen.
3. Live-Telemetrie an LEITSTAND abtreten: kein Diagramm, keine FPS-Anzeige, keine 24h/7d-Kurve, kein Neustart-Countdown auf WERKRISS. Live-Zahlen erscheinen ausschließlich als Bemaßung am Koerper (17/32 bemaßt das Bauteil '32 Plätze'), Aggregate als Stücklisten-Positionen. WERKRISS spricht in Vergangenheit ('so gebaut'), LEITSTAND in Gegenwart ('läuft gerade').
4. Baugruppe [3] entkartografieren: keine erkennbare Insel, keine Höhenschichtlinien. Stattdessen die Regelplatte - 3x EP, 2x Fangrate, 2x Drop, 4 Basen/Gilde als bemaßte Parameter-Ebene. Die echte Karte bleibt Unterseite und wird auf Blatt 00 höchstens als Verweis gefuehrt.
5. Die Zeichnung parametrisch erzeugen statt als SVG-Export einzukaufen: ein Iso-Projektor von ~120 Zeilen JS uber einer JSON-Liste aus Quadern und Kanten (das Repo erzeugt in map.js bereits SVG per createElementNS). Das garantiert geometrische Konsistenz, wiegt ~4 KB statt 200-400 KB und ist die einzige Variante, aus der sich eine EIGENE Mobilzeichnung ableiten laesst: eine Spalte, drei getrennte Blätter 00.1/00.2/00.3, maximal zwei Maße pro Gruppe, keine Hinweislinien, Positionsblasen >=44 px.
6. Static-first bauen und die Sequenz abkuerzbar machen: Blatt 00 muss als Screenshot ohne jede Animation vollständig funktionieren. Adresse und H1 stehen ab Frame 1 sichtbar im DOM (Maske animieren, nie opacity am LCP-Element), jede Eingabe - Scroll, Taste, Klick - springt sofort in den Endzustand. Damit ist prefers-reduced-motion kein Sonderfall mehr, sondern der Normalfall mit weggelassener Zugabe.
7. Kopieren eindeutig machen: der gezeichnete Rahmen um pve.palheim.de:8211 ist das Klickziel über die volle Breite, die Positionsblase wird zur Dekoration, auf der Hinweislinie steht in Mono 'KOPIEREN'. Bei Erfolg kippt die Maßzahl über dem Rahmen auf 'KOPIERT' - diegetische Rückmeldung statt Toast.
8. Genau zwei warme Elemente einbauen, sonst nichts: (a) eine einzelne, selbst gezeichnete Pal-Silhouette als Nachbarteil in Strich-Zweipunktlinie neben der Basis - in-System, witzig, signalisiert in einer Sekunde 'Palworld', und markenrechtlich unbedenklich, weil selbst gezeichnete Umrisslinie; (b) die Namen der gerade Online-Spieler als Positionsnummern am Weltkoerper (Daten liegen in /api/map und /api/stats). Echte Namen sind die einzige Wärme, die eine technische Zeichnung zulaesst - und sie beantworten 'ist hier was los?'.
9. Token- und Schriftdisziplin nachziehen: Kontraste gegen die Zeichenflaeche --graphit-800 #12171C rechnen, nicht gegen --graphit-900; --riss-tief in Richtung #2A8496 (~4,0:1) aufhellen und verdeckte Kanten als Strichmuster des vollen Cyans mit reduzierter Deckkraft lösen statt als eigenen dunkleren Ton. Auf zwei Schriftfamilien kürzen (Archivo variabel für Display und Fliesstext, Plex Mono in EINEM Schnitt 400 statt 300), self-gehostet als woff2 - das halbiert die Schriftlast und erledigt zugleich Abschnitt 5 der Datenschutzerklaerung.
10. Den Änderungsindex automatisch speisen (git log oder /api/site beim Deploy) oder ersatzlos streichen; und die Normzitate aus allen sichtbaren Texten entfernen - die Praezision muss man an gleichmaessigen Linienbreiten, korrekten Pfeilspitzen und kollisionsfreien Maßketten sehen, nicht an einer DIN-Nummer lesen.

## Urteil

WERKRISS ist von den fünf das intellektuell sauberste Konzept und zugleich das mit dem größten Abstand zwischen Konzepttext und wahrscheinlichem Ergebnis. Die Grundidee ist echt: eine Website, die nicht behauptet, sondern zeichnet, ist die formal richtige Antwort auf die einzige Frage, die dieser Seite gestellt wird - 'kostenlos, wo ist der Haken?'. Die 0,00-Euro-Maßkette ist das beste Vertrauensinstrument im gesamten Feld, und die Kopplung 'Palworld ist ein Bauspiel, also wird der Server im Zeichenstil des Spiels erklärt' ist eine ableitbare Designentscheidung statt einer Stimmung. Auch operativ ist es das robusteste: der Endzustand einer Explosionszeichnung ist ein vollständiges statisches Bild, weshalb es prefers-reduced-motion, Screenshot, OG-Bild und Druck ohne Zweitentwurf ueberlebt - das kann NACHTLAGER nicht. Dagegen stehen vier harte Einwaende: der Grundlook ist die Farb- und Texturheimat genau der Kohorte, gegen die der Brief antritt; die Live-Daten-Ambition kollidiert frontal mit LEITSTAND und muss abgeruestet werden, bis WERKRISS nur noch bemaßt und nicht mehr misst; Mobile ist ungeloest und wird ohne parametrisch erzeugte Zeichnung nicht lösbar; und das Ganze ist eine Illustrationsaufgabe, die über Erfolg oder Peinlichkeit entscheidet - eine wacklige Zeichnung widerlegt die eigene Kernbehauptung lauter, als ein Template je könnte. Die kaufmaennische Bewertung: WERKRISS ist die richtige Wahl für einen Auftraggeber, der SELBST der Erbauer ist - technisch, stolz auf die eigene Hardware, allergisch gegen Marketing-Sprache, bereit, einmal Geld oder mehrere Tage in eine einzige exakte Zeichnung zu stecken, und einverstanden damit, dass die Seite mehr Respekt als Herzlichkeit erzeugt. Fuer einen Auftraggeber, der 'Heim' und Community betonen will, oder der Wartungsaufwand minimieren muss, ist es die falsche Wahl - dann NACHTLAGER oder FELDBUCH. Mit den zehn Schaerfungen, insbesondere der parametrischen Zeichnung, der Abtretung der Telemetrie an LEITSTAND, der einen gefuellten Cyan-Flaeche für Discord und der einen Pal-Silhouette als Nachbarteil, ist es awwwards-faehig; ohne sie wird es eine sehr schöne Zeichnung, die niemand kopiert - im doppelten Sinn.

---

## Eigene Risikoeinschätzung

- ZEICHENAUFWAND. Das ist das größte Risiko, und es ist ein Produktionsrisiko, kein Designrisiko: Echte Isometrie lässt sich nicht generieren, sie muss konstruiert werden. Realistisch sind das drei bis fünf Tage Illustrationsarbeit allein für Weltkörper, Basis, Maschinenschnitt und die zwölf Glyphen — plus Reinzeichnung als optimiertes SVG. Wer hier spart, bekommt schiefe Winkel, und schiefe Winkel zerstören das gesamte Versprechen des Konzepts. Gegenmaßnahme: die Zeichnungen in einem Isometrie-Raster (SVG mit 30°-Hilfsgitter) anlegen und die Winkel vor der Reinzeichnung automatisiert prüfen.
- SVG-PERFORMANCE. Höhenschichtlinien und Schraffuren erzeugen schnell mehrere hundert Pfade, und selbstzeichnende Linien auf allen davon sind ein sicherer Weg in Ruckler. Grenzen: maximal 400 Pfade pro Blatt, Schraffur ausschließlich als <pattern> (nicht als Einzellinien), keine SVG-Filter, keine Masken über bewegten Elementen, animiert wird nur transform, opacity und stroke-dashoffset. Der Graphitstaub-Canvas fällt bei hardwareConcurrency < 4 komplett weg.
- BROWSERUNTERSTÜTZUNG FÜR SCROLLGETRIEBENE ANIMATION. animation-timeline: view()/scroll() und registrierte @property laufen in Chromium und Safari, in Firefox erst spät beziehungsweise teilweise. Das Konzept braucht deshalb eine ehrliche Zweigleisigkeit: CSS-scrollgetrieben als Basis, und ein einziges, selbst gehostetes ES-Modul (Motion One, rund 18 KB, kein npm zur Laufzeit, kein Build) als Fallback, geladen nur wenn CSS.supports('animation-timeline: view()') false liefert. Der Brief nennt GSAP — GSAP plus ScrollTrigger kostet aber rund 70 KB und würde den heute exzellenten kritischen Pfad (8,0 KB HTML, 9,6 KB CSS, 12,4 KB JS gzip-simuliert) mehr als verdoppeln. Diese Entscheidung gehört ausdrücklich zum Konzept und muss mit dem Auftraggeber abgestimmt werden.
- REDUCED MOTION IST HIER EXISTENZIELL, NICHT KOSMETISCH. Der Zusammenbau IST das Konzept. Wenn er abgeschaltet wird, muss der Ruhezustand als FERTIGE Zeichnung lesbar sein — nicht als halb montiertes Fragment. Konkret heißt das: Für jedes animierte Element ist der Endzustand die CSS-Grundstellung, Animation setzt nur den Startzustand. Besonders heikel ist die Schnittfahrt, deren Ruhezustand bewusst bei 50 % Öffnung steht und über den Schieberegler weiterhin bedienbar bleibt. Die bestehende, vorbildliche prefers-reduced-motion-Abdeckung muss wachsen, nicht kopiert werden.
- KONTRASTFALLE DÜNNER LINIEN. --riss-tief liegt bei 3,30:1 und erfüllt die Grafikobjekt-Schwelle nur knapp; bei 1-px-Strichstärke und Subpixel-Antialiasing auf Nicht-Retina-Displays kann die effektive Deckkraft darunter fallen. Regel: keine Linie unter 1,25 px, --riss-tief nie als Text, alle Zeichnungsstriche mit vector-effect: non-scaling-stroke, und ein Kontrast-Testblatt als fester Bestandteil der Abnahme. Ergänzend braucht die dunkle Welt endlich definierte Fokuszustände — heute existieren in 1840 CSS-Zeilen genau fünf Fokusregeln, und das gesamte Button-System, alle Nav-Links und alle Kopier-Chips haben keinen.
- TONALITÄTSKONFLIKT MIT DEM NAMEN. Der Server heißt PalHeim — „Heim". Eine technische Zeichnung ist kühl, und Kühle kann als abweisend gelesen werden, gerade bei einer Zielgruppe, die eine entspannte Community sucht. Die Auflösung liegt nicht in der Form, sondern in der Sprache: Die Zeichnung ist präzise, die Texte darin sind persönlich, direkt und namentlich gezeichnet — vor allem auf Blatt 07, wo zum ersten Mal ein Mensch vorkommt. Wenn die Copy im gleichen kühlen Register geschrieben wird wie die Linien, kippt das Konzept.
- KITSCHGEFAHR BLAUPAUSE. Die Formensprache ist zwei Schritte von einem Klischee entfernt: Cyanotypie-Blau mit weißen Linien, geknittertes Papier, Kaffeeflecken, Nieten, Zahnräder, Steampunk. Jeder einzelne dieser Griffe würde die Seite in Sekunden nach Vorlage aussehen lassen. Die Palette ist deshalb bewusst Graphit statt Preußischblau, und die Don't-Liste in der Bildsprache ist als Abnahmekriterium zu behandeln, nicht als Empfehlung.
- WARTUNG UND DRIFT. Eine Zeichnung ist ein festes Asset — ändern sich die Raten, muss die Stückliste UND die Zeichnung nachgeführt werden. Gegenmaßnahme: Geometrie ist fest, jede Zahl und jede Beschriftung kommt aus dem DOM beziehungsweise der API, und keine Maßzahl steht im SVG. Zusätzlich muss vor der Umfärbung der bestehende Token-Drift bereinigt werden (Legende zeichnet Basen in #a85500, die Karte selbst in #c1770e; drei verschiedene Grüns für Erfolg; Fallback-Werte, die von ihren eigenen Tokens abweichen) — sonst wandert der Drift in die neue Palette mit.
- MOBILE ISOMETRIE. Eine Explosionszeichnung braucht Breite. Unter 480 px darf sie nicht skaliert, sondern muss ersetzt werden: Dort wird aus der Explosionszeichnung ein senkrechter Schnitt mit gestapelten Baugruppen, und aus der blattbreiten Maßkette eine senkrechte Bemaßung am linken Rand. Das ist ein eigener Entwurf, kein Breakpoint — Aufwand entsprechend einplanen. Der Bestand hat heute genau zwei echte Breakpoints und wurde bei 320 bis 360 px nie geprüft.
- MARKENLÜCKE. Das Konzept setzt ein Monogramm voraus, das bei 16 px Favicon, 32 px in der Kopfleiste und 400 px im Schriftfeld funktioniert. Das heutige Logo ist ein umgefärbter Pokeball und widerspricht dem eigenen Disclaimer im Footer. Diese Marke ist im Konzept angelegt (Buchstabenform in der Linienlogik der Zeichnung, abgeleitet aus dem Achsenkreuz), aber sie ist ein eigenständiges, nicht eingerechnetes Gewerk.
