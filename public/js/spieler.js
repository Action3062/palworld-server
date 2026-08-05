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

  // ---- Ausgerüstetes Team (Pal-Daten kommen aus /assets/pals/paldata.json)
  let palData = null;
  async function loadPalData() {
    if (palData) return palData;
    const res = await fetch('/assets/pals/paldata.json', { cache: 'force-cache' });
    palData = await res.json();
    return palData;
  }

  // Kampfwerte nach der bekannten Community-Formel:
  // Basiswert × Level × IV, dazu +5 % je Kondensator-Stern und
  // +3 % je Seelen-Stufe
  function palStats(base, t) {
    const cond = (1 + 0.05 * t.stars);
    const soul = (i) => 1 + 0.03 * (t.souls[i] || 0);
    const iv = (i) => 1 + (t.ivs[i] || 0) * 0.3 / 100;
    return {
      hp: Math.floor((500 + 5 * t.level + base.hp * 0.5 * t.level * iv(0)) * cond * soul(0)),
      atk: Math.floor((100 + base.atk * 0.075 * t.level * iv(1)) * cond * soul(1)),
      def: Math.floor((50 + base.def * 0.075 * t.level * iv(2)) * cond * soul(2))
    };
  }

  function ivRow(label, val) {
    const row = document.createElement('div');
    row.className = 'palteam__iv';
    const lb = document.createElement('span');
    lb.className = 'palteam__ivlabel';
    lb.textContent = label;
    const bar = document.createElement('span');
    bar.className = 'palteam__ivbar';
    const fill = document.createElement('span');
    fill.className = 'palteam__ivfill';
    fill.style.width = `${Math.min(100, Math.max(0, val))}%`;
    bar.appendChild(fill);
    const v = document.createElement('span');
    v.className = 'palteam__ivval';
    v.textContent = val;
    row.append(lb, bar, v);
    return row;
  }

  function palCard(t, pd) {
    const info = pd.pals[t.species] || null;
    const el = document.createElement('article');
    el.className = 'palteam__pal';

    // Kopf: Icon + Name/Art + Badges
    const head = document.createElement('div');
    head.className = 'palteam__head';
    const img = document.createElement('img');
    img.className = 'palteam__icon';
    img.alt = '';
    img.loading = 'lazy';
    img.src = `/assets/pals/icons/${info ? info.icon : 'T_icon_unknown.webp'}`;
    const id = document.createElement('div');

    const nameEl = document.createElement('div');
    nameEl.className = 'palteam__name';
    nameEl.textContent = t.nick || (info ? info.name : t.species);
    if (t.alpha) nameEl.append(' ', Object.assign(document.createElement('span'),
      { textContent: '👑', title: 'Alpha', className: 'palteam__mark' }));
    if (t.lucky) nameEl.append(' ', Object.assign(document.createElement('span'),
      { textContent: '✨', title: 'Lucky', className: 'palteam__mark' }));

    const species = document.createElement('div');
    species.className = 'palteam__species';
    species.textContent = t.nick ? (info ? info.name : t.species) : ' ';

    const badges = document.createElement('div');
    badges.className = 'palteam__badges';
    for (const en of (info ? info.elements : [])) {
      const ei = document.createElement('img');
      ei.className = 'palteam__elem';
      ei.alt = en;
      ei.title = en;
      ei.src = `/assets/pals/icons/${pd.elements[en]}`;
      badges.appendChild(ei);
    }
    const lvl = document.createElement('span');
    lvl.className = 'palteam__lvl';
    lvl.textContent = `Lv. ${t.level}`;
    const g = document.createElement('span');
    g.className = `palteam__g palteam__g--${t.gender}`;
    g.textContent = t.gender === 'f' ? '♀' : '♂';
    badges.append(lvl, g);

    id.append(nameEl, species, badges);
    head.append(img, id);

    // Kondensator-Sterne
    const stars = document.createElement('div');
    stars.className = 'palteam__stars';
    if (t.stars > 0) {
      const on = document.createElement('span');
      on.className = 'is-on';
      on.textContent = '★'.repeat(t.stars);
      stars.append(on, '☆'.repeat(4 - t.stars));
    } else {
      stars.classList.add('is-none');
      stars.textContent = 'nicht kondensiert';
    }

    el.append(head, stars);

    // Kampfwerte (nur wenn die Art bekannt ist – sonst fehlen Basiswerte)
    if (info) {
      const s = palStats(info, t);
      const statsEl = document.createElement('div');
      statsEl.className = 'palteam__stats';
      for (const [icon, val, title] of [['❤️', s.hp, 'KP'], ['⚔️', s.atk, 'Angriff'], ['🛡️', s.def, 'Verteidigung']]) {
        const sp = document.createElement('span');
        sp.title = title;
        sp.textContent = `${icon} ${nf.format(val)}`;
        statsEl.appendChild(sp);
      }
      el.appendChild(statsEl);
    }

    // IV-Balken
    const ivs = document.createElement('div');
    ivs.className = 'palteam__ivs';
    ivs.append(ivRow('KP', t.ivs[0] || 0), ivRow('ANG', t.ivs[1] || 0), ivRow('VER', t.ivs[2] || 0));
    el.appendChild(ivs);

    // Passive Skills als Chips (gold = besonders, grün = gut, rot = schlecht)
    const pp = document.createElement('div');
    pp.className = 'palteam__passives';
    const list = t.passives || [];
    if (list.length === 0) {
      const chip = document.createElement('span');
      chip.className = 'palteam__pp palteam__pp--none';
      chip.textContent = 'keine Passives';
      pp.appendChild(chip);
    }
    for (const pid of list) {
      const meta = pd.passives[pid] || null;
      const chip = document.createElement('span');
      const cls = !meta ? 'none' : meta.rank < 0 ? 'neg' : meta.rank >= 3 ? 'gold' : 'pos';
      chip.className = `palteam__pp palteam__pp--${cls}`;
      chip.textContent = meta ? meta.name : pid;
      pp.appendChild(chip);
    }
    el.appendChild(pp);
    return el;
  }

  async function renderTeam(d) {
    const wrap = $('teamWrap');
    if (!wrap) return;
    if (!d.team || d.team.length === 0) { wrap.hidden = true; return; }
    let pd;
    try {
      pd = await loadPalData();
    } catch { wrap.hidden = true; return; }

    const grid = $('teamGrid');
    grid.textContent = '';
    for (const t of d.team.slice(0, 5)) grid.appendChild(palCard(t, pd));
    for (let i = d.team.length; i < 5; i++) {
      const empty = document.createElement('article');
      empty.className = 'palteam__pal palteam__pal--empty';
      empty.textContent = 'leerer Slot';
      grid.appendChild(empty);
    }
    $('teamStand').textContent =
      `Stand: ${fmtRelative(d.teamUpdatedAt)} · aktualisiert stündlich.`;
    wrap.hidden = false;
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
    renderTeam(d); // asynchron – lädt paldata.json nur, wenn ein Team da ist
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
