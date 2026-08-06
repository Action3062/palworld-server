'use strict';

// Vote-Belohnungssystem
// ---------------------
// Spieler voten auf einer oder mehreren Serverlisten und holen sich danach
// über die Webseite eine In-Game-Belohnung ab. Jede Liste zählt einzeln:
// pro Liste und Tag ein Claim.
//
// Vote-Prüfung, drei Modi (pro Liste konfigurierbar):
//  - "list":     Die Serverliste bietet eine API, die die letzten Votes als
//                JSON liefert. URL kommt aus der Config (Dashboard der Liste).
//  - "webhook":  Die Serverliste ruft bei jedem Vote unseren Webhook auf
//                (POST /api/vote/webhook?secret=...). Wir merken uns die Votes.
//  - "topgames": top-games.net / Top-Serveurs. WICHTIG: deren claim-Endpunkt
//                prüft UND verbraucht den Vote in einem Aufruf. Er darf deshalb
//                erst laufen, wenn die Belohnung auch ankommen kann (Spieler
//                online) - und ein verbrauchter Vote, dessen Belohnung
//                fehlschlägt, wird als "pending" gemerkt, damit der Spieler
//                es ohne neuen Vote nochmal versuchen kann.
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
const TOPGAMES_URL =
  'https://api.top-games.net/v1/votes/claim-username?server_token={token}&playername={name}';

class VoteSystem {
  /**
   * @param {object} cfg   der "votes"-Block aus der config.json
   * @param {object} deps  { dataFile, palworldGet, palworldPost }
   */
  constructor(cfg, deps) {
    this.cfg = cfg;
    this.deps = deps;
    this.dataFile = deps.dataFile;

    // Listen normalisieren: neue "providers"-Liste oder die Alt-Config
    // (voteUrl + check auf oberster Ebene) als eine einzelne Liste.
    const raw = Array.isArray(cfg.providers) && cfg.providers.length
      ? cfg.providers
      : [{ id: 'default', voteUrl: cfg.voteUrl, check: cfg.check, legacy: true }];
    this.providers = raw.map((p, i) => ({
      id: String(p.id || `list${i + 1}`),
      label: p.label || VoteSystem.hostLabel(p.voteUrl),
      voteUrl: p.voteUrl || '',
      check: p.check || {},
      // legacy: Claims von vor der Mehrlisten-Umstellung wurden ohne
      // Listen-Präfix gespeichert; die Alt-Liste erkennt sie weiterhin an
      legacy: Boolean(p.legacy)
    }));

    // { claims: { "<liste>|<name lower>": "YYYY-MM-DD" }, recentVotes: [{name, at}],
    //   voteCounts: { "<name lower>": n } – Gesamtzahl abgeholter Belohnungen,
    //   pending: { "<liste>|<name lower>": "YYYY-MM-DD" } – Vote schon bei der
    //   Liste eingelöst, Belohnung steht noch aus }
    this.data = { claims: {}, recentVotes: [], voteCounts: {}, pending: {} };
    this.listCaches = new Map(); // Listen-API-Antworten, je Liste 60 s
    this.load();
  }

