/* PalHeim – Live-Karte
   Rendert Spieler- und Basen-Positionen als SVG.

   Zwei Modi:
   - Mit Kartenbild: Liegt /assets/map.jpg (oder .webp/.png) vor, wird es als
     Hintergrund gezeichnet. Die Zuordnung Welt → Bild kommt aus der
     Kalibrierung (config.json → map.calibration = Welt-Koordinaten der
     Bildränder). Zoomen (Mausrad/Pinch) und Verschieben (Ziehen) möglich.
   - Ohne Bild: Auto-Fit-Raster auf die vorhandenen Punkte.

   Ausrichtung wie im Spiel: Norden oben
   (Unreal: +X = Norden, +Y = Osten → Bildschirm-X = Welt-Y, Bildschirm-Y = -Welt-X). */

(() => {
  'use strict';

  const REFRESH_INTERVAL = 30_000;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const IMAGE_CANDIDATES = ['/assets/map.jpg', '/assets/map.webp', '/assets/map.png'];

  const view = document.getElementById('mapView');
  const empty = document.getElementById('mapEmpty');
  const status = document.getElementById('mapStatus');
  const footnote = document.getElementById('mapFootnote');
  const resetBtn = document.getElementById('mapReset');
  if (!view) return;

  let lastData = null;
  let mapImage = null;      // { url, bounds: {minX,minY,maxX,maxY} in Screen-Koordinaten }
  let viewport = null;      // aktueller Ausschnitt (Screen-Koordinaten), null = auto
  let userMoved = false;    // hat der Nutzer gezoomt/verschoben?

  const toScreen = (p) => ({ sx: p.y, sy: -p.x });

  // ----------------------------------------------------------------
  // Kartenbild suchen (erstes existierendes gewinnt)
  // ----------------------------------------------------------------

  function probeImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function findMapImage(calibration) {
    for (const url of IMAGE_CANDIDATES) {
      const found = await probeImage(url);
      if (found && calibration) {
        // Bildränder in Screen-Koordinaten (sx = Welt-Y, sy = -Welt-X)
        return {
          url: found,
          bounds: {
            minX: calibration.yLeft,
            maxX: calibration.yRight,
            minY: -calibration.xTop,
            maxY: -calibration.xBottom
          }
        };
      }
    }
    return null;
  }

  // ----------------------------------------------------------------
  // Viewport-Logik
  // ----------------------------------------------------------------

  function autoViewport(points) {
    if (mapImage) return { ...mapImage.bounds };

    let minX = Math.min(...points.map((p) => p.sx));
    let maxX = Math.max(...points.map((p) => p.sx));
    let minY = Math.min(...points.map((p) => p.sy));
    let maxY = Math.max(...points.map((p) => p.sy));
    const MIN_SPAN = 200000; // 2 km Mindestausdehnung
    if (maxX - minX < MIN_SPAN) { const c = (minX + maxX) / 2; minX = c - MIN_SPAN / 2; maxX = c + MIN_SPAN / 2; }
    if (maxY - minY < MIN_SPAN) { const c = (minY + maxY) / 2; minY = c - MIN_SPAN / 2; maxY = c + MIN_SPAN / 2; }
    const padX = (maxX - minX) * 0.12;
    const padY = (maxY - minY) * 0.12;
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }

  function setUserViewport(vp) {
    viewport = vp;
    userMoved = true;
    if (resetBtn) resetBtn.hidden = false;
  }

  function resetViewport() {
    viewport = null;
    userMoved = false;
    if (resetBtn) resetBtn.hidden = true;
    render();
  }

  // ----------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------

  function render() {
    if (!lastData) return;
    view.querySelectorAll('svg').forEach((n) => n.remove());

    const players = lastData.players || [];
    const bases = lastData.bases || [];
    const points = [...players.map(toScreen), ...bases.map(toScreen)];

    if (points.length === 0 && !mapImage) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const width = view.clientWidth || 900;
    const height = Math.max(view.clientHeight || 0, 520);

    const vp = viewport || autoViewport(points);

    // Gleicher Maßstab für beide Achsen (keine Verzerrung)
    const scale = Math.min(width / (vp.maxX - vp.minX), height / (vp.maxY - vp.minY));
    const offX = (width - (vp.maxX - vp.minX) * scale) / 2;
    const offY = (height - (vp.maxY - vp.minY) * scale) / 2;
    const px = (sx) => offX + (sx - vp.minX) * scale;
    const py = (sy) => offY + (sy - vp.minY) * scale;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.touchAction = 'none';

    // --- Hintergrund: Kartenbild oder km-Raster
    if (mapImage) {
      const img = document.createElementNS(SVG_NS, 'image');
      img.setAttribute('href', mapImage.url);
      img.setAttribute('x', px(mapImage.bounds.minX));
      img.setAttribute('y', py(mapImage.bounds.minY));
      img.setAttribute('width', (mapImage.bounds.maxX - mapImage.bounds.minX) * scale);
      img.setAttribute('height', (mapImage.bounds.maxY - mapImage.bounds.minY) * scale);
      img.setAttribute('preserveAspectRatio', 'none');
      svg.appendChild(img);
    } else {
      const gridStep = 100000 * scale >= 24 ? 100000 : 500000;
      for (let gx = Math.ceil(vp.minX / gridStep) * gridStep; gx < vp.maxX; gx += gridStep) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', px(gx)); line.setAttribute('x2', px(gx));
        line.setAttribute('y1', 0); line.setAttribute('y2', height);
        line.setAttribute('class', 'map-grid');
        svg.appendChild(line);
      }
      for (let gy = Math.ceil(vp.minY / gridStep) * gridStep; gy < vp.maxY; gy += gridStep) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', 0); line.setAttribute('x2', width);
        line.setAttribute('y1', py(gy)); line.setAttribute('y2', py(gy));
        line.setAttribute('class', 'map-grid');
        svg.appendChild(line);
      }
      const scaleText = document.createElementNS(SVG_NS, 'text');
      scaleText.setAttribute('x', 12); scaleText.setAttribute('y', height - 12);
      scaleText.setAttribute('class', 'map-tick');
      scaleText.textContent = `Raster: ${gridStep / 100000} km · N ↑`;
      svg.appendChild(scaleText);
    }

    // --- Basen (unter den Spielern)
    for (const b of bases) {
      const s = toScreen(b);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('transform', `translate(${px(s.sx)} ${py(s.sy)})`);
      g.setAttribute('class', 'map-base');

      const icon = document.createElementNS(SVG_NS, 'path');
      icon.setAttribute('d', 'M-7 1 L0 -6 L7 1 L7 7 L2 7 L2 3 L-2 3 L-2 7 L-7 7 Z');
      g.appendChild(icon);

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('y', 19);
      label.setAttribute('class', 'map-label');
      label.textContent = b.guild;
      g.appendChild(label);

      svg.appendChild(g);
    }

    // --- Spieler
    for (const p of players) {
      const s = toScreen(p);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('transform', `translate(${px(s.sx)} ${py(s.sy)})`);
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

    // ----------------------------------------------------------------
    // Zoom (Mausrad) und Verschieben (Ziehen)
    // ----------------------------------------------------------------

    const screenToWorld = (clientX, clientY) => {
      const rect = svg.getBoundingClientRect();
      return {
        sx: vp.minX + (clientX - rect.left - offX) / scale,
        sy: vp.minY + (clientY - rect.top - offY) / scale
      };
    };

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1 / 1.25 : 1.25;
      const c = screenToWorld(e.clientX, e.clientY);
      const nvp = {
        minX: c.sx - (c.sx - vp.minX) * factor,
        maxX: c.sx + (vp.maxX - c.sx) * factor,
        minY: c.sy - (c.sy - vp.minY) * factor,
        maxY: c.sy + (vp.maxY - c.sy) * factor
      };
      // Zoom begrenzen: nicht weiter raus als 3× Basisansicht, nicht näher als ~200 m
      const base = mapImage ? mapImage.bounds : autoViewport(points);
      const span = nvp.maxX - nvp.minX;
      if (span > (base.maxX - base.minX) * 3 || span < 20000) return;
      setUserViewport(nvp);
      render();
    }, { passive: false });

    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, vp: { ...vp } };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / scale;
      const dy = (e.clientY - drag.y) / scale;
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 4) return;
      setUserViewport({
        minX: drag.vp.minX - dx,
        maxX: drag.vp.maxX - dx,
        minY: drag.vp.minY - dy,
        maxY: drag.vp.maxY - dy
      });
      render();
    });
    const endDrag = () => { drag = null; };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('dblclick', resetViewport);

    view.appendChild(svg);
  }

  // ----------------------------------------------------------------
  // Daten laden
  // ----------------------------------------------------------------

  let imageProbed = false;

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

      if (!imageProbed) {
        imageProbed = true;
        mapImage = await findMapImage(data.calibration);
      }

      const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      status.textContent = data.online
        ? `${(data.players || []).length} Spieler · ${(data.bases || []).length} Basen · Stand ${time}`
        : `Spielserver offline · ${(data.bases || []).length} Basen`;

      footnote.textContent = data.basesUpdatedAt
        ? `Basen zuletzt aktualisiert: ${new Date(data.basesUpdatedAt).toLocaleString('de-DE')}`
        : 'Noch keine Basendaten hochgeladen (siehe README: tools/upload-bases.py).';

      lastData = data;
      render();
    } catch {
      status.textContent = 'Karte derzeit nicht erreichbar.';
    }
  }

  if (resetBtn) resetBtn.addEventListener('click', resetViewport);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 250);
  });

  refresh();
  setInterval(refresh, REFRESH_INTERVAL);
})();
