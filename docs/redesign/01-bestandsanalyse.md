# Bestandsanalyse palheim.de

*Vollständige Bewertung des heutigen Auftritts — Art Direction, UX & Conversion,
Technik & Performance, Inhalt & Vertrauen.*

---

## Zur Methode

**Die Live-Seite war aus dieser Umgebung nicht erreichbar.** Die Netzwerk-Policy
dieses Containers hat den Verbindungsaufbau zu `palheim.de` abgelehnt (HTTP 403
auf den CONNECT-Tunnel, für `https://palheim.de/` und die HEAD-Anfrage
gleichermaßen). Analysiert wurde deshalb **der ausgelieferte Quellcode selbst** —
also dieses Repository, das die Seite ist: acht HTML-Dokumente, 1.840 Zeilen CSS,
sieben JavaScript-Dateien, `server.js`, die nginx- und systemd-Konfiguration und
alle Assets.

Für eine Design- und Codeanalyse ist das die belastbarere Grundlage: Jeder Befund
unten ist an Datei und Zeilennummer belegt und nicht aus einem Screenshot
geschätzt. Was diese Methode **nicht** liefert, ist die gemessene reale Ladezeit
unter Produktionsbedingungen und der visuelle Eindruck im Browser. Wo es darauf
ankommt, steht es ausdrücklich dabei.

---

## Kurzfassung

Der heutige Auftritt ist **handwerklich deutlich besser als sein Aussehen.**

Unter der Oberfläche steckt Arbeit, die man selten sieht: nachgerechnete
Kontrastwerte mit Begründungskommentaren im CSS, vollständige
`prefers-reduced-motion`-Abdeckung, ein per Tastatur bedienbares Diagramm mit
Live-Region für Screenreader, ein handgebautes SVG-Chart und eine handgebaute
Karte ohne eine einzige Bibliothek, Path-Traversal-Schutz, 301-Kanonisierung, ein
vollständiger JSON-LD-Graph und ein cookiefreier Besucherzähler. Der komplette
kritische Pfad liegt bei rund 30 KB gzip. Das ist eine bessere Ausgangslage für
einen Relaunch als 90 % aller Projekte, die mit einem Framework gestartet sind.

Das Problem liegt woanders — auf drei Ebenen:

1. **Die Seite sieht aus wie ein Casual-Mobile-Game, nicht wie Palworld.**
   Himmelblau, runde Kinderbuchschrift, Pillenbuttons mit 3D-Hartschatten,
   `border-radius: 20px` an vierzehn Komponenten. Freundlich, aber
   austauschbar — und weit weg von der Zielgruppe, die abends auf einem PC
   Survival spielt.
2. **Sie ist strukturell die kanonische generierte Landingpage.** Achtmal
   hintereinander dasselbe Rezept: Kicker → Überschrift → Intro → Kartenraster.
   Kein Bruch, kein Vollbildmoment, kein Rhythmuswechsel.
3. **Das wertvollste Kapital wird verschenkt.** Der Server besitzt Live-Daten,
   die kein Konkurrent kopieren kann — und stellt sie als zehn identische graue
   Kacheln dar, teilweise unterhalb von 3.000 Pixeln Scrolltiefe, teilweise per
   Default versteckt.

Punkt 3 ist der eigentliche Hebel. Punkt 1 und 2 sind Gestaltung; Punkt 3 ist
Substanz, die schon da ist.

---

## Was ist gut?

Ehrlich gut, nicht schöngeredet:

**Belegte Kontrast-Disziplin als Methode.** `--accent-text: #a85500`
(`style.css:19`) trägt den Kommentar *„Orange als TEXT — AA-konform auf
Weiß/Himmel"*; nachgerechnet ergibt das 5,30:1 auf Weiß. Die Behauptung stimmt.
`--chart-series: #0d9488` (Zeile 29–31) trägt *„gegen weiße Fläche validiert
(Kontrast + CVD)"*. Hier hat jemand geprüft statt geraten — das ist selten, und
in einer dunklen Welt wird diese Routine wichtiger, nicht unwichtiger.

**Das Diagramm ist echte Datenvisualisierung.** Zwei Metriken (Spieler/FPS), zwei
Zeiträume, ein Serien-Schlüssel im Tooltip (`style.css:690–698`), ein Crosshair
(667), Tabellenziffern — und `null`-Werte unterbrechen den Pfad, statt zu
interpolieren (`stats.js:333–344`). Fachlich korrekt und ehrlich: Wo der Server
weg war, ist die Linie weg.

