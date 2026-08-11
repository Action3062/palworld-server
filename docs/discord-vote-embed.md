# Discord-Einbettung: „Vote für PalHeim" (MEE6)

Fertige Embed-Vorlage für den Vote-Kanal im PalHeim-Discord, gebaut für den
**MEE6-Bot**. Farbe, Bild und Texte sind an die Webseite angeglichen.

**Vorher ausfüllen:** Die top-games.net-Adresse steht unten als
`https://de.top-games.net/palworld/HIER-DER-EINTRAG` – vor dem Posten durch
den echten Link aus dem top-games-Panel ersetzen (derselbe Wert wie
`votes.providers[].voteUrl` in der `config.json`). Kommt eine Serverliste
dazu, hier **und** in der Config nachziehen.

## Die Nachricht, die MEE6 posten soll

Zwei Bausteine, beide fertig zum Kopieren: einmal der **Aufruf** (angepinnt im
Vote-Kanal, erklärt und motiviert) und dazu **kurze Erinnerungen**, die der
MEE6-Timer regelmäßig raushaut. Der Aufruf allein wird nach zwei Tagen
übersehen – die Wiederholung macht die Votes.

### 1. Aufruf-Nachricht (einmal posten, anpinnen)

Der Text über dem Embed (MEE6-Feld **Message content**) – der ist das, was in
der Benachrichtigung aufploppt:

```
🔥 **30 Sekunden für PalHeim – und du bekommst was dafür**
Jede Stimme schiebt uns in den Serverlisten nach oben. Mehr Sichtbarkeit = mehr
Mitspieler = vollere Basen, mehr Raids, mehr Leben auf der Karte. Und du gehst
nicht leer aus: Vote-Belohnung im Spiel + die 🎖️ Voter-Rolle hier im Discord.
```

Darunter das Embed (JSON für den MEE6-Editor):

```json
{
  "color": 16353819,
  "author": {
    "name": "PalHeim – jede Stimme zählt",
    "url": "https://palheim.de/",
    "icon_url": "https://palheim.de/assets/promo/palheim-banner-468x60.png"
  },
  "title": "🗳️ Vote für PalHeim – dauert 30 Sekunden",
  "url": "https://palheim.de/#voten",
  "description": "Du kannst **jeden Tag auf jeder Liste einmal** voten. Kein Account nötig, kein Geld, keine Werbung – nur ein Klick, der uns nach oben zieht.\n\n**Was du davon hast**\n🎁 Belohnung im Spiel – für **jede** Liste einzeln\n🎖️ Die **Voter-Rolle** hier im Discord\n🌍 Mehr Leute auf dem Server, mit denen du spielst\n\n**So geht's**\n**1.** Unten auf einer Liste voten – **mit deinem In-Game-Namen**\n**2.** Auf `pve.palheim.de:8211` einloggen\n**3.** Auf [palheim.de](https://palheim.de/#voten) Namen eintragen → Belohnung abholen",
  "fields": [
    {
      "name": "🟠 palserver.de",
      "value": "[Jetzt voten](https://palserver.de/server/palheim-251)\nWieder in 24 Std.",
      "inline": true
    },
    {
      "name": "🔵 top-games.net",
      "value": "[Jetzt voten](https://de.top-games.net/palworld/HIER-DER-EINTRAG)\nWieder in 24 Std.",
      "inline": true
    },
    {
      "name": "🎖️ Voter-Rolle sichern",
      "value": "Einmal `/verknuepfen` tippen und beim Feld **name** deinen In-Game-Namen eintragen – danach kommt die Rolle bei jeder Belohnung automatisch.",
      "inline": false
    },
    {
      "name": "⏱️ Nicht vergessen",
      "value": "Belohnung am besten **direkt nach dem Voten** abholen – auf top-games.net verfällt ein Vote nach 2 Stunden.",
      "inline": false
    }
  ],
  "image": {
    "url": "https://palheim.de/assets/og-image.jpg"
  },
  "footer": {
    "text": "palheim.de • Danke an alle, die täglich voten! 💙"
  }
}
```

