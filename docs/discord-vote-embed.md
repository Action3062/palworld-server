# Discord-Einbettung: „Vote für PalHeim" (MEE6)

Fertige Vorlage für den Vote-Kanal im PalHeim-Discord, gebaut für den
**MEE6-Bot**. Farbe, Bild und Texte sind an die Webseite angeglichen.

**Es gibt keine Belohnung im Spiel.** Alle Texte hier versprechen deshalb nur
das, was es wirklich gibt: die 🎖️ **Voter-Rolle** im Discord, die namentliche
Erwähnung im Kanal und einen sichtbareren Server. Das passt zur Config
(`votes.reward.mode = "discord"`) – wird dort später auf `rcon` umgestellt,
müssen die Texte wieder mitwachsen.

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
🔥 **30 Sekunden, die unserem Server richtig helfen**
Jede Stimme schiebt PalHeim in den Serverlisten nach oben. Weiter oben heißt:
mehr Leute finden uns, mehr Mitspieler, vollere Basen, mehr los auf der Karte.
Kostenlos, ohne Account – und du bekommst dafür die 🎖️ Voter-Rolle hier im Discord.
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
  "description": "Du kannst **jeden Tag auf jeder Liste einmal** voten. Kein Account nötig, kein Geld, keine Werbung – nur ein Klick, der uns nach oben zieht.\n\n**Warum das was bringt**\n📈 Höherer Listenplatz = neue Spieler finden PalHeim\n🌍 Mehr Mitspieler heißt vollere Basen und mehr los auf der Karte\n🎖️ Du bekommst die **Voter-Rolle** hier im Discord\n\n**So geht's**\n**1.** Unten auf einer Liste voten – **mit deinem In-Game-Namen**\n**2.** Auf [palheim.de](https://palheim.de/#voten) denselben Namen eintragen und Vote bestätigen\n**3.** Fertig – die Voter-Rolle kommt automatisch",
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
      "value": "Einmal `/verknuepfen` tippen und beim Feld **name** deinen In-Game-Namen eintragen – danach bekommst du die Rolle bei jedem bestätigten Vote automatisch.",
      "inline": false
    },
    {
      "name": "⏱️ Nicht vergessen",
      "value": "Vote am besten **direkt danach bestätigen** – auf top-games.net verfällt ein Vote nach 2 Stunden. Bis ein Vote ankommt, können ein paar Minuten vergehen.",
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
🗳️ **Tägliches Vote-Fenster ist offen!** Zwei Klicks, zwei Listen:
» palserver.de: https://palserver.de/server/palheim-251
» top-games.net: https://de.top-games.net/palworld/HIER-DER-EINTRAG
Danach hier bestätigen: https://palheim.de/#voten
```

```
⏰ Schon für PalHeim gevotet heute? Dauert kürzer als ein Ladebildschirm –
und bringt uns einen Platz nach oben: https://palheim.de/#voten
```

```
💪 Wir wachsen mit jeder Stimme. Wer heute votet, bestätigt es direkt danach
auf der Seite – dann gibt's die 🎖️ Voter-Rolle dazu: https://palheim.de/#voten
```

```
📈 Serverlisten sind wie Charts: Wer oben steht, wird gefunden.
Ein Klick von dir zählt einen ganzen Tag: https://palheim.de/#voten
```

```
🚀 Ein Vote = ein paar Plätze nach oben = neue Mitspieler auf PalHeim.
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

Ohne Item-Belohnung zieht vor allem eins: sichtbarer Fortschritt und
Anerkennung.

- **Ergebnis zeigen.** Alle paar Wochen posten, auf welchem Platz wir stehen
  („letzte Woche Platz 14, heute Platz 9 – das wart ihr"). Sichtbarer
  Fortschritt motiviert stärker als jedes Versprechen.
- **Namen nennen.** Die Vote-Meldung der Webseite (`reward.discord.webhookUrl`)
  in denselben Kanal schicken lassen – dann sieht jeder, wer votet, und wird
  selbst dafür gesehen.
- **Voter-Rolle sichtbar machen.** Rolle mit eigener Farbe anlegen und in der
  Mitgliederliste separat anzeigen lassen – eine Rolle, die niemand sieht,
  motiviert niemanden.
- **Gemeinsames Ziel setzen.** „50 Votes diese Woche → Event-Wochenende mit
  doppelten Raten" wirkt besser als ein Dauer-Appell (Event-Wochenenden macht
  `palworld-event.sh` ohnehin schon).

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

**Warum das was bringt**
📈 Höherer Listenplatz = neue Spieler finden PalHeim
🌍 Mehr Mitspieler heißt vollere Basen und mehr los auf der Karte
🎖️ Du bekommst die **Voter-Rolle** hier im Discord

**So geht's**
**1.** Unten auf einer Liste voten – **mit deinem In-Game-Namen**
**2.** Auf [palheim.de](https://palheim.de/#voten) denselben Namen eintragen und Vote bestätigen
**3.** Fertig – die Voter-Rolle kommt automatisch
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
Einmal `/verknuepfen` tippen und beim Feld **name** deinen In-Game-Namen eintragen – danach bekommst du die Rolle bei jedem bestätigten Vote automatisch.
```

**Feld 4** (nicht inline): Name `⏱️ Nicht vergessen`, Wert

```
Vote am besten **direkt danach bestätigen** – auf top-games.net verfällt ein Vote nach 2 Stunden. Bis ein Vote ankommt, können ein paar Minuten vergehen.
```

## Kurzfassung für einen `!vote`-Befehl

Für ein Custom Command (Trigger `!vote`) reicht eine schlanke Version ohne
Bild – so bleibt der Chat lesbar:

```json
{
  "color": 16353819,
  "title": "🗳️ Für PalHeim voten",
  "url": "https://palheim.de/#voten",
  "description": "**1.** [palserver.de](https://palserver.de/server/palheim-251) · [top-games.net](https://de.top-games.net/palworld/HIER-DER-EINTRAG) – mit deinem **In-Game-Namen** voten\n**2.** Vote auf [palheim.de](https://palheim.de/#voten) bestätigen\n**3.** 🎖️ Voter-Rolle kassieren\n\nNoch nicht verknüpft? Einmal `/verknuepfen` tippen und den In-Game-Namen eintragen.",
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
- **Schritt 2 (Vote bestätigen) ist kein Selbstzweck**: Über das Formular auf
  palheim.de erkennt die Webseite den Vote und vergibt erst dann die
  Voter-Rolle. Steht `votes.requireOnline` in der `config.json` auf `true`,
  muss der Spieler dabei eingeloggt sein – dann in den Text ein „vorher auf
  `pve.palheim.de:8211` einloggen" aufnehmen.
- Ist `votes.enabled` in der `config.json` aus, ist der Abschnitt
  **Vote & Belohnung** auf palheim.de ausgeblendet und der Link `#voten` läuft
  ins Leere – Embed erst posten, wenn Voten aktiv ist.
