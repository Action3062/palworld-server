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
    el.version.textContent = data.version || '–';
    el.uptime.textContent = formatUptime(data.uptimeSeconds);
    el.fps.textContent = data.serverFps != null ? Math.round(data.serverFps) : '–';

    // Spielerliste (nur wenn der Server sie mitliefert)
    const list = data.players.list || [];
    if (list.length > 0) {
      el.playerList.innerHTML = '';
      for (const p of list) {
        const li = document.createElement('li');
        li.textContent = p.name;
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
    el.version.textContent = '–';
    el.uptime.textContent = '–';
    el.fps.textContent = '–';
    el.playerListWrap.hidden = true;
  }

  async function refreshStatus() {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
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

  refreshStatus();
  setInterval(refreshStatus, REFRESH_INTERVAL);

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
