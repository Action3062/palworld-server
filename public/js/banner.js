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
      // --- Ko-fi-Reiter in der Navigation (auf allen Seiten mit Menü)
      const navSupport = document.getElementById('navSupport');
      if (navSupport && data && data.support && data.support.url) {
        navSupport.href = data.support.url;
        navSupport.hidden = false;
      }

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

      // Event-Banner bekommen zusätzlich einmalig das Popup –
      // unabhängig davon, ob das Banner selbst schon weggeklickt wurde
      if (level === 'event') showEventPopup(sig, b.text);

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

  // --------------------------------------------------------------------
  // Event-Popup: großer Auftritt für Event-Banner (level "event").
  // Erscheint pro Event genau einmal; danach bleibt nur das Banner oben.
  // --------------------------------------------------------------------
  const POP_KEY = 'palheim.eventpop.dismissed';

  function showEventPopup(sig, rawText) {
    try {
      if (localStorage.getItem(POP_KEY) === sig) return; // schon gesehen
    } catch { /* localStorage kann gesperrt sein */ }

    // Führendes Emoji wird zum großen Popup-Emoji; ein "Event-Wochenende:"-
    // Präfix fliegt raus, weil der Titel das schon sagt
    let text = String(rawText).trim();
    let emoji = '🎉';
    const m = text.match(/^(\p{Extended_Pictographic}️?)\s*/u);
    if (m) {
      emoji = m[1];
      text = text.slice(m[0].length);
    }
    text = text.replace(/^Event-Wochenende:\s*/i, '');

    const backdrop = document.createElement('div');
    backdrop.className = 'event-pop__backdrop';

    const pop = document.createElement('div');
    pop.className = 'event-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'eventPopTitle');

    const decoL = document.createElement('span');
    decoL.className = 'event-pop__deco event-pop__deco--l';
    decoL.textContent = '🎊';
    const decoR = document.createElement('span');
    decoR.className = 'event-pop__deco event-pop__deco--r';
    decoR.textContent = '✨';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'event-pop__close';
    closeBtn.setAttribute('aria-label', 'Schließen');
    closeBtn.textContent = '✕';

    const big = document.createElement('span');
    big.className = 'event-pop__emoji';
    big.textContent = emoji;

    const title = document.createElement('h2');
    title.className = 'event-pop__title';
    title.id = 'eventPopTitle';
    title.append('Event-');
    title.appendChild(Object.assign(document.createElement('em'),
      { textContent: 'Wochenende!' }));

    const msg = document.createElement('p');
    msg.className = 'event-pop__text';
    msg.textContent = text; // textContent: Banner-Text nie als HTML deuten

    const sub = document.createElement('p');
    sub.className = 'event-pop__sub';
    sub.textContent = 'Gilt automatisch auf Server 1 & 2';

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'event-pop__btn';
    cta.textContent = 'Alles klar – ab auf den Server! 🎮';

    pop.append(decoL, decoR, closeBtn, big, title, msg, sub, cta);
    backdrop.appendChild(pop);

    function dismiss() {
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      try { localStorage.setItem(POP_KEY, sig); } catch { /* egal */ }
    }
    function onKey(e) {
      if (e.key === 'Escape') dismiss();
    }
    closeBtn.addEventListener('click', dismiss);
    cta.addEventListener('click', dismiss);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) dismiss();
    });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(backdrop);
    cta.focus();
  }
})();
