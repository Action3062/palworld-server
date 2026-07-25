#!/usr/bin/env node
/**
 * Palworld Server Website
 * ------------------------
 * Kleiner Webserver ohne Abhängigkeiten (nur Node.js >= 18):
 *  - liefert die statische Webseite aus ./public aus
 *  - stellt unter /api/status Live-Daten des Palworld-Servers bereit
 *    (holt sie über die offizielle Palworld REST-API, Port 8212)
 *
 * Das Admin-Passwort bleibt dadurch auf dem Server und wird nie an
 * den Browser weitergegeben. Antworten werden gecacht, damit die
 * Palworld-API nicht bei jedem Seitenaufruf angefragt wird.
 *
 * Konfiguration: config.json (siehe config.example.json) oder Umgebungsvariablen.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Konfiguration laden
// ---------------------------------------------------------------------------

const DEFAULTS = {
  // Mehrserver-Betrieb: Liste der Spielserver. Leer = genau ein Server aus
  // den klassischen Feldern unten (palworldApiUrl, statsFile, map.*).
  // Beispiel für zwei Server siehe README, Abschnitt „Zweiter Server".
  servers: [],
  // Port, auf dem DIESE Webseite läuft (nginx leitet 80/443 hierher weiter)
  port: 3000,
  host: '127.0.0.1',
  // Basis-URL der Palworld REST-API (läuft auf demselben Server)
  palworldApiUrl: 'http://127.0.0.1:8212',
  // AdminPassword aus der PalWorldSettings.ini
  palworldAdminPassword: '',
  // Wie lange Live-Daten zwischengespeichert werden (Sekunden)
  cacheSeconds: 15,
  // Spielernamen der Online-Spieler öffentlich anzeigen?
  showPlayerList: true,
  // Statistiken sammeln (Spielerzahl-Verlauf, Peaks, Spielzeiten)?
  statsEnabled: true,
  // Wie oft der Palworld-Server für die Statistik abgefragt wird (Sekunden)
  statsPollSeconds: 60,
  // Wo die gesammelten Statistiken gespeichert werden
  statsFile: 'data/stats.json',
  // Hinweis-Banner oben auf der Seite (Wartung, Events, Ankündigungen)
  banner: {
    enabled: false,
    // Anzeigetext (kurz halten); HTML wird NICHT interpretiert
    text: '',
    // Optik: "info" (blau), "event" (grün), "warn" (orange/rot)
    level: 'info'
  },
  // Admin-Funktionen der Website
  admin: {
    // Langes Zufalls-Token; leer = Broadcast-Seite (/broadcast) deaktiviert
    broadcastSecret: '',
    // Passwort des HAUPTADMINS für die Admin-Seite (/admin); leer = Seite
    // deaktiviert. Nicht das Palworld-AdminPassword wiederverwenden!
    password: '',
    // Anzeigename des Hauptadmins (erscheint im Aktions-Protokoll)
    name: 'Hauptadmin',
    // Unter-Admins: eigener Name + eigenes Passwort pro Person, z. B.
    //   "users": { "Lisa": "langes-passwort", "Tom": "anderes-passwort" }
    // Unter-Admins dürfen alles außer den Server neu starten.
    users: {}
  },
  // Besucher-Zähler (Seitenaufrufe + eindeutige Besucher; ohne IP/Cookies)
  visitorCounter: true,
  // "Unterstützen"-Karte (z. B. Buy Me a Coffee) – nur ein Link, keine
  // externen Skripte. url leer = Karte bleibt ausgeblendet.
  support: {
    enabled: false,
    url: '',
    // Optionaler eigener Text auf der Karte
    text: 'Serverkosten? Deckt zum Glück die Community. Wenn du magst, spendier dem Admin einen Kaffee – freiwillig, ohne Extras.'
  },
  // Live-Karte (Spieler-Positionen aus der REST-API, Basen via Uploader)
  map: {
    enabled: true,
    // Geheimnis für den Basen-Upload (tools/upload-bases.py auf dem
    // Palworld-Server); leer = Upload deaktiviert
    uploadSecret: '',
    basesFile: 'data/bases.json',
    // Kalibrierung des optionalen Kartenbildes (/assets/map.jpg|webp|png):
    // Welt-Koordinaten der Bildränder. Norden (oben) = +X, Osten (rechts) = +Y.
    // Die Standardwerte passen zum vollständigen In-Game-Kartenbild
    // (siehe README, Abschnitt "Live-Karte").
    // Quelle: DT_WorldMapUIData (Spieldaten, Palworld 1.0 MainMap) –
    // das vollständige Kartenbild ist exakt quadratisch.
    calibration: {
      xTop: 349400,
      xBottom: -1099400,
      yLeft: -724400,
      yRight: 724400
    }
  },
  // Erfolge (werden aus den Statistik-Daten berechnet)
  achievements: {
    enabled: true,
    // Freischaltungen als Broadcast im Spiel ankündigen
    announceUnlocks: true
  },
  // Vote-Belohnungssystem (siehe README, Abschnitt "Vote-Belohnung")
  votes: {
    enabled: false,
    // Link zur Vote-Seite der Serverliste (wird den Spielern angezeigt)
    voteUrl: 'https://palserver.de/server/palheim-251',
    // Vote-Prüfung: "list" (API der Serverliste abfragen) oder "webhook"
    check: {
      mode: 'list',
      url: '',
      apiKey: '',
      nameField: 'username',
      timeField: '',
      maxAgeHours: 24
    },
    // Geheimnis für den Webhook-Modus (?secret=...)
    webhookSecret: '',
    // Belohnung: "rcon" (echte Items, braucht PalDefender/PalGuard-Mod)
    // oder "announce" (nur Broadcast-Danksagung, funktioniert ohne Mods)
    reward: {
      mode: 'announce',
      rcon: { host: '127.0.0.1', port: 25575, password: '' },
      commands: [],
      announce: '{name} hat für den Server gevotet – danke!'
    },
    // Belohnung nur, wenn der Spieler gerade online ist
    requireOnline: true,
    votesFile: 'data/votes.json'
  }
};

// Verschachtelte Objekte (z. B. "votes") mit den Defaults zusammenführen,
// damit eine teilweise Konfiguration keine Default-Werte verliert
function deepMerge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) &&
        base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

// Liest eine Textdatei als UTF-8. Wurde sie versehentlich als Windows-1252/
// Latin-1 gespeichert (typisch für manche Windows-Editoren), enthält der
// UTF-8-Decode Ersatzzeichen (U+FFFD) – dann werden die Rohbytes stattdessen
// als Windows-1252 dekodiert, sodass Umlaute (ä ö ü ß, auch – „ " €) korrekt
// ankommen. Eine UTF-8-BOM am Dateianfang wird entfernt (sonst scheitert
// JSON.parse daran).
function readTextSmart(file) {
  const buf = fs.readFileSync(file);
  // UTF-16 (Windows-Notepad speichert als „Unicode" = UTF-16 LE mit BOM)
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return { text: buf.subarray(2).toString('utf16le'), encoding: 'utf-16le' };
  }
  if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
    return { text: new TextDecoder('utf-16be').decode(buf.subarray(2)), encoding: 'utf-16be' };
  }
  // UTF-8-BOM entfernen (sonst scheitert JSON.parse daran)
  const body = (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF)
    ? buf.subarray(3)
    : buf;
  const utf8 = body.toString('utf8');
  // Gültiges UTF-8 lässt sich verlustfrei zurück-kodieren. Diese Prüfung ist
  // sicherer als „enthält Ersatzzeichen?": Eine sonst gültige UTF-8-Datei, die
  // ein echtes U+FFFD-Zeichen enthält (z. B. weil kaputter Text von der Seite
  // zurückkopiert wurde), bliebe sonst fälschlich Windows-1252 und ALLE Umlaute
  // würden zerstört.
  if (Buffer.compare(Buffer.from(utf8, 'utf8'), body) === 0) {
    return { text: utf8, encoding: 'utf8' };
  }
  try {
    return { text: new TextDecoder('windows-1252').decode(body), encoding: 'windows-1252' };
  } catch {
    return { text: body.toString('latin1'), encoding: 'latin1' };
  }
}

function loadConfig() {
  const cfg = { ...DEFAULTS };
  const file = path.join(__dirname, 'config.json');
  if (fs.existsSync(file)) {
    try {
      const { text, encoding } = readTextSmart(file);
      if (encoding !== 'utf8') {
        console.warn(`[config] Achtung: config.json ist als ${encoding} gespeichert, ` +
          'nicht als UTF-8. Umlaute wurden automatisch umgewandelt – bitte die ' +
          'Datei bei Gelegenheit als UTF-8 speichern.');
      }
      const loaded = JSON.parse(text);
      Object.assign(cfg, loaded);
      cfg.votes = deepMerge(DEFAULTS.votes, loaded.votes);
      cfg.achievements = deepMerge(DEFAULTS.achievements, loaded.achievements);
      cfg.map = deepMerge(DEFAULTS.map, loaded.map);
      cfg.banner = deepMerge(DEFAULTS.banner, loaded.banner);
      cfg.admin = deepMerge(DEFAULTS.admin, loaded.admin);
      cfg.support = deepMerge(DEFAULTS.support, loaded.support);
    } catch (err) {
      console.error(`[config] config.json konnte nicht gelesen werden: ${err.message}`);
      process.exit(1);
    }
  }
  // Umgebungsvariablen haben Vorrang (praktisch für systemd/Docker)
  if (process.env.PORT) cfg.port = Number(process.env.PORT);
  if (process.env.HOST) cfg.host = process.env.HOST;
  if (process.env.PALWORLD_API_URL) cfg.palworldApiUrl = process.env.PALWORLD_API_URL;
  if (process.env.PALWORLD_ADMIN_PASSWORD) cfg.palworldAdminPassword = process.env.PALWORLD_ADMIN_PASSWORD;
  if (process.env.CACHE_SECONDS) cfg.cacheSeconds = Number(process.env.CACHE_SECONDS);
  if (process.env.SHOW_PLAYER_LIST) cfg.showPlayerList = process.env.SHOW_PLAYER_LIST === 'true';
  if (process.env.STATS_ENABLED) cfg.statsEnabled = process.env.STATS_ENABLED === 'true';
  if (process.env.STATS_POLL_SECONDS) cfg.statsPollSeconds = Number(process.env.STATS_POLL_SECONDS);
  return cfg;
}

const config = loadConfig();

// ---------------------------------------------------------------------------
// Server-Kontexte (Mehrserver-Betrieb)
// ---------------------------------------------------------------------------
// Ohne "servers"-Liste in der config.json läuft alles wie bisher mit genau
// einem Server aus den klassischen Feldern (palworldApiUrl, statsFile,
// map.*). Mit Liste bekommt jeder Server eigenen API-Zugang, eigene
// Statistik-/Basen-Dateien und eine eigene Farbe für die Webseite. Der erste
// Eintrag ist der Standard-Server und erbt fehlende Werte aus den
// klassischen Feldern – bestehende Daten-Dateien bleiben so erhalten.

const SERVER_FALLBACK_COLORS = [
  { color: '#2f9de4', colorDeep: '#176ba6' },   // Blau (PvE-Klassiker)
  { color: '#d64545', colorDeep: '#9c2f2f' },   // Glutrot (z. B. PvP)
  { color: '#2e7d35', colorDeep: '#1d5423' },   // Grün
  { color: '#8a63d2', colorDeep: '#5f3fa3' }    // Violett
];

function buildServers() {
  const raw = Array.isArray(config.servers) && config.servers.length > 0
    ? config.servers
    : [{}];   // Legacy-Modus: genau ein Server aus den klassischen Feldern
  return raw.map((s, i) => {
    const id = String(s.id || (i === 0 ? 'pve' : `server${i + 1}`)).slice(0, 24);
    const fallback = SERVER_FALLBACK_COLORS[i % SERVER_FALLBACK_COLORS.length];
    return {
      id,
      name: s.name || 'PalHeim',
      shortName: s.shortName || (i === 0 ? 'PvE' : id.toUpperCase()),
      mode: s.mode || (i === 0 ? 'PvE · Koop' : ''),
      description: s.description || '',
      // Kurze Fakten-Chips für die Server-Karte, z. B. ["3× EP", "2× Fangrate"]
      facts: Array.isArray(s.facts) ? s.facts.slice(0, 8).map((f) => String(f).slice(0, 24)) : [],
      address: s.address || '',
      color: s.color || fallback.color,
      colorDeep: s.colorDeep || fallback.colorDeep,
      apiUrl: s.palworldApiUrl || (i === 0 ? config.palworldApiUrl : ''),
      adminPassword: s.palworldAdminPassword ??
        (i === 0 ? config.palworldAdminPassword : ''),
      statsFile: path.join(__dirname,
        s.statsFile || (i === 0 ? config.statsFile : `data/stats-${id}.json`)),
      basesFile: path.join(__dirname,
        s.basesFile || (i === 0
          ? ((config.map && config.map.basesFile) || 'data/bases.json')
          : `data/bases-${id}.json`)),
      uploadSecret: s.uploadSecret ??
        (i === 0 ? ((config.map && config.map.uploadSecret) || '') : ''),
      // Laufzeit-Zustand (pro Server)
      statusCache: { data: null, fetchedAt: 0 },
      stats: { samples: [], peak: null, players: {}, inGameDays: null },
      statsDirty: false,
      lastStatsSave: 0,
      prevOnline: new Set(),
      prevPos: new Map(),
      basesData: { bases: [], updatedAt: null },
      mapPlayersCache: { players: null, at: 0 }
    };
  });
}

const SERVERS = buildServers();
const DEFAULT_SERVER = SERVERS[0];

function serverFromParams(searchParams) {
  const id = (searchParams.get('server') || '').trim();
  return SERVERS.find((s) => s.id === id) || DEFAULT_SERVER;
}

function serverFromId(id) {
  return SERVERS.find((s) => s.id === String(id || '').trim()) || DEFAULT_SERVER;
}

// Öffentliche Server-Metadaten (ohne API-URLs/Passwörter/Secrets!)
function publicServerInfo(srv) {
  return {
    id: srv.id,
    name: srv.name,
    shortName: srv.shortName,
    mode: srv.mode,
    description: srv.description,
    facts: srv.facts,
    address: srv.address,
    color: srv.color,
    colorDeep: srv.colorDeep
  };
}

// ---------------------------------------------------------------------------
// Palworld REST-API abfragen (mit Cache, pro Server)
// ---------------------------------------------------------------------------

async function palworldGet(srv, endpoint) {
  if (!srv.apiUrl) throw new Error('Keine API-URL konfiguriert');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const auth = Buffer.from(`admin:${srv.adminPassword}`).toString('base64');
    const res = await fetch(`${srv.apiUrl}${endpoint}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function palworldPost(srv, endpoint, body) {
  if (!srv.apiUrl) throw new Error('Keine API-URL konfiguriert');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const auth = Buffer.from(`admin:${srv.adminPassword}`).toString('base64');
    const res = await fetch(`${srv.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchServerStatus(srv) {
  try {
    const [info, metrics] = await Promise.all([
      palworldGet(srv, '/v1/api/info'),
      palworldGet(srv, '/v1/api/metrics')
    ]);

    let players = [];
    if (config.showPlayerList) {
      try {
        const data = await palworldGet(srv, '/v1/api/players');
        // Nur unbedenkliche Felder veröffentlichen (keine IPs, keine IDs!)
        players = (data.players || []).map((p) => ({
          name: p.name,
          level: p.level ?? null,
          ping: p.ping != null ? Math.round(p.ping) : null
        }));
      } catch {
        players = [];
      }
    }

    return {
      online: true,
      serverName: info.servername ?? null,
      description: info.description ?? null,
      version: info.version ?? null,
      players: {
        current: metrics.currentplayernum ?? 0,
        max: metrics.maxplayernum ?? 0,
        list: players
      },
      serverFps: metrics.serverfps ?? null,
      uptimeSeconds: metrics.uptime ?? null,
      inGameDays: metrics.days ?? null,
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      online: false,
      error: 'Palworld-Server nicht erreichbar',
      fetchedAt: new Date().toISOString()
    };
  }
}

async function getStatus(srv) {
  const now = Date.now();
  if (srv.statusCache.data && now - srv.statusCache.fetchedAt < config.cacheSeconds * 1000) {
    return srv.statusCache.data;
  }
  const data = await fetchServerStatus(srv);
  srv.statusCache = { data, fetchedAt: now };
  return data;
}

// ---------------------------------------------------------------------------
// Statistiken sammeln
// ---------------------------------------------------------------------------
// Die Palworld REST-API liefert nur Momentaufnahmen. Für Verlaufs-Statistiken
// fragt dieser Server sie regelmäßig ab und speichert die Daten in einer
// JSON-Datei:
//  - Spielerzahl-Verlauf in 5-Minuten-Buckets (7 Tage Aufbewahrung)
//  - Peak (Rekord-Spielerzahl) mit Zeitpunkt
//  - pro Spieler: Level, Spielzeit, zuerst/zuletzt gesehen (nur Name, keine IDs)

const STATS_BUCKET_SECONDS = 300;
const STATS_RETENTION_BUCKETS = (7 * 24 * 3600) / STATS_BUCKET_SECONDS;

function loadStats(srv) {
  try {
    const raw = JSON.parse(fs.readFileSync(srv.statsFile, 'utf8'));
    if (Array.isArray(raw.samples)) srv.stats.samples = raw.samples;
    if (raw.peak && typeof raw.peak.count === 'number') srv.stats.peak = raw.peak;
    if (raw.players && typeof raw.players === 'object') srv.stats.players = raw.players;
    if (typeof raw.inGameDays === 'number') srv.stats.inGameDays = raw.inGameDays;
    console.log(`[stats:${srv.id}] ${srv.stats.samples.length} Messpunkte, ` +
      `${Object.keys(srv.stats.players).length} Spieler geladen`);
  } catch {
    // Noch keine Statistik-Datei vorhanden – wird beim ersten Poll angelegt
  }
}

function saveStats(srv, force = false) {
  if (!srv.statsDirty) return;
  const now = Date.now();
  if (!force && now - srv.lastStatsSave < 60_000) return; // höchstens 1×/Minute schreiben
  try {
    fs.mkdirSync(path.dirname(srv.statsFile), { recursive: true });
    const tmp = `${srv.statsFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(srv.stats));
    fs.renameSync(tmp, srv.statsFile); // atomar ersetzen
    srv.statsDirty = false;
    srv.lastStatsSave = now;
  } catch (err) {
    console.error(`[stats:${srv.id}] Speichern fehlgeschlagen: ${err.message}`);
  }
}

// count = null bedeutet: Server war nicht erreichbar (Lücke im Chart)
// Ein Messpunkt ist [t, Spielerzahl, Server-FPS]; ältere Punkte ohne FPS
// (nur [t, count]) bleiben kompatibel – FPS ist dann undefined/null.
function recordSample(srv, count, fps = null) {
  const t = Math.floor(Date.now() / 1000 / STATS_BUCKET_SECONDS) * STATS_BUCKET_SECONDS;
  const fpsVal = fps != null ? Math.round(fps) : null;
  const last = srv.stats.samples[srv.stats.samples.length - 1];
  if (last && last[0] === t) {
    if (count != null) last[1] = Math.max(last[1] ?? 0, count);
    if (fpsVal != null) last[2] = fpsVal; // jüngster FPS-Wert im Bucket
  } else {
    srv.stats.samples.push([t, count, fpsVal]);
    if (srv.stats.samples.length > STATS_RETENTION_BUCKETS) {
      srv.stats.samples.splice(0, srv.stats.samples.length - STATS_RETENTION_BUCKETS);
    }
  }
}

function localDayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function pollStats(srv) {
  let count = null;
  let fps = null;
  const stats = srv.stats;
  try {
    const metrics = await palworldGet(srv, '/v1/api/metrics');
    count = metrics.currentplayernum ?? 0;
    fps = typeof metrics.serverfps === 'number' ? metrics.serverfps : null;
    if (typeof metrics.days === 'number') stats.inGameDays = metrics.days;

    if (count > 0) {
      const data = await palworldGet(srv, '/v1/api/players');
      const now = new Date().toISOString();
      const hour = new Date().getHours();
      const today = localDayKey();
      const minutes = config.statsPollSeconds / 60;
      const nowOnline = new Set();

      // Neuer Spielerrekord? Namen der Beteiligten für den Erfolg "Rekord-Crew" merken
      if (!stats.peak || count > stats.peak.count) {
        stats.peak = {
          count,
          at: new Date().toISOString(),
          players: (data.players || []).map((p) => p.name).filter(Boolean)
        };
      }

      for (const p of data.players || []) {
        if (!p.name) continue;
        nowOnline.add(p.name);
        const rec = stats.players[p.name] ?? (stats.players[p.name] = {
          level: null,
          firstSeen: now,
          lastSeen: now,
          minutes: 0
        });
        rec.lastSeen = now;
        if (p.level != null) rec.level = p.level;
        rec.minutes += minutes;

        // Zusatzdaten für Erfolge
        if (!srv.prevOnline.has(p.name)) rec.sessions = (rec.sessions || 0) + 1;
        if (rec.lastDay !== today) {
          rec.daysCount = (rec.daysCount || 0) + 1;
          rec.lastDay = today;
        }
        if (hour < 5) rec.nightMin = (rec.nightMin || 0) + minutes;
        else if (hour < 8) rec.morningMin = (rec.morningMin || 0) + minutes;

        // Bewegung: Distanz + besuchte Gebiete aus den Positionsdaten
        const pos = trackMovement(
          rec,
          srv.prevPos.get(p.name) || null,
          Number(p.location_x),
          Number(p.location_y)
        );
        if (pos) srv.prevPos.set(p.name, pos);

        checkAchievements(srv, p.name, rec);
      }
      srv.prevOnline = nowOnline;
      // Positionen von Spielern vergessen, die offline gingen
      // (verhindert Riesen-Deltas beim nächsten Login)
      for (const name of srv.prevPos.keys()) {
        if (!nowOnline.has(name)) srv.prevPos.delete(name);
      }
    } else {
      srv.prevOnline = new Set();
      srv.prevPos = new Map();
    }
  } catch {
    count = null;
    fps = null;
  }
  recordSample(srv, count, fps);
  srv.statsDirty = true;
  saveStats(srv);
}

// ---------------------------------------------------------------------------
// Erfolge
// ---------------------------------------------------------------------------

const { evaluate: evaluateAchievements, trackMovement } = require('./lib/achievements');

function achievementContext(srv, name) {
  return {
    // voteSystem wird weiter unten initialisiert; alle Aufrufe hier passieren
    // erst nach dem vollständigen Laden des Moduls (async/Intervall).
    // Votes zählen community-weit (eine Serverliste), daher serverunabhängig.
    voteCount: voteSystem ? voteSystem.getVoteCount(name) : 0,
    firstSampleT: srv.stats.samples.length > 0 ? srv.stats.samples[0][0] : null,
    peakPlayers: (srv.stats.peak && srv.stats.peak.players) || []
  };
}

/** Prüft auf neu freigeschaltete Erfolge und kündigt sie im Spiel an. */
function checkAchievements(srv, name, rec) {
  if (!config.achievements.enabled) return;
  const results = evaluateAchievements(name, rec, achievementContext(srv, name));
  const known = new Set(rec.ach || []);
  const fresh = results.filter((a) => a.unlocked && !known.has(a.id));
  if (fresh.length === 0) return;

  rec.ach = [...known, ...fresh.map((a) => a.id)];
  srv.statsDirty = true;

  if (config.achievements.announceUnlocks) {
    for (const a of fresh) {
      palworldPost(srv, '/v1/api/announce', {
        message: `[Erfolg] ${name} hat "${a.name}" freigeschaltet! (${a.desc})`
      }).catch(() => { /* Ansage ist nice-to-have */ });
    }
  }
}

