/* PalHeim – Ranglisten
   Lädt /api/rankings und rendert die Kategorie-Tabs (Level, Spielzeit,
   Paldeck, Turmbosse, Hall of Shame …) mit Top-Listen. Die Spielstand-Daten
   kommen vom Ranglisten-Uploader auf dem Palworld-Server, die Spielzeit aus
   der Website-Statistik. */

(() => {
  'use strict';

  const wrap = document.getElementById('rankingsWrap');
  if (!wrap) return;

  const el = {
    intro: document.getElementById('rankingsIntro'),
    tabs: document.getElementById('rankingsTabs'),
    head: document.getElementById('rankingsHead'),
    body: document.getElementById('rankingsBody'),
    stand: document.getElementById('rankingsStand')
  };

  const REFRESH_INTERVAL = 5 * 60_000;
  const nf = new Intl.NumberFormat('de-DE');

  function formatHours(minutes) {
    if (minutes < 60) return `${minutes} min`;
    return `${nf.format(Math.round(minutes / 60))} h`;
  }

  function formatRelative(iso) {
    const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diffMin < 10) return 'gerade eben';
    if (diffMin < 60) return `vor ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `vor ${h} h`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'gestern' : `vor ${d} Tagen`;
  }

  // Kategorien: Tab-Beschriftung, Spaltenkopf, Wert-Formatierung.
  // "extra" ergänzt eine zweite Wertspalte (z. B. EP beim Level).
  // Level und Turmbosse sind bewusst NICHT dabei: beides ist gecapt
  // (Level 80, alle Türme) – da sähe die Liste bald überall gleich aus.
  const CATS = [
    { key: 'playtime', tab: 'Spielzeit', intro: 'Wer verbringt die meiste Zeit auf dem Server? (Gemessen von der Website, seit Statistik-Start.)',
      col: 'Spielzeit', fmt: (r) => formatHours(r.value) },
    { key: 'paldeck', tab: 'Paldeck', intro: 'Wer hat die meisten Pal-Arten im Paldeck freigeschaltet?',
      col: 'Arten', fmt: (r) => nf.format(r.value),
      extra: { col: 'Pals gefangen', fmt: (r) => nf.format(r.caught || 0) } },
    { key: 'butcher', tab: '💀 Schlachter', intro: 'Hall of Shame: Wer hat die meisten Pals über die Klinge springen lassen? 💀',
      col: 'Geschlachtet', fmt: (r) => nf.format(r.value) },
    { key: 'fishing', tab: '🎣 Angler', intro: 'Wer hat die meisten Fische aus dem Wasser gezogen?',
      col: 'Fische', fmt: (r) => nf.format(r.value) },
    { key: 'dungeons', tab: '🏰 Dungeons', intro: 'Wer hat die meisten Dungeons abgeschlossen?',
      col: 'Dungeons', fmt: (r) => nf.format(r.value) },
    { key: 'raids', tab: '⚔️ Raidbosse', intro: 'Wer hat die meisten Raidbosse besiegt?',
      col: 'Raidbosse', fmt: (r) => nf.format(r.value) }
  ];

  let data = null;
  let active = 'playtime';

  // ---- Tabs einmalig aufbauen
  for (const cat of CATS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rankings-tab';
    btn.dataset.cat = cat.key;
    btn.setAttribute('role', 'tab');
    btn.textContent = cat.tab;
    btn.addEventListener('click', () => {
      active = cat.key;
      render();
    });
    el.tabs.appendChild(btn);
  }

  function medal(i) {
    return ['🥇', '🥈', '🥉'][i] || String(i + 1);
  }

  function render() {
    if (!data) return;
    const cat = CATS.find((c) => c.key === active) || CATS[0];
    const rows = (data.categories && data.categories[cat.key]) || [];

    el.tabs.querySelectorAll('.rankings-tab').forEach((b) => {
      const isActive = b.dataset.cat === cat.key;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
    el.intro.textContent = cat.intro;

    // Tabellenkopf
    el.head.textContent = '';
    const cols = [['#', 'num'], ['Spieler', null], [cat.col, 'num']];
    if (cat.extra) cols.push([cat.extra.col, 'num']);
    for (const [label, cls] of cols) {
      const th = document.createElement('th');
      th.scope = 'col';
      if (cls) th.className = cls;
      th.textContent = label;
      el.head.appendChild(th);
    }

    // Zeilen
    el.body.textContent = '';
    if (rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = cols.length;
      td.textContent = data.updatedAt || cat.key === 'playtime'
        ? 'Noch keine Daten in dieser Kategorie.'
        : 'Noch keine Spielstand-Daten – der Ranglisten-Upload läuft noch nicht.';
      tr.appendChild(td);
      el.body.appendChild(tr);
    }
    rows.forEach((r, i) => {
      const tr = document.createElement('tr');

      const rank = document.createElement('td');
      rank.className = 'num rankings-rank';
      rank.textContent = medal(i);

      const name = document.createElement('td');
      name.className = 'leaderboard__name';
      const link = document.createElement('a');
      link.className = 'leaderboard__link';
      link.href = `/spieler/${encodeURIComponent(r.name)}` +
        (window.PalServers ? window.PalServers.query() : '');
      link.textContent = r.name; // textContent: Spielernamen sind Fremddaten
      name.appendChild(link);

      const value = document.createElement('td');
      value.className = 'num';
      value.textContent = cat.fmt(r);

      tr.append(rank, name, value);
      if (cat.extra) {
        const ex = document.createElement('td');
        ex.className = 'num';
        ex.textContent = cat.extra.fmt(r);
        tr.appendChild(ex);
      }
      el.body.appendChild(tr);
    });

    // Stand-Zeile: Spielstand-Alter + Hinweis auf Live-Spielzeit
    const parts = [];
    if (data.updatedAt) {
      parts.push(`Spielstand-Daten: ${formatRelative(data.updatedAt)}`);
      if (data.playersTotal) parts.push(`${nf.format(data.playersTotal)} Spieler ausgewertet`);
    } else {
      parts.push('Spielstand-Daten folgen, sobald der Upload auf dem Spielserver eingerichtet ist');
    }
    parts.push('Spielzeit misst die Website live');
    el.stand.textContent = parts.join(' · ');
  }

  function hasAnyRows(d) {
    return d && d.categories &&
      Object.values(d.categories).some((rows) => Array.isArray(rows) && rows.length > 0);
  }

  async function refresh() {
    try {
      const q = window.PalServers ? window.PalServers.query() : '';
      const res = await fetch(`/api/rankings${q}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      wrap.hidden = !hasAnyRows(data);
      render();
    } catch {
      /* Block behält den letzten Stand */
    }
  }

  if (window.PalServers) {
    window.PalServers.ready.then(() => {
      window.PalServers.onChange(() => refresh());
      refresh();
      setInterval(refresh, REFRESH_INTERVAL);
    });
  } else {
    refresh();
    setInterval(refresh, REFRESH_INTERVAL);
  }
})();
