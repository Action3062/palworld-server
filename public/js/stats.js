/* PalHeim – Statistiken
   Lädt /api/stats und rendert Kennzahlen, das Spielerzahl-Chart
   (SVG, mit Crosshair-Tooltip und Tastatur-Navigation) und das Leaderboard. */

(() => {
  'use strict';

  const section = document.getElementById('statistiken');
  if (!section) return;

  const REFRESH_INTERVAL = 5 * 60_000; // Statistiken ändern sich langsam
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const el = {
    peakToday: section.querySelector('[data-stats="peakToday"]'),
    peakTodayHint: section.querySelector('[data-stats="peakTodayHint"]'),
    peakAllTime: section.querySelector('[data-stats="peakAllTime"]'),
    peakAllTimeHint: section.querySelector('[data-stats="peakAllTimeHint"]'),
    uniquePlayers: section.querySelector('[data-stats="uniquePlayers"]'),
    playtime: section.querySelector('[data-stats="playtime"]'),
    inGameDays: section.querySelector('[data-stats="inGameDays"]'),
    chart: document.getElementById('playersChart'),
    chartEmpty: document.getElementById('chartEmpty'),
    chartTitle: document.getElementById('chartTitle'),
    leaderboardWrap: document.getElementById('leaderboardWrap'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    uptimeWrap: document.getElementById('uptimeWrap'),
    avail24: document.getElementById('avail24'),
    avail7: document.getElementById('avail7'),
    outageList: document.getElementById('outageList')
  };

  let statsData = null;
  let range = '24h';
  let metric = 'players';
  let focusIndex = -1; // Tastatur-Cursor im Chart

  // Umschaltbare Kennzahlen: Spieler (Index 1) oder Server-FPS (Index 2)
  const METRICS = {
    players: {
      idx: 1, title: 'Spieler online', agg: 'max',
      fmt: (v) => (v === 1 ? '1 Spieler' : `${nf.format(v)} Spieler`)
    },
    fps: {
      idx: 2, title: 'Server-FPS', agg: 'avg',
      fmt: (v) => `${nf.format(v)} FPS`
    }
  };

  // ----------------------------------------------------------------
  // Formatierung
  // ----------------------------------------------------------------

  const nf = new Intl.NumberFormat('de-DE');

  function formatHours(minutes) {
    if (minutes < 60) return `${minutes} min`;
    return `${nf.format(Math.round(minutes / 60))} h`;
  }

  function formatDateShort(iso) {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatRelative(iso) {
    const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diffMin < 10) return 'gerade eben';
    if (diffMin < 60) return `vor ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `vor ${h} h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'gestern';
    if (d < 7) return `vor ${d} Tagen`;
    return formatDateShort(iso);
  }

  function tickLabel(tSec) {
    const date = new Date(tSec * 1000);
    if (range === '24h') {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }

  function tooltipTime(tSec) {
    return new Date(tSec * 1000).toLocaleString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ----------------------------------------------------------------
  // Kennzahlen + Leaderboard
  // ----------------------------------------------------------------

  function renderTiles(data) {
    if (data.peakToday) {
      el.peakToday.textContent = data.peakToday.count;
      el.peakTodayHint.textContent = 'Spieler gleichzeitig';
    } else {
      el.peakToday.textContent = '–';
      el.peakTodayHint.textContent = 'heute noch niemand da';
    }

    if (data.peakAllTime) {
      el.peakAllTime.textContent = data.peakAllTime.count;
      el.peakAllTimeHint.textContent = `am ${formatDateShort(data.peakAllTime.at)}`;
    }

    el.uniquePlayers.textContent = nf.format(data.uniquePlayers);
    el.playtime.textContent = formatHours(data.totalPlaytimeMinutes);
    el.inGameDays.textContent = data.inGameDays != null ? nf.format(data.inGameDays) : '–';
  }

  function renderLeaderboard(data) {
    const players = data.topPlayers || [];
    if (players.length === 0) {
      el.leaderboardWrap.hidden = true;
      return;
    }
    el.leaderboardBody.textContent = '';
    players.forEach((p, i) => {
      const tr = document.createElement('tr');

      const rank = document.createElement('td');
      rank.className = 'num';
      rank.textContent = i + 1;

      const name = document.createElement('td');
      name.className = 'leaderboard__name';
      const nameLink = document.createElement('a');
      nameLink.className = 'leaderboard__link';
      nameLink.href = `/spieler/${encodeURIComponent(p.name)}`;
      nameLink.textContent = p.name; // textContent: Spielernamen sind Fremddaten
      name.appendChild(nameLink);

      const level = document.createElement('td');
      level.className = 'num';
      level.textContent = p.level != null ? p.level : '–';

      const time = document.createElement('td');
      time.className = 'num';
      time.textContent = formatHours(p.minutes);

      const seen = document.createElement('td');
      const online = Date.now() - new Date(p.lastSeen).getTime() < 5 * 60_000;
      if (online) {
        const dot = document.createElement('span');
        dot.className = 'leaderboard__online';
        seen.append(dot, 'jetzt online');
      } else {
        seen.textContent = formatRelative(p.lastSeen);
      }

      tr.append(rank, name, level, time, seen);
      el.leaderboardBody.appendChild(tr);
    });
    el.leaderboardWrap.hidden = false;
  }

  function renderUptime(data) {
    const av = data.availability;
    if (!el.uptimeWrap || !av || (av.day == null && av.week == null)) {
      if (el.uptimeWrap) el.uptimeWrap.hidden = true;
      return;
    }
    el.avail24.textContent = av.day != null ? `${nf.format(av.day)} %` : '–';
    el.avail7.textContent = av.week != null ? `${nf.format(av.week)} %` : '–';

    const outages = data.outages || [];
    el.outageList.textContent = '';
    if (outages.length === 0) {
      const li = document.createElement('li');
      li.className = 'uptime__ok';
      li.textContent = 'Keine Ausfälle in den letzten 7 Tagen 🎉';
      el.outageList.appendChild(li);
    } else {
      const t = (d) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      for (const o of outages) {
        const start = new Date(o.start);
        const end = new Date(o.end);
        const day = start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
        const dur = o.minutes >= 60 ? `${nf.format(Math.round(o.minutes / 6) / 10)} h` : `${o.minutes} min`;

        const li = document.createElement('li');
        const when = document.createElement('span');
        when.textContent = `${day}, ${t(start)}–${t(end)} Uhr`;
        const badge = document.createElement('span');
        badge.className = 'uptime__dur';
        badge.textContent = dur;
        li.append(when, badge);
        el.outageList.appendChild(li);
      }
    }
    el.uptimeWrap.hidden = false;
  }

  // ----------------------------------------------------------------
  // Chart (SVG-Liniendiagramm mit Flächen-Wash)
  // ----------------------------------------------------------------

  function visibleSamples() {
    const nowSec = Math.floor(Date.now() / 1000);
    const windowSec = range === '24h' ? 24 * 3600 : 7 * 24 * 3600;
    const idx = METRICS[metric].idx;
    // Rohpunkte auf [Zeit, Wert-der-aktiven-Metrik] reduzieren
    const pairs = statsData.samples
      .filter(([t]) => t >= nowSec - windowSec)
      .map((s) => [s[0], s[idx] == null ? null : s[idx]]);
    if (range === '24h') return pairs;

    // 7-Tage-Ansicht: pro Stunde verdichten (Spieler=Maximum, FPS=Durchschnitt),
    // sonst ist die Linie bei 5-Minuten-Auflösung nur Rauschen. Stunden ohne
    // einen einzigen erfolgreichen Messwert bleiben eine Lücke (Server offline).
    const useAvg = METRICS[metric].agg === 'avg';
    const hours = new Map();
    for (const [t, v] of pairs) {
      const h = Math.floor(t / 3600) * 3600;
      const e = hours.get(h) || { sum: 0, cnt: 0, max: null };
      if (v != null) {
        e.sum += v;
        e.cnt += 1;
        e.max = e.max == null ? v : Math.max(e.max, v);
      }
      hours.set(h, e);
    }
    return [...hours.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([h, e]) => [h, e.cnt === 0 ? null : (useAvg ? Math.round(e.sum / e.cnt) : e.max)]);
  }

  function niceMax(v) {
    if (v <= 4) return 4;
    if (v <= 8) return 8;
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 5, 10]) {
      if (v <= m * mag) return m * mag;
    }
    return 10 * mag;
  }

  function renderChart() {
    if (!statsData) return;

    if (el.chartTitle) el.chartTitle.textContent = METRICS[metric].title;

    // Alte Render-Reste entfernen (Empty-Hinweis bleibt)
    el.chart.querySelectorAll('svg, .chart__tooltip').forEach((n) => n.remove());

    const samples = visibleSamples();
    const hasData = samples.some(([, c]) => c != null);
    el.chartEmpty.hidden = hasData;
    if (!hasData) return;

    const width = el.chart.clientWidth || 800;
    const height = 280;
    const pad = { top: 16, right: 18, bottom: 30, left: 40 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const nowSec = Math.floor(Date.now() / 1000);
    const windowSec = range === '24h' ? 24 * 3600 : 7 * 24 * 3600;
    const tMin = nowSec - windowSec;

    const yMax = niceMax(Math.max(...samples.map(([, c]) => c ?? 0)));
    const x = (t) => pad.left + ((t - tMin) / windowSec) * plotW;
    const y = (c) => pad.top + plotH - (c / yMax) * plotH;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('aria-hidden', 'true');

    // --- Gitterlinien (horizontal, hairline) + Y-Beschriftung
    // Schrittweite so wählen, dass nur ganze, runde Werte entstehen
    const yStep = [1, 2, 5, 10, 20, 50, 100].find((s) => yMax / s <= 5) ?? 200;
    for (let value = 0; value <= yMax; value += yStep) {
      const yPos = y(value);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', pad.left);
      line.setAttribute('x2', width - pad.right);
      line.setAttribute('y1', yPos);
      line.setAttribute('y2', yPos);
      line.setAttribute('class', 'chart-grid');
      svg.appendChild(line);

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', pad.left - 8);
      label.setAttribute('y', yPos + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('class', 'chart-tick');
      label.textContent = nf.format(value);
      svg.appendChild(label);
    }

    // --- X-Beschriftung: auf volle Stunden (24 h) bzw. Mitternacht (7 Tage)
    //     ausgerichtet statt auf den Abfragezeitpunkt
    const xTicks = [];
    if (range === '24h') {
      const first = new Date(tMin * 1000);
      first.setMinutes(0, 0, 0);
      first.setHours(first.getHours() + ((6 - (first.getHours() % 6)) % 6 || 6));
      for (let d = first; d.getTime() / 1000 <= nowSec; d = new Date(d.getTime() + 6 * 3600_000)) {
        xTicks.push(Math.floor(d.getTime() / 1000));
      }
    } else {
      const first = new Date(tMin * 1000);
      first.setHours(24, 0, 0, 0); // nächste Mitternacht
      for (let d = first; d.getTime() / 1000 <= nowSec; d.setDate(d.getDate() + 1)) {
        xTicks.push(Math.floor(d.getTime() / 1000));
      }
    }
    // Nur so viele Labels zeichnen, wie nebeneinander passen
    // (geschätzte Breite: "HH:MM" ≈ 46px, "Mo., 14.07." ≈ 80px)
    const estLabelWidth = range === '24h' ? 46 : 80;
    const labelSkip = Math.max(1, Math.ceil((estLabelWidth * xTicks.length) / Math.max(plotW, 1)));
    xTicks.forEach((t, i) => {
      if (i % labelSkip !== 0) return;
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', x(t));
      label.setAttribute('y', height - 8);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'chart-tick');
      label.textContent = tickLabel(t);
      svg.appendChild(label);
    });

    // --- Fläche + Linie, Lücken (null = Server offline) unterbrechen den Pfad
    const segments = [];
    let current = [];
    for (const [t, c] of samples) {
      if (c == null) {
        if (current.length) segments.push(current);
        current = [];
      } else {
        current.push([t, c]);
      }
    }
    if (current.length) segments.push(current);

    for (const seg of segments) {
      const pts = seg.map(([t, c]) => `${x(t).toFixed(1)},${y(c).toFixed(1)}`);

      const area = document.createElementNS(SVG_NS, 'path');
      const first = seg[0];
      const last = seg[seg.length - 1];
      area.setAttribute(
        'd',
        `M${x(first[0]).toFixed(1)},${y(0)} L${pts.join(' L')} L${x(last[0]).toFixed(1)},${y(0)} Z`
      );
      area.setAttribute('class', 'chart-area');
      svg.appendChild(area);

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', `M${pts.join(' L')}`);
      path.setAttribute('class', 'chart-line');
      svg.appendChild(path);
    }

    // --- Endpunkt-Marker (aktuellster Wert) mit Surface-Ring
    const lastSample = [...samples].reverse().find(([, c]) => c != null);
    if (lastSample) {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', x(lastSample[0]));
      dot.setAttribute('cy', y(lastSample[1]));
      dot.setAttribute('r', 4);
      dot.setAttribute('class', 'chart-dot');
      svg.appendChild(dot);
    }

    // --- Crosshair + Tooltip
    const crosshair = document.createElementNS(SVG_NS, 'line');
    crosshair.setAttribute('y1', pad.top);
    crosshair.setAttribute('y2', pad.top + plotH);
    crosshair.setAttribute('class', 'chart-crosshair');
    crosshair.setAttribute('visibility', 'hidden');
    svg.appendChild(crosshair);

    const hoverDot = document.createElementNS(SVG_NS, 'circle');
    hoverDot.setAttribute('r', 4);
    hoverDot.setAttribute('class', 'chart-dot');
    hoverDot.setAttribute('visibility', 'hidden');
    svg.appendChild(hoverDot);

    const tooltip = document.createElement('div');
    tooltip.className = 'chart__tooltip';
    tooltip.hidden = true;

    const tipValue = document.createElement('strong');
    const tipTime = document.createElement('span');
    tooltip.append(tipValue, tipTime);

    // Unsichtbare Live-Region: sagt Screenreadern die Werte bei
    // Pfeiltasten-Navigation an (der visuelle Tooltip ist aria-hidden)
    let liveRegion = el.chart.querySelector('.sr-only');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      el.chart.appendChild(liveRegion);
    }

    function showPoint(idx, announce = false) {
      const sample = samples[idx];
      if (!sample) return;
      const [t, c] = sample;
      const px = x(t);

      crosshair.setAttribute('x1', px);
      crosshair.setAttribute('x2', px);
      crosshair.setAttribute('visibility', 'visible');

      if (c != null) {
        hoverDot.setAttribute('cx', px);
        hoverDot.setAttribute('cy', y(c));
        hoverDot.setAttribute('visibility', 'visible');
        tipValue.textContent = METRICS[metric].fmt(c);
      } else {
        hoverDot.setAttribute('visibility', 'hidden');
        tipValue.textContent = 'Server offline';
      }
      tipTime.textContent = tooltipTime(t);

      tooltip.hidden = false;
      const tipW = tooltip.offsetWidth;
      const tipH = tooltip.offsetHeight;
      const clamped = Math.min(Math.max(px - tipW / 2, 4), width - tipW - 4);
      tooltip.style.left = `${clamped}px`;
      // Am Datenpunkt ausrichten, aber innerhalb des Charts bleiben
      // (der Tooltip darf Titel/Umschalter der Karte nicht überdecken)
      const anchorY = c != null ? y(c) : pad.top + plotH / 2;
      tooltip.style.top = `${Math.max(anchorY - 12, tipH + 2)}px`;

      if (announce) {
        liveRegion.textContent = `${tipValue.textContent}, ${tipTime.textContent}`;
      }
    }

    function hidePoint() {
      crosshair.setAttribute('visibility', 'hidden');
      hoverDot.setAttribute('visibility', 'hidden');
      tooltip.hidden = true;
      focusIndex = -1;
    }

    function nearestIndex(clientX) {
      const rect = svg.getBoundingClientRect();
      const t = tMin + ((clientX - rect.left - pad.left) / plotW) * windowSec;
      let best = 0;
      let bestDist = Infinity;
      samples.forEach(([st], i) => {
        const dist = Math.abs(st - t);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    svg.addEventListener('pointermove', (e) => showPoint(nearestIndex(e.clientX)));
    svg.addEventListener('pointerleave', hidePoint);

    // Tastatur: Pfeiltasten bewegen den Cursor durch die Messpunkte
    el.chart.onkeydown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (focusIndex < 0) focusIndex = samples.length - 1;
        else focusIndex += e.key === 'ArrowRight' ? 1 : -1;
        focusIndex = Math.min(Math.max(focusIndex, 0), samples.length - 1);
        showPoint(focusIndex, true);
      } else if (e.key === 'Escape') {
        hidePoint();
      }
    };
    el.chart.onblur = hidePoint;

    el.chart.append(svg, tooltip);
  }

  // ----------------------------------------------------------------
  // Zeitraum-Umschalter
  // ----------------------------------------------------------------

  function wireToggle(groupSelector, apply) {
    const group = section.querySelector(groupSelector);
    if (!group) return;
    const buttons = group.querySelectorAll('.chart-range__btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        apply(btn);
        focusIndex = -1;
        renderChart();
      });
    });
  }

  wireToggle('.chart-range', (btn) => { range = btn.dataset.range; });
  wireToggle('.chart-metric', (btn) => { metric = btn.dataset.metric; });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderChart, 200);
  });

  // ----------------------------------------------------------------
  // Laden
  // ----------------------------------------------------------------

  async function refreshStats() {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.enabled) {
        section.hidden = true;
        return;
      }
      statsData = data;
      renderTiles(data);
      renderLeaderboard(data);
      renderUptime(data);
      renderChart();
    } catch {
      /* Sektion behält den letzten Stand bzw. die Platzhalter */
    }
  }

  refreshStats();
  setInterval(refreshStats, REFRESH_INTERVAL);
})();
