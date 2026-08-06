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
// Belohnung, drei Modi:
//  - "rcon":     Befehle über RCON ausführen – echte Items brauchen einen
//                Server-Mod wie PalDefender/PalGuard (giveitem ...).
//  - "announce": Nur eine Broadcast-Nachricht über die offizielle REST-API
//                (funktioniert ohne Mods).
//  - "discord":  Nichts im Spiel. Stattdessen optional eine Meldung in einen
//                Discord-Kanal (Webhook) und/oder eine Voter-Rolle per
//                Discord-Bot. Die Rolle braucht eine Verknüpfung
//                Spielername -> Discord-User-ID (data/discord-links.json,
//                gepflegt über das Admin-Interface).

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
    // Spielername -> Discord-User-ID (fuer die Voter-Rolle)
    this.linksFile = deps.linksFile
      || path.join(path.dirname(deps.dataFile || '.'), 'discord-links.json');

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
   * prüft den jüngsten Vote der letzten 2 Stunden UND löst ihn bei der
   * Liste ein. Antwort: claimed 1 = eingelöst, 2 = Vote schon früher
   * eingelöst, 0 = kein Vote im Fenster.
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
      const body = await res.json().catch(() => ({}));
      if (res.ok || body.claimed != null) {
        return body.claimed === 1 || body.claimed === true || body.claimed === '1';
      }
      // 4xx ohne claimed-Feld: "not voted" heisst wirklich kein Vote, alles
      // andere (WrongParams/ServerNotFound) ist ein Konfigurationsproblem -
      // dem Spieler nicht faelschlich "kein Vote" melden
      if (/not voted/i.test(String(body.message || ''))) return false;
      throw new Error(`Vote-API: HTTP ${res.status} ${String(body.message || '')}`.trim());
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

  // ---- Discord-Verknüpfungen (Spielername -> Discord-User-ID) ----

  loadLinks() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.linksFile, 'utf8'));
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  }

  saveLinks(links) {
    fs.mkdirSync(path.dirname(this.linksFile), { recursive: true });
    const tmp = `${this.linksFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(links, null, 2));
    fs.renameSync(tmp, this.linksFile);
  }

  /** Verknüpfung setzen (discordId leer = löschen). Liefert die neue Map. */
  setLink(name, discordId) {
    const links = this.loadLinks();
    const key = String(name).trim().toLowerCase();
    if (!key) throw new Error('Spielername fehlt');
    const id = String(discordId || '').trim();
    if (id) {
      if (!/^\d{15,21}$/.test(id)) {
        throw new Error('Das sieht nicht nach einer Discord-ID aus (Rechtsklick auf den Nutzer → „ID kopieren").');
      }
      links[key] = id;
    } else {
      delete links[key];
    }
    this.saveLinks(links);
    return links;
  }

  /**
   * Soll die Webseite das Discord-Verknuepfungs-Formular zeigen?
   * Ja, wenn die Voter-Rolle konfiguriert und dieser Name unverknuepft ist.
   */
  suggestLinkFor(name) {
    const reward = this.cfg.reward || {};
    const d = reward.discord || {};
    return reward.mode === 'discord' && Boolean(d.botToken) && Boolean(d.roleId)
      && !this.loadLinks()[String(name).toLowerCase()];
  }

  /**
   * Selbstverknüpfung über den /verknuepfen-Slash-Befehl. Die Discord-ID
   * kommt signiert von Discord selbst und ist damit fälschungssicher; nur
   * das Übernehmen eines Namens, der schon einem ANDEREN Discord-Konto
   * gehört, wird abgelehnt (das darf nur ein Admin ändern).
   */
  linkFromDiscord(rawName, discordId) {
    const name = String(rawName || '').trim().slice(0, 32);
    if (name.length < 2) {
      return { ok: false, message: 'Bitte gib deinen In-Game-Namen an.' };
    }
    const existing = this.loadLinks()[name.toLowerCase()];
    if (existing && existing !== String(discordId)) {
      return {
        ok: false,
        message: `„${name}" ist schon mit einem anderen Discord-Konto verknüpft. Wenn das dein Name ist, melde dich bei einem Admin.`
      };
    }
    this.setLink(name, discordId);
    return {
      ok: true,
      message: `✅ „${name}" ist jetzt mit deinem Discord verknüpft – deine Voter-Rolle kommt beim nächsten Vote automatisch!`
    };
  }

  /** Discord-Belohnung: Kanal-Meldung per Webhook, Voter-Rolle per Bot. */
  async grantDiscord(player, provider) {
    const d = (this.cfg.reward || {}).discord || {};
    const count = this.getVoteCount(player.name) + 1; // markClaimed folgt erst danach
    const fill = (tpl) => String(tpl)
      .replaceAll('{name}', String(player.name))
      .replaceAll('{list}', provider ? provider.label : 'der Serverliste')
      .replaceAll('{count}', String(count));

    // Meldung in den Kanal (Webhook) - nice-to-have, Fehler nicht fatal
    if (d.webhookUrl) {
      try {
        const content = fill(d.message
          || '🗳️ **{name}** hat auf {list} für PalHeim gevotet – danke! ({count}. Belohnung)');
        await fetch(d.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, allowed_mentions: { parse: [] } })
        });
      } catch (err) {
        console.error(`[votes] Discord-Meldung fehlgeschlagen: ${err.message}`);
      }
    }

    // Voter-Rolle vergeben - nur wenn Bot konfiguriert UND Spieler verknüpft.
    // Ohne Verknüpfung ist das kein Fehler: die Meldung oben kam trotzdem an,
    // und die Rolle kommt beim ersten Claim nach dem Verknüpfen.
    if (d.botToken && d.guildId && d.roleId) {
      const discordId = this.loadLinks()[String(player.name).toLowerCase()];
      if (discordId) {
        try {
          await this.assignVoterRole(discordId);
        } catch (err) {
          console.error(`[votes] Voter-Rolle fuer ${player.name}: ${err.message}`);
        }
      }
    }
  }

  /** Voter-Rolle per Bot-REST-API vergeben (idempotent). */
  async assignVoterRole(discordId) {
    const d = (this.cfg.reward || {}).discord || {};
    if (!(d.botToken && d.guildId && d.roleId)) return;
    const url = `https://discord.com/api/v10/guilds/${d.guildId}/members/${discordId}/roles/${d.roleId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bot ${d.botToken}` }
    });
    // 204 = vergeben (auch wenn schon vorhanden); 404 = User nicht auf dem
    // Discord-Server; 403 = Bot-Rechte/Rollen-Hierarchie
    if (!res.ok && res.status !== 204) {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  /**
   * Verknüpfung über das Formular auf der Webseite (nach dem Abholen).
   * Gleiche Schutzregeln wie der Slash-Befehl; hat der Spieler heute schon
   * abgeholt, wird die Rolle direkt nachgereicht.
   */
  async linkFromWebsite(rawName, rawId) {
    const id = String(rawId || '').trim();
    if (!/^\d{15,21}$/.test(id)) {
      return { ok: false, message: 'Das sieht nicht nach einer Discord-ID aus – Rechtsklick auf deinen Namen in Discord → „ID kopieren" (Entwicklermodus nötig).' };
    }
    const base = this.linkFromDiscord(rawName, id);
    if (!base.ok) return base;

    const name = String(rawName || '').trim();
    const claimedToday = this.providers.some((p) => this.hasClaimedToday(name, p));
    if (claimedToday) {
      try {
        await this.assignVoterRole(id);
        return { ok: true, message: '✅ Verknüpft – deine Voter-Rolle ist unterwegs!' };
      } catch (err) {
        console.error(`[votes] Voter-Rolle beim Verknuepfen: ${err.message}`);
      }
    }
    return { ok: true, message: '✅ Verknüpft – die Voter-Rolle kommt mit deiner nächsten Vote-Belohnung.' };
  }

  /** Führt die konfigurierte Belohnung aus. */
  async grantReward(player, provider) {
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

    if (reward.mode === 'discord') {
      await this.grantDiscord(player, provider);
    }

    // Broadcast-Danksagung (zusätzlich in jedem Modus, wenn konfiguriert)
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
      // suggestLink auch hier: wer heute schon abgeholt hat, aber noch nicht
      // verknuepft ist, soll das Formular trotzdem sehen
      return {
        ok: false,
        code: 'already_claimed',
        message: 'Du hast deine Belohnung heute schon abgeholt. Morgen wieder!',
        suggestLink: this.suggestLinkFor(name)
      };
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
        await this.grantReward(player, provider);
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

    // Eigener Danke-Text aus der Config (z. B. Hinweis auf die Discord-Rolle)
    const reward = this.cfg.reward || {};
    const custom = reward.successMessage;
    const message = custom
      ? String(custom).replaceAll('{count}', String(granted))
      : (granted > 1
        ? `Danke fürs Voten auf ${granted} Listen! Deine Belohnungen sind unterwegs. 🎉`
        : 'Danke fürs Voten! Deine Belohnung ist unterwegs. 🎉');
    return { ok: true, code: 'claimed', message, suggestLink: this.suggestLinkFor(name) };
  }
}

module.exports = { VoteSystem };
