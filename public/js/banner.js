/* PalHeim – Hinweis-Banner
   Blendet oben ein vom Backend konfiguriertes Banner ein (Wartung, Events).
   Schließbar; die Auswahl merkt sich der Browser pro Nachricht. */

(() => {
  'use strict';

  const KEY = 'palheim.banner.dismissed';

  fetch('/api/site', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const b = data && data.banner;
      if (!b || !b.text) return;

      const level = ['info', 'event', 'warn'].includes(b.level) ? b.level : 'info';
      const sig = `${level}:${b.text}`;
      try {
        if (localStorage.getItem(KEY) === sig) return; // schon weggeklickt
      } catch { /* localStorage kann gesperrt sein */ }

      const bar = document.createElement('div');
      bar.className = `site-banner site-banner--${level}`;
      bar.setAttribute('role', 'status');

      const text = document.createElement('span');
      text.className = 'site-banner__text';
      text.textContent = b.text; // textContent: kein HTML aus der Config interpretieren
      bar.appendChild(text);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'site-banner__close';
      close.setAttribute('aria-label', 'Hinweis schließen');
      close.textContent = '×';
      close.addEventListener('click', () => {
        bar.remove();
        document.body.classList.remove('has-banner');
        try { localStorage.setItem(KEY, sig); } catch { /* egal */ }
      });
      bar.appendChild(close);

      document.body.insertBefore(bar, document.body.firstChild);
      document.body.classList.add('has-banner');
    })
    .catch(() => { /* Backend nicht erreichbar – kein Banner */ });
})();