### 2. Tägliche Erinnerungen (MEE6 → Timers)

MEE6-Dashboard → Plugin **Timers** → neuer Timer, Kanal `#voten`, Intervall
z. B. 24 Stunden. Damit es nicht wie ein Spam-Bot klingt: mehrere Timer mit
unterschiedlichen Texten und leicht versetzten Zeiten anlegen, statt einen Text
jeden Tag zu wiederholen.

```
🗳️ **Tägliches Vote-Fenster ist offen!** Zwei Klicks, zwei Belohnungen:
» palserver.de: https://palserver.de/server/palheim-251
» top-games.net: https://de.top-games.net/palworld/HIER-DER-EINTRAG
Danach Belohnung abholen: https://palheim.de/#voten
```

```
⏰ Schon für PalHeim gevotet heute? Dauert kürzer als ein Ladebildschirm –
und bringt dir eine Belohnung im Spiel: https://palheim.de/#voten
```

```
💪 Wir wachsen mit jeder Stimme. Wer heute votet, holt sich die Belohnung
direkt danach ab (und die 🎖️ Voter-Rolle gibt's per `/verknuepfen` dazu):
https://palheim.de/#voten
```

```
🎁 Erinnerung: Deine Vote-Belohnung von heute wartet noch.
Voten → einloggen auf `pve.palheim.de:8211` → abholen auf https://palheim.de/#voten
```

```
🚀 Ein Vote = ein paar Plätze nach oben in der Serverliste = neue Mitspieler.
Kostet dich 30 Sekunden: https://palheim.de/#voten
```

**Wichtig bei den Timer-Texten:** Links dort als **nackte URL** schreiben.
`[Text](URL)` funktioniert nur im Embed, in einer normalen Nachricht bleibt der
Klammer-Text stehen und niemand kann klicken.

### Pings – sparsam einsetzen

- Beim **einmaligen Aufruf**: `@everyone` ist okay (ein Mal).
- Bei den **täglichen Timern**: **kein** `@everyone`. Besser eine
  Selbstvergabe-Rolle wie `@Vote-Erinnerung` (MEE6 → *Reaction Roles*) und nur
  die anpingen – wer erinnert werden will, holt sich die Rolle.
- Am wirksamsten ist trotzdem der Kanal selbst: `#voten` so einstellen, dass
  nur Bots schreiben dürfen, Aufruf anpinnen.

### Was den Aufruf wirklich zieht

