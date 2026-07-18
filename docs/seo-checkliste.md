# SEO & KI-Sichtbarkeit – Checkliste für palheim.de

Die Webseite bringt die technische Basis inzwischen mit (Details unten).
Damit PalHeim in Google/Bing **und** in KI-Suchen (ChatGPT, Perplexity,
Google AI Overviews, Copilot, Claude) empfohlen wird, braucht es zusätzlich
ein paar einmalige Anmeldungen und laufende Kleinigkeiten – das kann kein
Code erledigen.

## Einmalig einrichten (wichtigste zuerst)

1. **Google Search Console** – <https://search.google.com/search-console>
   - Property `palheim.de` (Domain-Property, Nachweis per DNS-TXT-Record) anlegen
   - Sitemap einreichen: `https://palheim.de/sitemap.xml`
   - Nach ein paar Tagen unter „Leistung“ prüfen, für welche Suchbegriffe
     die Seite erscheint
2. **Bing Webmaster Tools** – <https://www.bing.com/webmasters>
   - Wichtig, weil **ChatGPT-Suche und Copilot den Bing-Index nutzen**
   - Import aus der Search Console ist mit zwei Klicks möglich
   - Sitemap ebenfalls einreichen
3. **Serverlisten-Einträge pflegen** (Backlinks + direkte Spielerquelle)
   - palserver.de ist schon eingetragen – Beschreibungstext dort mit den
     Keywords aus der Startseite abgleichen (deutsch, PvE, keine Wipes,
     Raten, `pve.palheim.de:8211`) und die Webseite verlinken
   - Weitere Palworld-Serverlisten suchen („Palworld Serverliste“ /
     „Palworld server list“) und überall denselben Namen, dieselbe Adresse
     und einen Link auf `https://palheim.de` eintragen
4. **Discord auffindbar machen**
   - Discord-Server-Entdeckung bzw. Listen wie disboard.org nutzen und die
     Webseite im Server prominent verlinken (Willkommens-Kanal, Server-Info)
   - Der echte Invite-Link muss auf der Webseite eingetragen sein
     (`DEIN-INVITE` ersetzen – Suchen & Ersetzen in `public/index.html`)
5. **Impressum ausfüllen** (`public/impressum.html`)
   - Pflicht nach § 5 DDG – und Seiten mit vollständigem Impressum wirken
     auf Google wie auf KI-Modelle vertrauenswürdiger (E-E-A-T)

## Laufend (macht den Unterschied)

- **Erwähnungen dort sammeln, wo KIs lesen**: Reddit (r/Palworld,
  Server-Sammelthreads), Steam-Community-Foren, deutsche Gaming-Foren.
  KI-Suchen zitieren solche Quellen häufig – ein Post „Deutscher
  Palworld-PvE-Server ohne Wipes: palheim.de“ mit ehrlicher Beschreibung
  bringt mehr als jede Meta-Angabe
- **Frische Inhalte**: Nach Palworld-Updates kurz auf der Seite erwähnen,
  dass der Server aktualisiert ist (und `lastmod` in `public/sitemap.xml`
  anfassen). Suchmaschinen bevorzugen lebendige Seiten
- **Nach dem Merge prüfen**:
  - <https://palheim.de/robots.txt>, `/sitemap.xml`, `/llms.txt` erreichbar?
  - Rich-Results-Test: <https://search.google.com/test/rich-results>
    (FAQ + GameServer sollten erkannt werden)
  - OG-Vorschau testen: Link in Discord posten – Bild + Beschreibung müssen
    erscheinen (Discord cached; mit `?v=2` testen, falls alt)

## Was die Webseite jetzt technisch mitbringt

| Baustein | Datei | Zweck |
|---|---|---|
| `robots.txt` | `public/robots.txt` | Alle Crawler inkl. KI-Bots (GPTBot, ClaudeBot, PerplexityBot, …) erlaubt, Sitemap verlinkt |
| `sitemap.xml` | `public/sitemap.xml` | Seitenliste für Google/Bing (bei neuen Seiten erweitern!) |
| `llms.txt` | `public/llms.txt` | Kompakte Fakten für KI-Crawler/LLMs (neuer Quasi-Standard) |
| Strukturierte Daten | `public/index.html` (JSON-LD) | `GameServer`, `VideoGame`, `FAQPage`, `WebSite` – maschinenlesbare Fakten für Rich Results & KI-Antworten |
| Canonical + saubere URLs | HTML-Head + `server.js` | `/karte` statt `/karte.html`, 301-Redirects, kein Duplicate Content (auch www vs. non-www) |
| Open Graph + Twitter Cards | HTML-Head | Ansprechende Vorschau beim Teilen (Discord!) mit eigenem OG-Bild |
| OG-Bild 1200×630 | `public/assets/og-image.jpg` | Neu erzeugen mit `python3 tools/make-og-image.py`, falls sich das Hero-Bild ändert |
| FAQ in Frageform | `public/index.html` | Deckt echte Suchanfragen ab („Palworld Server Adresse“, „PvE Server deutsch“ …) – Hauptfutter für KI-Antworten |

## Grundregel

KI-Suchen empfehlen, was sie (a) crawlen dürfen, (b) als klare Fakten
vorfinden und (c) an mehreren Stellen im Netz bestätigt sehen. (a) und (b)
sind jetzt erledigt – (c) entsteht durch Serverlisten, Discord, Reddit & Co.
