/* PalHeim – Spieler-Profil
   Liest den Namen aus /spieler/<name> (oder ?name=), lädt /api/player und
   rendert Kennzahlen + Erfolge. */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const loading = $('profileLoading');
  const notFound = $('profileNotFound');
  const card = $('profileCard');
  if (!loading) return;

  // Name aus dem Pfad /spieler/<name> oder aus ?name=
  let name = '';
  const m = location.pathname.match(/^\/spieler\/(.+)$/);
  if (m) { try { name = decodeURIComponent(m[1]); } catch { name = m[1]; } }
  if (!name) name = new URLSearchParams(location.search).get('name') || '';
  name = name.trim();

  const nf = new Intl.NumberFormat('de-DE');
  const fmtHours = (min) => (min < 60 ? `${min} min` : `${nf.format(Math.round(min / 60))} h`);
  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–';

  function fmtRelative(iso) {
    if (!iso) return '–';
    const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diffMin < 10) return 'gerade eben';
    if (diffMin < 60) return `vor ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `vor ${h} h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'gestern';
    if (d < 7) return `vor ${d} Tagen`;
    return fmtDate(iso);
  }

  function showNotFound(msg) {
    loading.hidden = true;
    card.hidden = true;
    if (msg) notFound.querySelector('[data-msg]').textContent = msg;
    notFound.hidden = false;
  }

  // Erfolgs-Karte – gleiche Optik wie im Erfolge-Bereich der Startseite
  function achCard(a) {
    const el = document.createElement('div');
    el.className = `ach-card ${a.unlocked ? 'is-unlocked' : 'is-locked'}`;

    const icon = document.createElement('span');
    icon.className = 'ach-card__icon';
    icon.textContent = a.icon;

    const body = document.createElement('div');
    body.className = 'ach-card__body';

    const nm = document.createElement('div');
    nm.className = 'ach-card__name';
    nm.textContent = a.name;

    const desc = document.createElement('div');
    desc.className = 'ach-card__desc';
    desc.textContent = a.desc;

    body.append(nm, desc);

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

    el.append(icon, body);
    return el;
  }

  function render(d) {
    loading.hidden = true;
    document.title = `${d.name} – PalHeim`;

    $('profileName').textContent = d.name;
    $('profileAvatar').textContent = (d.name[0] || '?').toUpperCase();
    $('profileLevel').textContent = d.level != null ? `Level ${d.level}` : 'Level –';

    const online = d.lastSeen && Date.now() - new Date(d.lastSeen).getTime() < 5 * 60_000;
    $('profileOnline').hidden = !online;

    $('stPlaytime').textContent = fmtHours(d.minutes);
    $('stDistance').textContent = `${nf.format(d.distKm)} km`;
    $('stDays').textContent = nf.format(d.daysCount);
    $('stSessions').textContent = nf.format(d.sessions);
    $('stAreas').textContent = nf.format(d.areas);
    $('stFirst').textContent = fmtDate(d.firstSeen);
    $('stLast').textContent = online ? 'jetzt online' : fmtRelative(d.lastSeen);

    const ach = d.achievements || [];
    const unlocked = ach.filter((a) => a.unlocked).length;
    $('profileAchSummary').textContent = `${unlocked} von ${ach.length} Erfolgen freigeschaltet`;

    const grid = $('profileAch');
    grid.textContent = '';
    [...ach]
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
      .forEach((a) => grid.appendChild(achCard(a)));

    card.hidden = false;
  }

  async function load() {
    if (!name) { showNotFound(); return; }
    document.title = `${name} – PalHeim`;
    try {
      const res = await fetch(`/api/player?name=${encodeURIComponent(name)}` +
        (window.PalServers ? window.PalServers.query('&') : ''), { cache: 'no-store' });
      const data = await res.json();
      if (!data.enabled) { showNotFound('Spielerprofile sind derzeit deaktiviert.'); return; }
      if (!data.found) { showNotFound(); return; }
      render(data);
    } catch {
      showNotFound('Server nicht erreichbar – versuch es gleich nochmal.');
    }
  }

  // Im Mehrserver-Betrieb erst die Server-Auswahl laden (?server=…), dann das Profil
  if (window.PalServers) {
    window.PalServers.ready.then(load);
  } else {
    load();
  }
})();
