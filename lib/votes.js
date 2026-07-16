'use strict';

// Vote-Belohnungssystem
// ---------------------
// Spieler voten auf einer Serverliste (z. B. palserver.de) und holen sich
// danach über die Webseite eine In-Game-Belohnung ab.
//
// Vote-Prüfung, zwei Modi:
//  - "list":    Die Serverliste bietet eine API, die die letzten Votes als
//               JSON liefert. URL kommt aus der Config (Dashboard der Liste).
//  - "webhook": Die Serverliste ruft bei jedem Vote unseren Webhook auf
//               (POST /api/vote/webhook?secret=...). Wir merken uns die Votes.
//
// Belohnung, zwei Modi:
//  - "rcon":     Befehle über RCON ausführen – echte Items brauchen einen
//                Server-Mod wie PalDefender/PalGuard (giveitem ...).
//  - "announce": Nur eine Broadcast-Nachricht über die offizielle REST-API
//                (funktioniert ohne Mods).

const fs = require('fs');
const path = require('path');
const { rconExec } = require('./rcon');

const DAY_MS = 24 * 3600 * 1000;

class VoteSystem {
  /**
   * @param {object} cfg   der "votes"-Block aus der config.json
   * @param {object} deps  { dataFile, palworldGet, palworldPost }
   */
  constructor(cfg, deps) {
    this.cfg = cfg;
    this.deps = deps;
    this.dataFile = deps.dataFile;
    // { claims: { "<name lower>": "YYYY-MM-DD" }, recentVotes: [{name, at}],
    //   voteCounts: { "<name lower>": n } – Gesamtzahl abgeholter Belohnungen }
    this.data = { claims: {}, recentVotes: [], voteCounts: {} };
    this.listCache = { votes: null, fetchedAt: 0 };
    this.load();
  }

