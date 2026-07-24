/* PalHeim – Frontend-Logik
   Live-Status, Kopier-Buttons, mobile Navigation, Scroll-Reveal */

(() => {
  'use strict';

  // -------------------------------------------------------------
  // Live-Status: /api/status abrufen und Seite aktualisieren
  // -------------------------------------------------------------

  const REFRESH_INTERVAL = 30_000;

  const el = {
    statusDot: document.querySelector('[data-status-dot]'),
    statusText: document.querySelector('[data-status-text]'),
    status: document.querySelector('[data-stat="status"]'),
    statusHint: document.querySelector('[data-stat="statusHint"]'),
    players: document.querySelector('[data-stat="players"]'),
    maxPlayers: document.querySelector('[data-stat="maxPlayers"]'),
    version: document.querySelector('[data-stat="version"]'),
    versionHint: document.querySelector('[data-stat="versionHint"]'),
    uptime: document.querySelector('[data-stat="uptime"]'),
    fps: document.querySelector('[data-stat="fps"]'),
    playerListWrap: document.getElementById('playerListWrap'),
    playerList: document.getElementById('playerList'),
    lastUpdated: document.getElementById('lastUpdated')
  };

  function formatUptime(seconds) {
    if (seconds == null) return '–';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  }

  // Lange Versionsnummern (v1.0.1.100619) sprengen die Kachel: Kurzversion
  // groß anzeigen, Build-Nummer in die Unterzeile. Passt ein unbekanntes
  // Format trotzdem nicht, wird die Schrift automatisch verkleinert.
  function setVersion(raw) {
    const v = raw || '–';
    const m = /^(v?\d+\.\d+(?:\.\d+)?)\.(\d{4,})$/.exec(v);
    el.version.classList.remove('stat-card__value--fit');
    if (m) {
      el.version.textContent = m[1];
      if (el.versionHint) el.versionHint.textContent = `Build ${m[2]} · Dedicated Server`;
      return;
    }
    el.version.textContent = v;
    if (v.length > 9) el.version.classList.add('stat-card__value--fit');
    if (el.versionHint) el.versionHint.textContent = 'Palworld Dedicated Server';
  }

  function renderOnline(data) {
    el.statusDot.classList.add('is-online');
    el.statusDot.classList.remove('is-offline');
    el.statusText.textContent = `Server online · ${data.players.current}/${data.players.max} Spieler`;

    el.status.textContent = 'Online';
    el.status.classList.add('is-online');
    el.status.classList.remove('is-offline');
    el.statusHint.textContent = 'Alles läuft rund';

    el.players.textContent = data.players.current;
    el.maxPlayers.textContent = data.players.max || '–';
    setVersion(data.version);
    el.uptime.textContent = formatUptime(data.uptimeSeconds);
    el.fps.textContent = data.serverFps != null ? Math.round(data.serverFps) : '–';

    // Spielerliste (nur wenn der Server sie mitliefert)
    const list = data.players.list || [];
    if (list.length > 0) {
      el.playerList.innerHTML = '';
      for (const p of list) {
        const li = document.createElement('li');
        const nameLink = document.createElement('a');
        nameLink.className = 'player-list__link';
        nameLink.href = `/spieler/${encodeURIComponent(p.name)}` +
          (window.PalServers ? window.PalServers.query() : '');
        nameLink.textContent = p.name;
        li.appendChild(nameLink);
        const details = [];
        if (p.level != null) details.push(`Lv. ${p.level}`);
        if (p.ping != null) details.push(`${p.ping} ms`);
        if (details.length > 0) {
          const info = document.createElement('span');
          info.textContent = details.join(' · ');
          li.appendChild(info);
        }
        el.playerList.appendChild(li);
      }
      el.playerListWrap.hidden = false;
    } else {
      el.playerListWrap.hidden = true;
    }
  }

  function renderOffline() {
    el.statusDot.classList.add('is-offline');
    el.statusDot.classList.remove('is-online');
    el.statusText.textContent = 'Server offline';

    el.status.textContent = 'Offline';
    el.status.classList.add('is-offline');
    el.status.classList.remove('is-online');
    el.statusHint.textContent = 'Wartung oder Update – Infos im Discord';

    el.players.textContent = '–';
    setVersion(null);
    el.uptime.textContent = '–';
    el.fps.textContent = '–';
    el.playerListWrap.hidden = true;
  }

  async function refreshStatus() {
    try {
      const q = window.PalServers ? window.PalServers.query() : '';
      const res = await fetch(`/api/status${q}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.online) {
        renderOnline(data);
      } else {
        renderOffline();
      }
      el.lastUpdated.textContent = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      renderOffline();
      el.lastUpdated.textContent = 'Fehler beim Abrufen';
    }
  }

  // -------------------------------------------------------------
  // Server-Karten (nur im Mehrserver-Betrieb sichtbar)
  // -------------------------------------------------------------

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  async function refreshServerCards() {
    const section = document.getElementById('unsere-server');
    const grid = document.getElementById('serverCards');
    if (!section || !grid || !window.PalServers || !window.PalServers.multi()) return;
    try {
      const res = await fetch('/api/servers', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      section.hidden = false;
      grid.innerHTML = (data.servers || []).map((s) => {
        const cur = s.players ? s.players.current : null;
        const max = s.players ? s.players.max : null;
        const pct = cur != null && max ? Math.min(100, Math.round((cur / max) * 100)) : 0;
        return `<article class="server-card reveal is-visible" style="--sc:${escHtml(s.color)};--sc-deep:${escHtml(s.colorDeep)}">
          <div class="server-card__head">
            <span class="server-card__name">${escHtml(s.name)}</span>
            ${s.mode ? `<span class="server-card__badge">${escHtml(s.mode)}</span>` : ''}
            <span class="server-card__live ${s.online ? 'is-on' : 'is-off'}">
              <span class="server-card__dot"></span>${s.online ? 'Online' : 'Offline'}</span>
          </div>
          ${s.description ? `<p class="server-card__desc">${escHtml(s.description)}</p>` : ''}
          ${Array.isArray(s.facts) && s.facts.length ? `<div class="server-card__facts">${
            s.facts.map((f) => `<span class="server-card__fact">${escHtml(f)}</span>`).join('')
          }</div>` : ''}
          <div class="server-card__players">${s.online && cur != null
            ? `<b>${cur} / ${max ?? '?'}</b><span>Spieler online</span>`
            : '<span>Gerade nicht erreichbar</span>'}</div>
          <div class="server-card__bar"><i style="width:${pct}%"></i></div>
          <div class="server-card__join">
            ${s.address ? `<button type="button" class="server-card__addr" data-copy="${escHtml(s.address)}"
               title="Adresse kopieren">${escHtml(s.address)}</button>` : ''}
            <button type="button" class="btn btn--small" data-select-server="${escHtml(s.id)}">Anzeigen ↓</button>
          </div>
        </article>`;
      }).join('');
    } catch { /* nächster Versuch beim Intervall */ }
  }

  document.addEventListener('click', async (e) => {
    const sel = e.target.closest('[data-select-server]');
    if (sel && window.PalServers) {
      window.PalServers.select(sel.dataset.selectServer);
      const status = document.getElementById('status');
      if (status) status.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const addr = e.target.closest('.server-card__addr[data-copy]');
    if (addr) {
      try {
        await navigator.clipboard.writeText(addr.dataset.copy);
        flashCopied(addr, 'Kopiert ✓');
      } catch { /* Clipboard nicht verfügbar */ }
    }
  });

  // Start: erst die Server-Liste laden, dann Status anzeigen – so gilt die
  // gemerkte/verlinkte Server-Auswahl schon beim allerersten Abruf
  const startStatus = () => {
    refreshStatus();
    setInterval(refreshStatus, REFRESH_INTERVAL);
  };
  if (window.PalServers) {
    window.PalServers.ready.then(() => {
      window.PalServers.onChange(() => refreshStatus());
      if (window.PalServers.multi()) {
        refreshServerCards();
        setInterval(refreshServerCards, REFRESH_INTERVAL);
      }
      startStatus();
    });
  } else {
    startStatus();
  }

  // -------------------------------------------------------------
  // Adresse kopieren
  // -------------------------------------------------------------

  function flashCopied(button, label = 'Kopiert!') {
    const original = button.innerHTML;
    button.classList.add('is-copied');
    const span = button.querySelector('span');
    if (span) {
      span.textContent = label;
    } else {
      button.textContent = label.toLowerCase();
    }
    setTimeout(() => {
      button.classList.remove('is-copied');
      button.innerHTML = original;
    }, 1800);
  }

  const copyBtn = document.getElementById('copyAddress');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const address = document.getElementById('serverAddress').textContent.trim();
      try {
        await navigator.clipboard.writeText(address);
        flashCopied(copyBtn);
      } catch {
        /* Clipboard nicht verfügbar (z. B. http ohne TLS) */
      }
    });
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        flashCopied(btn);
      } catch {
        /* ignorieren */
      }
    });
  });

  // -------------------------------------------------------------
  // Mobile Navigation
  // -------------------------------------------------------------

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Menü schließen, wenn ein Link angeklickt wird
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // -------------------------------------------------------------
  // "Nach oben" / Logo: Der #top-Anker sitzt auf dem sticky Header,
  // den der Browser als bereits sichtbar ansieht und daher nicht
  // anspringt. Darum hier explizit nach ganz oben scrollen.
  // -------------------------------------------------------------

  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // -------------------------------------------------------------
  // Scroll-Reveal-Animationen
  // -------------------------------------------------------------

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

  // -------------------------------------------------------------
  // Jahr im Footer
  // -------------------------------------------------------------

  document.getElementById('year').textContent = new Date().getFullYear();
})();