**Barrierefreiheit über Branchenniveau.** Das Chart ist mit `tabindex="0"`,
beschreibendem `aria-label` und Pfeiltasten-Navigation bedienbar und meldet über
eine dynamisch erzeugte `sr-only`-Live-Region (`stats.js:400–403`), wo man sich
befindet. `prefers-reduced-motion` ist an drei Stellen abgedeckt
(`style.css:932–934`, `1606–1610`, `main.js:310`) — inklusive Abschalten von
`scroll-behavior: smooth`, was fast alle vergessen.

**Layoutverteidigung gegen echte Daten.** `setVersion()` (`main.js:42–54`)
zerlegt `v1.0.1.100619` in Version und Build und schaltet ab neun Zeichen auf
`.stat-card__value--fit` (`style.css:1723–1727`). Die 869-px-Media-Query trägt
einen Kommentar darüber, dass Media Queries die Scrollbar mitmessen, das Grid
aber nicht (`1570–1575`). Das schreibt man erst nach echtem Produktivbetrieb.

**Der geschichtete Bild-Fallback.** `.hero__scene` (`234–242`) stapelt eigenes
JPG → WebP → gezeichnetes SVG in einer einzigen `background`-Shorthand. Ohne JS,
ohne Abhängigkeit, und der Hero kann nie kaputt aussehen. *(Die Mechanik ist
klug; die geladenen Ebenen sind ein Performance-Problem — siehe unten.)*

**Empty States, die argumentieren.** *„Keine Ausfälle in den letzten 7 Tagen"*
(`stats.js:178–180`) macht aus einer leeren Liste ein Verkaufsargument.
`peakToday` schaltet den Hinweis auf *„heute noch niemand da"* (`100–106`). Die
Karte unterscheidet *„Alles ausgeblendet"* von *„Gerade nichts zu sehen"*
(`map.js:150–157`).

**Die 404-Seite ist das einzige Asset mit Autorschaft.** `404-scene.svg`, 119
Zeilen von Hand: ein ratloses Wesen, ein Wegweiser mit Fragezeichen, ein
umgefallener Zaun, eine liegende Fang-Sphäre. Sogar die Augen-Highlights sitzen
asymmetrisch (−20/−20 gegen 28/−20), um den ratlosen Blick zu erzeugen. Dazu die
Copy *„Selbst unser bester Späher findet hier nichts"* — der einzige Satz der
Seite mit einer eigenen Stimme.

**Der Zero-Dependency-Server.** `package.json` hat keinen `dependencies`-Block;
`server.js` braucht nur `http`, `fs`, `path`, `crypto`. Kein Supply-Chain-Risiko,
kein Build, Deploy = `git pull` + `systemctl restart`. Dazu die systemd-Härtung
(`NoNewPrivileges`, `ProtectSystem=strict`, `ReadOnlyPaths`, `PrivateTmp`).

**Faktentreue.** Adresse, Raten, Slots, Backups und Neustartzeit stimmen über
sichtbaren Text, JSON-LD und `llms.txt` exakt überein. Das ist die Basis jeder
Beweisführung — und selten.

**Der ehrlichste Satz der Seite** steht in der Support-Karte: *„Serverkosten?
Deckt zum Glück die Community. Wenn du magst, spendier dem Admin einen Kaffee —
freiwillig, ohne Extras."* Er beantwortet den Haken-Verdacht direkt. Er liegt in
einem Block, der per Default `hidden` ist.

---

## Was wirkt modern?

- Sticky Nav mit `backdrop-filter: blur(14px)` (`155–158`) — sauber umgesetzt.
- Fluide Typografie über `clamp()` an sechs Stellen (299, 312, 429, 1374, 1465, 1522).
- Scroll-Reveal über `IntersectionObserver` mit `unobserve` nach dem Auslösen
  (`main.js:319–331`) statt Scroll-Listener — richtig gebaut.
- `aspect-ratio` und `width: min(100%, 80vh, 860px)` auf der Karte (814–815) —
  sie füllt ihren Rahmen randlos und wird nie höher als der Viewport.
- Durchgängige `auto-fit`/`minmax`-Grids ohne Breakpoint-Kaskade.
- Custom Properties als Theming-Hook pro Server: JS setzt `--sc`/`--sc-deep`
  (`main.js:178`), CSS liest sie in Rand, Badge, Balken und Adressfeld aus. Ein
  funktionierender Multi-Brand-Mechanismus.
- CSS-Disziplin: 1.840 Zeilen, zweimal `!important`, zwei ID-Selektoren,
  durchgehend BEM-artige Namen. Praktisch kein Spezifitätskrieg.

---

## Was wirkt veraltet?

