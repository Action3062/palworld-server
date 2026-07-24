/* PalHeim – Erfolge
   Zeigt die Erfolge eines Spielers an (freigeschaltet + Fortschritt). */

(() => {
  'use strict';

  const wrap = document.getElementById('achWrap');
  if (!wrap) return;

  const form = document.getElementById('achForm');
  const input = document.getElementById('achName');
  const message = document.getElementById('achMessage');
  const summary = document.getElementById('achSummary');
  const grid = document.getElementById('achGrid');

  function showMessage(text) {
    message.textContent = text;
    message.classList.add('is-error');
    message.classList.remove('is-ok');
    message.hidden = false;
    summary.hidden = true;
    grid.hidden = true;
  }

  function render(data) {
    message.hidden = true;
    grid.textContent = '';

    const unlocked = data.achievements.filter((a) => a.unlocked).length;
    summary.textContent = `${data.player}: ${unlocked} von ${data.achievements.length} Erfolgen freigeschaltet`;
    summary.hidden = false;

    // Freigeschaltete zuerst
    const sorted = [...data.achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

    for (const a of sorted) {
      const card = document.createElement('div');
      card.className = `ach-card ${a.unlocked ? 'is-unlocked' : 'is-locked'}`;

      const icon = document.createElement('span');
      icon.className = 'ach-card__icon';
      icon.textContent = a.icon;

      const body = document.createElement('div');
      body.className = 'ach-card__body';

      const name = document.createElement('div');
      name.className = 'ach-card__name';
      name.textContent = a.name;

      const desc = document.createElement('div');
      desc.className = 'ach-card__desc';
      desc.textContent = a.desc;

      body.append(name, desc);

      if (a.unlocked) {
        const done = document.createElement('div');
        done.className = 'ach-card__done';
        done.textContent = '✓ Freigeschaltet';
        body.appendChild(done);
      } else {
        const track = document.createElement('div');
        track.className = 'ach-card__track';
        const bar = document.createElement('div');
        bar.className = 'ach-card__bar';
        bar.style.width = `${Math.round((a.current / a.targetValue) * 100)}%`;
        track.appendChild(bar);

        const count = document.createElement('div');
        count.className = 'ach-card__count';
        count.textContent = `${a.current} / ${a.targetValue}${a.unit ? ` ${a.unit}` : ''}`;

        body.append(track, count);
      }

      card.append(icon, body);
      grid.appendChild(card);
    }
    grid.hidden = false;
  }

  async function init() {
    try {
      const res = await fetch('/api/achievements', { cache: 'no-store' });
      if (!res.ok) return;
      const info = await res.json();
      if (!info.enabled) return;
      wrap.hidden = false;
      try {
        const saved = localStorage.getItem('palheim.voteName');
        if (saved) input.value = saved;
      } catch { /* localStorage evtl. gesperrt */ }
    } catch { /* Backend nicht erreichbar */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name.length < 2) return;

    try {
      localStorage.setItem('palheim.voteName', name);
    } catch { /* egal */ }

    try {
      const res = await fetch(`/api/achievements?player=${encodeURIComponent(name)}` +
        (window.PalServers ? window.PalServers.query('&') : ''), { cache: 'no-store' });
      const data = await res.json();
      if (!data.enabled) {
        showMessage('Erfolge sind derzeit deaktiviert.');
      } else if (!data.found) {
        showMessage(`"${name}" ist noch nicht bekannt – warst du schon auf dem Server? (Die Statistik füllt sich minütlich.)`);
      } else {
        render(data);
      }
    } catch {
      showMessage('Server nicht erreichbar – versuch es gleich nochmal.');
    }
  });

  if (window.PalServers) {
    window.PalServers.ready.then(init);
  } else {
    init();
  }
})();
