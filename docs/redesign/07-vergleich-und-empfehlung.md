# Vergleich und Empfehlung

*Fünf Konzepte, eine Entscheidung. Dieses Dokument nimmt sie nicht ab, aber es
macht sie begründbar.*

---

## Die fünf auf einen Blick

| | **A · GLUTWACHE** | **B · FUNKFEUER** | **C · LANDFALL** | **D · KALTDRUCK** | **E · WERKRISS** |
|---|---|---|---|---|---|
| **Claim** | „Draußen wird es Nacht. Hier brennt Licht." | „Kein Prospekt. Ein Messschrieb." | „14,5 km Insel — einer der 32 Plätze ist deiner." | „Kein Prospekt, ein Logbuch." | „Gebaut, nicht gemietet." |
| **Register** | Emotion · Zuflucht | Kompetenz · Messung | Entdeckung · Ort | Handwerk · Akte | Ingenieurskunst |
| **Metapher** | Eine Nacht am Feuer | Ein laufendes Instrument | Ein Anflug auf eine Insel | Ein gedrucktes Protokoll | Eine Konstruktionszeichnung |
| **Grammatik** | Temperatur = Entfernung | Alles Gezeigte ist gemessen | Kalt = Welt, warm = Mensch | Keine Behauptung ohne Beleg | Cyan ist Linie, nie Fläche |
| **Zeitform** | Gegenwart, filmisch | Gegenwart, live | Gegenwart, räumlich | **Perfekt** — „so war es" | **Perfekt** — „so gebaut" |
| **Held der Seite** | Das Feuer + die Namen | Die Kurve | Die Insel + die Lichter | Die Ausgabe + der Stempel | Der Körper + die Maßkette |
| **Größte Stärke** | Es hat ein *Ende* (Sonnenaufgang) | Beweisbarkeit | Das ungenutzteste Asset wird Hauptdarsteller | Form deckt sich mit Geschäftsrealität | Die 0,00-€-Maßkette |
| **Größte Schwäche** | Hängt an der brüchigsten Datenquelle | Ist der KI-Default-Look | Seine Grundlage existiert nicht | Braucht Backend-Arbeit, bevor es ehrlich ist | Steht und fällt mit der Illustration |
| **Betriebskosten** | hoch | hoch | mittel | **am niedrigsten** | niedrig |
| **In 2 Jahren pflegbar?** | nur abgerüstet | nein (9 Einzelanfertigungen) | bedingt | **ja** | ja |

---

## Was die Gegenrede über das Feld herausgefunden hat

Jedes Konzept wurde von einer eigenen, bewusst feindseligen Instanz zerlegt. Vier
Befunde betreffen nicht ein Konzept, sondern die Auswahl:

**1 · Drei Konzepte haben um dieselben Elemente gestritten.** Live-Telemetrie,
Kartografie und Ausfallchroniken tauchten in vier von fünf Entwürfen auf. Die
Kritik hat sie zugeteilt, und diese Zuteilung ist verbindlich, egal wer gewinnt:

- **Live-Telemetrie** (Kurven, FPS, Countdown) gehört zu **B**. Wer B nicht baut,
  baut *keine* Kurven — er baut eine einzige ruhige Verfügbarkeitsdarstellung.
- **Echte Geografie** gehört auf `/karte`. Kein Hero der Startseite projiziert
  Weltkoordinaten.
- **Millimeterpapier und Bemaßung** gehören zu **E**.
- **Papier, Stempel, Ausgabennummer** gehören zu **D**.

Ohne diese Abgrenzung wären die fünf Konzepte drei.

**2 · Ein Konzept hat kein Fundament.** LANDFALL (C) setzt eine dunkle Insel mit
100-m-Höhenlinien als Hero voraus. Tatsächlich: `/api/map` liefert pro Spieler nur
`name`, `level`, `x`, `y` — **es gibt nirgends Höhendaten**, sie müssten erfunden
werden. Und das Kartenbild ist nicht Teil des Projekts: `.gitignore` listet
`public/assets/map.jpg|webp|png` ausdrücklich als *server-privat*, die README
nennt als Quelle die aus den Spieldaten extrahierte Kartentextur und schreibt
*„nicht ins Repo committen"*. Das ist Pocketpair-IP. Auf einer Unterseite ist das
eine Sache; vollflächig als Startseiten-Hero eines inoffiziellen Servers ist es
eine andere Rechtslage. C ist damit in der vorgelegten Form nicht baubar.

