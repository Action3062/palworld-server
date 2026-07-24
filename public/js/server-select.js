/* PalHeim – Server-Auswahl (Mehrserver-Betrieb)
   Stellt window.PalServers bereit: welche Server es gibt (/api/site), welcher
   gerade ausgewählt ist (?server= → localStorage → erster Server) und die
   Umschalt-Tabs (alle Elemente mit [data-server-tabs]). Bei nur EINEM Server
   bleibt alles unsichtbar und alle Seiten verhalten sich wie bisher. */
(() => {
  'use strict';

  const KEY = 'palheim.server';
  const params = new URLSearchParams(location.search);
  let servers = [];
  let current = params.get('server') || null;
  if (!current) {
    try { current = localStorage.getItem(KEY); } catch { /* egal */ }
  }

  const listeners = [];

  const api = {
    list: () => servers,
    multi: () => servers.length > 1,
    current: () => servers.find((s) => s.id === current) || servers[0] || null,
    id: () => (api.current() ? api.current().id : ''),
    // Query-Anhang für API-Aufrufe/Links – leer im Ein-Server-Betrieb
    query: (sep = '?') => (api.multi() && api.id() ? `${sep}server=${encodeURIComponent(api.id())}` : ''),
    onChange: (fn) => listeners.push(fn),

    select(id) {
      if (!servers.some((s) => s.id === id) || id === current) return;
      current = id;
      try { localStorage.setItem(KEY, id); } catch { /* egal */ }
      // URL teilbar halten (?server=…), ohne Neuladen
      try {
        const url = new URL(location.href);
        url.searchParams.set('server', id);
        history.replaceState(null, '', url);
      } catch { /* egal */ }
      api.renderTabs();
      for (const fn of listeners) {
        try { fn(api.current()); } catch { /* Listener-Fehler nicht eskalieren */ }
      }
    },

    renderTabs() {
      document.querySelectorAll('[data-server-tabs]').forEach((box) => {
        if (!api.multi()) { box.hidden = true; return; }
        box.hidden = false;
        box.innerHTML = '';
        for (const s of servers) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'server-tab' + (s.id === api.id() ? ' is-active' : '');
          b.style.setProperty('--sc', s.color);
          b.style.setProperty('--sc-deep', s.colorDeep);
          b.textContent = s.shortName || s.id;
          b.setAttribute('aria-pressed', String(s.id === api.id()));
          b.addEventListener('click', () => api.select(s.id));
          box.appendChild(b);
        }
      });
    }
  };

  api.ready = fetch('/api/site', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      servers = (data && Array.isArray(data.servers)) ? data.servers : [];
      if (!servers.some((s) => s.id === current)) {
        current = servers[0] ? servers[0].id : null;
      }
      api.renderTabs();
      return api;
    })
    .catch(() => api);

  window.PalServers = api;
})();
