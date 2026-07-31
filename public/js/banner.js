/* PalHeim – Hinweis-Banner & Support-Karte
   Blendet oben ein vom Backend konfiguriertes Banner ein (Wartung, Events)
   und – auf der Startseite – die "Unterstützen"-Karte (z. B. Buy Me a Coffee).
   Banner ist schließbar; die Auswahl merkt sich der Browser pro Nachricht. */

(() => {
  'use strict';

  const KEY = 'palheim.banner.dismissed';

  fetch('/api/site', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      // --- Support-Karte (nur ein Link, keine externen Skripte)
      const card = document.getElementById('supportCard');
      if (card && data && data.support && data.support.url) {
        const link = document.getElementById('supportLink');
        link.href = data.support.url;
        if (data.support.label) link.textContent = data.support.label;
        if (data.support.text) {
          document.getElementById('supportText').textContent = data.support.text;
        }
        card.hidden = false;
      }

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