function buildStatsResponse(srv) {
  const stats = srv.stats;
  const nowSec = Math.floor(Date.now() / 1000);
  const weekAgo = nowSec - 7 * 24 * 3600;
  const samples = stats.samples.filter(([t]) => t >= weekAgo);

  // Peak seit Mitternacht (Serverzeit)
  const midnight = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  let peakToday = null;
  for (const [t, c] of samples) {
    if (t >= midnight && c != null && (!peakToday || c > peakToday.count)) {
      peakToday = { count: c, at: new Date(t * 1000).toISOString() };
    }
  }

  let totalMinutes = 0;
  for (const p of Object.values(stats.players)) totalMinutes += p.minutes;

  const topPlayers = config.showPlayerList
    ? Object.entries(stats.players)
        .map(([name, p]) => ({
          name,
          level: p.level,
          minutes: Math.round(p.minutes),
          lastSeen: p.lastSeen
        }))
        .sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || b.minutes - a.minutes)
        .slice(0, 10)
    : [];

  // --- Verfügbarkeit & Ausfälle aus den Messpunkten (count == null = offline)
  const availability = (list) => {
    if (list.length === 0) return null;
    const up = list.filter(([, c]) => c != null).length;
    return Math.round((up / list.length) * 1000) / 10; // eine Nachkommastelle
  };
  const daySamples = samples.filter(([t]) => t >= nowSec - 24 * 3600);

  // Aufeinanderfolgende null-Buckets zu Ausfall-Perioden zusammenfassen
  const outages = [];
  let runStart = null;
  let runEnd = null;
  for (const [t, c] of samples) {
    if (c == null) {
      if (runStart == null) runStart = t;
      runEnd = t;
    } else if (runStart != null) {
      outages.push([runStart, runEnd + STATS_BUCKET_SECONDS]);
      runStart = null;
    }
  }
  if (runStart != null) outages.push([runStart, runEnd + STATS_BUCKET_SECONDS]);
  const outageList = outages
    .map(([s, e]) => ({
      start: new Date(s * 1000).toISOString(),
      end: new Date(e * 1000).toISOString(),
      minutes: Math.round((e - s) / 60)
    }))
    .slice(-8)
    .reverse();

  const lastSample = samples[samples.length - 1];
  const online = lastSample ? lastSample[1] != null : null;

  return {
    enabled: true,
    bucketSeconds: STATS_BUCKET_SECONDS,
    samples,
    peakToday,
    peakAllTime: stats.peak,
    uniquePlayers: Object.keys(stats.players).length,
    totalPlaytimeMinutes: Math.round(totalMinutes),
    inGameDays: stats.inGameDays,
    topPlayers,
    availability: { day: availability(daySamples), week: availability(samples) },
    outages: outageList,
    online,
    server: publicServerInfo(srv)
  };
}

