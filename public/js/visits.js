/* PalHeim – Besucher-Zähler
   Meldet einen Seitenaufruf an /api/visit und zeigt den Stand an.
   "Eindeutig" wird lokal per localStorage-Flag bestimmt – es werden keine
   Cookies gesetzt und keine IP/personenbezogenen Daten gespeichert. */

(() => {
  'use strict';

  let firstVisit = false;
  try {
    if (!localStorage.getItem('palheim.visitor')) {
      firstVisit = true;
      localStorage.setItem('palheim.visitor', String(Date.now()));
    }
  } catch { /* localStorage kann gesperrt sein – dann zählt es als Aufruf */ }

  fetch('/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstVisit })
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.enabled) return;
      const nf = new Intl.NumberFormat('de-DE');
      document.querySelectorAll('[data-visits-unique]').forEach((el) => {
        el.textContent = nf.format(d.unique);
      });
      document.querySelectorAll('[data-visits-total]').forEach((el) => {
        el.textContent = nf.format(d.total);
      });
      document.querySelectorAll('[data-visits]').forEach((el) => {
        el.hidden = false;
      });
    })
    .catch(() => { /* Backend nicht erreichbar – keine Anzeige */ });
})();