**Das Button-System ist 2014.** `box-shadow: 0 4px 0 #d06e0a` als 3D-Kante,
`hover: translateY(-2px) scale(1.02)`, `active: translateY(2px)` (`100–108`).
Zusammen mit `border-radius: 999px` an zwanzig Stellen liest sich die Seite als
Mobile-Gelegenheitsspiel.

**Verlaufstext auf Fotohintergrund.** `.text-gradient` (`318–325`) plus zwei
gestapelte `drop-shadow()`-Filter. Gemessen: `#ffe378` auf dem Himmel = 2,27:1,
`#ffa63a` auf heller Wiese = 1,02:1. Der Markenname ist auf dem eigenen Hero
faktisch unlesbar.

**Der Hero hat keinen Scrim.** Die einzige Abdunklung ist ein 90-px-Fade am
unteren Rand (`245–254`). Aus `hero.webp` gemessen: hinter dem H1-Band liegt eine
Durchschnittsfarbe von `#a8c5d4`, weißer Text darauf ergibt **1,81:1**; hinter
dem Badge `#9bc8f2` und 1,76:1. WCAG verlangt für Großtext 3:1. Der `text-shadow`
ist ein Pflaster.

**Google Fonts per Remote-Link auf allen acht Seiten.** Zwei Fremdverbindungen
vor dem ersten Pixel — und die eigene Datenschutzerklärung thematisiert das unter
Punkt 5 selbst (`datenschutz.html:73`). Nach LG München I (3 O 17493/20) ist das
ein vermeidbares Risiko. Selbst hosten löst Recht, Performance und typografische
Freiheit in einem Schritt.

**Kein `scroll-padding-top` bei 68 px stickyer Nav.** Jeder der acht
Ankersprünge landet 68 px zu hoch; Kicker und halbe Überschrift verschwinden
unter der Navigation.

**`100vh` statt `svh`/`dvh`** (`42`, `219`) — auf iOS schiebt die URL-Leiste den
Adress-Chip unter die Falz.

**Die Karte ist Desktop-only.** `map.js` hat einen `wheel`-Listener, aber keinen
Pinch-Handler, und die Einleitung sagt wörtlich *„Mausrad zum Zoomen"*. Schlimmer:
`svg.style.touchAction = 'none'` (`map.js:177`) blockiert auf dem gesamten
Kartenblock das Scrollen — wer mobil auf der Karte wischt, hält die Seite für
eingefroren.

**Uptime misst die falsche Größe.** Die Kachel *„Uptime seit letztem Neustart"*
widerspricht der eigenen Routine *„Neustarts täglich 03:00 Uhr"*: Sie zeigt fast
immer unter 24 Stunden und lässt den Server instabiler aussehen, als er ist. Die
richtige Kennzahl — Verfügbarkeit in Prozent — wird bereits berechnet
(`server.js:666`) und ist per Default versteckt.

