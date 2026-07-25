# PalHeim Relaunch — Erste Lieferung

Fünf vollständig ausgearbeitete Designkonzepte für `palheim.de`, jedes mit einer
eigenen Identität, jedes einzeln gegengelesen.

## Reihenfolge zum Lesen

| | Dokument | Worum es geht |
|---|---|---|
| **→** | [`lookbook.html`](lookbook.html) | **Hier anfangen.** Die fünf Konzepte als sichtbare Entwürfe — echte Typografie, echte Paletten, ein gebauter Hero je Konzept. Im Browser öffnen. |
| 00 | [Briefing-Abgleich](00-briefing-abgleich.md) | Zwei Stellen, an denen das Briefing vom tatsächlichen Bestand abweicht — Geschäftsmodell und Technik-Stack. Drei Umsetzungspfade gegenübergestellt. |
| 01 | [Bestandsanalyse](01-bestandsanalyse.md) | Ehrliche Bewertung der heutigen Seite: was gut ist, was veraltet, was langweilig, was nach KI-Vorlage aussieht, was weg muss, was bleibt. Jeder Befund an Datei und Zeilennummer belegt. |
| 02 | [Konzept A · GLUTWACHE](02-konzept-a-glutwache.md) | *„Draußen wird es Nacht. Hier brennt Licht."* — Eine Nacht am Feuer. Die Lichter im Tal sind echte Gilden. |
| 03 | [Konzept B · FUNKFEUER](03-konzept-b-funkfeuer.md) | *„Kein Prospekt. Ein Messschrieb."* — Die Seite ist ein laufendes Instrument. |
| 04 | [Konzept C · LANDFALL](04-konzept-c-landfall.md) | *„14,5 km Insel — und einer der 32 Plätze ist deiner."* — Die Karte wird die Seite. |
| 05 | [Konzept D · KALTDRUCK](05-konzept-d-kaltdruck.md) | *„Kein Prospekt, ein Logbuch."* — Die veröffentlichte Chronik des Servers. |
| 06 | [Konzept E · WERKRISS](06-konzept-e-werkriss.md) | *„Gebaut, nicht gemietet."* — Welt, Basis und Maschine als eine Konstruktionszeichnung. |
| 07 | [Vergleich & Empfehlung](07-vergleich-und-empfehlung.md) | Gegenüberstellung, Empfehlung mit Begründung, und was unabhängig vom Konzept ohnehin passieren sollte. |

## Aufbau jedes Konzeptdokuments

16 Abschnitte — Philosophie, Zielwirkung, Farbwelt mit gemessenen Kontrastwerten,
Typografie, Hero, Seitenstruktur, Scroll-Journey, Animationen, Bildsprache,
Interaktionen, ASCII-Wireframe, Moodboard, Unterseiten, Signature-Moment,
Begründung der Einzigartigkeit, Conversion-Hebel.

Danach folgt in jedem Dokument eine **Gegenrede**: Jedes Konzept wurde nach der
Ausarbeitung von einer unabhängigen, bewusst feindseligen Instanz zerlegt —
Awwwards-Juror und Frontend-Architekt in Personalunion. Diese Kritik steht
ungefiltert im Dokument, samt der Schärfungen, die für die Umsetzung verbindlich
sind. Ein Konzept, das seine eigenen Schwächen nicht mitliefert, ist keine
Entscheidungsgrundlage.

## Kurzfassung der Empfehlung

**Konzept A · GLUTWACHE**, abgerüstet, mit drei Transplantaten: die
Kostenaufstellung aus Kaltdruck, die Conversion-Reparaturen aus Funkfeuer, die
Standbild-Disziplin aus Werkriss. Landfall wird die Vorlage für `/karte`.

Die ehrliche Alternative ist **Konzept D · KALTDRUCK**, wenn Vertrauen wichtiger
ist als Sofortwirkung und die Seite in zwei Jahren noch von einer Person gepflegt
werden soll.

Begründung in [07](07-vergleich-und-empfehlung.md).

## Zwei Dinge vorweg

1. **PalHeim verkauft keine Gameserver.** Der ausgelieferte Code sagt an vier
   Stellen, dass es ein kostenloser privater Community-Server ist. Die Konzepte
   sind auf das echte Ziel gebaut — Adresse kopieren → beitreten → Discord —,
   nicht auf einen Kauf. Statt einer Preis-Sektion hat jedes Konzept eine
   Ehrlichkeits-Sektion. Details in [00](00-briefing-abgleich.md).
2. **Der heutige Stack ist bewusst abhängigkeitsfrei.** Next.js ist machbar, aber
   nicht gratis. Drei Pfade mit Aufwand und Risiko stehen in
   [00](00-briefing-abgleich.md); empfohlen ist der Static Export hinter dem
   bestehenden nginx.

## Zum Lookbook

`lookbook.html` ist eine einzelne, vollständig eigenständige Datei: Schriften als
`woff2` eingebettet, keine externen Requests, keine Bibliothek. Die fünf Hero-Entwürfe
sind gebautes CSS und SVG, keine Bildschirmfotos. `prefers-reduced-motion` wird
respektiert — die Zeichnungen stehen dann sofort im Endzustand.