**3 · Ein Konzept sollte gewinnen, ohne zu gewinnen.** FUNKFEUER (B) hat die mit
Abstand beste Conversion-Analyse geliefert — das nachprüfbare 6:2-Verhältnis
zwischen Discord-Ankern und Kopier-Buttons, die CTA-freien Sackgassen `/karte`
und `/spieler`, der fehlende Crossplay-Hinweis, der gestaltete Nullfall. Diese
Hebel sind aber **ästhetikunabhängig** und gehören in jedes Konzept. Als
Gesamtauftritt ist B das riskanteste: Schwarz + Cyan + Monospace + Raster +
Cockpit ist ausgerechnet das, was ein Generativmodell ausgibt, wenn man ihm sagt
*„dunkel, technisch, bloß nicht generisch"*. Es entkommt dem SaaS-Klischee, indem
es ins Grafana-Klischee läuft — und es ist eine Palworld-Seite, die Palworld
verweigert.

**4 · Der Nullzustand ist nicht der Sonderfall, sondern der Regelfall.**
32 Slots, privater PvE-Server: Nachts und vormittags sind null Spieler online.
Jedes Konzept, dessen Sekunde-1-Wirkung an „da ist gerade jemand" hängt, zeigt an
einem Dienstagvormittag eine schwarze Fläche mit einer sehr großen Null. Der
Nullzustand ist deshalb **Hauptzustand und Pflichtlieferung**, nicht Fallback.

---

## Empfehlung

### Primär: **A · GLUTWACHE** — in der abgerüsteten Fassung

Vier Gründe, in dieser Reihenfolge:

**Es ist das einzige Konzept mit einer Markenidee statt einer Stimmung.**
PalHeim heißt Pal + **Heim**. Kein Pal-Server, kein Pal-Host — Heim. Die heutige
Seite hat dieses Wort nie ernst genommen; sie ist ein Schaufenster in Himmelblau,
und ein Schaufenster ist das Gegenteil eines Zuhauses. GLUTWACHE dreht das um:
Die Welt draußen ist groß und nachts kalt, und irgendwo darin brennt ein Feuer,
an dem jemand wach bleibt. Ein privater Server ohne Preisschild ist kein Produkt,
sondern eine Geste — die Seite muss sich wie diese Geste anfühlen. Aus dieser
einen Idee folgt alles Weitere, statt diskutiert werden zu müssen.

**Es hat als einziges eine ableitbare Farbgrammatik.** *Temperatur bedeutet
Entfernung.* Kühl (Türkis, Palblau, Mondlicht, Nebel) ist alles Ferne: die Welt,
die Daten, die Maschine. Warm (Glut, Gold, Morgen) ist alles Nahe: das Feuer, die
Namen, die Einladung. Damit ist jede künftige Farbentscheidung entscheidbar, ohne
den Designer zu fragen — ein sekundärer Button darf nie glutfarben sein, weil er
nicht die Einladung *ist*. Der Wunsch aus dem Briefing (Schwarz/Anthrazit + Cyan/
Türkis/Palworld-Blau + dezentes Gold) ist damit vollständig erfüllt, aber er ist
nicht mehr Dekoration, sondern Grammatik.

**Es hat als einziges ein Ende.** `--morgen`, das Sonnenaufgangslicht, existiert
nur im letzten Akt und fällt exakt mit dem finalen Beitritts-CTA zusammen. Auf
einer Seite, deren Ziel Zugehörigkeit statt Kauf ist, ist eine Dramaturgie mit
Auflösung mehr wert als jeder Partikeleffekt. Die anderen vier hören auf; dieses
endet.

**Es trifft die Zielgruppe im richtigen Reflex.** Ein 16- bis 40-Jähriger, der
abends auf der Serverliste stöbert, entscheidet in unter zwei Sekunden — und zwar
emotional. Ein Messschrieb, ein Aktendeckel und eine Konstruktionszeichnung
gewinnen den vorsichtigen Wiedereinsteiger mit Wipe-Trauma; ein Feuer im Dunkeln
gewinnt beide.

### Was dabei zwingend abgerüstet wird

Die Kritik hat GLUTWACHE genau eine Sache vorgeworfen: um die gute Idee herum
liegt eine Schicht austauschbarer Kinoware. Die wird gestrichen — sie kostet
gleichzeitig Distinktheit, Conversion und Betriebssicherheit:

