# Discord-Einbettung: „Vote für PalHeim" (MEE6)

Fertige Embed-Vorlage für den Vote-Kanal im PalHeim-Discord, gebaut für den
**MEE6-Bot**. Farbe, Bild und Texte sind an die Webseite angeglichen.

**Vorher ausfüllen:** Die top-games.net-Adresse steht unten als
`https://de.top-games.net/palworld/HIER-DER-EINTRAG` – vor dem Posten durch
den echten Link aus dem top-games-Panel ersetzen (derselbe Wert wie
`votes.providers[].voteUrl` in der `config.json`). Kommt eine Serverliste
dazu, hier **und** in der Config nachziehen.

## Weg 1: JSON importieren (schnell)

MEE6-Dashboard → **Custom Commands** (oder **Welcome**/**Embed-Nachricht**) →
Embed anlegen → im Editor auf das **JSON/Code-Symbol** wechseln → Block
einfügen → speichern.

```json
{
  "color": 16353819,
  "author": {
    "name": "PalHeim – Deutscher Palworld PvE-Server",
    "url": "https://palheim.de/",
    "icon_url": "https://palheim.de/assets/promo/palheim-banner-468x60.png"
  },
  "title": "🗳️ Vote für PalHeim – und hol dir die Voter-Rolle",
  "url": "https://palheim.de/#voten",
  "description": "Jede Stimme bringt uns in den Serverlisten nach oben – und dir eine Belohnung.\n**Einmal am Tag pro Liste**, jede Liste zählt einzeln.\n\n**So geht's:**\n**1.** Auf einer Serverliste voten – dabei deinen **In-Game-Namen** angeben\n**2.** Auf dem Server einloggen (`pve.palheim.de:8211`)\n**3.** Auf [palheim.de](https://palheim.de/#voten) den Namen eintragen und Belohnung abholen",
  "fields": [
    {
      "name": "🟠 palserver.de",
      "value": "[Hier voten](https://palserver.de/server/palheim-251)\nAlle 24 Stunden",
      "inline": true
    },
    {
      "name": "🔵 top-games.net",
      "value": "[Hier voten](https://de.top-games.net/palworld/HIER-DER-EINTRAG)\nAlle 24 Stunden",
      "inline": true
    },
    {
      "name": "🎖️ Voter-Rolle bekommen",
      "value": "Tippe hier im Discord einmal `/verknuepfen` und trag beim Feld **name** deinen In-Game-Namen ein – danach kommt die Rolle bei jeder Vote-Belohnung automatisch.",
      "inline": false
    },
    {
      "name": "⏱️ Wichtig",
      "value": "Am besten **direkt nach dem Voten** abholen: auf top-games.net verfällt ein Vote nach 2 Stunden. Bis ein Vote ankommt, können ein paar Minuten vergehen.",
      "inline": false
    }
  ],
  "image": {
    "url": "https://palheim.de/assets/og-image.jpg"
  },
  "footer": {
    "text": "palheim.de • Danke fürs Voten!"
  }
}
```

## Weg 2: Felder abtippen (wenn kein JSON-Import da ist)

Im MEE6-Embed-Editor der Reihe nach:

| Feld im Editor | Inhalt |
|---|---|
| Color | `#F98A1B` |
| Author name | `PalHeim – Deutscher Palworld PvE-Server` |
| Author URL | `https://palheim.de/` |
| Author icon | `https://palheim.de/assets/promo/palheim-banner-468x60.png` |
| Title | `🗳️ Vote für PalHeim – und hol dir die Voter-Rolle` |
| Title URL | `https://palheim.de/#voten` |
| Image | `https://palheim.de/assets/og-image.jpg` |
| Footer | `palheim.de • Danke fürs Voten!` |

**Description:**

```
Jede Stimme bringt uns in den Serverlisten nach oben – und dir eine Belohnung.
**Einmal am Tag pro Liste**, jede Liste zählt einzeln.

**So geht's:**
**1.** Auf einer Serverliste voten – dabei deinen **In-Game-Namen** angeben
**2.** Auf dem Server einloggen (`pve.palheim.de:8211`)
**3.** Auf [palheim.de](https://palheim.de/#voten) den Namen eintragen und Belohnung abholen
```

**Feld 1** (inline): Name `🟠 palserver.de`, Wert

```
[Hier voten](https://palserver.de/server/palheim-251)
Alle 24 Stunden
```

**Feld 2** (inline): Name `🔵 top-games.net`, Wert

```
[Hier voten](https://de.top-games.net/palworld/HIER-DER-EINTRAG)
Alle 24 Stunden
```

**Feld 3** (nicht inline): Name `🎖️ Voter-Rolle bekommen`, Wert

```
Tippe hier im Discord einmal `/verknuepfen` und trag beim Feld **name** deinen In-Game-Namen ein – danach kommt die Rolle bei jeder Vote-Belohnung automatisch.
```

**Feld 4** (nicht inline): Name `⏱️ Wichtig`, Wert

```
Am besten **direkt nach dem Voten** abholen: auf top-games.net verfällt ein Vote nach 2 Stunden. Bis ein Vote ankommt, können ein paar Minuten vergehen.
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