if (config.statsEnabled) {
  SERVERS.forEach((srv, i) => {
    if (!srv.apiUrl) return;   // Server ohne API-URL: nur Platzhalter, kein Poll
    loadStats(srv);
    // Polls leicht versetzen, damit nicht alle Server gleichzeitig abgefragt werden
    setTimeout(() => {
      pollStats(srv);
      setInterval(() => pollStats(srv), config.statsPollSeconds * 1000);
    }, i * 3000);
  });
}

// ---------------------------------------------------------------------------
// Vote-Belohnungssystem
// ---------------------------------------------------------------------------

const { VoteSystem } = require('./lib/votes');

let voteSystem = null;
if (config.votes && config.votes.enabled) {
  // Votes laufen über den Standard-Server (eine Serverlisten-Seite, eine
  // Belohnung) – die Helfer werden daher fest an ihn gebunden.
  voteSystem = new VoteSystem(config.votes, {
    dataFile: path.join(__dirname, config.votes.votesFile || 'data/votes.json'),
    palworldGet: (endpoint) => palworldGet(DEFAULT_SERVER, endpoint),
    palworldPost: (endpoint, body) => palworldPost(DEFAULT_SERVER, endpoint, body)
  });
  console.log('[votes] Vote-Belohnungssystem aktiv');
}