| Was | Warum |
|---|---|
| **Tal entkarten** | Die Lichter werden *nicht* über `config.map.calibration` auf x/y projiziert, sondern nach Anzahl und Entfernung auf eine Silhouettenlinie verdichtet. Damit ist der Hero unabhängig von der Kalibrierung, klar abgegrenzt gegen C — und `/karte` bleibt der einzige Ort mit echter Geografie. |
| **Drei Hero-Zustände statt einem** | (a) Leute online, (b) niemand online — Gildenlichter bleiben an, weil Häuser nicht ausgehen, dazu *„Am vollsten ist es gegen 20 Uhr"* aus der 7-Tage-Reihe, (c) `/api/map` liefert `enabled:false` oder `bases:[]` → ein reines Sternen- und Feuerbild, das nicht kaputt aussieht, sondern anders komponiert ist. |
| **Kein Ton, keine Typewriter, kein Scroll-Stop** | Vier Inszenierungen arbeiten gegen die eine Handlung, die zählt. |
| **SVG-DOM statt Canvas für die Lichter** | Fokussierbar, mit `aria-label`, Tab-Reihenfolge nach Entfernung. Nebel und Partikel auf ein separates Canvas mit `pointer-events: none`. Damit ist die Kernerzählung auch per Tastatur und auf Touch erreichbar. |
| **Vier statt acht Parallax-Ebenen** | Mobile Realität. |
| **Das Monument bekommt eine Zahl mit Substanz** | Nicht `players.current` (eine 0 wird sonst zum 224-Pixel-Grabstein), sondern Gesamtspielzeit oder Spieler gesamt. Die aktuelle Zahl steht kleiner daneben mit dem Wort *„gerade"*. |
| **Drei Farb-Löcher schließen** | Der Fokusring ist auf warmen Flächen nicht sichtbar, die Linienfarbe liegt bei 1,25:1, der Primärbutton hat keine definierte Beschriftungsfarbe. Eine halbe Stunde Arbeit — ungeschlossen bringen sie genau die Improvisation zurück, die das Konzept dem Bestand vorwirft. |

### Was aus den anderen vier eingepflanzt wird

Das ist kein Kompromiss, sondern die Nutzung von vier bezahlten Analysen:

- **Aus D · KALTDRUCK — die Kostenaufstellung.** Statt eines Gags („UNBEZAHLT" in
  Rot) eine echte Aufstellung der realen Kosten (Strom, Hardware, Domain,
  Backups) mit der Schlusszeile **„Dein Anteil: 0,00 €"** in Gold, und dem
  Kaffee-Link direkt darunter als freiwilligem Beitrag zu einer *sichtbaren*
  Summe. Damit wird aus der verbotenen Pricing-Sektion echte Information — und
  die Spenden-CTA steht zum ersten Mal an einer logischen Stelle.
- **Aus B · FUNKFEUER — die Conversion-Reparaturen.** Adresse als primäre
  Handlung im ersten Frame; QR-Code als ehrlicher mobiler CTA; CTAs auf `/karte`
  und `/spieler`; der Crossplay-Hinweis (Steam-only) *bevor* jemand zehn Minuten
  investiert; der gestaltete Nullfall. Dazu die eine ruhige
  Verfügbarkeitsdarstellung: 168 Kerzen nebeneinander, zwei davon aus — ohne
  Achse, ohne Legende, ohne „99,4 %". Die Frage ist nicht *wie stabil*, sondern
  *wann war es dunkel*.
- **Aus E · WERKRISS — die Disziplin des Endzustands.** Jede Animation muss ein
  vollständiges, schönes Standbild als Endzustand haben. Was das erfüllt,
  überlebt `prefers-reduced-motion`, den Screenshot, das OG-Bild und den
  Ausdruck ohne Zweitentwurf.
- **Aus C · LANDFALL — nichts für die Startseite.** C wird zur Vorlage für den
  Relaunch von `/karte`: Dort ist Geografie legitim, dort liegt das Bild bereits,
  dort ist die Rechtslage die heutige.

### Die ehrliche Alternative: **D · KALTDRUCK**

Wenn die Priorität anders liegt, ist D die richtige Wahl — und zwar nicht als
Trostpreis:

> D wählen, wenn **Vertrauen wichtiger ist als Sofortwirkung** und wenn die Seite
> in zwei Jahren noch von einer Person gepflegt werden soll.

D ist das einzige Konzept, dessen *Form* mit der Geschäftsrealität übereinstimmt:
Wer beitritt, kauft nichts — er verschenkt Vertrauen, und Vertrauen entsteht
durch Aktenlage, nicht durch Werbung. Es kommt ohne GSAP, WebGL, Partikel und
Video aus (CSS plus ~200 Zeilen Vanilla-JS), und seine vierzehn Kontrastwerte
halten der Nachprüfung bis auf die zweite Stelle stand. Es gewinnt den
Familienvater mit Wipe-Trauma, nicht den Sechzehnjährigen im Scrollrausch.

**Bedingung:** D darf nicht gebaut werden, bevor zwei Backend-Punkte erledigt
sind — sonst lügen ausgerechnet die Elemente, die Ehrlichkeit behaupten:

1. Ein persistentes `data/outages.json` (append-only, unbegrenzte Historie) plus
   Klassifikation gegen das Neustartfenster. Ohne das druckt die „Störungsakte"
   den täglichen 03:00-Neustart sieben Mal als Ausfall.