  load() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
      if (raw.claims) this.data.claims = raw.claims;
      if (Array.isArray(raw.recentVotes)) this.data.recentVotes = raw.recentVotes;
      if (raw.voteCounts) this.data.voteCounts = raw.voteCounts;
    } catch {
      /* noch keine Datei */
    }
  }

  save() {
    try {
      fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });
      const tmp = `${this.dataFile}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data));
      fs.renameSync(tmp, this.dataFile);
    } catch (err) {
      console.error(`[votes] Speichern fehlgeschlagen: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------- Votes

  /** Webhook-Vote registrieren (Name kommt von der Serverliste). */
  registerVote(name) {
    if (!name) return;
    const cutoff = Date.now() - 2 * DAY_MS;
    this.data.recentVotes = this.data.recentVotes.filter((v) => v.at > cutoff);
    this.data.recentVotes.push({ name: String(name).slice(0, 64), at: Date.now() });
    this.save();
  }

  /** Liefert die Votes der Serverlisten-API (gecacht, 60 s). */
  async fetchVoteList() {
    const now = Date.now();
    if (this.listCache.votes && now - this.listCache.fetchedAt < 60_000) {
      return this.listCache.votes;
    }
    const check = this.cfg.check || {};
    const url = String(check.url || '').replaceAll('{apiKey}', check.apiKey || '');
    if (!url.startsWith('http')) {
      throw new Error('Vote-API-URL ist nicht konfiguriert (votes.check.url)');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const headers = {
        Accept: 'application/json',
        // manche Listen (Cloudflare) blocken Anfragen ohne Browser-Kennung
        'User-Agent': 'Mozilla/5.0 (compatible; PalHeim-VoteChecker/1.0)'
      };
      if (check.apiKey) headers.Authorization = `Bearer ${check.apiKey}`;
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) throw new Error(`Vote-API antwortet mit HTTP ${res.status}`);
      const body = await res.json();
      // übliche Verpackungen auspacken: [..] | {votes:[..]} | {data:[..]} | {result:[..]}
      const list = Array.isArray(body)
        ? body
        : body.votes || body.data || body.result || [];
      this.listCache = { votes: list, fetchedAt: now };
      return list;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Hat dieser Spieler innerhalb der letzten maxAgeHours gevotet? */
  async hasVoted(name) {
    const check = this.cfg.check || {};
    const maxAgeMs = (check.maxAgeHours || 24) * 3600 * 1000;
    const cutoff = Date.now() - maxAgeMs;
    const wanted = name.toLowerCase();

    if (check.mode === 'webhook') {
      return this.data.recentVotes.some(
        (v) => v.at > cutoff && v.name.toLowerCase() === wanted
      );
    }

    const list = await this.fetchVoteList();
    return list.some((entry) => {
      const entryName = VoteSystem.entryName(entry, check.nameField);
      if (entryName.toLowerCase() !== wanted) return false;
      const t = VoteSystem.entryTime(entry, check.timeField);
      return t == null ? true : t > cutoff;
    });
  }

  /** Spielernamen aus einem Vote-Eintrag lesen (übliche Feldnamen werden erkannt). */
  static entryName(entry, configured) {
    if (configured && entry[configured] != null) return String(entry[configured]);
    for (const key of ['username', 'name', 'player', 'playername', 'player_name', 'nickname', 'voter']) {
      if (entry[key] != null) return String(entry[key]);
    }
    return '';
  }

  /** Zeitstempel aus einem Vote-Eintrag lesen; null = kein Zeitfeld gefunden. */
  static entryTime(entry, configured) {
    const keys = configured
      ? [configured]
      : ['created_at', 'createdAt', 'timestamp', 'voted_at', 'votedAt', 'time', 'date'];
    for (const key of keys) {
      if (entry[key] == null) continue;
      const raw = entry[key];
      // Unix-Sekunden, Unix-Millisekunden oder Datums-String
      const t = typeof raw === 'number'
        ? (raw < 1e12 ? raw * 1000 : raw)
        : new Date(raw).getTime();
      if (!Number.isNaN(t)) return t;
    }
    return null;
  }

  // --------------------------------------------------------------- Claims

  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  hasClaimedToday(name) {
    return this.data.claims[name.toLowerCase()] === this.todayKey();
  }

  markClaimed(name) {
    // alte Einträge gelegentlich ausmisten
    const today = this.todayKey();
    for (const [key, day] of Object.entries(this.data.claims)) {
      if (day !== today) delete this.data.claims[key];
    }
    const key = name.toLowerCase();
    this.data.claims[key] = today;
    this.data.voteCounts[key] = (this.data.voteCounts[key] || 0) + 1;
    this.save();
  }

  /** Gesamtzahl abgeholter Vote-Belohnungen (für Erfolge). */
  getVoteCount(name) {
    return this.data.voteCounts[String(name).toLowerCase()] || 0;
  }

  // -------------------------------------------------------------- Rewards

  /** Spieler online? Liefert den Spieler-Eintrag der REST-API oder null. */
  async findOnlinePlayer(name) {
    const data = await this.deps.palworldGet('/v1/api/players');
    const wanted = name.toLowerCase();
    return (data.players || []).find(
      (p) => String(p.name || '').toLowerCase() === wanted
    ) || null;
  }

  /** Führt die konfigurierte Belohnung aus. */
  async grantReward(player) {
    const reward = this.cfg.reward || {};
    // Platzhalter füllen; {name} wird für RCON-Befehle abgesichert
    const safeName = String(player.name).replace(/[^\p{L}\p{N} _.\-]/gu, '');
    const userId = String(player.userId || '');
    const steamId = userId.replace(/^steam_/, '');

    if (reward.mode === 'rcon') {
      const commands = (reward.commands || []).map((tpl) =>
        tpl
          .replaceAll('{steamid}', steamId)
          .replaceAll('{userid}', userId)
          .replaceAll('{name}', safeName)
      );
      if (commands.length === 0) throw new Error('Keine reward.commands konfiguriert');
      await rconExec(reward.rcon || {}, commands);
    }

    // Broadcast-Danksagung (in beiden Modi, wenn konfiguriert)
    if (reward.announce) {
      const message = reward.announce.replaceAll('{name}', String(player.name));
      try {
        await this.deps.palworldPost('/v1/api/announce', { message });
      } catch {
        /* Ansage ist nice-to-have – Belohnung zählt */
      }
    }
  }

  // ----------------------------------------------------------------- Flow

  /**
   * Kompletter Claim-Ablauf. Liefert { ok, code, message }.
   */
  async claim(rawName) {
    const name = String(rawName || '').trim().slice(0, 32);
    if (name.length < 2) {
      return { ok: false, code: 'invalid_name', message: 'Bitte gib deinen In-Game-Namen ein.' };
    }

    if (this.hasClaimedToday(name)) {
      return { ok: false, code: 'already_claimed', message: 'Du hast deine Belohnung heute schon abgeholt. Morgen wieder!' };
    }

    let voted;
    try {
      voted = await this.hasVoted(name);
    } catch (err) {
      console.error(`[votes] Vote-Prüfung fehlgeschlagen: ${err.message}`);
      return { ok: false, code: 'check_failed', message: 'Vote-Prüfung derzeit nicht möglich – versuch es gleich nochmal.' };
    }
    if (!voted) {
      return { ok: false, code: 'no_vote', message: 'Kein Vote gefunden. Erst voten – es kann ein paar Minuten dauern, bis der Vote ankommt.' };
    }

    let player = { name, userId: '' };
    if (this.cfg.requireOnline !== false) {
      let online;
      try {
        online = await this.findOnlinePlayer(name);
      } catch {
        return { ok: false, code: 'server_offline', message: 'Der Spielserver ist gerade nicht erreichbar – versuch es gleich nochmal.' };
      }
      if (!online) {
        return { ok: false, code: 'not_online', message: `"${name}" ist gerade nicht auf dem Server eingeloggt. Erst einloggen, dann abholen!` };
      }
      player = online;
    }

    try {
      await this.grantReward(player);
    } catch (err) {
      console.error(`[votes] Belohnung fehlgeschlagen: ${err.message}`);
      return { ok: false, code: 'reward_failed', message: 'Belohnung konnte nicht vergeben werden – das Team wurde informiert.' };
    }

    this.markClaimed(name);
    return { ok: true, code: 'claimed', message: 'Danke fürs Voten! Deine Belohnung ist unterwegs. 🎉' };
  }
}

module.exports = { VoteSystem };