- **Ergebnis zeigen.** Alle paar Wochen posten, auf welchem Platz wir stehen
  („letzte Woche Platz 14, heute Platz 9 – das wart ihr"). Fortschritt
  motiviert stärker als jede Belohnung.
- **Namen nennen.** Die Vote-Meldung der Webseite (`reward.discord.webhookUrl`)
  in denselben Kanal schicken lassen – dann sieht jeder, dass andere voten.
- **Vote-Ziel setzen.** „50 Votes diese Woche → Event-Wochenende mit doppelten
  Raten" wirkt besser als ein Dauer-Appell.

## Embed abtippen (wenn kein JSON-Import da ist)

Angelegt wird der Aufruf im MEE6-Dashboard unter **Custom Commands** →
*Send embed* (oder im Plugin für Embed-Nachrichten). Hat der Editor ein
**JSON/Code-Symbol**, einfach den Block von oben einfügen. Sonst Feld für
Feld:

| Feld im Editor | Inhalt |
|---|---|
| Color | `#F98A1B` |
| Author name | `PalHeim – jede Stimme zählt` |
| Author URL | `https://palheim.de/` |
| Author icon | `https://palheim.de/assets/promo/palheim-banner-468x60.png` |
| Title | `🗳️ Vote für PalHeim – dauert 30 Sekunden` |
| Title URL | `https://palheim.de/#voten` |
| Image | `https://palheim.de/assets/og-image.jpg` |
| Footer | `palheim.de • Danke an alle, die täglich voten! 💙` |

**Description:**

```
Du kannst **jeden Tag auf jeder Liste einmal** voten. Kein Account nötig, kein Geld, keine Werbung – nur ein Klick, der uns nach oben zieht.

**Was du davon hast**
🎁 Belohnung im Spiel – für **jede** Liste einzeln
🎖️ Die **Voter-Rolle** hier im Discord
🌍 Mehr Leute auf dem Server, mit denen du spielst

**So geht's**
**1.** Unten auf einer Liste voten – **mit deinem In-Game-Namen**
**2.** Auf `pve.palheim.de:8211` einloggen
**3.** Auf [palheim.de](https://palheim.de/#voten) Namen eintragen → Belohnung abholen
```

**Feld 1** (inline): Name `🟠 palserver.de`, Wert

```
[Jetzt voten](https://palserver.de/server/palheim-251)
Wieder in 24 Std.
```

**Feld 2** (inline): Name `🔵 top-games.net`, Wert

```
[Jetzt voten](https://de.top-games.net/palworld/HIER-DER-EINTRAG)
Wieder in 24 Std.
```

**Feld 3** (nicht inline): Name `🎖️ Voter-Rolle sichern`, Wert

```
Einmal `/verknuepfen` tippen und beim Feld **name** deinen In-Game-Namen eintragen – danach kommt die Rolle bei jeder Belohnung automatisch.
```

**Feld 4** (nicht inline): Name `⏱️ Nicht vergessen`, Wert

```
Belohnung am besten **direkt nach dem Voten** abholen – auf top-games.net verfällt ein Vote nach 2 Stunden.
```

## Kurzfassung für einen `!vote`-Befehl

Für ein Custom Command (Trigger `!vote`) reicht eine schlanke Version ohne
Bild – so bleibt der Chat lesbar:

```json
{
  "color": 16353819,
  "title": "🗳️ Für PalHeim voten",
  "url": "https://palheim.de/#voten",
  "description": "**1.** [palserver.de](https://palserver.de/server/palheim-251) · [top-games.net](https://de.top-games.net/palworld/HIER-DER-EINTRAG) – mit deinem **In-Game-Namen** voten\n**2.** Auf `pve.palheim.de:8211` einloggen\n**3.** Belohnung auf [palheim.de](https://palheim.de/#voten) abholen\n\nVoter-Rolle noch nicht? Einmal `/verknuepfen` tippen und den In-Game-Namen eintragen.",
  "footer": {
    "text": "Einmal am Tag pro Liste – jede Liste zählt einzeln."
  }
}
```

## Hinweise zum Posten

- **Klickbare Textlinks (`[Text](URL)`) funktionieren nur im Embed**, nicht in
  einer normalen Chat-Nachricht daneben – alle Vote-Links gehören deshalb in
  Description oder Felder.
- MEE6 kann keine Link-Buttons unter das Embed setzen; die Links im Embed sind
  der Ersatz dafür.
- Am besten **angepinnt in einen eigenen `#voten`-Kanal**, in dem nur der Bot
  schreiben darf. Zum Aktualisieren die vorhandene Nachricht im MEE6-Editor
  bearbeiten statt neu zu posten – dann bleibt der Pin bestehen.
- Discord cached Bilder: Wird nach einem Bildtausch noch das alte angezeigt,
  einmal mit `?v=2` an der Bild-URL posten.
- Die Belohnungsseite ist die Sektion **Vote & Belohnung** auf palheim.de. Ist
  `votes.enabled` in der `config.json` aus, ist der Abschnitt ausgeblendet und
  der Link `#voten` läuft ins Leere – Embed erst posten, wenn Voten aktiv ist.