**Keinerlei Validierungs-Caching und keine Security-Header.** `serveStatic`
(`server.js:1053–1078`) liest bei jedem Request die ganze Datei und sendet weder
ETag noch `Last-Modified` — es gibt keine 304-Antworten. `Cache-Control:
max-age=3600` bei unversionierten Dateinamen. Ein repoweiter Grep nach
`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
`Strict-Transport-Security` und `Permissions-Policy` über alle `.js`, `.conf` und
`.sh` liefert **null Treffer**. Weder Node noch nginx setzen irgendetwas. HTTP/2
ist ebenfalls nirgends aktiviert.

**Der Fallback-Trick lädt alles.** Der Browser lädt jede Ebene des
`background`-Stapels. Auf der Startseite bedeutet das einen 404 für
`/assets/hero.jpg` — auf den der Server 4,5 KB HTML antwortet — plus 5,7 KB
`hero-scene.svg`, das unsichtbar unter dem WebP liegt. Auf `/karte` probiert
`map.js` drei nicht existierende Bildpfade durch, auf der 404-Seite sind es
weitere drei. Dazu `hero-alt.webp` (212 KB), im gesamten Repo nicht referenziert.

**Achtfach duplizierte Nav und Footer, dreifach duplizierter Mobile-Toggle,
Inline-Styles auf den Rechtsseiten** (`datenschutz.html` 17×, `impressum.html`
6×). Eine Nav-Änderung kostet heute acht Dateiänderungen — und die Inline-Styles
blockieren jede strenge CSP.

---

## Welche Bereiche sind langweilig?

**Ein Rezept, achtmal.** `container 1120px` → Kicker → Überschrift → Intro →
`auto-fit`-Kartenraster. Durch Status, Statistiken, Raten, Mitspielen, Über,
Regeln, FAQ und Vote. Nichts ist full-bleed, nichts überlappt, nichts ist
asymmetrisch. Der gesamte Inhalt lebt in einer 1120-px-Spalte zwischen zwei
identischen 96-px-Rinnen.

**Eine Karte für alles.** Fläche + 1 px Rand + 20 px Radius + `--shadow-soft` +
`hover: translateY(-4px)`. Verwendet von `.stat-card`, `.rate-card`, `.step`,
`.rules li`, `.faq__item`, `.chart-card`, `.map-card`, `.uptime__card`,
`.ach-card`, `.vote-card`, `.support-card`, `.leaderboard__table`,
`.server-card` und `.bc-card`. **Vierzehn Komponenten, ein Aussehen.**
`--shadow-soft` allein taucht 19-mal auf und ist damit die komplette Z-Achse der
Seite.

**Zehn identische Kacheln in Folge.** Fünf im Live-Status, direkt gefolgt von
fünf in den Statistiken. *„Rekord"* und *„Server-FPS"* sehen exakt gleich wichtig
aus. Der Aha-Moment „hier laufen echte Live-Daten" verpufft, weil es wie ein
Dashboard-Template aussieht.

**Flache Hierarchie nach dem Hero.** `.stat-card__value` = 2,1 rem,
`.rate-card__value` = 2,3 rem, `.section__title` clampt bei 2,7 rem. Drei Ebenen
innerhalb von 0,6 rem. Das größte Element unterhalb des Heros ist 43 Pixel groß —
es gibt nach dem Hero keinen einzigen visuellen Höhepunkt mehr.

**Ein einziges Bewegungsvokabular.** `.reveal` = `opacity 0→1` plus
`translateY(24px)`, 0,6 s ease. Vierzehn Elemente bewegen sich exakt gleich —
eine Zahl wie ein Absatz.

**Der Sektionswechsel ist eine Flächenfarbe.** `.section--alt { background:
#ffffff }` gegen `--bg: #eaf6fe`, bei durchgehend 96 px Padding. Der älteste
Gliederungstrick überhaupt, und das einzige Rhythmusmittel der Seite.

**Tote Zone vor der Kernaktion.** Der Block `#server` ist rund 850 px (Desktop)
bzw. 1.600 px (mobil) reiner Text ohne eine einzige Interaktion — direkt vor der
Beitritts-Anleitung.

**Rechnerisch kaputte Raster.** Bei 1.072 px Inhaltsbreite passen in
`repeat(auto-fit, minmax(220px, 1fr))` genau vier Spalten. Beide Fünfer-Grids
(`#status`, `#statistiken`) brechen als 4+1 mit drei leeren Zellen um, das
Profil-Grid mit sieben Kacheln als 4+3. Für den `info-strip` wurde genau dieses
Problem per Media Query gelöst (1573–1576) — für die Statuskacheln nicht.

**Der stärkste Social Proof steht am unsichtbarsten Ort.** Der Besucherzähler
liegt mit einem Augen-Emoji im Footer.

---

## Welche Bereiche erinnern an typische KI-Webseiten?

Das ist der unangenehmste Teil der Analyse, deshalb im Detail.

**Der Hero ist Stück für Stück das Starterkit.** Badge mit pulsierendem Punkt →
H1 mit *einem* verlaufsgefärbten Wort → Subline → zwei Buttons als
Primary/Ghost-Paar → Copy-Chip → Scroll-Pfeil. `.hero__badge` + `.pulse-dot` +
`.text-gradient` + `.btn--accent`/`.btn--ghost` ist exakt die Kombination, die
jedes Modell ausgibt.

**Das Kicker → H2 → Lead → Grid-Muster achtmal in Folge** ist wörtlich die
Struktur, die ein Sprachmodell für eine Landingpage produziert. Die Kicker selbst
sind die Template-Signatur: *„Live"*, *„Zahlen & Fakten"*, *„Einstellungen"*,
*„Anleitung"*, *„Über uns"*, *„Fair Play"*, *„Hilfe"*.

**Das einzige gezeichnete UI-Icon der Seite ist ein Fremdset-Standard.** Das
Kopieren-Symbol (`index.html:226–229`) ist Pixel für Pixel das Lucide/Feather-Glyph
`copy` — `rect x=9 y=9 width=12 height=12 rx=2` plus der versetzte Pfad.

**Die 3-Schritte-Anleitung mit Verlaufskreisen** (`.step__num`, 46 px,
`linear-gradient`) ist die meistgenerierte Komponente des Internets. Direkt
gefolgt von neun `<details>`-Elementen mit einem Plus, das sich beim Öffnen um
45 Grad dreht.

**Die Copy hat den Modell-Rhythmus.** *„Faire Raten, entspannte Community und ein
Server, der einfach läuft"* / *„Ohne Wipes, ohne Mods, ohne Stress"* — Trikolon
plus Anapher, fünf Behauptungen, null Zahlen. *„Serverkosten? Deckt zum Glück die
Community."* — die rhetorische Ein-Wort-Frage mit nachgeschobener Antwort. Und
der Satz *„schneller als Vanilla, aber ohne dass der Fortschritt langweilig wird"*
steht dreimal nahezu identisch auf derselben Seite: im JSON-LD (114), in der
Sektions-Intro (427) und in der FAQ-Antwort (643–644).

**Die Ratenkarten sind zu symmetrisch für Menschen.** *„Schnelleres Leveln für
dich und deine Pals."* / *„Bessere Chancen beim Fangen von Pals."* / *„Mehr
Materialien von Gegnern und Ressourcen."* — gleiche Länge, gleicher Bau, gleiche
Kadenz. So schreibt niemand spontan.

**Die Hero-Bilder sind zwei Würfe desselben Prompts.** `hero.webp` und
`hero-alt.webp`: Genshin-/BotW-Wiese, Kumuluswolken, Steinbogen mit Wasserfall,
dünner Turm am Horizont. Beide enthalten **keinen Pal, keinen Spieler, keine
Basis** — nichts, was mit *diesem* Server zu tun hätte. Der CSS-Kommentar in
Zeile 230 nennt es sogar selbst *„das KI-generierte Landschafts-Artwork"*.

**Das Logo ist ein umgefärbter Pokéball.** `favicon.svg`, sieben Zeilen: Kreis,
horizontale Teilung, innerer Kreis, Punkt, `#2f9de4` statt Rot. Das ist keine
Marke für „PalHeim", sondern eine Marke für „Monsterfang-Spiel, allgemein" — ohne
Buchstabenbezug, ohne Bezug zu *Heim*, und ausgerechnet das Element, das dem
Haftungsausschluss im Footer am stärksten widerspricht. Die Wortmarke
`Pal<em>Heim</em>` ist eine Zweifarb-Trennung eines Kompositums in einer Schrift —
und die Zweitfarbe fällt messbar durch: `#2f9de4` auf weißer Nav = **2,97:1**.
Die Hälfte des eigenen Markennamens erreicht nicht einmal 3:1.

**Emoji als Designsystem.** Kaffeetasse in einem 58-px-Verlaufskreis,
Augenpaar im Besucherzähler, Deutschlandflagge im Info-Strip, grüner Haken-Kreis
vor den Regeln — und **alle 25 Erfolge** in `lib/achievements.js:55–120` sind
System-Emoji. Ausgerechnet die emotionalste Oberfläche der Seite (Kronen,
Diamanten, Medaillen) rendert auf Windows und Mac völlig verschieden.

**Ein FAQ, das beantwortet, was 200 Pixel weiter oben steht.** Fünf der neun
Einträge (Adresse, Raten, PvE/PvP, Wipes, Backups) sind reine Wiederholung.

**Und der Kern:** Nichts an der Copy verrät, wer spricht. Kein Name, keine
Person, keine Geschichte, kein Datum. Tauscht man „PalHeim" und die Adresse aus,
gilt der Text für jeden beliebigen Server. Genau das ist das Kernmerkmal
generierter Seiten — und der teuerste Befund dieser Analyse, weil bei einem
privaten Gratis-Server **die Person das Produkt ist.**

---

## Was sollte komplett entfernt werden?

**Marke und Optik**

1. Das Pokéball-Logo — `favicon.svg` und alle acht Inline-Kopien.
2. `.text-gradient` und `.notfound__code`: Verlaufstext ganz raus.
3. Das Hartschatten-Button-System und `border-radius: 999px` als Reflex.
   Pillenform höchstens noch als Sonderfall.
4. Alle acht `.section__label`-Kicker samt Behandlung. Ersatz darf kein kleines
   orangefarbenes Versalienwort über einer Überschrift sein.
5. Die Wolken-Ellipsen im CTA-Band und der Scroll-Pfeil mit `bob`-Animation.
6. Die Haken-Kreise vor den Regeln. **Regeln sind keine Features.**
7. `.section--alt` als Weiß/Hellblau-Wechsel und `padding: 96px 0` als einziges
   Rhythmusmittel.
8. `--radius: 20px` als universelle Konstante und die eine geteilte Kartenoptik
   für vierzehn Komponenten.
9. `hero.webp`, `hero-alt.webp` und `hero-scene.svg` **als Motive** — die
   Fallback-*Mechanik* bleibt.
10. Emoji als Ikonografie, inklusive der 25 Erfolgs-Emoji.
11. Das Lucide-Clipboard-SVG.

**Struktur und Inhalt**

12. Sieben der neun FAQ-Einträge sichtbar streichen — im JSON-LD vollständig
    behalten und dort sogar erweitern. Maschinenlesbare Redundanz kostet nichts,
    sichtbare kostet Scrolltiefe und Glaubwürdigkeit.
13. Die Sektion `#ueber` komplett: alle drei Absätze wiederholen Hero,
    Ratenkacheln und FAQ. Die einzigen neuen Elemente sind zwei interne Links.
14. Die H1 *„Willkommen bei PalHeim"* — ersatzlos. Die Marke steht in Nav, Title
    und Logo; die H1 gehört der Aussage, nicht der Begrüßung.
15. Das Erfolge-Formular auf der Startseite: Es dupliziert `/spieler/<name>` und
    verlangt Abtippen, obwohl direkt darüber klickbare Namen stehen.
16. Die Kachel *„Version"* (für 95 % der Besucher bedeutungslos) und
    *„Uptime seit letztem Neustart"* (misst die falsche Größe).
17. *„Das Server-Passwort (falls aktiv) bekommst du auf unserem Discord."* —
    „falls aktiv" ist eine Vertrauensbremse an der kritischsten Stelle des
    Beitritts. Entweder klar *kein Passwort nötig* oder klar *Passwort im Discord*.
18. Die Vote-Sektion in der heutigen Formulierung: Im Standardmodus `announce`
    ist die „Belohnung" nur eine Chat-Danksagung (`README.md:511–513`). Eine
    Belohnung zu versprechen, die keine ist, beschädigt genau das Vertrauen, das
    die Seite aufbauen soll.

**Technik**

19. Alle acht Google-Fonts-`<link>`-Tags → selbst hosten.
20. Die toten Bild-Ebenen und das `IMAGE_CANDIDATES`-Probing — zusammen bis zu
    sieben unnötige 404-Requests, jeder mit 4,5 KB HTML-Body.
21. `hero-alt.webp` (212 KB, unreferenziert) aus dem Deploy.
22. Der achtfach duplizierte Nav-/Footer-Block und die Inline-Styles der
    Rechtsseiten.
23. `outline: none` ohne gleichwertigen Ersatz (`1212`).

---

## Was sollte erhalten bleiben?

**Rechtlich zwingend**

- Impressum vollständig inkl. Verantwortlichem nach § 18 Abs. 2 MStV. § 5 DDG
  greift, sobald ein Spendenlink aktiv ist — die Bezeichnung im Dokument ist
  aktuell und korrekt (DDG hat das TMG 2024 abgelöst).
- Der Marken-Disclaimer *„PalHeim ist ein inoffizieller Community-Server.
  Palworld ist eine Marke von Pocketpair, Inc."* — im dunklen Redesign **lesbar**
  halten, nicht in 10-px-Grau versenken.
- Alle Datenschutz-Kapitel: Server-Logs, Cookie-Freiheit, Besucherzähler inkl.
  localStorage-Marker, Google Fonts (solange remote), Spielernamen/Statistiken
  inkl. Opt-out.

**Funktional und inhaltlich**

- Alle sechs API-Endpunkte und ihre Datenstruktur — das ist das Kapital.
- Die Serveradresse als **echter Text im HTML** plus Kopier-Interaktion.
- Die drei Beitrittsschritte und die Regel-Liste (Grundlage jeder Moderation).
- Die vollständige Statistik-Semantik inkl. Verfügbarkeit und Ausfallliste.
- Die 26 Erfolge mit echtem Fortschrittsbalken — der stärkste
  Wiederkehr-Mechanismus im Bestand, nur falsch platziert.
- Klickbare Spielernamen überall als Einstieg in die Profile.
- Der Banner-Slot für Wartung/Event und der Satz *„freiwillig, ohne Extras"*.

**Handwerk, das man nicht neu erfinden muss**

- Die Kontrast-Prüfroutine als Methode, inklusive der Trennung von Flächen- und
  Textfarbe. In der dunklen Palette wird sie noch wichtiger: Cyan als Fläche
  funktioniert, Cyan als Fließtext nie.
- `font-variant-numeric: tabular-nums` an allen Zahlenkolonnen.
- Die vollständige `prefers-reduced-motion`-Abdeckung — mit Parallax und
  Partikeln wird sie Pflicht; die Gewohnheit ist schon da.
- Die Tastaturbedienung des Charts samt Live-Region.
- Die Datenlogik von `stats.js` und `map.js` (Serien-Aggregation, Kalibrierung,
  Viewport-Berechnung) — nur das Rendering-Ende austauschen.
- Die `data-*`-Binding-Konvention (`data-stat`, `data-stats`, `data-copy`). Sie
  ist die Brücke, auf der ein Redesign das gesamte Markup ersetzen kann, **ohne
  einen einzigen Fetch anzufassen.**
- Die Polling-Intervalle 30 s / 30 s / 300 s — richtig austariert, kein Grund für
  WebSockets bei 32 Slots.
- Der geschichtete Bild-Fallback als *Mechanik*, die Erzählidee der 404-Szene,
  die Favicon-Mechanik (422 Bytes SVG + `theme-color`).
- `server.js` insgesamt: Routing, Kanonisierung, Traversal-Schutz, alle APIs.
  **Ein Redesign sollte nur `public/` anfassen.**
- Der komplette Verzicht auf Frameworks — kein Tailwind-, Bootstrap- oder
  shadcn-Fingerabdruck. Bessere Ausgangslage für eine eigene Formensprache als
  jedes Utility-Projekt.

---

## Größtes Verbesserungspotenzial

Priorisiert nach Hebel pro Aufwand.

### 1. Die Beweise aus dem Keller holen

Verfügbarkeit 24 h/7 d, die Ausfall-Chronik mit Minutenangaben, der Rekord mit
Datum und das Alter der Welt sind der stärkste Vertrauensbeweis, den ein
Community-Server überhaupt haben kann — und `uptimeWrap` ist per Default
`hidden`, der Rest liegt bei 2.800–3.200 px. Das gehört in die erste
Bildschirmhöhe. Der Grund ist ökonomisch: Wer beitritt, zahlt nicht mit Geld,
sondern mit Spielzeit, und Spielzeit gibt es nicht zurück. Die einzige Frage, die
zählt, lautet *„Steht meine Basis in einem halben Jahr noch?"*

### 2. Die Zahlen zum Helden machen

Heute ist die Hero-Headline (4,8 rem) größer als jede Zahl auf der Seite
(2,1 rem). In einer Bungie-/Tarkov-Sprache wären die **Zahlen** der Held: `17/32`
als 300-Pixel-Typomoment, 168 Stunden Verfügbarkeit als Lichtband, der Rekord als
Monument. Das ist derselbe Inhalt, dieselben APIs — nur mit umgekehrter
Gewichtung.

### 3. Den Null-Fall gestalten

Bei null Spielern zeigt die Seite heute eine nackte Null — der größte
Konversionskiller eines kleinen Servers. Jede Live-Zahl braucht historischen
Kontext: *„Gerade niemand unterwegs — Primetime ist Fr–So, 20–23 Uhr; Rekord: 19."*
Die Daten dafür liegen in `samples` und `peakAllTime`. Gleiches gilt für alle
still versteckten Blöcke (`leaderboardWrap`, `uptimeWrap`, `playerListWrap`,
`achWrap`): Sie verschwinden, statt zu erklären — die Seite hat je nach Datenlage
eine andere Struktur, was Wiederkehrer irritiert.

### 4. Die fünf Conversion-Lecks schließen

| # | Leck | Befund |
|---|---|---|
| 1 | **Die Kernaktion ist nicht im Hero** | Der primäre Button ist ein Sprunganker auf `#mitspielen` bei ca. 4.500 px (Desktop) bzw. 5.700 px (mobil, 8–9 Viewports). Die eigentliche Konversion — Adresse in die Zwischenablage — hängt an einem tertiär gestylten Kopier-Button. |
| 2 | **Jeder technische Fehler behauptet „Server offline"** | `main.js:125–128` ruft im `catch` `renderOffline()` auf. Ein Netzwerk- oder 500er-Fehler *der eigenen Website* zeigt dem Besucher *„Offline · Wartung oder Update"*. Parallel scheitert `/api/stats` völlig lautlos und die Chart-Karte bleibt eine leere 280-px-Fläche. |
| 3 | **Der Statistik-Block blockiert den Funnel** | ca. 2.000 px (mit aufgeklappten Erfolgen über 3.300 px) zwischen Status und Anleitung — rund 40 % der Seitenhöhe *vor* der Kernaktion. Gleichzeitig steht das stärkste Argument *„kostenlos, kein Account"* ausschließlich in FAQ-Frage 5 bei ca. 6.000 px in einem zugeklappten Akkordeon. |
| 4 | **Die Wiederkehr-Seiten sind Sackgassen** | `/karte` und `/spieler/<name>` enthalten null CTAs, keine Serveradresse, keinen Kopier-Button. Kartenmarker sind reines SVG-Text und nicht klickbar, obwohl dieselben Namen auf der Startseite Links sind. |
| 5 | **Die CTA-Hierarchie kippt nach außen** | Sechs Discord-Einstiege gegen **zwei** Kopiermöglichkeiten. Im ersten Viewport konkurrieren zwölf klickbare Ziele. |

### 5. Ein Typo- und Abstandssystem einführen

33 verschiedene rem-Größen und 35 verschiedene px-Abstände in 1.840 Zeilen; zwölf
Größen liegen in einem 0,2-rem-Band. Drei Schriftstärken, alle zwischen 600 und
800 — **kein einziges `font-weight: 400`**. Vor jedem dunklen Anstrich braucht es
eine modulare Skala (Faktor ~1,25 in 8–10 Stufen), ein 4/8-px-Raster, eine
Display-Schrift mit echtem Umfang (300–900) und Fließtext zurück auf 400 — damit
800 wieder etwas bedeutet.

### 6. Tiefe herstellen

`--shadow-soft` wird 19-mal benutzt und ist die komplette Z-Achse. Kein Layering,
kein Nebel, kein Parallax, kein Licht; die einzige Tiefenbewegung ist ein
`translateY(-4px)`-Hover. Der Brief verlangt volumetrisches Licht — heute ist die
Seite buchstäblich flach.

### 7. Fokus-Sichtbarkeit herstellen

Vier `:focus-visible`-Regeln in 1.840 Zeilen, zwei nackte `outline: none`. Das
gesamte Button-System, alle Nav-Links, alle FAQ-Summaries und alle Copy-Chips
haben nur den Browser-Default. Auf dunklem Grund ist das kein Häkchen auf einer
Liste, sondern eine echte Navigationsstörung — und in Deutschland zunehmend auch
ein rechtliches Thema.

### 8. Autorschaft einführen

Auf der gesamten öffentlichen Seite kommt kein Mensch vor; der Betreibername
steht nur im `noindex`-Impressum. Bei einem privaten Server ist die Person das
Produkt. Ein kurzer, namentlicher Abschnitt *„Wer das hier betreibt und warum es
nichts kostet"* ist gleichzeitig Vertrauenssignal und E-E-A-T-Signal.

### 9. Die fehlende Support-Antwort: Crossplay

Der Palworld-Dedicated-Server ist Steam-only; Xbox-/Game-Pass-Spieler können
nicht beitreten. Die Seite sagt nur beiläufig *„Starte Palworld auf Steam"*. Das
ist eine häufige Suchanfrage und die häufigste Enttäuschung — sie gehört
prominent und ehrlich beantwortet, bevor jemand zehn Minuten investiert.

### 10. Die mobile Beitritts-Realität lösen

Palworld wird am PC gespielt, die Seite oft am Handy gelesen. Aktuell kopiert der
Nutzer eine Adresse in die falsche Zwischenablage. Ein QR-Code wäre der
ehrlichste mobile CTA.

### 11. Performance zuerst, Framework später

Fonts selbst hosten, ETag/304 plus Content-Hashes und `immutable`,
Security-Header nachrüsten, das Hero-Bild per `srcset`/AVIF ausliefern
(2000 × 838 px / 141 KB gehen heute an jedes 390-px-Handy; realistisch sind
~45 KB). Diese vier Punkte kosten zusammen weniger als eine Woche und bringen
mehr messbare Ladezeit, als ein Framework-Umstieg je zurückgeben könnte.

### 12. Markup-Deduplizierung als Voraussetzung

Nav und Footer stehen achtmal im Repo. Vor jeder Design-Iteration braucht es
genau *einen* Mechanismus dafür — entweder ein 30-zeiliger Include-Schritt in
`serveStatic` oder ein Build-Schritt. Sonst kostet jede Iteration acht
Dateiänderungen.

---

## Fazit

Die Seite muss nicht repariert werden — sie muss **umgedreht** werden.

Heute erzählt sie: *„Wir sind ein netter Server"*, und stellt die Beweise dafür in
den Keller. Die Neuerfindung muss die Beweise nach oben holen und die Behauptung
weglassen. Das Material dafür ist vollständig vorhanden: 32 Plätze, echte
Positionen, echte Basen, 168 Stunden Licht mit zwei Lücken darin, ein Rekord mit
Datum, vergangene In-Game-Tage, ein Mensch, der um drei Uhr nachts neu startet —
und ein Preis von null Euro, der erklärt werden will.

Die fünf Konzepte in diesem Ordner unterscheiden sich nur darin, **wie** sie
dieses Material erzählen.
