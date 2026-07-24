// Admin-Seite: Login, Live-Übersicht, Ansage, Spielstand sichern.
// Auth läuft über ein HttpOnly-Session-Cookie (setzt der Server beim Login).
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const loginView = $('admLoginView');
  const disabledView = $('admDisabledView');
  const dashView = $('admDashView');
  const logoutBtn = $('admLogout');

  let refreshTimer = null;

  document.getElementById('year').textContent = new Date().getFullYear();

  function show(view) {
    for (const v of [loginView, disabledView, dashView]) v.hidden = v !== view;
    logoutBtn.hidden = view !== dashView;
  }

  function setMsg(el, text, ok) {
    el.textContent = text;
    el.classList.toggle('is-ok', ok);
    el.classList.toggle('is-error', !ok);
    el.hidden = false;
  }

  function fmtAgo(iso) {
    if (!iso) return '–';
    const diffMin = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);
    if (diffMin < 2) return 'gerade eben';
    if (diffMin < 60) return `vor ${Math.round(diffMin)} min`;
    if (diffMin < 36 * 60) return `vor ${Math.round(diffMin / 60)} h`;
    return `vor ${Math.round(diffMin / 1440)} Tagen`;
  }

  function fmtMinutes(min) {
    if (min < 60) return `${min} min`;
    return `${Math.round(min / 60)} h`;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  let lastPlayers = [];   // für die Kick/Bann-Buttons (Name über Index statt HTML)
  let lastBans = [];
  let bannerFormTouched = false;   // Auto-Refresh soll Eingaben nicht überschreiben
  let admServer = '';              // ausgewählter Server (Mehrserver-Betrieb)
  let admServers = [];             // bekannte Server aus der Übersicht

  const srvQuery = () => (admServer ? `?server=${encodeURIComponent(admServer)}` : '');
  const srvName = () => {
    const s = admServers.find((x) => x.id === admServer);
    return s ? `${s.name} ${s.shortName}` : 'Server';
  };

  function renderServerTabs(data) {
    const box = $('admServerTabs');
    admServers = data.servers || [];
    admServer = (data.server && data.server.id) || admServer;
    if (admServers.length < 2) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '';
    for (const s of admServers) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'server-tab' + (s.id === admServer ? ' is-active' : '');
      b.style.setProperty('--sc', s.color);
      b.textContent = s.shortName || s.id;
      b.addEventListener('click', () => {
        if (s.id === admServer) return;
        admServer = s.id;
        settingsLoaded = false;   // Einstellungen gelten pro Server
        $('admSettingsBox').open = false;
        loadOverview();
      });
      box.appendChild(b);
    }
  }

  function renderOverview(data) {
    lastPlayers = data.players || [];
    lastBans = data.bans || [];
    renderServerTabs(data);
    const st = data.status || {};
    const online = st.online === true;
    const statusEl = $('admStatus');
    statusEl.textContent = online ? 'Online' : 'Offline';
    statusEl.classList.toggle('is-online', online);
    statusEl.classList.toggle('is-offline', !online);
    $('admVersion').textContent = online && st.version ? `Version ${st.version}` : '';
    $('admPlayers').textContent = online ? (st.players?.current ?? 0) : '–';
    $('admPlayersMax').textContent = online ? `von ${st.players?.max ?? '?'} Plätzen` : '';
    $('admFps').textContent = online && st.serverFps != null ? st.serverFps : '–';
    $('admBases').textContent = data.bases?.count ?? '–';
    $('admBasesHint').textContent = data.bases?.updatedAt
      ? `Stand: ${fmtAgo(data.bases.updatedAt)}` : 'noch kein Upload';
    $('admVisits').textContent = data.visits ? data.visits.unique : '–';
    $('admVisitsHint').textContent = data.visits ? `${data.visits.total} Aufrufe gesamt` : '';
    const me = data.me || {};
    const who = me.user
      ? `Angemeldet als ${me.user} (${me.role === 'haupt' ? 'Hauptadmin' : 'Admin'}) · `
      : '';
    $('admUpdated').textContent =
      `${who}aktualisiert ${new Date().toLocaleTimeString('de-DE')} Uhr · lädt alle 30 Sekunden neu.`;
    $('admRestartBlock').hidden = me.role !== 'haupt';

    const rows = lastPlayers.map((p, i) => `
      <tr>
        <td>${p.online ? '🟢 ' : ''}${esc(p.name)}</td>
        <td class="num">${p.level ?? '–'}</td>
        <td class="num">${fmtMinutes(p.minutes)}</td>
        <td class="num">${p.sessions}</td>
        <td class="num">${p.online && p.ping != null ? `${Math.round(p.ping)} ms` : '–'}</td>
        <td>${p.online ? 'jetzt online' : fmtAgo(p.lastSeen)}</td>
        <td class="adm-actions">${p.online
          ? `<button class="btn btn--tiny" data-kick="${i}">Kick</button>
             <button class="btn btn--tiny btn--danger" data-ban="${i}">Bann</button>`
          : ''}</td>
      </tr>`).join('');
    $('admPlayerRows').innerHTML =
      rows || '<tr><td colspan="7">Noch keine Spieler-Daten.</td></tr>';

    const logRows = (data.log || []).map((e) => `
      <tr>
        <td>${e.at ? new Date(e.at).toLocaleString('de-DE',
          { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–'}</td>
        <td>${esc(e.user || '–')}</td>
        <td>${esc(e.action || '–')}</td>
        <td>${esc(e.detail || '')}</td>
      </tr>`).join('');
    $('admLogRows').innerHTML =
      logRows || '<tr><td colspan="4">Noch keine Einträge.</td></tr>';

    const banRows = lastBans.map((b, i) => `
      <tr>
        <td>${esc(b.name || b.userid)}${admServers.length > 1 && b.server
          ? ` <small>[${esc(b.server)}]</small>` : ''}</td>
        <td>${esc(b.reason || '–')}</td>
        <td>${b.at ? new Date(b.at).toLocaleDateString('de-DE') : '–'}</td>
        <td class="adm-actions"><button class="btn btn--tiny" data-unban="${i}">Entbannen</button></td>
      </tr>`).join('');
    $('admBanRows').innerHTML = banRows;
    $('admBansBlock').hidden = lastBans.length === 0;

    // Banner-Formular nur beim ersten Laden vorbefüllen – nicht bei jedem
    // Auto-Refresh, sonst überschreibt er, was der Admin gerade tippt
    if (!bannerFormTouched && data.banner) {
      $('admBannerOn').checked = data.banner.enabled;
      $('admBannerText').value = data.banner.text || '';
      $('admBannerLevel').value = data.banner.level || 'info';
    }
  }

  // ---- Kick / Bann / Entbannen (Buttons über Event-Delegation) ----
  async function playerAction(url, payload, confirmText) {
    if (!window.confirm(confirmText)) return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      setMsg($('admActionMsg'), data.message || (res.ok ? 'Erledigt.' : 'Fehler.'), res.ok);
      if (res.status === 401) { show(loginView); stopRefresh(); return; }
      if (res.ok) loadOverview();
    } catch {
      setMsg($('admActionMsg'), 'Netzwerkfehler – Aktion nicht ausgeführt.', false);
    }
  }

  document.addEventListener('click', (e) => {
    const kick = e.target.closest('[data-kick]');
    const ban = e.target.closest('[data-ban]');
    const unban = e.target.closest('[data-unban]');
    if (kick) {
      const p = lastPlayers[Number(kick.dataset.kick)];
      if (!p) return;
      const reason = window.prompt(`Grund für den Kick von „${p.name}" (wird dem Spieler angezeigt):`,
        'Bitte beachte die Serverregeln.');
      if (reason === null) return;
      playerAction('/api/admin/kick', { name: p.name, message: reason, server: admServer },
        `„${p.name}" wirklich vom Server kicken?`);
    } else if (ban) {
      const p = lastPlayers[Number(ban.dataset.ban)];
      if (!p) return;
      const reason = window.prompt(`Grund für den BANN von „${p.name}" (wird dem Spieler angezeigt):`,
        'Verstoß gegen die Serverregeln.');
      if (reason === null) return;
      playerAction('/api/admin/ban', { name: p.name, message: reason, server: admServer },
        `„${p.name}" wirklich DAUERHAFT bannen?\n\nEntbannen geht später über die Liste unten.`);
    } else if (unban) {
      const b = lastBans[Number(unban.dataset.unban)];
      if (!b) return;
      playerAction('/api/admin/unban', { userid: b.userid, server: b.server || '' },
        `Bann von „${b.name || b.userid}" wirklich aufheben?`);
    }
  });

  async function loadOverview() {
    let res;
    try {
      res = await fetch(`/api/admin/overview${srvQuery()}`, { cache: 'no-store' });
    } catch {
      return; // Netzwerkfehler: nächster Refresh versucht es erneut
    }
    if (res.status === 404) { show(disabledView); stopRefresh(); return; }
    if (res.status === 401) { show(loginView); stopRefresh(); return; }
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (!data) return;
    show(dashView);
    renderOverview(data);
  }

  function startRefresh() {
    stopRefresh();
    refreshTimer = setInterval(loadOverview, 30000);
  }
  function stopRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = null;
  }

  // ---- Login ----
  $('admLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('admLoginBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: $('admUser').value.trim(),
          password: $('admPassword').value
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        $('admPassword').value = '';
        $('admLoginMsg').hidden = true;
        await loadOverview();
        startRefresh();
      } else {
        setMsg($('admLoginMsg'), data.message || 'Anmeldung fehlgeschlagen.', false);
      }
    } catch {
      setMsg($('admLoginMsg'), 'Netzwerkfehler – bitte erneut versuchen.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Logout ----
  logoutBtn.addEventListener('click', async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch { /* egal */ }
    stopRefresh();
    show(loginView);
  });

  // ---- Seiten-Banner ----
  for (const id of ['admBannerOn', 'admBannerText', 'admBannerLevel']) {
    $(id).addEventListener('input', () => { bannerFormTouched = true; });
  }
  $('admBannerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('admBannerBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: $('admBannerOn').checked,
          text: $('admBannerText').value.trim(),
          level: $('admBannerLevel').value
        })
      });
      const data = await res.json().catch(() => ({}));
      setMsg($('admBannerMsg'), data.message || (res.ok ? 'Gespeichert.' : 'Fehler.'), res.ok);
      if (res.status === 401) { show(loginView); stopRefresh(); return; }
      if (res.ok) bannerFormTouched = false;
    } catch {
      setMsg($('admBannerMsg'), 'Netzwerkfehler – nicht gespeichert.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Ansage ----
  const msgEl = $('admMessage');
  msgEl.addEventListener('input', () => { $('admCount').textContent = msgEl.value.length; });
  $('admAnnounceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('admAnnounceBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgEl.value.trim(), server: admServer })
      });
      const data = await res.json().catch(() => ({}));
      setMsg($('admAnnounceMsg'), data.message || (res.ok ? 'Gesendet.' : 'Fehler.'), res.ok);
      if (res.ok) { msgEl.value = ''; $('admCount').textContent = '0'; }
      if (res.status === 401) { show(loginView); stopRefresh(); }
    } catch {
      setMsg($('admAnnounceMsg'), 'Netzwerkfehler – Ansage nicht gesendet.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Spielstand sichern ----
  $('admSaveBtn').addEventListener('click', async () => {
    const btn = $('admSaveBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: admServer })
      });
      const data = await res.json().catch(() => ({}));
      setMsg($('admSaveMsg'), data.message || (res.ok ? 'Gespeichert.' : 'Fehler.'), res.ok);
      if (res.status === 401) { show(loginView); stopRefresh(); }
    } catch {
      setMsg($('admSaveMsg'), 'Netzwerkfehler.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Server neustarten (mit doppelter Absicherung) ----
  $('admRestartBtn').addEventListener('click', async () => {
    const input = window.prompt('Vorwarnzeit in Sekunden (10–600):', '60');
    if (input === null) return;
    const wait = Math.round(Number(input));
    if (!Number.isFinite(wait) || wait < 10 || wait > 600) {
      setMsg($('admRestartMsg'), 'Bitte eine Zahl zwischen 10 und 600 angeben.', false);
      return;
    }
    const which = admServers.length > 1 ? ` (${srvName()})` : '';
    const sure = window.confirm(
      `Spielserver${which} WIRKLICH neu starten?\n\n` +
      `• Alle Spieler werden im Spiel gewarnt\n` +
      `• Die Welt wird gespeichert\n` +
      `• Shutdown in ${wait} Sekunden, danach startet Docker den Server neu\n` +
      `• Downtime ca. 1–2 Minuten`
    );
    if (!sure) return;
    const btn = $('admRestartBtn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitSeconds: wait, server: admServer })
      });
      const data = await res.json().catch(() => ({}));
      setMsg($('admRestartMsg'), data.message || (res.ok ? 'Neustart eingeleitet.' : 'Fehler.'), res.ok);
      if (res.status === 401) { show(loginView); stopRefresh(); }
    } catch {
      setMsg($('admRestartMsg'), 'Netzwerkfehler – Neustart nicht ausgelöst.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Server-Einstellungen (lazy: erst beim Aufklappen laden) ----
  let settingsLoaded = false;
  $('admSettingsBox').addEventListener('toggle', async (e) => {
    if (!e.target.open || settingsLoaded) return;
    settingsLoaded = true;
    try {
      const res = await fetch(`/api/admin/settings${srvQuery()}`, { cache: 'no-store' });
      if (res.status === 401) { show(loginView); stopRefresh(); return; }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.settings) {
        settingsLoaded = false; // beim nächsten Aufklappen erneut versuchen
        $('admSettingsRows').innerHTML =
          `<tr><td colspan="2">${(data && data.message) || 'Einstellungen nicht abrufbar.'}</td></tr>`;
        return;
      }
      const rows = Object.entries(data.settings)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${esc(String(v))}</td></tr>`)
        .join('');
      $('admSettingsRows').innerHTML =
        rows || '<tr><td colspan="2">Keine Einstellungen erhalten.</td></tr>';
    } catch {
      settingsLoaded = false;
      $('admSettingsRows').innerHTML =
        '<tr><td colspan="2">Netzwerkfehler – bitte erneut aufklappen.</td></tr>';
    }
  });

  // Start: Session prüfen (vorhandenes Cookie → direkt Dashboard)
  loadOverview().then(() => {
    if (!dashView.hidden) startRefresh();
  });
})();