  static hostLabel(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '').replace(/^de\./, '');
    } catch {
      return 'Serverliste';
    }
  }

  load() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
      if (raw.claims) this.data.claims = raw.claims;
      if (Array.isArray(raw.recentVotes)) this.data.recentVotes = raw.recentVotes;
      if (raw.voteCounts) this.data.voteCounts = raw.voteCounts;
      if (raw.pending) this.data.pending = raw.pending;
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

  /** Liefert die Votes der Serverlisten-API einer Liste (gecacht, 60 s). */
  async fetchVoteList(provider) {
    const now = Date.now();
    const check = provider.check;
    const cacheMs = (check.cacheSeconds ?? 60) * 1000;
    const cached = this.listCaches.get(provider.id);
    if (cached && now - cached.fetchedAt < cacheMs) return cached.votes;
    const url = String(check.url || '').replaceAll('{apiKey}', check.apiKey || '');
    if (!url.startsWith('http')) {
      throw new Error(`Vote-API-URL der Liste "${provider.id}" ist nicht konfiguriert`);
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
      this.listCaches.set(provider.id, { votes: list, fetchedAt: now });
      return list;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Hat dieser Spieler auf dieser Liste innerhalb von maxAgeHours gevotet? */
  async hasVoted(name, provider) {
    const check = provider.check;
    const maxAgeMs = (check.maxAgeHours || 24) * 3600 * 1000;
    const cutoff = Date.now() - maxAgeMs;
    const wanted = name.toLowerCase();

    if (check.mode === 'webhook') {
      return this.data.recentVotes.some(
        (v) => v.at > cutoff && v.name.toLowerCase() === wanted
      );
    }

    const list = await this.fetchVoteList(provider);
    return list.some((entry) => {
      const entryName = VoteSystem.entryName(entry, check.nameField);
      if (entryName.toLowerCase() !== wanted) return false;
      const t = VoteSystem.entryTime(entry, check.timeField);
      return t == null ? true : t > cutoff;
    });
  }

  /**
   * Konsumierender Vote-Check (top-games.net): Ein GET auf claim-username
   * prüft den ältesten offenen Vote UND löst ihn bei der Liste ein.
   * Antwort enthält "claimed": 1, wenn ein Vote eingelöst wurde.
   */
  async claimAtList(name, check) {
    const url = String(check.url || TOPGAMES_URL)
      .replaceAll('{token}', check.serverToken || '')
      .replaceAll('{name}', encodeURIComponent(name));
    if (!check.serverToken && !check.url) {
      throw new Error('serverToken der top-games-Liste ist nicht konfiguriert');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; PalHeim-VoteChecker/1.0)'
        },
        signal: controller.signal
      });
      // 5xx = Liste hat ein Problem -> als Fehler melden, damit der Spieler
      // es spaeter nochmal versucht statt "kein Vote" zu lesen
      if (res.status >= 500) throw new Error(`Vote-API antwortet mit HTTP ${res.status}`);
      if (!res.ok) return false; // 4xx: kein offener Vote / Name unbekannt
      const body = await res.json().catch(() => ({}));
      return body.claimed === 1 || body.claimed === true || body.claimed === '1';
    } finally {
      clearTimeout(timer);
    }
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

  claimKey(provider, name) {
    return `${provider.id}|${name.toLowerCase()}`;
  }

  hasClaimedToday(name, provider) {
    const today = this.todayKey();
    if (this.data.claims[this.claimKey(provider, name)] === today) return true;
    // Claims aus der Zeit vor der Mehrlisten-Umstellung (Schluessel ohne Praefix)
    return provider.legacy && this.data.claims[name.toLowerCase()] === today;
  }

  markClaimed(name, provider) {
    // alte Einträge gelegentlich ausmisten
    const today = this.todayKey();
    for (const [key, day] of Object.entries(this.data.claims)) {
      if (day !== today) delete this.data.claims[key];
    }
    for (const [key, day] of Object.entries(this.data.pending)) {
      if (day !== today) delete this.data.pending[key];
    }
    const key = this.claimKey(provider, name);
    delete this.data.pending[key];
    this.data.claims[key] = today;
    const nameKey = name.toLowerCase();
    this.data.voteCounts[nameKey] = (this.data.voteCounts[nameKey] || 0) + 1;
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
   * Kompletter Claim-Ablauf über alle Listen. Liefert { ok, code, message }.
   */
  async claim(rawName) {
    const name = String(rawName || '').trim().slice(0, 32);
    if (name.length < 2) {
      return { ok: false, code: 'invalid_name', message: 'Bitte gib deinen In-Game-Namen ein.' };
    }

    const open = this.providers.filter((p) => !this.hasClaimedToday(name, p));
    if (open.length === 0) {
      return { ok: false, code: 'already_claimed', message: 'Du hast deine Belohnung heute schon abgeholt. Morgen wieder!' };
    }

    // Online-Pruefung VOR den Vote-Checks: der top-games-Check verbraucht den
    // Vote und darf erst laufen, wenn die Belohnung auch ankommen kann.
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

    // Jede noch offene Liste prüfen; Fehler einzelner Listen blockieren die
    // anderen nicht
    const today = this.todayKey();
    const won = [];
    let checkFailed = false;
    for (const provider of open) {
      const key = this.claimKey(provider, name);
      let voted = false;
      if (this.data.pending[key] === today) {
        voted = true; // Vote gestern-heute schon bei der Liste eingelöst, Belohnung fehlte
      } else {
        try {
          if (provider.check.mode === 'topgames') {
            voted = await this.claimAtList(name, provider.check);
            if (voted) {
              // ab hier ist der Vote bei der Liste verbraucht - merken, damit
              // eine fehlgeschlagene Belohnung nachgeholt werden kann
              this.data.pending[key] = today;
              this.save();
            }
          } else {
            voted = await this.hasVoted(name, provider);
          }
        } catch (err) {
          checkFailed = true;
          console.error(`[votes] Vote-Prüfung (${provider.id}) fehlgeschlagen: ${err.message}`);
          continue;
        }
      }
      if (voted) won.push(provider);
    }

    if (won.length === 0) {
      if (checkFailed) {
        return { ok: false, code: 'check_failed', message: 'Vote-Prüfung derzeit nicht möglich – versuch es gleich nochmal.' };
      }
      return { ok: false, code: 'no_vote', message: 'Kein Vote gefunden. Erst voten – es kann ein paar Minuten dauern, bis der Vote ankommt.' };
    }

    // Belohnung je Liste vergeben
    let granted = 0;
    for (const provider of won) {
      try {
        await this.grantReward(player);
        granted++;
        this.markClaimed(name, provider);
      } catch (err) {
        console.error(`[votes] Belohnung (${provider.id}) fehlgeschlagen: ${err.message}`);
      }
    }
    if (granted === 0) {
      // pending bleibt gesetzt: der naechste Versuch ueberspringt den
      // Vote-Check der Liste und holt nur die Belohnung nach
      return { ok: false, code: 'reward_failed', message: 'Belohnung konnte nicht vergeben werden – das Team wurde informiert.' };
    }

    return {
      ok: true,
      code: 'claimed',
      message: granted > 1
        ? `Danke fürs Voten auf ${granted} Listen! Deine Belohnungen sind unterwegs. 🎉`
        : 'Danke fürs Voten! Deine Belohnung ist unterwegs. 🎉'
    };
  }
}

module.exports = { VoteSystem };
