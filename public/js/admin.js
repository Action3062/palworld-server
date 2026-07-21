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

  function renderOverview(data) {
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
    $('admUpdated').textContent =
      `Aktualisiert ${new Date().toLocaleTimeString('de-DE')} Uhr · lädt alle 30 Sekunden neu.`;

    const rows = (data.players || []).map((p) => `
      <tr>
        <td>${p.online ? '🟢 ' : ''}${esc(p.name)}</td>
        <td class="num">${p.level ?? '–'}</td>
        <td class="num">${fmtMinutes(p.minutes)}</td>
        <td class="num">${p.sessions}</td>
        <td>${p.online ? 'jetzt online' : fmtAgo(p.lastSeen)}</td>
      </tr>`).join('');
    $('admPlayerRows').innerHTML =
      rows || '<tr><td colspan="5">Noch keine Spieler-Daten.</td></tr>';
  }

  async function loadOverview() {
    let res;
    try {
      res = await fetch('/api/admin/overview', { cache: 'no-store' });
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
        body: JSON.stringify({ password: $('admPassword').value })
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
        body: JSON.stringify({ message: msgEl.value.trim() })
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
      const res = await fetch('/api/admin/save', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setMsg($('admSaveMsg'), data.message || (res.ok ? 'Gespeichert.' : 'Fehler.'), res.ok);
      if (res.status === 401) { show(loginView); stopRefresh(); }
    } catch {
      setMsg($('admSaveMsg'), 'Netzwerkfehler.', false);
    } finally {
      btn.disabled = false;
    }
  });

  // Start: Session prüfen (vorhandenes Cookie → direkt Dashboard)
  loadOverview().then(() => {
    if (!dashView.hidden) startRefresh();
  });
})();
