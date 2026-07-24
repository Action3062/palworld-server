# Briefing-Abgleich: zwei Prämissen, die vor dem Design geklärt gehören

*Stand: Juli 2026 · Grundlage: vollständige Quellcode-Analyse von `palheim.de` (dieses Repository ist die live deployte Seite)*

Bevor es um Gestaltung geht, zwei Punkte aus dem Briefing, die sich mit dem
tatsächlichen Bestand nicht decken. Beide ändern nicht *ob*, aber deutlich *wie*
das Redesign gebaut wird. Die fünf Konzepte sind so entwickelt, dass sie in
beiden Fällen tragen – die Weichen stellen sich erst bei der Umsetzung.

---

## 1. PalHeim verkauft keine Gameserver

**Briefing:** „Palheim.de bietet leistungsstarke Gameserver für Palworld an."
Dazu eine Preis-Sektion, Conversion-Ziel „Genau hier möchte ich meinen
Palworld-Server hosten."

**Bestand:** PalHeim ist ein **privater, kostenloser, deutschsprachiger
Palworld-PvE-Community-Server**. Kein Produkt, keine Tarife, keine Kunden.
Belegt an mehreren Stellen im ausgelieferten Code:

| Quelle | Aussage |
|---|---|
| `public/index.html` (FAQ + JSON-LD) | „PalHeim ist ein privater, **kostenloser** Community-Server – du brauchst nur das Spiel Palworld und die Server-Adresse." |
| `public/llms.txt` | „Kosten: keine – privater Community-Server" |
| `public/index.html` (Support-Card) | „Serverkosten? Deckt zum Glück die Community. Wenn du magst, spendier dem Admin einen Kaffee – freiwillig, ohne Extras." |
| `public/index.html` (Footer) | „PalHeim ist ein inoffizieller Community-Server." |

Das ist keine Kleinigkeit, sondern der Dreh- und Angelpunkt der ganzen
Dramaturgie. Ein Hosting-Anbieter muss Kaufabsicht erzeugen. Ein Community-Server
muss **Zugehörigkeit** erzeugen. Das sind unterschiedliche Emotionen, andere
Beweisführung, andere CTA-Hierarchie, ein anderes Ende der Seite.

**Wie die Konzepte damit umgehen.** Das echte Conversion-Ziel ist eine Kette,
nicht ein Kauf:

```
Adresse kopieren  →  beitreten  →  Discord  →  wiederkommen  →  (freiwillig) Kaffee
```

Der Anspruch aus dem Briefing – Premium, Performance, Stabilität, Vertrauen,
modernste Technik – bleibt dabei vollständig gültig. Er richtet sich nur auf
eine andere Frage: nicht „Warum soll ich hier kaufen?", sondern **„Warum soll
ich hier meine nächsten 300 Spielstunden investieren?"**. Das ist die härtere
Frage, denn Spielzeit lässt sich nicht zurückerstatten. Wer 300 Stunden in eine
Basis steckt, will wissen: Läuft der Server in einem halben Jahr noch? Ist meine
Welt dann noch da? Genau darauf zahlen Uptime, Backups, „keine Wipes", eigene
Hardware und die Ausfall-Historie ein – und genau diese Beweise liegen heute
ungenutzt in den APIs.

Statt einer Preis-Sektion bekommt jedes Konzept deshalb eine **Ehrlichkeits-Sektion**:
sie beantwortet sichtbar die Frage „Was kostet das, wo ist der Haken?" – die
Frage, die jeder Besucher bei einem kostenlosen Server ohnehin still stellt.
Beantwortet man sie offensiv, wird aus dem größten Zweifel das stärkste
Vertrauenssignal.

> **Wenn das Briefing doch stimmt** und tatsächlich ein kommerzielles
> Hosting-Angebot geplant ist, ist das kein Redesign, sondern ein
> Geschäftsmodellwechsel: andere Rechtslage (AGB, Widerruf, Preisangabenverordnung,
> Impressumspflichten als Unternehmen), andere Infrastruktur (Provisionierung,
> Abrechnung, Support-SLA), andere Marke. Jedes der fünf Konzepte hat dafür
> eine benannte Andockstelle – die Ehrlichkeits-Sektion wird dann zur
> Tarif-Sektion. Das sollte aber eine bewusste Entscheidung sein, keine
> Design-Nebenwirkung.

---

## 2. Der Stack ist heute bewusst abhängigkeitsfrei

**Briefing:** React, Next.js, TypeScript, Tailwind, Motion, GSAP, shadcn/ui.

**Bestand:** Ein **Node-HTTP-Server ohne eine einzige npm-Abhängigkeit**
(`server.js`, ~1.750 Zeilen, `package.json` ohne `dependencies`), der statisches
HTML/CSS/Vanilla-JS ausliefert und gleichzeitig RCON spricht, Statistiken
persistiert, Achievements auswertet, Votes verarbeitet und eine Admin-Oberfläche
bedient. Deployment: `systemd` + `nginx` auf eigener Hardware in Deutschland.