2. Ein persistiertes `stats.epoch` mit echtem Startdatum als Quelle der
   Ausgabennummer. Bei sieben Tagen Retention ist sie sonst schlicht nicht
   berechenbar.

Beide Punkte sind unabhängig vom Design sinnvoll — eine echte Ausfallhistorie ist
für jeden der fünf Entwürfe das stärkste Vertrauensinstrument.

### Wovon ich abrate

- **C · LANDFALL** in der vorgelegten Form: kein Fundament (keine Höhendaten),
  IP-belastetes Kartenbild als Hero, und an einem Dienstagvormittag eine leere
  schwarze Fläche mit einer sehr großen Null. Als Vorlage für `/karte`
  ausgezeichnet.
- **B · FUNKFEUER** als Gesamtauftritt: zu kalt für einen Server, dessen
  eigentliches Produkt nette Leute sind — und ausgerechnet im Look, den der
  Briefing-Abschnitt „Vermeide jeden typischen KI-Webseitenstil" meint. Als
  Kapitel im Gewinner unverzichtbar.
- **E · WERKRISS**, *falls* keine geübte Vektorarbeit zur Verfügung steht. Ein
  isometrischer Schnitt mit korrekten Linienbreiten und kollisionsfreier
  Bemaßung sind zwei bis fünf Tage — und eine wacklige Zeichnung widerlegt die
  eigene Kernbehauptung „Präzision ist überprüfbar" lauter, als ein Template es
  je könnte. Mit parametrisch erzeugter Zeichnung (~120 Zeilen Iso-Projektor,
  ~4 KB statt 200–400 KB) ist es dagegen awwwards-fähig — und für einen
  Auftraggeber, der selbst der Erbauer ist und allergisch auf Marketingsprache
  reagiert, die stimmigste Wahl im Feld.

---

## Was in jedem Fall passiert

Diese Punkte sind vom Konzept unabhängig. Sie sind auch dann richtig, wenn keines
der fünf gewählt wird:

**Sofort, unabhängig vom Design** (zusammen unter einer Woche, mehr messbare
Ladezeit als jeder Framework-Umstieg zurückgeben könnte):

1. Schriften selbst hosten — löst Render-Blocker, DSGVO-Risiko und die
   typografische Beschränkung in einem Schritt.
2. ETag/`Last-Modified` plus Content-Hashes und `immutable` statt `max-age=3600`.
3. Security-Header nachrüsten — heute sind es exakt null.
4. Hero-Bild per `srcset`/AVIF (heute gehen 141 KB an jedes 390-px-Handy).
5. Tote Bild-Ebenen und das `IMAGE_CANDIDATES`-Probing entfernen — bis zu sieben
   unnötige 404-Requests, jeder mit 4,5 KB HTML-Body.
6. `scroll-padding-top` setzen, `100vh` → `svh`/`dvh`, `touchAction:'none'` auf
   der Karte reparieren.

**Vor der ersten Design-Iteration:** genau *einen* Mechanismus für Nav und Footer
(heute achtfach dupliziert). Sonst kostet jede Iteration acht Dateiänderungen.

**Inhaltlich, in jedem Konzept:**

- Verfügbarkeit und Ausfallhistorie in die erste Bildschirmhöhe.
- Der Nullzustand als Hauptzustand.
- Crossplay ehrlich beantworten (Steam-only).
- Autorschaft einführen — bei einem privaten Server ist die Person das Produkt.
- Sieben der neun FAQ-Einträge sichtbar streichen, im JSON-LD behalten.
- Emoji als Ikonografie ersetzen, inklusive der 25 Erfolgs-Emoji.
- Das Pokéball-Logo ersetzen — es widerspricht dem eigenen Disclaimer.

---

## Nächster Schritt

Sobald ein Konzept gewählt ist, entsteht daraus:

1. Ein vollständiges Designsystem (Farbtokens mit gemessenen Kontrastwerten,
   modulare Typoskala, 4/8-px-Raster, Fokus-Token, Motion-Rollen).
2. Eine Komponentenbibliothek — keine übernommenen Standardkomponenten.
3. Das Responsive-Konzept inklusive eigener Mobilkomposition, nicht nur
   Umbruchverhalten.
4. Alle Seitenlayouts: Startseite, `/karte`, `/spieler/<name>`, `/impressum`,
   `/datenschutz`, `/404` — die Rechtsseiten tragen heute ihre Typo-Hierarchie in
   Inline-Styles und brechen beim Relaunch als Erstes.
5. Die produktionsreife Umsetzung auf dem gewählten Pfad
   (siehe `00-briefing-abgleich.md` — Empfehlung: Next.js Static Export hinter
   dem bestehenden nginx, oder handgeschriebenes Vanilla, wenn maximale Ladezeit
   den Ausschlag gibt).
