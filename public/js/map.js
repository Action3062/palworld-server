/* PalHeim – Live-Karte
   Rendert Spieler- und Basen-Positionen als SVG. Die Ansicht passt sich
   automatisch an die vorhandenen Punkte an (Auto-Fit), es wird also keine
   kalibrierte Weltkarte benötigt. Ausrichtung wie im Spiel: Norden oben
   (Unreal: +X = Norden, +Y = Osten → Bildschirm-X = Welt-Y, Bildschirm-Y = -Welt-X). */

(() => {
  'use strict';

  const REFRESH_INTERVAL = 30_000;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const view = document.getElementById('mapView');
  const empty = document.getElementById('mapEmpty');
  const status = document.getElementById('mapStatus');
  const footnote = document.getElementById('mapFootnote');
  if (!view) return;

  function toScreen(p) {
    return { sx: p.y, sy: -p.x };
  }

  function render(data) {
    view.querySelectorAll('svg').forEach((n) => n.remove());

    const players = data.players || [];
    const bases = data.bases || [];
    const points = [...players.map(toScreen), ...bases.map(toScreen)];

    if (points.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const width = view.clientWidth || 900;
    const height = Math.max(view.clientHeight || 0, 520);

    // Auto-Fit mit Rand; Mindestausdehnung, damit ein einzelner Punkt
    // nicht "unendlich" gezoomt wird (100.000 Einheiten = 1 km)
    let minX = Math.min(...points.map((p) => p.sx));
    let maxX = Math.max(...points.map((p) => p.sx));
    let minY = Math.min(...points.map((p) => p.sy));
    let maxY = Math.max(...points.map((p) => p.sy));
    const MIN_SPAN = 200000; // 2 km
    if (maxX - minX < MIN_SPAN) { const c = (minX + maxX) / 2; minX = c - MIN_SPAN / 2; maxX = c + MIN_SPAN / 2; }
    if (maxY - minY < MIN_SPAN) { const c = (minY + maxY) / 2; minY = c - MIN_SPAN / 2; maxY = c + MIN_SPAN / 2; }
    const padX = (maxX - minX) * 0.12;
    const padY = (maxY - minY) * 0.12;
    minX -= padX; maxX += padX; minY -= padY; maxY += padY;

    // Gleicher Maßstab für beide Achsen (keine Verzerrung)
    const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
    const offX = (width - (maxX - minX) * scale) / 2;
    const offY = (height - (maxY - minY) * scale) / 2;
    const px = (p) => offX + (p.sx - minX) * scale;
    const py = (p) => offY + (p.sy - minY) * scale;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    // Kilometer-Raster
    const gridStep = 100000 * scale >= 24 ? 100000 : 500000; // 1 km bzw. 5 km
    const gridLabel = gridStep / 100000;
    for (let gx = Math.ceil(minX / gridStep) * gridStep; gx < maxX; gx += gridStep) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', px({ sx: gx })); line.setAttribute('x2', px({ sx: gx }));
      line.setAttribute('y1', 0); line.setAttribute('y2', height);
      line.setAttribute('class', 'map-grid');
      svg.appendChild(line);
    }
    for (let gy = Math.ceil(minY / gridStep) * gridStep; gy < maxY; gy += gridStep) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', 0); line.setAttribute('x2', width);
      line.setAttribute('y1', py({ sy: gy })); line.setAttribute('y2', py({ sy: gy }));
      line.setAttribute('class', 'map-grid');
      svg.appendChild(line);
    }

    // Maßstabs-Hinweis + Nordpfeil
    const scaleText = document.createElementNS(SVG_NS, 'text');
    scaleText.setAttribute('x', 12); scaleText.setAttribute('y', height - 12);
    scaleText.setAttribute('class', 'map-tick');
    scaleText.textContent = `Raster: ${gridLabel} km · N ↑`;
    svg.appendChild(scaleText);

    // Basen zuerst (unter den Spielern)
    for (const b of bases) {
      const s = toScreen(b);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('transform', `translate(${px(s)} ${py(s)})`);
      g.setAttribute('class', 'map-base');

      const icon = document.createElementNS(SVG_NS, 'path');
      // kleines Haus
      icon.setAttribute('d', 'M-7 1 L0 -6 L7 1 L7 7 L2 7 L2 3 L-2 3 L-2 7 L-7 7 Z');
      g.appendChild(icon);

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('y', 19);
      label.setAttribute('class', 'map-label');
      label.textContent = b.guild;
      g.appendChild(label);

      svg.appendChild(g);
    }

    // Spieler
    for (const p of players) {
      const s = toScreen(p);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('transform', `translate(${px(s)} ${py(s)})`);
      g.setAttribute('class', 'map-player');

      const halo = document.createElementNS(SVG_NS, 'circle');
      halo.setAttribute('r', 10);
      halo.setAttribute('class', 'map-player__halo');
      g.appendChild(halo);

      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('r', 5.5);
      g.appendChild(dot);

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('y', -12);
      label.setAttribute('class', 'map-label map-label--player');
      label.textContent = p.level != null ? `${p.name} (${p.level})` : p.name;
      g.appendChild(label);

      svg.appendChild(g);
    }

    view.appendChild(svg);
  }

  async function refresh() {
    try {
      const res = await fetch('/api/map', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.enabled) {
        status.textContent = 'Karte ist deaktiviert.';
        empty.hidden = false;
        return;
      }

      const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      status.textContent = data.online
        ? `${(data.players || []).length} Spieler · ${(data.bases || []).length} Basen · Stand ${time}`
        : `Spielserver offline · ${(data.bases || []).length} Basen`;

      footnote.textContent = data.basesUpdatedAt
        ? `Basen zuletzt aktualisiert: ${new Date(data.basesUpdatedAt).toLocaleString('de-DE')}`
        : 'Noch keine Basendaten hochgeladen (siehe README: tools/upload-bases.py).';

      render(data);
    } catch {
      status.textContent = 'Karte derzeit nicht erreichbar.';
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refresh, 250);
  });

  refresh();
  setInterval(refresh, REFRESH_INTERVAL);
})();
