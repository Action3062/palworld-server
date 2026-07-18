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

// ---------------------------------------------------------------------------
// Konfiguration laden
// ---------------------------------------------------------------------------

const DEFAULTS = {
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
  // Broadcast von der Website (schickt eine In-Game-Ansage über die REST-API)
  admin: {
    // Langes Zufalls-Token; leer = Broadcast-Seite deaktiviert
    broadcastSecret: ''
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
      announce: '{name} hat fuer den Server gevotet - danke!'
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

function loadConfig() {
  const cfg = { ...DEFAULTS };
  const file = path.join(__dirname, 'config.json');
  if (fs.existsSync(file)) {
    try {
      const loaded = JSON.parse(fs.readFileSync(file, 'utf8'));
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
// Palworld REST-API abfragen (mit Cache)
// ---------------------------------------------------------------------------

let statusCache = { data: null, fetchedAt: 0 };

async function palworldGet(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const auth = Buffer.from(`admin:${config.palworldAdminPassword}`).toString('base64');
    const res = await fetch(`${config.palworldApiUrl}${endpoint}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function palworldPost(endpoint, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const auth = Buffer.from(`admin:${config.palworldAdminPassword}`).toString('base64');
    const res = await fetch(`${config.palworldApiUrl}${endpoint}`, {
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

async function fetchServerStatus() {
  try {
    const [info, metrics] = await Promise.all([
      palworldGet('/v1/api/info'),
      palworldGet('/v1/api/metrics')
    ]);

    let players = [];
    if (config.showPlayerList) {
      try {
        const data = await palworldGet('/v1/api/players');
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

async function getStatus() {
  const now = Date.now();
  if (statusCache.data && now - statusCache.fetchedAt < config.cacheSeconds * 1000) {
    return statusCache.data;
  }
  const data = await fetchServerStatus();
  statusCache = { data, fetchedAt: now };
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

const statsFile = path.join(__dirname, config.statsFile);

let stats = { samples: [], peak: null, players: {}, inGameDays: null };
let statsDirty = false;
let lastStatsSave = 0;

function loadStats() {
  try {
    const raw = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    if (Array.isArray(raw.samples)) stats.samples = raw.samples;
    if (raw.peak && typeof raw.peak.count === 'number') stats.peak = raw.peak;
    if (raw.players && typeof raw.players === 'object') stats.players = raw.players;
    if (typeof raw.inGameDays === 'number') stats.inGameDays = raw.inGameDays;
    console.log(`[stats] ${stats.samples.length} Messpunkte, ${Object.keys(stats.players).length} Spieler geladen`);
  } catch {
    // Noch keine Statistik-Datei vorhanden – wird beim ersten Poll angelegt
  }
}

function saveStats(force = false) {
  if (!statsDirty) return;
  const now = Date.now();
  if (!force && now - lastStatsSave < 60_000) return; // höchstens 1×/Minute schreiben
  try {
    fs.mkdirSync(path.dirname(statsFile), { recursive: true });
    const tmp = `${statsFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(stats));
    fs.renameSync(tmp, statsFile); // atomar ersetzen
    statsDirty = false;
    lastStatsSave = now;
  } catch (err) {
    console.error(`[stats] Speichern fehlgeschlagen: ${err.message}`);
  }
}

// count = null bedeutet: Server war nicht erreichbar (Lücke im Chart)
// Ein Messpunkt ist [t, Spielerzahl, Server-FPS]; ältere Punkte ohne FPS
// (nur [t, count]) bleiben kompatibel – FPS ist dann undefined/null.
function recordSample(count, fps = null) {
  const t = Math.floor(Date.now() / 1000 / STATS_BUCKET_SECONDS) * STATS_BUCKET_SECONDS;
  const fpsVal = fps != null ? Math.round(fps) : null;
  const last = stats.samples[stats.samples.length - 1];
  if (last && last[0] === t) {
    if (count != null) last[1] = Math.max(last[1] ?? 0, count);
    if (fpsVal != null) last[2] = fpsVal; // jüngster FPS-Wert im Bucket
  } else {
    stats.samples.push([t, count, fpsVal]);
    if (stats.samples.length > STATS_RETENTION_BUCKETS) {
      stats.samples.splice(0, stats.samples.length - STATS_RETENTION_BUCKETS);
    }
  }
}

// Wer war beim letzten Poll online? (für Session-Zählung)
let prevOnline = new Set();
// Letzte bekannte Position pro Spieler (für Distanz-Tracking)
let prevPos = new Map();

function localDayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function pollStats() {
  let count = null;
  let fps = null;
  try {
    const metrics = await palworldGet('/v1/api/metrics');
    count = metrics.currentplayernum ?? 0;
    fps = typeof metrics.serverfps === 'number' ? metrics.serverfps : null;
    if (typeof metrics.days === 'number') stats.inGameDays = metrics.days;

    if (count > 0) {
      const data = await palworldGet('/v1/api/players');
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
        if (!prevOnline.has(p.name)) rec.sessions = (rec.sessions || 0) + 1;
        if (rec.lastDay !== today) {
          rec.daysCount = (rec.daysCount || 0) + 1;
          rec.lastDay = today;
        }
        if (hour < 5) rec.nightMin = (rec.nightMin || 0) + minutes;
        else if (hour < 8) rec.morningMin = (rec.morningMin || 0) + minutes;

        // Bewegung: Distanz + besuchte Gebiete aus den Positionsdaten
        const pos = trackMovement(
          rec,
          prevPos.get(p.name) || null,
          Number(p.location_x),
          Number(p.location_y)
        );
        if (pos) prevPos.set(p.name, pos);

        checkAchievements(p.name, rec);
      }
      prevOnline = nowOnline;
      // Positionen von Spielern vergessen, die offline gingen
      // (verhindert Riesen-Deltas beim nächsten Login)
      for (const name of prevPos.keys()) {
        if (!nowOnline.has(name)) prevPos.delete(name);
      }
    } else {
      prevOnline = new Set();
      prevPos = new Map();
    }
  } catch {
    count = null;
    fps = null;
  }
  recordSample(count, fps);
  statsDirty = true;
  saveStats();
}

// ---------------------------------------------------------------------------
// Erfolge
// ---------------------------------------------------------------------------

const { evaluate: evaluateAchievements, trackMovement } = require('./lib/achievements');

function achievementContext(name) {
  return {
    // voteSystem wird weiter unten initialisiert; alle Aufrufe hier passieren
    // erst nach dem vollständigen Laden des Moduls (async/Intervall)
    voteCount: voteSystem ? voteSystem.getVoteCount(name) : 0,
    firstSampleT: stats.samples.length > 0 ? stats.samples[0][0] : null,
    peakPlayers: (stats.peak && stats.peak.players) || []
  };
}

/** Prüft auf neu freigeschaltete Erfolge und kündigt sie im Spiel an. */
function checkAchievements(name, rec) {
  if (!config.achievements.enabled) return;
  const results = evaluateAchievements(name, rec, achievementContext(name));
  const known = new Set(rec.ach || []);
  const fresh = results.filter((a) => a.unlocked && !known.has(a.id));
  if (fresh.length === 0) return;

  rec.ach = [...known, ...fresh.map((a) => a.id)];
  statsDirty = true;

  if (config.achievements.announceUnlocks) {
    for (const a of fresh) {
      palworldPost('/v1/api/announce', {
        message: `[Erfolg] ${name} hat "${a.name}" freigeschaltet! (${a.desc})`
      }).catch(() => { /* Ansage ist nice-to-have */ });
    }
  }
}

function buildStatsResponse() {
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
    online
  };
}

if (config.statsEnabled) {
  loadStats();
  pollStats();
  setInterval(pollStats, config.statsPollSeconds * 1000);
}

// ---------------------------------------------------------------------------
// Vote-Belohnungssystem
// ---------------------------------------------------------------------------

const { VoteSystem } = require('./lib/votes');

let voteSystem = null;
if (config.votes && config.votes.enabled) {
  voteSystem = new VoteSystem(config.votes, {
    dataFile: path.join(__dirname, config.votes.votesFile || 'data/votes.json'),
    palworldGet,
    palworldPost
  });
  console.log('[votes] Vote-Belohnungssystem aktiv');
}

// ---------------------------------------------------------------------------
// Live-Karte
// ---------------------------------------------------------------------------
// Spieler-Positionen kommen live aus der REST-API. Basen-Positionen stehen
// nur in der Level.sav – tools/upload-bases.py auf dem Palworld-Server
// lädt sie regelmäßig hierher hoch (POST /api/map/bases).

const basesFile = path.join(__dirname, (config.map && config.map.basesFile) || 'data/bases.json');
let basesData = { bases: [], updatedAt: null };
try {
  const raw = JSON.parse(fs.readFileSync(basesFile, 'utf8'));
  if (Array.isArray(raw.bases)) basesData = raw;
} catch { /* noch keine Basendaten */ }

function saveBases() {
  try {
    fs.mkdirSync(path.dirname(basesFile), { recursive: true });
    const tmp = `${basesFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(basesData));
    fs.renameSync(tmp, basesFile);
  } catch (err) {
    console.error(`[map] Basen speichern fehlgeschlagen: ${err.message}`);
  }
}

// Positions-Cache (eigener Abruf, /api/status enthält keine Koordinaten)
let mapPlayersCache = { players: null, at: 0 };

async function getMapPlayers() {
  const now = Date.now();
  if (now - mapPlayersCache.at < config.cacheSeconds * 1000) {
    return mapPlayersCache.players;
  }
  let players = null;
  try {
    const data = await palworldGet('/v1/api/players');
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
  mapPlayersCache = { players, at: now };
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
    if (!config.map.enabled || !config.map.uploadSecret) {
      res.writeHead(404).end();
      return;
    }
    const secret = searchParams.get('secret') || req.headers['x-upload-secret'] || '';
    if (secret !== config.map.uploadSecret) {
      res.writeHead(403).end();
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
      basesData = { bases, updatedAt: new Date().toISOString() };
      saveBases();
      sendJson(res, 200, { ok: true, count: bases.length });
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
      await palworldPost('/v1/api/announce', { message });
      sendJson(res, 200, { ok: true, message: 'Ansage im Spiel gesendet.' });
    } catch {
      sendJson(res, 502, { ok: false, message: 'Spielserver nicht erreichbar – Ansage nicht gesendet.' });
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

  // Seiten-Konfiguration (Banner, Support-Karte) – bewusst vom Spielstatus entkoppelt
  if (pathname === '/api/site') {
    const b = config.banner;
    const s = config.support;
    sendJson(res, 200, {
      banner: b && b.enabled && b.text ? { text: b.text, level: b.level || 'info' } : null,
      support: s && s.enabled && s.url ? { url: s.url, text: s.text || '' } : null
    });
    return;
  }

  // Spieler-Profil (Kennzahlen + Erfolge)
  if (pathname === '/api/player') {
    const enabled = config.statsEnabled && config.showPlayerList;
    const rawName = (searchParams.get('name') || '').trim().slice(0, 32);
    if (!enabled) { sendJson(res, 200, { enabled: false }); return; }
    if (!rawName) { sendJson(res, 200, { enabled: true, found: false }); return; }
    const key = Object.keys(stats.players).find((k) => k.toLowerCase() === rawName.toLowerCase());
    if (!key) { sendJson(res, 200, { enabled: true, found: false }); return; }
    const p = stats.players[key];
    sendJson(res, 200, {
      enabled: true,
      found: true,
      name: key,
      level: p.level ?? null,
      minutes: Math.round(p.minutes || 0),
      firstSeen: p.firstSeen || null,
      lastSeen: p.lastSeen || null,
      sessions: p.sessions || 0,
      daysCount: p.daysCount || 0,
      distKm: Math.round(p.distKm || 0),
      areas: (p.cells || []).length,
      achievements: evaluateAchievements(key, p, achievementContext(key))
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
    const status = await getStatus();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(status));
    return;
  }

  if (pathname === '/api/stats') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(config.statsEnabled ? buildStatsResponse() : { enabled: false }));
    return;
  }

  if (pathname === '/api/map') {
    // Spielernamen/-positionen respektieren dieselbe Privatsphäre-Einstellung
    if (!config.map.enabled || !config.showPlayerList) {
      sendJson(res, 200, { enabled: false });
      return;
    }
    const players = await getMapPlayers();
    sendJson(res, 200, {
      enabled: true,
      online: players !== null,
      players: players || [],
      bases: basesData.bases,
      basesUpdatedAt: basesData.updatedAt,
      calibration: config.map.calibration
    });
    return;
  }

  if (pathname === '/api/achievements') {
    const enabled = config.statsEnabled && config.achievements.enabled && config.showPlayerList;
    const rawName = (searchParams.get('player') || '').trim().slice(0, 32);
    if (!enabled || !rawName) {
      sendJson(res, 200, { enabled });
      return;
    }
    const key = Object.keys(stats.players).find(
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
      achievements: evaluateAchievements(key, stats.players[key], achievementContext(key))
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
    saveStats(true);
    saveVisits(true);
    process.exit(0);
  });
}

server.listen(config.port, config.host, () => {
  console.log(`Palworld-Webseite läuft auf http://${config.host}:${config.port}`);
  console.log(`Palworld REST-API: ${config.palworldApiUrl}`);
  if (!config.palworldAdminPassword) {
    console.warn('[Hinweis] Kein Admin-Passwort gesetzt – Live-Status wird "offline" anzeigen.');
    console.warn('          config.json anlegen (siehe config.example.json) oder PALWORLD_ADMIN_PASSWORD setzen.');
  }
});