Das ist keine Nachlässigkeit, das ist eine Qualität: keine Supply-Chain,
kein Build-Schritt, kein `node_modules`, Updates per `git pull` + `systemctl restart`.
Für einen Server, den eine Person nebenbei betreibt, ist das die richtige
Architektur.

**Drei ehrliche Umsetzungspfade** – die Entscheidung gehört dem Auftraggeber,
nicht dem Design:

| | **A – Vanilla-Rebuild** | **B – Next.js Static Export** | **C – Next.js voll** |
|---|---|---|---|
| **Was passiert** | Neues Design als handgeschriebenes HTML/CSS/JS, ausgeliefert vom bestehenden `server.js` | Next.js baut statisches HTML, `nginx` liefert es aus, Live-Daten weiterhin per `fetch` aus den bestehenden APIs | Zweiter Node-Prozess mit SSR, APIs wandern in Route Handler |
| **Build-Pipeline** | keine | ja, aber nur lokal/CI | ja, auf dem Server |
| **Neue Angriffsfläche** | keine | Build-Dependencies | Build- + Laufzeit-Dependencies |
| **Deployment ändert sich** | nein | leicht (`out/` statt `public/`) | ja (zweiter Dienst, Reverse-Proxy-Regeln) |
| **Performance-Erwartung** | am besten – kein Framework-JS im Kritischen Pfad | sehr gut | gut, aber Hydration-Kosten |
| **GSAP/Motion nutzbar** | ja (GSAP als eine Datei, kein Bundler nötig) | ja | ja |
| **Wartbarkeit für eine Person** | hoch, wenn sauber getokenisiert | mittel | niedrig |
| **Was man gewinnt** | maximale Kontrolle, minimale Ladezeit | Komponenten-Denken, TypeScript | SSR, Routing, Ökosystem |
| **Was man verliert** | Komponenten-Ergonomie | Einfachheit des Deployments | die Abhängigkeitsfreiheit |

**Empfehlung: Pfad B.** Er gibt dem Team React/TypeScript/Komponenten für die
Entwicklung, liefert aber am Ende statische Dateien aus – die bestehende
`nginx`/`systemd`-Landschaft, das RCON-Backend und alle `/api/*`-Endpunkte
bleiben unangetastet. Die Live-Daten holt die Seite ohnehin schon per `fetch`
im Browser; daran ändert sich nichts. Kein SSR bedeutet auch: keine zweite
Laufzeit, die nachts um drei ausfallen kann.

Pfad A bleibt die kompromisslos schnellste Variante und ist bei diesem
Seitenumfang (eine Startseite, vier Unterseiten) absolut realistisch – wer das
Repository so gebaut hat, kann das auch pflegen. Für Awwwards-Niveau ist ein
Framework ausdrücklich **nicht** Voraussetzung; die dortigen Preisträger sind
überdurchschnittlich oft handgeschrieben.

Was in **allen** Pfaden gilt: `shadcn/ui` liefert hier keinen Mehrwert. Die
Komponenten dieses Auftritts – Telemetrie-Instrumente, Kartenebenen,
Chronik-Einträge – existieren dort nicht, und die, die es gibt, müssten so weit
umgebaut werden, dass nur die `a11y`-Primitiven übrig bleiben. Falls
Komponenten-Primitive gebraucht werden, ist **Radix bzw. Base UI direkt** der
ehrlichere Weg. Tailwind bleibt als Utility-Schicht sinnvoll, aber ausschließlich
mit eigenem Theme: Standard-Skala, Standard-Radien und Standard-Grautöne sind
genau die Signatur, die eine Seite „nach KI aussehen" lässt.

---

## Was aus dem Bestand ungenutzt herumliegt

Der stärkste Befund der Analyse ist kein Mangel, sondern ein Schatz. Die Seite
besitzt bereits eine Datentiefe, die kaum ein Community-Server hat – und stellt
sie in fünf identischen grauen Kacheln dar:

- **Live:** Online-Status, Spielerzahl, Version, Uptime, **Server-FPS**
- **Historie:** Peak heute, Allzeit-Rekord, Spieler gesamt, Spielzeit gesamt,
  vergangene **In-Game-Tage**, Zeitreihen über 24 h und 7 Tage
- **Verlässlichkeit:** Verfügbarkeit 24 h / 7 Tage, protokollierte **Ausfall-Liste**
- **Menschen:** Leaderboard (Level, Spielzeit, zuletzt online), Spielerprofile
  mit Sessions, zurückgelegten Kilometern, besuchten Arealen, Erfolgen
- **Welt:** Live-Positionen aller Spieler und alle Gildenbasen auf der echten Karte

Das ist der Rohstoff für genau die Emotionen, die das Briefing verlangt –
Performance, Stabilität, Vertrauen, Community, Abenteuer. Kein Stockfoto und
kein Verlaufshintergrund der Welt erzeugt so viel Glaubwürdigkeit wie der Satz
„seit 41 Tagen ohne Ausfall", wenn daneben die echte Kurve läuft.

Alle fünf Konzepte bauen ihre Beweisführung auf diesen Daten auf. Sie
unterscheiden sich darin, **wie** sie sie erzählen: als Filmbild, als Instrument,
als Ort, als Chronik oder als Konstruktionszeichnung.
