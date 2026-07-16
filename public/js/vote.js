/* PalHeim – Vote & Belohnung
   Blendet die Vote-Sektion ein, wenn das Backend sie aktiviert hat,
   und wickelt das Abholen der Belohnung ab. */

(() => {
  'use strict';

  const section = document.getElementById('voten');
  const navLink = document.getElementById('navVote');
  if (!section) return;

  const form = document.getElementById('voteForm');
  const input = document.getElementById('voteName');
  const button = document.getElementById('voteClaim');
  const message = document.getElementById('voteMessage');
  const voteLink = document.getElementById('voteLink');

  function showMessage(text, ok) {
    message.textContent = text;
    message.classList.toggle('is-ok', ok);
    message.classList.toggle('is-error', !ok);
    message.hidden = false;
  }

  async function init() {
    try {
      const res = await fetch('/api/vote/info', { cache: 'no-store' });
      if (!res.ok) return;
      const info = await res.json();
      if (!info.enabled) return;

      if (info.voteUrl) voteLink.href = info.voteUrl;
      section.hidden = false;
      if (navLink) navLink.hidden = false;

      // Zuletzt genutzten Namen vorschlagen
      try {
        const saved = localStorage.getItem('palheim.voteName');
        if (saved) input.value = saved;
      } catch { /* localStorage kann gesperrt sein */ }
    } catch {
      /* Backend nicht erreichbar – Sektion bleibt ausgeblendet */
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name.length < 2) return;

    try {
      localStorage.setItem('palheim.voteName', name);
    } catch { /* egal */ }

    button.disabled = true;
    button.textContent = 'Wird geprüft …';
    message.hidden = true;

    try {
      const res = await fetch('/api/vote/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const result = await res.json();
      showMessage(result.message || 'Unbekannte Antwort.', Boolean(result.ok));
    } catch {
      showMessage('Server nicht erreichbar – versuch es gleich nochmal.', false);
    } finally {
      button.disabled = false;
      button.textContent = 'Belohnung abholen';
    }
  });

  init();
})();
