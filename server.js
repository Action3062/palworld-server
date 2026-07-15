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
  statsFile: 'data/stats.json'
};

function loadConfig() {
  const cfg = { ...DEFAULTS };
  const file = path.join(__dirname, 'config.json');
  if (fs.existsSync(file)) {
    try {
      Object.assign(cfg, JSON.parse(fs.readFileSync(file, 'utf8')));
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
          level: p.level ?? null
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
function recordSample(count) {
  const t = Math.floor(Date.now() / 1000 / STATS_BUCKET_SECONDS) * STATS_BUCKET_SECONDS;
  const last = stats.samples[stats.samples.length - 1];
  if (last && last[0] === t) {
    if (count != null) last[1] = Math.max(last[1] ?? 0, count);
  } else {
    stats.samples.push([t, count]);
    if (stats.samples.length > STATS_RETENTION_BUCKETS) {
      stats.samples.splice(0, stats.samples.length - STATS_RETENTION_BUCKETS);
    }
  }
}

async function pollStats() {
  let count = null;
  try {
    const metrics = await palworldGet('/v1/api/metrics');
    count = metrics.currentplayernum ?? 0;
    if (typeof metrics.days === 'number') stats.inGameDays = metrics.days;

    if (count > 0 && (!stats.peak || count > stats.peak.count)) {
      stats.peak = { count, at: new Date().toISOString() };
    }

    if (count > 0) {
      const data = await palworldGet('/v1/api/players');
      const now = new Date().toISOString();
      for (const p of data.players || []) {
        if (!p.name) continue;
        const rec = stats.players[p.name] ?? (stats.players[p.name] = {
          level: null,
          firstSeen: now,
          lastSeen: now,
          minutes: 0
        });
        rec.lastSeen = now;
        if (p.level != null) rec.level = p.level;
        rec.minutes += config.statsPollSeconds / 60;
      }
    }
  } catch {
    count = null;
  }
  recordSample(count);
  statsDirty = true;
  saveStats();
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

  return {
    enabled: true,
    bucketSeconds: STATS_BUCKET_SECONDS,
    samples,
    peakToday,
    peakAllTime: stats.peak,
    uniquePlayers: Object.keys(stats.players).length,
    totalPlaytimeMinutes: Math.round(totalMinutes),
    inGameDays: stats.inGameDays,
    topPlayers
  };
}

if (config.statsEnabled) {
  loadStats();
  pollStats();
  setInterval(pollStats, config.statsPollSeconds * 1000);

  // Beim Beenden ungespeicherte Daten sichern
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      saveStats(true);
      process.exit(0);
    });
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
  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (urlPath === '/') urlPath = '/index.html';

  // Pfad absichern: kein Ausbruch aus dem public-Verzeichnis
  const filePath = path.join(PUBLIC_DIR, urlPath);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 – Nicht gefunden');
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
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }

  const { pathname } = new URL(req.url, 'http://localhost');

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

  serveStatic(req, res);
});

server.listen(config.port, config.host, () => {
  console.log(`Palworld-Webseite läuft auf http://${config.host}:${config.port}`);
  console.log(`Palworld REST-API: ${config.palworldApiUrl}`);
  if (!config.palworldAdminPassword) {
    console.warn('[Hinweis] Kein Admin-Passwort gesetzt – Live-Status wird "offline" anzeigen.');
    console.warn('          config.json anlegen (siehe config.example.json) oder PALWORLD_ADMIN_PASSWORD setzen.');
  }
});