// ---------------------------------------------------------------------------
// Live-Karte
// ---------------------------------------------------------------------------
// Spieler-Positionen kommen live aus der REST-API. Basen-Positionen stehen
// nur in der Level.sav – tools/upload-bases.py auf dem Palworld-Server
// lädt sie regelmäßig hierher hoch (POST /api/map/bases).

for (const srv of SERVERS) {
  try {
    const raw = JSON.parse(fs.readFileSync(srv.basesFile, 'utf8'));
    if (Array.isArray(raw.bases)) srv.basesData = raw;
  } catch { /* noch keine Basendaten für diesen Server */ }
}

function saveBases(srv) {
  try {
    fs.mkdirSync(path.dirname(srv.basesFile), { recursive: true });
    const tmp = `${srv.basesFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(srv.basesData));
    fs.renameSync(tmp, srv.basesFile);
  } catch (err) {
    console.error(`[map:${srv.id}] Basen speichern fehlgeschlagen: ${err.message}`);
  }
}

// Positions-Cache (eigener Abruf, /api/status enthält keine Koordinaten)
async function getMapPlayers(srv) {
  const now = Date.now();
  if (now - srv.mapPlayersCache.at < config.cacheSeconds * 1000) {
    return srv.mapPlayersCache.players;
  }
  let players = null;
  try {
    const data = await palworldGet(srv, '/v1/api/players');
    players = (data.players || [])
      .filter((p) => p.name && Number.isFinite(Number(p.location_x)) && Number.isFinite(Number(p.location_y)))
      .map((p) => ({
        name: p.name,
        level: p.level ?? null,
        x: Math.round(Number(p.location_x)),
        y: Math.round(Number(p.location_y))
      }));
  } catch {
    players = null; // Server offline
  }
  srv.mapPlayersCache = { players, at: now };
  return players;
}

// Einfaches Rate-Limit pro IP (Schutz vor Claim-Spam)
const rateBuckets = new Map();
function rateLimited(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || [];
  const recent = bucket.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  if (rateBuckets.size > 10_000) rateBuckets.clear(); // Speicher-Backstop
  return false;
}

function readJsonBody(req, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Body zu groß'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('Ungültiges JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Admin-Seite (/admin)
// ---------------------------------------------------------------------------
// Login mit Passwort aus config.json (admin.password); solange es leer ist,
// ist die Seite komplett deaktiviert. Sessions leben nur im Speicher – ein
// Neustart des Servers meldet alle Admins ab (bewusst einfach gehalten).

const ADMIN_SESSION_HOURS = 12;
const adminSessions = new Map(); // Token → { expires, user, role }

function adminEnabled() {
  if (!config.admin) return false;
  const hasUsers = config.admin.users &&
    Object.values(config.admin.users).some((p) => typeof p === 'string' && p);
  return Boolean(config.admin.password || hasUsers);
}

// Konstantzeit-Vergleich (über Hashes, damit die Längen immer gleich sind)
function passwordMatches(given, expected) {
  const ha = crypto.createHash('sha256').update(String(given)).digest();
  const hb = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Wer meldet sich an? Leerer Name (oder der konfigurierte Hauptadmin-Name)
// → Hauptadmin-Passwort; sonst Unter-Admin aus admin.users (Name egal ob
// groß/klein geschrieben). Rolle: 'haupt' darf alles, 'admin' alles außer
// Server-Neustart.
function resolveLogin(username, password) {
  const uname = String(username || '').trim().slice(0, 32);
  const mainName = String((config.admin && config.admin.name) || 'Hauptadmin').slice(0, 32);
  if (config.admin.password &&
      (!uname || uname.toLowerCase() === mainName.toLowerCase())) {
    return passwordMatches(password, config.admin.password)
      ? { user: mainName, role: 'haupt' }
      : null;
  }
  const users = (config.admin && config.admin.users) || {};
  const key = Object.keys(users).find(
    (k) => k.toLowerCase() === uname.toLowerCase()
  );
  if (key && typeof users[key] === 'string' && users[key] &&
      passwordMatches(password, users[key])) {
    return { user: key, role: 'admin' };
  }
  return null;
}

function adminSessionFromReq(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)padm=([a-f0-9]{48})/);
  if (!m) return null;
  const session = adminSessions.get(m[1]);
  if (!session || session.expires < Date.now()) {
    adminSessions.delete(m[1]);
    return null;
  }
  session.token = m[1];
  return session;
}

function newAdminSession(user, role) {
  for (const [token, session] of adminSessions) {
    if (session.expires < Date.now()) adminSessions.delete(token);
  }
  const token = crypto.randomBytes(24).toString('hex');
  adminSessions.set(token, {
    expires: Date.now() + ADMIN_SESSION_HOURS * 3600 * 1000,
    user,
    role
  });
  return token;
}

function adminCookie(req, token, maxAgeSeconds) {
  // hinter nginx/HTTPS das Secure-Flag setzen
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `padm=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

// Kick/Bann brauchen die User-ID – die liefert die REST-API nur für Spieler,
// die GERADE online sind (die Website-Statistik speichert bewusst keine IDs).
// Deshalb hier immer frisch abfragen, ohne Cache.
async function findOnlinePlayer(srv, name) {
  const data = await palworldGet(srv, '/v1/api/players');
  const wanted = String(name || '').trim().toLowerCase();
  if (!wanted) return null;
  return (data.players || []).find(
    (p) => String(p.name || '').toLowerCase() === wanted
  ) || null;
}

// Lokale Bann-Liste: Palworld bietet keine "Banns auflisten"-API. Damit man
// Banns später von der Website aus zurücknehmen kann, merken wir uns hier,
// wen wir gebannt haben (Name, User-ID, Grund, Zeitpunkt).
const bansFile = path.join(__dirname, 'data/bans.json');
let bansData = { bans: [] };
try {
  const raw = JSON.parse(fs.readFileSync(bansFile, 'utf8'));
  if (Array.isArray(raw.bans)) bansData = raw;
} catch { /* noch keine Bann-Liste */ }

function saveBans() {
  try {
    fs.mkdirSync(path.dirname(bansFile), { recursive: true });
    const tmp = `${bansFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(bansData));
    fs.renameSync(tmp, bansFile);
  } catch (err) {
    console.error(`[admin] Bann-Liste speichern fehlgeschlagen: ${err.message}`);
  }
}

// Seiten-Banner, von der Admin-Seite gepflegt. Liegt in data/banner.json und
// gewinnt gegenüber dem banner-Block der config.json (die nur beim Start
// gelesen wird) – so wirken Änderungen sofort, ohne Neustart.
const bannerFile = path.join(__dirname, 'data/banner.json');
let bannerOverride = null; // null = kein Override, config.json gilt
try {
  // readTextSmart, falls die Datei von Hand (evtl. Windows-1252) editiert wurde
  const raw = JSON.parse(readTextSmart(bannerFile).text);
  if (raw && typeof raw === 'object' && 'enabled' in raw) bannerOverride = raw;
} catch { /* kein Override gesetzt */ }

function saveBannerOverride() {
  try {
    fs.mkdirSync(path.dirname(bannerFile), { recursive: true });
    const tmp = `${bannerFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(bannerOverride));
    fs.renameSync(tmp, bannerFile);
  } catch (err) {
    console.error(`[admin] Banner speichern fehlgeschlagen: ${err.message}`);
  }
}

function effectiveBanner() {
  return bannerOverride || config.banner || {};
}

// Aktions-Protokoll: was wurde über die Website ausgeführt (Kick, Bann,
// Neustart, Ansagen, Banner …). Bewusst ohne IP-Adressen – nur Zeitpunkt,
// Aktion und Details. Maximal 200 Einträge, die ältesten fallen raus.
const ADMIN_LOG_MAX = 200;
const adminLogFile = path.join(__dirname, 'data/admin-log.json');
let adminLogData = [];
try {
  const raw = JSON.parse(fs.readFileSync(adminLogFile, 'utf8'));
  if (Array.isArray(raw)) adminLogData = raw.slice(-ADMIN_LOG_MAX);
} catch { /* noch kein Protokoll */ }

function adminLog(action, detail, user) {
  adminLogData.push({
    at: new Date().toISOString(),
    user: String(user || '–').slice(0, 32),
    action,
    detail: String(detail || '')
  });
  if (adminLogData.length > ADMIN_LOG_MAX) {
    adminLogData = adminLogData.slice(-ADMIN_LOG_MAX);
  }
  try {
    fs.mkdirSync(path.dirname(adminLogFile), { recursive: true });
    const tmp = `${adminLogFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(adminLogData));
    fs.renameSync(tmp, adminLogFile);
  } catch (err) {
    console.error(`[admin] Protokoll speichern fehlgeschlagen: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Besucher-Zähler
// ---------------------------------------------------------------------------
// Zählt Seitenaufrufe (total) und eindeutige Besucher (unique). "Eindeutig"
// wird clientseitig per localStorage-Flag bestimmt – es werden KEINE
// IP-Adressen, Cookies oder sonstigen personenbezogenen Daten gespeichert,
// nur zwei Zahlen. Persistiert in data/visits.json.

const visitsFile = path.join(__dirname, 'data/visits.json');
let visits = { total: 0, unique: 0 };
let visitsDirty = false;
let lastVisitsSave = 0;

try {
  const raw = JSON.parse(fs.readFileSync(visitsFile, 'utf8'));
  if (typeof raw.total === 'number') visits.total = raw.total;
  if (typeof raw.unique === 'number') visits.unique = raw.unique;
} catch { /* noch keine Zähler-Datei */ }

function saveVisits(force = false) {
  if (!visitsDirty) return;
  const now = Date.now();
  if (!force && now - lastVisitsSave < 5000) return; // höchstens alle 5 s schreiben
  try {
    fs.mkdirSync(path.dirname(visitsFile), { recursive: true });
    const tmp = `${visitsFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(visits));
    fs.renameSync(tmp, visitsFile);
    visitsDirty = false;
    lastVisitsSave = now;
  } catch (err) {
    console.error(`[visits] Speichern fehlgeschlagen: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Statische Dateien ausliefern
// ---------------------------------------------------------------------------

const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function serveStatic(req, res) {
  const reqUrl = new URL(req.url, 'http://localhost');
  let urlPath = decodeURIComponent(reqUrl.pathname);

  // SEO: eine kanonische URL pro Seite – alte .html-Pfade und Trailing-Slashes
  // werden dauerhaft (301) auf die saubere URL umgeleitet; Query-Parameter
  // bleiben erhalten (/karte.html?align → /karte?align)
  if (urlPath.endsWith('.html') || (urlPath !== '/' && urlPath.endsWith('/'))) {
    let clean = urlPath.replace(/\.html$/, '').replace(/\/+$/, '');
    if (clean === '' || clean === '/index') clean = '/';
    res.writeHead(301, { Location: encodeURI(clean) + reqUrl.search });
    res.end();
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';
  // Saubere URLs: /karte liefert public/karte.html aus
  else if (!path.extname(urlPath)) urlPath += '.html';

  // Pfad absichern: kein Ausbruch aus dem public-Verzeichnis
  const filePath = path.join(PUBLIC_DIR, urlPath);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Freundliche 404-Seite ausliefern (Fallback: Klartext, falls sie fehlt)
      fs.readFile(path.join(PUBLIC_DIR, '404.html'), (err404, page) => {
        if (err404) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 – Nicht gefunden');
          return;
        }
        res.writeHead(404, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(page);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const isHtml = ext === '.html';
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      // HTML immer frisch, Assets dürfen gecacht werden
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(data);
  });
}

// ---------------------------------------------------------------------------
// HTTP-Server
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  // ---- Basen-Upload für die Live-Karte (POST) ----
  if (req.method === 'POST' && pathname === '/api/map/bases') {
    // Fehlerantworten mit Klartext-Grund – sonst ist ein fehlgeschlagener
    // Cronjob-Upload aus der Ferne kaum zu diagnostizieren. Das Secret selbst
    // wird dabei natürlich nie zurückgegeben.
    if (!config.map.enabled) {
      sendJson(res, 404, { ok: false, message: 'Live-Karte ist deaktiviert (map.enabled = false).' });
      return;
    }
    const secret = searchParams.get('secret') || req.headers['x-upload-secret'] || '';
    // Ziel-Server: explizit per ?server=… – oder eindeutig über das Secret
    // (jeder Server hat sein eigenes uploadSecret)
    const requested = (searchParams.get('server') || '').trim();
    const srv = requested
      ? SERVERS.find((s) => s.id === requested)
      : SERVERS.find((s) => s.uploadSecret && s.uploadSecret === secret);
    if (!srv) {
      sendJson(res, 404, {
        ok: false,
        message: requested
          ? `Unbekannte Server-ID „${requested.slice(0, 24)}". Bekannt: ${SERVERS.map((s) => s.id).join(', ')}.`
          : 'Kein Server mit diesem Upload-Secret gefunden – Secret prüfen ' +
            '(oder Ziel-Server per ?server=<id> angeben).'
      });
      return;
    }
    if (!srv.uploadSecret) {
      sendJson(res, 404, {
        ok: false,
        message: `Für Server „${srv.id}" ist kein uploadSecret in der config.json gesetzt.`
      });
      return;
    }
    if (secret !== srv.uploadSecret) {
      sendJson(res, 403, {
        ok: false,
        message: 'Upload-Secret stimmt nicht. Prüfe den --secret-Wert gegen ' +
          'map.uploadSecret in der config.json – und starte den Web-Dienst neu, ' +
          'falls du das Secret gerade geändert hast (die config.json wird nur ' +
          'beim Start gelesen).'
      });
      return;
    }
    try {
      const body = await readJsonBody(req, 262144);
      const bases = (Array.isArray(body.bases) ? body.bases : [])
        .slice(0, 500)
        .filter((b) => Number.isFinite(Number(b.x)) && Number.isFinite(Number(b.y)))
        .map((b) => ({
          guild: String(b.guild || 'Unbekannte Gilde').slice(0, 48),
          x: Math.round(Number(b.x)),
          y: Math.round(Number(b.y))
        }));
      srv.basesData = { bases, updatedAt: new Date().toISOString() };
      saveBases(srv);
      sendJson(res, 200, { ok: true, count: bases.length, server: srv.id });
    } catch {
      sendJson(res, 400, { ok: false });
    }
    return;
  }

  // ---- Vote-Endpunkte (POST) ----
  if (req.method === 'POST' && pathname.startsWith('/api/vote/')) {
    const ip = req.socket.remoteAddress || 'unknown';

    if (pathname === '/api/vote/claim') {
      if (!voteSystem) {
        sendJson(res, 404, { ok: false, message: 'Vote-System ist nicht aktiviert.' });
        return;
      }
      if (rateLimited(ip)) {
        sendJson(res, 429, { ok: false, message: 'Zu viele Versuche – bitte kurz warten.' });
        return;
      }
      try {
        const body = await readJsonBody(req);
        const result = await voteSystem.claim(body.name);
        sendJson(res, result.ok ? 200 : 400, result);
      } catch {
        sendJson(res, 400, { ok: false, message: 'Ungültige Anfrage.' });
      }
      return;
    }

    if (pathname === '/api/vote/webhook') {
      if (!voteSystem || !config.votes.webhookSecret) {
        res.writeHead(404).end();
        return;
      }
      const secret = searchParams.get('secret') || req.headers['x-webhook-secret'] || '';
      if (secret !== config.votes.webhookSecret) {
        res.writeHead(403).end();
        return;
      }
      try {
        const body = await readJsonBody(req);
        const nameField = config.votes.check.nameField || 'username';
        const name = body[nameField] ?? body.username ?? body.name ?? body.player;
        voteSystem.registerVote(name);
        sendJson(res, 200, { ok: true });
      } catch {
        sendJson(res, 400, { ok: false });
      }
      return;
    }

    res.writeHead(404).end();
    return;
  }

  // ---- Broadcast von der Website (POST) ----
  if (req.method === 'POST' && pathname === '/api/admin/broadcast') {
    if (!config.admin || !config.admin.broadcastSecret) {
      sendJson(res, 404, { ok: false, message: 'Broadcast ist nicht aktiviert.' });
      return;
    }
    const ip = req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) {
      sendJson(res, 429, { ok: false, message: 'Zu viele Anfragen – bitte kurz warten.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const secret = body.secret || req.headers['x-admin-secret'] || '';
      if (secret !== config.admin.broadcastSecret) {
        sendJson(res, 403, { ok: false, message: 'Falsches Passwort.' });
        return;
      }
      const message = String(body.message || '').trim().slice(0, 200);
      if (!message) {
        sendJson(res, 400, { ok: false, message: 'Die Nachricht ist leer.' });
        return;
      }
      await palworldPost(serverFromId(body.server), '/v1/api/announce', { message });
      sendJson(res, 200, { ok: true, message: 'Ansage im Spiel gesendet.' });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar – Ansage nicht gesendet.' });
    }
    return;
  }

  // ---- Admin-Login (POST) ----
  if (req.method === 'POST' && pathname === '/api/admin/login') {
    if (!adminEnabled()) {
      sendJson(res, 404, { ok: false, message: 'Admin-Seite ist nicht aktiviert.' });
      return;
    }
    const ip = req.socket.remoteAddress || 'unknown';
    // strenges Limit gegen Passwort-Raten: 5 Versuche pro 10 Minuten
    if (rateLimited('admin:' + ip, 5, 10 * 60_000)) {
      sendJson(res, 429, { ok: false, message: 'Zu viele Versuche – bitte 10 Minuten warten.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const login = resolveLogin(body.username, body.password || '');
      if (!login) {
        const tried = String(body.username || '').trim().slice(0, 32);
        adminLog('Login', tried
          ? `Fehlgeschlagener Anmeldeversuch für „${tried}"`
          : 'Fehlgeschlagener Anmeldeversuch');
        sendJson(res, 403, { ok: false, message: 'Name oder Passwort falsch.' });
        return;
      }
      const token = newAdminSession(login.user, login.role);
      res.setHeader('Set-Cookie', adminCookie(req, token, ADMIN_SESSION_HOURS * 3600));
      adminLog('Login', 'Angemeldet', login.user);
      sendJson(res, 200, { ok: true, user: login.user, role: login.role });
    } catch {
      sendJson(res, 400, { ok: false, message: 'Ungültige Anfrage.' });
    }
    return;
  }

  // ---- Admin-Logout (POST) ----
  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const session = adminSessionFromReq(req);
    if (session) {
      adminSessions.delete(session.token);
      adminLog('Login', 'Abgemeldet', session.user);
    }
    res.setHeader('Set-Cookie', adminCookie(req, 'abgemeldet', 0));
    sendJson(res, 200, { ok: true });
    return;
  }

  // ---- Admin: In-Game-Ansage (POST, nur mit Login) ----
  if (req.method === 'POST' && pathname === '/api/admin/announce') {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const message = String(body.message || '').trim().slice(0, 200);
      if (!message) {
        sendJson(res, 400, { ok: false, message: 'Die Nachricht ist leer.' });
        return;
      }
      const srv = serverFromId(body.server);
      await palworldPost(srv, '/v1/api/announce', { message });
      adminLog('Ansage', `[${srv.id}] „${message.slice(0, 80)}"`, session.user);
      sendJson(res, 200, { ok: true, message: 'Ansage im Spiel gesendet.' });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar – Ansage nicht gesendet.' });
    }
    return;
  }

  // ---- Admin: Spielstand sichern (POST, nur mit Login) ----
  if (req.method === 'POST' && pathname === '/api/admin/save') {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    try {
      const body = await readJsonBody(req).catch(() => ({}));
      const srv = serverFromId(body.server);
      await palworldPost(srv, '/v1/api/save', {});
      adminLog('Spielstand', `[${srv.id}] Manuell gesichert`, session.user);
      sendJson(res, 200, { ok: true, message: 'Spielstand wird gespeichert.' });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar.' });
    }
    return;
  }

  // ---- Admin: Spielserver neu starten (POST, nur mit Login) ----
  // Gleicher Mechanismus wie der nächtliche Wartungs-Neustart: Welt speichern,
  // dann /v1/api/shutdown mit Vorwarnzeit + Ansage – die Docker-Restart-Policy
  // startet den Container anschließend automatisch wieder.
  if (req.method === 'POST' && pathname === '/api/admin/restart') {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    if (session.role !== 'haupt') {
      sendJson(res, 403, { ok: false, message: 'Nur der Hauptadmin darf den Server neu starten.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      let wait = Math.round(Number(body.waitSeconds));
      if (!Number.isFinite(wait)) wait = 60;
      wait = Math.min(600, Math.max(10, wait));
      // Umlaute sind in In-Game-Ansagen okay (UTF-8 über die REST-API; die
      // Erfolgs-Ansagen laufen seit jeher mit ü/ö ohne Probleme)
      const message = String(body.message || '').trim().slice(0, 150) ||
        `Server-Neustart in ${wait} Sekunden! Bitte Fortschritt sichern.`;
      const srv = serverFromId(body.server);
      try {
        await palworldPost(srv, '/v1/api/save', {});
      } catch { /* Shutdown speichert normalerweise ebenfalls */ }
      await palworldPost(srv, '/v1/api/shutdown', { waittime: wait, message });
      adminLog('Neustart', `[${srv.id}] Mit ${wait} s Vorwarnung ausgelöst`, session.user);
      sendJson(res, 200, {
        ok: true,
        message: `Neustart eingeleitet: Shutdown in ${wait} s, danach startet ` +
          'Docker den Server automatisch neu (Downtime ca. 1–2 Minuten).'
      });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar – Neustart nicht ausgelöst.' });
    }
    return;
  }

  // ---- Admin: Spieler kicken / bannen (POST, nur mit Login) ----
  if (req.method === 'POST' && (pathname === '/api/admin/kick' || pathname === '/api/admin/ban')) {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    const isBan = pathname === '/api/admin/ban';
    try {
      const body = await readJsonBody(req);
      const name = String(body.name || '').trim().slice(0, 32);
      const reason = String(body.message || '').trim().slice(0, 200) ||
        (isBan ? 'Du wurdest vom Server gebannt.' : 'Du wurdest vom Server gekickt.');
      if (!name) {
        sendJson(res, 400, { ok: false, message: 'Kein Spielername angegeben.' });
        return;
      }
      const srv = serverFromId(body.server);
      let player;
      try {
        player = await findOnlinePlayer(srv, name);
      } catch {
        sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar.' });
        return;
      }
      const userid = player && (player.userId || player.userid);
      if (!userid) {
        sendJson(res, 404, {
          ok: false,
          message: `„${name}" ist gerade nicht online – Kick/Bann geht nur bei Online-Spielern.`
        });
        return;
      }
      await palworldPost(srv, isBan ? '/v1/api/ban' : '/v1/api/kick', { userid, message: reason });
      if (isBan) {
        // für späteres Entbannen von der Website merken (inkl. Server)
        bansData.bans = bansData.bans.filter((b) => b.userid !== userid || b.server !== srv.id);
        bansData.bans.push({
          name: player.name, userid, reason, server: srv.id, at: new Date().toISOString()
        });
        saveBans();
      }
      adminLog(isBan ? 'Bann' : 'Kick',
        `[${srv.id}] „${player.name}" – Grund: ${reason.slice(0, 80)}`, session.user);
      sendJson(res, 200, {
        ok: true,
        message: isBan ? `„${player.name}" wurde gebannt.` : `„${player.name}" wurde gekickt.`
      });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Aktion fehlgeschlagen – Spielserver nicht erreichbar?' });
    }
    return;
  }

  // ---- Admin: Seiten-Banner setzen (POST, nur mit Login) ----
  if (req.method === 'POST' && pathname === '/api/admin/banner') {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const enabled = body.enabled === true;
      const text = String(body.text || '').trim().slice(0, 160);
      const level = ['info', 'event', 'warn'].includes(body.level) ? body.level : 'info';
      if (enabled && !text) {
        sendJson(res, 400, { ok: false, message: 'Der Banner-Text ist leer.' });
        return;
      }
      bannerOverride = { enabled, text, level, updatedAt: new Date().toISOString() };
      saveBannerOverride();
      adminLog('Banner', enabled
        ? `Aktiviert (${level}): „${text.slice(0, 80)}"`
        : 'Ausgeblendet', session.user);
      sendJson(res, 200, {
        ok: true,
        message: enabled ? 'Banner ist jetzt sichtbar.' : 'Banner ist ausgeblendet.'
      });
    } catch {
      sendJson(res, 400, { ok: false, message: 'Ungültige Anfrage.' });
    }
    return;
  }

  // ---- Admin: Spieler entbannen (POST, nur mit Login) ----
  if (req.method === 'POST' && pathname === '/api/admin/unban') {
    const session = adminEnabled() && adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const userid = String(body.userid || '').trim().slice(0, 64);
      if (!/^[A-Za-z0-9_.-]+$/.test(userid)) {
        sendJson(res, 400, { ok: false, message: 'Ungültige User-ID.' });
        return;
      }
      // Entbannen auf dem Server, auf dem der Bann ausgesprochen wurde
      // (alte Einträge ohne server-Feld → Standard-Server)
      const entry = bansData.bans.find((b) => b.userid === userid);
      const srv = serverFromId(body.server || (entry && entry.server));
      await palworldPost(srv, '/v1/api/unban', { userid });
      bansData.bans = bansData.bans.filter(
        (b) => !(b.userid === userid && serverFromId(b.server).id === srv.id)
      );
      saveBans();
      adminLog('Entbannt', `[${srv.id}] „${(entry && entry.name) || userid}"`, session.user);
      sendJson(res, 200, {
        ok: true,
        message: `„${(entry && entry.name) || userid}" wurde entbannt.`
      });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Entbannen fehlgeschlagen – Spielserver nicht erreichbar?' });
    }
    return;
  }

  // ---- Besucher-Zähler (POST) ----
  if (req.method === 'POST' && pathname === '/api/visit') {
    if (!config.visitorCounter) {
      sendJson(res, 200, { enabled: false });
      return;
    }
    const ip = req.socket.remoteAddress || 'unknown';
    // Nur zählen, wenn nicht rate-limitiert (Schutz vor Spam) – sonst nur den
    // aktuellen Stand zurückgeben, damit die Anzeige trotzdem funktioniert.
    if (!rateLimited(ip, 30, 60_000)) {
      let firstVisit = false;
      try {
        const body = await readJsonBody(req, 1024);
        firstVisit = body.firstVisit === true;
      } catch { /* Body optional */ }
      visits.total += 1;
      if (firstVisit) visits.unique += 1;
      visitsDirty = true;
      saveVisits();
    }
    sendJson(res, 200, { enabled: true, total: visits.total, unique: visits.unique });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }

  // Admin-Übersicht (nur mit Login): Live-Status + alle bekannten Spieler
  if (pathname === '/api/admin/overview') {
    if (!adminEnabled()) {
      sendJson(res, 404, { ok: false, message: 'Admin-Seite ist nicht aktiviert.' });
      return;
    }
    const session = adminSessionFromReq(req);
    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    const srv = serverFromParams(searchParams);
    const status = await getStatus(srv);
    const onlinePings = new Map(
      status.online
        ? (status.players.list || []).map((p) => [p.name, p.ping ?? null])
        : []
    );
    const players = Object.entries(srv.stats.players)
      .map(([name, p]) => ({
        name,
        level: p.level ?? null,
        minutes: Math.round(p.minutes || 0),
        sessions: p.sessions || 0,
        firstSeen: p.firstSeen || null,
        lastSeen: p.lastSeen || null,
        online: onlinePings.has(name),
        ping: onlinePings.get(name) ?? null
      }))
      .sort((a, b) => Number(b.online) - Number(a.online) ||
        String(b.lastSeen || '').localeCompare(String(a.lastSeen || '')));
    const eb = effectiveBanner();
    sendJson(res, 200, {
      ok: true,
      me: { user: session.user, role: session.role },
      server: publicServerInfo(srv),
      servers: SERVERS.map(publicServerInfo),
      status,
      players,
      bans: bansData.bans,
      log: adminLogData.slice(-30).reverse(),
      banner: {
        enabled: Boolean(eb.enabled && eb.text),
        text: eb.text || '',
        level: eb.level || 'info'
      },
      bases: { count: srv.basesData.bases.length, updatedAt: srv.basesData.updatedAt },
      visits: config.visitorCounter ? visits : null
    });
    return;
  }

  // Admin: aktuelle Server-Einstellungen (read-only, nur mit Login)
  if (pathname === '/api/admin/settings') {
    if (!adminEnabled()) {
      sendJson(res, 404, { ok: false, message: 'Admin-Seite ist nicht aktiviert.' });
      return;
    }
    if (!adminSessionFromReq(req)) {
      sendJson(res, 401, { ok: false, message: 'Nicht angemeldet.' });
      return;
    }
    try {
      const settings = await palworldGet(serverFromParams(searchParams), '/v1/api/settings');
      sendJson(res, 200, { ok: true, settings });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar.' });
    }
    return;
  }

  // Seiten-Konfiguration (Banner, Support-Karte, Server-Liste) – bewusst vom
  // Spielstatus entkoppelt
  if (pathname === '/api/site') {
    const b = effectiveBanner();
    const s = config.support;
    sendJson(res, 200, {
      banner: b && b.enabled && b.text ? { text: b.text, level: b.level || 'info' } : null,
      support: s && s.enabled && s.url ? { url: s.url, text: s.text || '' } : null,
      servers: SERVERS.map(publicServerInfo)
    });
    return;
  }

  // Alle Server mit Live-Status (für die Server-Karten der Startseite)
  if (pathname === '/api/servers') {
    const list = await Promise.all(SERVERS.map(async (srv) => {
      let online = false;
      let current = null;
      let max = null;
      let version = null;
      if (srv.apiUrl) {
        const st = await getStatus(srv);
        online = st.online === true;
        if (online) {
          current = st.players.current;
          max = st.players.max;
          version = st.version;
        }
      }
      return { ...publicServerInfo(srv), online, players: { current, max }, version };
    }));
    sendJson(res, 200, { servers: list });
    return;
  }

  // Spieler-Profil (Kennzahlen + Erfolge)
  if (pathname === '/api/player') {
    const srv = serverFromParams(searchParams);
    const enabled = config.statsEnabled && config.showPlayerList;
    const rawName = (searchParams.get('name') || '').trim().slice(0, 32);
    if (!enabled) { sendJson(res, 200, { enabled: false }); return; }
    if (!rawName) { sendJson(res, 200, { enabled: true, found: false }); return; }
    const key = Object.keys(srv.stats.players).find((k) => k.toLowerCase() === rawName.toLowerCase());
    if (!key) { sendJson(res, 200, { enabled: true, found: false }); return; }
    const p = srv.stats.players[key];
    sendJson(res, 200, {
      enabled: true,
      found: true,
      name: key,
      server: publicServerInfo(srv),
      level: p.level ?? null,
      minutes: Math.round(p.minutes || 0),
      firstSeen: p.firstSeen || null,
      lastSeen: p.lastSeen || null,
      sessions: p.sessions || 0,
      daysCount: p.daysCount || 0,
      distKm: Math.round(p.distKm || 0),
      areas: (p.cells || []).length,
      achievements: evaluateAchievements(key, p, achievementContext(srv, key))
    });
    return;
  }

  // Frontend-Infos zum Vote-System (Link, aktiv ja/nein)
  if (pathname === '/api/vote/info') {
    sendJson(res, 200, {
      enabled: Boolean(voteSystem),
      voteUrl: config.votes ? config.votes.voteUrl : ''
    });
    return;
  }

  if (pathname === '/api/status') {
    const srv = serverFromParams(searchParams);
    const status = await getStatus(srv);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify({ ...status, server: publicServerInfo(srv) }));
    return;
  }

  if (pathname === '/api/stats') {
    const srv = serverFromParams(searchParams);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(config.statsEnabled ? buildStatsResponse(srv) : { enabled: false }));
    return;
  }

  if (pathname === '/api/map') {
    // Spielernamen/-positionen respektieren dieselbe Privatsphäre-Einstellung
    if (!config.map.enabled || !config.showPlayerList) {
      sendJson(res, 200, { enabled: false });
      return;
    }
    const srv = serverFromParams(searchParams);
    const players = await getMapPlayers(srv);
    sendJson(res, 200, {
      enabled: true,
      online: players !== null,
      players: players || [],
      bases: srv.basesData.bases,
      basesUpdatedAt: srv.basesData.updatedAt,
      calibration: config.map.calibration,
      server: publicServerInfo(srv),
      servers: SERVERS.map(publicServerInfo)
    });
    return;
  }

  if (pathname === '/api/achievements') {
    const srv = serverFromParams(searchParams);
    const enabled = config.statsEnabled && config.achievements.enabled && config.showPlayerList;
    const rawName = (searchParams.get('player') || '').trim().slice(0, 32);
    if (!enabled || !rawName) {
      sendJson(res, 200, { enabled });
      return;
    }
    const key = Object.keys(srv.stats.players).find(
      (k) => k.toLowerCase() === rawName.toLowerCase()
    );
    if (!key) {
      sendJson(res, 200, { enabled: true, found: false });
      return;
    }
    sendJson(res, 200, {
      enabled: true,
      found: true,
      player: key,
      achievements: evaluateAchievements(key, srv.stats.players[key], achievementContext(srv, key))
    });
    return;
  }

  // Spieler-Profilseiten: /spieler/<name> liefert dieselbe Seite (Name kommt aus der URL)
  if (pathname === '/spieler' || pathname.startsWith('/spieler/')) {
    fs.readFile(path.join(PUBLIC_DIR, 'spieler.html'), (err, page) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 – Nicht gefunden');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(page);
    });
    return;
  }

  serveStatic(req, res);
});

// Beim Beenden ungespeicherte Daten sichern (Statistik + Besucher-Zähler)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const srv of SERVERS) saveStats(srv, true);
    saveVisits(true);
    process.exit(0);
  });
}

server.listen(config.port, config.host, () => {
  console.log(`Palworld-Webseite läuft auf http://${config.host}:${config.port}`);
  for (const srv of SERVERS) {
    console.log(`Server "${srv.id}" (${srv.name} ${srv.shortName}): ` +
      (srv.apiUrl ? `REST-API ${srv.apiUrl}` : 'KEINE API-URL – nur Platzhalter'));
    if (srv.apiUrl && !srv.adminPassword) {
      console.warn(`[Hinweis] Kein Admin-Passwort für "${srv.id}" – Live-Status wird "offline" anzeigen.`);
    }
  }
});
